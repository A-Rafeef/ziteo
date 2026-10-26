import "server-only";
import {log} from "@/lib/logger";
import { AsyncLocalStorage } from "node:async_hooks";
import { createRequestClient } from "@/lib/supabase/server";
import { owner as authenticatedOwner, type SellerUser } from "./auth";
import type { DailyMetric, Product, PublicData, Store, Workspace } from "../types";
import { ApiError, available, DEFAULT_DESIGN } from "./validation";

const requestContext = new AsyncLocalStorage<Request>();
export type StoreRow = { id: string; owner_id: string; slug: string; data: Store; published: boolean; revision: number; created_at: string };
export type ProductRow = { id: string; short_id: string; store_id: string; data: Product; status: Product['status']; created_at: string; archived_at: string | null };

export async function database() { return createRequestClient(requestContext.getStore()); }
export async function owner(): Promise<SellerUser> { return authenticatedOwner(requestContext.getStore()); }

export function assertDatabase(error: { code?: string; message: string } | null): void {
  if (!error) return;
  if (error.code === "23505") throw new ApiError("That store address or record is already in use.", 409);
  if (error.code === "23514" || error.code === "P0001" || error.code === "22023") throw new ApiError(error.message, /50 active|recovery|another/.test(error.message) ? 409 : 400);
  if (error.code === "42501") throw new ApiError("You do not have access to this record.", 403);
  throw new Error(`Database request failed (${error.code ?? "unknown"}).`);
}

export function asStore(row: StoreRow): Store {
  return { ...row.data, id: row.id, slug: row.slug, published: row.published };
}
export function asProduct(row: ProductRow): Product {
  return { ...row.data, id: row.id, shortId: row.short_id, status: row.status, createdAt: row.created_at, archivedAt: row.archived_at };
}

export async function storeFor(user: SellerUser): Promise<Store> {
  const db = await database();
  const { data, error } = await db.from("stores").select("*").eq("owner_id", user.userId).maybeSingle();
  assertDatabase(error);
  if (!data) throw new ApiError("Set up your store first by opening the dashboard.", 404);
  const { data: verified, error: verificationError } = await db.rpc("is_store_phone_verified", { p_store_id: data.id });
  assertDatabase(verificationError);
  return { ...asStore(data as StoreRow), phoneVerified: verified === true };
}

export function archiveCutoff(): string { return new Date(Date.now() - 7 * 86400000).toISOString(); }
export async function productFor(storeId: string, id: string): Promise<Product> {
  const { data, error } = await (await database()).from("products").select("*").eq("store_id", storeId).eq("id", id).maybeSingle();
  assertDatabase(error);
  if (!data || (data.status === "archived" && data.archived_at <= archiveCutoff())) throw new ApiError("This product was not found, or its recovery window has expired.", 404);
  return asProduct(data as ProductRow);
}
export async function purgeArchived(storeId: string): Promise<void> {
  const { error } = await (await database()).from("products").delete().eq("store_id", storeId).eq("status", "archived").lte("archived_at", archiveCutoff());
  assertDatabase(error);
}
export async function productsFor(storeId: string): Promise<Product[]> {
  const { data, error } = await (await database()).from("products").select("*").eq("store_id", storeId).order("created_at", { ascending: false }).order("id", { ascending: false });
  assertDatabase(error);
  return (data ?? []).filter((row) => row.status !== "archived" || row.archived_at > archiveCutoff()).map((row) => asProduct(row as ProductRow));
}
export function publicProducts(store: Store, products: Product[]): Product[] {
  return products.filter((product) => product.status === "published" && (!store.hideOutOfStock || available(product)));
}
export function publicStore(store: Store): Store {
  const visible = { ...store, draftDesign: store.liveDesign };
  delete visible.phoneVerified;
  return visible;
}
export async function publicBySlug(slug: string): Promise<PublicData> {
  const { data, error } = await (await database()).from("storefronts").select("data").eq("slug", slug).maybeSingle();
  assertDatabase(error);
  if (!data) throw new ApiError("This store is currently unavailable.", 404);
  return data.data as PublicData;
}
export async function publicByProduct(shortId: string): Promise<PublicData> {
  // Snapshot contains only the current public projection. A JSON containment
  // query avoids making private product rows readable to anonymous callers.
  const { data, error } = await (await database()).from("storefronts").select("data").contains("data", { products: [{ shortId }] }).maybeSingle();
  assertDatabase(error);
  if (!data) throw new ApiError("This product is currently unavailable.", 404);
  return data.data as PublicData;
}

export async function mutateStore(user: SellerUser, change: (store: Store) => Store | Promise<Store>): Promise<Store> {
  const db = await database();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: row, error } = await db.from("stores").select("*").eq("owner_id", user.userId).maybeSingle();
    assertDatabase(error);
    if (!row) throw new ApiError("Store not found.", 404);
    const next = await change(asStore(row as StoreRow));
    const { data, error: updateError } = await db.rpc("save_store", { p_store: row.id, p_revision: row.revision, p_data: next, p_slug: next.slug, p_published: next.published });
    assertDatabase(updateError);
    if (data?.length) return storeFor(user);
  }
  throw new ApiError("Your store changed in another tab. Reload and try again.", 409);
}

export async function bootstrap(user: SellerUser): Promise<Store> {
  const db = await database();
  const { data: existing, error } = await db.from("stores").select("id").eq("owner_id", user.userId).maybeSingle();
  assertDatabase(error);
  if (existing) return storeFor(user);
  const id = crypto.randomUUID();
  const store: Store = {
    id, slug: `my-store-${id.slice(0, 8)}`, name: "My store", whatsapp: "", description: "",
    address: "", contactEmail: "", logo: "", published: false, hideOutOfStock: false,
    draftDesign: structuredClone(DEFAULT_DESIGN), liveDesign: structuredClone(DEFAULT_DESIGN), sample: false,
    designCustomized: false, publishedAt: null,
  };
  const { error: insertError } = await db.from("stores").insert({ id, owner_id: user.userId, slug: store.slug, data: store });
  // Simultaneous first-load requests resolve to the one store allowed per owner.
  if (insertError?.code !== "23505") assertDatabase(insertError);
  return storeFor(user);
}
export async function metricsFor(storeId: string): Promise<DailyMetric[]> {
  const start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await (await database()).from("daily_metrics").select("date,store_views,product_views,whatsapp_clicks").eq("store_id", storeId).gte("date", start).order("date");
  assertDatabase(error);
  const byDate = new Map((data ?? []).map((row) => [row.date, { date: row.date, storeViews: Number(row.store_views), productViews: Number(row.product_views), whatsappClicks: Number(row.whatsapp_clicks) }]));
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.now() - (29 - index) * 86400000).toISOString().slice(0, 10);
    return byDate.get(date) ?? { date, storeViews: 0, productViews: 0, whatsappClicks: 0 };
  });
}
export async function workspace(): Promise<Workspace> {
  const user = await owner();
  const store = await bootstrap(user);
  await purgeArchived(store.id);
  const [products, analytics] = await Promise.all([productsFor(store.id), metricsFor(store.id)]);
  return { user: { id: user.userId, name: user.fullName || user.displayName, email: user.email }, store, products, analytics };
}
export async function json(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") throw new ApiError("Send this request as application/json.", 415);
  if (Number(request.headers.get("content-length") ?? 0) > 200000) throw new ApiError("This request is too large.", 413);
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > 200000) throw new ApiError("This request is too large.", 413);
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new ApiError("Please provide a valid JSON request."); }
}
export function checkOrigin(request: Request): void {
  const supplied = request.headers.get("origin");
  if (!supplied) return;
  let origin: string;
  try { origin = new URL(supplied).origin; } catch { throw new ApiError("This request must come from your store workspace.", 403); }
  const expected = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin : new URL(request.url).origin;
  if (origin !== expected && origin !== new URL(request.url).origin) throw new ApiError("This request must come from your store workspace.", 403);
}
export async function route(action: () => Promise<unknown>, status = 200, request?: Request): Promise<Response> {
  const invoke = async () => {
    try {
      if (request && !["GET", "HEAD"].includes(request.method)) checkOrigin(request);
      return Response.json(await action(), { status, headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
      if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "private, no-store" } });
      log("error", "API request failed", {requestId:crypto.randomUUID(), route:request ? new URL(request.url).pathname.replace(/[a-f0-9-]{36}/g,"[id]") : "server", code:error instanceof Error ? error.name : "UnknownError"});
      return Response.json({ error: "We couldn’t complete this request. Please try again." }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
    }
  };
  return request ? requestContext.run(request, invoke) : invoke();
}

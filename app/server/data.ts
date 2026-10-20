import { env } from "cloudflare:workers";
import { getChatGPTUser, type ChatGPTUser } from "../chatgpt-auth";
import type { DailyMetric, Product, PublicData, Store, Workspace } from "../types";
import { ApiError, available, DEFAULT_DESIGN } from "./validation";

type StoreRow = { id: string; owner_id: string; slug: string; data: string; published: number; created_at: string };
type ProductRow = { id: string; short_id: string; store_id: string; data: string; status: string; created_at: string; archived_at: string | null };

export function database(): D1Database {
  if (!env.DB) throw new ApiError("The store database is not connected. Please try again shortly.", 503);
  return env.DB;
}

export function bucket(): R2Bucket {
  if (!env.BUCKET) throw new ApiError("Image storage is not connected. Please try again shortly.", 503);
  return env.BUCKET;
}

export async function owner(): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (!user) throw new ApiError("Sign in with ChatGPT to manage your store.", 401);
  return user;
}

export function asStore(row: StoreRow): Store {
  return { ...JSON.parse(row.data), id: row.id, slug: row.slug, published: Boolean(row.published) } as Store;
}

export function asProduct(row: ProductRow): Product {
  return { ...JSON.parse(row.data), id: row.id, shortId: row.short_id, status: row.status, createdAt: row.created_at, archivedAt: row.archived_at } as Product;
}

export async function storeFor(user: ChatGPTUser): Promise<Store> {
  const row = await database().prepare("SELECT * FROM stores WHERE owner_id = ?").bind(user.userId).first<StoreRow>();
  if (!row) throw new ApiError("Set up your store first by opening the dashboard.", 404);
  return asStore(row);
}

export async function productFor(storeId: string, id: string): Promise<Product> {
  const row = await database().prepare("SELECT * FROM products WHERE store_id = ? AND id = ? AND (status != 'archived' OR archived_at > ?)")
    .bind(storeId, id, archiveCutoff()).first<ProductRow>();
  if (!row) throw new ApiError("This product was not found, or its recovery window has expired.", 404);
  return asProduct(row);
}

export function archiveCutoff(): string { return new Date(Date.now() - 7 * 86400000).toISOString(); }

export async function purgeArchived(storeId: string): Promise<void> {
  await database().prepare("DELETE FROM products WHERE store_id = ? AND status = 'archived' AND archived_at <= ?").bind(storeId, archiveCutoff()).run();
}

export async function productsFor(storeId: string): Promise<Product[]> {
  const rows = await database().prepare("SELECT * FROM products WHERE store_id = ? AND (status != 'archived' OR archived_at > ?) ORDER BY created_at DESC, id DESC")
    .bind(storeId, archiveCutoff()).all<ProductRow>();
  return rows.results.map(asProduct);
}

export function publicProducts(store: Store, products: Product[]): Product[] {
  return products.filter((p) => p.status === "published" && (!store.hideOutOfStock || available(p)));
}

export function publicStore(store: Store): Store {
  // Never expose an unpublished website draft in a public response.
  return { ...store, draftDesign: store.liveDesign };
}

export async function publicBySlug(slug: string): Promise<PublicData> {
  const row = await database().prepare("SELECT * FROM stores WHERE slug = ? AND published = 1").bind(slug).first<StoreRow>();
  if (!row) throw new ApiError("This store is currently unavailable.", 404);
  const store = asStore(row);
  return { store: publicStore(store), products: publicProducts(store, await productsFor(store.id)) };
}

export async function publicByProduct(shortId: string): Promise<PublicData> {
  const row = await database().prepare("SELECT stores.* FROM stores JOIN products ON products.store_id = stores.id WHERE products.short_id = ? AND products.status = 'published' AND stores.published = 1")
    .bind(shortId).first<StoreRow>();
  if (!row) throw new ApiError("This product is currently unavailable.", 404);
  const store = asStore(row);
  const products = publicProducts(store, await productsFor(store.id));
  if (!products.some((p) => p.shortId === shortId)) throw new ApiError("This product is currently unavailable.", 404);
  return { store: publicStore(store), products };
}

export async function mutateStore(user: ChatGPTUser, change: (store: Store) => Store | Promise<Store>): Promise<Store> {
  // Compare-and-swap prevents a settings save from overwriting a simultaneous design save.
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await database().prepare("SELECT * FROM stores WHERE owner_id = ?").bind(user.userId).first<StoreRow>();
    if (!row) throw new ApiError("Store not found.", 404);
    const next = await change(asStore(row));
    try {
      const result = await database().prepare("UPDATE stores SET slug = ?, data = ?, published = ? WHERE id = ? AND owner_id = ? AND data = ?")
        .bind(next.slug, JSON.stringify(next), next.published ? 1 : 0, row.id, user.userId, row.data).run();
      if (result.meta.changes === 1) return next;
    } catch (error) {
      if (String(error).includes("UNIQUE")) throw new ApiError("That store address is already in use. Please choose another.", 409);
      throw error;
    }
  }
  throw new ApiError("Your store changed in another tab. Reload and try again.", 409);
}

function samples(): Product[] {
  const baseTime = Date.now();
  const items = [
    { name: "Everyday Canvas Backpack", price: 1299, salePrice: 999, image: "photo-1553062407-98eeb64c6a62", description: "Your carry-everywhere companion. Durable canvas, a roomy interior and thoughtful details for everyday adventures." },
    { name: "Hand-Glazed Ceramic Bowl", price: 1499, salePrice: null, image: "photo-1578749556568-bc2c40e68b61", description: "An organic silhouette with a hand-glazed finish. A beautiful home for everyday meals and little rituals." },
    { name: "The Classic White Shirt", price: 1899, salePrice: 1599, image: "photo-1598554747436-c9293d6a588f", description: "Airy, effortless and endlessly versatile. A relaxed cotton shirt designed to make getting dressed feel easy." },
    { name: "Botanical Soy Candle", price: 799, salePrice: null, image: "photo-1603006905003-be475563bc59", description: "A little ritual for slower moments. Hand-poured soy wax with soft botanical notes and a clean, even burn." },
    { name: "Everyday Stoneware Mug", price: 649, salePrice: null, image: "photo-1514228742587-6b1558fcca3d", description: "Good mornings start here. A tactile stoneware mug with a comfortable handle and hand-finished glaze." },
    { name: "Woven Market Basket", price: 2199, salePrice: 1799, image: "photo-1594224457860-23bdb45f8e3d", description: "Warm natural texture, made to go wherever the day takes you. Woven by hand, with room for the essentials." },
    { name: "Soft Cotton Throw", price: 2499, salePrice: null, image: "photo-1600210492493-0946911123ea", description: "A softer landing at the end of the day. Lightly textured cotton for your favourite chair, reading nook or sofa.", status: "draft" },
    { name: "Minimal Desk Journal", price: 599, salePrice: null, image: "photo-1517842645767-c639042777db", description: "A home for bright ideas and everyday notes. Smooth pages, a considered layout and a cover you’ll love to keep close.", stock: "out_of_stock" },
  ];
  return items.map((item, i): Product => ({
    id: crypto.randomUUID(), shortId: crypto.randomUUID().replace(/-/g, "").slice(0, 12), name: item.name, description: item.description,
    price: item.price, salePrice: item.salePrice, images: [`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=900&q=85`],
    status: item.status === "draft" ? "draft" : "published", stock: item.stock === "out_of_stock" ? "out_of_stock" : "in_stock", showDiscount: true,
    variantGroups: [], variants: [], createdAt: new Date(baseTime - i * 86400000).toISOString(), archivedAt: null, sample: true,
  }));
}

export async function bootstrap(user: ChatGPTUser): Promise<Store> {
  const existing = await database().prepare("SELECT * FROM stores WHERE owner_id = ?").bind(user.userId).first<StoreRow>();
  if (existing) return asStore(existing);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const store: Store = {
    id, slug: `everyday-edit-${id.slice(0, 8)}`, name: "The Everyday Edit", whatsapp: "", description: "Thoughtfully chosen. Beautifully everyday.",
    address: "", contactEmail: "", logo: "", published: false, hideOutOfStock: false,
    draftDesign: structuredClone(DEFAULT_DESIGN), liveDesign: structuredClone(DEFAULT_DESIGN), sample: true, designCustomized: false, publishedAt: null,
  };
  const statements = [database().prepare("INSERT OR IGNORE INTO stores (id, owner_id, slug, data, published, created_at) VALUES (?, ?, ?, ?, 0, ?)")
    .bind(id, user.userId, store.slug, JSON.stringify(store), createdAt)];
  for (const p of samples()) {
    statements.push(database().prepare("INSERT INTO products (id, short_id, store_id, data, status, created_at, archived_at) SELECT ?, ?, ?, ?, ?, ?, NULL WHERE EXISTS (SELECT 1 FROM stores WHERE id = ? AND owner_id = ?)")
      .bind(p.id, p.shortId, id, JSON.stringify(p), p.status, p.createdAt, id, user.userId));
  }
  await database().batch(statements);
  return storeFor(user);
}

export async function metricsFor(storeId: string): Promise<DailyMetric[]> {
  const start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const rows = await database().prepare("SELECT date, store_views AS storeViews, product_views AS productViews, whatsapp_clicks AS whatsappClicks FROM daily_metrics WHERE store_id = ? AND date >= ? ORDER BY date ASC")
    .bind(storeId, start).all<DailyMetric>();
  const byDate = new Map(rows.results.map((row) => [row.date, row]));
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
    return byDate.get(date) ?? { date, storeViews: 0, productViews: 0, whatsappClicks: 0 };
  });
}

export async function workspace(): Promise<Workspace> {
  const user = await owner();
  const store = await bootstrap(user);
  await purgeArchived(store.id);
  const [products, analytics] = await Promise.all([productsFor(store.id), metricsFor(store.id)]);
  return { user: { name: user.fullName || user.displayName, email: user.email }, store, products, analytics };
}

export async function json(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") throw new ApiError("Send this request as application/json.", 415);
  if (Number(request.headers.get("content-length") ?? 0) > 200000) throw new ApiError("This request is too large.", 413);
  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new ApiError("Please provide a valid JSON request."); }
}

export function checkOrigin(request: Request): void {
  const supplied = request.headers.get("origin");
  if (!supplied) return;
  let origin: string;
  try { origin = new URL(supplied).origin; } catch { throw new ApiError("This request must come from your store workspace.", 403); }
  if (origin !== new URL(request.url).origin) throw new ApiError("This request must come from your store workspace.", 403);
}

export async function route(action: () => Promise<unknown>, status = 200, request?: Request): Promise<Response> {
  try {
    if (request) checkOrigin(request);
    return Response.json(await action(), { status, headers: { "Cache-Control": "no-store" } });
  }
  catch (error) {
    if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    console.error("Ziteo API error", error);
    const message = String(error).includes("no such table") ? "The store database is being prepared. Please try again shortly." : "We couldn’t save this change. Please try again.";
    return Response.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}


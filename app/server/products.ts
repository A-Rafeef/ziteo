import type { Product } from "../types";
import { assertDatabase, database, json, owner, productFor, productsFor, purgeArchived, storeFor } from "./data";
import { ApiError, validateProduct } from "./validation";

export async function saveProduct(request: Request, suppliedId?: string) {
  const store = await storeFor(await owner());
  const body = await json(request);
  const id = suppliedId ?? (typeof body.id === "string" ? body.id : undefined);
  const previous = id ? await productFor(store.id, id) : undefined;
  if (previous?.status === "archived") throw new ApiError("Restore this product before editing it.");
  const product = validateProduct(body, store.id, previous);
  product.sample = false;
  const db = await database();
  if (previous) {
    const { data, error } = await db.from("products").update({ data: product, status: product.status }).eq("id", product.id).eq("store_id", store.id).neq("status", "archived").select("id");
    assertDatabase(error);
    if (!data?.length) throw new ApiError("This product changed in another tab. Reload and try again.", 409);
  } else {
    // Database trigger serializes every insertion/restoration on the store row.
    const { error } = await db.from("products").insert({ id: product.id, short_id: product.shortId, store_id: store.id, data: product, status: product.status });
    assertDatabase(error);
  }
  return { product: await productFor(store.id, product.id), products: await productsFor(store.id) };
}
export async function archiveProduct(id: string) {
  const store = await storeFor(await owner());
  const previous = await productFor(store.id, id);
  if (previous.status !== "archived") {
    const product: Product = { ...previous, status: "archived", archivedAt: new Date().toISOString() };
    const { error } = await (await database()).from("products").update({ status: "archived", archived_at: product.archivedAt, data: product }).eq("id", id).eq("store_id", store.id).neq("status", "archived");
    assertDatabase(error);
  }
  return { products: await productsFor(store.id) };
}
export async function restoreProduct(request: Request, id: string) {
  const store = await storeFor(await owner());
  await purgeArchived(store.id);
  const previous = await productFor(store.id, id);
  if (previous.status !== "archived") throw new ApiError("This product is already active.");
  const body = await json(request);
  if (body.status !== "draft" && body.status !== "published") throw new ApiError("Choose Draft or Published for the restored product.");
  const product = validateProduct({ ...previous, status: body.status }, store.id, previous);
  const { data, error } = await (await database()).from("products").update({ status: product.status, archived_at: null, data: product }).eq("id", id).eq("store_id", store.id).eq("status", "archived").gt("archived_at", new Date(Date.now() - 7 * 86400000).toISOString()).select("id");
  assertDatabase(error);
  if (!data?.length) throw new ApiError("Restoration is unavailable. Check the seven-day recovery window and your 50-product allowance.", 409);
  return { product: await productFor(store.id, id), products: await productsFor(store.id) };
}

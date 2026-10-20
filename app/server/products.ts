import type { Product } from "../types";
import { database, json, owner, productFor, productsFor, purgeArchived, storeFor } from "./data";
import { ApiError, validateProduct } from "./validation";

export async function saveProduct(request: Request, suppliedId?: string) {
  const user = await owner();
  const store = await storeFor(user);
  const body = await json(request);
  const id = suppliedId ?? (typeof body.id === "string" ? body.id : undefined);
  const previous = id ? await productFor(store.id, id) : undefined;
  if (previous?.status === "archived") throw new ApiError("Restore this product before editing it.");
  const product = validateProduct(body, store.id, previous);
  product.sample = false;
  if (previous) {
    const result = await database().prepare("UPDATE products SET data = ?, status = ? WHERE id = ? AND store_id = ? AND status != 'archived'")
      .bind(JSON.stringify(product), product.status, product.id, store.id).run();
    if (result.meta.changes !== 1) throw new ApiError("This product changed in another tab. Reload and try again.", 409);
  } else {
    // The slot check and insert are one SQLite statement, so concurrent requests cannot exceed 50.
    const result = await database().prepare("INSERT INTO products (id, short_id, store_id, data, status, created_at, archived_at) SELECT ?, ?, ?, ?, ?, ?, NULL WHERE (SELECT COUNT(*) FROM products WHERE store_id = ? AND status != 'archived') < 50 AND EXISTS (SELECT 1 FROM stores WHERE id = ? AND owner_id = ?)")
      .bind(product.id, product.shortId, store.id, JSON.stringify(product), product.status, product.createdAt, store.id, store.id, user.userId).run();
    if (result.meta.changes !== 1) throw new ApiError("Your free plan includes 50 active products. Archive a product to free a slot.", 409);
  }
  return { product, products: await productsFor(store.id) };
}

export async function archiveProduct(id: string) {
  const user = await owner();
  const store = await storeFor(user);
  const previous = await productFor(store.id, id);
  if (previous.status !== "archived") {
    const product: Product = { ...previous, status: "archived", archivedAt: new Date().toISOString() };
    await database().prepare("UPDATE products SET status = 'archived', archived_at = ?, data = ? WHERE id = ? AND store_id = ? AND status != 'archived'")
      .bind(product.archivedAt, JSON.stringify(product), id, store.id).run();
  }
  return { products: await productsFor(store.id) };
}

export async function restoreProduct(request: Request, id: string) {
  const user = await owner();
  const store = await storeFor(user);
  await purgeArchived(store.id);
  const previous = await productFor(store.id, id);
  if (previous.status !== "archived") throw new ApiError("This product is already active.");
  const body = await json(request);
  if (body.status !== "draft" && body.status !== "published") throw new ApiError("Choose Draft or Published for the restored product.");
  const product = validateProduct({ ...previous, status: body.status }, store.id, previous);
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
  // Restoration consumes a slot and uses the same atomic check as creation.
  const result = await database().prepare("UPDATE products SET status = ?, archived_at = NULL, data = ? WHERE id = ? AND store_id = ? AND status = 'archived' AND archived_at > ? AND (SELECT COUNT(*) FROM products WHERE store_id = ? AND status != 'archived') < 50")
    .bind(product.status, JSON.stringify(product), id, store.id, cutoff, store.id).run();
  if (result.meta.changes !== 1) throw new ApiError("Restoration is unavailable. Check the seven-day recovery window and your 50-product allowance.", 409);
  return { product, products: await productsFor(store.id) };
}

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { asStore, database, json, productFor, publicProducts, route } from "@/app/server/data";
import { ApiError, text } from "@/app/server/validation";

export async function POST(request: Request) {
  return route(async () => {
    const body = await json(request);
    const storeId = text(body.storeId, "Store identifier", 100, true);
    if (!["store_view", "product_view", "whatsapp_click"].includes(String(body.type))) throw new ApiError("Unsupported analytics event.");
    const row = await database().prepare("SELECT * FROM stores WHERE id = ? AND published = 1").bind(storeId)
      .first<{id:string;owner_id:string;slug:string;data:string;published:number;created_at:string}>();
    if (!row) throw new ApiError("This store is currently unavailable.", 404);
    const user = await getChatGPTUser();
    // Seller visits and editing previews are not customer activity.
    if (user?.userId === row.owner_id) return { recorded: false };
    const productId = body.productId === undefined ? undefined : text(body.productId, "Product identifier", 100, true);
    if (body.type === "product_view" && !productId) throw new ApiError("A product view needs a product identifier.");
    if (productId) {
      const product = await productFor(storeId, productId);
      if (!publicProducts(asStore(row), [product]).length) throw new ApiError("This product is currently unavailable.", 404);
    }
    const storeViews = body.type === "store_view" ? 1 : 0;
    const productViews = body.type === "product_view" ? 1 : 0;
    const whatsappClicks = body.type === "whatsapp_click" ? 1 : 0;
    const date = new Date().toISOString().slice(0, 10);
    await database().prepare("INSERT INTO daily_metrics (store_id, date, store_views, product_views, whatsapp_clicks) VALUES (?, ?, ?, ?, ?) ON CONFLICT(store_id, date) DO UPDATE SET store_views = store_views + excluded.store_views, product_views = product_views + excluded.product_views, whatsapp_clicks = whatsapp_clicks + excluded.whatsapp_clicks")
      .bind(storeId, date, storeViews, productViews, whatsappClicks).run();
    return { recorded: true };
  }, 200, request);
}

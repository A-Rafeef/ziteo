import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/app/server/auth";
import { assertDatabase, json, route } from "@/app/server/data";
import { ApiError } from "@/app/server/validation";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request: Request) {
  return route(async () => {
    const body = await json(request);
    if (typeof body.storeId !== "string" || !uuid.test(body.storeId)) throw new ApiError("Invalid store identifier.");
    if (!["store_view", "product_view", "whatsapp_click"].includes(String(body.type))) throw new ApiError("Unsupported analytics event.");
    if (body.productId !== undefined && (typeof body.productId !== "string" || !uuid.test(body.productId))) throw new ApiError("Invalid product identifier.");
    if (body.type === "product_view" && !body.productId) throw new ApiError("A product view needs a product identifier.");
    const user = await getCurrentUser(request);
    const { data, error } = await createAdminClient().rpc("record_store_event", { p_store: body.storeId, p_type: body.type, p_product: body.productId ?? null, p_owner: user?.userId ?? null });
    assertDatabase(error);
    return { recorded: data === true };
  }, 200, request);
}

import { json, mutateStore, owner, productsFor, publicProducts, route } from "@/app/server/data";
import { ApiError, normalizeWhatsApp } from "@/app/server/validation";
export async function POST(request: Request) {
  return route(async () => {
    const user = await owner();
    const body = await json(request);
    if (typeof body.published !== "boolean") throw new ApiError("Choose whether to publish or unpublish the store.");
    const store = await mutateStore(user, async (current) => {
      if (!body.published) return { ...current, published: false };
      if (!normalizeWhatsApp(current.whatsapp)) throw new ApiError("Add your WhatsApp number in Settings before publishing.");
      if (!publicProducts(current, await productsFor(current.id)).length) throw new ApiError("Publish at least one complete, visible product before publishing your store.");
      return { ...current, published: true, publishedAt: current.publishedAt || new Date().toISOString(), liveDesign: structuredClone(current.draftDesign) };
    });
    return { store };
  }, 200, request);
}

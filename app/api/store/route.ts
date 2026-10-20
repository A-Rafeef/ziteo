import { json, mutateStore, owner, route } from "@/app/server/data";
import { ApiError, boolean, imageUrl, normalizeWhatsApp, text, validateSlug } from "@/app/server/validation";

export async function POST(request: Request) {
  return route(async () => {
    const user = await owner();
    const body = await json(request);
    const store = await mutateStore(user, (current) => {
      const slug = body.slug === undefined ? current.slug : validateSlug(body.slug);
      if (slug !== current.slug && current.publishedAt) throw new ApiError("Contact support to change an address after the store has been published.", 409);
      const whatsapp = body.whatsapp === undefined ? current.whatsapp : normalizeWhatsApp(body.whatsapp);
      if (current.published && !whatsapp) throw new ApiError("A published store needs a valid WhatsApp number. Unpublish it before removing the number.");
      const contactEmail = body.contactEmail === undefined ? current.contactEmail : text(body.contactEmail, "Contact email", 254);
      if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) throw new ApiError("Enter a valid contact email address.");
      return {
        ...current, slug, whatsapp, contactEmail, sample: false,
        name: body.name === undefined ? current.name : text(body.name, "Store name", 120, true),
        description: body.description === undefined ? current.description : text(body.description, "Store description", 2000),
        address: body.address === undefined ? current.address : text(body.address, "Address", 1000),
        logo: body.logo === undefined ? current.logo : (body.logo ? imageUrl(body.logo, current.id) : ""),
        hideOutOfStock: boolean(body.hideOutOfStock, current.hideOutOfStock),
      };
    });
    return { store };
  }, 200, request);
}

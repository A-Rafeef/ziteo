import { getChatGPTUser } from "@/app/chatgpt-auth";
import { asStore, bucket, database, productsFor, publicProducts } from "@/app/server/data";
export async function GET(_request: Request, context: {params:Promise<{key:string[]}>}) {
  const { key } = await context.params;
  if (key.length !== 2 || !/^[a-f0-9-]{36}$/.test(key[0]) || !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key[1])) return new Response("Image not found", { status: 404 });
  try {
    const row = await database().prepare("SELECT * FROM stores WHERE id = ?").bind(key[0])
      .first<{id:string;owner_id:string;slug:string;data:string;published:number;created_at:string}>();
    if (!row) return new Response("Image not found", { status: 404 });
    const user = await getChatGPTUser();
    const isOwner = user?.userId === row.owner_id;
    if (!isOwner) {
      if (!row.published) return new Response("Image not found", { status: 404 });
      const store = asStore(row);
      const url = `/api/images/${key.join("/")}`;
      const isPublic = store.logo === url || store.liveDesign.heroImage === url || publicProducts(store, await productsFor(store.id)).some((p) => p.images.includes(url));
      if (!isPublic) return new Response("Image not found", { status: 404 });
    }
    const object = await bucket().get(key.join("/"));
    if (!object) return new Response("Image not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    // Draft files must never be cached publicly; public references are rechecked after unpublish.
    headers.set("Cache-Control", isOwner ? "private, no-store" : "public, max-age=0, must-revalidate");
    headers.set("Vary", "Cookie");
    headers.set("etag", object.httpEtag);
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(object.body, { headers });
  } catch { return new Response("Image unavailable", { status: 503 }); }
}

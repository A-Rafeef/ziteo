import { owner, productsFor, route, storeFor } from "@/app/server/data";
export async function GET() {
  return route(async () => {
    const store = await storeFor(await owner());
    return { store: { ...store, liveDesign: store.draftDesign }, products: (await productsFor(store.id)).filter((p) => p.status !== "archived"), preview: true };
  });
}

import { publicByProduct, route } from "@/app/server/data";
export async function GET(_request: Request, context: {params:Promise<{shortId:string}>}) {
  const { shortId } = await context.params;
  return route(() => publicByProduct(shortId));
}

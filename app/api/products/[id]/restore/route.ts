import { route } from "@/app/server/data";
import { restoreProduct } from "@/app/server/products";
export async function POST(request: Request, context: {params:Promise<{id:string}>}) {
  const { id } = await context.params;
  return route(() => restoreProduct(request, id), 200, request);
}

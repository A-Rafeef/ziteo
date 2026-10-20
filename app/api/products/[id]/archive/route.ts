import { route } from "@/app/server/data";
import { archiveProduct } from "@/app/server/products";
export async function POST(request: Request, context: {params:Promise<{id:string}>}) {
  const { id } = await context.params;
  return route(() => archiveProduct(id), 200, request);
}

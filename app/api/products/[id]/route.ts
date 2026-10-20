import { route } from "@/app/server/data";
import { saveProduct } from "@/app/server/products";
export async function POST(request: Request, context: { params: Promise<{id:string}> }) {
  const { id } = await context.params;
  return route(() => saveProduct(request, id), 200, request);
}

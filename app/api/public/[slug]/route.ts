import { publicBySlug, route } from "@/app/server/data";
export async function GET(_request: Request, context: {params:Promise<{slug:string}>}) {
  const { slug } = await context.params;
  return route(() => publicBySlug(slug));
}

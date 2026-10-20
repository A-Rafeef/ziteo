import { route } from "@/app/server/data";
import { saveProduct } from "@/app/server/products";
export async function POST(request: Request) { return route(() => saveProduct(request), 200, request); }

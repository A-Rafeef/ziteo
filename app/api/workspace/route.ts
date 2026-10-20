import { route, workspace } from "@/app/server/data";
export async function GET() { return route(workspace); }

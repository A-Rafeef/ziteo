import { route, workspace } from "@/app/server/data";
export async function GET(request: Request) { return route(workspace, 200, request); }

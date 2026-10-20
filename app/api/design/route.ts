import { json, mutateStore, owner, route } from "@/app/server/data";
import { validateDesign } from "@/app/server/validation";
export async function POST(request: Request) {
  return route(async () => {
    const user = await owner();
    const body = await json(request);
    const store = await mutateStore(user, (current) => ({ ...current, designCustomized: true, draftDesign: validateDesign(body.design ?? body, current.id) }));
    return { store };
  }, 200, request);
}

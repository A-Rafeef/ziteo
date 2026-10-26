import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appOrigin, sameOrigin } from "@/lib/supabase/redirects";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Please submit from Ziteo." }, { status: 403 });
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(`${appOrigin()}/login`, { status: 303, headers: { "Cache-Control": "private, no-store" } });
}

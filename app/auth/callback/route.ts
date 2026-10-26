import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appOrigin, safeNext } from "@/lib/supabase/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (isSupabaseConfigured() && code && code.length < 4096) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = url.searchParams.get("next") === "/auth/reset" ? "/auth/reset" : safeNext(url.searchParams.get("next"));
      return NextResponse.redirect(`${appOrigin()}${next}`, { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
    }
  }
  return NextResponse.redirect(`${appOrigin()}/login?error=invalid_link`, { headers: { "Cache-Control": "private, no-store" } });
}

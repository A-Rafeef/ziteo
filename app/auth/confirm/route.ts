import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appOrigin } from "@/lib/supabase/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Supabase email templates can link to this token-hash flow, including on a different device.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token_hash = params.get("token_hash");
  const type = params.get("type");
  if (isSupabaseConfigured() && token_hash && token_hash.length < 4096 && (type === "signup" || type === "email" || type === "recovery")) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return NextResponse.redirect(`${appOrigin()}${type === "recovery" ? "/auth/reset" : "/"}`, { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  }
  return NextResponse.redirect(`${appOrigin()}/login?error=invalid_link`, { headers: { "Cache-Control": "private, no-store" } });
}

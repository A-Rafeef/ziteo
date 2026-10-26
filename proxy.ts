import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, publicSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  if (!isSupabaseConfigured() || request.headers.has("authorization")) return response;
  const { url, key } = publicSupabaseConfig();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        response.headers.set("Cache-Control", "private, no-store");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
      },
    },
  });
  // Validates the token, refreshing it when needed. Never trust getSession().user.
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/", "/login", "/auth/:path*", "/preview", "/editor-preview", "/api/:path*"],
};

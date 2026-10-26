import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { publicSupabaseConfig } from "./config";

export async function createClient() {
  const { url, key } = publicSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components refresh through proxy.ts. Route Handlers can set cookies. */ }
      },
    },
  });
}

export async function createRequestClient(request?: Request) {
  const requestHeaders = request?.headers ?? await headers();
  const authorization = requestHeaders.get("authorization");
  if (authorization) {
    if (!/^Bearer [A-Za-z0-9._~-]+$/i.test(authorization)) throw new Error("Invalid Authorization header.");
    const { url, key } = publicSupabaseConfig();
    // A native token takes precedence over cookies; an invalid token never falls back to another user.
    return createSupabaseClient(url, key, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return createClient();
}

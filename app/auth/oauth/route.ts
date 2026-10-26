import { createClient } from "@/lib/supabase/server";
import { appOrigin, sameOrigin } from "@/lib/supabase/redirects";
import { isAuthConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Please submit from Ziteo." }, { status: 403 });
  if (!isAuthConfigured()) return Response.json({ error: "Sign-in is being configured." }, { status: 503 });
  const client = await createClient();
  const { data, error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${appOrigin()}/auth/callback`, skipBrowserRedirect: true } });
  if (error || !data.url) return Response.json({ error: "Google sign-in is unavailable. Please try email and password." }, { status: 400 });
  return Response.json({ url: data.url }, { headers: { "Cache-Control": "private, no-store" } });
}

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { appOrigin, sameOrigin } from "@/lib/supabase/redirects";
import { isAuthConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
const payload = z.object({
  mode: z.enum(["signin", "signup", "reset", "update"]),
  email: z.string().email().max(254).optional(),
  password: z.string().max(128).optional(),
  captchaToken: z.string().max(4096).optional(),
});
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Please submit from Ziteo." }, 403);
  if (!isAuthConfigured()) return reply({ error: "Sign-in is being configured. Please try again later." }, 503);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Send a JSON request." }, 415);
  const text = await request.text();
  if (text.length > 12_000) return reply({ error: "Request too large." }, 413);
  let parsed;
  try { parsed = payload.safeParse(JSON.parse(text)); }
  catch { return reply({ error: "Please provide a valid request." }, 400); }
  if (!parsed.success) return reply({ error: "Enter a valid email and password." }, 400);
  const { mode, email, password, captchaToken } = parsed.data;
  if (mode !== "update" && !email) return reply({ error: "Enter your email address." }, 400);
  if (mode !== "reset" && (!password || password.length < (mode === "signin" ? 1 : 12))) {
    return reply({ error: mode === "signin" ? "Enter your password." : "Use a password with at least 12 characters." }, 400);
  }
  if (mode !== "update" && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken) return reply({ error: "Complete the security check and try again." }, 400);
  const supabase = await createClient();
  // Supabase verifies CAPTCHA. A separate Siteverify call would consume the token twice.
  if (mode === "signin") {
    const { error } = await supabase.auth.signInWithPassword({ email: email!, password: password!, options: { captchaToken } });
    return error ? reply({ error: "Unable to sign in. Check your details and confirm your email, then try again." }, 400) : reply({ redirectTo: "/" });
  }
  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({ email: email!, password: password!, options: { captchaToken, emailRedirectTo: `${appOrigin()}/auth/callback` } });
    return error ? reply({ error: "Unable to create the account. Please try again or sign in." }, 400) : reply({ message: "Check your inbox to confirm your email, then sign in." });
  }
  if (mode === "reset") {
    const { error } = await supabase.auth.resetPasswordForEmail(email!, { captchaToken, redirectTo: `${appOrigin()}/auth/callback?next=/auth/reset` });
    return error ? reply({ error: "Unable to send a reset link. Complete the security check and try again." }, 400) : reply({ message: "If an account exists for that email, a reset link is on its way." });
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return reply({ error: "Open a fresh password reset link from your email." }, 401);
  const { error } = await supabase.auth.updateUser({ password: password! });
  return error ? reply({ error: "Unable to change your password. Please request a fresh reset link." }, 400) : reply({ redirectTo: "/", message: "Your password has been updated." });
}

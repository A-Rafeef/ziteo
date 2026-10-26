export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function publicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url, key };
}

export function isAuthConfigured(): boolean {
  return isSupabaseConfigured() && (process.env.NODE_ENV !== "production" || Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY));
}

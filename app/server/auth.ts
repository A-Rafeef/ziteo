import "server-only";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createRequestClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/supabase/redirects";
import { ApiError } from "./validation";

export type SellerUser = { userId: string; email: string; fullName: string | null; displayName: string };

export async function getCurrentUser(request?: Request): Promise<SellerUser | null> {
  if (!isSupabaseConfigured()) return null;
  const requestHeaders = request?.headers ?? await headers();
  const authorization = requestHeaders.get("authorization");
  if (authorization && !/^Bearer [A-Za-z0-9._~-]+$/i.test(authorization)) return null;
  const client = await createRequestClient(request);
  const token = (requestHeaders.get("authorization") ?? "").replace(/^Bearer /i, "");
  const { data: { user }, error } = token ? await client.auth.getUser(token) : await client.auth.getUser();
  if (error || !user || user.is_anonymous || !user.email) return null;
  // Metadata is display-only. Ownership always uses the verified user ID.
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  return { userId: user.id, email: user.email, fullName, displayName: fullName || user.email };
}

export async function owner(request?: Request): Promise<SellerUser> {
  const user = await getCurrentUser(request);
  if (!user) throw new ApiError("Sign in to manage your store.", 401);
  return user;
}

export async function requireUser(returnTo = "/"): Promise<SellerUser> {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(`/login?next=${encodeURIComponent(safeNext(returnTo))}`);
}

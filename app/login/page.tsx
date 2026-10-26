import { redirect } from "next/navigation";
import AuthForm from "./AuthForm";
import { getCurrentUser } from "@/app/server/auth";
import { isAuthConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/supabase/redirects";
import "./auth.css";

export const dynamic = "force-dynamic";
export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser()) redirect(next);
  return <main className="auth-page"><div className="auth-wrap">{params.error && <p className="auth-error" role="alert">That sign-in link is invalid or has expired. Please sign in or request a fresh reset link.</p>}<AuthForm available={isAuthConfigured()} next={next}/></div></main>;
}

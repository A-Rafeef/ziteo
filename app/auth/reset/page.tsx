import Link from "next/link";
import AuthForm from "@/app/login/AuthForm";
import { getCurrentUser } from "@/app/server/auth";
import "@/app/login/auth.css";

export const dynamic = "force-dynamic";
export default async function ResetPassword() {
  const user = await getCurrentUser();
  return <main className="auth-page"><div className="auth-wrap">{user ? <AuthForm available update/> : <section className="auth-card"><h1>Open your reset link.</h1><p className="auth-intro">Use the password reset link from your email, or request a new one.</p><Link className="btn primary" href="/login">Back to sign in</Link></section>}</div></main>;
}

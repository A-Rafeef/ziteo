'use client';
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "signin" | "signup" | "reset" | "update";

export default function AuthForm({ available, next = "/", update = false }: { available: boolean; next?: string; update?: boolean }) {
  const [mode, setMode] = useState<Mode>(update ? "update" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [captchaKey, setCaptchaKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  const changeMode = (value: Mode) => {
    setMode(value); setError(""); setMessage(""); setPassword(""); setCaptchaToken(undefined); setCaptchaKey(value => value + 1);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      const response = await fetch("/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, email: mode === "update" ? undefined : email, password: mode === "reset" ? undefined : password, captchaToken }) });
      const result = await response.json() as { error?: string; message?: string; redirectTo?: string };
      if (!response.ok) throw new Error(result.error || "Please try again.");
      if (result.redirectTo) window.location.assign(mode === "signin" ? next : result.redirectTo);
      else { setMessage(result.message || "Check your email for the next step."); setPassword(""); }
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to connect. Please try again."); }
    finally { setBusy(false); setCaptchaToken(undefined); setCaptchaKey(value => value + 1); }
  };
  const google = async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/auth/oauth", { method: "POST" });
      const result = await response.json() as { error?: string; url?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Google sign-in is unavailable.");
      window.location.assign(result.url);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to connect."); setBusy(false); }
  };
  const title = { signin: "Welcome back.", signup: "Make room for your business.", reset: "Let’s get you back in.", update: "Choose a new password." }[mode];
  const submitText = { signin: "Sign in", signup: "Create account", reset: "Send reset link", update: "Save password" }[mode];

  return <section className="auth-card" aria-labelledby="auth-title">
    <Link className="auth-brand" href="/login">ziteo<span>.</span></Link>
    <p className="auth-eyebrow">YOUR BUSINESS, BEAUTIFULLY ONLINE</p>
    <h1 id="auth-title">{title}</h1>
    <p className="auth-intro">{mode === "reset" ? "Enter your email and we’ll send a secure password reset link." : mode === "update" ? "Use at least 12 characters. You can paste a password from your password manager." : "A little space to build something of your own."}</p>
    {!available && <p className="auth-notice" role="status">Sign-in is being configured. Please try again later.</p>}
    {error && <div className="auth-error" role="alert" tabIndex={-1} ref={errorRef}>{error}</div>}
    {message && <p className="auth-message" role="status">{message}</p>}
    {(mode === "signin" || mode === "signup") && <>
      <Button className="btn secondary auth-google" type="button" disabled={busy || !available} onClick={google}><span aria-hidden="true">G</span>Continue with Google</Button>
      <div className="auth-divider"><span>or continue with email</span></div>
    </>}
    <form onSubmit={submit} className="auth-form">
      {mode !== "update" && <label className="field" htmlFor="auth-email">Email address<Input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={busy || !available} /></label>}
      {mode !== "reset" && <label className="field" htmlFor="auth-password">{mode === "update" ? "New password" : "Password"}<Input id="auth-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={mode === "signin" ? 1 : 12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} disabled={busy || !available} aria-describedby={mode === "signup" ? "password-help" : undefined}/>{mode === "signup" && <small id="password-help">Use at least 12 characters. Password managers and paste are welcome.</small>}</label>}
      {mode !== "update" && siteKey && available && <div className="auth-captcha"><Turnstile key={captchaKey} siteKey={siteKey} onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} onError={() => { setCaptchaToken(undefined); setError("The security check couldn’t load. Please refresh and try again."); }} options={{ theme: "light" }}/></div>}
      <Button className="btn primary auth-submit" type="submit" disabled={busy || !available || (mode !== "update" && Boolean(siteKey) && !captchaToken)}>{busy ? <Loader2 className="spin" size={17} aria-hidden="true"/> : null}{busy ? "Please wait…" : submitText}{!busy && <ArrowRight size={17} aria-hidden="true"/>}</Button>
    </form>
    <div className="auth-links">
      {mode === "signin" ? <><button type="button" onClick={() => changeMode("reset")}>Forgot password?</button><p>New to Ziteo? <button type="button" onClick={() => changeMode("signup")}>Create an account</button></p></> : !update ? <button type="button" onClick={() => changeMode("signin")}>Back to sign in</button> : <Link href="/login">Back to sign in</Link>}
    </div>
    <p className="auth-footer">By continuing, you agree to our <Link href="/terms">terms</Link>. Read our <Link href="/privacy">privacy information</Link>.</p>
  </section>;
}

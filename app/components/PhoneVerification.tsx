'use client';
import { useState, type FormEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { api } from "@/app/types";
import "./verification.css";

export default function PhoneVerification({ phone, onVerified }: { phone: string; onVerified: () => Promise<unknown> }) {
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [captchaKey, setCaptchaKey] = useState(0);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const requestCode = async () => {
    setBusy(true); setError("");
    try {
      const result = await api<{ challengeId: string }>("v1/verification/send", { channel: "sms", captchaToken });
      setChallengeId(result.challengeId); setCode("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to send a code."); }
    finally { setBusy(false); setCaptchaToken(undefined); setCaptchaKey(value => value + 1); }
  };
  const confirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("v1/verification/confirm", { challengeId, code }); await onVerified(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to confirm this code."); }
    finally { setBusy(false); }
  };
  return <section className="verification-panel ph-no-capture" aria-labelledby="verification-title">
    <h3 id="verification-title"><ShieldCheck size={17} aria-hidden="true"/>Verify your contact number</h3>
    <p className="small">Before your first publish, confirm {phone}. We’ll send an SMS code. Your usual sign-in stays Google or email and password.</p>
    {error && <p role="alert">{error}</p>}
    {siteKey ? <Turnstile key={captchaKey} siteKey={siteKey} onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} options={{ action: "phone-verification", theme: "light" }}/> : <p className="small">Verification is being configured. Please try again later.</p>}
    {!challengeId ? <button className="btn secondary" type="button" onClick={requestCode} disabled={busy || !captchaToken}>{busy && <Loader2 className="spin" size={15} aria-hidden="true"/>}Send verification code</button> : <form onSubmit={confirm}><label className="field" htmlFor="publish-verification-code">Verification code<input id="publish-verification-code" name="one-time-code" autoComplete="one-time-code" inputMode="numeric" required pattern="[0-9]{4,6}" minLength={4} maxLength={6} value={code} onChange={event => setCode(event.target.value)} disabled={busy}/></label><button className="btn primary" type="submit" disabled={busy}>{busy && <Loader2 className="spin" size={15} aria-hidden="true"/>}Confirm number</button><button className="text-link" type="button" onClick={requestCode} disabled={busy || !captchaToken}>Send a new code</button></form>}
  </section>;
}

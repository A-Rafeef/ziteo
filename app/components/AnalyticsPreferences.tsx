'use client';
import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { captureProductEvent, identifySeller, setAnalyticsConsent, startReplay } from "@/lib/analytics";

const consentKey = "ziteo-analytics-consent";
const consentEvent = "ziteo-analytics-consent-changed";
const getConsent = () => { try { return localStorage.getItem(consentKey) === "allowed"; } catch { return false; } };
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener(consentEvent, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(consentEvent, listener); };
};

export function SellerAnalytics({ sellerId }: { sellerId?: string }) {
  const allowed = useSyncExternalStore(subscribe, getConsent, () => false);
  useEffect(() => {
    setAnalyticsConsent(allowed);
    if (allowed) { if (sellerId) identifySeller(sellerId); startReplay(); captureProductEvent("workspace_opened"); }
  }, [allowed, sellerId]);
  return null;
}

export default function AnalyticsPreferences({ sellerId }: { sellerId?: string }) {
  const allowed = useSyncExternalStore(subscribe, getConsent, () => false);
  const update = (value: boolean) => {
    localStorage.setItem(consentKey, value ? "allowed" : "denied");
    window.dispatchEvent(new Event(consentEvent));
    setAnalyticsConsent(value);
    if (value) { if (sellerId) identifySeller(sellerId); startReplay(); }
  };
  return <div className="panel account-panel"><h2>Help improve Ziteo</h2><label className="preference-row"><span><strong>Share product usage</strong><small>Optional usage analytics and privacy-masked session recordings, when enabled for this environment. Your store’s visitor totals work independently.</small></span><input className="toggle" type="checkbox" checked={allowed} onChange={event => update(event.target.checked)} aria-label="Share optional product usage analytics"/></label><Link className="text-link" href="/privacy">Privacy information</Link></div>;
}

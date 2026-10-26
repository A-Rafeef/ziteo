'use client';
import posthog from 'posthog-js';
export function setAnalyticsConsent(allowed: boolean) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  if (allowed) posthog.opt_in_capturing();
  else {posthog.stopSessionRecording(); posthog.opt_out_capturing(); posthog.reset();}
}
export function identifySeller(id: string) {
  if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && posthog.has_opted_in_capturing()) posthog.identify(id);
}
export function resetAnalyticsIdentity() {
  if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) posthog.reset();
}
export function captureProductEvent(event: 'workspace_opened' | 'workspace_page_viewed', page?: string) {
  if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && posthog.has_opted_in_capturing()) posthog.capture(event, page ? { page } : undefined);
}
export function featureEnabled(name: string): boolean {
  return !!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && posthog.has_opted_in_capturing() && posthog.isFeatureEnabled(name) === true;
}
export function startReplay() {
  if (process.env.NEXT_PUBLIC_POSTHOG_REPLAY_ENABLED === 'true' && posthog.has_opted_in_capturing()) posthog.startSessionRecording();
}

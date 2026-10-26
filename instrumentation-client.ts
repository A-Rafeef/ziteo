import posthog from 'posthog-js';

if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2026-08-30',
    autocapture: false, capture_pageview: false, capture_pageleave: false,
    person_profiles: 'identified_only', persistence: 'localStorage+cookie',
    opt_out_capturing_by_default: true,
    disable_session_recording: true,
    session_recording: { maskAllInputs: true, maskTextSelector: '*', blockSelector: '[data-private], .auth-card, .settings-form, .publish-modal' },
  });
}

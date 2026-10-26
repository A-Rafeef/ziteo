# Ziteo production decisions

The owner selected this baseline on 26 October 2026. Preserve it unless they change the decision.

- Next.js App Router, strict TypeScript, Tailwind CSS, existing shadcn/ui; Vercel.
- Supabase Postgres, Auth, RLS, transactional functions. Google plus email/password login. Never authorize through user_metadata or an unverified session.
- R2 private originals, validated images and Postgres metadata. Cloudflare Images only for explicitly public assets. Keep drafts private.
- Turnstile for abuse protection. Resend for app email and Supabase SMTP. 2Factor once near first publish, tied to current phone; never OTP every login.
- PostHog for opt-in product analytics, masked replay and flags. Seller business metrics stay in Postgres. Better Stack logs/uptime.
- Cashfree Premium. Server owns plan/price. Signed, durable, idempotent webhooks; validated paid CHARGE grants entitlement.
- /api/v1 supports cookies for web and verified Supabase bearer tokens for future Expo/React Native. Share services.
- GitHub Actions runs lint, TypeScript, Vitest, business tests, Playwright and database/RLS tests. Migrations separate from builds.
- No Redis, Algolia, Kafka, microservices or another auth system without measured need.
- Never commit secrets, .env.local, local runtime files or real customer fixtures. Maintain env templates.

Read docs/PRODUCTION-SETUP.md for activation and rollout status. Old Sites/D1 files are history, not current deployment instructions.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

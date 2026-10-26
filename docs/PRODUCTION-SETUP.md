# Production setup and rollout

Prepared 26 October 2026. This is a deployable code baseline with explicit activation gates; it is not a claim that all providers are live.

## Current state

- Inspected GitHub repository A-Rafeef/ziteo at 97ef69a and the saved design-only project. Preserved existing seller/editor/storefront behavior while replacing the runtime and data/auth layer.
- Created Supabase project `ziteo-production` (`jbfkvhczortyqftmtonc`) in organization `rafi`, Mumbai (`ap-south-1`), with the owner's organization selection. No paid upgrade was requested.
- Local `.env.local` contains only the real Supabase URL/publishable key and local defaults; private provider keys remain absent.
- The migration, test outcomes and GitHub review URL are recorded in the final delivery notes. Do not assume that an SQL source file alone means it has been applied remotely.
- Vercel, Cloudflare, Resend, 2Factor, PostHog, Better Stack and Cashfree still need account access/activation for any account that does not yet exist. No customer charges, SMS or outbound customer emails were sent during this work.

## Phase 1 — source and database

Review the production-baseline branch through a pull request. CI uses a lockfile and checks TypeScript, lint, unit/business rules, browser flows, and database access rules. Use required checks and reviews on main. GitHub branch protection and environment required reviewers must be enabled by the repository administrator; workflow files alone cannot enforce repository settings.

Apply `supabase/migrations/*_production_baseline.sql` only to an empty, intended Ziteo database. All exposed tables have RLS and explicit grants. Private store/product data is visible only to its owner. Anonymous callers read a maintained public snapshot containing live designs and visible published products. Phone verification, subscription state and webhook/refund ledgers cannot be forged through client writes.

The database owns product limits, seven-day archive restore windows, optimistic store revisions, validated product/design JSON, verified-phone publication, and immutable ownership. Phone changes invalidate verification and unpublish until reverified. Normal APIs use the seller's identity and RLS. Supabase service credentials are confined to provider verification/billing operations.

Use transactional SQL/RPC functions for server-side invariants; no separate general backend service is required. This baseline does not add Redis, an external search engine, Kafka or microservices. Postgres full-text search is indexed; the existing catalog UI can continue filtering small catalogs.

## Phase 2 — identity, bot protection and email

Follow [auth-setup.md](auth-setup.md). Required live settings include Google OAuth credentials/provider enabled, exact Site URL and allowed redirects, confirmed email/password auth, 12-character password policy, and Turnstile CAPTCHA enabled in Supabase.

Create a Turnstile widget for exact application hostnames. Store the public site key in the app. Save the secret in Supabase's CAPTCHA setting and the application's server environment (for phone-verification challenges). Supabase consumes auth tokens; the app consumes phone-verification tokens with action `phone-verification`. They must be separate challenge tokens.

Verify a sender domain in Resend and publish its DNS records. Configure Supabase custom SMTP using Resend, as well as the server email adapter. Send a staging confirmation and password reset and confirm delivery, expiry and recovery behavior. Merely adding RESEND_API_KEY to Vercel does not change Supabase's SMTP provider.

## Phase 3 — images and phone verification

Create a private R2 bucket and a bucket-scoped read/write token. Disable public r2.dev/custom-domain access to the originals. Add the R2 credentials to the server environment. Uploads go through the authenticated Next API, are limited to 3 MB (below Vercel's body limit), and are checked by content signature. Metadata is stored with store ownership in Postgres. A metadata failure attempts object cleanup; schedule periodic orphan review before scale.

Image reads authorize owner access or check current public snapshot references before fetching R2. Responses are private/no-store so unpublishing does not leave publicly cached draft access through this API. Object keys alone are not authorization.

Cloudflare Images is optional at activation: enable transformations and allowlist a separately public source origin. Set NEXT_PUBLIC_CLOUDFLARE_IMAGES_ORIGIN and NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN. The URL helper only transforms that exact HTTPS origin; private API images retain authorization. Do not expose the private bucket just to turn on optimization. A public-copy/cache invalidation workflow can be added when media traffic justifies it.

Fund/activate 2Factor SMS, approve the sender/template as required, and configure TWOFACTOR_API_KEY and optional TWOFACTOR_SMS_TEMPLATE. Verify the saved store number once near publication. PostgreSQL imposes five-minute expiry, five attempts, a sixty-second resend delay and hourly send cap. WhatsApp delivery remains unavailable until the provider's approved template and complete account-specific send/verify contract are supplied. No OTP is required at ordinary login.

## Phase 4 — analytics, logs and billing

Create the PostHog project and set its browser project token/ingestion host. Seller preferences provide analytics opt-in. Replay is additionally disabled until NEXT_PUBLIC_POSTHOG_REPLAY_ENABLED=true; all inputs and text are masked and private forms blocked. Explicit events use stable Supabase UUIDs, with identity reset on sign-out. Verify recorded payloads/replays before enabling broadly. Feature flags are not payment authorization. Store/product views and WhatsApp clicks remain in Postgres.

Create a Better Stack logs source and provide its exact source-specific ingestion host and source token. The logger emits a small allowlist of request context, without bodies/credentials/contact details. Create independent uptime checks for /api/health (process) and /api/health/ready (Supabase reachability). Configure and test the owner's alert destination; no monitoring service is live until an actual monitor/source exists.

Cashfree requires merchant/subscription activation and an approved periodic Premium plan. Supply approved price/cadence rather than guessing them. Use sandbox first. The server reserves subscription requests durably before provider calls and uses stable idempotency keys. The signed webhook writes an idempotent ledger in one transaction, handles reordered charges/refunds, and isolates sandbox from production. Mandate authorization does not grant Premium.

Paid feature enforcement must query current production paid periods on the server. The baseline provides status/entitlement plumbing; no arbitrary paid feature limits or public selling price were invented. Hosted checkout, cancellation/refund policy, missed-webhook reconciliation and all live payment lifecycle checks must be verified before selling Premium. See [integrations.md](integrations.md).

## Phase 5 — staged deployment and production cutover

Connect the GitHub repository to Vercel and use the standard Next.js framework with Node 22. vercel.json places functions in Mumbai near Supabase. Use an appropriate commercial plan before commercial launch. Supply distinct preview/staging and production secrets. Do not point untrusted fork previews at production private credentials.

Choose the actual app domain and set NEXT_PUBLIC_APP_URL to its exact HTTPS origin. Configure DNS/TLS in Cloudflare/Vercel and update Supabase redirects, Google callback, Turnstile domains and Cashfree return/webhook URLs. Cloudflare DNS/R2 use does not require adding a second proxy in front of Vercel.

Run `npm run env:check -- --production` in the deployment environment. It reports variable names only. Then execute a staging user journey: sign up, confirm, sign in with each method, create products/design, upload/read images, verify phone, publish, check anonymous storefront, unpublish, reset password and sign out. Test two real sellers and a native bearer-token client.

Run Cashfree sandbox authorization/paid renewal/failure/cancel/refund plus duplicate/reordered delivery. A browser return page is never payment proof. Confirm PostHog masking and Better Stack alert delivery. Configure Supabase backups, test restore to a separate project, then cut over. No existing live D1 data is altered automatically.

## Release and recovery

Keep migrations additive and compatible with the preceding application build. The manual database-release workflow runs only from main, serializes production changes and uses the GitHub production environment. Run CI before triggering it. A Vercel rollback does not undo database changes, emails, SMS or charges.

On auth/email outage, pause new onboarding and check provider settings/logs without logging credentials. On delayed billing callbacks, retain paid access per ledger periods and reconcile against Cashfree. On a compromised credential, rotate the affected provider key and update deployment secrets; never publish it in a bug report. On bad deployment, route traffic to the prior compatible Vercel build, then repair forward.

## Exact remaining inputs

The actual public domain, Google OAuth app, verified email sender/domain, private R2 credentials, Turnstile widget, 2Factor credentials/template, PostHog project, Better Stack source/monitors/alert destination, Cashfree merchant plan/keys, and Vercel project access. Enter secrets in the ignored local environment file or each provider's secret settings, not in chat.

Reference docs: [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying), [Vercel environments](https://vercel.com/docs/deployments/environments), [Supabase production](https://supabase.com/docs/guides/deployment/going-into-prod), [R2 S3 API](https://developers.cloudflare.com/r2/api/s3/api/), [Cloudflare Images](https://developers.cloudflare.com/images/optimization/transformations/overview/).

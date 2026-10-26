# Ziteo

Seller workspace, visual store editor and WhatsApp storefront. Production baseline: Next.js 16, TypeScript, Tailwind CSS/shadcn, Supabase Postgres/Auth/RLS, private Cloudflare R2, and Vercel. The existing editor and storefront remain in this repository.

See [production setup and rollout status](docs/PRODUCTION-SETUP.md), [auth configuration](docs/auth-setup.md), [provider contracts](docs/integrations.md), and [API contract](docs/API.md). [AGENTS.md](AGENTS.md) records the selected architecture for future work.

## Local development

Use Node 22 LTS. Install from the committed lockfile:

```sh
npm ci
cp .env.example .env.local
npm run env:check
npm run dev
```

Fill the public Supabase URL and publishable key to use the app. Never expose the secret key through NEXT_PUBLIC variables. Missing provider secrets do not create mock success. Production auth requires a Turnstile site key plus matching CAPTCHA configuration in Supabase.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run test:legacy
npm run build
npm run test:e2e
```

Vitest executes real Postgres SQL via PGlite, including RLS/grants, publication rules and the billing ledger, plus mocked provider and media access tests. Playwright uses the built production server. These are distinct from live provider acceptance tests.

If Windows build workers cannot create output folders, set ZITEO_SERIAL_BUILD=true for the build. This uses the supported serial Webpack build path without skipping type checks.

With Docker and Supabase CLI:

```sh
npx supabase start
npm run db:test
```

Database migrations are reviewed and applied separately from Vercel builds. GitHub Actions includes normal CI and a manual, serialized migration workflow. Configure the production environment with required reviewers before using it.

## Migration from the earlier version

The previous revision used a Sites/Vinext runtime, D1 and ChatGPT authentication. This branch replaces that runtime and identity/data layer. Git preserves the original. Existing live D1 data has not been imported or removed; an audited import must map old owners to confirmed Supabase users and validate all image references before cutover.

One owner/store and 50 active products remain the baseline. Phone verification is required near first publication and after contact-number changes. Seller login stays Google or email/password. Cashfree is sandbox by default; a successful mandate is not proof of payment.

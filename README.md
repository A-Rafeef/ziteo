# Ziteo

A working review build of the Ziteo product plan: one seller workspace, a structured website editor, and a catalog with WhatsApp buying.

## Run locally

Requires Node 22.13+ and npm. Install with `npm ci`, generate the initial build with `npm run build`, and apply the checked-in database migration locally:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_adorable_puck.sql
npm run dev
```

Open the printed loopback URL. Portable development includes a local mock sign-in at `/signin-with-chatgpt?return_to=/`; that mock is excluded from production. The first sign-in creates one unpublished store with eight clearly labeled sample products. Replace the sample products and add your WhatsApp number in Settings.

## Implemented

- Site-owned sign-in, owner-scoped store and products, and one store per account.
- Product list/grid, search, drafts/publication, up to five images, ordering, optional sales and discount badges.
- Up to four variant groups and 100 generated combinations, with individual prices, sale prices, and availability.
- An atomic server-side 50-product allowance, archive recovery for seven days, and restoration limits.
- Dedicated full-screen website editor, visual section templates, customization, actual device previews, page switching, undo/redo, optional sections, and protected draft/publish flows.
- Store publish/unpublish, immutable published slugs, stable `/p/short-id` product links.
- Public catalog search, newest-first infinite batches, lazy images, product details, and selected-variant WhatsApp messages.
- Daily UTC store views, product views, and WhatsApp clicks for 7/30 days; editor previews and owner visits excluded.
- Durable D1 data and R2 uploads. Image content and ownership checks protect unpublished uploads.
- Mobile workspace navigation, settings, free-plan details, support request copy, central preview terms and privacy information.

## Architecture

The React/Vinext application uses Sites hosting with a Cloudflare Worker, D1 binding `DB`, and R2 binding `BUCKET`. `.openai/hosting.json` holds site identity and binding names, never credentials. `app/server` owns validation and storage logic. `app/api` authorizes every seller operation. `app/components/Products.tsx` owns catalog management; `app/components/Storefront.tsx` renders the catalog; `app/workspace.tsx` owns navigation, overview, settings and analytics; `app/components/WebsiteEditor.tsx` owns editor controls. Business data stays independent of website design drafts.

Hosted authentication is provided by Sites dispatch. Only trusted dispatch identity headers authorize account data. Do not expose the underlying Worker directly without equivalent verified authentication and header sanitization.

## Production work still required

This is a functional review build with the following product-plan work remaining:

- The product plan proposes Supabase and Vercel. This build uses Sites/D1/R2. Migrating requires replacing the database/auth adapters and hosting integration, with equivalent ownership policies and transaction guarantees.
- Custom email registration, email verification, and password recovery are not implemented. Sign-in uses ChatGPT.
- Images are resized to at most 1600 pixels and JPEG-compressed in the browser before upload. The server validates image bytes and saves them to R2. A mandatory backend transformation pipeline is still needed to meet the production plan exactly.
- Support delivery and operator tooling are not configured. Support requests can be copied, but no message is sent. Store deletion and published-slug changes need an authorized operator workflow.
- Preview terms/privacy pages explain this implementation; finalize production legal policies before public launch.
- Publishing a store does not change the hosted site's visitor access policy. Manage hosting access separately.
- Add operational monitoring, rate limits/abuse protection, recovery/backups, and a production security review before opening self-service registration.

Customers, quantity inventory, internal orders/enquiries, services, staff accounts, custom domains, localization, reviews, and CSV tools are intentionally Coming Soon or deferred as in the plan.

## Checks

```sh
node node_modules/typescript/bin/tsc --noEmit
node --experimental-strip-types --test app/editor-history.test.mjs app/website-guidance.test.mjs app/product-presentation.test.mjs app/server/validation.test.mjs
npm run build
```

The migration under `drizzle/` is schema-only and tracked. Hosted publication applies migrations before uploading the Worker. Never rewrite an applied migration; append a new one.

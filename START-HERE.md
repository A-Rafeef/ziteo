# Ziteo platform

This package contains the latest Ziteo application source, including the full-screen website editor and the usability improvements published in version 3.

## Contents

- Project root: application source, dependency lockfile, database schema migration and project scripts.
- docs/UX-Review.md: findings, improvements and verification results.
- SOURCE-VERSION.txt: the published source revision.

## Run locally

1. Extract the ZIP and open a terminal in the project folder.
2. Install Node.js 22.13 or newer with npm.
3. Run npm ci, then npm run build.
4. Initialize the local database with the command below.
5. Run npm run dev and open the printed local URL.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_adorable_puck.sql
npm run dev
```

Local development provides a mock sign-in and initializes an unpublished store with sample products. The local sign-in route is /signin-with-chatgpt?return_to=/ . Existing live database records and uploaded images are not part of this source export.

## Verification

The published revision passed TypeScript, 33 unit tests, 12 local API/database checks and the production build. Responsive UI checks covered phones, tablets and desktop.

```sh
node node_modules/typescript/bin/tsc --noEmit
node --experimental-strip-types --test app/editor-history.test.mjs app/website-guidance.test.mjs app/product-presentation.test.mjs app/server/validation.test.mjs
npm run build
```

## Hosting

The app uses Sites with a Cloudflare Worker, D1 database binding DB and R2 upload binding BUCKET. Hosted sign-in relies on Sites identity dispatch. Dependencies, credentials, environment files and runtime database contents are excluded from this ZIP. See README.md for architecture and remaining product-plan work.

Live platform: https://ziteo-seller-studio.ahammadrafeef.chatgpt.site/#website

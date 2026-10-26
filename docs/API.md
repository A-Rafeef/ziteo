# Ziteo HTTP API v1

Base path: /api/v1. JSON responses are not cached. Web callers use Supabase SSR cookies. Native callers use Authorization: Bearer <Supabase access token>; the server validates that identity and passes the same token to Postgres RLS. Invalid bearer credentials never fall back to a cookie. Send Content-Type: application/json on JSON mutations. Cookie browser mutations require an allowed Origin; native bearer callers can omit it.

Errors return {error:string} with an appropriate HTTP status. Store ownership comes from the verified token, never from a client-supplied owner ID. Existing unversioned routes remain compatibility adapters for the current UI.

| Method | Route | Request/result |
| --- | --- | --- |
| GET | /workspace | Creates a private empty store on first visit; returns user, store, products and daily seller metrics |
| POST | /store | Validated store settings; returns store |
| POST | /design | {design}; saves private website draft |
| POST | /publish | {published:boolean}; server/database require current verified phone and visible published product |
| GET | /preview | Owner's saved draft and eligible preview products |
| POST | /products | Product fields; creates within active product allowance |
| POST | /products/:id | Product fields; updates owned product |
| POST | /products/:id/archive | Archives product and frees an active slot |
| POST | /products/:id/restore | {status:'draft' or 'published'} within seven days and allowance |
| POST | /uploads | Multipart file field; JPEG/PNG/WebP, maximum3MB; returns authorized image URL |
| GET | /public/:slug | Anonymous public snapshot |
| GET | /public/product/:shortId | Anonymous public snapshot containing published product |
| POST | /events | {storeId,type,productId?}; type store_view,product_view,whatsapp_click; validated public target |
| GET | /verification | Owner's current phone-verification state |
| POST | /verification/send | {channel:'sms',captchaToken}; creates challenge tied to saved store phone |
| POST | /verification/confirm | {challengeId,code}; verifies provider result with bounded attempts |
| POST | /billing/subscribe | Opens/reuses server-selected periodic Cashfree subscription; returns sessionId/mode |
| GET | /billing/status | Current environment's ledger-based paid access and latest subscription status |

Image reads use /api/images/:storeId/:filename with authorization checked at read time. The public health endpoints are /api/health and /api/health/ready. Cashfree POST /api/webhooks/cashfree accepts signed raw provider payloads only.

Auth methods for web: POST /auth/password (signin/signup/reset/update), POST /auth/oauth (Google), PKCE /auth/callback, email /auth/confirm, and POST /auth/signout. Expo can use the same Supabase project with native token storage, approved deep links and OAuth PKCE; the JSON business APIs remain shared. No Expo app is created by this baseline.

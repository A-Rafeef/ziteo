import { afterAll, beforeAll, describe, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// This executes real PostgreSQL grants, RLS, triggers and transactional RPCs.
// Only Supabase's surrounding identity schema is substituted for local execution.
// The same SQL suite also runs unchanged against Supabase with `npm run db:test`.
describe('Postgres security and production invariants', () => {
  let db: PGlite;
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`
      create role anon nologin; create role authenticated nologin;
      create role service_role nologin bypassrls;
      create schema auth; create table auth.users(id uuid primary key,email text);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
      $$;
      grant usage on schema auth to anon,authenticated,service_role;
      grant execute on function auth.uid() to anon,authenticated,service_role;
    `);
    for (const name of readdirSync(resolve('supabase/migrations')).filter((name) => name.endsWith('.sql')).sort()) {
      await db.exec(readFileSync(resolve('supabase/migrations', name), 'utf8'));
    }
  }, 60000);
  afterAll(async () => { await db?.close(); });
  it('enforces isolation, private drafts, phone verification, product limits, and Cashfree ledger rules', async () => {
    for (const name of readdirSync(resolve('supabase/tests')).filter((name) => name.endsWith('.sql')).sort()) {
      await db.exec(readFileSync(resolve('supabase/tests', name), 'utf8'));
    }
  }, 60000);
});

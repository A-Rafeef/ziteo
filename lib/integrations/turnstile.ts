import 'server-only';
import { requiredEnv } from '@/lib/env';
import { ApiError } from '@/app/server/validation';

export async function verifyTurnstile(token: unknown, action: string) {
  if (typeof token !== 'string' || token.length < 1 || token.length > 2048) throw new ApiError('Complete the security check.', 400);
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: requiredEnv('TURNSTILE_SECRET_KEY'), response: token }),
    signal: AbortSignal.timeout(10000), cache: 'no-store',
  });
  const data = await result.json() as {success?: boolean; hostname?: string; action?: string};
  const hostnames = requiredEnv('TURNSTILE_ALLOWED_HOSTNAMES').split(',').map(s => s.trim());
  if (!result.ok || !data.success || !data.hostname || !hostnames.includes(data.hostname) || data.action !== action) {
    throw new ApiError('The security check expired. Please try again.', 403);
  }
}

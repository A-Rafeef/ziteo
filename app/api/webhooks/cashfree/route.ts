import { createAdminClient } from '@/lib/supabase/admin';
import { requiredEnv } from '@/lib/env';
import { cashfreeEventKey, cashfreeMode, parseCashfreeEvent, verifyCashfreeSignature } from '@/lib/integrations/cashfree';
import { ApiError } from '@/app/server/validation';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const reader = request.body?.getReader();
    if (!reader) return new Response('Missing payload', { status: 400 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 256000) { await reader.cancel(); return new Response('Payload too large', { status: 413 }); }
      chunks.push(value);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!verifyCashfreeSignature(raw, request.headers.get('x-webhook-signature'), request.headers.get('x-webhook-timestamp'), requiredEnv('CASHFREE_CLIENT_SECRET'))) {
      return new Response('Invalid signature', { status: 401 });
    }
    const event = parseCashfreeEvent(raw);
    const { data, error } = await createAdminClient().rpc('record_cashfree_event', { p_environment: cashfreeMode(), p_event_key: cashfreeEventKey(raw), p_event: event });
    if (error) throw error;
    if (['payment_mismatch', 'period_mismatch', 'refund_mismatch', 'unknown_subscription'].includes(String(data))) {
      console.error('Cashfree event needs billing review', { outcome: data });
    }
    return Response.json({ received: true, result: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ApiError) return new Response('Invalid webhook payload', { status: 400 });
    // Provider retries must continue when the durable transaction fails. Never log payment/bank payloads.
    console.error('Cashfree webhook could not be recorded');
    return new Response('Please retry', { status: 503 });
  }
}

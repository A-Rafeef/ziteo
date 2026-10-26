import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from '@/app/server/validation';
import { requiredEnv } from '@/lib/env';

export type PremiumPlan = { id: string; amountMinor: number; currency: 'INR'; periodMonths: number };
export type SubscriptionReservation = {
  id: string; provider_id: string; idempotency_key: string; store_id: string;
  plan_id: string; amount_minor: number; currency: string; period_months: number;
  status: string; session_id: string | null; api_state: string;
  environment: 'sandbox' | 'production';
};

export function premiumPlan(): PremiumPlan {
  const amount = Number(requiredEnv('CASHFREE_PLAN_AMOUNT'));
  const periodMonths = Number(requiredEnv('CASHFREE_PLAN_PERIOD_MONTHS'));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001 || ![1, 12].includes(periodMonths)) {
    throw new ApiError('The Premium plan is not configured yet.', 503);
  }
  return { id: requiredEnv('CASHFREE_PLAN_ID'), amountMinor: Math.round(amount * 100), currency: 'INR', periodMonths };
}

export function cashfreeMode(): 'sandbox' | 'production' {
  const mode = process.env.CASHFREE_ENV || 'sandbox';
  if (mode !== 'sandbox' && mode !== 'production') throw new ApiError('Billing is not configured yet.', 503);
  return mode;
}

export async function createCashfreeSubscription(reservation: SubscriptionReservation, customer: { name: string; email: string; phone: string }) {
  const base = cashfreeMode() === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
  const appUrl = requiredEnv('NEXT_PUBLIC_APP_URL');
  let response: Response;
  try {
    response = await fetch(`${base}/subscriptions`, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000),
      headers: {
        'Content-Type': 'application/json', 'x-api-version': process.env.CASHFREE_API_VERSION || '2026-01-01',
        'x-client-id': requiredEnv('CASHFREE_CLIENT_ID'), 'x-client-secret': requiredEnv('CASHFREE_CLIENT_SECRET'),
        'x-idempotency-key': reservation.idempotency_key,
      },
      body: JSON.stringify({
        subscription_id: reservation.provider_id,
        customer_details: { customer_name: customer.name, customer_email: customer.email, customer_phone: customer.phone.slice(-10) },
        plan_details: { plan_id: reservation.plan_id },
        subscription_meta: { return_url: `${new URL(appUrl).origin}/?billing=return` },
        subscription_tags: { ziteo_store_id: reservation.store_id },
      }),
    });
    const data = await response.json() as { subscription_id?: string; subscription_session_id?: string; subscription_status?: string };
    if (!response.ok || data.subscription_id !== reservation.provider_id || typeof data.subscription_session_id !== 'string' || !data.subscription_session_id || data.subscription_session_id.length > 10000) throw new Error('Provider rejected subscription');
    return { sessionId: data.subscription_session_id, status: data.subscription_status || 'INITIALIZED' };
  } catch {
    // Keep the database reservation: retry with the same merchant ID and idempotency key.
    throw new ApiError('We could not open billing. Please retry; your subscription request is saved.', 503);
  }
}

export function verifyCashfreeSignature(raw: string, signature: string | null, timestamp: string | null, secret: string, now = Date.now()): boolean {
  if (!signature || !timestamp || !/^\d{13}$/.test(timestamp) || Math.abs(now - Number(timestamp)) > 300000) return false;
  if (!/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(timestamp + raw).digest();
  const actual = Buffer.from(signature, 'base64');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function cashfreeEventKey(raw: string): string { return createHash('sha256').update(raw).digest('hex'); }

export type CashfreeEvent = {
  type: string; subscription_id: string | null; event_time: string; subscription_status: string | null;
  payment_id: string | null; payment_type: string | null; payment_status: string | null;
  amount_minor: number | null; currency: string | null; period_start: string | null; refund_status: string | null;
  refund_id: string | null; refund_amount_minor: number | null;
};

function record(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function optionalText(value: unknown): string | null { return typeof value === 'string' && value.length <= 250 ? value : null; }

export function parseCashfreeEvent(raw: string): CashfreeEvent {
  let payload: Record<string, unknown>;
  try { payload = record(JSON.parse(raw)); } catch { throw new ApiError('Invalid webhook payload.'); }
  const data = record(payload.data);
  const details = record(data.subscription_details);
  const type = optionalText(payload.type);
  const subscriptionId = optionalText(data.subscription_id) || optionalText(details.subscription_id);
  const eventTime = optionalText(payload.event_time);
  if (!type || (!subscriptionId && type !== 'SUBSCRIPTION_REFUND_STATUS') || !eventTime || !Number.isFinite(Date.parse(eventTime))) throw new ApiError('Invalid subscription event.');
  const amount = typeof data.payment_amount === 'number' ? data.payment_amount : NaN;
  const amountMinor = Number.isFinite(amount) && amount >= 0 && Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001 ? Math.round(amount * 100) : null;
  const refundAmount = typeof data.refund_amount === 'number' ? data.refund_amount : NaN;
  const refundAmountMinor = Number.isFinite(refundAmount) && refundAmount > 0 && Math.abs(refundAmount * 100 - Math.round(refundAmount * 100)) < 0.000001 ? Math.round(refundAmount * 100) : null;
  const schedule = optionalText(data.payment_schedule_date);
  // A bare Indian schedule date is local midnight. Do not invent an entitlement start from webhook arrival time.
  const scheduleWithZone = schedule && /^\d{4}-\d{2}-\d{2}$/.test(schedule) ? `${schedule}T00:00:00+05:30` : schedule;
  const periodStart = scheduleWithZone && Number.isFinite(Date.parse(scheduleWithZone)) ? new Date(scheduleWithZone).toISOString() : null;
  return {
    type, subscription_id: subscriptionId, event_time: new Date(eventTime).toISOString(),
    subscription_status: optionalText(details.subscription_status) || optionalText(data.subscription_status),
    payment_id: optionalText(data.cf_payment_id), payment_type: optionalText(data.payment_type), payment_status: optionalText(data.payment_status),
    amount_minor: amountMinor, currency: optionalText(data.payment_currency), period_start: periodStart,
    refund_status: optionalText(data.refund_status),
    refund_id: optionalText(data.cf_refund_id) || optionalText(data.refund_id), refund_amount_minor: refundAmountMinor,
  };
}

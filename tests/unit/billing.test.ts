import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { cashfreeEventKey, cashfreeMode, createCashfreeSubscription, parseCashfreeEvent, premiumPlan, verifyCashfreeSignature, type SubscriptionReservation } from '@/lib/integrations/cashfree';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const now = 1793000000000;
const raw = '{"type":"SUBSCRIPTION_PAYMENT_SUCCESS","amount":499.00}';
const signature = createHmac('sha256', 'test_secret').update(String(now) + raw).digest('base64');

describe('Cashfree webhook authentication', () => {
  it('authenticates exact raw bytes and rejects parse/reserialize changes', () => {
    expect(verifyCashfreeSignature(raw, signature, String(now), 'test_secret', now)).toBe(true);
    expect(verifyCashfreeSignature(JSON.stringify(JSON.parse(raw)), signature, String(now), 'test_secret', now)).toBe(false);
  });
  it('rejects malformed signatures, missing headers, bad keys and stale/future timestamps', () => {
    for (const supplied of ['', 'abc', signature.slice(0, 20), '!'.repeat(44)]) expect(verifyCashfreeSignature(raw, supplied, String(now), 'test_secret', now)).toBe(false);
    expect(verifyCashfreeSignature(raw, signature, null, 'test_secret', now)).toBe(false);
    expect(verifyCashfreeSignature(raw, signature, String(now), 'wrong', now)).toBe(false);
    expect(verifyCashfreeSignature(raw, signature, String(now), 'test_secret', now + 300001)).toBe(false);
    expect(verifyCashfreeSignature(raw, signature, String(now), 'test_secret', now - 300001)).toBe(false);
  });
  it('uses a stable payload key independent of delivery headers', () => {
    expect(cashfreeEventKey(raw)).toMatch(/^[a-f0-9]{64}$/);
    expect(cashfreeEventKey(raw)).toBe(cashfreeEventKey(raw));
    expect(cashfreeEventKey(raw + ' ')).not.toBe(cashfreeEventKey(raw));
  });
});

describe('subscription event mapping', () => {
  const event = (data: Record<string, unknown>, type = 'SUBSCRIPTION_PAYMENT_SUCCESS') => JSON.stringify({ type, event_time: '2026-10-26T15:00:00+05:30', data });
  it('distinguishes mandate authorisation from a paid subscription charge', () => {
    const mapped = parseCashfreeEvent(event({ subscription_id: 'sub_1', payment_type: 'AUTH', payment_status: 'SUCCESS', cf_payment_id: 'cf_1', payment_amount: 2, payment_currency: 'INR' }));
    expect(mapped.payment_type).toBe('AUTH');
    expect(mapped.amount_minor).toBe(200);
    expect(mapped.period_start).toBeNull();
  });
  it('supports lifecycle IDs nested under subscription_details and drops contact/bank information', () => {
    const mapped = parseCashfreeEvent(event({ subscription_details: { subscription_id: 'sub_2', subscription_status: 'CUSTOMER_CANCELLED' }, customer_details: { customer_email: 'secret@example.com' } }, 'SUBSCRIPTION_STATUS_CHANGED'));
    expect(mapped.subscription_id).toBe('sub_2');
    expect(mapped.subscription_status).toBe('CUSTOMER_CANCELLED');
    expect(JSON.stringify(mapped)).not.toContain('secret@example.com');
  });
  it('preserves a valid charge schedule and integer paise; never supplies an absent schedule', () => {
    const data = { subscription_id: 'sub_1', payment_type: 'CHARGE', payment_status: 'SUCCESS', cf_payment_id: 'cf_1', payment_amount: 499.99, payment_currency: 'INR', payment_schedule_date: '2026-10-26' };
    expect(parseCashfreeEvent(event(data))).toMatchObject({ payment_id: 'cf_1', amount_minor: 49999, period_start: '2026-10-25T18:30:00.000Z' });
    expect(parseCashfreeEvent(event({ ...data, payment_schedule_date: '', payment_amount: 499.999 }))).toMatchObject({ amount_minor: null, period_start: null });
  });
  it('rejects invalid JSON and incomplete events', () => {
    for (const value of ['{', '{}', event({})]) expect(() => parseCashfreeEvent(value)).toThrow();
  });
  it('maps actual refund payloads without a subscription ID and retains distinct refund identity/amount', () => {
    const mapped = parseCashfreeEvent(event({ cf_payment_id: 'paid-1', cf_refund_id: 'refund-1', refund_amount: 99.5, refund_status: 'SUCCESS' }, 'SUBSCRIPTION_REFUND_STATUS'));
    expect(mapped).toMatchObject({ subscription_id: null, payment_id: 'paid-1', refund_id: 'refund-1', refund_amount_minor: 9950, refund_status: 'SUCCESS' });
  });
});

describe('subscription creation', () => {
  const reservation: SubscriptionReservation = {
    id: 'id', provider_id: 'ziteo_reserved', idempotency_key: '550e8400-e29b-41d4-a716-446655440000',
    store_id: 'store', plan_id: 'approved_plan', amount_minor: 49900, currency: 'INR', period_months: 1,
    status: 'INITIALIZED', session_id: null, api_state: 'pending', environment: 'sandbox',
  };
  it('defaults to sandbox and validates plan amounts and periods', () => {
    vi.stubEnv('CASHFREE_ENV', '');
    expect(cashfreeMode()).toBe('sandbox');
    vi.stubEnv('CASHFREE_PLAN_ID', 'premium'); vi.stubEnv('CASHFREE_PLAN_AMOUNT', '499'); vi.stubEnv('CASHFREE_PLAN_PERIOD_MONTHS', '1');
    expect(premiumPlan()).toEqual({ id: 'premium', amountMinor: 49900, currency: 'INR', periodMonths: 1 });
    vi.stubEnv('CASHFREE_PLAN_AMOUNT', '499.999'); expect(() => premiumPlan()).toThrow();
    vi.stubEnv('CASHFREE_PLAN_AMOUNT', '499'); vi.stubEnv('CASHFREE_PLAN_PERIOD_MONTHS', '0'); expect(() => premiumPlan()).toThrow();
    vi.stubEnv('CASHFREE_ENV', 'prod'); expect(() => cashfreeMode()).toThrow();
  });
  it('reuses the durable merchant ID and idempotency key across a timeout retry', async () => {
    vi.stubEnv('CASHFREE_ENV', 'sandbox'); vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://ziteo.example');
    vi.stubEnv('CASHFREE_CLIENT_ID', 'client'); vi.stubEnv('CASHFREE_CLIENT_SECRET', 'secret');
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce(Response.json({ subscription_id: reservation.provider_id, subscription_session_id: 'session', subscription_status: 'INITIALIZED' }));
    vi.stubGlobal('fetch', fetchMock);
    const customer = { name: 'Shop', email: 'seller@example.com', phone: '919876543210' };
    await expect(createCashfreeSubscription(reservation, customer)).rejects.toThrow('request is saved');
    await expect(createCashfreeSubscription(reservation, customer)).resolves.toEqual({ sessionId: 'session', status: 'INITIALIZED' });
    const [first, second] = fetchMock.mock.calls;
    expect(first[0]).toBe('https://sandbox.cashfree.com/pg/subscriptions');
    expect(first[1].body).toBe(second[1].body);
    expect(first[1].headers['x-idempotency-key']).toBe(reservation.idempotency_key);
    expect(JSON.parse(first[1].body)).toMatchObject({ subscription_id: reservation.provider_id, plan_details: { plan_id: 'approved_plan' }, customer_details: { customer_phone: '9876543210' } });
  });
  it('rejects a response belonging to another merchant subscription', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://ziteo.example'); vi.stubEnv('CASHFREE_ENV', 'sandbox');
    vi.stubEnv('CASHFREE_CLIENT_ID', 'client'); vi.stubEnv('CASHFREE_CLIENT_SECRET', 'secret');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ subscription_id: 'other', subscription_session_id: 'session' })));
    await expect(createCashfreeSubscription(reservation, { name: 'Shop', email: 'seller@example.com', phone: '919876543210' })).rejects.toThrow();
  });
});

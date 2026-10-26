import { route } from '@/app/server/data';
import { sellerContext } from '@/lib/integrations/seller-context';
import { cashfreeMode } from '@/lib/integrations/cashfree';

export async function GET(request: Request) {
  return route(async () => {
    const { client, store } = await sellerContext(request);
    const [{ data: payments, error: paymentError }, { data: subscription, error: subscriptionError }] = await Promise.all([
      client.from('billing_payments').select('period_end').eq('store_id', store.id).eq('environment', cashfreeMode()).eq('refunded', false).lte('period_start', new Date().toISOString()).order('period_end', { ascending: false }).limit(1).maybeSingle(),
      client.from('billing_subscriptions').select('provider_id,status,created_at').eq('store_id', store.id).eq('environment', cashfreeMode()).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (paymentError || subscriptionError) throw paymentError || subscriptionError;
    const paidUntil = payments?.period_end || null;
    return { premium: Boolean(paidUntil && Date.parse(paidUntil) > Date.now()), paidUntil, subscription, mode: cashfreeMode() };
  });
}

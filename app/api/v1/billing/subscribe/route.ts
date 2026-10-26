import { route } from '@/app/server/data';
import { ApiError } from '@/app/server/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { sellerContext, rpcFailure } from '@/lib/integrations/seller-context';
import { cashfreeMode, createCashfreeSubscription, premiumPlan, type SubscriptionReservation } from '@/lib/integrations/cashfree';
import { normalizeIndianPhone } from '@/lib/integrations/twofactor';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  return route(async () => {
    const { user, store } = await sellerContext(request);
    if (!user.email) throw new ApiError('Add an email address to your account before subscribing.', 409);
    const plan = premiumPlan();
    const phone = normalizeIndianPhone(String(store.data.whatsapp || ''));
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('reserve_subscription', {
      p_owner: user.id, p_store: store.id, p_plan_id: plan.id, p_amount_minor: plan.amountMinor,
      p_environment: cashfreeMode(),
      p_period_months: plan.periodMonths, p_customer_name: String(store.data.name || 'Ziteo seller').slice(0, 100),
      p_customer_email: user.email, p_customer_phone: phone,
    });
    if (error) rpcFailure(error.message);
    const reservation = data as SubscriptionReservation & { customer_name: string; customer_email: string; customer_phone: string };
    if (!reservation?.provider_id) throw new ApiError('Billing is unavailable.', 503);
    if (!['INITIALIZED', 'BANK_APPROVAL_PENDING'].includes(reservation.status)) {
      return { subscriptionId: reservation.provider_id, status: reservation.status, mode: cashfreeMode(), sessionId: null };
    }
    let sessionId = reservation.session_id;
    if (!sessionId) {
      const created = await createCashfreeSubscription(reservation, {
        name: reservation.customer_name, email: reservation.customer_email, phone: reservation.customer_phone,
      });
      const { error: completeError } = await admin.rpc('complete_subscription_creation', {
        p_id: reservation.id, p_session_id: created.sessionId,
      });
      if (completeError) throw new ApiError('Billing was created but could not be saved. Retry to recover it safely.', 503);
      sessionId = created.sessionId;
    }
    return { subscriptionId: reservation.provider_id, sessionId, mode: cashfreeMode(), status: reservation.status };
  }, 200, request);
}

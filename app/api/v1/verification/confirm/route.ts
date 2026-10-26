import { json, route } from '@/app/server/data';
import { ApiError } from '@/app/server/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { sellerContext, rpcFailure } from '@/lib/integrations/seller-context';
import { verifyPhoneCode } from '@/lib/integrations/twofactor';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  return route(async () => {
    const { user, store } = await sellerContext(request);
    const body = await json(request);
    if (typeof body.challengeId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.challengeId) || typeof body.code !== 'string' || !/^\d{4,6}$/.test(body.code)) {
      throw new ApiError('Enter the code from your verification message.');
    }
    const admin = createAdminClient();
    const args = { p_owner: user.id, p_store: store.id, p_challenge: body.challengeId };
    const { data, error } = await admin.rpc('claim_phone_attempt', args);
    if (error) rpcFailure(error.message);
    const challenge = data as { session_id: string; phone: string };
    if (!challenge?.session_id) throw new ApiError('Request a new verification code.', 409);
    if (!await verifyPhoneCode(challenge.session_id, body.code)) throw new ApiError('That verification code did not match. Please try again.');
    const { error: confirmError } = await admin.rpc('confirm_phone_verification', args);
    if (confirmError) rpcFailure(confirmError.message);
    return { verified: true };
  }, 200, request);
}

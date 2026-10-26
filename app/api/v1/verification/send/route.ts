import { json, route } from '@/app/server/data';
import { ApiError } from '@/app/server/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { sellerContext, rpcFailure } from '@/lib/integrations/seller-context';
import { sendPhoneCode } from '@/lib/integrations/twofactor';
import { verifyTurnstile } from '@/lib/integrations/turnstile';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  return route(async () => {
    const { user, store } = await sellerContext(request);
    const body = await json(request);
    const channel = body.channel || 'sms';
    if (channel !== 'sms') throw new ApiError('WhatsApp verification is awaiting provider template approval. Use SMS for now.', 503);
    await verifyTurnstile(body.captchaToken, 'phone-verification');
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('reserve_phone_verification', { p_owner: user.id, p_store: store.id });
    if (error) rpcFailure(error.message);
    const challenge = data as { challenge_id: string; phone: string };
    if (!challenge?.challenge_id || !challenge.phone) throw new ApiError('Phone verification is unavailable.', 503);
    const sessionId = await sendPhoneCode(challenge.phone, channel);
    const { error: sessionError } = await admin.rpc('attach_phone_session', { p_challenge: challenge.challenge_id, p_session: sessionId });
    if (sessionError) rpcFailure(sessionError.message);
    return { challengeId: challenge.challenge_id, expiresIn: 300, retryAfter: 60, channel: 'sms' };
  }, 200, request);
}

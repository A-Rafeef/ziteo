import 'server-only';
import { createRequestClient } from '@/lib/supabase/server';
import { ApiError } from '@/app/server/validation';

export async function sellerContext(request: Request) {
  const client = await createRequestClient(request);
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const { data: { user }, error: authError } = await client.auth.getUser(bearer || undefined);
  if (authError || !user) throw new ApiError('Sign in to manage your store.', 401);
  const { data: store, error } = await client.from('stores').select('id,data').eq('owner_id', user.id).single();
  if (error || !store) throw new ApiError('Set up your store first.', 404);
  return { client, user, store: store as { id: string; data: Record<string, unknown> } };
}

export function rpcFailure(message: string): never {
  if (/cooldown|rate.limit|too many|wait \d+ seconds|verification limit/i.test(message)) throw new ApiError('Please wait before requesting another code.', 429);
  if (/expired|attempt|challenge|session|phone changed/i.test(message)) throw new ApiError('This code expired or has too many attempts. Request a new code.', 400);
  if (/verify|verified/i.test(message)) throw new ApiError('Verify your store phone number first.', 409);
  throw new ApiError('We could not complete this request. Please try again.', 409);
}

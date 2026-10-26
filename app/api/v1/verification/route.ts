import { route } from '@/app/server/data';
import { sellerContext } from '@/lib/integrations/seller-context';

export async function GET(request: Request) {
  return route(async () => {
    const { client, store } = await sellerContext(request);
    const { data, error } = await client.rpc('is_store_phone_verified', { p_store_id: store.id });
    if (error) throw error;
    return { verified: data === true };
  });
}

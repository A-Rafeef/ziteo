import {createRequestClient} from '@/lib/supabase/server';
import {getCurrentUser} from '@/app/server/auth';
import {getImage} from '@/lib/integrations/r2';
import type {PublicData} from '@/app/types';

export const runtime='nodejs';
export async function GET(request:Request,context:{params:Promise<{key:string[]}>}){
  const {key}=await context.params;
  if(key.length!==2||!(/^[a-f0-9-]{36}$/).test(key[0])||!(/^[a-f0-9-]{36}\.(jpg|png|webp)$/).test(key[1]))return new Response('Image not found',{status:404});
  try{
    const db=await createRequestClient(request);const user=await getCurrentUser(request);
    let allowed=false;
    if(user){
      const {data:store,error}=await db.from('stores').select('id').eq('id',key[0]).eq('owner_id',user.userId).maybeSingle();
      if(error)throw error;allowed=!!store;
    }
    if(!allowed){
      const {data:snapshot,error}=await db.from('storefronts').select('data').eq('store_id',key[0]).maybeSingle();
      if(error)throw error;
      const data=snapshot?.data as PublicData|undefined;
      const url='/api/images/'+key.join('/');
      allowed=!!data&&(data.store.logo===url||data.store.liveDesign.heroImage===url||data.products.some(p=>p.images.includes(url)));
    }
    if(!allowed)return new Response('Image not found',{status:404});
    const object=await getImage(key.join('/'));
    if(!object.Body)return new Response('Image not found',{status:404});
    return new Response(object.Body.transformToWebStream(),{headers:{
      'Content-Type':object.ContentType??'application/octet-stream',
      'Cache-Control':'private, no-store',
      'Vary':'Cookie, Authorization',
      'X-Content-Type-Options':'nosniff',
    }});
  }catch{return new Response('Image unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
}

import {createClient} from '@/lib/supabase/server';
export async function GET(){
  try{
    const {error}=await (await createClient()).from('storefronts').select('store_id').limit(1);
    if(error)throw error;
    return Response.json({status:'ready'},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({status:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}

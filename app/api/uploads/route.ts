import {owner,route,storeFor,assertDatabase,database} from '@/app/server/data';
import {ApiError,sniffImage} from '@/app/server/validation';
import {putImage,deleteImage} from '@/lib/integrations/r2';

export const runtime='nodejs';
const MAX_BYTES=3*1024*1024; // Below Vercel's 4.5 MB request limit, including multipart framing.
export async function POST(request:Request) {
  return route(async()=>{
    const store=await storeFor(await owner());
    if(Number(request.headers.get('content-length')??0)>MAX_BYTES+65536) throw new ApiError('Choose an image smaller than 3 MB.',413);
    // Read with a hard bound; Content-Length can be absent or forged.
    const reader=request.body?.getReader();
    if(!reader) throw new ApiError('Choose an image to upload.');
    const chunks:Uint8Array[]=[];let total=0;
    for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_BYTES+65536){await reader.cancel();throw new ApiError('Choose an image smaller than 3 MB.',413);}chunks.push(value);}
    const raw=new Uint8Array(total);let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.byteLength;}
    let form:FormData;
    try{form=await new Response(raw,{headers:{'Content-Type':request.headers.get('content-type')??''}}).formData();}
    catch{throw new ApiError('Upload an image using the file field.');}
    const file=form.get('file');
    if(!file||typeof file==='string'||!(file instanceof Blob)||!file.size)throw new ApiError('Choose an image.');
    if(file.size>MAX_BYTES)throw new ApiError('Choose an image smaller than 3 MB.',413);
    const bytes=new Uint8Array(await file.arrayBuffer());const mime=sniffImage(bytes);
    if(!mime||(file.type&&file.type!==mime))throw new ApiError('Use a JPEG, PNG or WebP image with matching file contents.');
    const extension=mime==='image/jpeg'?'jpg':mime==='image/png'?'png':'webp';
    const key=store.id+'/'+crypto.randomUUID()+'.'+extension;
    await putImage(key,bytes,mime);
    const {error}=await (await database()).from('media_assets').insert({store_id:store.id,object_key:key,mime_type:mime,byte_size:bytes.byteLength});
    if(error){await deleteImage(key).catch(()=>{});assertDatabase(error);}
    return {url:'/api/images/'+key};
  },201,request);
}

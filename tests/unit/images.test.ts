import {describe,it,expect,vi,beforeEach} from 'vitest';
const {query,user,image}=vi.hoisted(()=>({query:vi.fn(),user:vi.fn(),image:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({createRequestClient:async()=>({from:query})}));
vi.mock('@/app/server/auth',()=>({getCurrentUser:user}));
vi.mock('@/lib/integrations/r2',()=>({getImage:image}));
import {GET} from '@/app/api/images/[...key]/route';
import {cloudflareImage} from '@/lib/image-delivery';
const storeId='12345678-1234-1234-1234-123456789abc';
const fileId='abcdef01-abcd-abcd-abcd-abcdef012345.jpg';
const context={params:Promise.resolve({key:[storeId,fileId]})};
function results(...rows:unknown[]){query.mockImplementation(()=>({select:()=>({eq:()=>({eq:()=>({maybeSingle:async()=>({data:rows.shift(),error:null})}),maybeSingle:async()=>({data:rows.shift(),error:null})})})}));}
beforeEach(()=>{vi.clearAllMocks();user.mockResolvedValue(null);image.mockResolvedValue({Body:{transformToWebStream:()=>new ReadableStream({start(c){c.enqueue(new Uint8Array([1,2,3]));c.close();}})},ContentType:'image/jpeg'});});
describe('private R2 image authorization',()=>{
 it('blocks anonymous draft access before reading storage',async()=>{results(null);expect((await GET(new Request('https://ziteo.example/api/images/x'),context)).status).toBe(404);expect(image).not.toHaveBeenCalled();});
 it('blocks a seller from another stores unpublished image',async()=>{user.mockResolvedValue({userId:'other'});results(null,null);expect((await GET(new Request('https://ziteo.example/api/images/x'),context)).status).toBe(404);expect(image).not.toHaveBeenCalled();});
 it('serves owner draft image without public caching',async()=>{user.mockResolvedValue({userId:'owner'});results({id:storeId});const response=await GET(new Request('https://ziteo.example/api/images/x'),context);expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toBe('private, no-store');expect(image).toHaveBeenCalledWith(storeId+'/'+fileId);});
 it('requires public reference, not just a published store',async()=>{results({data:{store:{logo:'',liveDesign:{heroImage:''}},products:[]}});expect((await GET(new Request('https://ziteo.example/api/images/x'),context)).status).toBe(404);});
 it('serves a referenced published image anonymously',async()=>{results({data:{store:{logo:'/api/images/'+storeId+'/'+fileId,liveDesign:{heroImage:''}},products:[]}});expect((await GET(new Request('https://ziteo.example/api/images/x'),context)).status).toBe(200);});
 it('rejects traversal before any database query',async()=>{expect((await GET(new Request('https://ziteo.example/api/images/x'),{params:Promise.resolve({key:['..','x.jpg']})})).status).toBe(404);expect(query).not.toHaveBeenCalled();});
});
describe('Cloudflare transformations',()=>{
 it('never transforms protected API draft images',()=>{vi.stubEnv('NEXT_PUBLIC_CLOUDFLARE_IMAGES_ORIGIN','https://images.example.com');vi.stubEnv('NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN','https://assets.example.com');expect(cloudflareImage('/api/images/'+storeId+'/'+fileId)).toBe('/api/images/'+storeId+'/'+fileId);vi.unstubAllEnvs();});
 it('transforms only allowlisted public origins',()=>{vi.stubEnv('NEXT_PUBLIC_CLOUDFLARE_IMAGES_ORIGIN','https://images.example.com');vi.stubEnv('NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN','https://assets.example.com');expect(cloudflareImage('https://assets.example.com/product.jpg',320)).toContain('/cdn-cgi/image/width=320');expect(cloudflareImage('https://untrusted.example/x.jpg')).toBe('https://untrusted.example/x.jpg');vi.unstubAllEnvs();});
});

export type Stock = 'in_stock' | 'out_of_stock';
export type VariantGroup = {name:string; values:string[]; affectsPrice:boolean};
export type Variant = {id:string; options:Record<string,string>; price:number; salePrice:number|null; stock:Stock};
export type Product = {id:string; shortId:string; name:string; description:string; price:number; salePrice:number|null; images:string[]; status:'draft'|'published'|'archived'; stock:Stock; showDiscount:boolean; variantGroups:VariantGroup[]; variants:Variant[]; createdAt:string; archivedAt:string|null; sample?:boolean};
export type Design = {accent:string; template:'minimal'|'editorial'|'bold'; heroTitle:string; heroSubtitle:string; heroImage:string; columns:number; cardStyle:'clean'|'soft'|'bordered'; imageRatio:'square'|'portrait'; showDiscount:boolean; sections:string[]; aboutText:string; bannerText:string; textContent:string; alignment:'left'|'center';sectionTemplates?:Record<string,'minimal'|'editorial'|'bold'>};
export type Store = {id:string; slug:string; name:string; whatsapp:string; description:string; address:string; contactEmail:string; logo:string; published:boolean; hideOutOfStock:boolean; draftDesign:Design; liveDesign:Design; sample:boolean; designCustomized?:boolean; publishedAt:string|null;phoneVerified?:boolean};
export type DailyMetric = {date:string; storeViews:number; productViews:number; whatsappClicks:number};
export type Workspace = {user:{id?:string;name:string;email:string};store:Store;products:Product[];analytics:DailyMetric[]};
export type PublicData = {store:Store; products:Product[];preview?:boolean};
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
export const effectivePrice=(p:{price:number;salePrice:number|null})=>p.salePrice??p.price;
export async function api<T=unknown>(path:string, body?:unknown, method?:string):Promise<T>{const r=await fetch('/api/'+path,{method:method||(body===undefined?'GET':'POST'),headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json() as T & {error?:string};if(!r.ok)throw new Error(data.error||'Something went wrong. Please try again.');return data;}

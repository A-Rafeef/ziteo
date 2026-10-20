import type {Product, Store} from './types';

export type PublishIssue={id:'contact'|'catalog';title:string;description:string;action:string;page:'settings'|'products'};

// Mirrors the existing publish requirements for guidance. The server remains authoritative.
export function publishReadiness(store:Store,products:Product[]){
 const contactReady=/^[1-9]\d{9,14}$/.test(store.whatsapp.replace(/[\s()+-]/g,''));
 const visibleProducts=products.filter(product=>product.status==='published'&&(!store.hideOutOfStock||(product.variants.length?product.variants.some(variant=>variant.stock==='in_stock'):product.stock==='in_stock')));
 const issues:PublishIssue[]=[];
 if(!contactReady)issues.push({id:'contact',title:'Add your WhatsApp number',description:'Customers need a number to ask about products and place an order.',action:'Open Settings',page:'settings'});
 if(!visibleProducts.length)issues.push({id:'catalog',title:'Make a product visible',description:store.hideOutOfStock?'Publish a product with an in-stock option so it appears in your store.':'Publish at least one product so customers have something to explore.',action:'Open Products',page:'products'});
 return {ready:issues.length===0,issues,visibleProducts:visibleProducts.length,contactReady};
}

export function workspaceGuidance(store:Store,products:Product[]){
 const readiness=publishReadiness(store,products);
 if(readiness.issues.length){const issue=readiness.issues[0];return {kicker:'YOUR NEXT STEP',title:issue.title,description:issue.description,action:issue.action,page:issue.page};}
 if(!store.designCustomized)return {kicker:'MAKE IT YOURS',title:'Give your storefront your style',description:'Your products and contact number are ready. Preview your website and choose a style that fits your business.',action:'Open website editor',page:'website'};
 if(!store.published)return {kicker:'READY WHEN YOU ARE',title:'Your store is ready to publish',description:'Review your saved website and share your collection with customers.',action:'Review and publish',page:'publish'};
 return {kicker:'YOUR STORE IS LIVE',title:'Make it easy to find your store',description:'Copy your store link and share it with customers. Keep your products and availability up to date.',action:'Copy store link',page:'share'};
}

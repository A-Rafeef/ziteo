import type {Product, Variant} from './types';

type PriceSource={price:number;salePrice:number|null};
export type ProductPricePresentation={price:number;regularPrice:number;discountPercent:number;from:boolean};

function presentPrice(value:PriceSource):ProductPricePresentation{
 const price=value.salePrice??value.price;
 return {price,regularPrice:value.price,discountPercent:value.salePrice!==null&&value.salePrice<value.price?Math.round((1-value.salePrice/value.price)*100):0,from:false};
}

/** An unselected variant product advertises a price the customer can actually choose. */
export function getProductPricePresentation(product:Pick<Product,'price'|'salePrice'|'variants'>,selectedVariant?:Variant):ProductPricePresentation{
 if(!product.variants.length)return presentPrice(product);
 if(selectedVariant)return presentPrice(selectedVariant);
 const inStock=product.variants.filter(variant=>variant.stock==='in_stock');
 const candidates=inStock.length?inStock:product.variants;
 const price=Math.min(...candidates.map(variant=>variant.salePrice??variant.price));
 return {price,regularPrice:price,discountPercent:0,from:true};
}

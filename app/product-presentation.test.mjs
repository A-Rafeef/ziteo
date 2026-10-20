import test from 'node:test';
import assert from 'node:assert/strict';
import {getProductPricePresentation} from './product-presentation.ts';

const variant=(id,price,salePrice=null,stock='in_stock')=>({id,price,salePrice,stock,options:{Size:id}});
const product=(variants=[])=>({price:999,salePrice:499,variants});

test('simple products keep their exact sale price and calculated discount',()=>{
 assert.deepEqual(getProductPricePresentation(product()),{price:499,regularPrice:999,discountPercent:50,from:false});
 assert.deepEqual(getProductPricePresentation({price:1299.99,salePrice:null,variants:[]}),{price:1299.99,regularPrice:1299.99,discountPercent:0,from:false});
});

test('a variant starting price excludes a cheaper unavailable combination',()=>{
 const result=getProductPricePresentation(product([variant('S',299,null,'out_of_stock'),variant('M',899),variant('L',999,799)]));
 assert.deepEqual(result,{price:799,regularPrice:799,discountPercent:0,from:true});
});

test('variant cards ignore an unrelated base price and base sale percentage',()=>{
 const first=getProductPricePresentation(product([variant('S',1399),variant('M',1599)]));
 const second=getProductPricePresentation({...product([variant('S',1399),variant('M',1599)]),price:10000,salePrice:1});
 assert.deepEqual(first,{price:1399,regularPrice:1399,discountPercent:0,from:true});
 assert.deepEqual(second,first);
});

test('all-unavailable variants retain a truthful starting price for the unavailable display',()=>{
 const result=getProductPricePresentation(product([variant('S',899,649,'out_of_stock'),variant('M',999,null,'out_of_stock')]));
 assert.deepEqual(result,{price:649,regularPrice:649,discountPercent:0,from:true});
});

test('one priced option still requires selection and uses its own price',()=>{
 assert.deepEqual(getProductPricePresentation(product([variant('Only',1499)])),{price:1499,regularPrice:1499,discountPercent:0,from:true});
});

test('an exact selected variant shows its own price and discount, including paise',()=>{
 const selected=variant('L',1499.99,1299.95);
 assert.deepEqual(getProductPricePresentation(product([variant('S',899),selected]),selected),{price:1299.95,regularPrice:1499.99,discountPercent:13,from:false});
});

test('a selected unavailable variant is displayed exactly without mutating stock or catalog data',()=>{
 const selected=variant('L',1000,700,'out_of_stock');
 const input=product([variant('S',900),selected]);
 const before=structuredClone(input);
 assert.deepEqual(getProductPricePresentation(input,selected),{price:700,regularPrice:1000,discountPercent:30,from:false});
 assert.deepEqual(input,before);
 assert.equal(selected.stock,'out_of_stock');
});

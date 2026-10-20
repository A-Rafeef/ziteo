import assert from 'node:assert/strict';
import test from 'node:test';
import {publishReadiness,workspaceGuidance} from './website-guidance.ts';
const store={whatsapp:'',hideOutOfStock:false,published:false,designCustomized:false};
const product={status:'published',stock:'in_stock',variants:[]};
test('readiness identifies both prerequisites and their recovery destinations',()=>{
 const result=publishReadiness(store,[]);
 assert.equal(result.ready,false);
 assert.deepEqual(result.issues.map(issue=>issue.page),['settings','products']);
});
test('only a valid international number satisfies contact readiness',()=>{
 assert.equal(publishReadiness({...store,whatsapp:'+91 (98765) 43210'},[product]).ready,true);
 for(const whatsapp of ['123','0000000000','919876543210x'])assert.equal(publishReadiness({...store,whatsapp},[product]).contactReady,false);
});
test('draft, archived and hidden unavailable products do not count toward publication',()=>{
 const configured={...store,whatsapp:'919876543210',hideOutOfStock:true};
 assert.equal(publishReadiness(configured,[{...product,status:'draft'},{...product,status:'archived'},{...product,stock:'out_of_stock'}]).visibleProducts,0);
 assert.equal(publishReadiness({...configured,hideOutOfStock:false},[{...product,stock:'out_of_stock'}]).ready,true);
});
test('variant availability determines visibility even when base stock disagrees',()=>{
 const configured={...store,whatsapp:'919876543210',hideOutOfStock:true};
 assert.equal(publishReadiness(configured,[{...product,variants:[{stock:'out_of_stock'}]}]).ready,false);
 assert.equal(publishReadiness(configured,[{...product,stock:'out_of_stock',variants:[{stock:'in_stock'}]}]).ready,true);
});
test('guidance recommends one concrete next action as setup progresses',()=>{
 assert.equal(workspaceGuidance(store,[]).page,'settings');
 const configured={...store,whatsapp:'919876543210'};
 assert.equal(workspaceGuidance(configured,[]).page,'products');
 assert.equal(workspaceGuidance(configured,[product]).page,'website');
 assert.equal(workspaceGuidance({...configured,designCustomized:true},[product]).page,'publish');
 assert.equal(workspaceGuidance({...configured,designCustomized:true,published:true},[product]).page,'share');
});

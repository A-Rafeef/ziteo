import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_DESIGN} from './server/validation.ts';
import {createEditorHistory, designKey, editorHistory, sameDesign, shouldGuardLeave} from './editor-history.ts';

const design=(patch={})=>({...structuredClone(DEFAULT_DESIGN),...structuredClone(patch)});
const change=(state,next,options={})=>editorHistory(state,{type:'change',design:next,...options});

test('undo and redo restore exact designs, including section order and nested presets',()=>{
 const snapshots=[design(),design({heroTitle:'A considered collection',sectionTemplates:{hero:'bold'}}),design({heroTitle:'A considered collection',columns:4,cardStyle:'soft',sectionTemplates:{hero:'bold',products:'minimal'}}),design({heroTitle:'A considered collection',columns:4,cardStyle:'soft',sections:['navbar','about','products','hero','footer'],sectionTemplates:{hero:'bold',products:'minimal'}})];
 let state=createEditorHistory(snapshots[0]);
 for(const next of snapshots.slice(1))state=change(state,next);
 assert.deepEqual(state.present,snapshots[3]);
 for(let i=2;i>=0;i--){state=editorHistory(state,{type:'undo'});assert.deepEqual(state.present,snapshots[i]);}
 assert.equal(editorHistory(state,{type:'undo'}),state,'undo at the beginning is a no-op');
 for(let i=1;i<snapshots.length;i++){state=editorHistory(state,{type:'redo'});assert.deepEqual(state.present,snapshots[i]);}
 assert.equal(editorHistory(state,{type:'redo'}),state,'redo at the end is a no-op');
});

test('a new change after undo clears the abandoned redo branch',()=>{
 const initial=design(),first=design({heroTitle:'First'}),abandoned=design({heroTitle:'Abandoned'}),replacement=design({heroTitle:'Replacement'});
 let state=change(change(createEditorHistory(initial),first),abandoned);
 state=editorHistory(state,{type:'undo'});
 assert.deepEqual(state.future,[abandoned]);
 state=change(state,replacement,{mergeKey:'heroTitle',at:100});
 assert.deepEqual(state.future,[]);
 assert.deepEqual(state.present,replacement);
 assert.equal(editorHistory(state,{type:'redo'}),state);
 assert.deepEqual(editorHistory(state,{type:'undo'}).present,first);
});

test('typing in the same field within 700 ms forms one undo step',()=>{
 const initial=design();
 let state=change(createEditorHistory(initial),design({heroTitle:'A'}),{mergeKey:'heroTitle',at:1000});
 state=change(state,design({heroTitle:'AB'}),{mergeKey:'heroTitle',at:1699});
 assert.equal(state.past.length,1);
 assert.deepEqual(editorHistory(state,{type:'undo'}).present,initial);
 assert.equal(state.present.heroTitle,'AB');
});

test('700 ms boundary and different fields start separate undo steps',()=>{
 let state=change(createEditorHistory(design()),design({heroTitle:'A'}),{mergeKey:'heroTitle',at:1000});
 state=change(state,design({heroTitle:'AB'}),{mergeKey:'heroTitle',at:1700});
 assert.equal(state.past.length,2,'exactly 700 ms does not merge');
 state=change(state,design({heroTitle:'AB',heroSubtitle:'New subtitle'}),{mergeKey:'heroSubtitle',at:1701});
 assert.equal(state.past.length,3,'another field never merges with the title');
 const undo=editorHistory(state,{type:'undo'});
 assert.equal(undo.present.heroTitle,'AB');
 assert.equal(undo.present.heroSubtitle,DEFAULT_DESIGN.heroSubtitle);
});

test('a same-design change creates no history and preserves a redo branch',()=>{
 const initial=design();
 let state=createEditorHistory(initial);
 assert.equal(change(state,structuredClone(initial),{mergeKey:'heroTitle',at:100}),state);
 state=change(state,design({heroTitle:'Changed'}));
 state=editorHistory(state,{type:'undo'});
 const unchanged=change(state,structuredClone(state.present),{mergeKey:'heroTitle',at:200});
 assert.equal(unchanged,state);
 assert.equal(unchanged.future.length,1);
});

test('history retains at most 80 past and future snapshots',()=>{
 let state=createEditorHistory(design({heroTitle:'Version 0'}));
 for(let i=1;i<=105;i++)state=change(state,design({heroTitle:'Version '+i}));
 assert.equal(state.past.length,80);
 assert.equal(state.past[0].heroTitle,'Version 25');
 for(let i=0;i<80;i++)state=editorHistory(state,{type:'undo'});
 assert.equal(state.present.heroTitle,'Version 25');
 assert.equal(state.future.length,80);
 assert.equal(state.past.length,0);
 assert.equal(editorHistory(state,{type:'undo'}),state);
 for(let i=0;i<80;i++)state=editorHistory(state,{type:'redo'});
 assert.equal(state.present.heroTitle,'Version 105');
 assert.equal(state.past.length,80);
 assert.equal(state.future.length,0);
});

test('initial, changed and normalized designs clone caller-owned snapshots',()=>{
 const initial=design({sectionTemplates:{navbar:'minimal'}}),original=structuredClone(initial);
 let state=createEditorHistory(initial);
 initial.sections.reverse();initial.sectionTemplates.navbar='bold';
 assert.deepEqual(state.present,original);
 const next=design({sections:['navbar','products','footer'],sectionTemplates:{hero:'bold'}}),expected=structuredClone(next);
 state=change(state,next);
 next.sections.push('about');next.sectionTemplates.hero='editorial';next.heroTitle='Mutated outside the reducer';
 assert.deepEqual(state.present,expected);
 assert.deepEqual(state.past[0],original);
 const normalized=design({sectionTemplates:{footer:'bold'}}),normalizedExpected=structuredClone(normalized),pastCount=state.past.length;
 state=editorHistory(state,{type:'normalize',design:normalized});
 normalized.sections.length=0;normalized.sectionTemplates.footer='minimal';
 assert.deepEqual(state.present,normalizedExpected);
 assert.equal(state.past.length,pastCount,'server normalization is not an extra user edit');
});

test('leave guard covers saved, unsaved and unpublished design combinations',()=>{
 const live=design(),saved=design({heroTitle:'Saved draft'}),unsaved=design({heroTitle:'Unsaved work'});
 const scenarios=[
  {name:'saved and live match the canvas',current:live,saved:live,live,guard:false},
  {name:'saved draft has unpublished changes',current:saved,saved,live,guard:true},
  {name:'unsaved changes on a published design',current:unsaved,saved:live,live,guard:true},
  {name:'unsaved changes on an unpublished draft',current:unsaved,saved,live,guard:true},
  {name:'canvas reverted to live but differs from saved draft',current:live,saved,live,guard:true},
  {name:'all three match after publication',current:saved,saved,live:saved,guard:false},
 ];
 for(const scenario of scenarios)assert.equal(shouldGuardLeave(scenario.current,scenario.saved,scenario.live),scenario.guard,scenario.name);
});

test('optional preset maps compare by entries, while section array order remains meaningful',()=>{
 const omitted=design();delete omitted.sectionTemplates;
 assert.equal(sameDesign(omitted,design({sectionTemplates:{}})),true);
 const first=design({sectionTemplates:{navbar:'minimal',hero:'bold',footer:'editorial'}});
 const reordered={...design(),sectionTemplates:{footer:'editorial',hero:'bold',navbar:'minimal'}};
 assert.equal(sameDesign(first,reordered),true);
 assert.equal(designKey(first),designKey(reordered));
 assert.equal(shouldGuardLeave(first,reordered,structuredClone(first)),false);
 assert.equal(sameDesign(first,design({sectionTemplates:{...first.sectionTemplates,hero:'minimal'}})),false);
 const changedOrder=structuredClone(first);[changedOrder.sections[1],changedOrder.sections[2]]=[changedOrder.sections[2],changedOrder.sections[1]];
 assert.equal(sameDesign(first,changedOrder),false);
});

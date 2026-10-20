import type {Design} from './types';

function canonical(value:unknown):unknown {if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));return value;}
export function designKey(design:Design){return JSON.stringify(canonical({...design,sectionTemplates:design.sectionTemplates||{}}));}
export function sameDesign(a:Design,b:Design){return designKey(a)===designKey(b);}
export function shouldGuardLeave(current:Design,saved:Design,live:Design){return !sameDesign(current,saved)||!sameDesign(current,live);}
export type EditorHistory={past:Design[];present:Design;future:Design[];mergeKey:string|null;changedAt:number};
export type EditorAction={type:'change';design:Design;mergeKey?:string;at?:number}|{type:'undo'|'redo'}|{type:'normalize';design:Design};
export const createEditorHistory=(design:Design):EditorHistory=>({past:[],present:structuredClone(design),future:[],mergeKey:null,changedAt:0});
export function editorHistory(state:EditorHistory,action:EditorAction):EditorHistory{
 if(action.type==='undo'){if(!state.past.length)return state;return {past:state.past.slice(0,-1),present:state.past[state.past.length-1],future:[state.present,...state.future].slice(0,80),mergeKey:null,changedAt:0};}
 if(action.type==='redo'){if(!state.future.length)return state;return {past:[...state.past,state.present].slice(-80),present:state.future[0],future:state.future.slice(1),mergeKey:null,changedAt:0};}
 if(action.type==='normalize')return {...state,present:structuredClone(action.design),mergeKey:null};
 if(action.type!=='change'||sameDesign(state.present,action.design))return state;
 const at=action.at??Date.now(),merge=!!action.mergeKey&&action.mergeKey===state.mergeKey&&at-state.changedAt<700&&state.future.length===0;
 return {past:merge?state.past:[...state.past,state.present].slice(-80),present:structuredClone(action.design),future:[],mergeKey:action.mergeKey||null,changedAt:at};
}

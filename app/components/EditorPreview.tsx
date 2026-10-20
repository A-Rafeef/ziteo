'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowLeft, Layers3, PackageOpen} from 'lucide-react';
import Link from 'next/link';
import Storefront from './Storefront';
import type {PublicData} from '../types';
import '../storefront.css';

type EditorState={type:'ziteo-editor-state';data:PublicData;page:'home'|'product';productId?:string;selectedSection?:string|null;inspect:boolean};
const sections=new Set(['navbar','hero','products','about','banner','text','contact','footer','product-detail']);

function isEditorState(value:unknown):value is EditorState{
 if(!value||typeof value!=='object')return false;
 const message=value as Partial<EditorState>;
 return message.type==='ziteo-editor-state'&&!!message.data&&typeof message.data==='object'&&!!message.data.store&&typeof message.data.store==='object'&&!!message.data.store.draftDesign&&!!message.data.store.liveDesign&&Array.isArray(message.data.products)&&(message.page==='home'||message.page==='product')&&typeof message.inspect==='boolean'&&(message.productId===undefined||typeof message.productId==='string')&&(message.selectedSection===undefined||message.selectedSection===null||typeof message.selectedSection==='string'&&sections.has(message.selectedSection));
}

function notifyParent(message:{type:'ziteo-editor-ready'}|{type:'ziteo-editor-select';section:string}|{type:'ziteo-editor-product';productId:string}|{type:'ziteo-editor-shortcut';action:'undo'|'redo'|'save'|'escape'}){
 if(window.parent!==window)window.parent.postMessage(message,window.location.origin);
}

export default function EditorPreview(){
 const [state,setState]=useState<EditorState|null>(null);
 const previousSection=useRef<string|null>(null);
 useEffect(()=>{
  document.documentElement.classList.add('ziteo-editor-preview-document');
  const receive=(event:MessageEvent<unknown>)=>{
   if(event.origin!==window.location.origin||event.source!==window.parent)return;
   if(event.data&&typeof event.data==='object'&&'type' in event.data&&event.data.type==='ziteo-editor-connect'){notifyParent({type:'ziteo-editor-ready'});return;}
   if(!isEditorState(event.data))return;
   setState({...event.data,data:{...event.data.data,preview:true}});
  };
  const forwardShortcut=(event:KeyboardEvent)=>{
   if(window.parent===window)return;
   const target=event.target instanceof Element?event.target:null;
   const typing=!!target?.closest('input,textarea,select,[contenteditable="true"]');
   const modified=event.ctrlKey||event.metaKey,key=event.key.toLowerCase();
   let action:'undo'|'redo'|'save'|'escape'|null=null;
   if(event.key==='Escape')action='escape';
   else if(modified&&key==='s')action='save';
   else if(modified&&!typing&&key==='z')action=event.shiftKey?'redo':'undo';
   else if(modified&&!typing&&key==='y')action='redo';
   if(!action)return;
   event.preventDefault();event.stopPropagation();
   notifyParent({type:'ziteo-editor-shortcut',action});
  };
  window.addEventListener('message',receive);
  document.addEventListener('keydown',forwardShortcut);
  notifyParent({type:'ziteo-editor-ready'});
  return()=>{window.removeEventListener('message',receive);document.removeEventListener('keydown',forwardShortcut);document.documentElement.classList.remove('ziteo-editor-preview-document');};
 },[]);
 useEffect(()=>{
  const section=state?.selectedSection||null;
  if(!section||section===previousSection.current)return;
  previousSection.current=section;
  const frame=requestAnimationFrame(()=>document.querySelector<HTMLElement>('[data-sf-section="'+section+'"]')?.scrollIntoView({block:'nearest',behavior:'smooth'}));
  return()=>cancelAnimationFrame(frame);
 },[state?.selectedSection,state?.page,state?.productId]);
 if(!state)return <main className="sf-editor-waiting" aria-busy="true"><Layers3 size={26} strokeWidth={1.4}/><h1>Your website canvas</h1><p>Connecting to your editor…</p><Link href="/#website" target="_top" prefetch={false}><ArrowLeft size={14}/>Return to the website editor</Link></main>;
 const product=state.data.products.find(p=>p.status!=='archived'&&(p.id===state.productId||p.shortId===state.productId));
 if(state.page==='product'&&!product)return <main className="sf-editor-waiting"><PackageOpen size={30} strokeWidth={1.3}/><h1>Choose a product to preview</h1><p>{state.data.products.some(p=>p.status!=='archived')?'Select one of your products in the editor to see its product page.':'Add a product in Products, then return here to style its page.'}</p><Link href="/#products" target="_top" prefetch={false}><ArrowLeft size={14}/>Go to Products</Link></main>;
 return <Storefront key={state.page+':'+(product?.id||'home')} data={state.data} initialProduct={state.page==='product'?product?.id:undefined} editorMode editorPage={state.page} inspect={state.inspect} selectedSection={state.selectedSection} onSectionSelect={section=>notifyParent({type:'ziteo-editor-select',section})} onProductOpen={p=>notifyParent({type:'ziteo-editor-product',productId:p.id})}/>;
}

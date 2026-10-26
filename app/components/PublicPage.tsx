'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Leaf} from 'lucide-react';
import Storefront from './Storefront';
import {type PublicData} from '../types';
import '../storefront.css';
type Props={slug?:string;shortId?:string;preview?:boolean};
export default function PublicPage(props:Props){return <PublicPageRequest key={`${props.slug||''}:${props.shortId||''}:${Boolean(props.preview)}`} {...props}/>;}
function PublicPageRequest({slug,shortId,preview=false}:Props){
 const [data,setData]=useState<PublicData|null>(null);
 const [error,setError]=useState('');
 useEffect(()=>{let mounted=true;const url=preview?'/api/preview':shortId?'/api/public/product/'+encodeURIComponent(shortId):'/api/public/'+encodeURIComponent(slug||'');fetch(url).then(async r=>{const body=await r.json() as PublicData&{error?:string;data?:PublicData};if(!r.ok)throw new Error(body.error||'This store is not available right now.');return body;}).then(body=>{if(mounted)setData(preview?{...(body.data||body),preview:true}:body.data||body);}).catch(e=>{if(mounted)setError(e.message||'This store is not available right now.');});return()=>{mounted=false;};},[slug,shortId,preview]);
 if(error)return <main className="sf-route-state"><Leaf size={34} strokeWidth={1.2}/><h1>{preview?'Preview unavailable':'We’re not quite open.'}</h1><p>{error}</p><Link href={preview?'/#website':'/'}><ArrowLeft size={15}/>{preview?'Back to the website editor':'Go to Ziteo'}</Link></main>;
 if(!data)return <main className="sf-route-state" aria-busy="true"><span className="sf-loading-wheel"/><h1>{preview?'Preparing your preview…':'Something thoughtful is loading…'}</h1><p>{preview?'Bringing your draft design and collection together.':'Just a moment while we bring the collection to you.'}</p></main>;
 return <Storefront data={data} initialProduct={shortId}/>;
}

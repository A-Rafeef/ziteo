'use client';
import {useParams} from 'next/navigation';
import PublicPage from '../../components/PublicPage';
export default function ProductPage(){const params=useParams<{shortId:string}>();return <PublicPage shortId={params.shortId}/>;}

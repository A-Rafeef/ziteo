'use client';
import {useParams} from 'next/navigation';
import PublicPage from '../../components/PublicPage';
export default function StorePage(){const params=useParams<{slug:string}>();return <PublicPage slug={params.slug}/>;}

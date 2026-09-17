'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import Brand from '@/components/Brand';
import ThemeSelect from '@/components/ThemeSelect';
import Composer from '@/components/Composer';
import {AIConnectionButton,aiRequest,useAI} from '@/components/AIConnection';
import {World} from '@/lib/types';
export default function Home(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const router=useRouter(),ai=useAI();
 async function build(prompt:string,attached?:World){setBusy(true);setError('');try{
  const world=prompt?(await aiRequest<{world:World}>('build',{prompt,world:attached??null})).world:attached;
  if(!world)throw new Error('Describe a world or attach a WorldForge JSON layout.');
  sessionStorage.setItem('worldforge.active-world',JSON.stringify(world));router.push('/lab?source=build');return true;
 }catch(e){setError(e instanceof Error?e.message:'Could not build this world.');return false;}finally{setBusy(false);void ai.refresh();}}
 return <main className="entry-page"><header className="topbar"><Link className="brand" href="/"><Brand/></Link><div className="top-right"><AIConnectionButton/><ThemeSelect/></div></header>
 <section className="entry-hero" aria-label="New simulation"><h1 className="sr-only">Build a robot environment</h1><div className="entry-composer"><Composer onBuild={build} busy={busy}/>{error&&<p className="feedback-error" role="alert">{error}</p>}</div></section></main>;
}

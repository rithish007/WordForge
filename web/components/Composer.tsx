'use client';
import Link from 'next/link';
import {useRef,useState} from 'react';
import {World,Report,api} from '@/lib/types';
import {useAI} from './AIConnection';
export default function Composer({onBuild,busy=false,compact=false}:{onBuild:(prompt:string,world?:World)=>Promise<boolean>;busy?:boolean;compact?:boolean}){
 const [prompt,setPrompt]=useState(''),[attachment,setAttachment]=useState<{name:string;world:World}|null>(null),[error,setError]=useState(''),[reading,setReading]=useState(false);
 const input=useRef<HTMLInputElement>(null);const ai=useAI();
 async function attach(file:File){setReading(true);setError('');try{
  if(file.size>1_000_000)throw new Error('Choose a WorldForge JSON file under 1 MB.');
  if(!file.name.toLowerCase().endsWith('.json'))throw new Error('Attach a WorldForge JSON layout. 3D model import is not available yet.');
  const checked=await api<{world:World;report:Report}>('validate',{world:JSON.parse(await file.text())});
  if(!checked.report.valid)throw new Error(checked.report.errors.join(' '));setAttachment({name:file.name,world:checked.world});
 }catch(e){setError(e instanceof Error?e.message:'Could not attach this world.');}finally{setReading(false);}}
 return <form className={'world-composer'+(compact?' compact':'')} onSubmit={async e=>{e.preventDefault();setError('');if(prompt.trim()&&!ai.status.connected){ai.open();return;}if(await onBuild(prompt.trim(),attachment?.world)){setPrompt('');setAttachment(null);}}}>
 <div className="composer-pill"><button type="button" className="attach-button" aria-label="Attach WorldForge JSON" title="Attach WorldForge JSON" disabled={busy||reading} onClick={()=>input.current?.click()}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
 <label className="sr-only" htmlFor={compact?'lab-prompt':'build-prompt'}>{compact?'Describe a world edit':'Describe your environment'}</label>
 <textarea id={compact?'lab-prompt':'build-prompt'} rows={1} maxLength={2000} value={prompt} disabled={busy} onChange={e=>setPrompt(e.target.value)} placeholder={compact?'Describe a change…':'Describe your robot’s environment…'}/>
 <button className="primary build-button" disabled={busy||reading||(!prompt.trim()&&!attachment)}>{busy?'Working…':compact?'Apply':'Build'}<span aria-hidden="true">↑</span></button></div>
 <input ref={input} type="file" accept=".json,application/json" hidden onChange={e=>{const file=e.target.files?.[0];if(file)void attach(file);e.target.value='';}}/>
 <div className="composer-under"><Link className="sample-link" href="/lab?scenario=crossdock">Open sample <span aria-hidden="true">↗</span></Link>{attachment&&<span className="attachment-chip">{attachment.name}<button type="button" aria-label="Remove attachment" disabled={busy} onClick={()=>setAttachment(null)}>×</button></span>}{reading&&<span role="status">Checking file…</span>}</div>
 {error&&<p className="feedback-error" role="alert">{error}</p>}
 </form>;
}

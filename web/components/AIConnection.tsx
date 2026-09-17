'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,ReactNode} from 'react';

type Status={connected:boolean;model:string;daily_limit_usd:number|null;used_usd:number;reservation_usd:number};
const empty:Status={connected:false,model:'gpt-6-astra',daily_limit_usd:null,used_usd:0,reservation_usd:1.2288};
const AIContext=createContext({status:empty,open:()=>{},refresh:async()=>{}});
export async function aiRequest<T>(path:string,body?:unknown):Promise<T>{
 const response=await fetch('/api/ai/'+path,{method:body===undefined?'GET':'POST',headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(90000),cache:'no-store'});
 const data=await response.json();if(!response.ok)throw new Error(typeof data.detail==='string'?data.detail:'AI connection failed.');return data;
}
export function AIProvider({children}:{children:ReactNode}){
 const [status,setStatus]=useState(empty),[opened,setOpened]=useState(false),[key,setKey]=useState(''),[limit,setLimit]=useState('5'),[error,setError]=useState(''),[working,setWorking]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 const refresh=useCallback(async()=>{try{setStatus(await aiRequest<Status>('session'));}catch{setStatus(empty);}},[]);
 useEffect(()=>{void refresh();},[refresh]);
 useEffect(()=>{if(opened)dialog.current?.showModal();else dialog.current?.close();},[opened]);
 function close(){setKey('');setError('');setOpened(false);}
 return <AIContext.Provider value={{status,open:()=>{setOpened(true);void refresh();},refresh}}>{children}
 <dialog ref={dialog} className="ai-dialog" onCancel={close} onClose={close} aria-labelledby="ai-title">
 <div className="dialog-heading"><h2 id="ai-title">Your AI connection</h2><button className="icon-button" aria-label="Close AI settings" onClick={close}>×</button></div>
 <p>Use your own OpenAI API project. AI requests are charged to you; samples and manual editing need no key.</p>
 {status.connected?<><div className="connection-details"><strong>Key connected</strong><span>{status.model} · access checked when you build</span><span>${status.used_usd.toFixed(2)} used/reserved of ${status.daily_limit_usd?.toFixed(2)} today</span></div><button disabled={working} onClick={async()=>{setWorking(true);try{await aiRequest('disconnect',{});await refresh();}catch(e){setError(e instanceof Error?e.message:'Disconnect failed.');}finally{setWorking(false);}}}>Disconnect key</button></>:<form onSubmit={async e=>{e.preventDefault();setError('');setWorking(true);try{await aiRequest('connect',{api_key:key,daily_limit_usd:Number(limit)});setKey('');await refresh();}catch(e){setError(e instanceof Error?e.message:'Connection failed.');}finally{setKey('');setWorking(false);}}}>
 <label>OpenAI API key<input autoComplete="off" type="password" required maxLength={512} value={key} placeholder="sk-…" onChange={e=>setKey(e.target.value)}/></label>
 <label>Daily WorldForge AI limit (USD)<input type="number" min="1.25" max="100" step=".25" required value={limit} onChange={e=>setLimit(e.target.value)}/></label>
 <p className="fine-print">The key stays in server memory and is never saved in browser storage. The connection expires after one hour; expired keys are cleared on the next AI request or server restart. Prompts and world layouts go to OpenAI when you use Build or Apply with AI. ChatGPT subscriptions do not supply API credit.</p>
 <label className="consent"><input type="checkbox" required/> I agree to use my API key and fund requests within this limit.</label>
 <button className="primary" disabled={working}>{working?'Connecting…':'Connect key'}</button>
 </form>}
 <p className="fine-print">Up to ${status.reservation_usd.toFixed(2)} is reserved per request, then adjusted using reported tokens. Uncertain charges stay reserved. This limit covers WorldForge only and resets at midnight UTC. Disconnect does not cancel requests already sent.</p>
 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Get an API key ↗</a>
 {error&&<p className="feedback-error" role="alert">{error}</p>}
 </dialog></AIContext.Provider>;
}
export function useAI(){return useContext(AIContext);}
export function AIConnectionButton(){const ai=useAI();return <button className="ai-connection-button" onClick={ai.open}><span className={ai.status.connected?'connected-dot':'mode-dot'}/>{ai.status.connected?'Your API':'Connect AI'}</button>;}

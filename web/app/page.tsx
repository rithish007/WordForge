'use client';
import Link from 'next/link';
import Brand from '@/components/Brand';
import ThemeSelect from '@/components/ThemeSelect';
import {useState} from 'react';

export default function Home(){
 const [prompt,setPrompt]=useState(''),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState('');
 async function copyBrief(){try{await navigator.clipboard.writeText(prompt);setCopied(true);setCopyError('');}catch{setCopyError('Select your text and copy it to Codex.');}}
 return <main className="entry-page">
  <header className="topbar"><Link className="brand" href="/"><Brand/></Link><ThemeSelect/></header>
  <section className="entry-hero" aria-label="New simulation">
   <h1 className="sr-only">Create a simulation</h1>
   <form className="prompt-card" onSubmit={e=>e.preventDefault()}>
    <label htmlFor="environment-prompt" className="sr-only">Describe your environment and simulation</label>
    <div className="prompt-input">
     <textarea autoFocus rows={2} id="environment-prompt" maxLength={2000} value={prompt} onChange={e=>{setPrompt(e.target.value);setCopied(false);}} placeholder="What would you like to simulate?"/>
     <div className="composer-toolbar">
      <Link className="sample-link" href="/lab?scenario=crossdock">Open sample <span aria-hidden="true">↗</span></Link>
      <div className="composer-actions">{prompt.trim()&&<button type="button" className="copy-brief" onClick={()=>void copyBrief()}>{copied?'Copied':'Copy brief'}</button>}<button className="primary send-button" disabled aria-label="Build world" title="Live AI is not connected" aria-describedby="ai-status"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 10 6-6 6 6M12 4v16"/></svg></button></div>
     </div>
    </div>
    <p className="connection-note" id="ai-status">Live AI is not connected. Open a sample to start.</p>
    <p role="status" className="copy-status">{copyError|| (copied?'Brief copied for Codex.':'')}</p>
   </form>
  </section>
 </main>;
}

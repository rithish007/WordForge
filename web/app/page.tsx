'use client';
import Link from 'next/link';
import {useState} from 'react';
export default function Home(){
 const [prompt,setPrompt]=useState(''),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState('');
 async function copyBrief(){try{await navigator.clipboard.writeText(prompt);setCopied(true);setCopyError('');}catch{setCopyError('Select the text above and copy it to Codex.');}}
 return <main className="entry-page">
 <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">W</span>WorldForge</Link><div className="top-right"><span className="mode-dot"/>Local prototype<Link className="text-link" href="/lab">Open warehouse lab ↗</Link></div></header>
 <section className="entry-hero">
 <span className="entry-kicker">A WORKSPACE FOR ROBOTIC WHAT-IFS</span>
 <h1>What would you like<br/>to <em>simulate?</em></h1>
 <p className="entry-lead">Describe the space. Shape the conditions. See how your robot performs.</p>
 <form className="prompt-card" onSubmit={e=>e.preventDefault()}>
 <label htmlFor="environment-prompt" className="sr-only">Describe your environment and simulation</label>
 <textarea id="environment-prompt" maxLength={2000} value={prompt} onChange={e=>{setPrompt(e.target.value);setCopied(false);}} placeholder="A compact fulfilment warehouse with narrow aisles, storage racks and a delivery route from receiving to packing…"/>
 <div className="prompt-toolbar"><span className="scope-pill">Warehouse AMRs</span><button className="primary" disabled aria-describedby="ai-status">Build with Astra ↗</button></div>
 <div className="connection-note" id="ai-status"><span className="connection-dot"/>Live AI is not connected. You can explore the working local demos below.{prompt.trim()&&<button type="button" onClick={()=>void copyBrief()}>{copied?'Brief copied ✓':'Copy brief for Codex'}</button>}</div>
 {copyError&&<p role="status">{copyError}</p>}
 </form>
 <div className="entry-flow"><span><b>01</b> Describe a world</span><i>→</i><span><b>02</b> Plan a mission</span><i>→</i><span><b>03</b> Test in physics</span></div>
 </section>
 <section className="demo-section"><div className="demo-section-heading"><div><p className="eyebrow">EXPLORE THE LOCAL PROTOTYPE</p><h2>Start with a prepared world</h2></div><span>Sample scenarios · no model call</span></div>
 <div className="scenario-cards">
 {[{id:'crossdock',number:'01',name:'The cross-dock',description:'Receiving to packing. Four storage racks and a clear cross-aisle.',badge:'A clear route',shape:'open'},
 {id:'angled_depot',number:'02',name:'Angled depot',description:'Rotated racks and a central crate put turning clearance to the test.',badge:'Tighter geometry',shape:'angled'},
 {id:'sealed_crossdock',number:'03',name:'Sealed cross-dock',description:'A full-width barrier separates the mission. Find out why planning fails.',badge:'Blocked route',shape:'blocked'}].map(s=><Link className="scenario-card" key={s.id} href={'/lab?scenario='+s.id}><div className={'scenario-diagram '+s.shape} aria-hidden="true"><span className="diagram-rack r1"/><span className="diagram-rack r2"/><span className="diagram-rack r3"/><span className="diagram-rack r4"/><span className="diagram-route"/>{s.shape==='blocked'&&<span className="diagram-barrier"/>}<span className="diagram-start"/><span className="diagram-goal"/></div><div className="scenario-copy"><span className="scenario-number">{s.number} / {s.badge}</span><h3>{s.name}<span>↗</span></h3><p>{s.description}</p></div></Link>)}
 </div>
 </section>
 <footer className="entry-footer"><span>WorldForge · Built with Astra</span><span>Current scope: warehouses, RB-THERON + Boxer, planar physics.</span></footer>
 </main>;
}

'use client';
import Link from 'next/link';
import Brand from '@/components/Brand';
import ThemeSelect from '@/components/ThemeSelect';
import {useState} from 'react';
export default function Home(){
 const [prompt,setPrompt]=useState(''),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState('');
 async function copyBrief(){try{await navigator.clipboard.writeText(prompt);setCopied(true);setCopyError('');}catch{setCopyError('Select the text above and copy it to Codex.');}}
 return <main className="entry-page">
 <header className="topbar"><Link className="brand" href="/"><Brand/></Link><div className="top-right"><ThemeSelect/><span className="prototype-label">Local prototype</span><Link className="text-link" href="/lab">Open warehouse lab ↗</Link></div></header>
 <section className="entry-hero">
 <span className="entry-kicker">WAREHOUSE ROBOT SIMULATION</span>
 <h1>What would you like<br/>to <em>simulate?</em></h1>
 <p className="entry-lead">Describe a warehouse and the robot mission you want to test.</p>
 <form className="prompt-card" onSubmit={e=>e.preventDefault()}>
 <label htmlFor="environment-prompt" className="sr-only">Describe your environment and simulation</label>
 <div className="prompt-input"><textarea rows={1} id="environment-prompt" maxLength={2000} value={prompt} onChange={e=>{setPrompt(e.target.value);setCopied(false);}} placeholder="Describe your warehouse and robot mission…"/>
 <button className="primary" disabled aria-describedby="ai-status">Build world</button></div>
 <div className="connection-note" id="ai-status"><span className="connection-dot"/>Live AI is not connected. You can explore the working local demos below.{prompt.trim()&&<button type="button" onClick={()=>void copyBrief()}>{copied?'Brief copied ✓':'Copy brief for Codex'}</button>}</div>
 {copyError&&<p role="status">{copyError}</p>}
 </form>
 <div className="entry-flow"><span><b>01</b> Describe a world</span><i>→</i><span><b>02</b> Plan a mission</span><i>→</i><span><b>03</b> Test in physics</span></div>
 </section>
 <section className="demo-section"><div className="demo-section-heading"><div><p className="eyebrow">EXPLORE THE LOCAL PROTOTYPE</p><h2>Start with a prepared world</h2></div><span>Ready to explore</span></div>
 <div className="scenario-cards">
 {[{id:'crossdock',number:'01',name:'The cross-dock',description:'Receiving to packing. Four storage racks and a clear cross-aisle.',badge:'A clear route',shape:'open'},
 {id:'angled_depot',number:'02',name:'Angled depot',description:'Rotated racks and a central crate put turning clearance to the test.',badge:'Tighter geometry',shape:'angled'},
 {id:'sealed_crossdock',number:'03',name:'Sealed cross-dock',description:'A full-width barrier separates the mission. Find out why planning fails.',badge:'Blocked route',shape:'blocked'}].map(s=><Link className="scenario-card" key={s.id} href={'/lab?scenario='+s.id}><div className={'scenario-diagram '+s.shape} aria-hidden="true"><span className="diagram-rack r1"/><span className="diagram-rack r2"/><span className="diagram-rack r3"/><span className="diagram-rack r4"/><span className="diagram-route"/>{s.shape==='blocked'&&<span className="diagram-barrier"/>}<span className="diagram-start"/><span className="diagram-goal"/></div><div className="scenario-copy"><span className="scenario-number">{s.number} / {s.badge}</span><h3>{s.name}<span>↗</span></h3><p>{s.description}</p></div></Link>)}
 </div>
 </section>
 <footer className="entry-footer"><span>WorldForge · Built with Astra</span><span>Warehouse missions with RB-THERON and Boxer.</span></footer>
 </main>;
}

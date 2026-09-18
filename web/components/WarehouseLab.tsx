'use client';
import dynamic from 'next/dynamic';
import AppHeader from './AppHeader';
import EditorFrame from './EditorFrame';
import Composer from './Composer';
import {aiRequest,useAI} from './AIConnection';
import {useEffect,useRef,useState} from 'react';
import {api,download,World,WorldObject,Robot,Point,Report,Grid,Route,Result,Frame} from '@/lib/types';
const WorldScene=dynamic(()=>import('@/components/WorldScene'),{ssr:false,loading:()=> <div className="scene-loading">Opening the warehouse…</div>});
type Validation={world:World;report:Report;grid:Grid|null};
export default function WarehouseLab(){
 const [worlds,setWorlds]=useState<World[]>([]),[robots,setRobots]=useState<Robot[]>([]),[world,setWorld]=useState<World|null>(null);
 const [robotId,setRobotId]=useState('rb_theron'),[validation,setValidation]=useState<Validation|null>(null),[history,setHistory]=useState<World[]>([]);
 const [selected,setSelected]=useState<string|null>(null),[draft,setDraft]=useState<WorldObject|null>(null);
 const [start,setStart]=useState<Point>([-8,-6]),[goal,setGoal]=useState<Point>([8,6]),[pick,setPick]=useState<string|null>(null);
 const [route,setRoute]=useState<Route|null>(null),[result,setResult]=useState<Result|null>(null),[operation,setBusy]=useState('Loading warehouse');
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[showGrid,setShowGrid]=useState(false);
 const [time,setTime]=useState(0),[playing,setPlaying]=useState(false),[hasSaved,setHasSaved]=useState(false);
 const [groupBy,setGroupBy]=useState('category');
 const categoryOptions=[...new Set(world?.objects.map(objectCategory)??[])].sort();
 const [consoleTab,setConsoleTab]=useState('chat'),[chatBusy,setChatBusy]=useState(false),[chatReply,setChatReply]=useState(''),[chatPrompt,setChatPrompt]=useState('');
 const ai=useAI();
 const busy=operation||(chatBusy?'Building with AI…':'');
 const input=useRef<HTMLInputElement>(null);const robot=robots.find(r=>r.id===robotId);
 const frames=result?.frames??[],duration=frames.at(-1)?.t??0;
 const frame=interpolate(frames,time);
 useEffect(()=>{let active=true;(async()=>{try{
  const [ws,rs]=await Promise.all([api<World[]>('worlds'),api<Robot[]>('robots')]);
  const query=new URLSearchParams(window.location.search);
  const saved=query.get('source')==='build'?sessionStorage.getItem('worldforge.active-world'):null;
  const initial=saved?JSON.parse(saved):ws.find(w=>w.id===query.get('scenario'))??ws[0];
  const v=await api<Validation>('validate',{world:initial,robot_id:'rb_theron'});
  if(!v.report.valid)throw new Error(v.report.errors.join(' '));
  if(active){setWorlds(ws);setRobots(rs);setWorld(initial);setStart(initial.zones[0]?.center??[-2,-2]);setGoal(initial.zones[1]?.center??[2,2]);setValidation(v);setHasSaved(!!localStorage.getItem('worldforge.world.v1'));}
 }catch(e){if(active)setError('Cannot reach the local simulator. Start scripts/start-demo.ps1, then reload. '+message(e));}
 finally{if(active)setBusy('');}})();return()=>{active=false;};},[]);
 useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setSelected(null);setPick(null);}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[]);
 useEffect(()=>{setDraft(world?.objects.find(o=>o.id===selected)??null);},[selected,world]);
 useEffect(()=>{if(!playing)return;let id:number;let previous=performance.now();
 const tick=(now:number)=>{const elapsed=(now-previous)/1000;previous=now;setTime(t=>{const next=Math.min(duration,t+elapsed);if(next>=duration)setPlaying(false);return next;});id=requestAnimationFrame(tick);};
 id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[playing,duration]);
 function clearRun(){setRoute(null);setResult(null);setTime(0);setPlaying(false);}
 async function apply(candidate:World,label:string,record=true){
  setBusy('Validating world');setError('');setNotice('');
  try{const v=await api<Validation>('validate',{world:candidate,robot_id:robotId});
   if(!v.report.valid)throw new Error(v.report.errors.join(' '));
   if(record&&world)setHistory(h=>[...h.slice(-19),world]);setWorld(v.world);setValidation(v);setSelected(null);setPick(null);clearRun();
   setNotice(label);return true;
  }catch(e){setError(message(e));return false;}finally{setBusy('');}
 }
 async function changeRobot(id:string){if(!world)return;setBusy('Checking clearance');setError('');
  try{const v=await api<Validation>('validate',{world,robot_id:id});setRobotId(id);setValidation(v);clearRun();}
  catch(e){setError(message(e));}finally{setBusy('');}}
 async function mission(run:boolean){if(!world)return;setBusy(run?'Running isolated physics…':'Planning route…');setError('');setNotice('');setPlaying(false);
  try{const req={world,robot_id:robotId,start,goal};
   const data=await api<Result>(run?'run':'plan',req);setRoute(data);setTime(0);
   if(run){setResult(data);setPlaying(!!data.frames?.length);setConsoleTab('results');}else setResult(null);
  }catch(e){setError(message(e));}finally{setBusy('');}}
 async function importFile(file:File){try{if(file.size>1_000_000)throw new Error('World files must be under 1 MB.');await apply(JSON.parse(await file.text()),'WorldSpec imported and validated.');}
 catch(e){setError(message(e));}}
 function selectObject(id:string|null){if(!busy)setSelected(current=>id===current?null:id);}
 function setPoint(p:Point){if(busy)return;setSelected(null);if(pick==='start')setStart(p);if(pick==='goal')setGoal(p);if(pick){clearRun();setPick(null);}}
 async function toggleBarrier(){if(!world)return;const exists=world.objects.some(o=>o.id==='cross_aisle_barrier');
  await apply({...world,objects:exists?world.objects.filter(o=>o.id!=='cross_aisle_barrier'):[...world.objects,{id:'cross_aisle_barrier',label:'Barrier 1',type:'barrier',center:[0,0],footprint:[world.bounds.width,.3],height:1.1,yaw_deg:0,blocking:true}]},exists?'Cross-aisle reopened.':'Barrier added. Check the route to see what changed.');}
 async function buildEdit(prompt:string,attached?:World){
  if(!prompt)return attached?apply(attached,'Attached world loaded.'):false;
  setChatBusy(true);setError('');setChatPrompt(prompt);setChatReply('');
  try{const proposal=await aiRequest<Validation&{summary:string}>('build',{prompt,world:attached??world,robot_id:robotId});
   const changed=await apply(proposal.world,'AI proposal validated and applied.');if(changed)setChatReply(proposal.summary);return changed;
  }catch(e){setError(message(e));return false;}finally{setChatBusy(false);void ai.refresh();}
 }
 return <main className="robot-editor">
 <AppHeader page="Simulation"/>
 <EditorFrame tab={consoleTab} setTab={setConsoleTab} hasResult={!!result} scene={<>
 <div className="section-title"><span>World</span><button className="undo-button" aria-label="Undo last world edit" title="Undo last world edit" disabled={!history.length||!!busy} onClick={async()=>{const prev=history.at(-1);if(prev&&await apply(prev,'Last world edit undone.',false))setHistory(h=>h.slice(0,-1));}}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12" transform="translate(0 -2)"/></svg></button></div>
 <label className="sr-only" htmlFor="world-select">Scenario</label><select id="world-select" disabled={!!busy||!world} value={worlds.some(w=>w.id===world?.id)?world?.id:''} onChange={async e=>{const w=worlds.find(w=>w.id===e.target.value);if(w&&await apply(w,'Scenario loaded.')){setStart(w.zones[0]?.center??[-2,-2]);setGoal(w.zones[1]?.center??[2,2]);}}}><option value="" disabled>Imported world</option>{worlds.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
 {world&&<div className="world-facts"><span>{world.bounds.width} × {world.bounds.length} m</span></div>}
 <details className="inspector-section"><summary>Files</summary><div className="button-row"><button disabled={!!busy} onClick={()=>input.current?.click()}>Import world</button><button disabled={!world||!!busy} onClick={()=>world&&download(world.id+'.json',world)}>Export world</button></div>
 <p className="file-hint">WorldForge JSON layouts only. Import replaces this world; undo restores it.</p>
 <input hidden type="file" ref={input} accept=".json,application/json" onChange={e=>{const f=e.target.files?.[0];if(f)void importFile(f);e.target.value='';}}/>
 <div className="quiet-row"><button disabled={!world||!!busy} onClick={()=>{try{localStorage.setItem('worldforge.world.v1',JSON.stringify(world));setHasSaved(true);setNotice('World saved in this browser.');}catch(e){setError(message(e));}}}>Save locally</button><button disabled={!hasSaved||!!busy} onClick={()=>{try{const saved=localStorage.getItem('worldforge.world.v1');if(saved)void apply(JSON.parse(saved),'Saved world restored.');}catch(e){setError(message(e));}}}>Load saved</button></div>
 </details> <details className="inspector-section objects-section" open><summary>Objects <span>{world?.objects.length??'—'}</span></summary>
 <label className="field-label" htmlFor="object-grouping">Group objects</label><select id="object-grouping" value={groupBy} onChange={e=>setGroupBy(e.target.value)}><option value="none">No grouping</option><option value="category">By category</option><option value="type">By object type</option></select>
 <div className="objects">{(groupBy==='none'?[null]:[...new Set(world?.objects.map(o=>groupBy==='category'?objectCategory(o):o.type)??[])]).map(group=>{const objects=world?.objects.filter(o=>group===null||(groupBy==='category'?objectCategory(o):o.type)===group)??[];const rows=objects.map(o=><button key={o.id} className={'object-row '+(selected===o.id?'selected':'')} aria-pressed={selected===o.id} disabled={!!busy} onClick={()=>selectObject(o.id)}><span className={'object-dot '+o.type}/><span>{o.label}</span></button>);return group===null?<div key="ungrouped">{rows}</div>:<details className="object-group" key={group} open><summary>{groupBy==='type'?(categoryNames[group]??group.replaceAll('_',' ')):group} <span>{objects.length}</span></summary>{rows}</details>;})}</div>
 <button className="wide subtle" disabled={!world||!!busy} onClick={()=>void toggleBarrier()}>{world?.objects.some(o=>o.id==='cross_aisle_barrier')?'− Remove cross-aisle barrier':'+ Block the cross-aisle'}</button>
 </details></>} inspector={<>
<div className="section-title space-top"><span>Robot</span></div>
 <label className="sr-only" htmlFor="robot-select">Robot platform</label><select id="robot-select" disabled={!!busy} value={robotId} onChange={e=>void changeRobot(e.target.value)}>{robots.map(r=><option key={r.id} value={r.id}>{r.manufacturer} {r.name}</option>)}</select>
 {robot&&<details className="inspector-section robot-details"><summary>Specifications</summary><div className="robot-card"><div className="robot-glyph"><span/></div><div><strong>{robot.name}</strong><p>{robot.footprint.map(v=>(v*1000).toFixed(0)).join(' × ')} mm · {robot.mass} kg</p></div></div><p className="fine-print"><a href={robot.datasheet_url} target="_blank" rel="noreferrer">Manufacturer dimensions ↗</a><br/>Turn limit: 1 rad/s (simulation estimate).</p></details>}
<div className="section-title space-top"><span>Mission</span></div> <div className="mission-bar"><button className={'point-button '+(pick==='start'?'active':'')} disabled={!!busy} onClick={()=>setPick(pick==='start'?null:'start')}><span className="point-letter">A</span><span>Start <b>{start.join(', ')}</b></span></button><span className="route-arrow">→</span><button className={'point-button '+(pick==='goal'?'active':'')} disabled={!!busy} onClick={()=>setPick(pick==='goal'?null:'goal')}><span className="point-letter orange">B</span><span>Goal <b>{goal.join(', ')}</b></span></button></div> {draft&&<form className="edit-panel" onSubmit={e=>{e.preventDefault();if(world)void apply({...world,objects:world.objects.map(o=>o.id===draft.id?draft:o)},'Object updated.');}}><div className="editor-heading"><strong>{draft.label}</strong><button type="button" className="undo-button" aria-label="Deselect object" title="Deselect object (Esc)" onClick={()=>setSelected(null)}>×</button></div><label className="field-label object-name">Name<input type="text" maxLength={100} required value={draft.label} onChange={e=>setDraft({...draft,label:e.target.value})}/></label><label className="field-label object-name">Category<input type="text" list="object-categories" maxLength={40} value={draft.category??''} placeholder={categoryNames[draft.type]??draft.type} onChange={e=>setDraft({...draft,category:e.target.value})}/></label><datalist id="object-categories">{categoryOptions.map(category=><option key={category} value={category}/>)}</datalist><div className="edit-grid">{(['x','y','width','depth','height','yaw'] as const).map((key,i)=><label key={key}>{key}{i===5?' (°)':' (m)'}<input type="number" step=".1" required value={i<2?draft.center[i]:i<4?draft.footprint[i-2]:i===4?draft.height:draft.yaw_deg} onChange={e=>{const v=Number(e.target.value);const d=structuredClone(draft);if(i<2)d.center[i]=v;else if(i<4)d.footprint[i-2]=v;else if(i===4)d.height=v;else d.yaw_deg=v;setDraft(d);}}/></label>)}</div><div className="button-row"><button type="submit" disabled={!!busy}>Apply edit</button><button type="button" disabled={!!busy} onClick={()=>world&&void apply({...world,objects:world.objects.filter(o=>o.id!==draft.id)},'Object removed.')}>Remove</button></div></form>}{!draft&&<div className="inspector-empty"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m5 3 14 9-7 1-3 7Z"/></svg><p>Select an object to inspect</p></div>}
 </>} viewport={<><div className="viewport-toolbar"> <div className="lab-heading"><div><h1>{world?.name??'Warehouse lab'}</h1></div><div className={'validation-pill '+(validation?.report.navigable?'good':'')}><span/>{validation?validation.report.navigable?'Navigable':'Check route':'Connecting…'}</div></div>
<div className="mission-actions"><button disabled={!world||!!busy} onClick={()=>void mission(false)}>Plan route</button><button className="primary" disabled={!world||!!busy} onClick={()=>void mission(true)}>▶ Run</button></div></div> <div className="viewport">
 {world&&robot?<WorldScene world={world} robot={robot} start={start} goal={goal} path={route?.path??[]} trail={frames.filter(f=>f.t<=time).map(f=>[f.pose[0],f.pose[1]] as Point)} frame={frame} selected={selected} onSelect={selectObject} onFloor={setPoint} grid={validation?.grid??null} showGrid={showGrid} pickMode={pick}/>:<div className="scene-loading">{error?'Local simulator is offline.':'Loading your workspace…'}</div>}
 <div className="viewport-top"><span className="viewport-chip">Planar MuJoCo physics</span><label className="overlay-toggle"><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/> Clearance map</label></div>
 <div className="viewport-bottom"><span>{pick?'Click the floor to place '+pick:'Drag to orbit · Scroll to zoom'}</span><span>1 grid square = 1 m</span></div>
 {busy&&<div className="busy-indicator" role="status"><span className="spinner"/>{busy}</div>}
 </div>
 {(route?.path?.length||showGrid)?<div className="scene-legend">{!!route?.path?.length&&<><span className="legend-line planned"/>Planned{frames.length>0&&<><span className="legend-line travelled"/>Recorded</>}</>}{showGrid&&<details className="clearance-help"><summary>About clearance</summary><p>Shading includes the robot radius, margin and grid rounding. Body/ring overlap does not indicate contact.</p></details>}</div>:null}
 <div aria-live="polite" className="feedback">{error&&<p className="feedback-error">{error}</p>}{notice&&<p>{notice}</p>}{validation?.report.warnings.map(w=><p className="feedback-warning" key={w}>{w}</p>)}{route&&<p className={route.status==='SUCCESS'?'feedback-success':'feedback-warning'}><strong>{route.status.replaceAll('_',' ')}</strong> · {route.message}</p>}</div>
</>} console={consoleTab==='chat'?<div className="chat-workspace"><div className="chat-history" aria-live="polite">{chatPrompt&&<p className="user-message">{chatPrompt}</p>}{chatReply?<p>{chatReply}</p>:!chatPrompt&&<p className="chat-placeholder">{ai.status.connected?'Describe an environment or a change to this world.':'Connect your API to build and edit with AI.'}</p>}{chatBusy&&<p role="status">Creating a validated proposal…</p>}</div><Composer compact onBuild={buildEdit} busy={!!busy}/></div>:<>
 {result?.metrics?<section className="results"><div className="results-heading"><h2>Results</h2><button onClick={clearRun}>Reset</button></div>
 <div className="metrics">{[{label:'Time',value:result?.metrics?.simulation_time_s,unit:'s'},{label:'Distance',value:result?.metrics?.distance_m,unit:'m'},{label:'Contacts',value:result?.metrics?.collision_count,unit:'',integer:true},{label:'Min. clearance',value:result?.metrics?.minimum_clearance_m,unit:'m'}].map(m=><div key={m.label}><span>{m.label}</span><strong>{m.value===undefined?'—':m.value.toFixed(m.integer?0:2)}<small>{m.unit}</small></strong></div>)}</div>
 {frames.length>0?<div className="playback"><button onClick={()=>{if(time>=duration)setTime(0);setPlaying(!playing);}}>{playing?'Ⅱ Pause replay':'▶ Replay'}</button><input aria-label="Simulation playback time" type="range" min="0" max={duration} step=".05" value={time} onChange={e=>{setPlaying(false);setTime(Number(e.target.value));}}/><span>{time.toFixed(1)} / {duration.toFixed(1)} s</span><button onClick={()=>download('worldforge-run-'+(result?.run_id??'local')+'.json',result)}>Export run JSON</button></div>:<p className="results-empty">Plan a route, then run the robot to measure time, distance and clearance.</p>}
 <details className="result-foot fine-print"><summary>Measurement details</summary><p>Conservative clearance around the robot’s full turning envelope. Velocity-controlled planar body; wheel dynamics are not modelled.</p></details>
 </section>:<div className="console-empty"><strong>No measurements yet</strong><p>Plan a mission, then run the robot.</p></div>}</>}/>
 </main>;
}
function message(e:unknown){return e instanceof Error?e.message:'Something went wrong. Please try again.';}
function interpolate(frames:Frame[],t:number):Frame|undefined{if(!frames.length)return;const idx=Math.min(frames.length-1,Math.max(0,Math.floor(t*20)));let i=idx;while(i>0&&frames[i].t>t)i--;while(i<frames.length-1&&frames[i+1].t<=t)i++;const a=frames[i],b=frames[Math.min(i+1,frames.length-1)];const f=b.t===a.t?0:Math.min(1,(t-a.t)/(b.t-a.t));return {...a,pose:a.pose.map((v,k)=>v+(b.pose[k]-v)*f) as Frame['pose']};}

const categoryNames:Record<string,string>={rack:'Racks',pallet:'Pallets',crate:'Crates',barrier:'Barriers',pillar:'Pillars',charger:'Chargers',packing_station:'Packing stations',door_frame:'Door frames'};

function objectCategory(object:WorldObject){return object.category?.trim()||categoryNames[object.type]||object.type.replaceAll("_"," ");}

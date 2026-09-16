'use client';
import dynamic from 'next/dynamic';
import Brand from './Brand';
import ThemeSelect from './ThemeSelect';
import {useEffect,useRef,useState} from 'react';
import {api,download,World,WorldObject,Robot,Point,Report,Grid,Route,Result,Frame} from '@/lib/types';
const WorldScene=dynamic(()=>import('@/components/WorldScene'),{ssr:false,loading:()=> <div className="scene-loading">Opening the warehouse…</div>});
type Validation={world:World;report:Report;grid:Grid|null};
export default function WarehouseLab(){
 const [worlds,setWorlds]=useState<World[]>([]),[robots,setRobots]=useState<Robot[]>([]),[world,setWorld]=useState<World|null>(null);
 const [robotId,setRobotId]=useState('rb_theron'),[validation,setValidation]=useState<Validation|null>(null),[history,setHistory]=useState<World[]>([]);
 const [selected,setSelected]=useState<string|null>(null),[draft,setDraft]=useState<WorldObject|null>(null);
 const [start,setStart]=useState<Point>([-8,-6]),[goal,setGoal]=useState<Point>([8,6]),[pick,setPick]=useState<string|null>(null);
 const [route,setRoute]=useState<Route|null>(null),[result,setResult]=useState<Result|null>(null),[busy,setBusy]=useState('Loading warehouse');
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[showGrid,setShowGrid]=useState(false);
 const [time,setTime]=useState(0),[playing,setPlaying]=useState(false),[hasSaved,setHasSaved]=useState(false);
 const [groupBy,setGroupBy]=useState('type');
 const input=useRef<HTMLInputElement>(null);const robot=robots.find(r=>r.id===robotId);
 const frames=result?.frames??[],duration=frames.at(-1)?.t??0;
 const frame=interpolate(frames,time);
 useEffect(()=>{let active=true;(async()=>{try{
  const [ws,rs]=await Promise.all([api<World[]>('worlds'),api<Robot[]>('robots')]);
  const initial=ws.find(w=>w.id===new URLSearchParams(window.location.search).get('scenario'))??ws[0];
  const v=await api<Validation>('validate',{world:initial,robot_id:'rb_theron'});
  if(active){setWorlds(ws);setRobots(rs);setWorld(initial);setStart(initial.zones[0]?.center??[-2,-2]);setGoal(initial.zones[1]?.center??[2,2]);setValidation(v);setHasSaved(!!localStorage.getItem('worldforge.world.v1'));}
 }catch(e){if(active)setError('Cannot reach the local simulator. Start scripts/start-demo.ps1, then reload. '+message(e));}
 finally{if(active)setBusy('');}})();return()=>{active=false;};},[]);
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
   if(run){setResult(data);setPlaying(!!data.frames?.length);}else setResult(null);
  }catch(e){setError(message(e));}finally{setBusy('');}}
 async function importFile(file:File){try{if(file.size>1_000_000)throw new Error('World files must be under 1 MB.');await apply(JSON.parse(await file.text()),'WorldSpec imported and validated.');}
 catch(e){setError(message(e));}}
 function setPoint(p:Point){if(pick==='start')setStart(p);if(pick==='goal')setGoal(p);if(pick){clearRun();setPick(null);}}
 async function toggleBarrier(){if(!world)return;const exists=world.objects.some(o=>o.id==='cross_aisle_barrier');
  await apply({...world,objects:exists?world.objects.filter(o=>o.id!=='cross_aisle_barrier'):[...world.objects,{id:'cross_aisle_barrier',label:'Barrier 1',type:'barrier',center:[0,0],footprint:[world.bounds.width,.3],height:1.1,yaw_deg:0,blocking:true}]},exists?'Cross-aisle reopened.':'Barrier added. Check the route to see what changed.');}
 return <main>
 <header className="topbar"><a className="brand" href="/"><Brand/><span className="brand-divider">/</span><span className="brand-sub">Warehouse lab</span></a><div className="top-right"><ThemeSelect/><span className="prototype-label">Local prototype</span> <a href="https://worldforge-nine.vercel.app/" target="_blank" rel="noreferrer" className="text-link">Project page ↗</a></div></header>
 <div className="workspace">
 <aside className="sidebar">
 <div className="section-title"><span>01 / WORLD</span><span className="small-tag">METRES</span></div>
 <label className="field-label" htmlFor="world-select">Scenario</label><select id="world-select" disabled={!!busy||!world} value={worlds.some(w=>w.id===world?.id)?world?.id:''} onChange={async e=>{const w=worlds.find(w=>w.id===e.target.value);if(w&&await apply(w,'Scenario loaded.')){setStart(w.zones[0]?.center??[-2,-2]);setGoal(w.zones[1]?.center??[2,2]);}}}><option value="" disabled>Imported world</option>{worlds.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
 {world&&<div className="world-facts"><span>{world.bounds.width} × {world.bounds.length} m</span><span>{world.objects.length} objects</span></div>}
 <div className="button-row"><button disabled={!!busy} onClick={()=>input.current?.click()}>Import world</button><button disabled={!world||!!busy} onClick={()=>world&&download(world.id+'.json',world)}>Export world</button></div>
 <p className="file-hint">WorldForge JSON layouts only. Import replaces this world; undo restores it.</p>
 <input hidden type="file" ref={input} accept=".json,application/json" onChange={e=>{const f=e.target.files?.[0];if(f)void importFile(f);e.target.value='';}}/>
 <div className="quiet-row"><button disabled={!world||!!busy} onClick={()=>{try{localStorage.setItem('worldforge.world.v1',JSON.stringify(world));setHasSaved(true);setNotice('World saved in this browser.');}catch(e){setError(message(e));}}}>Save locally</button><button disabled={!hasSaved||!!busy} onClick={()=>{try{const saved=localStorage.getItem('worldforge.world.v1');if(saved)void apply(JSON.parse(saved),'Saved world restored.');}catch(e){setError(message(e));}}}>Load saved</button><button className="undo-button" aria-label="Undo last world edit" title="Undo last world edit" disabled={!history.length||!!busy} onClick={async()=>{const prev=history.at(-1);if(prev&&await apply(prev,'Last world edit undone.',false))setHistory(h=>h.slice(0,-1));}}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12" transform="translate(0 -2)"/></svg></button></div>
 <div className="section-title space-top"><span>02 / ROBOT</span><span className="small-tag">AMR</span></div>
 <label className="field-label" htmlFor="robot-select">Platform</label><select id="robot-select" disabled={!!busy} value={robotId} onChange={e=>void changeRobot(e.target.value)}>{robots.map(r=><option key={r.id} value={r.id}>{r.manufacturer} {r.name}</option>)}</select>
 {robot&&<><div className="robot-card"><div className="robot-glyph"><span/></div><div><strong>{robot.name}</strong><p>{robot.footprint.map(v=>(v*1000).toFixed(0)).join(' × ')} mm · {robot.mass} kg</p></div></div><p className="fine-print"><a href={robot.datasheet_url} target="_blank" rel="noreferrer">Manufacturer dimensions ↗</a><br/>Turn limit: 1 rad/s (simulation estimate).</p></>}
 <div className="section-title space-top"><span>03 / SCENE OBJECTS</span><span>{world?.objects.length??'—'}</span></div>
 <label className="field-label" htmlFor="object-grouping">Group objects</label><select id="object-grouping" value={groupBy} onChange={e=>setGroupBy(e.target.value)}><option value="none">No grouping</option><option value="type">By category</option></select>
 <div className="objects">{(groupBy==='type'?[...new Set(world?.objects.map(o=>o.type)??[])]:['all']).map(type=>{const objects=world?.objects.filter(o=>type==='all'||o.type===type)??[];const rows=objects.map(o=><button key={o.id} className={'object-row '+(selected===o.id?'selected':'')} aria-pressed={selected===o.id} disabled={!!busy} onClick={()=>setSelected(o.id)}><span className={'object-dot '+o.type}/><span>{o.label}</span></button>);return type==='all'?<div key={type}>{rows}</div>:<details className="object-group" key={type} open><summary>{categoryNames[type]??type.replaceAll('_',' ')} <span>{objects.length}</span></summary>{rows}</details>;})}</div>
 <button className="wide subtle" disabled={!world||!!busy} onClick={()=>void toggleBarrier()}>{world?.objects.some(o=>o.id==='cross_aisle_barrier')?'− Remove cross-aisle barrier':'+ Block the cross-aisle'}</button>
 {draft&&<form className="edit-panel" onSubmit={e=>{e.preventDefault();if(world)void apply({...world,objects:world.objects.map(o=>o.id===draft.id?draft:o)},'Object updated.');}}><strong>Edit {draft.label}</strong><label className="field-label object-name">Name<input type="text" maxLength={100} required value={draft.label} onChange={e=>setDraft({...draft,label:e.target.value})}/></label><div className="edit-grid">{(['x','y','width','depth','height','yaw'] as const).map((key,i)=><label key={key}>{key}{i===5?' (°)':' (m)'}<input type="number" step=".1" required value={i<2?draft.center[i]:i<4?draft.footprint[i-2]:i===4?draft.height:draft.yaw_deg} onChange={e=>{const v=Number(e.target.value);const d=structuredClone(draft);if(i<2)d.center[i]=v;else if(i<4)d.footprint[i-2]=v;else if(i===4)d.height=v;else d.yaw_deg=v;setDraft(d);}}/></label>)}</div><div className="button-row"><button type="submit" disabled={!!busy}>Apply edit</button><button type="button" disabled={!!busy} onClick={()=>world&&void apply({...world,objects:world.objects.filter(o=>o.id!==draft.id)},'Object removed.')}>Remove</button></div></form>}
 <div className="sidebar-foot">Load a sample or import a saved world.<br/>Live in-app AI is not connected.</div>
 </aside>
 <section className="lab">
 <div className="lab-heading"><div><p className="eyebrow">SIMULATE BEFORE YOU DEPLOY</p><h1>{world?.name??'Warehouse lab'}</h1></div><div className={'validation-pill '+(validation?.report.navigable?'good':'')}><span/>{validation?validation.report.navigable?'Navigable world':'Check reachability':'Connecting…'}</div></div>
 <div className="viewport">
 {world&&robot?<WorldScene world={world} robot={robot} start={start} goal={goal} path={route?.path??[]} trail={frames.filter(f=>f.t<=time).map(f=>[f.pose[0],f.pose[1]] as Point)} frame={frame} selected={selected} onSelect={setSelected} onFloor={setPoint} grid={validation?.grid??null} showGrid={showGrid} pickMode={pick}/>:<div className="scene-loading">{error?'Local simulator is offline.':'Loading your workspace…'}</div>}
 <div className="viewport-top"><span className="viewport-chip">3D VIEW</span><label className="overlay-toggle"><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/> Planner clearance map</label></div>
 <div className="viewport-bottom"><span>{pick?'Click the floor to place '+pick:'Drag to orbit · Scroll to zoom · Click an object to edit'}</span><span>1 grid square = 1 m</span></div>
 {busy&&<div className="busy-indicator" role="status"><span className="spinner"/>{busy}</div>}
 </div>
 <p className="scene-legend"><span className="legend-line planned"/> Planned centre route <span className="legend-line travelled"/> Recorded centre trajectory{showGrid&&<span className="clearance-help">Shading includes the robot radius, margin and grid rounding for route planning. Body/ring overlap is expected; it does not indicate contact.</span>}</p>
 <div className="mission-bar"><div className="mission-title"><span className="section-kicker">MISSION</span><strong>A → B</strong></div><button className={'point-button '+(pick==='start'?'active':'')} disabled={!!busy} onClick={()=>setPick(pick==='start'?null:'start')}><span className="point-letter">A</span><span>Start <b>{start.join(', ')}</b></span></button><span className="route-arrow">→</span><button className={'point-button '+(pick==='goal'?'active':'')} disabled={!!busy} onClick={()=>setPick(pick==='goal'?null:'goal')}><span className="point-letter orange">B</span><span>Goal <b>{goal.join(', ')}</b></span></button><div className="mission-actions"><button disabled={!world||!!busy} onClick={()=>void mission(false)}>Plan route</button><button className="primary" disabled={!world||!!busy} onClick={()=>void mission(true)}>▶ Run simulation</button></div></div>
 <div aria-live="polite" className="feedback">{error&&<p className="feedback-error">{error}</p>}{notice&&<p>{notice}</p>}{validation?.report.warnings.map(w=><p className="feedback-warning" key={w}>{w}</p>)}{route&&<p className={route.status==='SUCCESS'?'feedback-success':'feedback-warning'}><strong>{route.status.replaceAll('_',' ')}</strong> · {route.message}</p>}</div>
 <section className="results"><div className="results-heading"><div><span className="section-kicker">RUN RESULTS</span><h2>{result?.metrics?'Simulation results':'No run yet'}</h2></div><span className="physics-label">Planar MuJoCo physics</span></div>
 <div className="metrics">{[{label:'Simulation time',value:result?.metrics?.simulation_time_s,unit:'s'},{label:'Distance travelled',value:result?.metrics?.distance_m,unit:'m'},{label:'Obstacle contacts',value:result?.metrics?.collision_count,unit:'',integer:true},{label:'Minimum clearance¹',value:result?.metrics?.minimum_clearance_m,unit:'m'}].map(m=><div key={m.label}><span>{m.label}</span><strong>{m.value===undefined?'—':m.value.toFixed(m.integer?0:2)}<small>{m.unit}</small></strong></div>)}</div>
 {frames.length>0?<div className="playback"><button onClick={()=>{if(time>=duration)setTime(0);setPlaying(!playing);}}>{playing?'Ⅱ Pause replay':'▶ Replay'}</button><input aria-label="Simulation playback time" type="range" min="0" max={duration} step=".05" value={time} onChange={e=>{setPlaying(false);setTime(Number(e.target.value));}}/><span>{time.toFixed(1)} / {duration.toFixed(1)} s</span><button onClick={()=>download('worldforge-run-'+(result?.run_id??'local')+'.json',result)}>Export run JSON</button></div>:<p className="results-empty">Plan a route, then run the robot to measure time, distance and clearance.</p>}
 <p className="fine-print result-foot">¹ Conservative clearance around the robot’s full turning envelope. Velocity-controlled planar body; wheel dynamics are not modelled.</p>
 </section>
 </section></div>
 </main>;
}
function message(e:unknown){return e instanceof Error?e.message:'Something went wrong. Please try again.';}
function interpolate(frames:Frame[],t:number):Frame|undefined{if(!frames.length)return;const idx=Math.min(frames.length-1,Math.max(0,Math.floor(t*20)));let i=idx;while(i>0&&frames[i].t>t)i--;while(i<frames.length-1&&frames[i+1].t<=t)i++;const a=frames[i],b=frames[Math.min(i+1,frames.length-1)];const f=b.t===a.t?0:Math.min(1,(t-a.t)/(b.t-a.t));return {...a,pose:a.pose.map((v,k)=>v+(b.pose[k]-v)*f) as Frame['pose']};}

const categoryNames:Record<string,string>={rack:'Racks',pallet:'Pallets',crate:'Crates',barrier:'Barriers',pillar:'Pillars',charger:'Chargers',packing_station:'Packing stations',door_frame:'Door frames'};

'use client';
import {Canvas,ThreeEvent} from '@react-three/fiber';
import {OrbitControls,Line,Html,Edges} from '@react-three/drei';
import {useMemo,useRef,useLayoutEffect} from 'react';
import * as THREE from 'three';
import type {World,Robot,Point,Frame,Grid} from '@/lib/types';
import {WORLD_ROTATION,objectMesh,wallMeshes} from '@/lib/geometry';
import {ObjectVisual,RobotVisual} from './SceneAssets';
import {useSystemDark,sceneThemes} from '@/lib/theme';

type Props={world:World;robot:Robot;start:Point;goal:Point;path:Point[];trail:Point[];frame?:Frame;selected:string|null;onSelect:(id:string|null)=>void;onFloor:(point:Point)=>void;grid:Grid|null;showGrid:boolean;pickMode:string|null};
function ClearanceGrid({grid}:{grid:Grid}){
 const ref=useRef<THREE.InstancedMesh>(null);
 useLayoutEffect(()=>{const matrix=new THREE.Matrix4();grid.occupied_runs.forEach(([y,a,b],i)=>{
 matrix.compose(new THREE.Vector3(grid.origin[0]+(a+b)/2*grid.resolution,grid.origin[1]+(y+.5)*grid.resolution,.025),new THREE.Quaternion(),new THREE.Vector3((b-a)*grid.resolution,grid.resolution,1));ref.current?.setMatrixAt(i,matrix);
 });if(ref.current)ref.current.instanceMatrix.needsUpdate=true;},[grid]);
 return <instancedMesh ref={ref} args={[undefined,undefined,grid.occupied_runs.length]}><planeGeometry/><meshBasicMaterial color="#ec764b" transparent opacity={.25} depthWrite={false}/></instancedMesh>;
}
function RobotBody({robot,pose}:{robot:Robot;pose:[number,number,number]}){
 return <group position={[pose[0],pose[1],0]} rotation={[0,0,pose[2]]}>
  <mesh position={[0,0,.028]}><ringGeometry args={[robot.collision_radius+robot.safety_margin-.015,robot.collision_radius+robot.safety_margin,48]}/><meshBasicMaterial color="#d65327" transparent opacity={.55}/></mesh>
  <RobotVisual robot={robot}/>
 </group>;
}
export default function WorldScene(p:Props){
 const theme=sceneThemes[useSystemDark()?'dark':'light'];
 const root=useRef<THREE.Group>(null);
 const floorLines=useMemo(()=>{const lines:Point[][]=[];const w=p.world.bounds.width/2,l=p.world.bounds.length/2;
 for(let x=Math.ceil(-w);x<=w;x++)lines.push([[x,-l],[x,l]]);
 for(let y=Math.ceil(-l);y<=l;y++)lines.push([[-w,y],[w,y]]);return lines;},[p.world.bounds]);
 const pick=(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();if(e.delta>2)return;const local=root.current!.worldToLocal(e.point.clone());p.onFloor([Math.round(local.x*10)/10,Math.round(local.y*10)/10]);};
 const pose=p.frame?.pose??[...p.start,0] as [number,number,number];
 return <Canvas onPointerMissed={()=>p.onSelect(null)} shadows={{type:THREE.PCFShadowMap}} camera={{position:[18,22,22],fov:42,near:.1,far:150}} gl={{antialias:true}}><color attach="background" args={[theme.background]}/><ambientLight intensity={theme.ambient}/><directionalLight position={[8,20,5]} intensity={theme.sun} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18}/>
 <OrbitControls makeDefault target={[0,0,0]} minDistance={7} maxDistance={65} maxPolarAngle={Math.PI/2.12} enableDamping/>
 {/* Single world XY/+Z-up to Three Y-up conversion. Pointer picking uses its inverse. */}
 <group ref={root} rotation={WORLD_ROTATION}>
 <mesh receiveShadow onClick={pick}><planeGeometry args={[p.world.bounds.width,p.world.bounds.length]}/><meshStandardMaterial color={theme.floor} roughness={.95}/></mesh>
 {floorLines.map((line,i)=><Line key={i} points={line.map(([x,y])=>[x,y,.012])} color={theme.grid} lineWidth={.6}/>)}
 <Line points={[[-p.world.bounds.width/2,-p.world.bounds.length/2,.02],[p.world.bounds.width/2,-p.world.bounds.length/2,.02],[p.world.bounds.width/2,p.world.bounds.length/2,.02],[-p.world.bounds.width/2,p.world.bounds.length/2,.02],[-p.world.bounds.width/2,-p.world.bounds.length/2,.02]]} color={theme.boundary} lineWidth={2}/>
 {p.showGrid&&p.grid&&<ClearanceGrid grid={p.grid}/>}
 {wallMeshes(p.world).map(w=><mesh key={w.id} position={w.position}><boxGeometry args={w.size}/><meshStandardMaterial color={theme.walls} transparent opacity={.28}/><Edges color={theme.walls}/></mesh>)}
 {p.world.zones.map(z=><group key={z.id} position={[...z.center,.035]} rotation={[0,0,z.yaw_deg*Math.PI/180]}><mesh onClick={pick}><planeGeometry args={z.extent}/><meshBasicMaterial color={z.type==='receiving'?'#79af96':'#eaba8b'} transparent opacity={.35}/></mesh><Html center position={[0,0,.05]} style={{pointerEvents:'none'}}><span className="zone-label">{z.label}</span></Html></group>)}
 {p.world.objects.map(o=><group key={o.id} position={objectMesh(o).position} rotation={objectMesh(o).rotation} onClick={e=>{e.stopPropagation();if(e.delta<=2&&!p.pickMode)p.onSelect(o.id);}}>
 <mesh><boxGeometry args={objectMesh(o).size}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/></mesh>
 <ObjectVisual object={o} selected={p.selected===o.id}/>
 </group>)}
 {p.path.length>1&&<Line points={p.path.map(([x,y])=>[x,y,.08])} color="#e56e36" lineWidth={4}/>}
 {p.trail.length>1&&<Line points={p.trail.map(([x,y])=>[x,y,.09])} color="#549cdd" lineWidth={2.5} dashed dashSize={.18} gapSize={.10}/>}
 {[{point:p.start,label:'A',color:'#27664d'},{point:p.goal,label:'B',color:'#c55229'}].map(m=><group key={m.label} position={[...m.point,.06]}><mesh onClick={pick}><ringGeometry args={[.31,.38,48]}/><meshBasicMaterial color={m.color}/></mesh><Html center position={[0,0,.65]} style={{pointerEvents:'none'}}><span className="pin" style={{background:m.color}}>{m.label}</span></Html></group>)}
 <RobotBody robot={p.robot} pose={pose}/>
 <Line points={[[0,0,.03],[1,0,.03]]} color="#bd5640" lineWidth={2}/><Line points={[[0,0,.03],[0,1,.03]]} color="#39765e" lineWidth={2}/>
 </group></Canvas>;
}

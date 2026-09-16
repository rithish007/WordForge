'use client';
import {Edges} from '@react-three/drei';
import type {WorldObject,Robot} from '@/lib/types';
type V3=[number,number,number];
function Box({size,at,color,metal=0}:{size:V3;at:V3;color:string;metal?:number}){
 return <mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.72} metalness={metal}/></mesh>;
}
function Pallet({width,depth,height}:{width:number;depth:number;height:number}){
 return <group scale={[1,1,height/.12]}>{[-.35,0,.35].map(y=><Box key={'runner'+y} size={[width,depth*.13,.075]} at={[0,y*depth,.0375]} color="#8d6543"/>)}{[-.4,-.2,0,.2,.4].map(x=><Box key={'slat'+x} size={[width*.16,depth,.045]} at={[x*width,0,.0975]} color="#c29a69"/>)}</group>;
}
export function ObjectVisual({object:o,selected}:{object:WorldObject;selected:boolean}){
 const [w,d]=o.footprint,h=o.height;
 const steel=selected?'#db783b':'#355b72';
 const beam=selected?'#ffba70':'#d99247';
 const leg=Math.min(.085,w*.07,d*.07,h*.1),palletHeight=Math.min(.12,h*.25),face=Math.min(.02,d*.1);
 // Visual details remain within the conservative footprint/height collision envelope.
 return <group position={[0,0,-h/2]}>
 {o.type==='rack'?<>
 {[-1,1].flatMap(x=>[-1,1].map(y=><Box key={x+','+y} size={[leg,leg,h]} at={[x*(w-leg)/2,y*(d-leg)/2,h/2]} color={steel} metal={.55}/>))}
 {[.08,.48,.9].map((level,i)=><group key={level} position={[0,0,level*h]}>
 <Box size={[w-leg,d-leg,Math.min(.06,h*.03)]} at={[0,0,0]} color="#71818b" metal={.5}/>
 {[-1,1].map(y=><Box key={y} size={[w,leg,Math.min(.1,h*.045)]} at={[0,y*(d-leg)/2,0]} color={beam} metal={.45}/>)}
 {i<2&&[-1,1].map(x=><group key={x} position={[x*w*.23,0,Math.min(.03,h*.02)]}>
 <Box size={[w*.36,d*.72,h*.22]} at={[0,0,h*.11]} color={i===0?'#bea77f':'#c9b28b'}/>
 <Box size={[w*.055,d*.723,h*.222]} at={[0,0,h*.111]} color="#e0cfab"/>
 </group>)}
 </group>)}
 {[-1,1].map(x=><Box key={x} size={[leg,d-leg,leg]} at={[x*(w-leg)/2,0,h*.7]} color={steel}/>)}
 </>:o.type==='pallet'?<><Pallet width={w} depth={d} height={palletHeight}/><Box size={[w*.9,d*.88,h-palletHeight]} at={[0,0,(h+palletHeight)/2]} color="#bfa27a"/><Box size={[w*.06,d*.89,h-palletHeight]} at={[0,0,(h+palletHeight)/2]} color="#e1d1ae"/></>
 :o.type==='packing_station'?<><Box size={[w,d,h*.12]} at={[0,0,h*.94]} color="#a8b4b8" metal={.4}/>{[-1,1].flatMap(x=>[-1,1].map(y=><Box key={x+','+y} size={[leg,leg,h*.88]} at={[x*(w-leg)/2,y*(d-leg)/2,h*.44]} color="#466675" metal={.6}/>))}<Box size={[w*.85,d*.8,h*.055]} at={[0,0,h*.25]} color="#778f99"/></>
 :o.type==='charger'?<><Box size={[w,d,h]} at={[0,0,h/2]} color="#435866" metal={.3}/><Box size={[w*.65,face,h*.15]} at={[0,-d/2+face/2,h*.72]} color="#91d3c0"/><Box size={[w*.35,face,h*.13]} at={[0,-d/2+face/2,h*.25]} color="#202f36"/></>
 :o.type==='barrier'?<><Box size={[w,d,h*.22]} at={[0,0,h*.65]} color="#e49a32"/><Box size={[w,d,h*.2]} at={[0,0,h*.15]} color="#5d635f"/>{[-.45,0,.45].map(x=><Box key={x} size={[Math.min(.12,w*.1),d,h]} at={[x*w,0,h/2]} color="#515d62"/>)}</>
 :o.type==='door_frame'?<>{[-1,1].map(x=><Box key={x} size={[Math.min(w*.1,.15),d,h]} at={[x*w*.45,0,h/2]} color="#71837d"/>)}<Box size={[w,d,Math.min(.15,h*.1)]} at={[0,0,h-Math.min(.15,h*.1)/2]} color="#71837d"/></>
 :o.type==='crate'?<><Box size={[w,d,h]} at={[0,0,h/2]} color="#bd986d"/>{[-.4,.4].map(x=><Box key={x} size={[w*.07,d,h]} at={[x*w,0,h/2]} color="#897156"/>)}</>
 :<Box size={[w,d,h]} at={[0,0,h/2]} color="#8a9793"/>}
 {selected&&<mesh position={[0,0,h/2]}><boxGeometry args={[w,d,h]}/><meshBasicMaterial visible={false}/><Edges color="#d75d2f" lineWidth={2}/></mesh>}
 </group>;
}
export function RobotVisual({robot}:{robot:Robot}){
 const [w,d]=robot.footprint,h=robot.height;const isBoxer=robot.id==='boxer';
 const body=isBoxer?'#e5b334':'#e16f3d';
 return <group>
 <Box size={[w*.95,d*.94,h*.61]} at={[0,0,h*.54]} color={body} metal={.25}/>
 <Box size={[w,d,h*.17]} at={[0,0,h*.2]} color="#29393e"/>
 <Box size={[w*.72,d*.75,h*.12]} at={[-w*.02,0,h*.88]} color="#374b53" metal={.35}/>
 {[-1,1].map(side=><mesh key={side} position={[0,side*(d/2-.026),h*.23]} rotation={[0,0,0]} castShadow><cylinderGeometry args={[h*.23,h*.23,.05,20]}/><meshStandardMaterial color="#1d292e" roughness={.9}/></mesh>)}
 {[-1,1].map(end=><Box key={end} size={[w*.055,d*.86,h*.18]} at={[end*w*.472,0,h*.4]} color="#273c44"/>)}
 <Box size={[.02,d*.55,h*.1]} at={[w/2-.012,0,h*.64]} color="#dce9cc"/>
 <mesh position={[w*.25,0,h*.94]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[Math.min(w*.08,.05),Math.min(w*.08,.05),h*.12,20]}/><meshStandardMaterial color="#203d43"/></mesh>
 </group>;
}

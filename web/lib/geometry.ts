import type {WorldObject,World} from './types';
export const WORLD_ROTATION:[number,number,number]=[-Math.PI/2,0,0];
export function objectMesh(object:WorldObject){
 return {position:[...object.center,object.height/2] as [number,number,number],
 rotation:[0,0,object.yaw_deg*Math.PI/180] as [number,number,number],
 size:[...object.footprint,object.height] as [number,number,number]};
}
export function wallMeshes(world:World){
 const w=world.bounds.width/2,l=world.bounds.length/2,t=.1;
 return [
 {id:'wall_west',position:[-w-t/2,0,.5],size:[t,2*l+2*t,1]},
 {id:'wall_east',position:[w+t/2,0,.5],size:[t,2*l+2*t,1]},
 {id:'wall_south',position:[0,-l-t/2,.5],size:[2*w,t,1]},
 {id:'wall_north',position:[0,l+t/2,.5],size:[2*w,t,1]}
 ] as {id:string;position:[number,number,number];size:[number,number,number]}[];
}

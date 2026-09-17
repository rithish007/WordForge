export type Point=[number,number];
export type WorldObject={id:string;label:string;type:string;category?:string|null;center:Point;footprint:Point;height:number;yaw_deg:number;blocking:boolean};
export type World={schema_version:1;id:string;name:string;type:string;bounds:{width:number;length:number;height:number};grid:{resolution:number};objects:WorldObject[];zones:{id:string;label:string;type:string;center:Point;extent:Point;yaw_deg:number}[];assumptions:string[]};
export type Robot={id:string;name:string;manufacturer:string;footprint:Point;height:number;mass:number;max_linear_velocity:number;max_angular_velocity:number;collision_radius:number;safety_margin:number;datasheet_url:string;variant:string};
export type Report={valid:boolean;navigable:boolean;errors:string[];warnings:string[];free_area_fraction:number;largest_component_fraction:number};
export type Grid={resolution:number;origin:Point;shape:Point;occupied_runs:number[][];inflation_radius:number};
export type Frame={t:number;pose:[number,number,number];speed:number;angular_velocity:number};
export type Route={status:string;message:string;path:Point[];planned_path_length_m?:number};
export type Result=Route & {mode?:string;frames?:Frame[];metrics?:{simulation_time_s:number;distance_m:number;collision_count:number;minimum_clearance_m:number;goal_error_m:number;final_speed_m_s:number;planned_path_length_m:number};deterministic_hash?:string;run_id?:string;provenance?:Record<string,unknown>};
export async function api<T>(path:string,body?:unknown):Promise<T>{
 const response=await fetch('/api/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 const data=await response.json();
 if(!response.ok){const detail=data.detail;throw new Error(typeof detail==='string'?detail:Array.isArray(detail)?detail.map((e:{loc:string[];msg:string})=>e.loc.join('.')+': '+e.msg).slice(0,4).join('; '):'The local server could not complete this request.');}
 return data;
}
export function download(name:string,value:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

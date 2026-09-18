'use client';
import {useThemeMode} from '@/lib/theme';
const modes=[{id:'light',label:'Light theme',path:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'}, {id:'auto',label:'System theme',path:'M8 21h8m-4-4v4M3 3h18v14H3z'}, {id:'dark',label:'Dark theme',path:'M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z'}];
export default function ThemeSelect(){
 const mode=useThemeMode();
 return <div className="theme-switch" role="group" aria-label="Appearance" data-mode={mode}>
  <span className="theme-thumb" aria-hidden="true"/>
  {modes.map(m=><button key={m.id} type="button" aria-label={m.label} title={m.label} aria-pressed={mode===m.id} onClick={()=>window.dispatchEvent(new CustomEvent('worldforge:set-theme',{detail:m.id}))}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={m.path}/>{m.id==='light'&&<circle cx="12" cy="12" r="4"/>}</svg></button>)}
 </div>;
}

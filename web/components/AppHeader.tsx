'use client';
import ThemeSelect from './ThemeSelect';
import {AIConnectionButton} from './AIConnection';
export default function AppHeader({page}:{page:'Build'|'Simulation'}){
 return <header className="shell-header"><span className="shell-page">{page}</span>
 <div className="notch-menu" data-expanded="false"><button className="notch-toggle" type="button" aria-label="Navigation" aria-expanded="false" aria-controls="notch-navigation"><svg className="brand-logo" width="28" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M16 2 29 9.5v13L16 30 3 22.5v-13Z M3 9.5 16 17l13-7.5 M16 17v13"/></svg></button>
 <nav id="notch-navigation" aria-label="Main navigation"><a href="https://worldforge-nine.vercel.app/">Home</a><a href="/" aria-current={page==='Build'?'page':undefined}>Build</a><span className="notch-spacer" aria-hidden="true"/><a href="/lab?scenario=crossdock" aria-current={page==='Simulation'?'page':undefined}>Simulation</a><a href="https://rithish.vercel.app/" target="_blank" rel="noreferrer">Profile ↗</a></nav></div>
 <div className="shell-actions"><AIConnectionButton/><ThemeSelect/></div></header>;
}

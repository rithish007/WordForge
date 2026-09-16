'use client';
import {useThemeMode} from '@/lib/theme';
export default function ThemeSelect(){
 const mode=useThemeMode();
 return <label className="theme-control"><span>Theme</span><select aria-label="Theme" value={mode} onChange={e=>window.dispatchEvent(new CustomEvent('worldforge:set-theme',{detail:e.target.value}))}><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option></select></label>;
}

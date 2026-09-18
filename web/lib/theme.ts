'use client';
import {useSyncExternalStore} from 'react';
function subscribe(callback:()=>void){window.addEventListener('worldforge:theme-changed',callback);return()=>window.removeEventListener('worldforge:theme-changed',callback);}
function snapshot(){return document.documentElement.dataset.theme==='dark';}
export function useSystemDark(){return useSyncExternalStore(subscribe,snapshot,()=>false);}
export function useThemeMode(){return useSyncExternalStore(subscribe,()=>document.documentElement.dataset.themeMode??'auto',()=> 'auto');}
export const sceneThemes={
 light:{background:'#edf0ea',floor:'#fafbf7',grid:'#dce2d6',boundary:'#909e87',walls:'#99a590',ambient:1.5,sun:2.8},
 dark:{background:'#171d18',floor:'#283029',grid:'#414b41',boundary:'#929e8e',walls:'#7b8977',ambient:1.1,sun:2.2}
};

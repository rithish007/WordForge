'use client';
import {useSyncExternalStore} from 'react';
function subscribe(callback:()=>void){window.addEventListener('worldforge:theme-changed',callback);return()=>window.removeEventListener('worldforge:theme-changed',callback);}
function snapshot(){return document.documentElement.dataset.theme==='dark';}
export function useSystemDark(){return useSyncExternalStore(subscribe,snapshot,()=>false);}
export function useThemeMode(){return useSyncExternalStore(subscribe,()=>document.documentElement.dataset.themeMode??'auto',()=> 'auto');}
export const sceneThemes={
 light:{background:'#e8eeeb',floor:'#f8faf7',grid:'#d5dfd9',boundary:'#7f9990',walls:'#8ca497',ambient:1.5,sun:2.8},
 dark:{background:'#15171b',floor:'#272b31',grid:'#424851',boundary:'#8c949f',walls:'#7a838f',ambient:1.1,sun:2.2}
};

'use client';
import {useSyncExternalStore} from 'react';
const QUERY='(prefers-color-scheme: dark)';
function subscribe(callback:()=>void){const media=window.matchMedia(QUERY);media.addEventListener('change',callback);return()=>media.removeEventListener('change',callback);}
function snapshot(){return window.matchMedia(QUERY).matches;}
export function useSystemDark(){return useSyncExternalStore(subscribe,snapshot,()=>false);}
export const sceneThemes={
 light:{background:'#e8eeeb',floor:'#f8faf7',grid:'#d5dfd9',boundary:'#7f9990',walls:'#8ca497',ambient:1.5,sun:2.8},
 dark:{background:'#111e1a',floor:'#213129',grid:'#3b4e42',boundary:'#8ea98d',walls:'#76927c',ambient:1.1,sun:2.2}
};

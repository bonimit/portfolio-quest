'use client';

import {useRef,useSyncExternalStore} from 'react';

const subscribe=(update:()=>void)=>{
  document.addEventListener('fullscreenchange',update);
  return()=>document.removeEventListener('fullscreenchange',update);
};
const snapshot=()=>!document.fullscreenEnabled?'unsupported':document.fullscreenElement?'active':'available';

/** Fullscreen requires an explicit visitor gesture; never request it on arrival. */
export function FullscreenControl({onError}:{onError:(message:string)=>void}) {
  const state=useSyncExternalStore(subscribe,snapshot,()=>'unsupported');
  const pending=useRef(false);
  if(state==='unsupported')return null;
  return <button type="button" className="quest-fullscreen" onClick={async()=>{
    if(pending.current)return;
    pending.current=true;
    try {
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      onError('Full screen is unavailable in this browser. The preview still fills the browser viewport.');
    } finally {pending.current=false;}
  }}>{state==='active'?'Exit full screen':'Full screen'}</button>;
}

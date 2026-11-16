'use client';
import {useEffect,useRef,type ReactNode,type RefObject} from 'react';
import {FullscreenControl} from './fullscreen-control';
type Props={children:ReactNode;paused:boolean;reduced:boolean;onPause:()=>void;onError:(message:string)=>void;settingsRef?:RefObject<HTMLDetailsElement|null>;onOpenChange?:(open:boolean)=>void;label?:string};
/** The same panel, controls, focus handling and visual classes in both island previews. */
export function IslandSettingsPanel({children,paused,reduced,onPause,onError,settingsRef,onOpenChange,label='Settings'}:Props){
 const ownRef=useRef<HTMLDetailsElement>(null),ref=settingsRef??ownRef;
 useEffect(()=>{const close=(event:PointerEvent)=>{if(ref.current?.open&&event.target instanceof Node&&!ref.current.contains(event.target))ref.current.open=false;};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[ref]);
 return <details ref={ref} className="quest-controls" onToggle={event=>onOpenChange?.(event.currentTarget.open)} onKeyDown={event=>{if(event.key==='Escape'&&event.currentTarget.open&&!event.defaultPrevented){event.preventDefault();event.stopPropagation();event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus({preventScroll:true});}}}>
  <summary>{label} <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M3 6h14M3 14h14"/><circle cx="7" cy="6" r="2"/><circle cx="13" cy="14" r="2"/></svg></summary>
  <div className="quest-settings quest-controls-panel" role="group" aria-label="Scene controls">{children}<div className="quest-controls-actions">{!reduced?<button className="quest-pause" type="button" onClick={onPause}>{paused?'Resume world':'Pause world'}</button>:null}<FullscreenControl onError={onError}/></div></div>
 </details>;
}

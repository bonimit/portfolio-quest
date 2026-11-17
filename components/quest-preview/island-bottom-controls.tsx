'use client';

import {CloseIcon} from '@/components/ui/close-icon';
import {useEffect,useId,useRef,type ReactNode} from 'react';
import {FullscreenControl} from './restored/fullscreen-control';

type Props={title:string;automatic:boolean;reduced:boolean;disabled:boolean;open:boolean;onOpenChange:(open:boolean)=>void;onAutomaticChange:(automatic:boolean)=>void;onReset:()=>void;onError:(message:string)=>void;children:ReactNode};

/** The desktop controls become one mobile disclosure, while Settings stays directly accessible. */
export function IslandBottomControls({title,automatic,reduced,disabled,open,onOpenChange,onAutomaticChange,onReset,onError,children}:Props){
 const id=useId(),root=useRef<HTMLElement>(null),trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!open)return;
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();onOpenChange(false);trigger.current?.focus();}};
  const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!root.current?.contains(event.target)){if(panel.current?.contains(document.activeElement))trigger.current?.focus({preventScroll:true});onOpenChange(false);}};
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);};
 },[open,onOpenChange]);
 useEffect(()=>{
  const mobile=matchMedia('(max-width:56rem)');
  const change=()=>{onOpenChange(false);if(mobile.matches&&panel.current?.contains(document.activeElement))trigger.current?.focus({preventScroll:true});};
  mobile.addEventListener('change',change);return()=>mobile.removeEventListener('change',change);
 },[onOpenChange]);
 return <footer ref={root} inert={disabled} className="scene-study-tools island-bottom-bar" data-controls-open={open} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))onOpenChange(false);}} onClickCapture={event=>{if((event.target as HTMLElement).closest('summary'))onOpenChange(false);}}>
  <div className="island-bottom-center"><p className="quest-scene-caption island-bottom-caption" title={title}>{title}</p><div className="scene-study-motion" role="group" aria-label="Season changes"><span>Season changes</span><button type="button" aria-pressed={automatic&&!reduced} disabled={reduced} onClick={()=>onAutomaticChange(true)}>ON</button><span aria-hidden="true">/</span><button type="button" aria-pressed={!automatic||reduced} disabled={reduced} onClick={()=>onAutomaticChange(false)}>OFF</button></div></div>
  <div className="island-bottom-actions">
   <button ref={trigger} type="button" className="island-bottom-toggle" aria-expanded={open} aria-controls={`${id}-controls`} onClick={()=>{if(!open){const settings=root.current?.querySelector('details');if(settings)settings.open=false;}onOpenChange(!open);}}>Controls {open?<CloseIcon size={16}/>:<span aria-hidden="true">+</span>}</button>
   {children}
  </div>
  <div ref={panel} className="island-bottom-panel" id={`${id}-controls`} role="group" aria-label="Island view controls">
   <div className="island-bottom-panel-heading"><strong>Island controls</strong><button type="button" aria-label="Close island controls" onClick={()=>{onOpenChange(false);trigger.current?.focus();}}><CloseIcon/></button></div>
   <div className="scene-study-view-controls"><button type="button" disabled={disabled} onClick={onReset}>Reset view</button><FullscreenControl onError={onError}/></div>
  </div>
 </footer>;
}

'use client';

import {useEffect,useRef,type ReactNode} from 'react';

/** Native modal supplies inert background, focus containment and platform Escape support. */
export function AdventureDialog({children,onClose,className,labelledBy,returnFocus}:{children:ReactNode;onClose:()=>void;className:string;labelledBy:string;returnFocus:()=>HTMLElement|null}) {
  const root=useRef<HTMLDialogElement>(null);
  const close=useRef(onClose);
  const fallback=useRef(returnFocus);
  useEffect(()=>{close.current=onClose;},[onClose]);
  useEffect(()=>{
    const dialog=root.current;
    const restore=fallback.current;
    const origin=document.activeElement;
    dialog?.showModal();
    return ()=>{
      dialog?.close();
      const target=origin instanceof HTMLElement&&origin.isConnected?origin:restore();
      target?.focus({preventScroll:true});
    };
  },[]);
  return <dialog ref={root} className={className} aria-labelledby={labelledBy}
    onCancel={event=>{event.preventDefault();close.current();}}
    onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close.current();}}}>
    {children}
  </dialog>;
}

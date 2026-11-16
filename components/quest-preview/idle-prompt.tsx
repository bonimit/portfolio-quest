'use client';
import {useEffect,useRef,type RefObject} from 'react';
import {mayPrompt,IDLE_PROMPT_MS} from '@/lib/quest-preview/actors';
export function QuestIdlePrompt({busy,sceneRef,onPrompt}:{busy:boolean;sceneRef:RefObject<HTMLDivElement|null>;onPrompt:()=>void}) {
  const shown=useRef(false);
  useEffect(()=>{
    if(busy||shown.current)return;
    let timer=0;
    const reset=()=>{
      clearTimeout(timer);
      if(document.hidden)return;
      timer=window.setTimeout(()=>{
        const bounds=sceneRef.current?.getBoundingClientRect();
        const editing=!!document.activeElement?.closest('input,textarea,select,[contenteditable="true"],.guide-dialog,details[open]');
        if(mayPrompt({shown:shown.current,hidden:document.hidden,busy,editing,visible:!!bounds&&bounds.bottom>0&&bounds.top<innerHeight})){
          shown.current=true;onPrompt();
        }else reset();
      },IDLE_PROMPT_MS);
    };
    for(const event of ['pointermove','pointerdown','keydown','touchstart','visibilitychange'])document.addEventListener(event,reset,{passive:true});
    reset();
    return()=>{clearTimeout(timer);for(const event of ['pointermove','pointerdown','keydown','touchstart','visibilitychange'])document.removeEventListener(event,reset);};
  },[busy,sceneRef,onPrompt]);
  return null;
}

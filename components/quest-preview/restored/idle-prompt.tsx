'use client';
import {useEffect,useRef,useState,type RefObject} from 'react';
import {mayPrompt,IDLE_PROMPT_MS} from '@/lib/quest-preview/restored/actors';
export function QuestIdlePrompt({busy,sceneRef,onTalk,onPrompt}:{busy:boolean;sceneRef:RefObject<HTMLDivElement|null>;onTalk:(button:HTMLButtonElement)=>void;onPrompt:()=>void}) {
  const [visible,setVisible]=useState(false),shown=useRef(false);
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
          shown.current=true;setVisible(true);onPrompt();
        }else reset();
      },IDLE_PROMPT_MS);
    };
    for(const event of ['pointermove','pointerdown','keydown','touchstart','visibilitychange'])document.addEventListener(event,reset,{passive:true});
    reset();
    return()=>{clearTimeout(timer);for(const event of ['pointermove','pointerdown','keydown','touchstart','visibilitychange'])document.removeEventListener(event,reset);};
  },[busy,sceneRef,onPrompt]);
  if(!visible||busy)return null;
  return <aside className="quest-icebreaker" aria-label="A suggestion from Wayfinder">
    <p><strong>Which path would you like to try?</strong> Portfolio opens the editorial website and professional sections. Adventure is a coming-soon world preview.</p>
    <button type="button" onClick={event=>{setVisible(false);onTalk(event.currentTarget);}}>Ask Wayfinder</button>
    <button className="quest-icebreaker-close" type="button" aria-label="Dismiss Wayfinder's suggestion" onClick={()=>setVisible(false)}>×</button>
  </aside>;
}

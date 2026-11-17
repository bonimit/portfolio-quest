'use client';

import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import './dropdown.css';

type Option<T extends string>={value:T;label:string};

/** A controlled single-choice listbox shared by settings, filters and forms. */
export function Dropdown<T extends string>({label,value,options,onChange,name}:{label:string;value:T;options:readonly Option<T>[];onChange:(value:T)=>void;name?:string}) {
  const id=useId();
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(0);
  const search=useRef({text:'',time:0});
  const selected=Math.max(0,options.findIndex(option=>option.value===value));
  const show=(index=selected)=>{setActive(index);setOpen(true);};
  const choose=(index:number)=>{const option=options[index];if(option)onChange(option.value);setOpen(false);trigger.current?.focus();};

  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);};
    document.addEventListener('pointerdown',outside);
    return()=>document.removeEventListener('pointerdown',outside);
  },[open]);
  useEffect(()=>{if(open)document.getElementById(`${id}-${active}`)?.scrollIntoView({block:'nearest'});},[open,active,id]);

  function keyboard(event:KeyboardEvent<HTMLButtonElement>){
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();setOpen(false);return;}
    if(event.key==='Tab'){setOpen(false);return;}
    if(event.key==='Enter'||event.key===' '){event.preventDefault();if(open)choose(active);else show();return;}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();
      const index=event.key==='Home'?0:event.key==='End'?options.length-1:open?(active+(event.key==='ArrowDown'?1:-1)+options.length)%options.length:selected;
      show(index);return;
    }
    if(event.key.length===1){
      event.preventDefault();
      const now=Date.now();
      const text=(now-search.current.time<700?search.current.text:'')+event.key.toLowerCase();
      search.current={text,time:now};
      const query=[...text].every(char=>char===text[0])?text[0]:text;
      const start=open?active:selected;
      const index=options.findIndex((_,offset)=>options[(start+offset+1)%options.length].label.toLowerCase().startsWith(query));
      if(index>=0)show((start+index+1)%options.length);
    }
  }

  return <div ref={root} className="custom-dropdown" data-open={open} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
    {name&&<input type="hidden" name={name} value={value}/>}
    <button ref={trigger} type="button" role="combobox" className="custom-dropdown-trigger" aria-label={label} aria-expanded={open} aria-haspopup="listbox" aria-controls={`${id}-list`} aria-activedescendant={open?`${id}-${active}`:undefined} onKeyDown={keyboard} onClick={()=>open?setOpen(false):show()}>
      <span>{options[selected]?.label}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>
    </button>
    {open&&<div id={`${id}-list`} role="listbox" aria-label={label} className="custom-dropdown-options" onMouseDown={event=>event.preventDefault()}>
      {options.map((option,index)=><div key={option.value} id={`${id}-${index}`} role="option" aria-selected={value===option.value} data-active={active===index} className="custom-dropdown-option" onPointerMove={()=>setActive(index)} onClick={event=>{event.preventDefault();choose(index);}}>
        <span>{option.label}</span><svg viewBox="0 0 20 20" aria-hidden="true">{value===option.value&&<path d="m4 10 4 4 8-8"/>}</svg>
      </div>)}
    </div>}
  </div>;
}

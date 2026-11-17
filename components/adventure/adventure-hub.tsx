'use client';

import Link from 'next/link';
import {flushSync} from 'react-dom';
import {startTransition,useCallback,useEffect,useRef,useState,type CSSProperties,type KeyboardEvent} from 'react';
import type {AdventureProject} from '@/lib/adventure/projects';
import {AdventureDialog,AdventureCloseButton} from './adventure-dialog';
import {LivePreview} from './live-preview';

type Theme='A5'|'H3'|'A2';type View='grid'|'carousel';
const THEMES=[['A5','Island'],['H3','Arcade'],['A2','Neon']] as const;
const validTheme=(v:unknown):v is Theme=>v==='A5'||v==='H3'||v==='A2';
const validView=(v:unknown):v is View=>v==='grid'||v==='carousel';
const tint=(color:string)=>({'--c':color}) as CSSProperties;

export function AdventureHub({projects,caseStudies,initialTheme,initialView}:{projects:readonly AdventureProject[];caseStudies:Record<string,string>;initialTheme?:string;initialView?:string}) {
  const [theme,setTheme]=useState<Theme>(validTheme(initialTheme)?initialTheme:'A5');
  const [view,setView]=useState<View>(validView(initialView)?initialView:'grid');
  const [selected,setSelected]=useState(0);
  const [panel,setPanel]=useState<'card'|'read'|null>(null);
  const [machine,setMachine]=useState<{project:AdventureProject;key:number}|null>(null);
  const [settings,setSettings]=useState(false);
  const [sound,setSound]=useState(false);
  const [paused,setPaused]=useState(false);
  const [announcement,setAnnouncement]=useState('');
  const frame=useRef<HTMLIFrameElement>(null);
  const carouselPlay=useRef<HTMLButtonElement>(null);
  const stage=useRef<HTMLDivElement>(null);
  const setRoot=useRef<HTMLDivElement>(null);
  const settingsButton=useRef<HTMLButtonElement>(null);
  const tiles=useRef<(HTMLButtonElement|null)[]>([]);
  const swipe=useRef<number|null>(null);
  const swiped=useRef(false);
  const context=useRef<AudioContext|null>(null);
  const launchCount=useRef(0);
  const returning=useRef(false);
  const project=projects[selected];

  useEffect(()=>{
    // Query values win; preferences are read after hydration, never during SSR.
    const request=requestAnimationFrame(()=>{
      try {const t=localStorage.getItem('adventure-theme'),v=localStorage.getItem('arcade-view');startTransition(()=>{
        if(!validTheme(initialTheme)&&validTheme(t))setTheme(t);
        if(!validView(initialView)&&validView(v))setView(v);
      });}catch{/* Private mode: defaults remain usable. */}
    });
    return ()=>{cancelAnimationFrame(request);void context.current?.close();};
  },[initialTheme,initialView]);

  const preference=(kind:'theme'|'view',value:Theme|View)=>{
    const url=new URL(location.href);url.searchParams.set(kind,value);
    history.replaceState(history.state,'',url);
    try{localStorage.setItem(kind==='theme'?'adventure-theme':'arcade-view',value);}catch{/* Optional persistence. */}
    if(kind==='theme'&&validTheme(value))setTheme(value);
    if(kind==='view'&&validView(value)){
      const apply=()=>flushSync(()=>setView(value));
      if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(apply);else setView(value);
    }
    setAnnouncement(kind==='theme'?`${THEMES.find(t=>t[0]===value)?.[1]} theme`:`${value} view`);
  };
  const tick=()=>{
    if(!sound)return;
    try{const c=context.current??=new AudioContext();void c.resume();const o=c.createOscillator(),g=c.createGain();o.frequency.value=660;g.gain.setValueAtTime(.025,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.06);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.07);}catch{/* Sound never blocks interaction. */}
  };
  const select=(i:number,focus=false)=>{
    const n=(i+projects.length)%projects.length;setSelected(n);tick();
    setAnnouncement(`${n+1} of ${projects.length}: ${projects[n].name}`);
    if(focus)tiles.current[n]?.focus();
  };
  const closeMachine=useCallback(()=>{
    if(returning.current)return;
    returning.current=true;
    if(history.state?.adventureMachine)history.back();else setMachine(null);
  },[]);
  useEffect(()=>{
    const pop=()=>{returning.current=false;setMachine(null);};
    const message=(event:MessageEvent)=>{
      if(event.origin===location.origin&&event.source===frame.current?.contentWindow&&event.data==='arcade:back')closeMachine();
    };
    addEventListener('popstate',pop);addEventListener('message',message);
    return()=>{removeEventListener('popstate',pop);removeEventListener('message',message);};
  },[closeMachine]);
  useEffect(()=>{
    if(!settings)return;
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!setRoot.current?.contains(event.target))setSettings(false);};
    const key=(event:globalThis.KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setSettings(false);settingsButton.current?.focus();}};
    const focus=(event:FocusEvent)=>{if(event.target instanceof Node&&!setRoot.current?.contains(event.target))setSettings(false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);document.addEventListener('focusin',focus);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);document.removeEventListener('focusin',focus);};
  },[settings]);
  const launch=()=>{
    if(machine||!project.machine)return;
    returning.current=false;setPanel(null);setSettings(false);
    history.pushState({...history.state,adventureMachine:project.id},'',`${location.pathname}${location.search}#play-${project.id}`);
    setMachine({project,key:++launchCount.current});
  };
  const keyboard=(event:KeyboardEvent)=>{
    if(panel||machine||settings||event.altKey||event.ctrlKey||event.metaKey)return;
    const target=event.target as HTMLElement;
    if(target.closest('input,textarea,select,[contenteditable]'))return;
    if(event.key.toLowerCase()==='v'){event.preventDefault();preference('view',view==='grid'?'carousel':'grid');return;}
    if(!target.closest('[data-lineup]'))return;
    const cols=matchMedia('(max-width:56rem)').matches?2:4;
    const delta:Record<string,number>={ArrowRight:1,ArrowLeft:-1,ArrowDown:cols,ArrowUp:-cols};
    if(delta[event.key]!==undefined){event.preventDefault();select(selected+delta[event.key],view==='grid');}
  };
  const actions=<><button ref={carouselPlay} className="play" onClick={launch} disabled={!project.machine}>{project.machine?'PLAY ▶':'Not built'}</button><button className="btn read-btn" aria-haspopup="dialog" onClick={()=>setPanel('read')}>Read the story</button></>;
  const facts=<><p className="hook">{project.hook}</p><p className="role">{project.sample?'Sample tile · not built':'Playable prototype · demonstration content'}</p><ul className="tech" aria-label="Built with">{project.tech.map(t=><li key={t}>{t}</li>)}</ul></>;
  return <div className={`adventure v-${view}`} data-theme={theme} data-paused={paused} onKeyDown={keyboard}>
    <header className="top">
      <nav aria-label="Adventure controls"><div className="switch2" role="group" aria-label="Lineup view">{(['grid','carousel'] as const).map(v=><button key={v} aria-label={`${v==='grid'?'Grid':'Carousel'} view`} title={`${v} view`} aria-pressed={view===v} onClick={()=>preference('view',v)}><svg viewBox="0 0 20 20" aria-hidden="true">{v==='grid'?<path d="M2 2h6v6H2zM12 2h6v6h-6zM2 12h6v6H2zM12 12h6v6h-6z"/>:<path d="M5 3h10v14H5zM1 6v8M19 6v8"/>}</svg><span>{v}</span></button>)}</div>
      <div className="settings" ref={setRoot}><button className="btn set-btn" ref={settingsButton} aria-expanded={settings} aria-controls="adventure-settings" onClick={()=>setSettings(!settings)}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 17h16M9 4v6M15 14v6"/></svg><span>Settings</span></button>
        {settings&&<div className="set-panel" id="adventure-settings"><div className="set-panel-heading"><strong>Settings</strong><AdventureCloseButton label="Close settings" onClose={()=>{setSettings(false);settingsButton.current?.focus();}}/></div><p>Theme</p><div className="themes" role="group" aria-label="Theme">{THEMES.map(([id,name])=><button key={id} aria-pressed={theme===id} onClick={()=>preference('theme',id)}>{name}</button>)}</div><p>Lineup sound</p><button className="btn" aria-pressed={sound} onClick={()=>setSound(!sound)}>Sound {sound?'on':'off'}</button><p>Animation</p><button className="btn animation-toggle" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Resume':'Pause'} animation</button><small>Each playable demo has its own sound control. Sound starts off.</small></div>}
      </div></nav>
    </header>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    <div className="adventure-main"><h1 className="sr-only">Pick a tool</h1>
      <section id="gridView" aria-label="Projects, grid" hidden={view!=='grid'} data-lineup>
        <ul className="lineup">{projects.map((p,i)=><li key={p.id}><button ref={node=>{tiles.current[i]=node;}} className={`tile${i===selected?' sel':''}${p.sample?' sample-tile':''}`} style={tint(p.color)} tabIndex={selected===i?0:-1} aria-haspopup="dialog" aria-label={`${p.name}, ${p.kind}${p.sample?', sample, not built':', playable prototype'}`} onFocus={()=>{if(selected!==i)setSelected(i);}} onClick={()=>{setSelected(i);setPanel('card');}} onPointerMove={event=>{if(event.pointerType!=='mouse'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--ry',`${((event.clientX-r.left)/r.width-.5)*8}deg`);event.currentTarget.style.setProperty('--rx',`${-((event.clientY-r.top)/r.height-.5)*8}deg`);}} onPointerLeave={event=>{event.currentTarget.style.removeProperty('--rx');event.currentTarget.style.removeProperty('--ry');}}>
          <span className="prev" aria-hidden="true"><LivePreview kind={p.preview}/></span><span className="meta"><span className="no">{String(i+1).padStart(2,'0')}</span><span className="name">{p.name}</span><span className="kind">{p.kind}</span></span></button></li>)}</ul>
        <p className="hint">Arrow keys choose · Enter opens · V switches view</p>
      </section>
      <section id="carouselView" aria-label="Projects, carousel" hidden={view!=='carousel'} data-lineup>
        <div className="stage2" ref={stage} aria-roledescription="carousel" onPointerDown={event=>{if((event.target as HTMLElement).closest('button'))return;swipe.current=event.clientX;swiped.current=false;event.currentTarget.setPointerCapture(event.pointerId);}} onPointerUp={event=>{if(swipe.current!==null){const dx=event.clientX-swipe.current;swipe.current=null;if(Math.abs(dx)>40){swiped.current=true;select(selected+(dx<0?1:-1));}}}} onPointerCancel={()=>{swipe.current=null;}}>
          <button className="arrow l" aria-label="Previous project" onClick={()=>select(selected-1)}>←</button>
          {projects.map((p,i)=>{let d=i-selected;if(d>projects.length/2)d-=projects.length;if(d< -projects.length/2)d+=projects.length;return <div key={p.id} className={`item${d===0?' on':''}${Math.abs(d)>2?' far':''}${p.sample?' sample-tile':''}`} style={{...tint(p.color),'--d':d,'--ad':Math.abs(d)} as CSSProperties} role="button" tabIndex={d===0?0:-1} aria-label={`Play ${p.name}`} aria-hidden={d!==0} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();launch();}}} onClick={()=>{if(swiped.current){swiped.current=false;return;}if(i===selected)launch();else select(i);}}><span className="prev" aria-hidden="true"><LivePreview kind={p.preview}/></span><span className="num" aria-hidden="true">{String(i+1).padStart(2,'0')}</span></div>;})}
          <button className="arrow r" aria-label="Next project" onClick={()=>select(selected+1)}>→</button>
        </div>
        <div className="dock" style={tint(project.color)}><div className="txt" key={project.id}><div className="row1"><span className="kind">{project.kind}</span>{project.sample&&<span>Sample</span>}</div><h2>{project.name}</h2>{facts}</div><div className="dock-acts">{actions}</div></div>
        <ul className="carts" aria-label="Jump to project">{projects.map((p,i)=><li key={p.id}><button aria-label={p.name} aria-current={i===selected?'true':undefined} style={tint(p.color)} onClick={()=>select(i)}>{i+1}</button></li>)}</ul>
        <p className="hint">Arrow keys browse · PLAY opens · V switches view</p>
      </section>
    </div>
    {panel&&<AdventureDialog key={panel} className={panel==='read'?'reader open':'pcard open'} labelledBy="adventure-project-title" returnFocus={()=>view==='grid'?tiles.current[selected]:carouselPlay.current} onClose={()=>setPanel(null)}>
      {panel==='read'?<><header><span>Project story</span><AdventureCloseButton label="Close project story" onClose={()=>setPanel(null)}/></header><div className="scroll" style={tint(project.color)}><span className="prev" aria-hidden="true"><LivePreview kind={project.preview}/></span><div><span className="kind">{project.kind}</span><h2 id="adventure-project-title">{project.name}</h2></div>{facts}<dl className="facts"><dt>Status</dt><dd>{project.machine?'Playable prototype':'Sample · not built'}</dd><dt>Case study</dt><dd>{caseStudies[project.id]?'Published':'Not published'}</dd></dl><section><h3>About this demo</h3><p>{project.hook}</p></section><section><h3>The story</h3><p className="rph">An approved project story, role and outcomes have not been published. This prototype does not establish client work or project results.</p></section><Link href="/work">Browse Selected Work</Link></div><footer><button className="play" disabled={!project.machine} onClick={launch}>{project.machine?'PLAY ▶':'Not built'}</button>{caseStudies[project.id]&&<Link className="full" href={caseStudies[project.id]}>Full case study →</Link>}</footer></>:<><AdventureCloseButton label="Close project details" onClose={()=>setPanel(null)}/><div className="prev" style={tint(project.color)} aria-hidden="true"><LivePreview kind={project.preview}/></div><div className="pcard-body" style={tint(project.color)}><span className="kind">{project.kind}</span><h2 id="adventure-project-title">{project.name}</h2>{facts}<div className="pcard-actions">{actions}</div><p className="fine">{project.machine?'Demonstration content · no published case study':'Sample · not built'}</p></div></>}
    </AdventureDialog>}
    {machine&&<AdventureDialog className="machine adventure-machine" labelledBy="machine-title" returnFocus={()=>view==='grid'?tiles.current[selected]:carouselPlay.current} onClose={closeMachine}><header><button className="btn" onClick={closeMachine}>← Lineup <kbd>Esc</kbd></button><h2 id="machine-title">{machine.project.name}</h2><span className="kind">Playable prototype</span></header><iframe key={machine.key} ref={frame} src={`/arcade/${machine.project.machine}?embed`} title={`${machine.project.name} — playable prototype`} sandbox="allow-scripts allow-same-origin"/><p className="machine-help">Escape or browser Back returns to the lineup. This demo runs locally; no AI service is connected.</p></AdventureDialog>}
  </div>;
}

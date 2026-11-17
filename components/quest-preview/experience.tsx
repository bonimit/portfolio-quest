'use client';
import {sceneConfig} from '@/lib/quest-preview/scene-config';
import Link from 'next/link';
import {Dropdown} from '@/components/ui/dropdown';
import {useCallback,useEffect,useRef,useState,useSyncExternalStore,type MouseEvent} from 'react';
import {useRouter} from 'next/navigation';
import {QuestGuide} from './guide';
import type {EntryPhase} from '@/lib/quest-preview/destination-transition';
import {QuestScene} from './scene';
import type {QuestActorsHandle} from './actors';
import {canWalkEntry} from '@/lib/quest-preview/actors';
import {CLASSIC_VARIANT,SCENE_HOLD_MS,stepScene,type SceneEdition,type SceneVariant} from '@/lib/quest-preview/variants';
import {QuestTimeToggle,QuestSceneTour} from './scene-controls';
import {observeGuideVisibility} from '@/lib/guide/observe-visibility';
import type {QuestPath} from '@/lib/quest-preview/renderer';
const subscribe=(change:()=>void)=>{const q=matchMedia('(prefers-reduced-motion: reduce)');q.addEventListener('change',change);return()=>q.removeEventListener('change',change);};
const getReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function QuestPreviewExperience() {
  const [scene,setScene]=useState({variant:CLASSIC_VARIANT,previous:CLASSIC_VARIANT});
  const {variant,previous}=scene;
  const setVariant=useCallback((update:(current:SceneVariant)=>SceneVariant)=>setScene(current=>({previous:current.variant,variant:update(current.variant)})),[]);
  const {city,season,light}=variant;
  const [paused,setPaused]=useState(false);
  const [automatic,setAutomatic]=useState(true);
  const entrance=useRef<HTMLElement>(null);
  const [illustrated,setIllustrated]=useState(false);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [guideOpen,setGuideOpen]=useState(false);
  const [focus,setFocus]=useState<QuestPath|null>(null);
  const [leaving,setLeaving]=useState<QuestPath|null>(null);
  const [entering,setEntering]=useState(false);
  const [phase,setPhase]=useState<EntryPhase|null>(null);
  const phaseRef=useRef<EntryPhase|null>(null),pendingPath=useRef<QuestPath|null>(null),committed=useRef(false);
  const cancelButton=useRef<HTMLButtonElement>(null),travel=useRef<HTMLDivElement>(null),restoreAfterCancel=useRef(false);
  const [notice,setNotice]=useState('');
  const reduced=useSyncExternalStore(subscribe,getReduced,()=>true);
  const world=useRef<HTMLDivElement>(null);
  const actors=useRef<QuestActorsHandle|null>(null);
  const guideOrigin=useRef<HTMLElement|null>(null);
  const pending=useRef(false);
  const navigationOrigin=useRef<HTMLAnchorElement|null>(null);
  const router=useRouter();
  const closeGuide=useCallback((restore:boolean)=>{setGuideOpen(false);setFocus(null);if(restore)(guideOrigin.current?.isConnected?guideOrigin.current:actors.current?.trigger)?.focus();},[]);
  const openGuide=useCallback((button:HTMLButtonElement)=>{
    guideOrigin.current=actors.current?.trigger??button;setGuideOpen(true);
  },[]);
  const finishImmediately=useCallback(()=>{
    if(!pending.current||!pendingPath.current||committed.current)return;
    committed.current=true;router.push(pendingPath.current==='portfolio'?'/portfolio':'/world');
  },[router]);
  const cancelNavigation=useCallback((restore=true)=>{
    if(phaseRef.current&&['entering','committing','complete'].includes(phaseRef.current))return;
    if(actors.current?.cancel()===false)return;
    pending.current=false;pendingPath.current=null;committed.current=false;restoreAfterCancel.current=restore;
    setLeaving(null);setEntering(false);setFocus(null);setPhase(null);phaseRef.current=null;
    setNotice('Still at the preview entrance. Choose either path when you are ready.');
  },[]);
  const phaseChanged=useCallback((next:EntryPhase|null)=>{
    phaseRef.current=next;setPhase(next);
    const inside=next==='entering'||next==='committing'||next==='complete';setEntering(inside);
    if(next==='entering'){
      setNotice('Entering the doorway. The selected page opens next.');
      if(document.activeElement===cancelButton.current)travel.current?.focus({preventScroll:true});
    }
  },[]);
  useEffect(()=>{
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{if(preference.matches)finishImmediately();};
    preference.addEventListener('change',change);return()=>preference.removeEventListener('change',change);
  },[finishImmediately]);
  useEffect(()=>{
    if(leaving)cancelButton.current?.focus({preventScroll:true});
    else if(restoreAfterCancel.current){restoreAfterCancel.current=false;(navigationOrigin.current?.isConnected?navigationOrigin.current:actors.current?.trigger)?.focus({preventScroll:true});}
  },[leaving]);
  useEffect(()=>{
    if(!automatic||paused||reduced||guideOpen||leaving||focus||settingsOpen)return;
    let timer=0,visible=true;
    const schedule=()=>{
      clearTimeout(timer);if(document.hidden||!visible)return;
      timer=window.setTimeout(()=>{
        const editing=!!document.activeElement?.closest('input,textarea,select,[contenteditable="true"]');
        if(editing||entrance.current?.querySelector('details[open]'))schedule();
        else setVariant(current=>stepScene(current));
      },SCENE_HOLD_MS);
    };
    const stop=entrance.current?observeGuideVisibility(entrance.current,value=>{visible=value;schedule();}):()=>{};
    document.addEventListener('visibilitychange',schedule);schedule();
    return()=>{clearTimeout(timer);stop();document.removeEventListener('visibilitychange',schedule);};
  },[automatic,paused,reduced,guideOpen,leaving,focus,settingsOpen,city,season,variant.edition,setVariant]);
  const arrive=useCallback((path:QuestPath)=>{
    if(!pending.current||pendingPath.current!==path)return;
    setNotice(`Entering ${path==='portfolio'?'Portfolio':'Adventure Preview'}.`);finishImmediately();
  },[finishImmediately]);
  function choose(event:MouseEvent<HTMLAnchorElement>,path:QuestPath) {
    if(pending.current){event.preventDefault();return;}
    if(!canWalkEntry(event,paused,reduced)||world.current?.dataset.renderer!=='webgl'||world.current.dataset.actorReady!=='true')return;
    if(!actors.current?.navigate(path))return;
    event.preventDefault();pending.current=true;pendingPath.current=path;committed.current=false;navigationOrigin.current=event.currentTarget;
    router.prefetch(path==='portfolio'?'/portfolio':'/world');setGuideOpen(false);
    setEntering(false);setLeaving(path);setFocus(path);setNotice(`Wayfinder is heading to ${path==='portfolio'?'Portfolio':'Adventure Preview'}. Enter now or cancel before entering the doorway.`);
  }
  return <section ref={entrance} className="quest-preview" data-edition={variant.edition??'original'} data-city={city} data-season={season} data-light={light} data-paused={paused} data-reduced={reduced} data-leaving={leaving??''} data-entering={entering} data-entry-phase={phase??'idle'} onKeyDown={event=>{
    if(event.key==='Escape'&&leaving&&!event.defaultPrevented&&!event.nativeEvent.isComposing){event.preventDefault();cancelNavigation();}
  }}>
    <header className="quest-hud" inert={!!leaving}><Link href="/">Current entrance</Link><QuestTimeToggle light={light} onChange={value=>setVariant(current=>({...current,light:value}))}/></header>
    <div className={`quest-composition${guideOpen?' quest-composition--guide':''}`}>
      <div className="quest-world">
        <div className="quest-heading" aria-hidden={!!leaving}><h1>Pick your path<span aria-hidden="true">.</span></h1><p>Explore the design portfolio or step into an Adventure Preview.</p></div>
        <QuestScene onPhase={phaseChanged} onUnavailable={finishImmediately} key={illustrated?'illustrated':'webgl'} variant={variant} previousVariant={previous} paused={paused} reduced={reduced} illustrated={illustrated} focus={focus} worldRef={world} controllerRef={actors} conversationOpen={guideOpen} destination={leaving} onTalk={openGuide} onArrive={arrive}>
        <nav className="quest-signs" aria-label="Choose your path" inert={!!leaving}>
          {(['portfolio','world'] as const).map(path=><Link key={path} className={`quest-sign quest-sign--${path}`} href={path==='portfolio'?'/portfolio':'/world'} data-selected={focus===path||leaving===path} aria-label={path==='portfolio'?'Portfolio — enter the editorial website':'Adventure Preview — Coming soon, not playable'} onPointerEnter={event=>{if(event.pointerType!=='touch'&&!leaving)setFocus(path);}} onPointerLeave={event=>{if(!leaving&&!event.currentTarget.matches(':focus-visible'))setFocus(null);}} onFocus={()=>{if(!leaving)setFocus(path);}} onBlur={()=>{if(!leaving)setFocus(null);}} onClick={event=>choose(event,path)} onKeyDown={event=>{if(event.key===' '&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();if(!event.repeat)event.currentTarget.click();}}}>
            <span className="quest-building-aura" aria-hidden="true"/>
            <span className="quest-floating-label"><span className="quest-sign-number" aria-hidden="true">{path==='portfolio'?sceneConfig(variant).portfolio:sceneConfig(variant).adventure}</span><strong>{path==='portfolio'?'PORTFOLIO':'ADVENTURE'}</strong><small><span className="quest-label-long">{path==='portfolio'?'Design & selected work':'Preview · Coming soon · Not playable'}</span><span className="quest-label-short">{path==='portfolio'?'Design portfolio':'Coming soon'}</span></small></span>
          </Link>)}
        </nav>
        </QuestScene>
        <p className="quest-map-hint">Choose a building <span aria-hidden="true">·</span> Adventure is a non-playable preview</p>
      </div>
      {guideOpen?<QuestGuide paused={paused} onSuggest={setFocus} onClose={closeGuide} onChoose={choose}/>:null}
    </div>
    {leaving?<div ref={travel} tabIndex={-1} className="quest-travel" role="group" aria-label="Destination transition"><span>{entering?'Entering ':'Heading to '}{leaving==='portfolio'?'Portfolio':'Adventure Preview'}…</span><Link href={leaving==='portfolio'?'/portfolio':'/world'}>Enter now</Link><button ref={cancelButton} type="button" disabled={entering} onClick={()=>cancelNavigation()}>Cancel</button></div>:null}
    <footer className="quest-tools" inert={!!leaving}>
      <QuestSceneTour variant={variant} holdReason={paused?'World paused':guideOpen?'Chat open':leaving?'Entering a path':focus?'Choosing a path':settingsOpen?'Settings open':null} automatic={automatic} reduced={reduced} onAutomatic={()=>setAutomatic(value=>!value)} onStep={direction=>{if(leaving)cancelNavigation(false);setVariant(current=>stepScene(current,direction));}}/>
      <div className="quest-tool-actions">{!reduced?<button className="quest-pause" type="button" onClick={()=>{if(leaving)cancelNavigation(false);setPaused(value=>!value);}}>{paused?'Resume world':'Pause world'}</button>:null}<details onToggle={event=>setSettingsOpen(event.currentTarget.open)}><summary>Scene settings <span aria-hidden="true">+</span></summary><div className="quest-settings">
        <div className="quest-collection">Scene collection<Dropdown label="Scene collection" value={variant.edition==='heritage'?'classic':variant.edition??'original'} onChange={value=>{if(!leaving){const edition=value as SceneEdition;setVariant(current=>({...current,edition}));}}} options={[{value:'classic',label:'Original island & city scenes'},{value:'original',label:'Original island scenes'},{value:'new',label:'New city islands'}]}/></div>
        <label className="quest-checkbox"><input type="checkbox" checked={illustrated} onChange={event=>{if(leaving)cancelNavigation(false);setIllustrated(event.target.checked);}}/> Use illustrated view</label>
        <p className="quest-setting-note">{sceneConfig(variant).title}: {sceneConfig(variant).description} Stylized scenery.</p>
      </div></details></div>
    </footer>
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{notice}</div>
  </section>;
}

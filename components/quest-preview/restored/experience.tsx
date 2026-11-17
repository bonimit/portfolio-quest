'use client';
import {islandPathHref,islandPathLabel} from '@/lib/quest-preview/concept-gallery-layout';
import {cameraPreview} from '@/lib/quest-preview/camera-preview';
import {PLACES,PLACE_IDS,type Place} from '@/lib/quest-preview/restored/places';
import {sceneConfig} from '@/lib/quest-preview/scene-config';
import Link from 'next/link';
import {Dropdown} from '@/components/ui/dropdown';
import {useCallback,useEffect,useRef,useState,useSyncExternalStore,type MouseEvent} from 'react';
import {useRouter} from 'next/navigation';
import {QuestGuide} from './guide';
import {IslandSettingsPanel} from './settings-panel';
import type {EntryPhase} from '@/lib/quest-preview/destination-transition';
import {QuestScene} from './scene';
import type {QuestActorsHandle} from '../actors';
import {canWalkEntry} from '@/lib/quest-preview/actors';
import {CITIES,DEFAULT_VARIANT,SCENE_HOLD_MS,seasonLabel,stepScene,type SceneVariant} from '@/lib/quest-preview/restored/variants';
import {QuestTimeToggle,QuestSceneTour} from './scene-controls';
import {observeGuideVisibility} from '@/lib/guide/observe-visibility';
import type {QuestPath} from '@/lib/quest-preview/renderer';
const subscribe=(change:()=>void)=>{const q=matchMedia('(prefers-reduced-motion: reduce)');q.addEventListener('change',change);return()=>q.removeEventListener('change',change);};
const getReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function QuestPreviewExperience({preview=true}:{preview?:boolean}) {
  const [scene,setScene]=useState({variant:{...DEFAULT_VARIANT,city:'tokyo',season:'autumn',edition:'restored'} as SceneVariant,previous:{...DEFAULT_VARIANT,city:'tokyo',season:'autumn',edition:'restored'} as SceneVariant});
  const {variant,previous}=scene;
  const setVariant=useCallback((update:(current:SceneVariant)=>SceneVariant)=>setScene(current=>({previous:current.variant,variant:update(current.variant)})),[]);
  const {city,season,light}=variant;
  const [paused,setPaused]=useState(false);
  const [automatic,setAutomatic]=useState(false);
  const entrance=useRef<HTMLElement>(null);
  const tools=useRef<HTMLElement>(null);
  const [cameraControls,setCameraControls]=useState<HTMLDivElement|null>(null);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const settings=useRef<HTMLDetailsElement>(null);
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
  useEffect(()=>{
    const footer=tools.current,root=entrance.current;
    if(!footer||!root)return;
    const update=()=>root.style.setProperty('--quest-tools-height',`${footer.offsetHeight}px`);
    update();
    const observer=new ResizeObserver(update);observer.observe(footer);
    return()=>{observer.disconnect();root.style.removeProperty('--quest-tools-height');};
  },[]);
  useEffect(()=>{
    if(!settingsOpen)return;
    const close=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!settings.current?.contains(event.target)){
        if(settings.current)settings.current.open=false;
      }
    };
    document.addEventListener('pointerdown',close);
    return()=>document.removeEventListener('pointerdown',close);
  },[settingsOpen]);
  const closeGuide=useCallback((restore:boolean)=>{setGuideOpen(false);setFocus(null);if(restore)(guideOrigin.current?.isConnected?guideOrigin.current:actors.current?.trigger)?.focus();},[]);
  const openGuide=useCallback((button:HTMLButtonElement)=>{
    guideOrigin.current=actors.current?.trigger??button;setGuideOpen(true);
  },[]);
  const finishImmediately=useCallback(()=>{
    if(!pending.current||!pendingPath.current||committed.current)return;
    committed.current=true;const preview=cameraPreview(window.location.search);if(preview.enabled)window.parent.postMessage({type:'quest-camera:complete',preset:preview.key,path:pendingPath.current},window.location.origin);router.push(islandPathHref(pendingPath.current));
  },[router]);
  const cancelNavigation=useCallback((restore=true)=>{
    if(phaseRef.current&&['entering','committing','complete'].includes(phaseRef.current))return;
    if(actors.current?.cancel()===false)return;
    pending.current=false;pendingPath.current=null;committed.current=false;restoreAfterCancel.current=restore;
    setLeaving(null);setEntering(false);setFocus(null);setPhase(null);phaseRef.current=null;
    setNotice('Still at the entrance. Choose a path when you are ready.');
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
    setNotice(`Entering ${islandPathLabel(path)}.`);finishImmediately();
  },[finishImmediately]);
  useEffect(()=>{
    const preview=cameraPreview(window.location.search);if(!preview.enabled)return;
    const root=entrance.current,node=world.current;if(!root||!node)return;
    root.dataset.cameraCompare='true';
    let announced=false;
    const announce=()=>{if(!announced&&!pending.current&&node.dataset.actorReady==='true'){announced=true;window.parent.postMessage({type:'quest-camera:ready',preset:preview.key},window.location.origin);}};
    const observer=new MutationObserver(announce);observer.observe(node,{attributes:true,attributeFilter:['data-actor-ready']});announce();
    const message=(event:MessageEvent)=>{if(event.origin!==window.location.origin||event.source!==window.parent||!['quest-camera:play','quest-camera:cancel'].includes(event.data?.type))return;if(event.data.type==='quest-camera:cancel'){root.querySelector<HTMLButtonElement>('.quest-travel button')?.click();announced=false;announce();return;}announced=false;const path=event.data.path;if(path!=='portfolio'&&path!=='world')return;root.querySelector<HTMLAnchorElement>('.quest-sign--'+path)?.click();};
    window.addEventListener('message',message);return()=>{observer.disconnect();window.removeEventListener('message',message);delete root.dataset.cameraCompare;};
  },[]);
  function choose(event:MouseEvent<HTMLAnchorElement>,path:QuestPath) {
    if(pending.current){event.preventDefault();return;}
    if(!canWalkEntry(event,paused,reduced)||world.current?.dataset.renderer!=='webgl'||world.current.dataset.actorReady!=='true')return;
    if(!actors.current?.navigate(path))return;
    event.preventDefault();pending.current=true;pendingPath.current=path;committed.current=false;navigationOrigin.current=event.currentTarget;
    router.prefetch(islandPathHref(path));setGuideOpen(false);
    setEntering(false);setLeaving(path);setFocus(path);setNotice(`Wayfinder is heading to ${islandPathLabel(path)}. Enter now or cancel before entering the doorway.`);
  }
  return <section ref={entrance} className="quest-preview" data-path-count={preview?2:3} data-edition={variant.edition??'original'} data-city={city} data-season={season} data-light={light} data-paused={paused} data-reduced={reduced} data-leaving={leaving??''} data-entering={entering} data-entry-phase={phase??'idle'} onKeyDown={event=>{
    if(event.key==='Escape'&&leaving&&!event.defaultPrevented&&!event.nativeEvent.isComposing){event.preventDefault();cancelNavigation();}
  }}>
    <header className="quest-hud" inert={!!leaving}><Link href={preview?"/":"/work"}>{preview?"Main entrance":"Selected Work"}</Link><QuestTimeToggle light={light} onChange={value=>setVariant(current=>({...current,light:value}))}/></header>
    <div className={`quest-composition${guideOpen?' quest-composition--guide':''}`}>
      <div className="quest-world">
        <div className="quest-heading" aria-hidden={!!leaving}><h1>Pick your path<span aria-hidden="true">.</span></h1><p>{preview?'Explore the portfolio or try Adventure.':'Explore the portfolio, discover Concept Lab, or try Adventure.'}</p></div>
        <QuestScene controlsTarget={cameraControls} onPhase={phaseChanged} onUnavailable={finishImmediately} variant={{...variant,conceptLab:!preview}} previousVariant={{...previous,conceptLab:!preview}} paused={paused} reduced={reduced} illustrated={false} focus={focus} worldRef={world} controllerRef={actors} conversationOpen={guideOpen} destination={leaving} onTalk={openGuide} onArrive={arrive}>
        <nav className="quest-signs" aria-label="Choose your path" inert={!!leaving}>
          {((preview?['portfolio','world']:['portfolio','concepts','world']) as QuestPath[]).map(path=><Link key={path} className={`quest-sign quest-sign--${path}`} href={islandPathHref(path)} data-selected={focus===path||leaving===path} aria-label={path==='portfolio'?'Portfolio — enter the editorial website':path==='concepts'?'Concept Lab — concepts, art and graphic work':'Adventure — explore playable prototypes'} onPointerEnter={event=>{if(event.pointerType!=='touch'&&!leaving)setFocus(path);}} onPointerLeave={event=>{if(!leaving&&!event.currentTarget.matches(':focus-visible'))setFocus(null);}} onFocus={()=>{if(!leaving)setFocus(path);}} onBlur={()=>{if(!leaving)setFocus(null);}} onClick={event=>choose(event,path)} onKeyDown={event=>{if(event.key===' '&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();if(!event.repeat)event.currentTarget.click();}}}>
            {path==='concepts'&&<svg className="quest-gallery-fallback" aria-hidden="true" viewBox="0 0 160 110"><path d="m8 85 75-25 70 20-75 28Z" fill="var(--q-orange)" stroke="currentColor"/><path d="M18 80V22l65-16 62 17v56M18 22l65 19 62-18M83 41v47" fill="var(--q-paper)" stroke="currentColor" strokeWidth="3"/><path d="m8 20 74-18 72 20-71 23Z" fill="var(--q-orange)" stroke="currentColor"/><path d="m30 43 30 8v24l-30-8Zm66 8 30-9v24l-30 9Z" fill="var(--landing-lilac)" stroke="currentColor"/></svg>}
            <span className="quest-building-aura" aria-hidden="true"/>
            <span className="quest-floating-label"><span className="quest-sign-number" aria-hidden="true">{path==='portfolio'?sceneConfig(variant).portfolio:path==='concepts'?'THE OPEN GALLERY':sceneConfig(variant).adventure}</span><strong>{path==='portfolio'?'PORTFOLIO':path==='concepts'?'CONCEPT LAB':'ADVENTURE'}</strong><small><span className="quest-label-long">{path==='portfolio'?'Design & selected work':path==='concepts'?'Ideas, art & graphic studies':'Playable prototypes'}</span><span className="quest-label-short">{path==='portfolio'?'Design portfolio':path==='concepts'?'Ideas & art':'Playable demos'}</span></small></span>
          </Link>)}
        </nav>
        </QuestScene>
        <p className="sr-only">Choose a building <span aria-hidden="true">·</span> Adventure opens playable prototype demos</p>
      </div>
      {guideOpen?<QuestGuide paused={paused} onSuggest={setFocus} onClose={closeGuide} onChoose={choose}/>:null}
    </div>
    {leaving?<div ref={travel} tabIndex={-1} className="quest-travel" role="group" aria-label="Destination transition"><span>{entering?'Entering ':'Heading to '}{islandPathLabel(leaving)}…</span><Link href={islandPathHref(leaving)}>Enter now</Link><button ref={cancelButton} type="button" disabled={entering} onClick={()=>cancelNavigation()}>Cancel</button></div>:null}
    <footer ref={tools} className="quest-tools quest-tools--compact" inert={!!leaving}>
      <div className="quest-camera-slot" ref={setCameraControls}/>
      <p className="quest-scene-caption"><span>{variant.place?PLACES[variant.place].title:CITIES[city].label} <span aria-hidden="true">·</span> {seasonLabel(city,season)}</span><button className="quest-season-toggle" type="button" aria-pressed={automatic&&!reduced} disabled={reduced} title={reduced?'Season changes are off for reduced motion':automatic&&(paused||guideOpen||!!focus||settingsOpen)?'Season changes are enabled, temporarily paused while interacting':automatic?'Turn season changes off':'Turn season changes on'} onClick={()=>setAutomatic(value=>!value)}>Season Changes {automatic&&!reduced?'ON':'OFF'}</button></p>
      <IslandSettingsPanel settingsRef={settings} onOpenChange={setSettingsOpen} paused={paused} reduced={reduced} onPause={()=>setPaused(value=>!value)} onError={setNotice} label={preview?'Scene controls':'Settings'}>
          <div className="quest-controls-section">
      <QuestSceneTour variant={variant} holdReason={paused?'World paused':guideOpen?'Chat open':leaving?'Entering a path':focus?'Choosing a path':settingsOpen?'Settings open':null} automatic={automatic} reduced={reduced} onStep={direction=>{if(leaving)cancelNavigation(false);setVariant(current=>stepScene(current,direction));}}/>
          </div>
          <div className="quest-controls-section quest-controls-options">
        <div className="quest-collection">Scene set<Dropdown label="Scene set" value={variant.place?'places':'current'} onChange={value=>{if(!leaving)setVariant(current=>value==='places'?{...PLACES.highline,place:'highline',edition:'restored',light:current.light}:{...DEFAULT_VARIANT,city:'tokyo',season:'autumn',edition:'restored',light:current.light});}} options={[{value:'current',label:'Current city & season scenes'},{value:'places',label:'New destination scenes'}]}/></div>
        {variant.place?<div className="quest-collection">Place<Dropdown label="Place" value={variant.place} onChange={value=>{const place=value as Place;if(!leaving)setVariant(current=>({...PLACES[place],place,edition:'restored',light:current.light}));}} options={PLACE_IDS.map(place=>({value:place,label:PLACES[place].title}))}/></div>:null}
        <p className="quest-setting-note">{sceneConfig(variant).title}: {sceneConfig(variant).description} Stylized scenery.</p>
          </div>
      </IslandSettingsPanel>
    </footer>
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{notice}</div>
  </section>;
}

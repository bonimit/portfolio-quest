"use client";
import {useCallback,useEffect,useRef,useState,useSyncExternalStore,type MouseEvent} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {IslandSettingsPanel} from '@/components/quest-preview/restored/settings-panel';
import {QuestGuide} from '@/components/quest-preview/restored/guide';
import {PET_IDS,petFrame,type Pet} from '@/lib/quest-preview/pet-sprites';
import {QuestActors,type QuestActorsHandle} from './actors';
import {QuestPets} from './pets';
import {QuestIdlePrompt} from './idle-prompt';
import {canWalkEntry,type Actors,type Destination} from '@/lib/quest-preview/actors';
import {STUDY_PET_SPACE} from '@/lib/quest-preview/pet-space';
import {STUDY_ROUTES,STUDY_PORTALS} from '@/lib/quest-preview/study-navigation';
import {MapOrbit} from '@/lib/quest-preview/map-orbit';
import type {StudyRenderer} from '@/lib/quest-preview/study-renderer';
import type {EntryFrame,EntryPhase} from '@/lib/quest-preview/destination-transition';
import {cameraMatrix,project,worldPixelsPerUnit,guideScale} from '@/lib/quest-preview/restored/math';
import {petSize} from '@/lib/quest-preview/character-motion';
import {projectedTravelFacing} from '@/lib/quest-preview/depth-walk';
import type {Facing} from '@/lib/guide/assistant-motion';
import {SCENE_HOLD_MS,seasonLabel,type Season,type SceneVariant} from '@/lib/quest-preview/variants';
import {QuestTimeToggle,QuestSceneTour} from './restored/scene-controls';
import {CITIES,changeCity,type SceneVariant as ReviewVariant} from '@/lib/quest-preview/restored/variants';
import {PLACE_IDS,type Place} from '@/lib/quest-preview/restored/places';
import {REVIEW_PLACES as PLACES,THREE_PATH_DEFAULT,THREE_PATH_VIEWS,threePathId,threePathHref,threePathTitle,stepThreePath} from '@/lib/quest-preview/three-path-catalog';
import {observeGuideVisibility} from '@/lib/guide/observe-visibility';
import {REVIEW_CAPTURE_STYLES,REVIEW_CAPTURE_VERSION} from '@/lib/quest-preview/review-capture-layout';
const subscribeMotion=(update:()=>void)=>{const query=matchMedia('(prefers-reduced-motion: reduce)');query.addEventListener('change',update);return()=>query.removeEventListener('change',update);};
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverReducedMotion=()=>true;
const noop=()=>{};
const destinations=[
 {id:'portfolio',href:'/work',label:'Portfolio',place:'The central studio',arrow:'↑'},
 {id:'concepts',href:'/concepts',label:'Concept Lab',place:'The garden gallery',arrow:'↖'},
 {id:'world',href:'/world',label:'Adventure',place:'The lantern gate',arrow:'↗'},
] as const;


export function SceneStudyExperience({initialVariant=THREE_PATH_DEFAULT,screenshot=false}:{initialVariant?:ReviewVariant;screenshot?:boolean}){
 const router=useRouter();
 const entrance=useRef<HTMLElement>(null),automaticCaptureStarted=useRef(0),captureRun=useRef(0),[saving,setSaving]=useState(false),[captureStatus,setCaptureStatus]=useState('');
 const canvasHost=useRef<HTMLDivElement>(null),renderer=useRef<StudyRenderer|null>(null),orbit=useRef(new MapOrbit(true)),suppressClick=useRef(false);
 const [rendererMode,setRendererMode]=useState<'loading'|'webgl'|'software'>('loading');
 const anchors=useRef<Partial<Record<Destination,HTMLAnchorElement>>>({});
 const [leaving,setLeaving]=useState<Destination|null>(null),[focus,setFocus]=useState<Destination|null>(null),[phase,setPhase]=useState<EntryPhase|null>(null);
 const pending=useRef<Destination|null>(null),origin=useRef<HTMLAnchorElement|null>(null),cancelButton=useRef<HTMLButtonElement>(null);
 const restoreFocus=useRef(false),travel=useRef<HTMLDivElement>(null);
 const lastEntry=useRef<EntryFrame|null>(null);
 const [guideOpen,setGuideOpen]=useState(false),[notice,setNotice]=useState(''),[paused,setPaused]=useState(screenshot);
 const [automatic,setAutomatic]=useState(false),[variant,setVariant]=useState<ReviewVariant>(initialVariant),[settingsOpen,setSettingsOpen]=useState(false);
 const {city,season,light}=variant;
 const reduced=useSyncExternalStore(subscribeMotion,reducedMotion,serverReducedMotion);
 const stage=useRef<HTMLDivElement>(null),actorElement=useRef<HTMLDivElement>(null),actors=useRef<QuestActorsHandle|null>(null);
 const pets=useRef<Partial<Record<Pet,HTMLDivElement>>>({}),lastPoses=useRef<Actors|null>(null);
 const lastFacing=useRef<Facing>('front');
 const rendererPreferences=useRef<{variant:SceneVariant;paused:boolean;reduced:boolean;focus:Destination|null}>({variant:initialVariant,paused:screenshot,reduced:true,focus:null});
 useEffect(()=>{rendererPreferences.current={variant,paused:paused||guideOpen,reduced,focus};},[variant,paused,guideOpen,reduced,focus]);
 const paintActors=useCallback((poses:Actors,entry:EntryFrame|null=null)=>{
  lastEntry.current=entry;
  lastPoses.current=poses;
  const width=stage.current?.clientWidth||1440,height=stage.current?.clientHeight||980;
  const engine=renderer.current;engine?.update(poses,entry);
  const matrix=cameraMatrix(1440,980),fit=width/1440;
  const floor=(x:number,z:number)=>{if(engine)return engine.projectFloor(x,z);const p=project(matrix,[x,.4,z],1440,980);return{x:p.x*fit,y:p.y*height/980};};
  const point=floor(poses.guide.x,poses.guide.z),pixels=engine?.pixelsPerUnit()??worldPixelsPerUnit(1440,980)*fit,scale=Math.max(guideScale(pixels),Math.max(...PET_IDS.map(pet=>petSize(pixels,pet)))*1.3/80);
  const node=actorElement.current;
  if(node){node.style.zIndex=String(Math.round(point.y*10));node.style.setProperty('--actor-scale',String(scale));node.style.opacity=String(entry?.opacity??1);node.style.transform=`translate3d(${point.x}px,${point.y}px,0) translate(-50%,calc(-100px * var(--actor-scale)))`;}
  for(const pet of PET_IDS){
   const node=pets.current[pet];if(!node)continue;
   const pose=poses[pet],point=floor(pose.x,pose.z),size=petSize(pixels,pet),frame=petFrame(pet,pose);
   node.style.zIndex=String(Math.round(point.y*10));node.style.transform=`translate3d(${point.x}px,${point.y}px,0) translate(-50%,-96.875%)`;node.style.width=`${size}px`;node.style.height=`${size}px`;
   const sheet=node.querySelector<HTMLElement>('.quest-pet-sheet'),facing=node.querySelector<HTMLElement>('.quest-pet-facing');
   if(sheet)sheet.style.transform=`translate3d(${-frame%5*20}%,${-Math.floor(frame/5)*50}%,0)`;
   if(facing)facing.style.transform=Math.sin(pose.angle)<-.1?'scaleX(-1)':'none';
  }
  if(engine){const targets=engine.buildings();for(const id of Object.keys(targets) as Destination[]){const node=anchors.current[id],target=targets[id];if(node){node.style.left=`${target.left}px`;node.style.top=`${target.top}px`;node.style.width=`${target.width}px`;node.style.height=`${target.height}px`;}}}
  const ahead=floor(poses.guide.x+Math.sin(poses.guide.angle),poses.guide.z+Math.cos(poses.guide.angle));
  const facing=projectedTravelFacing(ahead.x-point.x,ahead.y-point.y,lastFacing.current);lastFacing.current=facing;
  return {...point,scale,facing};
 },[]);
 useEffect(()=>{
  let active=true;const host=canvasHost.current;if(!host)return;
  void import('@/lib/quest-preview/study-renderer').then(({createStudyRenderer})=>{
   if(!active)return;const canvas=document.createElement('canvas');canvas.className='scene-study-canvas';canvas.setAttribute('aria-hidden','true');host.append(canvas);
   try{const preferences=rendererPreferences.current,engine=createStudyRenderer(canvas,()=>{if(lastPoses.current)paintActors(lastPoses.current,lastEntry.current);},new URLSearchParams(window.location.search).get('renderer')==='software',preferences.variant);renderer.current=engine;engine.motion(preferences.paused,preferences.reduced);engine.focus(preferences.focus);setRendererMode(engine.mode);if(lastPoses.current)paintActors(lastPoses.current,lastEntry.current);}catch{setNotice('Interactive rotation is unavailable in this browser.');}
  }).catch(()=>{if(active)setNotice('Interactive rotation is unavailable in this browser.');});
  return()=>{active=false;renderer.current?.destroy();renderer.current=null;host.replaceChildren();};
 },[paintActors]);
 useEffect(()=>{renderer.current?.motion(paused||guideOpen,reduced);},[paused,guideOpen,reduced,rendererMode]);
 useEffect(()=>{renderer.current?.focus(focus);},[focus,rendererMode]);
 useEffect(()=>{renderer.current?.variant(variant);},[variant,rendererMode]);
 useEffect(()=>{orbit.current.reset();renderer.current?.orbit(0,0);},[city,season,variant.place]);
 useEffect(()=>{
  if(!automatic||paused||reduced||guideOpen||leaving||focus||settingsOpen||!stage.current)return;
  let timer=0,visible=true;
  const schedule=()=>{clearTimeout(timer);if(document.hidden||!visible)return;timer=window.setTimeout(()=>setVariant(current=>stepThreePath(current)),SCENE_HOLD_MS);};
  const unobserve=observeGuideVisibility(stage.current,value=>{visible=value;schedule();});
  document.addEventListener('visibilitychange',schedule);schedule();
  return()=>{clearTimeout(timer);unobserve();document.removeEventListener('visibilitychange',schedule);};
 },[automatic,paused,reduced,guideOpen,leaving,focus,settingsOpen,variant]);
 function rotate(yaw:number,pitch:number){const view=orbit.current.set(yaw,pitch);renderer.current?.orbit(view.yaw,view.pitch);if(stage.current)stage.current.dataset.orbitYaw=String(view.yaw);}
 function stopDrag(id:number,node:HTMLDivElement){if(orbit.current.pointerId!==id)return;suppressClick.current=orbit.current.end(id)||suppressClick.current;delete node.dataset.dragging;if(node.hasPointerCapture(id))node.releasePointerCapture(id);}
 useEffect(()=>{const node=stage.current;if(!node)return;const observer=new ResizeObserver(()=>{if(lastPoses.current)paintActors(lastPoses.current,lastEntry.current);});observer.observe(node);return()=>observer.disconnect();},[paintActors]);
 const greet=useCallback(()=>actors.current?.greet(),[]);
 const closeGuide=useCallback((restore:boolean)=>{setGuideOpen(false);if(restore)actors.current?.trigger?.focus();},[]);
 const openGuide=useCallback(()=>setGuideOpen(open=>!open),[]);

 const arrive=useCallback((path:Destination)=>{if(pending.current!==path)return;pending.current=null;router.push(path==='portfolio'?'/work':path==='concepts'?'/concepts':'/world');},[router]);
 const choose=useCallback((event:MouseEvent<HTMLAnchorElement>,path:Destination)=>{
  if(pending.current){event.preventDefault();return;}
  if(!canWalkEntry(event,paused,reduced)||!actors.current?.navigate(path))return;
  event.preventDefault();origin.current=event.currentTarget;pending.current=path;setLeaving(path);setGuideOpen(false);setFocus(path);setNotice(`Heading to ${path==='world'?'Adventure':path==='concepts'?'Concept Lab':'Portfolio'}.`);
 },[paused,reduced]);
 const cancel=useCallback(()=>{
  if(!actors.current?.cancel())return;
  pending.current=null;restoreFocus.current=true;setLeaving(null);setPhase(null);setFocus(null);
  setNotice('Still at the entrance.');
 },[]);
 useEffect(()=>{if(leaving)cancelButton.current?.focus();else if(restoreFocus.current){restoreFocus.current=false;origin.current?.focus();}},[leaving]);
 const phaseChanged=useCallback((next:EntryPhase|null)=>{if(next==='entering'&&document.activeElement===cancelButton.current)travel.current?.focus();setPhase(next);},[]);
 useEffect(()=>{if(reduced&&leaving)arrive(leaving);},[reduced,leaving,arrive]);
 useEffect(()=>()=>{pending.current=null;},[]);
 const entering=!!phase&&['entering','committing','complete'].includes(phase);
 const saveScreenshots=useCallback(async(all:boolean)=>{
  if(!renderer.current||!entrance.current)return;const run=++captureRun.current;
  setSaving(true);setPaused(true);setGuideOpen(false);setFocus(null);const details=entrance.current.querySelector('details');if(details)details.open=false;
  try{
   const {captureReviewPage,waitForReviewScene}=await import('@/lib/quest-preview/review-capture'),views=all?THREE_PATH_VIEWS:[variant];
   for(const [index,next]of views.entries()){
    setCaptureStatus(`Saving ${index+1} / ${views.length}: ${threePathTitle(next)} · ${next.light}`);setVariant(next);orbit.current.reset();renderer.current.orbit(0,0);renderer.current.variant(next);renderer.current.motion(true,true);
    await waitForReviewScene(entrance.current,threePathId(next),next.light);
    if(!entrance.current||!renderer.current||run!==captureRun.current)throw Error('Screenshot export cancelled.');
    const png=await captureReviewPage(entrance.current,renderer.current.capture());
    const response=await fetch('/api/scene-review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scene:threePathId(next),light:next.light,png,captureVersion:REVIEW_CAPTURE_VERSION})});
    if(!response.ok)throw Error(`Could not save screenshot: ${response.status}`);
   }
   setCaptureStatus(`Saved ${views.length} screenshot${views.length===1?'':'s'}.`);
  }catch(error){if(run===captureRun.current)setCaptureStatus(error instanceof Error?error.message:'Screenshot export failed.');}finally{if(run===captureRun.current)setSaving(false);}
 },[variant]);
 useEffect(()=>{
  if(!screenshot||rendererMode==='loading'||automaticCaptureStarted.current===REVIEW_CAPTURE_VERSION||initialVariant.city!=='tokyo'||initialVariant.season!=='autumn'||initialVariant.light!=='day')return;
  const timer=window.setTimeout(()=>{automaticCaptureStarted.current=REVIEW_CAPTURE_VERSION;void saveScreenshots(true);},600);
  return()=>clearTimeout(timer);
 },[screenshot,rendererMode,initialVariant,saveScreenshots]);

 return <section ref={entrance} className="scene-study quest-preview" data-review-scene={threePathId(variant)} data-city={city} data-season={season} data-light={light} data-screenshot={screenshot} data-study-travel={!!leaving} data-reduced={reduced} onKeyDown={event=>{if(event.key==='Escape'&&leaving&&!event.defaultPrevented&&!event.nativeEvent.isComposing){event.preventDefault();cancel();}}}>
  {screenshot?<style>{REVIEW_CAPTURE_STYLES}</style>:null}
  <nav inert={!!leaving} className="scene-study-hud" aria-label="Preview navigation"><Link href="/work">Selected Work</Link><QuestTimeToggle light={light} onChange={light=>setVariant(current=>({...current,light}))}/></nav>
  <header className="scene-study-heading" aria-hidden={!!leaving}><h1>Pick your path<span aria-hidden="true">.</span></h1><p>Explore the portfolio, discover Concept Lab, or try Adventure.</p></header>
  <div ref={stage} className="scene-study-stage" data-renderer={rendererMode} tabIndex={leaving?-1:0} role="group" aria-label="Interactive 360 degree island" aria-describedby="study-orbit-help"
   onPointerDown={event=>{if(leaving||!renderer.current||event.button!==0||!event.isPrimary||(event.target as HTMLElement).closest('a,button,input,select,summary'))return;suppressClick.current=false;if(orbit.current.begin(event.pointerId,event.clientX,event.clientY,event.pointerType==='touch')){event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.focus({preventScroll:true});}}}
   onPointerMove={event=>{if(!orbit.current.dragging||leaving)return;const box=event.currentTarget.getBoundingClientRect(),view=orbit.current.move(event.pointerId,event.clientX,event.clientY,box.width,box.height);if(view){event.currentTarget.dataset.dragging='true';renderer.current?.orbit(view.yaw,view.pitch);event.currentTarget.dataset.orbitYaw=String(view.yaw);}}}
   onPointerUp={event=>stopDrag(event.pointerId,event.currentTarget)} onPointerCancel={event=>stopDrag(event.pointerId,event.currentTarget)} onLostPointerCapture={event=>stopDrag(event.pointerId,event.currentTarget)}
   onClickCapture={event=>{if(event.detail>0&&suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}
   onKeyDown={event=>{if(event.target!==event.currentTarget||leaving)return;if(event.key==='Escape'&&orbit.current.dragging){const id=orbit.current.pointerId,view=orbit.current.cancel();if(id!==null&&event.currentTarget.hasPointerCapture(id))event.currentTarget.releasePointerCapture(id);delete event.currentTarget.dataset.dragging;if(view)renderer.current?.orbit(view.yaw,view.pitch);event.preventDefault();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)){event.preventDefault();rotate(event.key==='Home'?0:orbit.current.yaw+(event.key==='ArrowLeft'?-.16:event.key==='ArrowRight'?.16:0),event.key==='Home'?0:orbit.current.pitch+(event.key==='ArrowUp'?.035:event.key==='ArrowDown'?-.035:0));}}}><div className="scene-study-moving-world">
   <Image hidden={rendererMode!=='loading'} className="scene-study-art" src={`/quest-preview/three-path/${threePathId(variant)}-${light}.webp`} alt={`${threePathTitle(variant)} with smaller Concept Lab on the left, Portfolio in the centre and Adventure on the right. Three stone paths meet in a shared courtyard.`} width={1440} height={980} unoptimized priority/>
   <div ref={canvasHost} className="scene-study-canvas-host"/>
   <nav inert={!!leaving} aria-label="Three island paths">{destinations.map(destination=><Link ref={node=>{if(node)anchors.current[destination.id]=node;else delete anchors.current[destination.id];}} key={destination.id} href={destination.href} className={`scene-study-destination scene-study-destination--${destination.id}`} aria-label={`${destination.label} — ${destination.place}`} onClick={event=>choose(event,destination.id)} onPointerEnter={event=>{if(event.pointerType!=='touch'&&!leaving)setFocus(destination.id);}} onPointerLeave={event=>{if(!event.currentTarget.matches(':focus-visible')&&!leaving)setFocus(null);}} onFocus={()=>{if(!leaving)setFocus(destination.id);}} onBlur={()=>{if(!leaving)setFocus(null);}}><span className="scene-study-label"><small>{destination.place}</small><strong>{destination.label}</strong><i aria-hidden="true">{destination.arrow}</i></span><span className="scene-study-hover" aria-hidden="true"><span className="scene-study-hover-ring"/></span></Link>)}</nav>
   <div className="scene-study-actors"><QuestActors city={city} edition="restored" petSpace={STUDY_PET_SPACE} routes={STUDY_ROUTES} portals={STUDY_PORTALS} sceneRef={stage} onPhase={phaseChanged} controllerRef={actors} elementRef={actorElement} onMotion={paintActors} onTalk={openGuide} onArrive={arrive} paused={paused} reduced={reduced} conversationOpen={guideOpen} petsMoving={!paused&&!reduced&&!leaving} destination={leaving}/>
   <QuestPets petRefs={pets}/>
   <QuestIdlePrompt busy={paused||reduced||guideOpen||!!leaving} sceneRef={stage} onPrompt={greet}/></div>

  </div></div>
  {leaving?<div ref={travel} tabIndex={-1} role="group" aria-label="Destination transition" className="quest-travel"><span>{entering?'Entering':'Heading to'} {leaving==='world'?'Adventure':leaving==='concepts'?'Concept Lab':'Portfolio'}…</span><Link href={leaving==='world'?'/world':leaving==='concepts'?'/concepts':'/work'}>Enter now</Link><button ref={cancelButton} disabled={entering} onClick={cancel}>Cancel</button></div>:null}
  {guideOpen?<QuestGuide paused={paused} onSuggest={noop} onChoose={choose} onClose={closeGuide}/>:null}
  <p id="study-orbit-help" className="scene-study-orbit-help" aria-hidden={!!leaving}>Drag empty map space to rotate 360° · Arrow keys rotate · Home resets</p>
  <footer inert={!!leaving} className="scene-study-tools"><div className="scene-study-view-controls"><button type="button" disabled={!!leaving||rendererMode==='loading'} onClick={()=>{orbit.current.reset();rotate(0,0);setNotice('View reset.');}}>Reset view</button></div><div className="scene-study-caption"><p className="quest-scene-caption">{threePathTitle(variant)}</p><div className="scene-study-motion" role="group" aria-label="Season changes"><span>Season changes</span><button type="button" aria-pressed={automatic&&!reduced} disabled={reduced} onClick={()=>setAutomatic(true)}>ON</button><span aria-hidden="true">/</span><button type="button" aria-pressed={!automatic||reduced} disabled={reduced} onClick={()=>setAutomatic(false)}>OFF</button></div></div>
   <IslandSettingsPanel paused={paused} reduced={reduced} onPause={()=>setPaused(value=>!value)} onError={setNotice} onOpenChange={setSettingsOpen}>
    <div className="quest-controls-section"><QuestSceneTour variant={variant} title={variant.place?PLACES[variant.place].title:undefined} automatic={automatic} reduced={reduced} holdReason={paused?'World paused':guideOpen?'Chat open':leaving?'Entering a path':focus?'Choosing a path':settingsOpen?'Settings open':null} onStep={direction=>setVariant(current=>stepThreePath(current,direction))}/></div>
    <div className="quest-controls-section quest-controls-options"><label className="quest-collection">Scene set<select value={variant.place?'places':'current'} onChange={event=>setVariant(current=>event.target.value==='places'?{...PLACES.highline,place:'highline',edition:'restored',light:current.light}:{...THREE_PATH_DEFAULT,light:current.light})}><option value="current">Current city &amp; season scenes</option><option value="places">New destination scenes</option></select></label>
     {variant.place?<label className="quest-collection">Place<select value={variant.place} onChange={event=>{const place=event.target.value as Place;setVariant(current=>({...PLACES[place],place,edition:'restored',light:current.light}));}}>{PLACE_IDS.map(place=><option key={place} value={place}>{PLACES[place].title}</option>)}</select></label>:<><label className="quest-collection">City<select value={city} onChange={event=>setVariant(current=>changeCity(current,event.target.value as ReviewVariant['city']))}>{Object.entries(CITIES).map(([id,v])=><option key={id} value={id}>{v.label}</option>)}</select></label><label className="quest-collection">Season<select value={season} onChange={event=>setVariant(current=>({...current,season:event.target.value as Season}))}>{CITIES[city].seasons.map(season=><option key={season} value={season}>{seasonLabel(city,season)}</option>)}</select></label></>}
     <p className="quest-setting-note">{variant.place?PLACES[variant.place].description:threePathTitle(variant)} Three-path homepage proposal, awaiting final approval.</p><Link href={threePathHref(variant)}>Link to this scene ↗</Link><Link href="/quest-preview/scene-review">Review all scene screenshots ↗</Link><Link href="/quest-preview">Compare the current island ↗</Link></div>
   </IslandSettingsPanel>
  </footer>
  <p className="sr-only" role="status">{notice}</p>
  <p className="sr-only" role="status">{rendererMode==='loading'?'Loading scene':`Scene ready: ${threePathTitle(variant)} · ${light}`}</p>
  {screenshot&&process.env.NODE_ENV==='development'?<div className="scene-study-capture"><button type="button" disabled={saving||rendererMode==='loading'} onClick={()=>void saveScreenshots(false)}>Save this screenshot</button><button type="button" disabled={saving||rendererMode==='loading'} onClick={()=>void saveScreenshots(true)}>Save all 44 screenshots</button><span role="status">{captureStatus}</span></div>:null}
 </section>;
}

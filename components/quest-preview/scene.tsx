'use client';
import Image from 'next/image';
import {createPortal} from 'react-dom';
import type {EntryFrame,EntryPhase} from '@/lib/quest-preview/destination-transition';
import {cityLayout} from '@/lib/quest-preview/city-layout';
import {MapOrbit} from '@/lib/quest-preview/map-orbit';
import {clearSceneTransition,fadeSceneFrame} from '@/lib/quest-preview/scene-transition';
import {useCallback,useEffect,useRef,useState,type RefObject,type ReactNode} from 'react';
import type {QuestRenderer,QuestPath} from '@/lib/quest-preview/renderer';
import {variantId,isSnow,type SceneVariant} from '@/lib/quest-preview/variants';
import {cameraPreview} from '@/lib/quest-preview/camera-preview';
import {cityCameraMatrix} from '@/lib/quest-preview/city-camera';
import {project,guideScale,worldPixelsPerUnit} from '@/lib/quest-preview/math';
import type {Actors,Destination} from '@/lib/quest-preview/actors';
import {QuestActors,type QuestActorsHandle} from './actors';
import {QuestIdlePrompt} from './idle-prompt';
import {QuestPets} from './pets';
import {projectBuildings,sceneBuildingPaths} from '@/lib/quest-preview/building-interaction';
import {petFrame,PET_IDS} from '@/lib/quest-preview/pet-sprites';
import {petSize} from '@/lib/quest-preview/character-motion';
type Props={controlsTarget?:HTMLDivElement|null;onPhase:(phase:EntryPhase|null)=>void;onUnavailable:()=>void;variant:SceneVariant;previousVariant:SceneVariant;paused:boolean;reduced:boolean;illustrated:boolean;focus:QuestPath|null;worldRef:RefObject<HTMLDivElement|null>;controllerRef:RefObject<QuestActorsHandle|null>;conversationOpen:boolean;destination:Destination|null;onTalk:(button:HTMLButtonElement)=>void;onArrive:(path:Destination)=>void;children:ReactNode};
function fallbackCamera(v:SceneVariant,w:number,h:number){
 const matrix=cityCameraMatrix(v.city,w,h,0,0,0,0,0,0,v.edition),config=cameraPreview(typeof window==='undefined'?'':window.location.search);
 for(const i of [0,4,8,12,1,5,9,13])matrix[i]*=config.zoom;return matrix;
}
function positionActor(node:HTMLDivElement|null,point:{x:number;y:number},scale:number){
  if(!node)return;
  if(node.style.left!=='0px'){node.style.left='0px';node.style.top='0px';}
  const value=String(scale);if(node.style.getPropertyValue('--actor-scale')!==value)node.style.setProperty('--actor-scale',value);
  node.style.transform=`translate3d(${point.x}px,${point.y}px,0) translate(-50%,calc(-100px * var(--actor-scale)))`;
}
export function QuestScene({controlsTarget,onPhase,onUnavailable,variant,previousVariant,paused,reduced,illustrated,focus,worldRef,controllerRef,conversationOpen,destination,onTalk,onArrive,children}:Props) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const orbit=useRef(new MapOrbit()),suppressClick=useRef(false);
  const artboard=useRef<HTMLDivElement>(null),actorElement=useRef<HTMLDivElement>(null);
  const petElements=useRef<Partial<Record<import('@/lib/quest-preview/pet-sprites').Pet,HTMLDivElement>>>({});
  const lastPoses=useRef<Actors|null>(null);
  const engine=useRef<QuestRenderer|null>(null);
  const currentVariant=useRef(variant);
  useEffect(()=>{artboard.current?.style.setProperty('--camera-preview-zoom',String(cameraPreview(window.location.search).zoom));},[]);
  useEffect(()=>{currentVariant.current=variant;},[variant]);
  useEffect(()=>{orbit.current.reset();},[variant.city,variant.edition]);
  const paintBuildings=useCallback(()=>{
    const node=artboard.current;if(!node)return;
    const width=node.clientWidth,height=node.clientHeight,fit=Math.min(width/1440,height/980);
    node.style.setProperty('--board-width',`${width}px`);node.style.setProperty('--label-y',`${height*.38}px`);
    const targets=engine.current?.buildings()??projectBuildings(currentVariant.current,fallbackCamera(currentVariant.current,1440,980),1440,980);
    for(const path of sceneBuildingPaths(currentVariant.current))for(const [key,value]of Object.entries(targets[path])){
      const fitted=engine.current?value:value*fit+(key==='left'?(width-1440*fit)/2:key==='top'?(height-980*fit)/2:0);
      const name=`--${path}-${key}`,css=`${fitted.toFixed(2)}px`;if(node.style.getPropertyValue(name)!==css)node.style.setProperty(name,css);
    }
  },[]);
  // Characters arrive with their city; their source frames and gait stay untouched.
  useEffect(()=>{
    if(reduced)return;
    const animations=[actorElement.current,...Object.values(petElements.current)].flatMap(node=>node?[node.animate([{opacity:0},{opacity:1}],{duration:900,easing:'ease-out'})]:[]);
    return()=>animations.forEach(animation=>animation.cancel());
  },[variant.city,variant.edition,reduced]);
  const transitionCanvas=useRef<HTMLCanvasElement>(null);
  const [mode,setMode]=useState<'loading'|'webgl'|'illustrated'>('loading');
  const greet=useCallback(()=>controllerRef.current?.greet(),[controllerRef]);
  const paintPets=useCallback((poses:Actors)=>{
    const width=artboard.current?.clientWidth||1,height=artboard.current?.clientHeight||1;
    const pixels=engine.current?engine.current.pixelsPerUnit():worldPixelsPerUnit(1440,980)/cityLayout(currentVariant.current.city,currentVariant.current.edition).camera.fit*Math.min(width/1440,height/980);
    for(const pet of PET_IDS){
      const pose=poses[pet],node=petElements.current[pet];
      let p=engine.current?.projectFloor(pose.x,pose.z);
      if(!p){const fitted=Math.min(width/1440,height/980),projected=project(fallbackCamera(currentVariant.current,1440,980),[pose.x,.4,pose.z],1440,980);p={x:(width-1440*fitted)/2+projected.x*fitted,y:(height-980*fitted)/2+projected.y*fitted};}
      if(node){
        node.style.transform=`translate3d(${p.x}px,${p.y}px,0) translate(-50%,-96.875%)`;
        const size=`${petSize(pixels,pet)}px`;if(node.style.width!==size){node.style.width=size;node.style.height=size;}
        const sheet=node.querySelector<HTMLElement>('.quest-pet-sheet'),facing=node.querySelector<HTMLElement>('.quest-pet-facing');
        const frame=petFrame(pet,pose);if(sheet)sheet.style.transform=`translate3d(${-frame%5*20}%,${-Math.floor(frame/5)*50}%,0)`;
        if(facing)facing.style.transform=Math.sin(pose.angle)<-.1?'scaleX(-1)':'none';
      }
    }
  },[]);
  const attachSprite=useCallback(()=>{
    const node=actorElement.current,root=node?.querySelector<HTMLElement>('.assistant-sprite');
    const ready=!!(engine.current&&root&&engine.current.sprite(root));
    if(node)node.dataset.gpu=String(ready);
    if(artboard.current)artboard.current.dataset.actorReady=String(ready);
  },[]);
  const onMotion=useCallback((poses:Actors,entry:EntryFrame|null=null)=>{
    engine.current?.journey(entry);attachSprite();
    lastPoses.current=poses;
    const width=artboard.current?.clientWidth||1,height=artboard.current?.clientHeight||1;
    let scale=engine.current?.actorScale()??guideScale(worldPixelsPerUnit(width,height));
    let point=engine.current?.actors(poses);
    if(!point){
      const fitted=Math.min(width/1440,height/980);
      const p=project(fallbackCamera(currentVariant.current,1440,980),[poses.guide.x,.4,poses.guide.z],1440,980);
      point={x:(width-1440*fitted)/2+p.x*fitted,y:(height-980*fitted)/2+p.y*fitted};
      const preview=cameraPreview(window.location.search);
      scale=guideScale(worldPixelsPerUnit(1440,980)/cityLayout(currentVariant.current.city,currentVariant.current.edition).camera.fit*fitted)*preview.avatar*preview.zoom;
    }
    positionActor(actorElement.current,point,scale);
    paintPets(poses);paintBuildings();
    return {...point,scale};
  },[paintPets,paintBuildings,attachSprite]);
  useEffect(()=>{
    const resize=()=>{if(!engine.current&&lastPoses.current)onMotion(lastPoses.current);};
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(resize);
    if(artboard.current)observer?.observe(artboard.current);window.addEventListener('resize',resize);
    return()=>{observer?.disconnect();window.removeEventListener('resize',resize);};
  },[onMotion]);
  useEffect(()=>{
    if(illustrated)return;
    let active=true;
    void import('@/lib/quest-preview/renderer').then(({createQuestRenderer})=>{
      if(!active||!canvas.current)return;
      try{
        let ready=false;
        engine.current=createQuestRenderer(canvas.current,(points)=>{
          if(!ready){ready=true;if(active)setMode('webgl');}
          const node=worldRef.current;if(!node)return;
          attachSprite();positionActor(actorElement.current,points.guide,engine.current?.actorScale()??guideScale(worldPixelsPerUnit(canvas.current?.clientWidth||1,canvas.current?.clientHeight||1)));
          if(lastPoses.current)paintPets(lastPoses.current);
          paintBuildings();
        },()=>{engine.current=null;if(active)setMode('illustrated');});
      }catch(error){console.warn('Quest preview renderer unavailable:',error);setMode('illustrated');}
    }).catch(()=>{if(active)setMode('illustrated');});
    return()=>{active=false;engine.current?.destroy();engine.current=null;};
  },[illustrated,worldRef,paintPets,paintBuildings,attachSprite]);
  // Latest props apply even when the deferred renderer finishes loading later.
  useEffect(()=>{
    const layer=transitionCanvas.current;
    if(layer)clearSceneTransition(layer);
    if(engine.current?.variant(variant,reduced?undefined:layer??undefined)&&layer&&!reduced){
      fadeSceneFrame(layer);
    }
    paintBuildings();
    return()=>{if(layer)clearSceneTransition(layer);};
  },[variant,mode,paintBuildings,reduced]);
  useEffect(()=>{engine.current?.motion(paused||conversationOpen,reduced);},[paused,reduced,conversationOpen,mode]);
  useEffect(()=>{engine.current?.focus(focus);},[focus,mode]);
  const fallback=illustrated||mode!=='webgl';
  useEffect(()=>{if(fallback){if(actorElement.current)delete actorElement.current.dataset.gpu;if(artboard.current)artboard.current.dataset.actorReady='false';if(destination)onUnavailable();}},[fallback,destination,onUnavailable]);
  useEffect(()=>{
    if(!fallback)return;
    // A fixed illustration uses responsive CSS anchors. Pixel projections from
    // a previous WebGL viewport must not survive a mode change or context loss.
    const node=worldRef.current;
    for(const key of ['portfolio','world','concepts','guide'])for(const axis of ['x','y'])node?.style.removeProperty(`--${key}-${axis}`);
  },[fallback,worldRef]);
  function rotate(yaw:number,pitch:number){
    const view=orbit.current.set(yaw,pitch);engine.current?.orbit(view.yaw,view.pitch);
  }
  function finishDrag(id:number,node:HTMLDivElement){
    if(orbit.current.pointerId!==id)return;
    suppressClick.current=orbit.current.end(id)||suppressClick.current;
    node.removeAttribute('data-dragging');if(node.hasPointerCapture(id))node.releasePointerCapture(id);
  }
  return <div ref={node=>{artboard.current=node;worldRef.current=node;}} className="quest-artboard" data-renderer={fallback?'illustration':'webgl'}
    tabIndex={fallback?undefined:destination?-1:0} role="group" aria-label={fallback?'Illustrated map':'Interactive 3D map'} aria-describedby={fallback?undefined:'quest-orbit-help'}
    onPointerDown={event=>{
      if(fallback||destination||event.button!==0||!event.isPrimary||(event.target as HTMLElement).closest('a,button,input,textarea,select,summary'))return;
      suppressClick.current=false;
      if(orbit.current.begin(event.pointerId,event.clientX,event.clientY,event.pointerType==='touch')){
        event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.focus({preventScroll:true});
      }
    }} onPointerMove={event=>{
      if(fallback||destination||!orbit.current.dragging)return;
      const r=event.currentTarget.getBoundingClientRect();
      const view=orbit.current.move(event.pointerId,event.clientX,event.clientY,r.width,r.height);
      if(view){event.currentTarget.dataset.dragging='true';engine.current?.orbit(view.yaw,view.pitch);}
    }} onPointerUp={event=>finishDrag(event.pointerId,event.currentTarget)} onPointerCancel={event=>finishDrag(event.pointerId,event.currentTarget)}
    onLostPointerCapture={event=>finishDrag(event.pointerId,event.currentTarget)}
    onClickCapture={event=>{if(event.detail>0&&suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}
    onKeyDown={event=>{
      if(fallback||destination||event.target!==event.currentTarget)return;
      const controller=orbit.current;
      if(event.key==='Escape'&&controller.dragging){const pointer=controller.pointerId,view=controller.cancel();if(pointer!==null&&event.currentTarget.hasPointerCapture(pointer))event.currentTarget.releasePointerCapture(pointer);event.currentTarget.removeAttribute('data-dragging');if(view)engine.current?.orbit(view.yaw,view.pitch);event.preventDefault();}
      else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)){
        event.preventDefault();rotate(event.key==='Home'?0:controller.yaw+(event.key==='ArrowLeft'?-.13:event.key==='ArrowRight'?.13:0),event.key==='Home'?0:controller.pitch+(event.key==='ArrowUp'?.035:event.key==='ArrowDown'?-.035:0));
      }
    }}>
    <Image className="quest-illustration" src={`/quest-preview/${variantId(variant)}.webp`} alt="" width={1440} height={980} unoptimized priority aria-hidden="true" />
    {!illustrated?<canvas ref={canvas} className="quest-canvas" aria-hidden="true" data-ready={mode==='webgl'} />:null}
    {fallback?<span className="quest-render-note">Illustrated view · {variant.conceptLab?'All three paths':'Both paths'} are available</span>:null}
    <canvas ref={transitionCanvas} className="quest-live-outgoing" aria-hidden="true"/>
    {fallback&&variantId(previousVariant)!==variantId(variant)&&!reduced?<Image key={variantId(variant)} className="quest-scene-outgoing" src={`/quest-preview/${variantId(previousVariant)}.webp`} alt="" width={1440} height={980} unoptimized aria-hidden="true"/>:null}
    {isSnow(variant)?<span className="quest-weather quest-weather--snow" aria-hidden="true"><span/></span>:variant.season==='raining'?<span className="quest-weather quest-weather--rain" aria-hidden="true"><span/></span>:null}
    {!fallback?<><p id="quest-orbit-help" className="sr-only">Drag empty map space to rotate. Arrow keys rotate and tilt when the map is focused. Home resets the view. Escape cancels a drag. On touch screens, swipe horizontally to rotate; vertical swipes scroll.</p>
      {controlsTarget?createPortal(<div className="quest-orbit-tools" role="group" aria-label="Map camera controls"><button type="button" aria-label="Reset view" disabled={!!destination} onClick={()=>rotate(0,0)}>Reset view</button></div>,controlsTarget):null}</>:null}
    <QuestActors city={variant.city} edition={variant.edition??'original'} sceneRef={artboard} onPhase={onPhase} controllerRef={controllerRef} elementRef={actorElement} onMotion={onMotion} onTalk={onTalk}
      paused={paused} reduced={reduced} conversationOpen={conversationOpen} petsMoving={!destination} destination={destination} onArrive={onArrive}/>
    {children}
    <QuestPets petRefs={petElements}/>
    <QuestIdlePrompt busy={paused||conversationOpen||!!destination} sceneRef={artboard} onPrompt={greet}/>
    <p className="sr-only">The supplied capybara, cat, sloth, kitsune and Frenchie characters explore the city walkways. Pet motion pauses with the world.</p>
  </div>;
}

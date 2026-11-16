'use client';
import type {PetSpace} from '@/lib/quest-preview/pet-space';
import {useEffect,useImperativeHandle,useRef,type RefObject} from 'react';
import {QuestGuideSprite as GuideSprite} from './guide-sprite';
import {QuestSpritePlayer} from '@/lib/quest-preview/quest-sprite-player';
import {questTurnFrames as turnFrames} from '@/lib/quest-preview/avatar-animation';
import type {Facing} from '@/lib/guide/assistant-motion';
import {observeGuideVisibility} from '@/lib/guide/observe-visibility';
import {guideGait} from '@/lib/quest-preview/guide-gait';
import {motionDelta,travelFacing} from '@/lib/quest-preview/character-motion';
import {DestinationTransition,entryPortal,type EntryFrame,type EntryPhase,type Portal} from '@/lib/quest-preview/destination-transition';
import type {City,SceneEdition} from '@/lib/quest-preview/variants';
import {IslandActors,type Actors,type Destination,type EntryRoutes} from '@/lib/quest-preview/actors';

export type QuestActorsHandle={navigate:(path:Destination)=>boolean;cancel:()=>boolean;greet:()=>void;readonly trigger:HTMLButtonElement|null};
type Props={petSpace?:PetSpace;routes?:EntryRoutes;portals?:Record<Destination,Portal>;city:City;edition:SceneEdition;sceneRef:RefObject<HTMLDivElement|null>;onPhase:(phase:EntryPhase|null)=>void;
  controllerRef:RefObject<QuestActorsHandle|null>;elementRef:RefObject<HTMLDivElement|null>;
  onMotion:(actors:Actors,entry:EntryFrame|null)=>{x:number;y:number;scale:number;facing?:Facing};onTalk:(button:HTMLButtonElement)=>void;onArrive:(path:Destination)=>void;
  paused:boolean;reduced:boolean;conversationOpen:boolean;petsMoving:boolean;destination:Destination|null;
};
type Driver={wake:()=>void;hold:(value:boolean)=>void;greet:()=>void;freeze:(value:boolean,front:boolean)=>void;pets:(value:boolean)=>void;cancel:()=>boolean;navigate:(path:Destination)=>boolean};
export function QuestActors({petSpace,routes,portals,city,edition,sceneRef,onPhase,controllerRef,elementRef,onMotion,onTalk,paused,reduced,conversationOpen,petsMoving,destination,onArrive}:Props){
  const arrived=useRef(onArrive),phaseChanged=useRef(onPhase);
  useEffect(()=>{arrived.current=onArrive;phaseChanged.current=onPhase;},[onArrive,onPhase]);
  const sprite=useRef<HTMLSpanElement>(null),button=useRef<HTMLButtonElement>(null),driver=useRef<Driver|null>(null);
  useImperativeHandle(controllerRef,()=>({navigate:path=>paused||reduced?false:driver.current?.navigate(path)??false,cancel:()=>driver.current?.cancel()??true,greet:()=>driver.current?.greet(),get trigger(){return button.current;}}),[paused,reduced]);
  useEffect(()=>{
    const root=sprite.current,actor=button.current,node=elementRef.current;
    if(!root||!actor||!node)return;
    const simulation=new IslandActors(city,edition,routes,petSpace),journey=new DestinationTransition(city,edition,portals);
    let entryFrame:EntryFrame|null=null,lastPhase:EntryPhase|null=null;
    let disposed=false,frozen=true,visible=true,frame=0,timer=0,last=performance.now(),paintKey='',facing:Facing='front',turning=false,jogging=false;
    let delivered=false;
    const player=new QuestSpritePlayer(root,()=>wake());
    const stop=()=>{cancelAnimationFrame(frame);clearTimeout(timer);frame=0;timer=0;};
    function emit(poses:Actors,delta=0){
      entryFrame=journey.advance(delta,poses.guide,!!simulation.arrived);
      if(entryFrame)poses={...poses,guide:entryFrame.pose};
      const phase=entryFrame?.phase??null;
      if(phase!==lastPhase){lastPhase=phase;phaseChanged.current(phase);}
      const point=onMotion(poses,entryFrame),walking=poses.guide.walking;
      const gait=guideGait(poses.guide,point.scale,jogging);
      const direction=point.facing??travelFacing(poses.guide.angle,facing),depth=direction==='front'||direction==='back';
      node!.style.setProperty('--run-bob',`${(depth?gait.bob*.35:gait.bob).toFixed(2)}px`);node!.style.setProperty('--run-lean',`${depth?0:gait.lean}deg`);
      if(entryFrame?.phase==='complete'){if(!delivered){delivered=true;player.play('idle-back');arrived.current(entryFrame.destination);}return;}
      if(entryFrame&&['aligning','entering','committing'].includes(entryFrame.phase)){
        const target=point.facing??'back';
        const settle=()=>{turning=false;if(target==='front'||target==='back')player.play(`idle-${target}`);};
        if(facing!==target){const sequence=turnFrames(facing,target);facing=target;turning=true;player.sequence('turn',sequence,false,settle);}
        else if(!turning){if(target==='front'||target==='back')player.play(`idle-${target}`);}return;
      }
      if(frozen||document.hidden||!visible||!player.ready)return;
      const preparing=poses.guide.preparing;
      // Preparing and walking share a target: starting to move must not restart a turn.
      const key=walking||preparing?direction:'front';
      if(key!==paintKey){
        paintKey=key;turning=false;
        const target=walking||preparing?direction:'front',sequence=turnFrames(facing,target);facing=target;
        if(sequence.length){turning=true;player.sequence('turn',sequence,false,()=>{turning=false;if(target==='front')player.play('idle-front');});}
        else if(target==='front')player.play('idle-front');
      }
      if(walking&&!turning){if(direction==='front'||direction==='back')player.depthWalk(direction,gait.distance);else player.walk(direction,gait.distance);}
    }
    function schedule(){
      if(disposed||frozen||document.hidden||!visible||entryFrame?.phase==='complete')return;
      const wait=journey.active?0:simulation.wait;
      if(wait>0)timer=window.setTimeout(()=>{timer=0;step(performance.now());},Math.max(80,wait));
      else frame=requestAnimationFrame(step);
    }
    function step(now:number){
      frame=0;if(disposed||frozen||document.hidden||!visible)return;
      const delta=now-last;last=now;
      const tickDelta=motionDelta(delta,journey.active||simulation.wait===0);
      emit(simulation.advance(tickDelta),tickDelta);schedule();
    }
    function wake(){stop();last=performance.now();if(disposed)return;emit(simulation.poses);schedule();}
    const environment=()=>{stop();last=performance.now();if(document.hidden||!visible)player.stop();else{paintKey='';wake();}};
    document.addEventListener('visibilitychange',environment);
    const unobserve=observeGuideVisibility(sceneRef.current??node,isVisible=>{visible=isVisible;environment();});
    driver.current={
      wake,
      hold(value){if(journey.active)return;simulation.holdGuide(value);wake();if(value&&!frozen)player.play('wave',()=>player.play('idle-front'));},
      greet(){if(journey.active)return;simulation.holdGuide(true);wake();if(!frozen)player.play('wave',()=>{player.play('idle-front');simulation.holdGuide(false);wake();});},
      freeze(value,front){frozen=value;root.dataset.motion=value?'static':'running';stop();last=performance.now();if(front){simulation.holdGuide(true);player.staticFront();facing='front';}else player.stop();if(!value){simulation.holdGuide(document.activeElement===actor&&actor.matches(':focus-visible'));paintKey='';wake();}},
      pets(value){simulation.animatePets(value);wake();},
      cancel(){if(journey.active&&!journey.cancel())return false;jogging=false;delivered=false;entryFrame=null;simulation.cancel();paintKey='';wake();return true;},
      navigate(path){
        const bounds=node.getBoundingClientRect();
        if(journey.active||!visible||document.hidden||!player.ready||bounds.bottom<0||bounds.top>innerHeight)return false;
        frozen=false;simulation.holdGuide(false);
        jogging=true;delivered=false;simulation.navigate(path,(portals?.[path]??entryPortal(city,path,edition)).speed);journey.start(path,simulation.poses.guide,simulation.entryLength);paintKey='';wake();return true;
      },
    };
    emit(simulation.poses);
    return()=>{disposed=true;stop();unobserve();document.removeEventListener('visibilitychange',environment);player.destroy();driver.current=null;};
  },[elementRef,onMotion,city,sceneRef,edition,routes,portals,petSpace]);
  useEffect(()=>{driver.current?.freeze(paused||reduced||conversationOpen,reduced||conversationOpen);},[paused,reduced,conversationOpen,city,edition]);
  useEffect(()=>{driver.current?.pets(petsMoving);},[petsMoving,city,edition]);
  return <div ref={elementRef} className="quest-walker">
    <button ref={button} type="button" className="wayfinder-avatar" disabled={!!destination}
      aria-label={destination?'On my way — Wayfinder is walking toward the selected destination':conversationOpen?'Close conversation — Wayfinder':'Talk to me — Wayfinder, the local scripted guide'}
      aria-expanded={conversationOpen} aria-controls={conversationOpen?'companion-panel':undefined}
      onClick={event=>onTalk(event.currentTarget)}
      onPointerEnter={event=>{if(event.pointerType!=='touch')driver.current?.hold(true);}}
      onPointerLeave={()=>{if(!button.current?.matches(':focus-visible'))driver.current?.hold(false);}}
      onPointerDown={()=>driver.current?.hold(true)} onPointerCancel={()=>driver.current?.hold(false)}
      onPointerUp={()=>{if(!button.current?.matches(':focus-visible'))driver.current?.hold(false);}}
      onFocus={event=>{if(event.currentTarget.matches(':focus-visible'))driver.current?.hold(true);}}
      onBlur={()=>driver.current?.hold(false)}>
      <GuideSprite spriteRef={sprite}/><span className="avatar-caption">{destination?'On my way':'Talk to me'}</span>
    </button>
  </div>;
}

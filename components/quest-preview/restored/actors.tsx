'use client';
import {useEffect,useImperativeHandle,useRef,type RefObject} from 'react';
import {GuideSprite} from '@/components/entrance/guide-sprite';
import {SpritePlayer} from '@/lib/guide/sprite-player';
import {turnFrames,type Facing} from '@/lib/guide/assistant-motion';
import {observeGuideVisibility} from '@/lib/guide/observe-visibility';
import {guideGait} from '@/lib/quest-preview/restored/guide-gait';
import {IslandActors,type Actors,type Destination} from '@/lib/quest-preview/restored/actors';

export type QuestActorsHandle={navigate:(path:Destination)=>boolean;cancel:()=>void;greet:()=>void;readonly trigger:HTMLButtonElement|null};
type Props={
  controllerRef:RefObject<QuestActorsHandle|null>;elementRef:RefObject<HTMLDivElement|null>;
  onMotion:(actors:Actors)=>{x:number;y:number;scale:number};onTalk:(button:HTMLButtonElement)=>void;onArrive:(path:Destination)=>void;
  paused:boolean;reduced:boolean;conversationOpen:boolean;petsMoving:boolean;destination:Destination|null;
};
type Driver={wake:()=>void;hold:(value:boolean)=>void;greet:()=>void;freeze:(value:boolean,front:boolean)=>void;pets:(value:boolean)=>void;cancel:()=>void;navigate:(path:Destination)=>boolean};
export function QuestActors({controllerRef,elementRef,onMotion,onTalk,paused,reduced,conversationOpen,petsMoving,destination,onArrive}:Props){
  const arrived=useRef(onArrive);
  useEffect(()=>{arrived.current=onArrive;},[onArrive]);
  const sprite=useRef<HTMLSpanElement>(null),button=useRef<HTMLButtonElement>(null),driver=useRef<Driver|null>(null);
  useImperativeHandle(controllerRef,()=>({navigate:path=>paused||reduced?false:driver.current?.navigate(path)??false,cancel:()=>driver.current?.cancel(),greet:()=>driver.current?.greet(),get trigger(){return button.current;}}),[paused,reduced]);
  useEffect(()=>{
    const root=sprite.current,actor=button.current,node=elementRef.current;
    if(!root||!actor||!node)return;
    const simulation=new IslandActors();
    let disposed=false,frozen=true,visible=true,frame=0,timer=0,last=performance.now(),paintKey='',facing:Facing='front',turning=false,jogging=false;
    let delivered=false;
    const player=new SpritePlayer(root,()=>wake());
    const stop=()=>{cancelAnimationFrame(frame);clearTimeout(timer);frame=0;timer=0;};
    function emit(poses:Actors){
      const point=onMotion(poses),walking=poses.guide.walking;
      const gait=guideGait(poses.guide,point.scale,jogging);
      node!.style.setProperty('--run-bob',`${gait.bob.toFixed(2)}px`);node!.style.setProperty('--run-lean',`${gait.lean}deg`);
      if(simulation.arrived){if(!delivered){delivered=true;player.play('idle-back');arrived.current(simulation.arrived);}return;}
      if(frozen||document.hidden||!visible||!player.ready)return;
      const direction:Facing=Math.sin(poses.guide.angle)<-.1?'left':'right';
      const preparing=poses.guide.preparing;
      const key=walking?`walk-${direction}`:preparing?`turn-${direction}`:'idle';
      if(key!==paintKey){
        paintKey=key;turning=false;
        const target=walking||preparing?direction:'front',sequence=turnFrames(facing,target);facing=target;
        if(sequence.length){turning=true;player.sequence('turn',sequence,false,()=>{turning=false;if(target==='front')player.play('idle-front');});}
        else if(target==='front')player.play('idle-front');
      }
      if(walking&&!turning)player.walk(direction as 'left'|'right',gait.distance);
    }
    function schedule(){
      if(disposed||frozen||document.hidden||!visible)return;
      const wait=simulation.wait;
      if(wait>0)timer=window.setTimeout(()=>{timer=0;step(performance.now());},Math.max(80,wait));
      else frame=requestAnimationFrame(step);
    }
    function step(now:number){
      frame=0;if(disposed||frozen||document.hidden||!visible)return;
      if(now-last<1000/30){frame=requestAnimationFrame(step);return;}
      const delta=now-last;last=now;emit(simulation.advance(delta));schedule();
    }
    function wake(){stop();last=performance.now();if(disposed)return;emit(simulation.poses);schedule();}
    const environment=()=>{stop();last=performance.now();if(document.hidden||!visible)player.stop();else{paintKey='';wake();}};
    document.addEventListener('visibilitychange',environment);
    const unobserve=observeGuideVisibility(node,isVisible=>{visible=isVisible;environment();});
    driver.current={
      wake,
      hold(value){simulation.holdGuide(value);wake();if(value&&!frozen)player.play('wave',()=>player.play('idle-front'));},
      greet(){simulation.holdGuide(true);wake();if(!frozen)player.play('wave',()=>{player.play('idle-front');simulation.holdGuide(false);wake();});},
      freeze(value,front){frozen=value;stop();last=performance.now();if(front){simulation.holdGuide(true);player.staticFront();facing='front';}else player.stop();if(!value){simulation.holdGuide(document.activeElement===actor&&actor.matches(':focus-visible'));paintKey='';wake();}},
      pets(value){simulation.animatePets(value);wake();},
      cancel(){jogging=false;delivered=false;simulation.cancel();paintKey='';wake();},
      navigate(path){
        const bounds=node.getBoundingClientRect();
        if(!visible||document.hidden||!player.ready||bounds.bottom<0||bounds.top>innerHeight)return false;
        frozen=false;simulation.holdGuide(false);
        jogging=true;delivered=false;simulation.navigate(path);paintKey='';wake();return true;
      },
    };
    emit(simulation.poses);
    return()=>{disposed=true;stop();unobserve();document.removeEventListener('visibilitychange',environment);player.destroy();driver.current=null;};
  },[elementRef,onMotion]);
  useEffect(()=>{driver.current?.freeze(paused||reduced||conversationOpen,reduced||conversationOpen);},[paused,reduced,conversationOpen]);
  useEffect(()=>{driver.current?.pets(petsMoving);},[petsMoving]);
  return <div ref={elementRef} className="quest-walker">
    <button ref={button} type="button" className="wayfinder-avatar" disabled={!!destination}
      aria-label={destination?'On my way — Wayfinder is walking toward the selected destination':'Talk to me — Wayfinder, the local scripted guide'}
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

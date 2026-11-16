import type {ActorPose,Destination} from './actors.ts';
import type {City,SceneEdition} from './variants.ts';
import type {V3} from './math.ts';
import {TURN_SETTLE_MS} from './avatar-animation.ts';
export type EntryPhase='turning'|'walking'|'aligning'|'entering'|'committing'|'complete';
export type EntryFrame={city:City;edition:SceneEdition;destination:Destination;phase:EntryPhase;progress:number;entry:number;push:number;elapsed:number;pose:ActorPose;floorY:number;opacity:number};
export type Portal={point:V3;inside:V3;width:number;height:number;stairs:boolean;speed:number;pitch:number};
/** Actual front planes and thresholds, authored against the six destination meshes. */
export const ENTRY_PORTALS:Record<City,Record<Exclude<Destination,'concepts'>,Portal>>={
 nyc:{portfolio:{point:[-6,.35,-.11],inside:[-6,.4,-.95],width:2.2,height:2.85,stairs:false,speed:3.6,pitch:0},world:{point:[5.6,.38,1.35],inside:[5.6,-1,1.25],width:2.7,height:3.3,stairs:true,speed:3.6,pitch:1.08}},
 tokyo:{portfolio:{point:[-5.8,.35,-1.58],inside:[-5.8,.4,-2.3],width:2.2,height:2.85,stairs:false,speed:3.9,pitch:0},world:{point:[6,.35,.32],inside:[6,.4,-.45],width:2.2,height:2.85,stairs:false,speed:3.8,pitch:0}},
 bangkok:{portfolio:{point:[-6,.35,-1.85],inside:[-6,.4,-2.55],width:2.2,height:2.85,stairs:false,speed:3.9,pitch:0},world:{point:[6,.35,-.35],inside:[6,.4,-1.25],width:2.2,height:2.85,stairs:false,speed:3.6,pitch:0}},
};
export function entryPortal(city:City,destination:Destination,edition:SceneEdition='original'):Portal{
 if(destination==='concepts')return {point:[0,.35,11.16],inside:[0,.4,10.4],width:1.3,height:2.8,stairs:false,speed:3.8,pitch:0};
 if(edition==='restored')return destination==='portfolio'?{point:[-5.3,.35,-.9],inside:[-5.3,.4,-1.6],width:2.2,height:2.85,stairs:false,speed:3.8,pitch:0}:{point:[5.1,.35,-2.68],inside:[5.1,.4,-3.5],width:2.7,height:3.3,stairs:false,speed:3.8,pitch:0};
 if(edition==='new')return ENTRY_PORTALS[city][destination];
 if(edition==='classic')return destination==='portfolio'?{point:[-5.3,.35,-1.23],inside:[-5.3,.4,-1.8],width:1.6,height:2.5,stairs:false,speed:3.8,pitch:0}:{point:[5.1,.35,-2.65],inside:[5.1,.4,-3.3],width:2.7,height:3.3,stairs:false,speed:3.8,pitch:0};
 return destination==='portfolio'?{point:[-5.3,.35,-.66],inside:[-5.3,.4,-1.55],width:2.2,height:2.85,stairs:false,speed:3.8,pitch:0}:{point:[5.1,.35,-.9],inside:[5.1,.4,-1.9],width:2.2,height:2.85,stairs:false,speed:3.8,pitch:0};
}
export const ENTRY_TIMING={align:TURN_SETTLE_MS,enter:620,commit:380,return:650} as const;
export const smooth=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);};
const lerp=(a:number,b:number,t:number)=>t<=0?a:t>=1?b:a+(b-a)*t;
/** Virtual-clock machine; no wall timers, navigation, DOM or hidden-tab catch-up. */
export class DestinationTransition{
 private state:{destination:Destination;startDistance:number;length:number;elapsed:number;arrival:number|null;door:ActorPose}|null=null;
 readonly city:City;readonly edition:SceneEdition;
 private portals?:Record<Destination,Portal>;
 constructor(city:City,edition:SceneEdition='original',portals?:Record<Destination,Portal>){this.portals=portals;this.city=city;this.edition=edition;}
 start(destination:Destination,pose:ActorPose,length:number){
  if(this.state)return false;
  this.state={destination,startDistance:pose.distance,length:Math.max(.001,length),elapsed:0,arrival:null,door:{...pose}};return true;
 }
 get active(){return !!this.state;}
 get canCancel(){return !!this.state&&(this.state.arrival===null||this.state.elapsed-this.state.arrival<ENTRY_TIMING.align);}
 cancel(){if(!this.canCancel)return false;this.state=null;return true;}
 advance(delta:number,pose:ActorPose,arrived:boolean):EntryFrame|null{
  const s=this.state;if(!s)return null;
  s.elapsed+=Number.isFinite(delta)?Math.max(0,delta):0;
  if(arrived&&s.arrival===null){s.arrival=s.elapsed;s.door={...pose};}
  const after=s.arrival===null?0:Math.max(0,s.elapsed-s.arrival);
  const entry=smooth((after-ENTRY_TIMING.align)/ENTRY_TIMING.enter);
  const push=smooth((after-ENTRY_TIMING.align-ENTRY_TIMING.enter)/ENTRY_TIMING.commit);
  const phase:EntryPhase=s.arrival===null?(pose.preparing?'turning':'walking'):after<ENTRY_TIMING.align?'aligning':after<ENTRY_TIMING.align+ENTRY_TIMING.enter?'entering':push<1?'committing':'complete';
  const portal=this.portals?.[s.destination]??entryPortal(this.city,s.destination,this.edition),p=s.arrival===null?{...pose}:{...s.door,walking:false,preparing:false,angle:Math.PI,x:lerp(s.door.x,portal.inside[0],entry),z:lerp(s.door.z,portal.inside[2],entry)};
  return {city:this.city,edition:this.edition,destination:s.destination,phase,elapsed:s.elapsed,progress:Math.min(1,Math.max(0,(pose.distance-s.startDistance)/s.length)),entry,push,pose:p,floorY:lerp(.4,portal.inside[1],entry),opacity:1-smooth((entry-.38)/.62)};
 }
}

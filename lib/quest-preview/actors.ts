import {petCanTravel,petPoint,type PetSpace} from './pet-space.ts';
import {PET_IDS,PET_SPRITES,type Pet} from './pet-sprites.ts';
import {CONCEPT_GALLERY} from './concept-gallery-layout.ts';
import {cityLayout,onCityWalkway} from './city-layout.ts';
import type {City,SceneEdition} from './variants.ts';
import {travelProgress} from '../guide/assistant-motion.ts';
import {TURN_SETTLE_MS} from './avatar-animation.ts';
export type Point = readonly [number, number];
export type Destination = 'portfolio' | 'world' | 'concepts';
export type EntryRoutes=Record<Destination,{center:Point;door:Point;via:readonly Point[];width:number;depth:number}>;
export type ActorId = 'guide' | Pet;
export type ActorPose = {x:number; z:number; angle:number; walking:boolean; preparing:boolean; distance:number};
export type Actors = Record<ActorId, ActorPose>;
export const ENTRY_SPEED = 2.25;
export const ENTRY_TURN_MS = TURN_SETTLE_MS;
export const IDLE_PROMPT_MS = 10000;
export function canWalkEntry(event:{defaultPrevented:boolean;button:number;metaKey:boolean;ctrlKey:boolean;altKey:boolean;shiftKey:boolean},paused:boolean,reduced:boolean) {
  return !event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!event.shiftKey&&!paused&&!reduced;
}
export const GUIDE_HOME: Point = cityLayout('nyc').homes.guide;
export const PET_HOMES = {capybara:cityLayout('nyc').homes.capybara,cat:cityLayout('nyc').homes.cat};
export const DESTINATIONS = {portfolio:cityLayout('nyc').entries.portfolio.door,world:cityLayout('nyc').entries.world.door};
/** Historical export; default world now uses authored city sidewalks. */
export function onIsland(point:Point) {return onCityWalkway('nyc',point);}
export function pathLength(points:readonly Point[]) {
  return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);
}
export function samplePath(points:readonly Point[],progress:number) {
  let distance=pathLength(points)*Math.max(0,Math.min(1,progress));
  for(let i=1;i<points.length;i++) {
    const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(length<.000001)continue;
    if(distance<=length||i===points.length-1) {
      const t=length?Math.min(1,distance/length):1;
      return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[0]-a[0],b[1]-a[1])};
    }
    distance-=length;
  }
  return {x:points[0][0],z:points[0][1],angle:0};
}
/** Retrace a cancelled route through its actual segment instead of cutting lots. */
function reverseApproach(points:readonly Point[],pose:ActorPose):Point[]{
 let nearest=Infinity,index=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz;
  const t=length?Math.max(0,Math.min(1,((pose.x-a[0])*dx+(pose.z-a[1])*dz)/length)):0;
  const distance=Math.hypot(pose.x-a[0]-t*dx,pose.z-a[1]-t*dz);
  if(distance<nearest){nearest=distance;index=i-1;}
 }
 return [...points.slice(0,index+1)].reverse();
}
/** Resume an authored study path from the current segment instead of walking backwards. */
export function forwardApproach(point:Point,nodes:readonly Point[]):Point[]|null{
 let best:{distance:number;join:Point;index:number}|null=null;
 for(let i=1;i<nodes.length;i++){
  const a=nodes[i-1],b=nodes[i],dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz;
  if(!length)continue;
  const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dz)/length));
  const join:Point=[a[0]+dx*t,a[1]+dz*t],distance=Math.hypot(point[0]-join[0],point[1]-join[1]);
  if(!best||distance<best.distance)best={distance,join,index:i};
 }
 return best&&best.distance<.65?[best.join,...nodes.slice(best.index)]:null;
}
type Track={points:readonly Point[];start:number;duration:number;lead:number;length:number;distance:number};
type State={pose:ActorPose;track:Track|null;rest:number;step:number};
/** Pure virtual-clock simulation. The browser driver supplies scheduling and visibility. */
export class IslandActors {
  private clock=0;
  private destination:Destination|null=null;
  private hold=false;
  private pets=true;
  private returnRoute:readonly Point[]=[];
  private approach:readonly Point[]=[];
  private states:Record<ActorId,State>;
  private city:City;
  private edition:SceneEdition;
  private entries?:EntryRoutes;
  private petSpace?:PetSpace;
  constructor(city:City='nyc',edition:SceneEdition='original',entries?:EntryRoutes,petSpace?:PetSpace){
    this.petSpace=petSpace;
    this.entries=entries;
    this.edition=edition;
    this.city=city;
    const state=(p:Point,rest:number):State=>({pose:{x:p[0],z:p[1],angle:0,walking:false,preparing:false,distance:0},track:null,rest,step:0});
    const layout=cityLayout(city,edition);
    this.states={guide:state(layout.homes.guide,4500),...Object.fromEntries(PET_IDS.map((pet,i)=>{
      const lane=PET_SPRITES[pet].lane,points=layout.wander[lane];
      const s=state(petSpace?.homes[pet]??(i<2?layout.homes[lane]:points[(i-2)%points.length]),2200+i*1500);s.step=i;return [pet,s];
    }))} as Record<ActorId,State>;
  }
  get poses():Actors {return Object.fromEntries(Object.entries(this.states).map(([key,s])=>[key,{...s.pose}])) as Actors;}
  private plan(id:ActorId,points:readonly Point[],duration:number,lead=id==='guide'?TURN_SETTLE_MS:260) {
    const s=this.states[id];
    s.track={points,start:this.clock,duration,lead,length:pathLength(points),distance:s.pose.distance};
    const target=samplePath(points,.001);s.pose.angle=target.angle;s.pose.walking=false;s.pose.preparing=true;
  }
  navigate(destination:Destination,speed=ENTRY_SPEED) {
    this.destination=destination;this.hold=false;
    const {x,z}=this.states.guide.pose;
    // Authored pedestrian route follows this city's street/quay surfaces.
    const entry=this.entries?.[destination]??(destination==='concepts'?CONCEPT_GALLERY:cityLayout(this.city,this.edition).entries[destination]);
    const retreat=z<5&&this.approach.length?reverseApproach(this.approach,this.states.guide.pose):[];
    const forward=this.entries?forwardApproach([x,z],[...entry.via,entry.door]):null;
    const points:Point[]=[[x,z],...(forward??[...retreat,...entry.via,entry.door])];
    this.approach=points;
    this.returnRoute=[...points].reverse();
    this.plan('guide',points,pathLength(points)/speed*1000+ENTRY_TURN_MS,ENTRY_TURN_MS);
  }
  get entryLength(){return this.states.guide.track?.length??0;}
  get arrived():Destination|null {return this.destination&&!this.states.guide.track?this.destination:null;}

  cancel() {
    this.destination=null;
    const s=this.states.guide;
    if(s.track)this.returnRoute=reverseApproach(s.track.points,s.pose);
    s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+2600;
  }
  holdGuide(value:boolean) {
    this.hold=value;
    if(value&&!this.destination){const s=this.states.guide;s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+2600;}
  }
  animatePets(value:boolean) {
    if(this.pets===value)return;this.pets=value;
    for(const id of PET_IDS){const s=this.states[id];s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+(id==='capybara'?2300:4100);}
  }
  advance(delta:number) {
    this.clock+=Math.max(0,delta);
    for(const id of ['guide',...PET_IDS] as const) {
      const s=this.states[id];
      if(id==='guide'&&this.hold&&!this.destination)continue;
      if(id!=='guide'&&!this.pets)continue;
      if(s.track) {
        const t=s.track,elapsed=this.clock-t.start;
        const progress=travelProgress(Math.max(0,elapsed-t.lead),t.duration-t.lead);
        const p=samplePath(t.points,progress);
        if(id!=='guide'&&this.petSpace&&!petCanTravel(id,petPoint(s.pose),[p.x,p.z],this.poses,this.petSpace)){
          // Yield rather than intersect or jump forward after another pet has passed.
          s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+650+PET_IDS.indexOf(id)*170;continue;
        }
        // Keep facing changes controlled at path bends, using the shortest arc.
        const turn=Math.atan2(Math.sin(p.angle-s.pose.angle),Math.cos(p.angle-s.pose.angle));
        s.pose.angle+=turn*(1-Math.exp(-Math.max(0,delta)/110));
        s.pose.x=p.x;s.pose.z=p.z;s.pose.distance=t.distance+t.length*progress;
        s.pose.walking=elapsed>=t.lead&&progress<1;s.pose.preparing=elapsed<t.lead;
        if(progress>=1){s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+(id==='guide'?4500:id==='capybara'?7400:5400);}
      } else if(this.clock>=s.rest&&!(id==='guide'&&this.destination)) {
        const lane=id==='guide'?'guide':PET_SPRITES[id].lane;
        const pointsOnLane=id!=='guide'&&this.petSpace?this.petSpace.wander[id]:cityLayout(this.city,this.edition).wander[lane];
        const target=pointsOnLane[s.step++%pointsOnLane.length];
        if(id!=='guide'&&this.petSpace&&!petCanTravel(id,petPoint(s.pose),target,this.poses,this.petSpace)){s.rest=this.clock+650+PET_IDS.indexOf(id)*170;continue;}
        const points:Point[]=[[s.pose.x,s.pose.z]];
        if(id==='guide'&&this.returnRoute.length){points.push(...this.returnRoute);this.returnRoute=[];}
        points.push(target);
        const speed=id==='guide'?1.65:PET_SPRITES[id].speed;
        this.plan(id,points,Math.max(1800,pathLength(points)/speed*1000));
      }
    }
    return this.poses;
  }
  /** Rest periods use a timer, not an idle RAF loop. */
  get wait() {
    let wait=8000;
    for(const id of ['guide',...PET_IDS] as const){
      if(id==='guide'&&((this.hold&&!this.destination)||(this.destination&&!this.states.guide.track))||id!=='guide'&&!this.pets)continue;
      const s=this.states[id];if(s.track)return 0;wait=Math.min(wait,Math.max(0,s.rest-this.clock));
    }
    return wait;
  }
}
export function mayPrompt(context:{shown:boolean;hidden:boolean;busy:boolean;editing:boolean;visible:boolean},elapsed=IDLE_PROMPT_MS) {
  return elapsed>=IDLE_PROMPT_MS&&!context.shown&&!context.hidden&&!context.busy&&!context.editing&&context.visible;
}

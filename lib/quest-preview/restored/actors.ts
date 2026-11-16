import {travelProgress} from '../../guide/assistant-motion.ts';
export type Point = readonly [number, number];
export type Destination = 'portfolio' | 'world';
export type ActorId = 'guide' | 'capybara' | 'cat';
export type ActorPose = {x:number; z:number; angle:number; walking:boolean; preparing:boolean; distance:number};
export type Actors = Record<ActorId, ActorPose>;
export const ENTRY_SPEED = 2.25;
export const ENTRY_TURN_MS = 220;
export const IDLE_PROMPT_MS = 10000;
export function canWalkEntry(event:{defaultPrevented:boolean;button:number;metaKey:boolean;ctrlKey:boolean;altKey:boolean;shiftKey:boolean},paused:boolean,reduced:boolean) {
  return !event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!event.shiftKey&&!paused&&!reduced;
}
export const GUIDE_HOME: Point = [0,8.6];
export const PET_HOMES = {capybara:[-5.5,8] as Point, cat:[5.2,8.4] as Point};
export const DESTINATIONS = {portfolio:[-5.3,-.6] as Point,world:[5.1,-1.05] as Point};
const zones:Record<ActorId,readonly Point[]> = {
  guide:[[1.4,8.7],[-1.5,9.4],[.6,7.3],[-.9,8.1]],
  capybara:[[-6.5,7.3],[-4.3,8.5],[-5.6,9.2],[-7,7.4]],
  cat:[[4.2,9],[6.5,7.5],[3.5,7.4],[5.6,8.8]],
};
export function onIsland([x,z]:Point) {return (x/13.2)**2+(z/11.1)**2<1;}
export function pathLength(points:readonly Point[]) {
  return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);
}
export function samplePath(points:readonly Point[],progress:number) {
  let distance=pathLength(points)*Math.max(0,Math.min(1,progress));
  for(let i=1;i<points.length;i++) {
    const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(distance<=length||i===points.length-1) {
      const t=length?Math.min(1,distance/length):1;
      return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[0]-a[0],b[1]-a[1])};
    }
    distance-=length;
  }
  return {x:points[0][0],z:points[0][1],angle:0};
}
type Track={points:readonly Point[];start:number;duration:number;lead:number;length:number;distance:number};
type State={pose:ActorPose;track:Track|null;rest:number;step:number};
/** Pure virtual-clock simulation. The browser driver supplies scheduling and visibility. */
export class IslandActors {
  private clock=0;
  private destination:Destination|null=null;
  private hold=false;
  private pets=true;
  private states:Record<ActorId,State>;
  constructor(){
    const state=(p:Point,rest:number):State=>({pose:{x:p[0],z:p[1],angle:0,walking:false,preparing:false,distance:0},track:null,rest,step:0});
    this.states={guide:state(GUIDE_HOME,4500),capybara:state(PET_HOMES.capybara,2200),cat:state(PET_HOMES.cat,3700)};
  }
  get poses():Actors {return Object.fromEntries(Object.entries(this.states).map(([key,s])=>[key,{...s.pose}])) as Actors;}
  private plan(id:ActorId,points:readonly Point[],duration:number,lead=180) {
    const s=this.states[id];
    s.track={points,start:this.clock,duration,lead,length:pathLength(points),distance:s.pose.distance};
    const target=samplePath(points,.001);s.pose.angle=target.angle;s.pose.walking=false;s.pose.preparing=true;
  }
  navigate(destination:Destination) {
    this.destination=destination;this.hold=false;
    const {x,z}=this.states.guide.pose;
    // Travel the entire fork; route entry is signalled by arrival, not a wall timer.
    const side=destination==='portfolio'?-1:1;
    const points:Point[]=[[x,z],...(z>4?[[0,6.4] as Point]:[]),[0,2.6],[side*2.7,.5],DESTINATIONS[destination]];
    this.plan('guide',points,pathLength(points)/ENTRY_SPEED*1000+ENTRY_TURN_MS,ENTRY_TURN_MS);
  }
  get arrived():Destination|null {return this.destination&&!this.states.guide.track?this.destination:null;}

  cancel() {
    this.destination=null;
    const s=this.states.guide;s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+2600;
  }
  holdGuide(value:boolean) {
    this.hold=value;
    if(value&&!this.destination){const s=this.states.guide;s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+2600;}
  }
  animatePets(value:boolean) {
    if(this.pets===value)return;this.pets=value;
    for(const id of ['capybara','cat'] as const){const s=this.states[id];s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+(id==='capybara'?2300:4100);}
  }
  advance(delta:number) {
    this.clock+=Math.max(0,delta);
    for(const id of ['guide','capybara','cat'] as const) {
      const s=this.states[id];
      if(id==='guide'&&this.hold&&!this.destination)continue;
      if(id!=='guide'&&!this.pets)continue;
      if(s.track) {
        const t=s.track,elapsed=this.clock-t.start;
        const progress=travelProgress(Math.max(0,elapsed-t.lead),t.duration-t.lead);
        const p=samplePath(t.points,progress);
        // Keep facing changes controlled at path bends, using the shortest arc.
        const turn=Math.atan2(Math.sin(p.angle-s.pose.angle),Math.cos(p.angle-s.pose.angle));
        s.pose.angle+=turn*Math.min(1,Math.max(0,delta)/130);
        s.pose.x=p.x;s.pose.z=p.z;s.pose.distance=t.distance+t.length*progress;
        s.pose.walking=elapsed>=t.lead&&progress<1;s.pose.preparing=elapsed<t.lead;
        if(progress>=1){s.track=null;s.pose.walking=false;s.pose.preparing=false;s.rest=this.clock+(id==='guide'?4500:id==='capybara'?7400:5400);}
      } else if(this.clock>=s.rest&&!(id==='guide'&&this.destination)) {
        const target=zones[id][s.step++%zones[id].length];
        const points:Point[]=[[s.pose.x,s.pose.z]];
        if(id==='guide'&&s.pose.z<4)points.push([0,2.6],[0,6.5]);
        points.push(target);
        const speed=id==='guide'?1.65:id==='capybara'?.65:1;
        this.plan(id,points,Math.max(1800,pathLength(points)/speed*1000));
      }
    }
    return this.poses;
  }
  /** Rest periods use a timer, not an idle RAF loop. */
  get wait() {
    let wait=8000;
    for(const id of ['guide','capybara','cat'] as const){
      if(id==='guide'&&((this.hold&&!this.destination)||(this.destination&&!this.states.guide.track))||id!=='guide'&&!this.pets)continue;
      const s=this.states[id];if(s.track)return 0;wait=Math.min(wait,Math.max(0,s.rest-this.clock));
    }
    return wait;
  }
}
export function mayPrompt(context:{shown:boolean;hidden:boolean;busy:boolean;editing:boolean;visible:boolean},elapsed=IDLE_PROMPT_MS) {
  return elapsed>=IDLE_PROMPT_MS&&!context.shown&&!context.hidden&&!context.busy&&!context.editing&&context.visible;
}

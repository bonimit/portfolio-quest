import {PROVIDED_WALK} from './provided-avatar.ts';
import {turnFrames,type Facing} from '../guide/assistant-motion.ts';

export const POSE_BLEND_MS=200;
export const TURN_FRAME_MS=180;
export const TURN_SETTLE_MS=TURN_FRAME_MS*3;
/** Eight supplied forward frames, driven by travel distance just like the pets. */
export function questWalkFrame(facing:'left'|'right',distance:number){
  const frames=PROVIDED_WALK[facing];
  return frames[Math.floor(Math.max(0,distance)/36*frames.length)%frames.length];
}
export const questTurnFrames=(from:Facing,to:Facing)=>turnFrames(from,to).map(cue=>({...cue,duration:TURN_FRAME_MS}));

/** Blend states, never successive walking frames. Both silhouettes share one foot anchor. */
export class PoseBlend {
  private pose:string|null=null;
  private lastFrame=0;
  private from=0;
  private start=-Infinity;
  sample(pose:string,frame:number,now:number,staticView=false){
    if(this.pose!==pose){
      this.from=this.pose===null?frame:this.lastFrame;
      this.start=this.pose===null?-Infinity:now;
      this.pose=pose;
    }
    if(staticView){this.start=-Infinity;this.from=frame;}
    this.lastFrame=frame;
    const t=Math.max(0,Math.min(1,(now-this.start)/POSE_BLEND_MS));
    return {from:this.from,to:frame,mix:t*t*(3-2*t)};
  }
}

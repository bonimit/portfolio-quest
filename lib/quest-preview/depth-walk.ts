import type {Facing} from '../guide/assistant-motion.ts';

/** Face along the visible path, including when the island camera is rotated. */
export function projectedTravelFacing(dx:number,dy:number,previous:Facing):Facing{
 if(Math.hypot(dx,dy)<.001)return previous;
 const depth=previous==='front'||previous==='back';
 if(Math.abs(dx)<Math.abs(dy)*(depth?2.2:1.8))return dy<0?'back':'front';
 return dx<0?'left':'right';
}

/** Subtle articulated steps from the supplied front/back pose; travel drives the feet. */
export function depthStride(distance:number){
 const step=Math.sin(Math.max(0,distance)/36*Math.PI*2);
 return {step,leftLift:Math.max(0,step)*1.4,rightLift:Math.max(0,-step)*1.4};
}

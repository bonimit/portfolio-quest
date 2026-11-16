import type {ActorPose} from './actors.ts';
/** A longer stride fits the enlarged character. Camera movement never advances legs. */
export function guideGait(pose:ActorPose,scale:number,jogging:boolean){
  const distance=Math.max(0,pose.distance);
  return {distance:distance*15,bob:pose.walking&&jogging?-Math.abs(Math.sin(distance*Math.PI/1.2))*3*scale:0,lean:pose.walking&&jogging?(Math.sin(pose.angle)<0?-3:3):0};
}

import type {ActorPose} from './actors.ts';
/** One complete gait per two world units. Camera movement never advances the legs. */
export function guideGait(pose:ActorPose,scale:number,jogging:boolean){
  const distance=Math.max(0,pose.distance);
  return {distance:distance*18,bob:pose.walking&&jogging?-Math.abs(Math.sin(distance*Math.PI))*3*scale:0,lean:pose.walking&&jogging?(Math.sin(pose.angle)<0?-3:3):0};
}

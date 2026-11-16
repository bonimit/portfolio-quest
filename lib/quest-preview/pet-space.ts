import type {ActorPose,Actors,Point} from './actors.ts';
import {PET_IDS,type Pet} from './pet-sprites.ts';
export type PetSpace={homes:Record<Pet,Point>;wander:Record<Pet,readonly Point[]>;radii:Record<Pet,number>;bounds:Record<Pet,readonly [number,number,number,number]>;obstacles:readonly {x:number;z:number;radius:number}[]};
/** Minimum distance over the entire movement segment, including large virtual-clock ticks. */
function segmentDistance(a:Point,b:Point,p:Point){const dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/length)):0;return Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]);}
export function petCanTravel(pet:Pet,from:Point,to:Point,poses:Actors,space:PetSpace){
 const r=space.radii[pet],[left,right,back,front]=space.bounds[pet];
 if(to[0]-r<left||to[0]+r>right||to[1]-r<back||to[1]+r>front)return false;
 if(space.obstacles.some(o=>segmentDistance(from,to,[o.x,o.z])<r+o.radius))return false;
 return PET_IDS.every(other=>other===pet||segmentDistance([from[0],from[1]*.5],[to[0],to[1]*.5],[poses[other].x,poses[other].z*.5])>=r+space.radii[other]+.15);
}
export function petPoint(pose:ActorPose):Point{return [pose.x,pose.z];}
/** Separate grass clearings keep pets off the central walkway, pond, trees and buildings. */
export const STUDY_PET_SPACE:PetSpace={
 homes:{capybara:[-6.2,7.3],sloth:[-3.1,7.2],frenchie:[-4.6,9.3],cat:[4.3,7.3],kitsune:[6.5,8.8]},
 wander:{
  capybara:[[-5.8,7.35],[-4.7,8.4],[-3.4,8.9],[-5.9,9.1]],
  sloth:[[-3.2,7.6],[-4.1,9],[-5,7.5],[-3.1,8.8]],
  frenchie:[[-5.8,9.2],[-6.4,8.2],[-4.4,7.1],[-4,9.2]],
  cat:[[4.3,7.3],[5.3,8.7],[6.6,7.4],[4,9.1]],
  kitsune:[[6.5,8.8],[4.4,9],[4.4,7],[6.4,7]],
 },
 radii:{capybara:.7,sloth:.58,frenchie:.48,cat:.43,kitsune:.58},
 bounds:{capybara:[-7.3,-2.1,6.3,10],sloth:[-7.3,-2.1,6.3,10],frenchie:[-7.3,-2.1,6.3,10],cat:[2.4,7.7,6.3,10],kitsune:[2.4,7.7,6.3,10]},
 obstacles:[{x:-3.1,z:5,radius:.65},{x:3.4,z:4.8,radius:.65},{x:-7.7,z:5.1,radius:1.05},{x:8.3,z:5.8,radius:1.05},{x:-9.3,z:3,radius:1.4}],
};

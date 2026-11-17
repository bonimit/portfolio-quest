import {forestActorPose} from './karuizawa.ts';
import {kyotoActorPose} from './kyoto-life.ts';
import {parkActorPose} from './park-life.ts';
import {closedTrafficPath,nycTaxiPose} from './scene-traffic.ts';
import type {CultureActor} from './culture-scenes.ts';
import type {V3} from './math.ts';
const left=closedTrafficPath([[-4.6,-2.55],[-3.5,-2.55],[-3.5,-1.5],[-4.6,-1.5]]),right=closedTrafficPath([[3.5,-2.55],[4.6,-2.55],[4.6,-1.5],[3.5,-1.5]]);
export const CULTURE_PATHS={
 surfer:closedTrafficPath([[-11.6,-3.2],[-10.7,-3.4],[-10.25,-3.7],[-11.0,-3.5]]),
 kayaker:closedTrafficPath([[-5.0,-6.05],[-4.3,-5.95],[-4,-6.3],[-4.8,-6.45]]),
 paddler:closedTrafficPath([[4.0,-5.9],[4.7,-5.72],[5.1,-6.0],[4.4,-6.15]]),
 speedboat:closedTrafficPath([[-10.7,-4.3],[-9.85,-6.0],[-6,-7.0],[-1,-7.25],[4.8,-7.1],[9.9,-5.1],[10.5,-4.1],[7.5,-6.4],[3,-7.1],[-2,-7.15],[-7.4,-6.6]]),
 skier:closedTrafficPath([[-11.1,-4.6],[-11.35,-1.6],[-11.15,2.6],[-10.3,2.8],[-10.0,.4],[-10.0,-4.6],[-10.5,-4.9]]),
 lift:closedTrafficPath([[-10.3,-4.8],[-10.3,2.9],[-9.95,3.1],[-9.95,-4.8]])
};
export const skiHeight=(z:number)=>.55+(3.7-z)/9.3*3.63;
export function culturePose(actor:CultureActor,time:number){
 let x=0,y=.4,z=0,angle=0,scale=.82;
 if(['duck-boat','park-dog','frisbee-owner','frisbee','park-cyclist','picnicker'].includes(actor.kind)){({x,y,z,angle,scale}=parkActorPose(actor,time));}
 else if(actor.kind==='forest-bear'||actor.kind==='forest-bird'||actor.kind==='forest-boar'){({x,y,z,angle,scale}=forestActorPose(actor,time));}
 else if(actor.kind==='kimono-walker'||actor.kind==='tea-guest'){({x,y,z,angle,scale}=kyotoActorPose(actor,time));}
 else if(actor.kind==='visitor'){const path=actor.side!<0?left:right,p=path.pose(time*.32+actor.phase*path.length);({x,z,angle}=p);scale=.85;}
 else if(actor.kind==='wind-leaf'){const progress=(actor.phase+time*.055+Math.sin(time*.4)*.012)%1,gust=.5+.5*Math.sin(time*.45);x=-12+24*progress;z=2+(actor.phase*17%4.5)+Math.sin(time*1.6+actor.phase*9)*.35;y=.45+Math.sin(time*2+actor.phase*11)**2*(.15+gust*.65);angle=time*3+actor.phase*9;scale=.7*Math.max(.01,Math.min(1,progress/.06,(1-progress)/.06));}
 else if(actor.kind==='genie'){x=-11;y=.4+Math.sin(time*1.3)*.09;z=1.25;scale=1.05;angle=.1;}
 else if(actor.kind==='taxi'){const pose=nycTaxiPose(time,actor.phase,actor.side!==1);({x,z,angle,scale}=pose);y=.185;}
 else if(actor.kind==='sky-lantern'){
  const phase=(time*.052+actor.phase)%1,side=actor.side??1;
  x=side*(6.6+(actor.phase*29%3.8))+Math.sin(time*.7+actor.phase*12)*.28;z=-6.2-(actor.phase*19%2.5)+Math.sin(time*.3+actor.phase*7)*.15;y=.8+phase*8;angle=Math.sin(time*.6+actor.phase)*.18;scale=.9*Math.max(.01,Math.min(1,phase/.045,(1-phase)/.09));
 }else{
  const path=CULTURE_PATHS[actor.kind as keyof typeof CULTURE_PATHS],speed=actor.kind==='speedboat'?1.1:actor.kind==='skier'?.85:actor.kind==='lift'?.55:actor.kind==='surfer'?.45:.23,p=path.pose(time*speed+actor.phase*path.length);({x,z,angle}=p);
  if(actor.kind==='kayaker'&&actor.id.endsWith('1')){x-=2;z+=.3;}
  if(actor.kind==='skier'){y=skiHeight(z)+.035;scale=.72;}
  else if(actor.kind==='lift'){y=skiHeight(z)+1.1;scale=.65;}
  else {y=.41+Math.sin(time*1.5+actor.phase*5)*.018;scale=actor.kind==='speedboat'?.68:actor.kind==='surfer'?.65:.72;if(actor.kind==='surfer')y=.55+Math.sin(time*1.2)*.07;}
 }
 return {x,y,z,angle,scale};
}
function rotate(v:V3,axis:'x'|'z',angle:number):V3{const c=Math.cos(angle),s=Math.sin(angle);return axis==='x'?[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]:[v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]];}
export function placeCulture(target:Float32Array,start:number,actor:CultureActor,time:number){
 const pose=culturePose(actor,time),c=Math.cos(pose.angle),s=Math.sin(pose.angle),source=actor.mesh;
 for(let i=0;i<source.length;i+=8){let p:V3=[source[i],source[i+1],source[i+2]],n:V3=[source[i+3],source[i+4],source[i+5]];
  if(actor.kind==='sky-lantern'||actor.kind==='wind-leaf'){const tilt=(actor.kind==='wind-leaf'?10:1)*Math.sin(time*.85+actor.phase*12)*.075;p=rotate(p,'z',tilt);n=rotate(n,'z',tilt);}
  const limb=actor.limbs.find(part=>i>=part.start&&i<part.end);if(limb){const angle=Math.sin(time*(actor.kind==='visitor'?4:actor.kind==='park-dog'?11:actor.kind==='frisbee-owner'?Math.PI/3:actor.kind==='forest-bird'?12:actor.kind==='forest-bear'?3:2.8)+limb.phase+actor.phase*6)*limb.amount;p=rotate([p[0]-limb.pivot[0],p[1]-limb.pivot[1],p[2]-limb.pivot[2]],limb.axis,angle);p=[p[0]+limb.pivot[0],p[1]+limb.pivot[1],p[2]+limb.pivot[2]];n=rotate(n,limb.axis,angle);}
  const o=start+i;target[o]=pose.x+(p[0]*c-p[2]*s)*pose.scale;target[o+1]=pose.y+p[1]*pose.scale;target[o+2]=pose.z+(p[0]*s+p[2]*c)*pose.scale;target[o+3]=n[0]*c-n[2]*s;target[o+4]=n[1];target[o+5]=n[0]*s+n[2]*c;
 }
}

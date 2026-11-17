import {Sculpture,MATERIAL as m} from './restored/world.ts';
import {kyotoBridgePoint} from './organic-water.ts';
import type {CultureActor} from './culture-scenes.ts';
import type {Limb} from './culture-geometry.ts';
function kimono(geisha=false,seated=false,color:typeof m.flower|typeof m.glass=m.flower){
 const g=new Sculpture(),limbs:Limb[]=[],hip=seated?.18:.32,shoulder=seated?.56:.8,head=seated?.85:1.1;
 g.ring([0,.12,0],seated?.34:.23,.15,shoulder-.18,color,10);g.ring([0,shoulder-.17,0],.18,.18,.11,m.gold,10);
 g.crown([0,head,0],[.14,.18,.13],geisha?m.plaster:m.path);g.crown([-.015,head+.09,-.015],[.15,.14,.14],m.ink);g.crown([-.06,head+.2,0],[.13,.11,.12],m.ink);
 if(geisha){g.crown([.1,head+.17,.13],[.06,.07,.045],m.vermilion);g.box([.139,head-.035,0],[.018,.025,.045],m.vermilion);}
 for(const side of [-1,1]){
  g.crown([.12,head+.015,side*.08],[.02,.025,.018],m.ink);
  const start=g.values.length;g.box([.06,shoulder-.07,side*.22],[.22,.29,.26],color);g.beam([.05,shoulder,side*.12],[.2,shoulder-.16,side*.28],.045,geisha?m.plaster:m.path);
  limbs.push({start,end:g.values.length,pivot:[0,shoulder,side*.12],axis:'z',amount:seated?.08:.12,phase:side<0?Math.PI:0});
  if(!seated){const leg=g.values.length;g.box([.08,.07,side*.075],[.21,.09,.09],m.wood);limbs.push({start:leg,end:g.values.length,pivot:[0,hip,side*.075],axis:'z',amount:.15,phase:side<0?0:Math.PI});}
 }
 return {mesh:new Float32Array(g.values),limbs};
}
export function makeKyotoLife(){
 const base=new Sculpture(),actors:CultureActor[]=[];
 for(let bridge=0;bridge<2;bridge++)for(let lane=0;lane<2;lane++){
  const geisha=bridge===0&&lane===0,body=kimono(geisha,false,lane?m.glass:m.flower);
  actors.push({id:geisha?'geisha-bridge':`kimono-bridge-${bridge}-${lane}`,kind:'kimono-walker',...body,phase:bridge*.2+lane*.45,side:lane?1:-1,home:[bridge===0?.24:.72,0,0]});
 }
 const x=-4.8,z=4.65;base.box([x,.34,z],[2.7,.06,1.65],m.path);for(const dx of [-1.28,1.28])base.box([x+dx,.38,z],[.08,.035,1.62],m.wood);
 base.box([x,.53,z],[.8,.28,.6],m.wood);base.crown([x-.16,.76,z],[.13,.12,.12],m.ink);base.beam([x-.1,.8,z],[x+.06,.8,z+.08],.035,m.ink);
 for(const dx of [-.24,.22]){base.ring([x+dx,.69,z+.16],.09,.1,.065,m.plaster,12);base.ring([x+dx,.756,z+.16],.075,.075,.006,m.leaf,12);}
 for(const [i,home]of [[-5.65,.38,4.65],[-4,.38,4.65],[-4.8,.38,5.22]].entries())actors.push({id:`tea-ceremony-${i}`,kind:'tea-guest',...kimono(false,true,i%2?m.glass:m.flower),phase:i===0?0:i===1?Math.PI:-Math.PI/2,home:home as [number,number,number]});
 return {base:new Float32Array(base.values),actors};
}
export function kyotoActorPose(actor:CultureActor,time:number){
 if(actor.kind==='tea-guest')return {x:actor.home![0],y:actor.home![1],z:actor.home![2],angle:actor.phase,scale:.8};
 const cycle=((time/12+actor.phase)%1+1)%1,forward=cycle<.5,f=forward?cycle*2:2-cycle*2,t=actor.home![0],p=kyotoBridgePoint(t,f),a=kyotoBridgePoint(t,0),b=kyotoBridgePoint(t,1),angle=Math.atan2(b[2]-a[2],b[0]-a[0])+(forward?0:Math.PI);
 const dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),lane=(actor.side??1)*.15;
 return {x:p[0]-dz/length*lane,y:p[1]+.03,z:p[2]+dx/length*lane,angle,scale:.62};
}

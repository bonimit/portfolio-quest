import {Sculpture,MATERIAL as m} from './restored/world.ts';
import {person,type Limb} from './culture-geometry.ts';
import type {CultureActor} from './culture-scenes.ts';
import {nycTaxiPose} from './scene-traffic.ts';
import {PARK_LAKE} from './central-park.ts';
export const FRISBEE_GAME={ownerX:-6,nearX:-5.55,farX:-3.1,z:4.5,period:6} as const;
export function parkActorPose(actor:CultureActor,time:number){
 if(actor.kind==='park-cyclist'){const p=nycTaxiPose(time*.55,actor.phase,false);return {...p,y:.35,scale:p.scale/.55*.62};}
 if(actor.kind==='picnicker')return {x:actor.home![0],y:actor.home![1],z:actor.home![2],angle:actor.phase,scale:.85};
 const cycle=((time%6)+6)%6;
 if(actor.kind==='duck-boat'){
  const a=time*.17+actor.phase*Math.PI*2;
  return {x:PARK_LAKE.x+Math.cos(a)*4.4,y:.41,z:PARK_LAKE.z+Math.sin(a)*1.25,angle:Math.atan2(Math.cos(a)*1.25,-Math.sin(a)*4.4),scale:.66};
 }
 if(actor.kind==='frisbee-owner')return {x:FRISBEE_GAME.ownerX,y:.35,z:FRISBEE_GAME.z,angle:Math.sin(cycle*Math.PI/3)*.08,scale:1};
 const forward=Math.max(0,Math.min(1,(cycle-.2)/2.2)),back=Math.max(0,Math.min(1,(cycle-2.6)/2.5)),returning=cycle>=2.6;
 const progress=returning?1-back:forward,x=FRISBEE_GAME.nearX+(FRISBEE_GAME.farX-FRISBEE_GAME.nearX)*progress;
 if(actor.kind==='park-dog')return {x,y:.35+(cycle>1.8&&cycle<2.6?Math.sin((cycle-1.8)/.8*Math.PI)*.28:0),z:FRISBEE_GAME.z+.08,angle:returning?Math.PI:0,scale:.65};
 const flight=Math.min(1,cycle/2.4);
 return {x:cycle<2.6?-5.65+2.55*flight:x+(returning?-.42:.42),y:cycle<2.6?.85+Math.sin(flight*Math.PI)*.8:.8,z:FRISBEE_GAME.z+.08,angle:time*4,scale:.8};
}
export function makeParkActors():CultureActor[]{
 const actors:CultureActor[]=[];
 for(let i=0;i<3;i++){
  const g=new Sculpture();g.crown([0,.06,0],[.85,.13,.42],m.plaster);g.box([-.1,.22,0],[.65,.09,.55],m.gold);
  g.beam([.5,.1,0],[.68,.72,0],.22,m.plaster);g.crown([.7,.79,0],[.23,.23,.2],m.plaster);g.box([.95,.74,0],[.22,.08,.16],m.gold);
  for(const dz of [-.13,.13])g.crown([.83,.84,dz],[.035,.045,.025],m.ink);
  g.box([-.16,.66,0],[.9,.08,.7],m.gold);for(const dx of [-.55,.2])for(const dz of [-.28,.28])g.beam([dx,.25,dz],[dx,.65,dz],.035,m.metal);
  for(const side of [-1,1]){const rider=new Sculpture();person(rider,i%2?m.flower:m.glass,'sit');for(let j=0;j<rider.values.length;j+=8){rider.values[j]=rider.values[j]*.43-.18;rider.values[j+1]=rider.values[j+1]*.43+.18;rider.values[j+2]=rider.values[j+2]*.43+side*.15;}g.values.push(...rider.values);}
  actors.push({id:`lake-duck-boat-${i}`,kind:'duck-boat',mesh:new Float32Array(g.values),limbs:[],phase:i/3});
 }
 const owner=new Sculpture(),ownerLimbs=person(owner,m.copper,'throw');
 actors.push({id:'frisbee-owner',kind:'frisbee-owner',mesh:new Float32Array(owner.values),limbs:ownerLimbs,phase:0});
 const dog=new Sculpture();dog.crown([0,.53,0],[.48,.2,.18],m.copper);dog.crown([.48,.7,0],[.23,.22,.2],m.path);dog.crown([.68,.64,0],[.16,.09,.12],m.path);dog.crown([.82,.67,0],[.045,.04,.06],m.ink);
 for(const side of [-1,1]){dog.crown([.42,.84,side*.16],[.11,.18,.07],m.copper);dog.crown([.59,.76,side*.15],[.03,.035,.025],m.ink);}
 const limbs:Limb[]=[];
 for(const x of [-.3,.3])for(const z of [-.13,.13]){const start=dog.values.length;dog.beam([x,.52,z],[x,.08,z],.09,m.copper);dog.box([x+.04,.055,z],[.18,.09,.11],m.path);limbs.push({start,end:dog.values.length,pivot:[x,.52,z] as [number,number,number],axis:'z' as const,amount:.45,phase:x*z>0?0:Math.PI});}
 const tail=dog.values.length;dog.beam([-.42,.6,0],[-.75,.85,.08],.09,m.copper);limbs.push({start:tail,end:dog.values.length,pivot:[-.42,.6,0],axis:'x' as const,amount:.5,phase:0});
 actors.push({id:'park-frisbee-dog',kind:'park-dog',mesh:new Float32Array(dog.values),limbs,phase:0});
 const disc=new Sculpture();disc.ring([0,0,0],.2,.2,.035,m.vermilion,20);disc.ring([0,.035,0],.16,.16,.01,m.gold,20);
 actors.push({id:'park-frisbee',kind:'frisbee',mesh:new Float32Array(disc.values),limbs:[],phase:0});
 for(const [i,home]of [[3.25,.35,4.45],[4.7,.35,4.6],[6.1,.35,5],[7.3,.35,4.8],[5.1,.35,-4.25],[6.4,.35,-4.4]].entries()){
  const g=new Sculpture();person(g,i%2?m.glass:m.copper,'sit');actors.push({id:`picnic-guest-${i}`,kind:'picnicker',mesh:new Float32Array(g.values),limbs:[],phase:i%2?Math.PI:0,home:home as [number,number,number]});
 }
 return actors;
}
export function makeParkCyclists():CultureActor[]{
 return [0,1,3,4].map((phase,i)=>{
  const g=new Sculpture();for(const x of [-.62,.62]){g.crown([x,.3,0],[.29,.29,.045],m.ink);g.crown([x,.3,.045],[.22,.22,.012],m.plaster);}
  for(const [a,b]of [[[-.62,.3,0],[0,.3,0]],[[0,.3,0],[-.2,.77,0]],[[-.2,.77,0],[-.62,.3,0]],[[-.2,.77,0],[.43,.77,0]],[[.43,.77,0],[.62,.3,0]],[[.43,.77,0],[0,.3,0]]] as [[number,number,number],[number,number,number]][])g.beam(a,b,.035,m.copper);
  g.box([-.2,.83,0],[.3,.055,.15],m.ink);g.beam([.43,.77,0],[.45,1,0],.035,m.metal);g.box([.45,1,0],[.045,.04,.4],m.metal);
  const rider=new Sculpture();person(rider,i%2?m.flower:m.glass,'sit');for(let j=0;j<rider.values.length;j+=8){rider.values[j]-=.22;rider.values[j+1]+=.28;}g.values.push(...rider.values);
  return {id:`park-cyclist-${i}`,kind:'park-cyclist' as const,mesh:new Float32Array(g.values),limbs:[],phase};
 });
}

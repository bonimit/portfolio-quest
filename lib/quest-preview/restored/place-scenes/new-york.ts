import type {Sculpture} from '../world.ts';
import {PlaceDetails,m} from './details.ts';
type NewYorkPlace='centralpark'|'coney'|'highline'|'rockefeller';
export function newYorkDestination(g:Sculpture,place:NewYorkPlace){
 const d=new PlaceDetails(g);
 if(place==='centralpark'){
  // Belvedere-inspired castle is the primary silhouette; Bow Bridge and lake lead toward it.
  d.water(-8.8,2.2,4.1,3.2);d.bridge(-8.6,2.2,6.1,1.15,m.plaster,.9);d.boat(-10.6,4,.65);d.boat(-8.7,3.7,.45);
  d.box(-5.3,2.1,-2.7,4.6,3.5,3.6,m.stone);d.box(-5.3,4,-2.7,4.9,.3,3.9,m.stone);
  for(let i=0;i<9;i++)d.box(-7.6+i*.57,4.4,-.8,.28,.65,.35,m.stone);
  d.box(-6.7,3.55,-3,1.55,6.4,1.8,m.stone);d.roof(-6.7,6.8,-3,2,2.2,1,m.ink);
  d.box(-3.8,2.8,-3.5,1.2,4.9,1.4,m.stone);d.roof(-3.8,5.3,-3.5,1.7,1.9,.9,m.ink);
  d.windows(-5.2,-.84,4,2,3,1.7,1.3);d.windows(-6.7,-2.06,1.3,2,1,4.5,1.25);d.door(-5.3,-.8);
  // Smaller open visitor pavilion keeps the Adventure entrance secondary.
  for(const x of [3.7,6.5])for(const z of [-4.5,-2.65])d.box(x,1.5,z,.25,2.3,.25,m.stone);
  d.roof(5.1,2.8,-3.7,3.8,3.1,.9,m.pine);d.door(5.1,-2.4,.35,1.25,2);
  for(const [x,h,w]of [[-10,2.8,1.3],[-8,3.3,1.3],[-2,2.7,1.8],[1,3.5,1.4],[4,3.1,2],[8,3.8,1.6],[10.5,2.9,1.3]]){
   d.box(x,h/2,-9.1,w,h,1.2,m.brick);d.windows(x,-8.45,w*.9,Math.floor(h/1.25),2,1,1.2);
  }
  for(const x of [7.5,8.5]){d.box(x,3.9,-9.1,.65,1.2,.75,m.brick);d.roof(x,4.6,-9.1,.8,.9,.65,m.ink);}
  for(const [x,z,size]of [[-11,-3,.65],[0,-6,.85],[9,-4,.85],[10,3,.8],[-10,7,.7],[8,6,.65]])d.tree(x,z,'leaf',size);
  d.flowers(8,2.5,2.5,1.8);d.bench(8.5,5);for(const [x,z]of [[-7,5],[2,5],[8,-1]])d.lamp(x,z,1.7);
 }else if(place==='coney'){
  // Legacy place ID is retained, but this is now an outdoor movie lawn, not Coney Island.
  d.box(0,3.9,-6.5,10.8,5.4,.45,m.ink);d.box(0,3.95,-6.22,10.1,4.7,.08,m.lamp);
  for(const x of [-4.6,4.6])d.box(x,1,-6.5,.22,1.5,.4,m.metal);
  // Original graphic film still: coral sun over a blue mountain landscape, no film assets.
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,b=(i+1)/24*Math.PI*2;g.tri([2.5,4.6,-6.1],[2.5+Math.cos(a)*.8,4.6+Math.sin(a)*.8,-6.1],[2.5+Math.cos(b)*.8,4.6+Math.sin(b)*.8,-6.1],m.copper);}
  g.tri([-5,1.7,-6.1],[-2.4,4.7,-6.1],[1.4,1.7,-6.1],m.metal);
  g.tri([-1.4,1.7,-6.08],[1.7,3.9,-6.08],[5,1.7,-6.08],m.brick);
  d.box(0,.4,-2.7,8.6,.06,2.2,m.pine);
  // Compact projection booth and ticket entrance yield the hierarchy to the screen.
  d.box(-5.3,1.6,-2.8,3.2,2.5,3.6,m.wood);d.roof(-5.3,2.9,-2.8,3.6,3.9,.4,m.ink);d.door(-5.3,-.8,.35,1.2,2);
  d.box(-5.3,2.45,-.7,.6,.3,.2,m.ink);d.box(-5.3,2.45,-.57,.2,.2,.04,m.glass);
  for(const x of [3.6,6.6])d.box(x,1.55,-3.3,.16,2.4,.25,m.wood);
  d.box(5.1,2.85,-3.3,3.5,.35,.7,m.copper);d.door(5.1,-2.4,.35,1.2,2);
  for(const z of [-2.7,.3,3.2])for(const x of [-9,-7,8,10]){d.box(x,.42,z,1.4,.04,.9,(x+z)%2?m.red:m.plaster);g.crown([x+.3,.6,z],[.15,.2,.15],m.path);}
  for(const [x,z]of [[-11,-4],[11,-3],[-10,6],[10,6]])d.tree(x,z,'leaf',.75);
  for(const x of [-10,-7,7,10]){d.beam([x,.4,-4.5],[x,3.8,-4.5],.07,m.wood);}
  for(const side of [-1,1])for(let i=0;i<12;i++){const x=side*(6.8+i*.35),y=3.4-Math.sin(i/11*Math.PI)*.5;d.box(x,y,-4.5,.1,.14,.1,m.lamp);}
  for(const [x,h]of [[-10,3],[-7,3.7],[7,3.2],[10,4.2]]){d.box(x,h/2,-9,1.7,h,1.2,m.brick);d.windows(x,-8.35,1.5,2,2,1,1.1);}
 }else if(place==='highline'){
  // Hudson west edge and diagonal elevated railway garden, with substantial steel below.
  // Taper the river into the island edge; a curved quay replaces the blue rectangle.
  const shore=(t:number)=>{
   const z=-5.6+t*13.2,outer=-13.1+4.6*Math.pow(Math.abs(z)/9,2)+.1*Math.sin(t*Math.PI*3);
   return {z,outer,inner:outer+3*Math.pow(Math.sin(t*Math.PI),.65)};
  };
  for(let i=0;i<40;i++){
   const a=shore(i/40),b=shore((i+1)/40);
   if(i===0)g.tri([a.outer,.36,a.z],[b.outer,.36,b.z],[b.inner,.36,b.z],m.water);
   else if(i===39)g.tri([a.outer,.36,a.z],[b.outer,.36,b.z],[a.inner,.36,a.z],m.water);
   else g.quad([a.outer,.36,a.z],[b.outer,.36,b.z],[b.inner,.36,b.z],[a.inner,.36,a.z],m.water);
   g.quad([a.inner,.43,a.z],[b.inner,.43,b.z],[b.inner+.2,.43,b.z],[a.inner+.2,.43,a.z],m.stone);
  }
  for(let i=0;i<9;i++){const p=shore(.15+i*.08);d.box((p.outer+p.inner)/2,.385,p.z,.55,.015,.035,m.glass,0,1.1);}
  d.box(-9.5,.5,2,2.5,.3,1.3,m.wood);
  for(let i=0;i<5;i++)d.box(-10.4+i*.5,.48,2,.4,.1,1.6,m.wood);
  for(let i=0;i<9;i++){
   const x=-9.7+i*2.35,z=-6.2+i*.16;
   d.box(x,2,z,.4,3.3,1.1,m.ink);d.box(x,3.8,z,2.5,.35,2.1,m.metal);
   d.box(x,4.1,z-.75,1.9,.25,.5,m.grass);d.box(x,4.1,z+.75,1.9,.25,.5,m.grass);
   for(const dz of [-.9,.9]){d.beam([x-1.2,4.2,z+dz],[x+1.2,4.2,z+dz],.05,m.ink);for(const dx of [-1,0,1])d.beam([x+dx,3.9,z+dz],[x+dx,4.7,z+dz],.035,m.ink);}
   for(let j=0;j<5;j++){d.box(x-.9+j*.45,4.02,z,.09,.08,1,m.wood);d.beam([x-.9+j*.45,4.25,z-.75],[x-.75+j*.45,4.8,z-.75],.03,m.flower);}
  }
  for(const dz of [-.3,.3])d.beam([-10.9,4.13,-6.2+dz],[10.3,4.13,-4.76+dz],.05,m.ink);
  // Reused warehouse atelier with sawtooth roof, loading doors and fire escape.
  d.box(-5.3,2.5,-2.7,4.4,4.3,3.6,m.brick);d.windows(-5.3,-.84,4,2,4,1.8,1.55);d.door(-5.3,-.8);
  for(let i=0;i<3;i++){const x=-6.8+i*1.5;g.tri([x-.7,4.7,-4.6],[x+.7,5.6,-4.6],[x+.7,4.7,-4.6],m.brick);g.quad([x-.7,4.7,-4.6],[x+.7,5.6,-4.6],[x+.7,5.6,-.9],[x-.7,4.7,-.9],m.metal);}
  for(let i=0;i<3;i++)d.box(-7.6,1.8+i*1.25,-1.7,.8,.12,1.6,m.ink);
  // Tall, narrow industrial elevator entrance; not a shrine or suburban gate.
  d.box(5.1,3.5,-3.9,2.9,6.3,2.8,m.ink);d.box(5.1,3.65,-2.43,2.1,5.6,.09,m.glass);d.door(5.1,-2.4);d.box(5.1,6.8,-3.9,3.1,.22,3,m.metal);
  for(const [x,z,h]of [[-7,-9,4.4],[0,-9,3.8],[7.8,-8.5,4.7]]){d.box(x,h/2,z,3,h,2,m.brick);d.windows(x,z+1.05,2.8,Math.floor(h/1.2),4,1,1.2);}
  for(const [x,z]of [[-7.6,5.6],[9,3],[9,7]])d.tree(x,z,'autumn',.9);d.bench(8.8,5);d.boat(-11,5,.7);d.lamp(-8,4);
 }else{
  // Rockefeller plaza: central stepped 30 Rock mass, low rink and channel gardens.
  for(let i=0;i<5;i++)d.box(0,1.7+i*1.35,-8.1,5.5-i*.8,2.7,2.7-i*.25,m.stone);
  for(let i=0;i<4;i++)d.windows(0,-6.6,4.5-i*.65,2,5,1.1+i*1.4,.65);
  for(const x of [-9,9]){d.box(x,2.7,-7.8,3.2,4.8,2.4,m.stone);d.windows(x,-6.5,3,3,3,1.2,1.1);}
  d.box(-5.3,2.9,-2.7,4.1,5.1,3.6,m.stone);d.windows(-5.3,-.84,3.8,3,3,1.5,1.25);d.door(-5.3,-.8);for(const x of [-7,-6.5,-4.1,-3.6])d.box(x,3,-.75,.13,4.8,.2,m.gold);
  // Broadway-inspired theatre facade and broad illuminated marquee.
  d.box(5.1,2.3,-4,4.6,3.8,3,m.brick);d.box(5.1,4.2,-4,5,.25,3.2,m.stone);d.door(5.1,-2.4);
  d.box(5.1,3,-2.2,5.1,.65,1.4,m.red);for(let i=0;i<17;i++)d.box(2.8+i*.29,2.75,-1.45,.08,.08,.05,m.lamp);
  d.box(-8.4,.5,3.7,4.5,.16,3.1,m.glass);for(const z of [2,5.4])d.box(-8.4,.75,z,4.8,.6,.12,m.plaster);for(const x of [-10.8,-6])d.box(x,.75,3.7,.12,.6,3.4,m.plaster);
  for(const x of [-1.8,1.8])for(let i=0;i<4;i++){d.box(x,.48,-5+i,1.1,.25,.65,m.plaster);d.box(x,.65,-5+i,.8,.12,.4,m.pine);}
  // Holiday tree is behind the approach lanes; the front pet clearing stays clear.
  for(let i=0;i<5;i++)g.ring([1,1+i*.9,-4],2.2-i*.35,0,2.35,m.pine,12);
  for(let i=0;i<32;i++){const a=i*2.4,y=1+i/32*4.8,r=2.2*(1-(y-1)/5.6);d.box(1+Math.cos(a)*r,y,-4+Math.sin(a)*r,.12,.12,.12,i%3?m.lamp:m.red);}
  g.ring([1,6.45,-4],.3,0,.5,m.gold,5);
  for(const [x,z,w,l]of [[-10,7,4,2],[9,7,4,2],[0,-9,5,2],[-6,-2.7,3.8,3.4]])d.box(x,.45,z,w,.16,l,m.snow);
  for(const [x,z]of [[-10,0],[10,1]]){d.tree(x,z,'pine');g.crown([x,2.8,z],[1,.15,1],m.snow);d.lamp(x-1,z+2);}
 }
}

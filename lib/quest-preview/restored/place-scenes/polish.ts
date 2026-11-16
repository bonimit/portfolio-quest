import type {Sculpture,Material} from '../world.ts';
import type {V3} from '../math.ts';
import type {Place} from '../places.ts';
import {PlaceDetails,m} from './details.ts';

export const OKINAWA_ISLETS=[[-10.1,-8.6,1.2,.7],[-6.8,-9.1,1.9,1.1],[-2.8,-9.8,1.05,.95],[1.4,-9.7,1.5,.9],[5.3,-9.3,1,.55],[9.5,-7.6,1.7,1.05],[10.8,-4.5,.9,.5],[-11,1.3,.7,.3]] as const;

/** Destination-only finishing layer: small scale details around the existing landmarks. */
export function addPlacePolish(g:Sculpture,place:Place){
 const d=new PlaceDetails(g);
 const lantern=(x:number,y:number,z:number)=>{
  g.crown([x,y,z],[.17,.24,.17],m.lamp);d.box(x,y+.25,z,.26,.07,.26,m.ink);d.box(x,y-.25,z,.24,.06,.24,m.ink);
  d.beam([x,y+.3,z],[x,y+.55,z],.025,m.ink);
 };
 const masonry=(x:number,z:number,w:number,h:number)=>{
  for(let row=0;row<Math.floor(h/.48);row++){
   const y=.65+row*.48;d.box(x,y,z,w,.022,.018,m.stone,0,.76);
   for(let col=0;col<Math.floor(w/.65);col++){const px=x-w/2+col*.65+(row%2)*.32;d.box(px,y+.24,z,.018,.44,.018,m.stone,0,.76);}
  }
 };
 const flower=(x:number,y:number,z:number,color:Material,size=.12)=>{
  d.beam([x,.4,z],[x,y,z],.018,m.leaf);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;g.tri([x,y+.03,z],[x+Math.cos(a)*size,y,z+Math.sin(a)*size],[x+Math.cos(a+.7)*size,y,z+Math.sin(a+.7)*size],color);}
 };
 const garden=(x:number,z:number,rx:number,rz:number,color:Material)=>{
  // Low elliptical borders and irregular flower clusters replace rectilinear flower grids.
  const n=32;
  for(let i=0;i<n;i++){
   const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;
   const point=(t:number,r:number,y:number):V3=>[x+Math.cos(t)*rx*r,y,z+Math.sin(t)*rz*r];
   g.tri([x,.44,z],point(a,.94,.44),point(b,.94,.44),m.leaf);
   g.quad(point(a,.94,.48),point(b,.94,.48),point(b,1,.48),point(a,1,.48),m.stone);
   if(i%2===0){const r=.65+.16*Math.sin(i*2.4);flower(x+Math.cos(a)*rx*r,.63+.1*Math.cos(i),z+Math.sin(a)*rz*r,color,.14);}
  }
 };
 if(place==='okinawa'){
  // A miniature archipelago in the rear lagoon, clear of all character/path corridors.
  for(const [i,[x,z,r,h]]of OKINAWA_ISLETS.entries()){
   g.crown([x,.42,z],[r*1.18,.1,r*.7],m.path,i);
   g.crown([x,.48,z],[r*.98,.2+h*.2,r*.6],m.stone,i);
   g.crown([x,.75+h*.4,z],[r*.86,.25+h*.75,r*.5],m.leaf,i);
   g.crown([x+r*.22,.95+h*.45,z-r*.08],[r*.55,.2+h*.75,r*.42],m.leaf,i+1);
   // Shore foam is segmented, rather than a thick continuous outline.
   for(let j=0;j<7;j++){const a=j/7*Math.PI*2;d.box(x+Math.cos(a)*r*1.2,.46,z+Math.sin(a)*r*.75,.25,.012,.045,m.plaster,-a);}
   if(i%2===1){
    const top=1.6+h;
    d.beam([x,1,z],[x+.2,top,z],.065,m.wood);
    for(let j=0;j<6;j++){const a=j/6*Math.PI*2;g.tri([x+.2,top,z],[x+.2+Math.cos(a-.2)*.8,top-.2,z+Math.sin(a-.2)*.8],[x+.2+Math.cos(a+.2)*.8,top-.2,z+Math.sin(a+.2)*.8],m.leaf);}
   }
  }
  // Coral/reef patches, fins on the surfboards and a low beach-side rinse shower.
  for(const [x,z]of [[-11,4.5],[-9.5,5.3],[10,-6]])for(let i=0;i<4;i++)g.crown([x+Math.sin(i)*.25,.48,z+Math.cos(i)*.25],[.17,.08,.12],i%2?m.plaster:m.copper,i);
  for(let i=0;i<4;i++)d.box(7.8+i*.45,1.6,.45,.03,.8,.05,m.plaster);
  d.beam([7.2,.4,-.8],[7.2,2.1,-.8],.06,m.wood);d.beam([7.2,2.1,-.8],[7.5,2.1,-.8],.045,m.metal);d.box(7.5,2.04,-.8,.16,.05,.16,m.metal);
  for(const [x,z]of [[-6.7,-.75],[-3.9,-.75],[3.8,-2.3],[6.4,-2.3]])lantern(x,2.25,z);
 }else if(place==='centralpark'){
  masonry(-5.3,-.89,4.4,3.4);masonry(-6.7,-2.04,1.4,6.1);
  // Flag, corner quoins and small bridge-end flower planters.
  d.beam([-6.7,7.7,-3],[-6.7,8.5,-3],.035,m.ink);g.tri([-6.7,8.5,-3],[-5.9,8.3,-3],[-6.7,8.05,-3],m.red);
  for(const x of [-7.5,-3.1])for(let row=0;row<6;row++)d.box(x,.65+row*.56,-.75,.25,.25,.22,m.stone,0,1.1);
  for(const x of [-11.5,-5.7]){g.ring([x,.4,2.2],.35,.45,.4,m.stone,12);for(let i=0;i<6;i++)flower(x+Math.cos(i)*.25,.98,2.2+Math.sin(i)*.25,m.flower);}
  for(const [x,z]of [[-2,5],[8,4]]){d.box(x,.65,z,.35,.5,.35,m.ink);d.box(x,.93,z,.4,.07,.4,m.stone);}
 }else if(place==='coney'){
  // Screen speakers, projection-booth shutters and the supporting festoon wire.
  for(const x of [-5.8,5.8]){d.box(x,1.3,-6.2,.55,1.5,.5,m.ink);for(const y of [1,1.6])g.crown([x,y,-5.92],[.18,.18,.045],m.metal);}
  for(let i=0;i<5;i++)d.box(-6.5,1.7+i*.17,-.78,.45,.07,.1,m.ink);
  for(const side of [-1,1])for(let i=1;i<12;i++)d.beam([side*(6.8+(i-1)*.35),3.4-Math.sin((i-1)/11*Math.PI)*.5,-4.5],[side*(6.8+i*.35),3.4-Math.sin(i/11*Math.PI)*.5,-4.5],.018,m.ink);
  for(const [x,z]of [[-8,.3],[9,3.2]]){d.box(x,.58,z,.4,.25,.3,m.wood);d.beam([x-.15,.7,z],[x+.15,.7,z],.03,m.path);}
 }else if(place==='highline'){
  masonry(-5.3,-.81,4.2,4.1);
  for(let floor=0;floor<3;floor++){
   const y=1.8+floor*1.25;
   for(const x of [-8,-7.2])d.beam([x,y,-2.3],[x,y+.65,-2.3],.035,m.ink);
   d.beam([-8,y+.65,-2.3],[-7.2,y+.65,-2.3],.035,m.ink);
   if(floor<2)for(let i=0;i<5;i++)d.box(-7.6,y+.2+i*.23,-1.5+i*.14,.65,.04,.12,m.ink);
  }
  for(const [x,z]of [[-8.3,3.2],[8,2]]){d.box(x,.75,z,.5,.7,.45,m.metal);d.box(x,1.13,z,.54,.06,.48,m.ink);}
  for(let i=0;i<14;i++){const x=-9+i*1.35,z=-6.2+i*.09;flower(x,4.45,z-.75,i%3?m.flower:m.copper,.09);}
 }else if(place==='rockefeller'){
  // Small presents, garlands, rink bench and ice markings frame the large tree.
  for(const [x,z,w,h]of [[-.2,-3.1,.6,.45],[1.3,-2.7,.8,.55],[2.2,-3.5,.45,.7]]){d.box(x,.4+h/2,z,w,h,w,m.red);d.box(x,.4+h/2,z,w*.12,h+.02,w+.02,m.gold);}
  for(const x of [-6.9,-3.7])for(let i=0;i<7;i++)g.crown([x,1.5+i*.35,-.69],[.12,.18,.08],m.pine,i);
  for(let i=0;i<7;i++)d.box(-9.9+i*.5,.595,3.8+Math.sin(i)*.5,.6,.008,.02,m.plaster,.2);
  d.bench(-8.5,1.1);for(const x of [8.1,8.6,9.1])d.box(x,.6,3.2,.3,.35,.3,m.copper);
 }else if(place==='kyoto'){
  for(const x of [-6.9,-3.7])lantern(x,2.7,-.65);
  for(let i=0;i<18;i++){const z=-6.8+i*.55;d.beam([-7.9,.45,z],[-7.9,1.1,z],.04,m.wood);}
  d.beam([-7.9,.95,-6.8],[-7.9,.95,2.55],.04,m.wood);
  for(const x of [2.7,7.5]){g.ring([x,.4,-3.5],.32,.25,.6,m.stone,8);d.box(x,1.1,-3.5,.45,.4,.45,m.lamp);d.roof(x,1.35,-3.5,.8,.8,.4,m.ink);}
 }else if(place==='nikko'){
  for(let i=0;i<9;i++)g.crown([-11.2+i*.26,.5,-1.9+Math.sin(i)*.12],[.24,.06,.15],m.plaster,i);
  for(const x of [3.4,4.2,5.1,6,6.8]){d.box(x,3.75,-2.85,.18,.25,.3,m.gold);d.box(x,3.9,-2.9,.28,.1,.35,m.gold);}
  for(const x of [-10.8,-8.5])d.beam([x,.45,-.2],[x,1.1,-.2],.045,m.wood);d.beam([-10.8,1.1,-.2],[-8.5,1.1,-.2],.05,m.wood);
 }else if(place==='hokkaido'){
  for(let i=0;i<4;i++){const x=-7.8+i*.3;d.box(x,1.1,-.3,.12,1.5,.09,i%2?m.red:m.copper,.09);d.box(x,1,-.21,.03,.45,.04,m.ink);}
  d.beam([-8,.7,-.3],[-6.6,.7,-.3],.08,m.wood);
  for(const x of [8.2,8.65])d.box(x,1,-2.7,.16,1.25,.08,m.copper);
  for(let i=0;i<10;i++)d.box(-9.7+i*.05,.57,3.8-i*.32,.04,.012,.15,m.glass,.1);
  for(const [x,z]of [[-3,6],[7,5]]){g.crown([x,.8,z],[.45,.45,.45],m.snow);g.crown([x,1.4,z],[.32,.32,.32],m.snow);d.box(x,1.78,z,.5,.12,.5,m.ink);}
 }else if(place==='canalmarket'){
  for(const x of [3.6,4.6,5.6,6.6])lantern(x,2.8,-2.4);
  for(const [x,z]of [[-7.8,.8],[8.3,1]]){
   d.box(x,.8,z,.7,.7,.6,m.wood);for(let i=0;i<4;i++){d.box(x-.27+i*.18,.8,z+.32,.06,.55,.04,m.path);g.crown([x-.2+i*.14,1.22,z],[.1,.1,.1],i%2?m.flower:m.copper,i);}
  }
  for(let i=0;i<12;i++){const x=-7.2+i*.35;d.beam([x,1.1,-1.1],[x,1.7,-1.1],.035,m.wood);}
  d.beam([-7.2,1.65,-1.1],[-3.35,1.65,-1.1],.035,m.wood);
 }else if(place==='krabi'){
  // Sparse trailing vines, ledges and a mooring line keep the sea-stack silhouette visible.
  for(let i=0;i<8;i++){
   const x=-1.5+i*.28,y=2.6+Math.sin(i)*1.1,z=-6.35;
   d.beam([x,y+1,z],[x+.06,y,z],.025,m.leaf);
   for(let j=0;j<3;j++)g.tri([x,y+j*.28,z],[x-.15,y+.12+j*.28,z+.03],[x+.1,y+.15+j*.28,z+.03],m.leaf);
  }
  d.beam([-10.9,.8,4.4],[-9,.45,3.8],.02,m.path);
  for(let i=0;i<9;i++)g.crown([-10.5+Math.sin(i)*.35,.47,1+i*.3],[.18,.06,.1],m.plaster,i);
  for(const [x,z]of [[8.2,1.8],[-9.5,6]])d.box(x,.6,z,.4,.3,.3,m.wood);
 }else{
  garden(-10,2.1,1.9,1.5,m.flower);garden(-9,4.5,1.6,.65,m.copper);garden(8.5,4.5,2.1,.6,m.flower);
  for(let i=0;i<10;i++){const a=i/9*Math.PI;g.crown([9.7+Math.cos(a)*2.7,.65,1.6+Math.sin(a)*2.1],[.28,.32,.27],m.leaf,i);}
  for(const [x,z]of [[-11.5,.6],[-8.5,3.4],[7.1,3.7]]){g.ring([x,.35,z],.45,.36,.4,m.stone,8);g.crown([x,.95,z],[.42,.6,.42],m.leaf);}
  for(const x of [-10.2,-7.3])d.box(x,1,-4.1,.18,.9,.12,m.gold);
 }
}

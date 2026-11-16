import type {Sculpture} from '../world.ts';
import {PlaceDetails,m} from './details.ts';
type ThailandPlace='canalmarket'|'krabi'|'inthanon';
export function thailandDestination(g:Sculpture,place:ThailandPlace){
 const d=new PlaceDetails(g);
 if(place==='canalmarket'){
  // Taling Chan-inspired working khlong, with narrow waterside houses and rafts.
  d.box(-9.8,.32,.3,3.7,.12,16,m.water);d.box(10.2,.32,0,2.1,.12,14,m.water);
  for(const [x,z]of [[-5.3,-2.8],[-8,-7.2],[-3.3,-7.6],[1,-7.5],[8.8,-7]]){
   const w=x===-5.3?4.1:2.5;
   for(const dx of [-w*.4,w*.4])d.box(x+dx,.9,z,.14,1.3,.2,m.wood);
   d.box(x,2.15,z,w,2.1,2.8,m.wood);d.roof(x,3.3,z,w+.4,3.3,.8,m.red);
   for(let i=0;i<6;i++)d.box(x-w/2+i*w/5,2.3,z+1.44,.045,1.6,.06,m.plaster);
   d.box(x,1.1,z+1.65,w+.4,.15,.9,m.wood);
  }
  // Ground-level atelier threshold remains connected to the authored dry path.
  d.box(-5.3,.55,-.8,4.4,.35,.6,m.wood);d.door(-5.3,-.8);
  // Right path enters a covered market hall, not a temple gateway.
  for(const x of [3.2,7])for(const z of [-5,-2.7])d.box(x,1.9,z,.18,3,.18,m.wood);
  d.roof(5.1,3.4,-3.8,6.2,4.1,1.9,m.red);d.door(5.1,-2.4);
  for(const x of [3.4,6.8]){d.box(x,1.1,-3.4,.7,.9,1.2,m.wood);for(let i=0;i<3;i++)g.crown([x,.8+i*.12,-3.4],[.19,.12,.18],m.flower,i);}
  d.bridge(-9.8,2.2,4.5,1.1,m.wood,.3);
  for(const z of [-4,0,5]){d.boat(-10,z,z===0?1.05:.5,true);for(let i=0;i<5;i++)g.crown([-10.5+i*.24,.98,z],[.12,.12,.14],i%2?m.flower:m.leaf,i);}
  for(let i=0;i<16;i++)d.box(-11+i*.24,.7,-4,.2,.13,1.4,m.wood);
  for(const x of [-1.5,8.5]){d.box(x,1,1,2.3,1.3,1.4,m.wood);for(let i=0;i<7;i++)d.box(x-1.2+i*.4,2,1,.4,.15,2,i%2?m.plaster:m.red);}
  // Tuk-tuk silhouette: three wheels, open passenger cab and folded canopy.
  d.box(8.7,.85,4,1.2,.6,1.6,m.red);d.box(8.7,1.9,4.2,1.4,.15,1.6,m.pine);for(const x of [8.1,9.3])d.beam([x,1,4.7],[x,1.9,4.7],.05,m.metal);
  for(const [x,z]of [[8.1,4.5],[9.3,4.5],[8.7,3.3]])g.crown([x,.5,z],[.22,.28,.17],m.ink);
  for(const [x,z]of [[-11,-6],[11,-3],[9,7],[-2,-6]])d.tree(x,z,'palm',1.05);
  for(const [x,z]of [[-7,4],[7,2],[0,-5]])d.lamp(x,z,1.8);
 }else if(place==='krabi'){
  // Reference-led karst bay: one narrow weathered stack, lower flanking cliffs.
  d.water(-10,2.5,3.5,5);d.water(10.2,1.8,2.4,4.6);d.water(0,-6.6,6.1,3.6);
  const cliff=(x:number,z:number,w:number,h:number)=>{
   const sides=16,levels=6,profile=[.62,.72,1.02,.87,1.06,.69];
   const point=(level:number,i:number):[number,number,number]=>{
    const a=(i%sides)/sides*Math.PI*2,rough=1+.13*Math.sin(i*2.3+level*.8)+.07*Math.cos(i*4.1-level);
    return [x+Math.cos(a)*w*profile[level]*rough+level*.035,.35+level/(levels-1)*h+(level===levels-1?.16*Math.sin(i*2.1):0),z+Math.sin(a)*w*.7*profile[level]*rough];
   };
   for(let level=0;level<levels-1;level++)for(let i=0;i<sides;i++)g.quad(point(level,i),point(level+1,i),point(level+1,i+1),point(level,i+1),i%5===0?m.rock:m.stone,.86+.12*Math.sin(i*2+level));
   for(let i=0;i<sides;i++)g.tri([x,h+.35,z],point(levels-1,i),point(levels-1,i+1),m.stone);
   for(let i=0;i<7;i++){const a=i*2.4,r=w*.65;g.crown([x+Math.cos(a)*r,h+.45,z+Math.sin(a)*r*.7],[w*(.2+i*.01),.18+(i%3)*.06,w*.22],m.leaf,i);}
   for(let i=0;i<5;i++){const a=i*2.3;g.crown([x+Math.cos(a)*w*.8,h*(.3+i*.11),z+Math.sin(a)*w*.65],[w*.25,.2,w*.22],m.leaf,i);}
  };
  cliff(-9,-6.3,2.8,4.1);cliff(-.5,-7.2,1.6,7.25);cliff(9.3,-5.9,2.3,4.5);
  // Low thatched dive hut, with slatted deck and roof overhangs.
  d.box(-5.3,1.65,-2.8,3.8,2.6,3.7,m.wood);d.roof(-5.3,3,-2.8,4.8,4.4,1.6,m.path);
  for(let i=0;i<12;i++)d.beam([-7.4+i*.38,3.1,-.65],[-6.3+i*.19,4.65,-2.8],.045,m.wood);
  d.door(-5.3,-.8);for(let i=0;i<10;i++)d.box(-7.1+i*.4,.5,-.4,.33,.12,.8,m.wood);
  // Right destination is a natural rock cave entrance with a detached lintel.
  g.crown([3.4,1.9,-3.8],[.9,1.65,1.3],m.stone);g.crown([6.8,1.9,-3.8],[.9,1.65,1.3],m.stone);g.crown([5.1,3.3,-3.8],[2.3,.7,1.4],m.stone);
  d.door(5.1,-2.4,.35,1.3,2.2);g.crown([5.5,4,-3.8],[1.2,.3,.8],m.leaf);
  d.boat(-10,4.4,1.05,true);d.boat(10,3,.8,true);
  for(const [x,z]of [[-11,7],[-7,5],[8,6],[11,-1]])d.tree(x,z,'palm',.8);
  for(let i=0;i<12;i++)g.crown([-8.6+Math.sin(i)*.2,.5,-1+i*.55],[.22,.15,.3],m.path,i);
  for(const [x,z]of [[8,1],[-10,1]]){d.beam([x,.5,z],[x,2,z],.06,m.wood);g.ring([x,1.9,z],.9,.03,.4,m.plaster,12);}
 }else{
  // Doi Inthanon: foreground royal chedi, smaller distant companion and low gardens.
  for(const [x,z,w,h]of [[-8,-8,4.2,2.1],[0,-9,5,2.5],[8,-8,3.6,2.2]])g.crown([x,h*.4,z],[w,h*.55,2.5],m.pine,x);
  for(const [x,z,size,mat]of [[-8.7,-4.8,1.12,m.stone],[9.2,-5.9,.8,m.copper]] as const){
   const y=(v:number)=>.35+v*size;
   for(let i=0;i<3;i++)g.ring([x,y(i*.2),z],(2.2-i*.17)*size,(2.2-i*.17)*size,.2*size,m.stone,8,1,Math.PI/8);
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.crown([x+Math.cos(a)*1.7*size,y(.8),z+Math.sin(a)*1.7*size],[.45*size,.45*size,.3*size],mat,a);}
   g.ring([x,y(.65),z],1.55*size,1.4*size,1.6*size,mat,8,1,Math.PI/8);
   for(let i=0;i<5;i++){
    g.ring([x,y(2.25+i*.62),z],(1.42-i*.2)*size,(1.15-i*.2)*size,.6*size,mat,8,1,Math.PI/8);
    g.ring([x,y(2.25+i*.62),z],(1.53-i*.2)*size,(1.53-i*.2)*size,.1*size,m.plaster,8,1,Math.PI/8);
   }
   g.ring([x,y(5.4),z],.38*size,.05*size,1.5*size,m.gold,10);
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2;d.box(x+Math.cos(a)*1.42*size,y(1.3),z+Math.sin(a)*1.42*size,.15,.7*size,.1,m.gold,a);}
  }
  // Mountain garden visitor lodge, low roof and wide sheltered terrace.
  d.box(-5.3,1.65,-2.8,4.2,2.6,3.7,m.wood);d.roof(-5.3,3,-2.8,5,4.3,1.4,m.pine);d.windows(-5.3,-.85,3.8,1,3,1.8);d.door(-5.3,-.8);
  // Ornamental garden entrance with delicate northern Thai roof, no generic torii.
  for(const x of [3.4,6.8])d.box(x,1.75,-3.1,.3,2.8,.45,m.plaster);
  d.roof(5.1,3.2,-3.3,4.8,2.5,1.4,m.copper);d.roof(5.1,4.4,-3.3,2.9,1.8,.85,m.gold);d.door(5.1,-2.4);
  d.water(9.7,1.6,2.6,1.9);d.bridge(9.7,1.6,4.2,.7,m.plaster,.25);for(const [x,z]of [[-11,5],[11,-2],[-3,-7],[10,-6]])d.tree(x,z,'pine',.95);
  // A short observation boardwalk on stilts, above planted ground.
  for(let i=0;i<10;i++){const x=-1.5+i*.5,z=-5.8+Math.sin(i*.4)*.4;d.box(x,1.2,z,.45,.12,1.1,m.wood);for(const side of [-1,1]){d.beam([x,.35,z+side*.5],[x,1.8,z+side*.5],.045,m.wood);}}
  d.bench(9,5.9);d.lamp(-7,3,1.6);d.lamp(7,1,1.6);
 }
}

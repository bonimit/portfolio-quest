import type {Sculpture} from '../world.ts';
import {PlaceDetails,m} from './details.ts';
type JapanPlace='kyoto'|'okinawa'|'nikko'|'hokkaido';
export function japanDestination(g:Sculpture,place:JapanPlace){
 const d=new PlaceDetails(g);
 if(place==='kyoto'){
  // Philosopher's Path: linear canal, low machiya rhythm and blossom canopy.
  d.box(-9.4,.33,-1.8,2.4,.1,15,m.water);for(const x of [-10.75,-8.05])d.box(x,.5,-1.8,.25,.45,15,m.stone);
  for(const z of [-6,-1,4])d.bridge(-9.4,z,3.4,.85,m.stone,.18);
  // Timber lattice atelier has deep eaves and narrow upper clerestory windows.
  d.box(-5.3,1.9,-2.7,4.4,3.1,3.6,m.plaster);d.roof(-5.3,3.5,-2.7,5.1,4.2,1.3,m.ink);
  for(let i=0;i<14;i++)d.box(-7.3+i*.3,1.8,-.78,.045,2.3,.07,m.wood);d.door(-5.3,-.8);
  for(const [x,z]of [[-5.5,-7],[0,-8.1],[4,-8.1]]){d.box(x,1.5,z,2.9,2.3,2.8,m.wood);d.roof(x,2.75,z,3.4,3.3,.95,m.ink);d.windows(x,z+1.43,2.5,1,3,1.6);}
  // A substantial two-level timber temple entrance, with open central passage.
  for(const x of [3.1,7.1])for(const z of [-5.2,-2.7])d.box(x,2.3,z,.45,4,.45,m.wood);
  d.box(5.1,3.5,-4,4.8,.4,3.4,m.wood);d.roof(5.1,4.1,-4,5.7,4,1.1,m.ink);
  d.box(5.1,5.5,-4,3.4,1.4,2.6,m.plaster);d.roof(5.1,6.2,-4,4.5,3.4,1,m.ink);d.door(5.1,-2.4);
  for(let i=0;i<6;i++){const z=-7+i*2.2;d.tree(-11.3,z,'blossom',.55);d.tree(-7.3,z,'blossom',.55);}
  d.tree(-8,-1,'blossom',1.65);d.tree(10,3,'blossom',.7);d.bench(-6.7,4.8);d.bench(9,5.6);
  for(const z of [-4,1,5])d.lamp(-7.3,z,1.5);
  for(let i=0;i<20;i++)d.box(-9.4+Math.sin(i)*.75,.42,-8+i*.65,.1,.015,.09,m.flower);
 }else if(place==='okinawa'){
  // Surfing is the focal point: a large curling break, with tiny huts and equipment.
  d.water(0,-6.7,11.8,3.8);d.water(-10,2.7,3.6,5.2);
  // A tapered, curved crest avoids a rectangular wall of water.
  const wavePoint=(t:number,a:number):[number,number,number]=>{
   const swell=Math.pow(Math.sin(t*Math.PI),.8),r=.25+1.55*swell;
   return [-10+t*18,.38+(.25+3.1*swell)*Math.sin(a),-7+Math.sin(t*Math.PI)*1.25+t*.8+Math.cos(a)*r];
  };
  for(let ix=0;ix<32;ix++)for(let i=0;i<18;i++){
   const a=-.02+i/18*Math.PI,b=-.02+(i+1)/18*Math.PI;
   g.quad(wavePoint(ix/32,a),wavePoint((ix+1)/32,a),wavePoint((ix+1)/32,b),wavePoint(ix/32,b),i>8&&i<12?m.plaster:m.water,1+.06*Math.sin(i));
  }
  for(let i=1;i<32;i++){const p=wavePoint(i/32,Math.PI/2);g.crown(p,[.32,.13,.2],m.plaster,i);}
  // Original small surfer silhouette balances against the oversize wave.
  g.crown([-.3,3.4,-4.8],[1,.08,.24],m.copper);
  d.beam([-.8,3.5,-4.8],[-.3,4.25,-4.8],.11,m.ink);d.beam([.25,3.5,-4.8],[-.3,4.25,-4.8],.11,m.ink);
  d.beam([-.3,4.25,-4.8],[-.1,4.8,-4.8],.18,m.red);g.crown([-.1,5,-4.8],[.17,.2,.17],m.path);
  d.beam([-.2,4.65,-4.8],[-1,4.45,-4.8],.08,m.path);d.beam([-.2,4.65,-4.8],[.6,4.7,-4.8],.08,m.path);
  d.box(-5.3,1.6,-2.8,3.5,2.5,3.7,m.wood);d.roof(-5.3,2.9,-2.8,4,4.2,.7,m.red,true);d.door(-5.3,-.8,.35,1.2,2);
  for(const x of [3.6,6.6])d.box(x,1.5,-3.5,.15,2.3,.2,m.wood);d.roof(5.1,2.8,-3.6,4.1,2.8,.6,m.copper);d.door(5.1,-2.4,.35,1.2,2);
  for(const [x,z]of [[9,3],[10,6],[-11,5]])d.tree(x,z,'palm',.85);
  for(let i=0;i<4;i++){const x=7.8+i*.45;g.crown([x,1.55,.3],[.2,1.1,.1],i%2?m.copper:m.red);d.box(x,1.6,.42,.035,1.6,.025,m.plaster);}
  for(const x of [-10.5,-9.6,-8.7])d.box(x,.43,5,1.2,.035,.65,m.plaster);
  d.lamp(-7,2,1.5);d.lamp(7,-1,1.5);
 }else if(place==='nikko'){
  // Nantai/Chuzenji/Kegon are a condensed landscape, not adjacent real-world lots.
  g.crown([1,2.1,-8.1],[5.1,2.1,2.9],m.rock,1);g.crown([8,2.3,-7.6],[3.1,2.4,2.4],m.pine,2);
  d.water(-8.9,-5.5,3.5,2.1);d.box(-10,3.2,-3.2,3,5.8,1.4,m.stone);
  // A vertical waterfall broken into lit ribbons, rather than a sloping blue sheet.
  for(let i=0;i<8;i++)d.box(-11.2+i*.3,3.15,-2.42,.13,5.55,.035,i%3?m.water:m.plaster);
  d.water(-10.2,-.7,1.7,1.1);d.bridge(-9,2.2,4.7,1,m.red,.75);
  d.box(-5.3,1.8,-2.8,4.3,2.9,3.7,m.wood);d.roof(-5.3,3.4,-2.8,5,4.4,1.1,m.ink);d.door(-5.3,-.8);
  for(const x of [-7.1,-3.5])d.box(x,1.8,-.7,.18,2.8,.18,m.red);d.windows(-5.3,-.85,3.8,1,3,2.5);
  // Ornate shrine gateway: stacked beams, gold trim, dark curved eaves.
  for(const x of [3.3,6.9])d.box(x,2,-3.6,.48,3.3,.48,m.red);
  d.box(5.1,3.4,-3.6,4.2,.35,1.3,m.gold);d.roof(5.1,3.75,-3.6,5,2.6,1.2,m.ink);
  d.box(5.1,5,-3.6,2.7,.65,1.4,m.plaster);d.roof(5.1,5.4,-3.6,3.6,2,1,m.ink);d.door(5.1,-2.4);
  for(const [x,z]of [[-11,-7],[-4,-7],[5,-7],[10,-3]])d.tree(x,z,'pine',1.4);
  for(const [x,z]of [[-11,4],[9,4],[10,7],[-3,-6]])d.tree(x,z,'autumn',1.1);
  for(const x of [-2,2])d.lamp(x,-4.5,1.7);d.bench(9,1);
 }else{
  // Niseko: one broad Yotei cone and a diagonal ski run/lift, not a chain of peaks.
  g.ring([-.5,.3,-8.2],5.1,.3,8.3,m.snow,18);g.ring([-.5,8,-8.2],.9,.4,.6,m.snow,18);
  g.quad([-11,4.1,-6],[-11,.5,4],[-8,.5,4],[-7.4,4.1,-6],m.snow);
  for(let i=0;i<15;i++)d.box(-10+i*.12,.55,3-i*.5,.06,.018,.4,m.glass,.15);
  // Low Japanese ski lodge with a gabled roof and snow-sheltered veranda.
  d.box(-5.3,1.9,-2.8,4.4,3.1,3.8,m.wood);d.roof(-5.3,3.55,-2.8,5.1,4.5,1.8,m.snow);d.windows(-5.3,-.86,4,1,3,2.1);d.door(-5.3,-.8);
  d.box(-6.9,4.6,-3.6,.45,2,.5,m.brick);d.box(-5.3,1,-.4,4.9,.15,.6,m.wood);
  // Right destination is a lift station, with broad mechanical barrel canopy.
  for(const x of [3.5,6.7])d.box(x,1.8,-3.4,.35,2.9,.5,m.ink);
  d.box(5.1,3.2,-3.9,4.3,.65,3,m.red);d.roof(5.1,3.6,-3.9,4.6,3.2,.5,m.snow);d.door(5.1,-2.4);
  for(const [x,z,y]of [[8,-1,3.3],[9,-4,4.7],[10,-7,6.1]]){d.beam([x,.4,z],[x,y,z],.14,m.metal);d.beam([x-.8,y,z],[x+.8,y,z],.1,m.ink);}
  for(const dx of [-.6,.6])d.beam([8+dx,3.3,-1],[10+dx,6.1,-7],.045,m.ink);
  for(let i=0;i<4;i++){const t=i/4,x=8+t*2,z=-1-t*6,y=3.3+t*2.8;d.beam([x,y,z],[x,y-1,z],.05,m.ink);d.box(x,y-1.2,z,.9,.2,.55,m.red);}
  for(const [x,z]of [[-11,6],[-8,-5],[10,4],[8,7],[-3,-6]]){d.tree(x,z,'pine',1.1);g.crown([x,2.9,z],[1,.16,1],m.snow);}
  for(const [x,z]of [[-9,7],[9,6],[-3,-4],[3,-6]])g.crown([x,.55,z],[1.4,.3,1],m.snow);
  d.lamp(-7,4);d.lamp(7,3);d.bench(9,5);
 }
}

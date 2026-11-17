import {Sculpture,MATERIAL as m} from './restored/world.ts';
import {PlaceDetails} from './restored/place-scenes/details.ts';
import {sign} from './culture-geometry.ts';
import type {V3} from './math.ts';
export const PARK_LAKE={x:-.8,z:-7.5,rx:7.65,rz:2.6,y:.37} as const;
export function parkShore(a:number,scale=1):V3{
 const r=1+.045*Math.sin(a*3+.5)+.025*Math.cos(a*5);
 return [PARK_LAKE.x+Math.cos(a)*PARK_LAKE.rx*r*scale,PARK_LAKE.y,PARK_LAKE.z+Math.sin(a)*PARK_LAKE.rz*r*scale];
}
export function addParkLake(g:Sculpture){
 for(let i=0;i<96;i++){
  const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2,p=parkShore(a),q=parkShore(b),r=parkShore(b,1.04),s=parkShore(a,1.04);
  g.tri([PARK_LAKE.x,PARK_LAKE.y,PARK_LAKE.z],p,q,m.water);
  g.quad(p,q,[r[0],.41,r[2]],[s[0],.41,s[2]],i%4?m.path:m.stone);
 }
}
export function makeCentralParkScene(){
 const g=new Sculpture(),d=new PlaceDetails(g);
 // A compact Belvedere-inspired castle is anchored at the actual Portfolio doorway.
 d.box(0,.43,-2.55,4.8,.26,3.3,m.stone);d.box(0,1.8,-2.6,4.2,2.65,3.1,m.stone);d.box(0,3.16,-2.6,4.45,.18,3.25,m.stone);
 for(let i=0;i<8;i++)d.box(-1.93+i*.55,3.48,-1.02,.28,.55,.3,m.stone);
 for(const [x,h]of [[-1.4,4.4],[1.4,3.9]]){d.box(x,(h+.5)/2,-3,1.1,h-.5,1.7,m.stone);d.roof(x,h,-3,1.5,2,.7,m.ink);d.windows(x,-2.12,.9,2,1,1.8,1.2);}
 d.windows(0,-1.02,3.5,1,3,2);d.door(0,-.92,.35,1.15,2.25);
 // A light park pavilion gives Adventure its own entrance on the right branch.
 for(const x of [5.8,9.8])for(const z of [-2.4,-.5])d.box(x,1.7,z,.18,2.7,.18,m.wood);
 d.roof(7.8,3.1,-1.45,4.5,2.65,.75,m.evergreen);d.door(7.8,-.4,.35,1.2,2.2);
 addParkLake(g);
 // Larger conservatory beside the lake; its full foundation stays within the island.
 const gx=8.65,gz=-5.65;
 d.box(gx,.43,gz,3.2,.2,2.5,m.stone);
 for(const dx of [-1.45,1.45])for(const dz of [-1.1,1.1])d.beam([gx+dx,.5,gz+dz],[gx+dx,2.2,gz+dz],.07,m.evergreen);
 for(const side of [-1,1]){g.quad([gx,3,gz-1.15],[gx,3,gz+1.15],[gx+side*1.5,2.15,gz+1.15],[gx+side*1.5,2.15,gz-1.15],m.glass);g.box([gx+side*1.47,1.35,gz],[.04,1.6,2.3],m.glass);}
 for(let i=0;i<7;i++){const z=gz-1.15+i*.383;g.beam([gx-1.5,2.15,z],[gx,3,z],.04,m.evergreen);g.beam([gx,3,z],[gx+1.5,2.15,z],.04,m.evergreen);}
 for(const dx of [-1,-.5,0,.5,1]){g.box([gx+dx,1.3,gz+1.17],[.035,1.65,.035],m.evergreen);g.crown([gx+dx,.8,gz],[.22,.45,.22],m.leaf);}
 // Trees and benches frame the shore, leaving the foreground frisbee lawn clear.
 for(const [x,z,size]of [[-11,-3,.8],[-10,-6,.7],[-6,-9.8,.6],[1,-10.7,.55],[6,-9.1,.6],[11,-2.8,.7],[-11.5,1,.75],[11.5,-.5,.65]])d.tree(x,z,'leaf',size);
 for(const [x,z]of [[-5.8,-4.8],[4,-4.3],[-10,1.8]])d.bench(x,z);
 d.flowers(3.6,-4.4,1.8,.5,2);d.flowers(-10,-3.5,1,.5,2);
 for(const [i,[x,z]]of [[4,4.5],[6.7,4.9],[5.8,-4.3]].entries()){
  g.box([x,.335,z],[1.8,.035,1.15],i%2?m.plaster:m.copper);for(let stripe=0;stripe<6;stripe++)g.box([x-.75+stripe*.3,.357,z],[.12,.015,1.12],m.path);
  g.box([x,.49,z],[.35,.25,.26],m.wood);for(const dx of [-.35,.35])g.ring([x+dx,.38,z],.12,.12,.03,m.plaster,12);g.crown([x+.32,.44,z],[.07,.06,.07],m.vermilion);
 }
 // New York hotdog cart: striped umbrella, griddle, buns and a service counter.
 const x=-9.5,z=3.75;d.box(x,.95,z,1.55,.8,.85,m.metal);d.box(x,1.39,z,1.7,.12,1,m.plaster);
 for(const dx of [-.58,.58])g.crown([x+dx,.49,z+.4],[.22,.22,.09],m.ink);
 d.beam([x,.4,z],[x,2.65,z],.055,m.metal);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=(i+1)/12*Math.PI*2;g.tri([x,2.72,z],[x+Math.cos(a)*1.15,2.35,z+Math.sin(a)*.85],[x+Math.cos(b)*1.15,2.35,z+Math.sin(b)*.85],i%2?m.gold:m.vermilion);}
 for(let i=0;i<4;i++){g.crown([x-.5+i*.32,1.51,z+.12],[.12,.055,.21],m.path);g.crown([x-.5+i*.32,1.56,z+.12],[.055,.04,.18],m.copper);}
 sign(g,'HOT DOGS',x,1.05,z+.46,1.35,.4,m.gold);
 return new Float32Array(g.values);
}

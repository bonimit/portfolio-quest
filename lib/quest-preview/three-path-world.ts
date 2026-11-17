import {makeKaruizawaScene} from './karuizawa.ts';
import {makeCentralParkScene} from './central-park.ts';
import {makeKyotoCanal} from './organic-water.ts';
import {Sculpture,MATERIAL as m,type Material} from './restored/world.ts';
import {PlaceDetails} from './restored/place-scenes/details.ts';
import {addPlaceScene} from './restored/places.ts';
import {addClouds} from './restored/clouds.ts';
import {currentIslandBase} from './current-island-base.ts';
import {makeConceptSceneStudy} from './concept-scene-study.ts';
import type {SceneVariant} from './variants.ts';
import type {V3} from './math.ts';
import {makeBroadwayEntrances} from './broadway-buildings.ts';
import {makeConceptPavilion} from './concept-pavilions.ts';
import {makeSceneDecorations,decorationPlan} from './scene-decorations.ts';
import {makeCultureScene,replacesCultureBackdrop,isBroadway,type CultureActor} from './culture-scenes.ts';
import {makeNycSceneDetails} from './nyc-scene-details.ts';
import {hasBangkokRiver,makeBangkokRiverfront,makeBangkokBoats} from './bangkok-river.ts';
export type BuildingBounds={min:V3;max:V3};
export type ThreePathGeometry={culture?:readonly CultureActor[];layers:Record<string,Float32Array>;bounds:Record<'portfolio'|'concepts'|'world',BuildingBounds>};

/** Retain whole authored primitives when moving architecture, avoiding sliced walls/trees. */
class RecordedSculpture extends Sculpture{
 groups:number[][]=[];kinds:string[]=[];private depth=0;
 private record(kind:string,draw:()=>void){const start=this.values.length,outer=this.depth++===0;draw();this.depth--;if(outer){this.groups.push(this.values.slice(start));this.kinds.push(kind);}}
 override tri(...a:Parameters<Sculpture['tri']>){this.record('tri',()=>super.tri(...a));}
 override quad(...a:Parameters<Sculpture['quad']>){this.record('quad',()=>super.quad(...a));}
 override box(...a:Parameters<Sculpture['box']>){this.record('box',()=>super.box(...a));}
 override ring(...a:Parameters<Sculpture['ring']>){this.record('ring',()=>super.ring(...a));}
 override beam(...a:Parameters<Sculpture['beam']>){this.record('beam',()=>super.beam(...a));}
 override crown(...a:Parameters<Sculpture['crown']>){this.record('crown',()=>super.crown(...a));}
 override ellipsoid(...a:Parameters<Sculpture['ellipsoid']>){this.record('ellipsoid',()=>super.ellipsoid(...a));}
}
function bounds(values:ArrayLike<number>):BuildingBounds{
 const min:V3=[Infinity,Infinity,Infinity],max:V3=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<values.length;i+=8)for(let j=0;j<3;j++){min[j]=Math.min(min[j],values[i+j]);max[j]=Math.max(max[j],values[i+j]);}
 return {min,max};
}
function append(target:number[],values:number[]){for(let i=0;i<values.length;i+=8192)target.push(...values.slice(i,i+8192));}
function move(values:number[],from:V3,to:V3,size:V3=[1,1,1]){
 const out=[...values];for(let i=0;i<out.length;i+=8){
  for(let j=0;j<3;j++){out[i+j]=to[j]+(out[i+j]-from[j])*size[j];out[i+3+j]/=size[j];}
  const n=Math.hypot(out[i+3],out[i+4],out[i+5]);for(let j=3;j<6;j++)out[i+j]/=n||1;
 }return out;
}
function cityArchitecture(g:Sculpture,v:SceneVariant){
 const d=new PlaceDetails(g);
 if(v.city==='nyc'){
  d.box(-5.3,2.9,-2.8,4.1,5.1,3.6,m.brick);d.windows(-5.3,-.92,3.8,3,3,1.3,1.35);d.door(-5.3,-.8);
  for(const y of [.55,5.45,5.65])d.box(-5.3,y,-2.8,4.45,.16,3.9,m.stone);
  for(const x of [-7.2,-3.4])d.box(x,2.9,-.85,.12,5.1,.2,m.plaster);
  d.roof(-5.3,3.1,-.7,1.7,1,.35,m.ink);
  for(const x of [3.5,6.7]){d.box(x,2.1,-3.4,.4,3.5,.4,m.stone);d.box(x,4,-3.4,.65,.25,.65,m.stone);}
  d.box(5.1,3.8,-3.4,3.6,.3,.5,m.ink);d.door(5.1,-2.4);
  for(const side of [-1,1])for(let i=0;i<4;i++)d.box(5.1+side*(1+i*.18),1.7,-3.3,.035,2.7,.06,m.ink);
  for(const [x,h,w]of [[-9,4,2.2],[-6,5.8,2.1],[-2.8,7.2,2],[0,9,2.5],[3,6.6,2],[5.5,7.7,2.1],[8.7,5.2,2.3]]){
   d.box(x,h/2,-8,w,h,2,m.brick);d.windows(x,-6.96,w*.9,Math.floor(h/1.2),3,1,1.1);d.box(x,h+.1,-8,w+.2,.2,2.2,m.stone);
  }
  d.beam([0,9,-8],[0,10,-8],.06,m.metal);
  d.water(-10.7,2.4,1.6,2.4);d.bridge(-10.7,2.4,2.8,.8,m.stone,.3);
 }else{
  d.box(-5.3,1.9,-2.8,4.2,3.1,3.6,m.wood);d.windows(-5.3,-.92,3.9,1,3,1.9);d.door(-5.3,-.8);
  d.roof(-5.3,3.55,-2.8,4.9,4.1,1.2,m.copper);d.roof(-5.3,4.5,-2.8,3.3,2.8,.9,m.copper);
  for(const x of [3.5,6.7])d.box(x,1.9,-3.7,.28,3,.28,m.stone);
  d.roof(5.1,3.4,-3.7,4.9,3.1,1.2,m.copper);d.roof(5.1,4.4,-3.7,3.1,2,.85,m.gold);d.door(5.1,-2.4);
  for(const x of [-8,-4,0,4,8]){d.box(x,1.6,-8,2.9,2.5,2.5,m.wood);d.roof(x,3,-8,3.6,3.1,1.3,m.copper);d.windows(x,-6.7,2.6,1,3,1.8);}
  for(let i=0;i<7;i++)g.ring([7,1.5+i*.65,-8],2.1-i*.25,1.8-i*.25,.65,m.stone,8);
  g.ring([7,6,-8],.45,.03,1.8,m.gold,10);
  d.water(-10.5,1.6,1.7,4);d.boat(-10.7,2.3,.65,true);
 }
}
function ground(g:Sculpture){
 g.values.push(...currentIslandBase());
 const path=(nodes:readonly (readonly number[])[])=>{for(let i=1;i<nodes.length;i++){
  const a=nodes[i-1],b=nodes[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),steps=Math.ceil(length/.5);
  for(let j=0;j<steps;j++){const t=(j+.5)/steps;g.box([a[0]+dx*t,.4,a[1]+dz*t],[1.03,.12,length/steps-.07],m.path,Math.atan2(dx,dz));}
 }};
 g.ring([0,.3,8.6],1.7,1.7,.08,m.path,32);g.ring([0,.32,2.8],1.15,1.15,.1,m.stone,24);g.ring([0,.44,2.8],.21,.21,.025,m.copper,12);
 path([[0,8.6],[0,2.8],[0,-.92]]);path([[0,2.8],[-3.2,2],[-7.8,1.2],[-7.8,.61]]);path([[0,2.8],[3.2,2],[7.8,1.2],[7.8,-.4]]);
}
const cache=new Map<string,ThreePathGeometry>();
export function makeThreePathGeometry(v:SceneVariant):ThreePathGeometry{
 const key=`${v.city}-${v.season}-${v.place??''}-${v.light}`;const saved=cache.get(key);if(saved)return saved;
 const trafficScene=v.city==='nyc'||['taxi','tuktuk'].includes(decorationPlan(v).street);
 let result:ThreePathGeometry;
 if(isBroadway(v)){
  const g=new Sculpture();ground(g);const entrances=makeBroadwayEntrances();append(g.values,Array.from(entrances.base));addClouds(g,m.cloud);
  const layers:Record<string,Float32Array>={base:new Float32Array(g.values),banner:entrances.banner,curtains:entrances.curtains,...entrances.motion};
  for(const [i,dx]of [-.9,0,.9].entries()){const bulb=new Sculpture();bulb.beam([7.8+dx,3.5,-.4],[7.8+dx,3.12,-.4],.02,m.metal);bulb.crown([7.8+dx,3.03,-.4],[.1,.12,.1],m.lamp);layers[`lantern-${i}`]=new Float32Array(bulb.values);}
  result={layers,bounds:entrances.bounds};
 }else if(v.place==='centralpark'||v.place==='nikko'){
  const g=new Sculpture();ground(g);const park=v.place==='centralpark'?makeCentralParkScene():makeKaruizawaScene(v),pavilion=makeConceptPavilion(v);append(g.values,Array.from(park));append(g.values,Array.from(pavilion.base));addClouds(g,m.cloud);
  const banner=new Sculpture();banner.beam([1.35,3.1,-.85],[2.05,3.1,-.85],.055,m.wood);banner.box([1.7,2.66,-.85],[.48,.82,.04],m.copper);
  const layers:Record<string,Float32Array>={base:new Float32Array(g.values),banner:new Float32Array(banner.values),curtains:pavilion.curtains};
  for(const [i,dx]of [-.9,0,.9].entries()){const lamp=new Sculpture();lamp.beam([7.8+dx,3.5,-.4],[7.8+dx,2.95,-.4],.025,m.ink);lamp.crown([7.8+dx,2.8,-.4],[.14,.2,.14],m.lamp);layers[`lantern-${i}`]=new Float32Array(lamp.values);}
  result={layers,bounds:{portfolio:{min:[-2.4,.3,-4.2],max:[2.4,5.15,-.42]},concepts:pavilion.bounds,world:{min:[5.5,.3,-2.8],max:[10.3,3.9,-.1]}}};
 }else if(v.city==='tokyo'&&!v.place){
  const pavilion=makeConceptPavilion(v),layers=Object.fromEntries(['base','banner','lantern-0','lantern-1','lantern-2'].map(layer=>[layer,makeConceptSceneStudy(layer,v.season,false)]));
  const base=new Float32Array(layers.base.length+pavilion.base.length);base.set(layers.base);base.set(pavilion.base,layers.base.length);layers.base=base;layers.curtains=pavilion.curtains;
  result={layers,bounds:{portfolio:{min:[-2.5,.3,-4.55],max:[2.5,4.7,-.45]},concepts:pavilion.bounds,world:{min:[5.2,.3,-.9],max:[10.4,4.55,.3]}}};
 }else{
  const source=new RecordedSculpture();if(v.place)addPlaceScene(source,v.place);else cityArchitecture(source,v);
  const groups={portfolio:[] as number[],world:[] as number[],scenery:[] as number[]};
  const snow=v.season==='winter'&&v.city!=='bangkok',riverfront=hasBangkokRiver(v);
  for(const [index,primitive]of source.groups.entries()){
   const b=bounds(primitive),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2,material=primitive[6];
   if(v.place==='kyoto'&&x< -7.45)continue;
   if(riverfront&&(z< -5||x< -9&&z>-.5||material===m.water))continue;
   if(trafficScene&&(v.city==='nyc'?b.max[1]>.4:b.min[1]>.32)&&b.max[2]>.8&&b.min[2]<6.1&&b.max[0]>7.5&&b.min[0]<12.3)continue;
   const foliage=([m.leaf,m.flower] as Material[]).includes(material as Material)||material===m.evergreen&&['crown','ellipsoid','ring'].includes(source.kinds[index]);
   if(!v.place&&snow&&foliage)continue;
   const architectural=b.max[2]-b.min[2]<5.5&&b.max[0]-b.min[0]<6.5&&!foliage&&material!==m.water&&!(material===m.snow&&b.max[1]<1.2);
   if(x>=-8&&x<=-2.7&&z>=-4.8&&z<=-.25&&architectural){groups.portfolio.push(...primitive);continue;}
   if(x>=1.9&&x<=8.2&&z>=-4.8&&z<=-1.3&&architectural){groups.world.push(...primitive);continue;}
   if(replacesCultureBackdrop(v))continue;
   if(riverfront&&v.place==='canalmarket')continue; // Replace its old backdrop as a whole, including detached props.
   if(z>5.3)continue; // Keep the existing avatar and pet clearings unobstructed.
   // Architectural lots and all three approach lanes remain dry and open.
   if(z>-.5&&Math.abs(x)<8.7)continue;
   if(foliage&&z> -5.5&&Math.abs(x)<10)continue;
   if(source.kinds[index]==='beam'&&b.max[1]-b.min[1]<.2&&b.min[1]>1&&z< -3&&z> -5.8&&Math.abs(x)>2&&Math.abs(x)<8.5)continue;
   if(v.place==='hokkaido'&&material===m.snow&&source.kinds[index]==='quad'&&b.max[2]-b.min[2]>8)continue;
   const backdropScale=v.place==='krabi'||v.place==='hokkaido'?.85:.6;
   let part=move(primitive,[0,.3,0],[0,.3,0],[1,backdropScale,1]);
   if(z< -3)part=move(part,[0,0,0],[0,0,-1.2]);
   if(z>=-3&&x< -8)part=move(part,[-10,0,0],[-11,0,0],[.6,1,1]);
   if(z>=-3&&x>8)part=move(part,[10,0,0],[11,0,0],[.6,1,1]);
   groups.scenery.push(...part);
  }
  const g=new Sculpture();ground(g);append(g.values,groups.scenery);
  const primaryHeight=bounds(groups.portfolio).max[1]-.35;
  const primary=move(groups.portfolio,[-5.3,.35,-.8],[0,.35,-.92],[1,Math.min(1,4.3/primaryHeight),1]);
  const pavilion=makeConceptPavilion(v),gallery=Array.from(pavilion.base);
  const worldBounds=bounds(groups.world),adventure=move(groups.world,[5.1,.35,-2.4],[7.8,.35,-.4],[Math.min(1,5.2/(worldBounds.max[0]-worldBounds.min[0])),Math.min(1,4.2/(worldBounds.max[1]-.35)),1]);
  append(g.values,primary);append(g.values,gallery);append(g.values,adventure);
  const d=new PlaceDetails(g),tropical=v.city==='bangkok'||v.place==='okinawa';
  for(const [x,z,size]of [[-11,-2.5,.8],[11,-2.5,.85],[-10.7,4.4,.6],[10.8,4.3,.6],[-3.1,5,.48],[3.4,4.8,.52]]){
   if(isBroadway(v))continue;
   if(riverfront&&z<0)continue;
   if(v.place==='hokkaido'&&x< -9)continue;
   if(x===10.8&&trafficScene)continue;
   if(snow){d.tree(x,z,'pine',size);g.crown([x,2.4*size,z],[size,.12,size*.7],m.snow);}
   else d.tree(x,z,tropical?'palm':v.season==='spring'?'blossom':'leaf',size);
  }
  for(const [x,z]of [[-1.1,6],[1.1,6],[-3,2.7],[3,2.7]])d.lamp(x,z,1.7);
  if(snow){if(!v.place)g.box([0,bounds(primary).max[1]+.04,-2.8],[3.7,.08,2.8],m.snow);for(const x of [-10,10])if(!(trafficScene&&x>0))g.crown([x,.4,5],[1.4,.15,.7],m.snow);}
  if(v.city==='bangkok'&&v.season==='raining')for(let i=0;i<25;i++){const x=-10+(i*3.3)%20,z=-6+(i*2.7)%10,y=2+(i%4)*.7;g.beam([x,y,z],[x-.05,y-.25,z],.015,m.water);}
  if(v.city==='bangkok'&&v.season==='winter'){g.beam([-8,3.5,-6],[8,3.5,-6],.035,m.wood);for(let i=0;i<13;i++)g.crown([-7.2+i*1.2,3.2,-6],[.16,.22,.16],m.lamp);}
  if(riverfront)append(g.values,Array.from(makeBangkokRiverfront(v)));
  addClouds(g,m.cloud);
  const layers:Record<string,Float32Array>={base:new Float32Array(g.values)};
  const banner=new Sculpture();banner.beam([1.35,3.1,-.85],[2.05,3.1,-.85],.055,m.wood);banner.box([1.7,2.66,-.85],[.48,.82,.04],m.copper);banner.box([1.7,2.67,-.81],[.22,.28,.02],m.plaster);layers.banner=new Float32Array(banner.values);
  layers.curtains=pavilion.curtains;
  // A front lintel makes each hanging light visibly attached to its destination.
  const lintel=new Sculpture();lintel.beam([6.3,3.5,-.4],[9.3,3.5,-.4],.08,m.wood);g.values.push(...lintel.values);layers.base=new Float32Array(g.values);
  for(const [i,dx]of [-.9,0,.9].entries()){const lantern=new Sculpture();lantern.beam([7.8+dx,3.5,-.4],[7.8+dx,2.85,-.4],.025,m.ink);lantern.crown([7.8+dx,2.67,-.4],[.19,.28,.19],m.lamp);layers[`lantern-${i}`]=new Float32Array(lantern.values);}
  result={layers,bounds:{portfolio:bounds(primary),concepts:pavilion.bounds,world:bounds(adventure)}};
 }
 if(v.place==='kyoto'){const water=makeKyotoCanal(),base=new Float32Array(result.layers.base.length+water.length);base.set(result.layers.base);base.set(water,result.layers.base.length);result.layers.base=base;}
 const nycDetails=makeNycSceneDetails(v);
 if(nycDetails.length){const base=new Float32Array(result.layers.base.length+nycDetails.length);base.set(result.layers.base);base.set(nycDetails,result.layers.base.length);result.layers.base=base;}
 const decorations=makeSceneDecorations(v),decorated=new Float32Array(result.layers.base.length+decorations.base.length);
 decorated.set(result.layers.base);decorated.set(decorations.base,result.layers.base.length);result.layers.base=decorated;
 const culture=makeCultureScene(v),combined=new Float32Array(result.layers.base.length+culture.base.length);combined.set(result.layers.base);combined.set(culture.base,result.layers.base.length);result.layers.base=combined;result.culture=culture.actors;
 if(decorations.frog.length)result.layers.frog=decorations.frog;
 if(decorations.vehicle.length)result.layers.vehicle=decorations.vehicle;
 for(const [i,mesh]of makeBangkokBoats(v).entries())result.layers[`boat-${i}`]=mesh;
 if(cache.size>=4)cache.delete(cache.keys().next().value!);cache.set(key,result);return result;
}

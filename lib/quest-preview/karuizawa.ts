import {cityCameraRig,cameraFromRig} from './city-camera.ts';
import {project} from './math.ts';
import {Sculpture,MATERIAL as m} from './restored/world.ts';
import {PlaceDetails} from './restored/place-scenes/details.ts';
import {letters,type Limb} from './culture-geometry.ts';
import {closedTrafficPath} from './scene-traffic.ts';
import {STUDY_ROUTES} from './study-navigation.ts';
import type {SceneVariant} from './variants.ts';
import type {CultureActor} from './culture-scenes.ts';
export const FOREST_BEAR_ROUTE=closedTrafficPath([[-11.1,3.9],[-10.8,2],[-10.35,.5],[-10.9,-2.8],[-8.4,-4.6],[-5.1,-5.1],[-7.5,-5.8],[-10.9,-4],[-12,-1],[-12,2.4]]);
export const FOREST_BOAR_ROUTE=closedTrafficPath([[12.2,3.4],[12.5,1.6],[12.4,-.5],[11.9,-2.7],[11.3,-3.9],[12,-2.4],[12.8,-.2],[12.7,2.3]]);
function distance(a:readonly number[],b:readonly number[],x:number,z:number){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
function nearPath(x:number,z:number,padding:number){return Object.values(STUDY_ROUTES).some(route=>{const nodes=[...route.via,route.door];return nodes.some((b,i)=>i>0&&distance(nodes[i-1],b,x,z)<padding);});}
const bearTrail=Array.from({length:80},(_,i)=>FOREST_BEAR_ROUTE.pose(i/80*FOREST_BEAR_ROUTE.length));
const entranceCamera=cameraFromRig(cityCameraRig('tokyo',1440,980,0,0,0,0,0,0,'restored',true),1440,980);
function entranceCover(tree:{x:number;z:number;height:number;width:number},x:number,z:number){
 if(tree.z<=z)return 0;
 const points=[.4,1.2,2].flatMap(y=>[-.3,0,.3].map(dx=>project(entranceCamera,[x+dx,y,z+.08],1440,980)));
 const triangles:{x:number;y:number}[][]=[];
 for(let tier=0;tier<5;tier++){
  const y=.85+tier*(tree.height-.9)/5,r=tree.width*(1-tier*.14),top=project(entranceCamera,[tree.x,y+(tree.height-.75)/3,tree.z],1440,980);
  for(let edge=0;edge<9;edge++){const a=edge/9*Math.PI*2,b=(edge+1)/9*Math.PI*2;triangles.push([project(entranceCamera,[tree.x+Math.cos(a)*r,y,tree.z+Math.sin(a)*r],1440,980),project(entranceCamera,[tree.x+Math.cos(b)*r,y,tree.z+Math.sin(b)*r],1440,980),top]);}
 }
 return points.filter(p=>triangles.some(([a,b,c])=>{const cross=(a:{x:number;y:number},b:{x:number;y:number},p:{x:number;y:number})=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x),u=cross(a,b,p),v=cross(b,c,p),w=cross(c,a,p);return u>=0&&v>=0&&w>=0||u<=0&&v<=0&&w<=0;})).length;
}
export const FOREST_TREES=(()=>{
 const trees:{x:number;z:number;height:number;width:number}[]=[];
 for(let row=0;row<15;row++)for(let col=0;col<21;col++){
  const n=row*21+col,x=-13+col*1.3+Math.sin(n*12.7)*.22,z=-9.8+row*1.3+Math.cos(n*5.1)*.2;
  if(Math.hypot(x/14,z/11.6)>.87||nearPath(x,z,1.4))continue;
  if(x>-3.3&&x<3.3&&z>-5&&z<.6||x>-10&&x<-5.4&&z>-3&&z<2||x>4.8&&x<10.8&&z>-4.1&&z<1.4)continue;
  if(z>5.2&&x>-8&&x<8)continue;
  if(bearTrail.some(p=>Math.hypot(p.x-x,p.z-z)<1.6))continue;
  trees.push({x,z,height:(z< -4?3.8:2.6)+(1+Math.sin(n*2.7))*.75,width:.66+(1+Math.cos(n*3.3))*.13});
 }
 // Keep the previous forest arrangement; thin only two foreground trees per entrance.
 const removed=new Set<typeof trees[number]>();
 for(const [x,z]of [[-7.8,.61],[0,-.92],[7.8,-.4]]){
  const candidates=trees.map(tree=>({tree,cover:entranceCover(tree,x,z)})).filter(item=>item.cover>0).sort((a,b)=>b.cover-a.cover||Math.hypot(a.tree.x-x,a.tree.z-z)-Math.hypot(b.tree.x-x,b.tree.z-z));
  candidates.slice(0,2).forEach(item=>removed.add(item.tree));
 }
 return trees.filter(t=>!removed.has(t));
})();
export function forestTreeKind(index:number,z:number){return z> -4?'pine':index%7===0?'birch':index%5===0?'maple':index%9===0?'cedar':'pine';}
export function makeKaruizawaScene(v:SceneVariant){
 const g=new Sculpture(),d=new PlaceDetails(g);
 // A stone-and-timber studio, grounded at the centre path's actual doorway.
 d.box(0,.44,-2.55,4.7,.25,3.5,m.stone);d.box(0,1.8,-2.6,4.2,2.65,3.2,m.wood);d.roof(0,3.2,-2.6,4.8,3.7,1.05,m.ink);
 d.box(-1.7,2.9,-3.6,.5,3.7,.55,m.stone);d.windows(0,-.98,3.6,1,3,1.85);d.door(0,-.92,.35,1.15,2.25);
 for(const x of [-2.2,2.2])d.beam([x,.45,-.8],[x,3.2,-.8],.12,m.wood);
 // Refined, low modern restaurant rather than another cabin facade.
 d.box(7.8,.45,-1.7,4.8,.3,2.9,m.stone);d.box(7.8,1.7,-1.8,4.3,2.4,2.6,m.wood);d.box(7.8,3.05,-1.8,4.85,.18,3,m.ink);d.box(7.8,3.42,-2.2,3.5,.6,1.6,m.wood);
 for(const x of [6.2,7,8.6,9.4]){
  d.box(x,1.6,-.45,.62,1.85,.05,m.glass);d.box(x,1.6,-.41,.4,1.35,.025,m.lamp,0,v.light==='night'?2:1);
  d.box(x,1.15,-.37,.48,.06,.035,m.wood);d.box(x,.9,-.36,.04,.48,.04,m.metal);
 }
 d.door(7.8,-.4,.35,1.2,2.2);d.box(7.8,2.88,-.3,4.2,.35,.08,m.ink);letters(g,'FINE DINING',7.8,2.88,-.24,.2,m.plaster,v.light==='night'?2:1);
 for(const x of [5.65,9.95])d.box(x,1.72,-.3,.09,2.75,.1,m.metal);
 // Closely spaced, irregular pine canopies form a continuous forest around the clearings.
 for(const [i,t]of FOREST_TREES.entries()){
  g.beam([t.x,.3,t.z],[t.x,t.height,t.z],.09,m.wood);
  const kind=forestTreeKind(i,t.z),foliage=v.season==='autumn'&&i%4!==0?(i%2?m.copper:m.gold):m.evergreen;
  if(kind==='pine'||kind==='cedar')for(let tier=0;tier<5;tier++){
   const height=kind==='cedar'?t.height*1.15:t.height,y=.85+tier*(height-.9)/5,r=t.width*(kind==='cedar'?1.3:1)*(1-tier*.14);
   g.ring([t.x,y,t.z],r,.035,(height-.75)/3,foliage,kind==='cedar'?12:9,.9+(i%4)*.045,i*.3);
  }else{
   const h=t.height*1.13,trunk=kind==='birch'?m.plaster:m.wood;
   g.beam([t.x,.3,t.z],[t.x,h,t.z],kind==='birch'?.12:.19,trunk);
   if(kind==='birch')for(let y=.6;y<h-.6;y+=.4)g.box([t.x,y,t.z+.07],[.13,.035,.025],m.ink);
   for(let branch=0;branch<5;branch++){const a=branch*2.4,px=t.x+Math.cos(a)*.6,pz=t.z+Math.sin(a)*.55,py=h-.6+(branch%2)*.45;g.beam([t.x,h-1.6,t.z],[px,py,pz],.055,trunk);g.crown([px,py,pz],[.78,.7,.68],v.season==='spring'&&kind==='maple'?m.leaf:foliage,i);}
  }
 }
 // Leaf litter replaces the green ground patches; spring adds many low flowers.
 for(let i=0;i<420;i++){
  const a=i*2.39996,r=Math.sqrt((i+.5)/420),x=Math.cos(a)*12.7*r,z=Math.sin(a)*10.2*r;
  if(nearPath(x,z,.7))continue;
  if(Math.abs(x)<2.6&&z>-4.5&&z<-.5||x>-9.7&&x<-6&&z>-2.2&&z<1.3||x>5.3&&x<10.4&&z>-3.3&&z<.2)continue;
  for(let leaf=0;leaf<5;leaf++){const px=x+(leaf-2)*.13,pz=z+Math.sin(leaf*2+i)*.22;g.quad([px-.09,.325,pz],[px,.325,pz+.055],[px+.09,.325,pz],[px,.325,pz-.055],leaf%2?m.copper:m.gold);}
  if(v.season==='spring'&&i%3===0)for(let flower=0;flower<4;flower++){
   const a=flower*2.4,px=x+Math.cos(a)*.32,pz=z+Math.sin(a)*.28;g.beam([px,.32,pz],[px,.53,pz],.015,m.leaf);g.ring([px,.53,pz],.12,.035,.045,flower%3?m.flower:m.gold,6);g.box([px,.58,pz],[.04,.02,.04],m.plaster);
  }
 }
 // Varied mushroom forms gather at tree roots, outside the main paths.
 for(const [index,t]of FOREST_TREES.entries()){
  if(index%3!==0)continue;const x=t.x+.38,z=t.z+.2,kind=index%5;
  for(let mushroom=0;mushroom<(kind===2?4:2);mushroom++){
   const px=x+(mushroom-.5)*.2,pz=z+Math.sin(mushroom*2)*.15,h=kind===2?.18+mushroom*.035:.28+mushroom*.07;
   g.ring([px,.3,pz],.045,.035,h,m.plaster,7);
   if(kind===3){for(let branch=0;branch<3;branch++)g.beam([px,.4,pz],[px+(branch-1)*.1,.65,pz+Math.sin(branch)*.08],.04,m.path);}
   else {g.crown([px,.3+h,pz],[kind===2?.13:.22,.075,kind===4?.13:.2],kind===0?m.vermilion:kind===1?m.wood:kind===4?m.path:m.gold);if(kind===0)for(let dot=0;dot<4;dot++){const a=dot*1.7;g.box([px+Math.cos(a)*.1,.37+h,pz+Math.sin(a)*.1],[.035,.015,.03],m.plaster);}}
  }
 }
 // The animal's trail loops through the left woodland, away from entrances and pets.
 for(let i=1;i<bearTrail.length;i++){const a=bearTrail[i-1],b=bearTrail[i];g.beam([a.x,.34,a.z],[b.x,.34,b.z],.42,m.path);}
 return new Float32Array(g.values);
}
export function makeForestActors():CultureActor[]{
 const bear=new Sculpture(),limbs:Limb[]=[];
 bear.crown([0,.75,0],[.68,.44,.35],m.ink);bear.crown([.58,.9,0],[.35,.31,.3],m.ink);bear.crown([.88,.79,0],[.23,.13,.18],m.wood);bear.crown([1.06,.82,0],[.08,.065,.1],m.ink);
 for(const side of [-1,1]){bear.crown([.54,1.17,side*.21],[.11,.12,.09],m.ink);bear.crown([.77,.99,side*.22],[.037,.04,.025],m.plaster);bear.crown([.79,.99,side*.24],[.018,.025,.015],m.ink);bear.beam([.6,.84,side*.24],[.67,.64,0],.045,m.plaster);}
 for(const x of [-.43,.43])for(const z of [-.23,.23]){const start=bear.values.length;bear.beam([x,.75,z],[x,.14,z],.19,m.ink);bear.box([x+.06,.1,z],[.3,.18,.21],m.ink);limbs.push({start,end:bear.values.length,pivot:[x,.75,z],axis:'z',amount:.24,phase:x*z>0?0:Math.PI});}
 const actors:CultureActor[]=[{id:'karuizawa-black-bear',kind:'forest-bear',mesh:new Float32Array(bear.values),limbs,phase:0}];
 for(let bird=0;bird<5;bird++){
  const g=new Sculpture(),wings:Limb[]=[];g.crown([0,.04,0],[.2,.12,.11],m.glass);g.crown([.18,.13,0],[.12,.12,.1],m.glass);g.crown([.14,.07,0],[.1,.08,.1],m.plaster);g.box([.32,.12,0],[.12,.04,.045],m.gold);
  for(const side of [-1,1]){g.crown([.23,.17,side*.075],[.027,.027,.018],m.ink);const start=g.values.length;g.tri([.04,.1,side*.07],[-.25,.13,side*.5],[-.2,-.015,side*.16],m.glass);for(let f=0;f<4;f++)g.beam([-.17+f*.055,.09,side*.16],[-.3+f*.035,.08,side*(.47-f*.035)],.025,m.ink);wings.push({start,end:g.values.length,pivot:[0,.08,side*.07],axis:'x',amount:.65,phase:side<0?0:Math.PI});}
  g.tri([-.12,.06,-.07],[-.12,.06,.07],[-.43,.1,0],m.ink);
  actors.push({id:`karuizawa-bird-${bird}`,kind:'forest-bird',mesh:new Float32Array(g.values),limbs:wings,phase:bird/5});
 }
 for(let index=0;index<4;index++){
  const g=new Sculpture(),legs:Limb[]=[];g.crown([0,.5,0],[.49,.29,.26],m.wood);g.crown([.5,.47,0],[.29,.21,.2],m.wood);g.crown([.76,.4,0],[.18,.12,.15],m.wood);g.box([.92,.41,0],[.035,.12,.17],m.copper);
  for(const side of [-1,1]){g.crown([.4,.69,side*.16],[.09,.15,.06],m.wood);g.crown([.62,.55,side*.17],[.027,.035,.018],m.ink);if(index>0)g.beam([-.34,.66,side*.12],[.18,.66,side*.12],.038,m.gold);else g.beam([.75,.35,side*.13],[.85,.44,side*.17],.025,m.plaster);}
  for(const x of [-.3,.3])for(const z of [-.17,.17]){const start=g.values.length;g.beam([x,.5,z],[x,.09,z],.1,m.wood);g.box([x+.035,.06,z],[.17,.1,.12],m.ink);legs.push({start,end:g.values.length,pivot:[x,.5,z],axis:'z',amount:.26,phase:x*z>0?0:Math.PI});}
  g.beam([-.43,.57,0],[-.66,.62,.06],.045,m.wood);
  actors.push({id:index===0?'karuizawa-mother-boar':`karuizawa-piglet-${index}`,kind:'forest-boar',mesh:new Float32Array(g.values),limbs:legs,phase:index});
 }
 return actors;
}
export function forestActorPose(actor:CultureActor,time:number){
 if(actor.kind==='forest-bear'){const p=FOREST_BEAR_ROUTE.pose(time*.4);return {...p,y:.34+Math.sin(time*3)*.012,scale:.85};}
 if(actor.kind==='forest-boar'){const p=FOREST_BOAR_ROUTE.pose(time*.32-actor.phase*.9),lane=actor.phase>0?(actor.phase%2?-.08:.08):0;return {x:p.x-Math.sin(p.angle)*lane,z:p.z+Math.cos(p.angle)*lane,angle:p.angle,y:.34+Math.sin(time*4+actor.phase)*.008,scale:actor.phase>0?.36:.8};}
 const a=time*.24+actor.phase*Math.PI*2;
 return {x:Math.cos(a)*7.1,y:6.8+(actor.phase*3%1.1)+Math.sin(time*1.3+actor.phase*7)*.25,z:-6.9+Math.sin(a)*1.3,angle:Math.atan2(Math.cos(a)*1.3,-Math.sin(a)*7.1),scale:1.2};
}

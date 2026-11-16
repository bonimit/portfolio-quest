import {Sculpture,MATERIAL as m,type Material} from './restored/world.ts';
import type {SceneVariant} from './variants.ts';
import type {V3} from './math.ts';
import {threePathId} from './three-path-catalog.ts';
import {BROADWAY_PROGRAM} from './broadway-shows.ts';
import {isBroadway} from './culture-scenes.ts';
import {sign} from './culture-geometry.ts';
import {addTrafficRoad,makeRoadVehicle} from './scene-traffic.ts';

type Tree='birch'|'willow'|'blossom'|'ginkgo'|'cedar'|'bamboo'|'banana'|'citrus';
type Street='taxi'|'tuktuk'|'bicycle'|'surf'|'ski'|'sculpture';
type Garden={trees:readonly [Tree,Tree];street:Street;fruit:Material;flowers:Material;pond:boolean;market:boolean};
const gardens:Record<string,Garden>={
 'nyc-spring':{trees:['blossom','birch'],street:'taxi',fruit:m.vermilion,flowers:m.flower,pond:true,market:true},
 'nyc-summer':{trees:['willow','birch'],street:'taxi',fruit:m.gold,flowers:m.gold,pond:true,market:true},
 'nyc-autumn':{trees:['ginkgo','birch'],street:'taxi',fruit:m.copper,flowers:m.vermilion,pond:true,market:true},
 'nyc-winter':{trees:['cedar','birch'],street:'taxi',fruit:m.vermilion,flowers:m.evergreen,pond:false,market:true},
 'tokyo-spring':{trees:['blossom','willow'],street:'bicycle',fruit:m.vermilion,flowers:m.flower,pond:true,market:true},
 'tokyo-summer':{trees:['willow','bamboo'],street:'bicycle',fruit:m.gold,flowers:m.flower,pond:true,market:true},
 'tokyo-autumn':{trees:['ginkgo','citrus'],street:'bicycle',fruit:m.copper,flowers:m.gold,pond:true,market:true},
 'tokyo-winter':{trees:['cedar','birch'],street:'bicycle',fruit:m.copper,flowers:m.evergreen,pond:false,market:true},
 'bangkok-raining':{trees:['banana','bamboo'],street:'tuktuk',fruit:m.gold,flowers:m.flower,pond:true,market:true},
 'bangkok-summer':{trees:['citrus','banana'],street:'tuktuk',fruit:m.gold,flowers:m.vermilion,pond:true,market:true},
 'bangkok-winter':{trees:['bamboo','citrus'],street:'tuktuk',fruit:m.copper,flowers:m.flower,pond:true,market:true},
 'place-centralpark':{trees:['blossom','willow'],street:'bicycle',fruit:m.vermilion,flowers:m.flower,pond:true,market:false},
 'place-coney':{trees:['birch','willow'],street:'taxi',fruit:m.gold,flowers:m.gold,pond:true,market:true},
 'place-highline':{trees:['ginkgo','birch'],street:'taxi',fruit:m.copper,flowers:m.vermilion,pond:true,market:false},
 'place-rockefeller':{trees:['cedar','birch'],street:'taxi',fruit:m.vermilion,flowers:m.evergreen,pond:false,market:true},
 'place-kyoto':{trees:['blossom','bamboo'],street:'bicycle',fruit:m.vermilion,flowers:m.flower,pond:true,market:true},
 'place-okinawa':{trees:['banana','citrus'],street:'surf',fruit:m.gold,flowers:m.vermilion,pond:true,market:true},
 'place-nikko':{trees:['ginkgo','cedar'],street:'bicycle',fruit:m.copper,flowers:m.gold,pond:true,market:false},
 'place-hakuba':{trees:['cedar','birch'],street:'ski',fruit:m.vermilion,flowers:m.evergreen,pond:false,market:false},
 'place-canalmarket':{trees:['banana','citrus'],street:'tuktuk',fruit:m.gold,flowers:m.flower,pond:true,market:true},
 'place-krabi':{trees:['banana','bamboo'],street:'surf',fruit:m.gold,flowers:m.vermilion,pond:true,market:true},
 'place-inthanon':{trees:['bamboo','blossom'],street:'sculpture',fruit:m.copper,flowers:m.flower,pond:true,market:true},
};
export function decorationPlan(v:SceneVariant){const plan=gardens[threePathId({...v,edition:'restored'})];if(!plan)throw Error(`Missing decoration plan: ${threePathId({...v,edition:'restored'})}`);return plan;}
/** Props occupy garden strips between the branches and pet clearings, never their routes. */
export const DECORATION_LOTS=[{x:-9.4,z:3.65,radius:1.28},{x:8.6,z:4,radius:1.48},{x:-4.8,z:4.7,radius:.72},{x:4.8,z:4.65,radius:.65},{x:-1.75,z:4.6,radius:.45},{x:1.75,z:4.6,radius:.45}];
function tree(g:Sculpture,x:number,z:number,kind:Tree,winter:boolean){
 const trunk=kind==='birch'?m.plaster:m.wood;
 if(kind==='bamboo'){
  for(let i=0;i<5;i++){const dx=(i-2)*.22,h=2.2+(i%3)*.35;g.beam([x+dx,.3,z],[x+dx+.1,h,z],.055,m.evergreen);for(let y=.6;y<h;y+=.42){g.box([x+dx,y,z],[.075,.04,.075],m.path);g.quad([x+dx,y,z],[x+dx+.65,y+.12,z+.12],[x+dx+.25,y+.28,z+.05],[x+dx,y+.04,z],m.leaf);}}return;
 }
 if(kind==='banana'){
  g.beam([x,.3,z],[x+.12,2.35,z],.15,m.wood);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2,tip:V3=[x+Math.cos(a)*1.1,2.2+(i%2)*.22,z+Math.sin(a)*1.1],base:V3=[x,2.5,z],mid:V3=[x+Math.cos(a)*.55,2.8,z+Math.sin(a)*.55];g.tri(base,[mid[0]-.18*Math.sin(a),mid[1],mid[2]+.18*Math.cos(a)],tip,m.leaf);g.tri(base,tip,[mid[0]+.18*Math.sin(a),mid[1],mid[2]-.18*Math.cos(a)],m.evergreen);}
  for(let i=0;i<4;i++)g.crown([x+.28+i*.07,2.02,z+.12],[.055,.19,.06],m.gold);return;
 }
 g.beam([x,.3,z],[x,2.7,z],kind==='birch'?.1:.13,trunk);
 if(kind==='birch')for(let y=.5;y<2.6;y+=.33)g.box([x,y,z+.065],[.12,.035,.02],m.ink);
 if(kind==='cedar'){for(let i=0;i<4;i++)g.ring([x,.8+i*.49,z],.95-i*.18,.03,.95,m.evergreen,9);if(winter)for(let i=0;i<3;i++)g.ring([x,1.5+i*.48,z],.63-i*.17,.03,.25,m.snow,9);return;}
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2,p:V3=[x+Math.cos(a)*.7,2.05+(i%2)*.45,z+Math.sin(a)*.65];g.beam([x,1.5,z],p,.055,trunk);
  if(winter&&kind==='birch')continue;
  const material=kind==='blossom'?m.flower:kind==='ginkgo'?m.gold:m.leaf;
  g.crown(p,[.58,.53,.5],material);
  if(kind==='citrus')for(let k=0;k<3;k++)g.crown([p[0]+(k-1)*.2,p[1]-.38,p[2]+.35],[.09,.1,.09],m.copper);
  if(kind==='willow')for(let k=0;k<4;k++){const t=k*.8;g.beam([p[0]+Math.cos(t)*.4,p[1],p[2]+Math.sin(t)*.4],[p[0]+Math.cos(t)*.48,p[1]-.95,p[2]+Math.sin(t)*.48],.055,m.leaf);}
 }
}
function flowers(g:Sculpture,x:number,z:number,color:Material,winter:boolean){
 g.ring([x,.28,z],.47,.43,.1,m.stone,10);
 for(let i=0;i<7;i++){const a=i*2.4,r=.12+(i%3)*.1,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,h=.55+(i%3)*.09;g.beam([px,.35,pz],[px,h,pz],.025,m.evergreen);if(winter){g.crown([px,h,pz],[.1,.14,.09],m.evergreen);continue;}g.crown([px,h,pz],[.11,.075,.11],color);g.crown([px,h+.045,pz],[.035,.035,.035],m.gold);}
}
function fruitStall(g:Sculpture,color:Material,market:boolean,winter:boolean){
 const x=-4.8,z=4.7;
 g.box([x,.56,z],[1.25,.5,.66],m.wood);for(const dx of [-.58,.58])g.beam([x+dx,.3,z-.26],[x+dx,market?1.9:.95,z-.26],.05,m.wood);
 if(market){g.box([x,1.91,z],[1.55,.08,1.0],winter?m.snow:m.plaster);for(let i=0;i<6;i++)g.box([x-.63+i*.25,1.96,z],[.12,.035,1],color);}
 for(let row=0;row<2;row++)for(let col=0;col<5;col++){const px=x-.46+col*.23,pz=z-.17+row*.28;g.crown([px,.88,pz],[.105,.11,.1],col<3?color:m.gold);g.beam([px,.97,pz],[px,1.03,pz],.018,m.wood);}
 g.box([x+.66,.9,z+.12],[.22,.28,.035],m.plaster);
}
function bench(g:Sculpture){const x=4.8,z=4.65;for(const dx of [-.52,.52])g.box([x+dx,.53,z],[.1,.5,.52],m.metal);for(const dz of [-.2,0,.2])g.box([x,.82,z+dz],[1.45,.08,.14],m.wood);g.box([x,1.15,z-.26],[1.45,.38,.07],m.wood);}
function streetProp(g:Sculpture,kind:Street){
 const x=8.6,z=4;
 if(kind==='taxi'||kind==='tuktuk'){addTrafficRoad(g);return;}
 g.box([x,.29,z],[2.8,.05,1.65],m.stone);for(const dx of [-1.1,1.1])g.box([x+dx,.33,z],[.13,.02,.5],m.path);
 if(kind==='bicycle'){
  for(const dx of [-.7,.7]){g.crown([x+dx,.68,z],[.34,.34,.055],m.ink);g.crown([x+dx,.68,z+.055],[.25,.25,.012],m.path);}
  for(const [a,b]of [[[-.7,.68],[0,.68]],[[0,.68],[-.3,1.17]],[[-.3,1.17],[-.7,.68]],[[-.3,1.17],[.46,1.17]],[[.46,1.17],[0,.68]],[[.46,1.17],[.7,.68]]] as [[number,number],[number,number]][])g.beam([x+a[0],a[1],z],[x+b[0],b[1],z],.045,m.copper);
  g.box([x-.3,1.25,z],[.34,.07,.16],m.wood);g.beam([x+.46,1.17,z],[x+.48,1.5,z],.04,m.metal);g.box([x+.48,1.51,z],[.08,.05,.48],m.metal);g.box([x+.85,1.22,z],[.38,.28,.45],m.wood);return;
 }
 if(kind==='surf'||kind==='ski'){for(let i=0;i<3;i++){g.box([x-.5+i*.45,1.25,z],[kind==='ski'?.14:.32,1.85,.08],i%2?m.copper:m.plaster,-.12+i*.12);g.box([x-.5+i*.45,.45,z+.04],[.14,.15,.12],m.ink);}g.beam([x-.9,.3,z-.2],[x-.9,1.8,z-.2],.06,m.wood);g.beam([x+.9,.3,z-.2],[x+.9,1.8,z-.2],.06,m.wood);g.beam([x-.9,1.4,z-.2],[x+.9,1.4,z-.2],.06,m.wood);return;}
 g.ring([x,.3,z],.65,.65,.3,m.stone,8);g.ring([x,.6,z],.45,.06,1.2,m.copper,5);g.crown([x,1.9,z],[.38,.3,.25],m.gold);
}
export const FROG_HOME:V3=[-9.7,.45,3.8];
export function frogPose(time:number,staticMotion=false){
 if(staticMotion)return {x:0,y:0,z:0,squash:1};
 const phase=((time%5.6)+5.6)%5.6,returning=phase>=2.8,t=phase%2.8;
 const jump=Math.max(0,Math.min(1,(t-1.9)/.65)),travel=returning?1-jump:jump;
 return {x:travel*.75,y:t>=1.9&&t<2.55?Math.sin(jump*Math.PI)*.55:0,z:-travel*.18,squash:t>1.6&&t<1.9?.75:1};
}
export function makeSceneDecorations(v:SceneVariant){
 const plan=decorationPlan(v),g=new Sculpture(),frog=new Sculpture(),broadway=isBroadway(v),winter=v.season==='winter'&&v.city!=='bangkok';
 if(broadway){
  // Paved sidewalks, ticket kiosk and illuminated show posters replace garden props.
  for(const [x,z,w,d]of [[0,0,23,14],[0,-8,18,2],[0,8,19,2]])g.box([x,.302,z],[w,.008,d],m.metal);
  for(const x of [-10.6,-6.1,6.1,10.6])g.box([x,.31,0],[.025,.008,13],m.metal);
  g.box([-9.4,1.05,3.65],[1.7,1.4,.85],m.brick);g.box([-9.4,1.43,4.09],[1.3,.56,.025],m.glass);sign(g,'TICKETS',-9.4,1.98,4.14,1.9,.35,m.vermilion);
  for(const [i,[x,z]]of [[-4.8,4.7],[4.8,4.65]].entries()){g.box([x,1.28,z],[1.12,1.9,.24],m.ink);sign(g,BROADWAY_PROGRAM.posters[i],x,1.55,z+.17,1.04,.56,i?m.gold:m.glass);sign(g,'TONIGHT',x,.86,z+.17,1.04,.24,m.flower);}
  for(const x of [-1.75,1.75]){g.box([x,.65,4.6],[.24,.65,.24],m.metal);g.box([x,1.01,4.6],[.28,.08,.28],m.lamp);}
  addTrafficRoad(g,false);
 }else{
 if(v.place!=='hokkaido')tree(g,-11.65,-.35,plan.trees[0],winter);tree(g,11.65,-.3,plan.trees[1],winter);
 flowers(g,-1.75,4.6,plan.flowers,winter);flowers(g,1.75,4.6,plan.flowers,winter);
 fruitStall(g,plan.fruit,plan.market,winter);bench(g);streetProp(g,plan.street);
 const x=-9.4,z=3.65;
 // A shallow, stone-edged garden pond; winter scenes retain an icy basin without frogs.
 if(v.place!=='hokkaido'){g.ring([x,.29,z],1.19,1.19,.12,m.stone,24);g.ring([x,.415,z],1.05,1.05,.025,winter?m.glass:m.water,24);}
 if(plan.pond){
  for(const [dx,dz]of [[-.3,.15],[.45,-.03],[.05,-.52]]){g.ring([x+dx,.45,z+dz],.23,.23,.018,m.leaf,10);g.crown([x+dx+.07,.51,z+dz],[.085,.06,.085],m.flower);}
  for(let i=0;i<5;i++){const px=x-.8+i*.13,pz=z-.55;g.beam([px,.4,pz],[px,.95+(i%2)*.16,pz],.025,m.evergreen);g.crown([px,1.02+(i%2)*.16,pz],[.045,.12,.045],m.wood);}
  const [fx,fy,fz]=FROG_HOME;frog.crown([fx,fy+.13,fz],[.23,.14,.18],m.leaf);frog.crown([fx+.1,fy+.2,fz+.11],[.19,.13,.12],m.evergreen);
  for(const dx of [-.11,.11]){frog.crown([fx+dx,fy+.31,fz+.13],[.075,.075,.065],m.plaster);frog.crown([fx+dx,fy+.32,fz+.18],[.028,.037,.018],m.ink);frog.crown([fx+dx*1.9,fy+.045,fz-.06],[.12,.055,.12],m.evergreen);frog.beam([fx+dx,fy+.12,fz+.12],[fx+dx*1.7,fy+.025,fz+.26],.045,m.leaf);}
 }
 }
 return {base:new Float32Array(g.values),frog:new Float32Array(frog.values),vehicle:plan.street==='taxi'||plan.street==='tuktuk'?makeRoadVehicle(plan.street):new Float32Array(),plan};
}

import {currentIslandBase} from './current-island-base.ts';
import {Sculpture, MATERIAL as m} from './restored/world.ts';
import {addClouds} from './restored/clouds.ts';
import type {V3} from './restored/math.ts';
import type {SceneVariant,Season} from './variants.ts';

/** Approval study only: no existing scene or destination is replaced. */
export const CONCEPT_SCENE_STUDY:SceneVariant={city:'tokyo',season:'autumn',light:'day',edition:'restored'};
export const STUDY_GALLERY={center:[-7.8,-.7] as const,door:[-7.8,.61] as const,roof:3.43};

export function makeConceptSceneStudy(layer='all',season:Season='autumn',includeGallery=true){
 const g=new Sculpture();
 const parts:Record<string,[number,number]>={};
 buildIsland(g,parts,season);
 // Central branch to the Portfolio studio, authored with the other two paths.
 for(let i=0;i<8;i++)g.box([0,.48,2.25-i*.48],[1.05,.12,.38],m.path,0,1.03);
 if(includeGallery){const galleryStart=g.values.length;
 // Broad stone footing, a raised veranda and timber/plaster gallery walls.
 g.box([0,.48,-2.6],[3.9,.3,3.35],m.stone);
 g.box([0,.69,-2.6],[3.65,.12,3.12],m.wood);
 g.box([0,2.1,-3.95],[3.45,2.8,.18],m.plaster);
 for(const x of [-1.65,1.65]){
  g.box([x,2.1,-2.6],[.18,2.8,2.85],m.plaster);
  g.box([x,2.1,-1.14],[.18,2.8,.18],m.wood);
 }
 // Recessed, visibly open central doorway; illustrated display bays on either side.
 g.box([0,1.86,-3.81],[1.06,2.2,.08],m.ink);
 for(const x of [-1.03,1.03]){
  g.box([x,1.93,-1.12],[.94,2.24,.16],m.wood);
  g.box([x,1.93,-1.01],[.76,2.02,.06],m.lamp,0,.62);
  g.box([x,1.93,-.96],[.6,1.35,.04],m.plaster);
  // Original abstract prints: warm disc and an ink/terracotta composition.
  if(x<0){g.crown([x,2.12,-.9],[.19,.19,.025],m.copper);g.box([x,1.61,-.9],[.36,.035,.025],m.ink);}
  else {g.box([x-.12,1.87,-.9],[.12,.58,.025],m.ink);g.box([x+.1,1.76,-.9],[.14,.34,.025],m.copper);}
  for(const dx of [-.43,.43])g.box([x+dx,1.93,-.9],[.055,2.24,.055],m.wood);
 }
 for(const x of [-.56,.56])g.box([x,1.91,-1.08],[.12,2.65,.18],m.wood);
 g.box([0,3.25,-1.08],[3.55,.18,.2],m.wood);
 // Tiled gable and deep eaves use the same slate and pale ridge as the studio.
 const a:[number,number,number]=[-2.05,3.45,-.7],b:[number,number,number]=[2.05,3.45,-.7];
 const c:[number,number,number]=[2.05,3.45,-4.5],d:[number,number,number]=[-2.05,3.45,-4.5];
 const front:[number,number,number]=[0,4.65,-.7],back:[number,number,number]=[0,4.65,-4.5];
 g.quad(a,d,back,front,m.rock);g.quad(front,back,c,b,m.rock);
 g.tri(a,front,b,m.plaster);g.tri(d,c,back,m.plaster);
 g.beam(front,back,.12,m.path);
 for(let i=0;i<11;i++){
  const z=-.72-i*.37;
  g.beam([-2.03,3.48,z],[0,4.68,z],.035,m.path,.73);
  g.beam([0,4.68,z],[2.03,3.48,z],.035,m.path,.73);
 }
 // Copper noren, short steps and stone lanterns make this an inhabited destination.
 const curtains=g.values.length;
 for(const x of [-.25,.25])g.box([x,2.86,-.84],[.43,.48,.04],m.copper);
 parts.curtains=[curtains,g.values.length];
 g.box([0,.41,-.52],[1.32,.16,.48],m.stone);
 for(const x of [-1.15,1.15]){
  g.box([x,.64,.25],[.37,.52,.37],m.stone);
  g.box([x,1.05,.25],[.32,.3,.32],m.lamp);
  g.box([x,1.26,.25],[.48,.12,.48],m.rock);
 }
 // Keep the gallery secondary in scale; transform around its ground-level centre.
 for(let i=galleryStart;i<g.values.length;i+=8){
  g.values[i]=-7.8+g.values[i]*.72;
  g.values[i+1]=.28+(g.values[i+1]-.28)*.72;
  g.values[i+2]=-.7+(g.values[i+2]+2.6)*.72;
 }
 }
 addClouds(g,m.cloud);
 if(layer==='all')return new Float32Array(g.values);
 const ranges=Object.entries(parts),selected:number[]=[];
 for(let i=0;i<g.values.length;i+=24){const part=ranges.find(([,range])=>i>=range[0]&&i<range[1])?.[0];if(layer==='base'?!part:part===layer)selected.push(...g.values.slice(i,i+24));}
 return new Float32Array(selected);
}

/** A newly composed three-destination island using the established material vocabulary. */
function buildIsland(g:Sculpture,parts:Record<string,[number,number]>,season:Season){
 g.values.push(...currentIslandBase());
 // Shared arrival clearing and deliberately open foreground for Wayfinder.
 g.ring([0,.3,8.6],1.7,1.7,.08,m.path,32,.94);
 g.ring([0,.32,2.8],1.15,1.15,.1,m.stone,24);
 g.ring([0,.44,2.8],.21,.21,.025,m.copper,12);
 const path=(points:readonly (readonly [number,number])[])=>{
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),steps=Math.ceil(length/.5),rotation=Math.atan2(dx,dz);
   for(let j=0;j<steps;j++){const t=(j+.5)/steps;g.box([a[0]+dx*t,.38,a[1]+dz*t],[1.03,.12,length/steps-.07],m.path,rotation,1+.025*Math.sin(j));}
  }
 };
 path([[0,8.6],[0,3.8]]);
 path([[-.7,2.8],[-3.2,2],[-7.8,1.2],[-7.8,.6]]);
 path([[.7,2.8],[3.2,2],[7.8,1.2]]);
 // Centre: primary timber design studio, shoji facade and a broad veranda.
 const x=0,z=-2.6;
 g.box([x,.48,z],[4.3,.32,3.55],m.stone);
 g.box([x,1.85,z],[3.6,2.65,2.8],m.wood);
 g.box([x,.7,z+1.65],[4.3,.16,.8],m.path);
 for(const dx of [-1.2,0,1.2]){
  g.box([x+dx,1.83,z+1.46],[1,1.95,.09],m.lamp,0,.6);
  for(let i=0;i<4;i++)g.box([x+dx-.43+i*.28,1.83,z+1.54],[.04,1.96,.05],m.wood);
  for(const y of [1.3,2.1])g.box([x+dx,y,z+1.55],[1,.04,.04],m.wood);
 }
 roof(g,x,3.25,z,5,3.9,1.4);
 for(const dx of [-2,2])g.box([x+dx,1.91,z+1.6],[.13,2.65,.13],m.wood);
 const banner=g.values.length;
 g.beam([1.35,3.1,-.85],[2.05,3.1,-.85],.055,m.wood);
 g.box([1.7,2.66,-.85],[.48,.82,.04],m.copper);
 g.box([1.7,2.67,-.81],[.22,.28,.02],m.plaster);
 parts.banner=[banner,g.values.length];
 // Right: lantern gate with a destination courtyard beyond it.
 for(const dx of [-1.5,1.5]){
  g.ring([7.8+dx,.3,-.4],.2,.16,3.8,m.copper,12);
  g.ring([7.8+dx,.3,-.4],.27,.25,.6,m.ink,12);
 }
 g.box([7.8,3.55,-.4],[4,.22,.4],m.copper);
 g.box([7.8,4.3,-.4],[4.8,.25,.6],m.rock);
 for(const side of [-1,1])g.beam([7.8+side*2.2,4.3,-.4],[7.8+side*2.6,4.5,-.4],.2,m.rock);
 for(const [index,dx] of [-.9,0,.9].entries()){
  const start=g.values.length;
  g.beam([7.8+dx,3.5,-.4],[7.8+dx,2.85,-.4],.025,m.ink);
  g.crown([7.8+dx,2.67,-.4],[.19,.28,.19],m.lamp);
  parts[`lantern-${index}`]=[start,g.values.length];
 }
 path([[7.8,1.2],[7.8,-2.4]]);
 // Mountain, groves and pond frame the three landmarks rather than competing with them.
 mountainBackdrop(g,season);
 for(const [tx,tz,size]of [[-9,-3.5,1],[-11.5,.3,.9],[-7.7,5.1,.8],[9.3,-3.9,1.05],[11.5,.5,.85],[8.3,5.8,.75],[-4.8,-3.8,.9],[4.8,-3.7,.95]]){
  g.beam([tx,.3,tz],[tx,2*size,tz],.16,m.wood);
  if(season==='winter'){
   for(const dx of [-.7,.7]){g.beam([tx,1.2*size,tz],[tx+dx*size,2.6*size,tz],.1,m.wood);g.crown([tx+dx*size,2.6*size,tz],[.4*size,.12*size,.3*size],m.snow);}
  }else{
   g.crown([tx-.35,2.3*size,tz],[1.05*size,1.1*size,.85*size],m.leaf,tx);
   g.crown([tx+.4,2.85*size,tz],[.9*size,1.05*size,.8*size],m.leaf,tz);
   if(season!=='summer')for(let i=0;i<3;i++)g.crown([tx+Math.sin(i*2)*.5,1.85*size,tz+.65],[.13,.13,.13],m.flower,i);
  }
 }
 // Varied Japanese garden silhouettes: cloud-pruned pines, small maples and bamboo.
 for(const [x,z,size] of [[-11.2,-1.8,.95],[11,-2.5,1.05],[-4.3,-4.4,.6]])pine(g,x,z,size);
 for(const [x,z,size] of [[-11,3.8,.65],[-3.1,5,.48],[3.4,4.8,.52],[10.6,4.3,.45]])maple(g,x,z,size,season);
 bamboo(g,10.6,2.1);
 g.ring([-9.3,.3,3],1.3,1.3,.06,m.path,32);
 g.ring([-9.3,.37,3],1.1,1.1,.025,m.water,32);
 for(let i=0;i<8;i++)g.box([-10.5+i*.34,.55,3],[.3,.1,.7],m.wood);
 for(const [lx,lz]of [[-1.1,6],[1.1,6],[-3,2.7],[3,2.7],[-9.8,1],[9.8,1]]){
  g.beam([lx,.3,lz],[lx,1.7,lz],.06,m.wood);
  g.box([lx,1.8,lz],[.25,.36,.25],m.lamp);
  g.ring([lx,2,lz],.3,.02,.2,m.copper,4);
 }
 for(let i=0;i<(season==='summer'?0:28);i++){
  const lx=-10+(i*3.17)%20,lz=3.8+(i*1.71)%5;
  if(Math.abs(lx)<2)continue;
  g.box([lx,.33,lz],[.17,.025,.11],season==='winter'?m.snow:season==='spring'?m.flower:m.copper,i);
 }
}
function roof(g:Sculpture,x:number,y:number,z:number,width:number,depth:number,rise:number){
 const a:V3=[x-width/2,y,z+depth/2],b:V3=[x+width/2,y,z+depth/2],c:V3=[x+width/2,y,z-depth/2],d:V3=[x-width/2,y,z-depth/2];
 const front:V3=[x,y+rise,z+depth/2],back:V3=[x,y+rise,z-depth/2];
 g.quad(a,d,back,front,m.rock);g.quad(front,back,c,b,m.rock);g.tri(a,front,b,m.wood);g.tri(d,c,back,m.wood);g.beam(front,back,.13,m.path);
 for(let i=0;i<12;i++){const zz=z-depth/2+i*depth/11;g.beam([x-width/2,y+.03,zz],[x,y+rise+.03,zz],.035,m.path,.75);g.beam([x,y+rise+.03,zz],[x+width/2,y+.03,zz],.035,m.path,.75);}
}

/** Broad lower shoulders cover the rear clearing; the summit stays slender. */
function mountainBackdrop(g:Sculpture,season:Season){
 const rows=[{x:10.6,z:2.6,y:.28,cz:-7.4},{x:5.6,z:1.9,y:3.4,cz:-7.7},{x:2.35,z:1.05,y:6.3,cz:-8},{x:.9,z:.55,y:7.6,cz:-8},{x:.03,z:.025,y:9.18,cz:-8}];
 const point=(row:typeof rows[number],i:number):V3=>{const a=i/32*Math.PI*2;return [Math.cos(a)*row.x,row.y,row.cz+Math.sin(a)*row.z];};
 for(let row=0;row<rows.length-1;row++)for(let i=0;i<32;i++)g.quad(point(rows[row],i),point(rows[row+1],i),point(rows[row+1],i+1),point(rows[row],i+1),row>=(season==='winter'?1:rows.length-2)?m.snow:m.rock,.97+.025*Math.sin(i*.7));
}
function pine(g:Sculpture,x:number,z:number,size:number){
 g.beam([x,.28,z],[x+.16*size,2.7*size,z],.16*size,m.wood);
 for(const [dx,y,r]of [[-.55,1.7,.85],[.6,2.25,.78],[-.15,2.9,.9]]){
  g.beam([x,1.1*size,z],[x+dx*size,y*size,z],.08*size,m.wood);
  g.crown([x+dx*size,y*size,z],[r*size,.36*size,.65*size],m.evergreen,y);
  g.crown([x+(dx+.28)*size,(y+.14)*size,z-.1],[r*.65*size,.3*size,.5*size],m.evergreen,x);
 }
}
function maple(g:Sculpture,x:number,z:number,size:number,season:Season){
 g.beam([x,.28,z],[x,1.8*size,z],.13*size,m.wood);
 for(const [dx,dz,y] of [[-.7,.1,2],[.7,-.1,2.2],[0,.2,2.7]]){
  g.beam([x,1.1*size,z],[x+dx*size,y*size,z+dz],.07*size,m.wood);
  g.crown([x+dx*size,y*size,z+dz],[.8*size,(season==='winter'?.1:.6)*size,.65*size],season==='winter'?m.snow:season==='autumn'?m.copper:season==='spring'?m.flower:m.leaf,dx);
 }
}
function bamboo(g:Sculpture,x:number,z:number){
 for(let i=0;i<5;i++){
  const bx=x+(i%3)*.24,bz=z+Math.floor(i/3)*.35,height=1.8+(i%3)*.36;
  g.beam([bx,.28,bz],[bx,height,bz],.055,m.evergreen);
  for(const y of [.8,1.3,1.8]){
   g.ring([bx,y,bz],.037,.037,.04,m.leaf,6);
   for(const side of [-1,1]){const tip:V3=[bx+side*.46,y+.28,bz+.12];g.tri([bx,y,bz],tip,[bx+side*.27,y+.1,bz+.28],m.evergreen);}
  }
 }
}

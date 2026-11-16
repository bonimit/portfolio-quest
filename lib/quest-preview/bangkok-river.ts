import {Sculpture,MATERIAL as m,type Material} from './restored/world.ts';
import {PlaceDetails} from './restored/place-scenes/details.ts';
import type {SceneVariant} from './variants.ts';
import type {V3} from './math.ts';
export const BANGKOK_RIVER_WIDTH=2.5;
export const BANGKOK_RIVER:readonly (readonly [number,number])[]=[[-12.5,-2.8],[-10,-4.45],[-6,-6],[-1.5,-6.35],[3.5,-6.1],[7.6,-5.45],[10.4,-4.2],[12.5,-2.8]];
export const RIVER_TURN_POCKETS=[[-10.7,-4.2],[10.7,-4.2]] as const;
export const RIVER_TURN_RADIUS=1.6;
export const RIVER_NAVIGATION:readonly (readonly [number,number])[]=[RIVER_TURN_POCKETS[0],...BANGKOK_RIVER.slice(1,-1).map(([x,z])=>[x,z+.22] as const),RIVER_TURN_POCKETS[1]];
export function hasBangkokRiver(v:SceneVariant){return v.city==='bangkok'&&(!v.place||v.place==='canalmarket');}
export const RIVER_BOATS=[{x:-10,z:-4.45,angle:-.45,ferry:false},{x:-3.9,z:-6.16,angle:-.07,ferry:false},{x:3.65,z:-6.08,angle:.13,ferry:true}] as const;
function river(g:Sculpture){
 for(const [x,z] of RIVER_TURN_POCKETS)g.ring([x,.4,z],RIVER_TURN_RADIUS,RIVER_TURN_RADIUS,.001,m.water,48);
 const half=BANGKOK_RIVER_WIDTH/2;
 const banks=BANGKOK_RIVER.map((p,i)=>{const prev=BANGKOK_RIVER[Math.max(0,i-1)],next=BANGKOK_RIVER[Math.min(BANGKOK_RIVER.length-1,i+1)],dx=next[0]-prev[0],dz=next[1]-prev[1],length=Math.hypot(dx,dz);return {left:[p[0]-dz/length*half,.4,p[1]+dx/length*half] as V3,right:[p[0]+dz/length*half,.4,p[1]-dx/length*half] as V3};});
 for(let i=1;i<banks.length;i++){
  const a=banks[i-1],b=banks[i];g.quad(a.left,b.left,b.right,a.right,m.water);
  for(const side of ['left','right'] as const){const p=a[side],q=b[side];for(let j=0;j<12;j++){
   const start:[number,number]=[p[0]+(q[0]-p[0])*j/12,p[2]+(q[2]-p[2])*j/12],end:[number,number]=[p[0]+(q[0]-p[0])*(j+1)/12,p[2]+(q[2]-p[2])*(j+1)/12],mid=[(start[0]+end[0])/2,(start[1]+end[1])/2];
   if(RIVER_TURN_POCKETS.some(c=>Math.hypot(mid[0]-c[0],mid[1]-c[1])<RIVER_TURN_RADIUS+.1))continue;
   g.beam([start[0],.38,start[1]],[end[0],.38,end[1]],.13,m.stone);g.beam([start[0],.3,start[1]],[end[0],.3,end[1]],.22,m.path);
  }}
  const p=BANGKOK_RIVER[i-1],q=BANGKOK_RIVER[i];
  for(let j=0;j<4;j++){const t=(j+.4)/4,dx=q[0]-p[0],dz=q[1]-p[1],x=p[0]+dx*t,z=p[1]+dz*t;g.beam([x-.22,.416,z+(j%2?-.5:.5)],[x+.22,.416,z+(j%2?-.5:.5)],.018,m.glass);}
 }
}
function boat(g:Sculpture,x:number,z:number,angle:number,ferry:boolean){
 const b=new Sculpture(),length=ferry?1.7:1.4,width=ferry?.48:.33;
 // A long, tapered wooden hull with raised bow and stern, afloat at the waterline.
 b.crown([0,.48,0],[length,.19,width],ferry?m.vermilion:m.wood);b.box([0,.61,0],[length*1.55,.07,width*1.55],m.path);
 for(const side of [-1,1]){b.beam([-length*.82,.66,side*width*.8],[length*.82,.66,side*width*.8],.065,m.wood);b.beam([length*.8,.62,side*width*.55],[length*1.03,.86,0],.055,m.wood);}
 if(ferry){
  for(const dx of [-1,1])for(const dz of [-.35,.35])b.beam([dx,.62,dz],[dx,1.45,dz],.045,m.plaster);
  b.box([0,1.45,0],[2.7,.13,1.05],m.copper);b.box([.8,1.03,0],[.48,.62,.65],m.glass);
  for(const dx of [-.65,-.1,.45])b.box([dx,.8,0],[.18,.24,.68],m.wood);
 }else{
  for(const dx of [-.75,.55])for(const dz of [-.25,.25])b.beam([dx,.66,dz],[dx,1.18,dz],.035,m.wood);
  b.box([-.1,1.2,0],[1.9,.08,.8],m.gold);b.beam([-1.1,.65,0],[-2.15,.8,0],.045,m.ink);b.box([-.95,.81,0],[.22,.3,.32],m.ink);
  for(const dx of [-.6,0,.6])b.box([dx,.72,0],[.13,.07,.5],m.wood);
 }
 for(let i=0;i<b.values.length;i+=8){const px=b.values[i],pz=b.values[i+2],nx=b.values[i+3],nz=b.values[i+5],c=Math.cos(angle),s=Math.sin(angle);b.values[i]=x+px*c-pz*s;b.values[i+2]=z+px*s+pz*c;b.values[i+3]=nx*c-nz*s;b.values[i+5]=nx*s+nz*c;}
 for(let i=0;i<b.values.length;i+=8192)g.values.push(...b.values.slice(i,i+8192));
}
function templeRoof(g:Sculpture,x:number,y:number,z:number,w:number,depth:number,rise:number){
 const front=z+depth/2,back=z-depth/2;
 g.quad([x-w/2,y,front],[x-w/2,y,back],[x,y+rise,back],[x,y+rise,front],m.copper);
 g.quad([x,y+rise,front],[x,y+rise,back],[x+w/2,y,back],[x+w/2,y,front],m.copper);
 g.tri([x-w/2,y,front],[x,y+rise,front],[x+w/2,y,front],m.gold);
 for(const dz of [front,back]){
  g.beam([x-w/2,y,dz],[x,y+rise,dz],.07,m.gold);g.beam([x,y+rise,dz],[x+w/2,y,dz],.07,m.gold);
  for(const side of [-1,1])g.beam([x+side*w/2,y,dz],[x+side*(w/2+.17),y+.42,dz],.055,m.gold);
 }
 g.beam([x,y+rise,front],[x,y+rise,back],.09,m.gold);
}
function temple(g:Sculpture){
 const d=new PlaceDetails(g),x=4.9,z=-8.1;
 for(let i=0;i<3;i++)g.box([x,.35+i*.14,z],[4.5-i*.25,.16,2.7-i*.13],m.stone);
 g.box([x,1.55,z],[3.45,1.9,2.15],m.plaster);
 for(const dx of [-1.5,-.85,.85,1.5]){g.box([x+dx,1.6,z+1.15],[.15,1.9,.15],m.plaster);g.box([x+dx,.74,z+1.15],[.23,.12,.23],m.gold);}
 g.box([x,1.55,z+1.1],[.8,1.8,.08],m.vermilion);g.box([x,1.55,z+1.16],[.045,1.8,.035],m.gold);
 templeRoof(g,x,2.5,z,4.15,2.8,1.15);templeRoof(g,x,3.12,z-.15,3.15,2.15,.94);templeRoof(g,x,3.65,z-.3,2.0,1.5,.7);
 // A riverside chedi with a gold finial; the hall and tower share the same quay.
 const cx=8.0,cz=-7.4;g.box([cx,.45,cz],[2.15,.3,2.1],m.stone);
 for(let i=0;i<5;i++)g.ring([cx,.6+i*.43,cz],1.05-i*.15,.95-i*.15,.43,i%2?m.plaster:m.gold,8);
 g.ring([cx,2.75,cz],.42,.16,1.0,m.gold,10);g.ring([cx,3.75,cz],.16,.01,1.05,m.gold,8);
 // A landing pier on the north bank with lights reflected in the water.
 g.box([5.4,.55,-7.25],[2.8,.18,.6],m.wood);g.box([5.4,.55,-7.1],[.8,.18,.5],m.wood);
 for(const px of [4.2,6.6]){d.lamp(px,-7.15,1.8);g.beam([px,.3,-7.2],[px,.95,-7.2],.09,m.wood);}
}
function skyline(g:Sculpture){
 for(const [x,z,w,h,style]of [[-9.1,-7.8,2.1,5.4,1],[-6.35,-8.6,2.25,4.6,0],[-3.5,-8.9,2.1,4.2,0],[-.7,-8.9,1.65,3.7,0]]){
  const facade:Material=style?m.stone:m.glass;
  g.box([x,.3+h/2,z],[w,h,1.55],facade);
  for(let row=0;row<Math.floor(h/.65);row++)for(let col=0;col<3;col++)g.box([x+(col-1)*w*.26,.85+row*.65,z+.8],[w*.16,.34,.035],(row+col)%4===0?m.lamp:m.ink);
  for(let row=0;row<Math.floor(h/1.2);row++)g.box([x,.6+row*1.2,z],[w+.1,.07,1.63],m.plaster);
  g.box([x,h+.4,z],[w*.72,.25,1.15],m.metal);if(style){g.box([x,h+.85,z],[w*.4,.65,.8],m.glass);g.beam([x,h+1.1,z],[x,h+1.65,z],.045,m.metal);}
 }
}
/** The riverfront is authored after layout transforms so its width and landmarks stay substantial. */
export function makeBangkokRiverfront(v:SceneVariant){
 const g=new Sculpture();if(!hasBangkokRiver(v))return new Float32Array();
 river(g);skyline(g);temple(g);
 return new Float32Array(g.values);
}

export function makeBangkokBoats(v:SceneVariant){
 if(!hasBangkokRiver(v))return [];
 return RIVER_BOATS.map(b=>{const g=new Sculpture();boat(g,0,0,0,b.ferry);return new Float32Array(g.values);});
}

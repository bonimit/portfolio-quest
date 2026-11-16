import {add,sub,scale,cross,normalize,type V3} from '../math.ts';
import {DEFAULT_VARIANT,isSnow,type SceneVariant} from '../variants.ts';
/** Batched flat-shaded geometry: position, face normal, material index, tonal variation. */
export const MATERIAL = {rock:0,grass:1,path:2,stone:3,copper:4,wood:5,leaf:6,water:7,ink:8,lamp:9,cloud:10,flower:11,capy:12,frenchie:13,cream:14,petLeaf:15,petPink:16} as const;
export type Material = typeof MATERIAL[keyof typeof MATERIAL];
export class Sculpture {
  values: number[]=[];
  tri(a: V3,b: V3,c: V3,material: Material,tone=1) {
    const n=normalize(cross(sub(b,a),sub(c,a)));
    for(const p of [a,b,c])this.values.push(...p,...n,material,tone);
  }
  quad(a: V3,b: V3,c: V3,d: V3,m: Material,tone=1){this.tri(a,b,c,m,tone);this.tri(a,c,d,m,tone);}
  box(center: V3,size: V3,m: Material,rotation=0,tone=1) {
    const point=(x:number,y:number,z:number):V3=>[center[0]+x*Math.cos(rotation)+z*Math.sin(rotation),center[1]+y,center[2]-x*Math.sin(rotation)+z*Math.cos(rotation)];
    const [x,y,z]=size.map(v=>v/2);
    const p=[point(-x,-y,-z),point(x,-y,-z),point(x,y,-z),point(-x,y,-z),point(-x,-y,z),point(x,-y,z),point(x,y,z),point(-x,y,z)];
    for(const [a,b,c,d] of [[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]])this.quad(p[a],p[b],p[c],p[d],m,tone);
  }
  ring(center: V3,bottom: number,top: number,height: number,m: Material,sides=12,tone=1,phase=0) {
    const at=(r:number,y:number,i:number):V3=>[center[0]+Math.cos(i/sides*Math.PI*2+phase)*r,center[1]+y,center[2]+Math.sin(i/sides*Math.PI*2+phase)*r];
    for(let i=0;i<sides;i++){
      const a=at(bottom,0,i),b=at(bottom,0,i+1),c=at(top,height,i+1),d=at(top,height,i);
      this.quad(a,d,c,b,m,tone);this.tri([center[0],center[1]+height,center[2]],c,d,m,tone);
      this.tri(center,a,b,m,tone*.9);
    }
  }
  beam(from: V3,to: V3,width: number,m: Material,tone=1) {
    const axis=normalize(sub(to,from));const u=scale(normalize(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),width/2),v=scale(cross(axis,normalize(u)),width/2);
    const corner=(p:V3,a:number,b:number)=>add(p,add(scale(u,a),scale(v,b)));
    for(let i=0;i<4;i++){const a=[[1,1],[-1,1],[-1,-1],[1,-1]][i],b=[[1,1],[-1,1],[-1,-1],[1,-1]][(i+1)%4];this.quad(corner(from,...a as [number,number]),corner(to,...a as [number,number]),corner(to,...b as [number,number]),corner(from,...b as [number,number]),m,tone);}
  }
  crown(center: V3,size: V3,m: Material,phase=0) {
    const rows=5,sides=9;
    const point=(row:number,i:number):V3=>{
      const lat=-Math.PI/2+row/rows*Math.PI,angle=i/sides*Math.PI*2;
      const scallop=1+.12*Math.sin(i*2.1+row*.7+phase);
      return [center[0]+Math.cos(lat)*Math.cos(angle)*size[0]*scallop,center[1]+Math.sin(lat)*size[1],center[2]+Math.cos(lat)*Math.sin(angle)*size[2]*scallop];
    };
    for(let row=0;row<rows;row++)for(let i=0;i<sides;i++)this.quad(point(row,i),point(row+1,i),point(row+1,i+1),point(row,i+1),m,.95+.07*Math.sin(i*3+row+phase));
  }
}
function island(g:Sculpture) {
  const sides=36;
  const shape=(i:number,shrink:number,y:number):V3=>{
    const a=i/sides*Math.PI*2,r=1+.06*Math.sin(a*3+.4)+.035*Math.cos(a*7);
    return [Math.cos(a)*14*r*shrink+(.3-y)*.06,y,Math.sin(a)*11.6*r*shrink];
  };
  for(let i=0;i<sides;i++){
    const top=shape(i,1,.2),next=shape(i+1,1,.2);
    const inner=shape(i,.55,.28+Math.sin(i*2)*.02),innerNext=shape(i+1,.55,.28+Math.sin((i+1)*2)*.02);
    g.tri([0,.25,0],innerNext,inner,MATERIAL.grass,1+.03*Math.sin(i));
    g.quad(inner,innerNext,next,top,MATERIAL.grass,1+.045*Math.cos(i*3));
    g.quad(top,next,shape(i+1,.98,-.45),shape(i,.98,-.45),MATERIAL.path,.69);
    g.quad(shape(i,.98,-.45),shape(i+1,.98,-.45),shape(i+1,.83,-2.15+(i%3)*.15),shape(i,.83,-2.15+(i%3)*.15),MATERIAL.rock,1+.09*Math.sin(i));
    const low=shape(i,.34,-5.1+(i%4)*.3),lowNext=shape(i+1,.34,-5.1+((i+1)%4)*.3);
    g.tri(shape(i,.83,-2.15),shape(i+1,.83,-2.15),low,MATERIAL.rock,.78);
    g.tri(shape(i+1,.83,-2.15),lowNext,low,MATERIAL.rock,.93);
    g.tri(low,lowNext,[.8,-6.8,-.4],MATERIAL.rock,.65);
  }
  // Sedimentary shelves and a few detached fragments make a lopsided, carved silhouette.
  for(const [x,y,z,r] of [[-8,-1.7,4,1.4],[8.4,-2.4,2,1.6],[-5,-4.1,-3,1.2],[2,-5.7,1,.9],[12,-3.2,1,.7],[-11,-4.7,1,.55]])g.crown([x,y,z],[r,r*.8,r*.7],MATERIAL.rock,x);
}
function path(g:Sculpture,points:V3[]) {
  for(let i=1;i<points.length;i++){
    const from=points[i-1],to=points[i],d=sub(to,from),length=Math.hypot(d[0],d[2]),angle=Math.atan2(d[0],d[2]);
    g.box(scale(add(from,to),.5),[1.22,.06,length+.08],MATERIAL.path,angle,.8);
    const steps=Math.ceil(length/.63);
    for(let j=0;j<steps;j++){
      const p=add(from,scale(d,(j+.5)/steps));p[1]+=.06;
      g.box(p,[.88+.1*Math.sin(j*1.8+i),.1,length/steps-.09],MATERIAL.path,angle+.08*Math.sin(j*3+i),1+.06*Math.sin(j));
    }
  }
}
function arch(g:Sculpture,x:number,y:number,z:number,radius:number,thick:number,start=0,end=Math.PI,material:Material=MATERIAL.stone) {
  const n=11;
  for(let i=0;i<n;i++){
    if(i/n<start/Math.PI || (i+1)/n>end/Math.PI)continue;
    const a=i/n*Math.PI+.018,b=(i+1)/n*Math.PI-.018;
    const at=(r:number,t:number,depth:number):V3=>[x+Math.cos(t)*r,y+Math.sin(t)*r,z+depth];
    g.quad(at(radius,a,.24),at(radius+thick,a,.24),at(radius+thick,b,.24),at(radius,b,.24),material,1+(i%3)*.025);
    g.quad(at(radius,a,-.24),at(radius,b,-.24),at(radius+thick,b,-.24),at(radius+thick,a,-.24),material);
    g.quad(at(radius,a,.24),at(radius,b,.24),at(radius,b,-.24),at(radius,a,-.24),material,.78);
    g.quad(at(radius+thick,a,.24),at(radius+thick,a,-.24),at(radius+thick,b,-.24),at(radius+thick,b,.24),material,.94);
    g.quad(at(radius,a,-.24),at(radius+thick,a,-.24),at(radius+thick,a,.24),at(radius,a,.24),material,.85);
  }
}
/** Shared city-building vocabulary; destination anchors never move. */
function windows(g:Sculpture,x:number,z:number,width:number,floors:number,step=1.35) {
  for(let floor=0;floor<floors;floor++)for(const dx of [-width*.28,width*.28]) {
    const y=1.35+floor*step;
    g.box([x+dx,y,z],[.56,.77,.12],MATERIAL.ink);
    g.box([x+dx,y,z+.08],[.34,.57,.03],MATERIAL.lamp,0,.76+floor*.04);
    g.box([x+dx,y-.47,z+.12],[.74,.1,.24],MATERIAL.path);
  }
}
function roof(g:Sculpture,x:number,y:number,z:number,w:number,d:number,m:Material) {
  g.box([x,y,z],[w,.16,d],MATERIAL.ink);
  const a:V3=[x-w/2,y+.12,z-d/2],b:V3=[x+w/2,y+.12,z-d/2];
  const c:V3=[x+w/2,y+.12,z+d/2],e:V3=[x-w/2,y+.12,z+d/2];
  const ridgeA:V3=[x-w*.28,y+1,z],ridgeB:V3=[x+w*.28,y+1,z];
  g.quad(a,b,ridgeB,ridgeA,m);g.quad(e,ridgeA,ridgeB,c,m);
  g.tri(a,ridgeA,e,m,.85);g.tri(b,c,ridgeB,m,.94);
  g.beam(ridgeA,ridgeB,.1,MATERIAL.path,.85);
}
function boundary(g:Sculpture) {
  // Closed entry: the Adventure remains a visual preview, not gameplay.
  for(const dx of [-.9,.9])g.ring([5.1+dx,.35,-1.15],.08,.06,.65,MATERIAL.wood,6);
  g.beam([4.2,.9,-1.15],[5.1,.78,-1.15],.045,MATERIAL.wood);
  g.beam([5.1,.78,-1.15],[6,.9,-1.15],.045,MATERIAL.wood);
}
function nyc(g:Sculpture) {
  const x=-5.3,z=-2.8;
  g.box([x,3.05,z],[3.25,5.5,2.7],MATERIAL.stone);
  for(const y of [.55,2.3,4.1,5.85])g.box([x,y,z],[3.55,.18,2.95],MATERIAL.path,0,.88);
  windows(g,x,z+1.4,3.2,3,1.65);
  g.box([x,.95,z+1.5],[.75,1.45,.08],MATERIAL.ink);
  g.box([x,1,z+1.56],[.42,1.15,.04],MATERIAL.lamp);
  for(let i=0;i<4;i++)g.box([x,.32+i*.12,z+2.6-i*.23],[1.2,.18,.35],MATERIAL.stone);
  // Fire escape landings, railings and alternating flights.
  for(let i=0;i<3;i++) {
    const y=1.95+i*1.65;
    g.box([x+.85,y,z+1.85],[1.75,.1,.85],MATERIAL.ink);
    g.beam([x+.05,y+.6,z+2.22],[x+1.65,y+.6,z+2.22],.045,MATERIAL.ink);
    for(const dx of [.05,.6,1.1,1.65])g.beam([x+dx,y,z+2.22],[x+dx,y+.6,z+2.22],.035,MATERIAL.ink);
    if(i<2)g.beam([x+(i%2?.1:1.6),y,z+2],[x+(i%2?1.6:.1),y+1.65,z+2],.18,MATERIAL.ink);
  }
  for(const dx of [-.65,.65])g.beam([x+dx,5.95,z],[x+dx,6.6,z],.1,MATERIAL.ink);
  g.ring([x,6.5,z],.9,.9,1.25,MATERIAL.wood,12);
  g.ring([x,7.75,z],1.04,.05,.5,MATERIAL.ink,12);
  for(const y of [6.75,7.45])g.ring([x,y,z],.93,.93,.06,MATERIAL.ink,12);
  g.box([x+1.15,6.3,z-.7],[.5,1.1,.5],MATERIAL.stone);
  // A small rear skyline, intentionally subordinate to the two destinations.
  for(const [bx,bz,w,h] of [[-1.3,-6.3,1.1,4.1],[.2,-6.7,1.25,5.3],[1.65,-6.4,.95,3.2]]) {
    g.box([bx,h/2+.3,bz],[w,h,1.1],MATERIAL.ink,0,1.3);
    g.box([bx,h+.5,bz],[w*.63,.4,.8],MATERIAL.stone);
    for(let j=0;j<3;j++)g.box([bx,1.5+j,bz+.57],[w*.6,.24,.03],MATERIAL.lamp,0,.5);
  }
  g.beam([.2,5.8,-6.7],[.2,6.7,-6.7],.05,MATERIAL.ink);
  // Green iron subway-style gateway, using no transit logos or route marks.
  for(const dx of [-1.5,1.5]) {
    g.ring([5.1+dx,.3,-2.7],.28,.18,3.4,MATERIAL.copper,8);
    g.crown([5.1+dx,3.95,-2.7],[.36,.36,.36],MATERIAL.lamp);
  }
  arch(g,5.1,3.15,-2.7,1.5,.3,0,Math.PI,MATERIAL.copper);
  g.box([5.1,3.8,-2.42],[1.7,.65,.1],MATERIAL.ink);
  g.box([5.1,3.8,-2.35],[1.1,.12,.03],MATERIAL.lamp);
  for(let i=0;i<4;i++)g.box([5.1,.37+i*.06,-3.5-i*.3],[2.2,.16,.35],MATERIAL.stone);
  for(const side of [-1,1])for(let i=0;i<4;i++)g.beam([5.1+side*1.4,.3,-3.1-i*.42],[5.1+side*1.4,1.2,-3.1-i*.42],.05,MATERIAL.ink);
  boundary(g);
}
function tokyo(g:Sculpture) {
  const x=-5.3,z=-2.8;
  g.box([x,2.6,z],[3,4.55,2.7],MATERIAL.stone);
  g.box([x+.25,5.45,z-.1],[2.45,1.2,2.25],MATERIAL.wood);
  windows(g,x,z+1.4,2.9,2,1.8);
  for(const y of [.6,2.6,4.8,6.1])roof(g,x,y,z,3.6,3.1,MATERIAL.ink);
  for(let i=0;i<7;i++)g.beam([x-1.3+i*.43,.6,z+1.55],[x-1.3+i*.43,2.25,z+1.55],.055,MATERIAL.wood);
  g.box([x+.9,3.6,z+1.58],[.48,1.25,.1],MATERIAL.lamp);
  g.beam([x+.7,7.2,z],[x+.7,8,z],.04,MATERIAL.ink);
  g.beam([x+.2,7.7,z],[x+1.2,7.7,z],.04,MATERIAL.ink);
  // Dense backstreet silhouettes, balconies, a cabinet and overhead cables.
  for(const [bx,h] of [[-1.1,3.1],[.65,4],[2.2,2.8]]) {
    g.box([bx,h/2+.3,-6.3],[1.3,h,1.5],MATERIAL.stone,0,.87);
    g.box([bx,h+.35,-6.3],[1.4,.16,1.65],MATERIAL.ink);
    g.box([bx,1.6,-5.51],[.8,1.1,.08],MATERIAL.ink);
    g.box([bx,1.6,-5.45],[.56,.85,.02],MATERIAL.lamp,0,.65);
  }
  g.beam([-2,4,-5.1],[3.3,3.5,-5.1],.025,MATERIAL.ink);
  g.box([-2.55,1,-4.9],[.65,1.4,.5],MATERIAL.copper);
  g.box([-2.55,1.1,-4.63],[.45,.8,.03],MATERIAL.lamp);
  // Torii-inspired gate and paper lantern approach, without copied shrine art.
  for(const dx of [-1.5,1.5]) {
    g.ring([5.1+dx,.3,-2.7],.17,.14,3.9,MATERIAL.copper,10);
    g.ring([5.1+dx,.3,-2.7],.25,.23,.6,MATERIAL.ink,8);
  }
  g.box([5.1,3.65,-2.7],[4.1,.22,.36],MATERIAL.copper);
  g.box([5.1,4.35,-2.7],[4.7,.27,.55],MATERIAL.ink);
  for(const side of [-1,1])g.beam([5.1+side*2,4.35,-2.7],[5.1+side*2.55,4.55,-2.7],.22,MATERIAL.ink);
  g.box([5.1,3.95,-2.65],[.32,.6,.34],MATERIAL.copper);
  for(const dx of [-2.5,2.5]) {
    g.ring([5.1+dx,.3,-1.9],.3,.23,1.25,MATERIAL.stone,6);
    g.ring([5.1+dx,1.55,-1.9],.32,.32,.5,MATERIAL.lamp,8);
    roof(g,5.1+dx,2.08,-1.9,.9,.8,MATERIAL.ink);
  }
  for(const dx of [-.9,0,.9]) {
    g.beam([5.1+dx,3.4,-2.7],[5.1+dx,2.95,-2.7],.025,MATERIAL.ink);
    g.crown([5.1+dx,2.75,-2.7],[.18,.28,.18],MATERIAL.lamp);
  }
  boundary(g);
}
function bangkok(g:Sculpture) {
  const x=-5.3,z=-2.8;
  for(const dx of [-1.3,1.3])for(const dz of [-1,1])g.beam([x+dx,.3,z+dz],[x+dx,1.35,z+dz],.18,MATERIAL.wood);
  g.box([x,2.5,z],[3,2.5,2.6],MATERIAL.wood);
  windows(g,x,z+1.35,2.9,2,1.35);
  g.box([x,1.3,z+1.65],[3.7,.17,1.1],MATERIAL.wood);
  for(let i=0;i<8;i++)g.beam([x-1.6+i*.45,1.3,z+2.05],[x-1.6+i*.45,2.1,z+2.05],.045,MATERIAL.path);
  g.beam([x-1.6,2.1,z+2.05],[x+1.6,2.1,z+2.05],.06,MATERIAL.wood);
  roof(g,x,3.85,z,4.3,3.7,MATERIAL.copper);
  roof(g,x,4.8,z,3,2.7,MATERIAL.copper);
  g.beam([x,5.8,z],[x,6.5,z],.07,MATERIAL.copper);
  // Canal-side market shelters share the rear city envelope used in other scenes.
  for(const bx of [-1.6,.4,2.4]) {
    for(const dx of [-.7,.7])g.beam([bx+dx,.3,-5.6],[bx+dx,2.1,-5.6],.09,MATERIAL.wood);
    roof(g,bx,2.05,-5.8,1.85,1.8,bx<0?MATERIAL.copper:MATERIAL.leaf);
    g.box([bx,.95,-5.2],[1.4,.65,.6],MATERIAL.wood);
    for(const dx of [-.4,0,.4])g.crown([bx+dx,1.4,-5.1],[.18,.18,.18],MATERIAL.flower);
  }
  // An architectural garden pavilion, not an interactive sacred object.
  for(const dx of [-1.2,1.2])g.beam([5.1+dx,.3,-2.7],[5.1+dx,2.8,-2.7],.2,MATERIAL.stone);
  roof(g,5.1,2.7,-2.7,3.8,2.7,MATERIAL.copper);
  roof(g,5.1,3.65,-2.7,2.6,1.9,MATERIAL.copper);
  g.ring([5.1,4.6,-2.7],.27,.04,.8,MATERIAL.copper,8);
  for(let i=0;i<3;i++)g.box([5.1,.3+i*.14,-1.8+i*.3],[2.6-i*.3,.2,.4],MATERIAL.stone);
  g.box([5.1,.43,-3.9],[2.1,.12,1.8],MATERIAL.path);
  boundary(g);
}
function tree(g:Sculpture,x:number,z:number,s:number,phase:number) {
  const base:V3=[x,.28,z],fork:V3=[x+.1*s,1.6*s,z];
  g.beam(base,fork,.2*s,MATERIAL.wood);
  g.beam(fork,[x-.55*s,2.4*s,z+.1],.13*s,MATERIAL.wood);
  g.beam(fork,[x+.7*s,2.7*s,z],.12*s,MATERIAL.wood);
  g.crown([x-.4*s,2.55*s,z],[1.15*s,1.1*s,.9*s],MATERIAL.leaf,phase);
  g.crown([x+.5*s,3.05*s,z-.1],[.92*s,1*s,.8*s],MATERIAL.leaf,phase+2);
}
function lantern(g:Sculpture,x:number,z:number) {
  g.ring([x,.3,z],.22,.15,.16,MATERIAL.stone,8);
  g.beam([x,.4,z],[x,1.55,z],.07,MATERIAL.ink);
  g.box([x,1.65,z],[.27,.4,.27],MATERIAL.lamp);
  for(const dx of [-.17,.17])g.beam([x+dx,1.4,z],[x+dx,1.92,z],.035,MATERIAL.ink);
  g.ring([x,1.86,z],.28,.03,.25,MATERIAL.copper,4);
}
function palm(g:Sculpture,x:number,z:number,s:number) {
  const top:V3=[x+.35,3.7*s,z];
  g.beam([x,.3,z],top,.17,MATERIAL.wood);
  for(let i=0;i<7;i++) {
    const a=i/7*Math.PI*2,mid:V3=[top[0]+Math.cos(a)*s,top[1]+.3*s,z+Math.sin(a)*s];
    const tip:V3=[top[0]+Math.cos(a)*1.7*s,top[1]-.7*s,z+Math.sin(a)*1.7*s];
    const side:V3=[Math.sin(a)*.3*s,0,-Math.cos(a)*.3*s];
    g.tri(top,add(mid,side),tip,MATERIAL.leaf);g.tri(top,tip,sub(mid,side),MATERIAL.leaf,.85);
  }
}
function seasonal(g:Sculpture,variant:SceneVariant) {
  if(isSnow(variant)) {
    for(const [x,z,r] of [[-8.8,-3.8,1],[-9.5,-.4,.8],[1.3,-6.7,1.1],[8.8,-4.7,1],[7.7,4.7,.7]])
      g.crown([x,3.2*r,z],[1.1*r,.24,.8*r],MATERIAL.cloud,x);
    // Small snow banks keep the fork legible instead of whitening the entire scene.
    for(const [x,z,r] of [[-7,1,.8],[-3,4,.6],[3.5,3,.7],[7,-.3,.8]])g.crown([x,.34,z],[r,.13,r*.7],MATERIAL.cloud,x);
  }
  if(variant.season==='spring'||variant.season==='autumn') {
    for(let i=0;i<26;i++) {
      const x=-8+(i*3.17)%16,z=-4+(i*2.43)%10;
      g.box([x,.36,z],[.12,.025,.18],variant.season==='spring'?MATERIAL.flower:MATERIAL.leaf,i*.7);
    }
  }
  if(variant.season==='raining') {
    for(const [x,z,r] of [[-2.5,4,.55],[3.5,2,.4],[-6,.1,.45],[7.4,1,.6]])g.ring([x,.37,z],r,r,.015,MATERIAL.water,16);
    // Restrained rain marks and shelter details; no heavy particle simulation.
    for(let i=0;i<28;i++) {
      const x=-9+(i*4.73)%18,z=-6+(i*2.37)%12,y=1+(i*1.83)%4.5;
      g.beam([x,y,z],[x-.06,y-.28,z],.018,MATERIAL.water,1.2);
    }
    roof(g,-6.9,1.8,4.4,2.2,1.7,MATERIAL.copper);
    for(const dx of [-1,1])g.beam([-6.9+dx,.3,4.4],[-6.9+dx,1.8,4.4],.055,MATERIAL.wood);
  }
  if(variant.city==='bangkok') {
    // A canal edge and low timber bridge complement the common pond.
    g.box([-8.2,.35,1.1],[1.8,.06,5.8],MATERIAL.water);
    for(let i=0;i<7;i++)g.box([-8.2,.55,1.5-i*.14],[2.2,.12,.1],MATERIAL.wood);
    if(variant.season==='winter')for(const x of [-1.6,.4,2.4])g.crown([x,1.85,-4.9],[.17,.26,.17],MATERIAL.lamp);
  }
}
function garden(g:Sculpture,variant:SceneVariant) {
  // Composed groves frame the paths, rather than randomly populating the island.
  for(const [x,z,s,p] of [[-8.8,-3.8,1,0],[-9.5,-.4,.82,2],[-2,-5.7,.85,1],[1.3,-6.7,1.1,3],[8.8,-4.7,1.03,4],[9.4,.1,.84,2],[7.7,4.7,.74,0],[-5.6,5.9,.7,2]]){
    if(variant.city==='bangkok' && (x< -8 || x>8))palm(g,x,z,s);
    else tree(g,x,z,s,p);
  }
  const clumps=[[-2.2,5.4],[-2.8,3.9],[2.1,4.5],[3.2,2.8],[-7.8,2.2],[8,1.7],[4.8,-5.3],[-7.3,-5.5],[-1,-6.8]];
  for(const [x,z] of clumps)for(let i=0;i<5;i++){
    const a=i/5*Math.PI*2,base:V3=[x,.3,z],tip:V3=[x+Math.cos(a)*.45,.7+Math.sin(i*3)*.1,z+Math.sin(a)*.45];
    const side:V3=[Math.sin(a)*.13,0,-Math.cos(a)*.13];
    g.tri(sub(base,side),tip,add(base,side),MATERIAL.leaf,.82);
  }
  for(const [x,z] of [[-3.8,6.2],[-4.2,6.6],[-4.5,5.9],[7.1,2.1],[7.5,2.3],[7.3,2.7]]){
    g.beam([x,.3,z],[x,.65,z],.025,MATERIAL.leaf);
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2,p:V3=[x+Math.cos(a)*.19,.67,z+Math.sin(a)*.19];g.tri([x-.06,.67,z],p,[x+.06,.67,z],MATERIAL.flower);g.tri([x,.67,z-.06],p,[x,.67,z+.06],MATERIAL.flower);}
  }
  for(const [x,z] of [[-1.3,5.6],[1.4,3.4],[-3.1,-.2],[3.2,-.5],[-5.3,.7],[5.8,.8]])lantern(g,x,z);
  // Quiet waterside seat and a reading plinth.
  for(const x of [-7.5,-6.3])g.box([x,.58,4.4],[.12,.6,.55],MATERIAL.ink);
  g.box([-6.9,.87,4.4],[1.6,.16,.65],MATERIAL.wood);
  g.box([-6.9,1.25,4.15],[1.6,.15,.18],MATERIAL.wood);
  g.box([-3.3,.8,-.9],[.7,1,.55],MATERIAL.stone,-.25);
  g.box([-3.3,1.34,-.9],[.85,.1,.7],MATERIAL.copper,-.25);
}
function water(g:Sculpture) {
  const x=-8.1,z=2.5,n=24;
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;
    const point=(angle:number,r:number):V3=>[x+Math.cos(angle)*r*1.65,.34,z+Math.sin(angle)*r];
    g.tri([x,.35,z],point(b,1),point(a,1),MATERIAL.water);
    g.quad(point(a,1.05),point(b,1.05),point(b,1.23),point(a,1.23),MATERIAL.path,.86);
  }
  g.quad([-9.4,.35,2.1],[-11.6,.35,2.1],[-11.6,.35,2.8],[-9.4,.35,2.8],MATERIAL.water);
  g.quad([-11.6,.35,2.1],[-11.6,-3.6,2.1],[-11.6,-3.6,2.8],[-11.6,.35,2.8],MATERIAL.water,.95);
  g.quad([-11.62,.35,2.2],[-11.62,-3.55,2.2],[-11.62,-3.55,2.35],[-11.62,.35,2.35],MATERIAL.cloud,.84);
}
export function makeWorld(variant:SceneVariant=DEFAULT_VARIANT) {
  const g=new Sculpture();island(g);
  path(g,[[0,.34,10.4],[0,.34,2.6],[-2.7,.34,.5],[-5.3,.34,-.8]]);
  path(g,[[0,.34,2.6],[2.6,.34,.5],[5.1,.34,-1.3]]);
  g.ring([0,.36,2.6],1,1,.08,MATERIAL.stone,16);
  g.ring([0,.45,2.6],.24,.24,.03,MATERIAL.copper,8);
  g.ring([0,.29,8.6],2.2,2.2,.1,MATERIAL.path,24,.86);
  // Two quiet, open-front pet clearings; architecture and established grove positions stay put.
  for(const x of [-5.5,5.2])g.ring([x,.29,8.2],1.4,1.4,.06,MATERIAL.grass,20,1.06);
  g.ring([6.7,.34,9],.28,.34,.16,MATERIAL.copper,12);
  g.ring([6.7,.51,9],.26,.26,.015,MATERIAL.water,12);
  ({nyc,tokyo,bangkok})[variant.city](g);garden(g,variant);water(g);seasonal(g,variant);
  // Distant sculpted clouds frame, but do not compete with, the two landmarks.
  for(const [x,y,z,s] of [[-15,3,-8,1.5],[16,6,-13,1.8],[-10,-4,9,1]]){
    g.crown([x,y,z],[2.6*s,.5*s,.85*s],MATERIAL.cloud,x);
    g.crown([x-.6*s,y+.4*s,z],[1.3*s,.6*s,.8*s],MATERIAL.cloud,z);
  }
  return new Float32Array(g.values);
}
export const LANDMARKS = {portfolio:[-5.3,10.6,-2.8] as V3,world:[5.1,6.3,-2.7] as V3};

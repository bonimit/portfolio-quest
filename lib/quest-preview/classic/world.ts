import {add,sub,scale,cross,normalize,type V3} from '../math.ts';
/** Batched flat-shaded geometry: position, face normal, material index, tonal variation. */
export const MATERIAL = {rock:0,grass:1,path:2,stone:3,copper:4,wood:5,leaf:6,water:7,ink:8,lamp:9,cloud:10,flower:11} as const;
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
    return [Math.cos(a)*12*r*shrink+(.3-y)*.06,y,Math.sin(a)*9.2*r*shrink];
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
    g.tri(low,lowNext,[.8,-8.3,-.4],MATERIAL.rock,.65);
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
function observatory(g:Sculpture) {
  const x=-5.3,z=-2.8;
  for(let i=0;i<3;i++)g.ring([x,.25+i*.18,z],2.15-i*.2,2.15-i*.2,.18,MATERIAL.stone,12,.9+i*.035);
  g.ring([x,.79,z],1.55,1.3,4.65,MATERIAL.stone,10,1,Math.PI/10);
  for(const y of [1.15,3.6,5.25])g.ring([x,y,z],1.57,1.57,.16,MATERIAL.path,10,.9);
  g.ring([x,5.4,z],1.85,1.85,.23,MATERIAL.copper,12);
  g.ring([x,5.63,z],1.32,1.32,1.1,MATERIAL.ink,10,.82);
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2;g.beam([x+Math.cos(a)*1.4,5.58,z+Math.sin(a)*1.4],[x+Math.cos(a)*1.4,6.85,z+Math.sin(a)*1.4],.14,MATERIAL.stone);
    const b=(i+1)/10*Math.PI*2;
    g.beam([x+Math.cos(a)*1.8,5.8,z+Math.sin(a)*1.8],[x+Math.cos(b)*1.8,5.8,z+Math.sin(b)*1.8],.07,MATERIAL.copper);
  }
  g.ring([x,6.85,z],2,1.62,.36,MATERIAL.copper,12);
  g.ring([x,7.21,z],1.65,.1,1.65,MATERIAL.copper,12);
  // Roof ribs, a slender finial and a split swallowtail.
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;g.beam([x+Math.cos(a)*1.65,7.25,z+Math.sin(a)*1.65],[x,8.88,z],.045,MATERIAL.path,.87);}
  g.beam([x,8.8,z],[x,9.7,z],.065,MATERIAL.copper);
  g.quad([x,9.68,z],[x+.95,9.58,z],[x+.6,9.35,z],[x,9.35,z],MATERIAL.copper);
  // Recessed arched entry and window frames.
  g.box([x,1.55,z+1.45],[.9,1.5,.12],MATERIAL.ink);
  arch(g,x,2.3,z+1.5,.46,.2);
  for(const dx of [-.66,.66])g.box([x+dx,1.52,z+1.5],[.22,1.55,.48],MATERIAL.stone);
  g.box([x,1.6,z+1.53],[.52,1.25,.03],MATERIAL.lamp);
  for(const [dx,y] of [[-.65,4.25],[.65,4.25]]){
    g.box([x+dx,y,z+1.34],[.42,.68,.12],MATERIAL.ink);
    g.box([x+dx,y,z+1.42],[.22,.48,.04],MATERIAL.lamp,.0,.75);
    g.box([x+dx,y-.38,z+1.42],[.55,.1,.25],MATERIAL.path);
  }
  for(let i=0;i<4;i++)g.box([x,.3+i*.12,z+2.8-i*.38],[1.45,.2,.5],MATERIAL.stone,0,.92);
}
function ruins(g:Sculpture) {
  const x=5.1,z=-2.7;
  g.ring([x,.25,z],2.65,2.65,.18,MATERIAL.path,12,.8);
  for(const [dx,h] of [[-1.25,2.7],[1.25,2.9]]){
    g.box([x+dx,.48,z],[.95,.2,1.05],MATERIAL.stone);
    for(let i=0;i<5;i++)g.box([x+dx,.7+i*.48,z],[.65-i*.025,.44,.73],MATERIAL.stone,(i%2?.015:-.015),.93+(i%3)*.04);
    g.box([x+dx,h+.2,z],[.95,.22,1],MATERIAL.path);
  }
  arch(g,x,2.9,z,1.25,.57,0,Math.PI*.82);
  // Missing voussoirs, a leaning relic and dry-stone enclosure.
  g.box([x-2.2,.48,z+1.7],[.8,.5,.65],MATERIAL.stone,-.45);
  g.box([x-1.45,.4,z+2.05],[.6,.25,.7],MATERIAL.path,.3);
  g.beam([x+2.5,.4,z-1.3],[x+2.1,4.9,z-1.5],.65,MATERIAL.stone);
  g.box([x+2.1,4.9,z-1.5],[.8,.25,.85],MATERIAL.path,-.1);
  for(let i=0;i<8;i++){
    const a=.2+i/7*2.7;
    g.box([x+Math.cos(a)*3.1,.5,z-1.1-Math.sin(a)*1.2],[.7,.44,.6],MATERIAL.stone,a,.84);
  }
  g.ring([x,.48,z+.1],.55,.46,.4,MATERIAL.stone,6);
  const a:V3=[x,.95,z+.1],b:V3=[x,2.3,z+.1];
  const p:V3[]=[[x+.4,1.6,z+.1],[x,1.6,z+.5],[x-.4,1.6,z+.1],[x,1.6,z-.3]];
  for(let i=0;i<4;i++){g.tri(b,p[(i+1)%4],p[i],MATERIAL.copper);g.tri(a,p[i],p[(i+1)%4],MATERIAL.path);}
  for(const [dx,y,dz] of [[1.3,1.3,.43],[1.15,2.2,.43],[.8,3.5,.45],[-1.4,.7,.5]])g.crown([x+dx,y,z+dz],[.32,.4,.12],MATERIAL.leaf,dx);
  // A low, closed rope is an environmental cue: the ruins are a preview.
  for(const dx of [-.9,.9])g.ring([x+dx,.35,z+1.2],.07,.05,.6,MATERIAL.wood,6);
  g.beam([x-.9,.83,z+1.2],[x,.72,z+1.2],.045,MATERIAL.wood);g.beam([x,.72,z+1.2],[x+.9,.83,z+1.2],.045,MATERIAL.wood);
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
function garden(g:Sculpture) {
  // Composed groves frame the paths, rather than randomly populating the island.
  for(const [x,z,s,p] of [[-8.8,-3.8,1,0],[-9.5,-.4,.82,2],[-2,-5.7,.85,1],[1.3,-6.7,1.1,3],[8.8,-4.7,1.03,4],[9.4,.1,.84,2],[7.7,4.7,.74,0],[-5.6,5.9,.7,2]])tree(g,x,z,s,p);
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
export function makeWorld() {
  const g=new Sculpture();island(g);
  path(g,[[0,.34,7.7],[0,.34,2.6],[-2.7,.34,.5],[-5.3,.34,-.8]]);
  path(g,[[0,.34,2.6],[2.6,.34,.5],[5.1,.34,-1.3]]);
  g.ring([0,.36,2.6],1,1,.08,MATERIAL.stone,16);
  g.ring([0,.45,2.6],.24,.24,.03,MATERIAL.copper,8);
  g.ring([0,.29,6.8],2.65,2.65,.1,MATERIAL.path,24,.86);
  observatory(g);ruins(g);garden(g);water(g);
  // Distant sculpted clouds frame, but do not compete with, the two landmarks.
  for(const [x,y,z,s] of [[-15,3,-8,1.5],[16,6,-13,1.8],[-10,-4,9,1]]){
    g.crown([x,y,z],[2.6*s,.5*s,.85*s],MATERIAL.cloud,x);
    g.crown([x-.6*s,y+.4*s,z],[1.3*s,.6*s,.8*s],MATERIAL.cloud,z);
  }
  return new Float32Array(g.values);
}
export const LANDMARKS = {portfolio:[-5.3,10.6,-2.8] as V3,world:[5.1,6.3,-2.7] as V3};

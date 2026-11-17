import {Sculpture,MATERIAL as m} from './restored/world.ts';
import type {V3} from './math.ts';
export type Point2=readonly [number,number];
/** Smooth open interpolation, also used for long shorelines rather than polygon corners. */
export function shorelinePoint(points:readonly Point2[],t:number):Point2{
 const u=Math.max(0,Math.min(1,t))*(points.length-1),i=Math.min(points.length-2,Math.floor(u)),f=u-i;
 const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];
 return [0,1].map(j=>.5*(2*b[j]+(-a[j]+c[j])*f+(2*a[j]-5*b[j]+4*c[j]-d[j])*f*f+(-a[j]+3*b[j]-3*c[j]+d[j])*f*f*f)) as [number,number];
}
export function kyotoCanalPoint(t:number){return {x:-8.3-3*Math.sin(t*Math.PI)+.35*Math.sin(t*Math.PI*2),z:-8.5+14*t,width:.25+.6*Math.pow(Math.sin(t*Math.PI),.6)};}
export function kyotoCanalEdge(t:number,side:number,y:number):V3{
 const p=kyotoCanalPoint(t),a=kyotoCanalPoint(Math.max(0,t-.001)),b=kyotoCanalPoint(Math.min(1,t+.001)),dx=b.x-a.x,dz=b.z-a.z,n=Math.hypot(dx,dz);return [p.x+dz/n*p.width*side,y,p.z-dx/n*p.width*side];
}
export function kyotoBridgePoint(t:number,f:number):V3{return kyotoCanalEdge(t,(f-.5)*2.9,.49+Math.sin(f*Math.PI)*.25);}
export function makeKyotoCanal(){
 const g=new Sculpture(),steps=96,point=kyotoCanalEdge;
 for(let i=0;i<steps;i++){
  const a=i/steps,b=(i+1)/steps;
  g.quad(point(a,-1,.36),point(b,-1,.36),point(b,1,.36),point(a,1,.36),m.water);
  for(const side of [-1,1]){g.quad(point(a,side,.41),point(b,side,.41),point(b,side*1.18,.41),point(a,side*1.18,.41),m.stone);}
 }
 for(const t of [.24,.72]){
  const p=kyotoCanalPoint(t);
  for(let i=0;i<18;i++){const f=i/17,a=point(t,(f-.5)*2.9,.44+Math.sin(f*Math.PI)*.25);g.box(a,[.15,.1,1],m.wood);}
  for(const side of [-1,1])for(let i=0;i<9;i++){const f=i/8,a=point(t,(f-.5)*2.9,.6+Math.sin(f*Math.PI)*.25);g.beam([a[0],a[1],a[2]+side*.47],[a[0],a[1]+.45,a[2]+side*.47],.04,m.wood);}
  g.crown([p.x,.42,p.z],[.11,.015,.07],m.flower);
 }
 for(let i=0;i<12;i++){
  const t=.06+i*.075,p=point(t,i%2?1.65:-1.65,.3),h=1.2+(i%3)*.2;
  if(Math.abs(t-.24)<.085||Math.abs(t-.72)<.085)g.crown([p[0],.5,p[2]],[.28,.17,.25],m.flower,i);
  else {g.beam(p,[p[0],h,p[2]],.06,m.wood);for(const dx of [-.25,.25])g.crown([p[0]+dx,h+.2,p[2]],[.4,.4,.38],m.flower,i);}
  const water=kyotoCanalPoint(t);g.crown([water.x+.12,.38,water.z],[.1,.018,.07],m.flower,i);
 }
 return new Float32Array(g.values);
}

import {Sculpture,MATERIAL as m} from './restored/world.ts';
import type {SceneVariant} from './variants.ts';
import type {V3} from './math.ts';
export type PavilionKind='urban'|'conservatory'|'poster'|'folded'|'snow-pod'|'sail'|'workshop'|'sculpture';
export function conceptPavilionKind(v:SceneVariant):PavilionKind{
 if(v.place==='centralpark'||v.place==='rockefeller')return 'conservatory';
 if(v.place==='coney')return 'poster';
 if(v.place==='hokkaido')return 'snow-pod';
 if(v.place==='okinawa'||v.place==='krabi')return 'sail';
 if(v.place==='inthanon')return 'sculpture';
 return v.city==='nyc'?'urban':v.city==='bangkok'?'workshop':'folded';
}
/** Purpose-built exhibition pavilions; no Portfolio facade is copied or scaled. */
export function makeConceptPavilion(v:SceneVariant){
 const g=new Sculpture(),x=-7.8,z=-.55,kind=conceptPavilionKind(v),snow=v.season==='winter'&&v.city!=='bangkok';
 g.box([x,.4,z],[2.95,.2,2.5],kind==='urban'||kind==='conservatory'?m.stone:m.wood);
 g.box([x,.32,1.0],[1.12,.12,.65],m.path);
 const post=(dx:number,dz:number,h=2.4)=>g.beam([x+dx,.5,z+dz],[x+dx,h,z+dz],.075,kind==='urban'||kind==='conservatory'?m.metal:m.wood);
 if(kind==='conservatory'||kind==='snow-pod'){
  for(const dx of [-1.4,1.4])for(const dz of [-1.15,1.15])post(dx,dz,2.12);
  const point=(a:number,dz:number):V3=>[x+Math.cos(a)*1.55,2.05+Math.sin(a)*.98,z+dz];
  for(let i=0;i<16;i++){const a=i/16*Math.PI,b=(i+1)/16*Math.PI;g.quad(point(a,-1.3),point(b,-1.3),point(b,1.3),point(a,1.3),m.glass);}
  for(const dz of [-1.3,-.65,0,.65,1.3])for(let i=0;i<16;i++)g.beam(point(i/16*Math.PI,dz),point((i+1)/16*Math.PI,dz),.045,snow?m.snow:m.evergreen);
  for(const side of [-1,1])g.box([x+side*1.42,1.2,z],[.06,1.4,2.25],m.glass);
 }else if(kind==='folded'){
  for(const dx of [-1.35,1.35])for(const dz of [-1.15,1.15])post(dx,dz,dx<0?2.75:2.95);
  const a:V3=[x-1.65,2.87,z-1.4],b:V3=[x-1.65,2.87,z+1.4],c:V3=[x,2.55,z+1.4],d:V3=[x,2.55,z-1.4],e:V3=[x+1.65,3.08,z-1.4],f:V3=[x+1.65,3.08,z+1.4];
  g.quad(a,b,c,d,snow?m.snow:m.plaster);g.quad(d,c,f,e,snow?m.snow:m.path);
  for(const [p,q]of [[a,b],[b,c],[c,f],[e,f],[a,d],[d,e]] as [V3,V3][])g.beam(p,q,.055,m.wood);
  // A low exhibition screen behind the open, shaded front.
  g.box([x,1.25,z-1.05],[2.65,1.45,.08],m.plaster);
  for(let i=0;i<11;i++)g.box([x-1.22+i*.244,1.25,z-1.11],[.03,1.45,.03],m.wood);
 }else if(kind==='sail'||kind==='poster'){
  const a:V3=[x-1.65,2.55,z+1.35],b:V3=[x+1.65,2.7,z+1.35],c:V3=[x+.45,3.12,z-1.4];
  for(const p of [a,b,c])g.beam([p[0],.5,p[2]],p,.075,m.wood);
  g.tri(a,c,b,m.plaster);g.tri([x,2.8,z+.25],c,b,kind==='poster'?m.copper:m.path);
  for(const [p,q]of [[a,b],[a,c],[b,c]] as [V3,V3][])g.beam(p,q,.025,m.path);
  if(kind==='poster')g.box([x,1.3,z-1.1],[2.45,1.6,.1],m.copper);
 }else if(kind==='workshop'){
  for(const dx of [-1.35,1.35])for(const dz of [-1.1,1.1])post(dx,dz,2.7);
  for(let i=0;i<12;i++)g.box([x-1.58+i*.287,2.72,z],[.24,.12,2.9],i%3===0?m.plaster:m.path);
  for(const dz of [-1.35,1.35])g.beam([x-1.65,2.7,z+dz],[x+1.65,2.7,z+dz],.08,m.wood);
  for(const dx of [-.95,0,.95])g.box([x+dx,1.4,z-1.05],[.82,1.7,.06],dx===0?m.plaster:m.path,dx*.28);
 }else if(kind==='sculpture'){
  g.ring([x,2.55,z],1.7,1.45,.18,m.plaster,8);g.ring([x,2.73,z],1.45,.65,.25,m.glass,8);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;if(Math.sin(a)>.6)continue;g.beam([x+Math.cos(a)*1.35,.5,z+Math.sin(a)*1.15],[x+Math.cos(a)*1.35,2.55,z+Math.sin(a)*1.15],.09,m.stone);}
  g.box([x+.9,.86,z-.25],[.48,.72,.48],m.stone);g.ring([x+.9,1.22,z-.25],.22,.06,.62,m.copper,5);
 }else{
  for(const dx of [-1.35,1.35])for(const dz of [-1.1,1.1])post(dx,dz,2.55);
  g.box([x-.15,2.65,z],[3.35,.15,2.9],snow?m.snow:m.plaster);
  g.box([x-.15,2.78,z-.1],[1.9,.1,.85],m.glass);
  g.box([x-1.35,1.5,z-.15],[.12,2,2.1],m.plaster);
  g.box([x+.72,1.5,z-1.08],[1.2,2,.1],m.plaster);
 }
 // Large original prints, easels and sculpture plinths make the art destination legible.
 for(const [dx,dz,angle]of [[-.85,-.48,-.12],[.82,-.45,.13]]){
  const px=x+dx,pz=z+dz;
  g.beam([px-.26,.5,pz+.12],[px,2.05,pz],.035,m.wood);g.beam([px+.26,.5,pz+.12],[px,2.05,pz],.035,m.wood);
  g.box([px,1.47,pz+.05],[.63,.94,.07],m.ink,angle);g.box([px,1.47,pz+.11],[.53,.83,.035],m.plaster,angle);
  g.crown([px-.08,1.6,pz+.145],[.17,.17,.025],dx<0?m.copper:m.flower);
  g.box([px+.09,1.28,pz+.15],[.18,.27,.025],dx<0?m.glass:m.copper,angle);
 }
 g.box([x,.7,z-.72],[.38,.4,.38],m.stone);g.crown([x,1.08,z-.72],[.17,.22,.17],m.copper);
 // Every pavilion has an attached textile that moves naturally on hover.
 g.beam([x-1.3,2.31,.84],[x+1.3,2.31,.84],.05,m.wood);
 const cloth=new Sculpture();for(const dx of [-.23,.23])cloth.box([x+dx,2.08,.84],[.39,.46,.035],m.copper);
 return {kind,base:new Float32Array(g.values),curtains:new Float32Array(cloth.values),bounds:{min:[x-1.7,.26,z-1.42] as V3,max:[x+1.7,3.16,1.14] as V3}};
}

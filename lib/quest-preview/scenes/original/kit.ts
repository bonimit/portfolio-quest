import {originalIsland} from '../../original-island.ts';
import type {Sculpture,Material} from '../../world.ts';
import type {V3} from '../../math.ts';
/** Scene elements keep their layout; the owner-restored original island supplies the base. */
export function ground(g:Sculpture,outline:readonly (readonly[number,number])[],top:Material,side:Material,depth=1,topY=.25){
 if(topY===.25&&depth>0&&Math.max(...outline.map(p=>p[0]))-Math.min(...outline.map(p=>p[0]))>20&&Math.max(...outline.map(p=>p[1]))-Math.min(...outline.map(p=>p[1]))>15){originalIsland(g,top);return;}
 for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length];
  g.tri([0,topY,0],[b[0],topY,b[1]],[a[0],topY,a[1]],top);
  g.quad([a[0],topY,a[1]],[b[0],topY,b[1]],[b[0]*.96,-depth,b[1]*.96],[a[0]*.96,-depth,a[1]*.96],side,.85+(i%3)*.05);
  g.tri([0,-depth,0],[a[0]*.96,-depth,a[1]*.96],[b[0]*.96,-depth,b[1]*.96],side,.7);
 }
}
export function roof(g:Sculpture,x:number,y:number,z:number,w:number,d:number,m:Material,rise=1){
 g.box([x,y,z],[w,.16,d],8);
 const a:V3=[x-w/2,y+.1,z-d/2],b:V3=[x+w/2,y+.1,z-d/2],c:V3=[x+w/2,y+.1,z+d/2],e:V3=[x-w/2,y+.1,z+d/2];
 const l:V3=[x-w*.26,y+rise,z],r:V3=[x+w*.26,y+rise,z];
 g.quad(a,b,r,l,m);g.quad(e,l,r,c,m);g.tri(a,l,e,m,.85);g.tri(b,c,r,m,.92);g.beam(l,r,.07,19);
}
export function windowPane(g:Sculpture,x:number,y:number,z:number,w=.7,h=1){
 g.box([x,y,z],[w+.12,h+.12,.09],8);g.box([x,y,z+.06],[w,h,.045],17);
 g.box([x,y,z+.09],[.04,h,.03],14);g.box([x,y,z+.09],[w,.04,.03],14);
}
export function door(g:Sculpture,x:number,z:number,h=2.1){
 g.box([x,.35+h/2,z],[1.15,h,.08],8);g.box([x,.35+h/2,z+.05],[.9,h-.2,.035],9);
 for(const dx of [-.62,.62])g.box([x+dx,.35+h/2,z+.1],[.12,h+.2,.15],14);
 g.box([x,.45+h,z+.1],[1.45,.12,.18],14);
}
export function route(g:Sculpture,points:readonly (readonly[number,number])[],material:Material,width=1.15,timber=false){
 for(let k=1;k<points.length;k++){
  const a=points[k-1],b=points[k],length=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=Math.atan2(b[0]-a[0],b[1]-a[1]),steps=Math.ceil(length/(timber?.32:.65));
  for(let i=0;i<steps;i++){
   const t=(i+.5)/steps;g.box([a[0]+(b[0]-a[0])*t,.32,a[1]+(b[1]-a[1])*t],[width,.1,length/steps*.92],material,angle,1+(i%3)*.025);
  }
 }
}
export function tree(g:Sculpture,x:number,z:number,size:number,kind:'bloom'|'maple'|'pine'|'palm'|'bare'|'green'){
 const y=.3;g.beam([x,y,z],[x+.1,2.5*size,z],.2*size,5);
 if(kind==='palm'){
  for(let i=0;i<8;i++){const a=i*Math.PI/4;g.tri([x,2.8*size,z],[x+Math.cos(a+.3)*1.8*size,2.25*size,z+Math.sin(a+.3)*1.8*size],[x+Math.cos(a-.3)*1.8*size,2.25*size,z+Math.sin(a-.3)*1.8*size],6);}return;
 }
 if(kind==='pine'){
  for(let i=0;i<3;i++)g.ring([x,1+i*.65*size,z],(1.15-i*.2)*size,.04,1.5*size,15,10);return;
 }
 for(const dx of [-1,1])g.beam([x,1.6*size,z],[x+dx*.8*size,2.6*size,z],.1*size,5);
 if(kind==='bare')return;
 for(const [dx,dy,dz]of [[-.55,2.4,0],[.45,2.9,-.1],[0,2.4,.5]])g.crown([x+dx*size,dy*size,z+dz*size],[.9*size,.85*size,.85*size],kind==='bloom'?11:6,x+dx);
 if(kind==='maple')for(let i=0;i<5;i++)g.crown([x+Math.sin(i*2)*.65,1.9*size+Math.cos(i)*.2,z+.6*size],[.15,.16,.14],11,i);
}
export function lamp(g:Sculpture,x:number,z:number,h=1.7){
 g.beam([x,.3,z],[x,h,z],.065,8);g.box([x,h,z],[.25,.35,.25],9);g.ring([x,h+.18,z],.28,.04,.25,4,4);
}
export function bench(g:Sculpture,x:number,z:number){
 for(const dx of [-.6,.6])g.box([x+dx,.55,z],[.12,.55,.5],8);
 g.box([x,.8,z],[1.6,.14,.6],5);g.box([x,1.13,z-.25],[1.6,.18,.12],5);
}
export function pond(g:Sculpture,x:number,z:number,w:number,d:number,material:Material=7){
 g.crown([x,.31,z],[w+.18,.08,d+.18],3);g.crown([x,.39,z],[w,.06,d],material);
}
export function fuji(g:Sculpture,x:number,z:number,h=7.5,w=4.5,winter=false){
 for(let i=0;i<32;i++){
  const a=i/32*Math.PI*2,b=(i+1)/32*Math.PI*2;
  const p=(t:number,r:number,y:number):V3=>[x+Math.cos(t)*r,y,z+Math.sin(t)*r*.55];
  g.quad(p(a,w,.3),p(a,w*.38,h*.68),p(b,w*.38,h*.68),p(b,w,.3),winter?18:0,1+(i%4)*.025);
  g.quad(p(a,w*.38,h*.68),p(a,.18,h),p(b,.18,h),p(b,w*.38,h*.68),18);
 }g.ring([x,h,z],.18,.18,.035,18,32);
}
export function flowers(g:Sculpture,x:number,z:number,w:number,d:number,color:Material=11){
 g.box([x,.35,z],[w,.13,d],15);
 for(let i=0;i<9;i++){
  const cx=x-w*.4+(i%3)*w*.4,cz=z-d*.35+Math.floor(i/3)*d*.35,y=.76+Math.sin(i)*.08;
  g.beam([cx,.4,cz],[cx,y,cz],.035,15);
  for(let petal=0;petal<5;petal++){
   const a=petal*Math.PI*2/5,px=cx+Math.cos(a)*.2,pz=cz+Math.sin(a)*.2;
   for(let j=0;j<6;j++){
    const t=j/6*Math.PI*2,u=(j+1)/6*Math.PI*2;
    g.tri([px,y,pz],[px+Math.cos(u)*.2,y, pz+Math.sin(u)*.16],[px+Math.cos(t)*.2,y,pz+Math.sin(t)*.16],color);
   }
  }
  g.box([cx,y+.015,cz],[.1,.035,.1],19);
 }
}

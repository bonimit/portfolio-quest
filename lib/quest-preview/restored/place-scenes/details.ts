import type {Sculpture,Material} from '../world.ts';
import type {V3} from '../math.ts';
/** Small shared construction details; each destination authors its own massing. */
export const m={rock:0,grass:1,path:2,stone:3,copper:4,wood:5,leaf:6,water:7,ink:8,lamp:9,flower:11,brick:12,metal:13,plaster:14,pine:15,red:16,glass:17,snow:18,gold:19} as const;
export class PlaceDetails {
 readonly g:Sculpture;
 constructor(g:Sculpture){this.g=g;}
 box(x:number,y:number,z:number,w:number,h:number,d:number,mat:Material,rotation=0,tone=1){this.g.box([x,y,z],[w,h,d],mat,rotation,tone);}
 beam(a:V3,b:V3,w:number,mat:Material){this.g.beam(a,b,w,mat);}
 door(x:number,z:number,y=.35,w=1.3,h=2.25){
  this.box(x,y+h/2,z,w+.24,h+.16,.18,m.ink);this.box(x,y+h/2,z+.1,w,h,.08,m.wood);
  this.box(x,y+h/2,z+.16,.045,h,.03,m.copper);this.box(x+.36,y+1,z+.2,.07,.12,.04,m.gold);
  for(const side of [-1,1])this.box(x+side*(w/2+.08),y+h/2,z+.12,.12,h+.12,.12,m.stone);
  this.box(x,y+h+.05,z+.13,w+.4,.12,.2,m.stone);
  for(const dx of [-w*.25,w*.25])for(const py of [.55,1.45])this.box(x+dx,y+py,z+.15,w*.3,.55,.025,m.wood,0,.8);
 }
 windows(x:number,z:number,w:number,floors:number,columns=3,start=1.5,step=1.25){
  for(let row=0;row<floors;row++)for(let col=0;col<columns;col++){
   const dx=x-w/2+(col+.5)*w/columns,y=start+row*step;
   this.box(dx,y,z,w/columns*.58,.78,.09,m.ink);this.box(dx,y,z+.055,w/columns*.45,.65,.04,m.glass);
   this.box(dx,y-.45,z+.06,w/columns*.7,.08,.2,m.stone);
   this.box(dx,y,z+.085,.035,.66,.025,m.plaster);this.box(dx,y,z+.09,w/columns*.45,.035,.025,m.plaster);
   this.box(dx,y+.43,z+.06,w/columns*.7,.08,.12,m.stone);
  }
 }
 roof(x:number,y:number,z:number,w:number,d:number,h:number,mat:Material,tiles=false){
  const a:V3=[x-w/2,y,z-d/2],b:V3=[x+w/2,y,z-d/2],c:V3=[x+w/2,y,z+d/2],e:V3=[x-w/2,y,z+d/2],l:V3=[x-w*.25,y+h,z],r:V3=[x+w*.25,y+h,z];
  this.g.tri(a,l,e,mat);this.g.quad(a,b,r,l,mat);this.g.tri(b,c,r,mat);this.g.quad(e,l,r,c,mat);
  this.box(x,y,z,w+.12,.12,d+.12,mat);this.beam(l,r,.13,mat);
  for(const side of [-1,1])this.beam([x-w/2,y-.09,z+side*d/2],[x+w/2,y-.09,z+side*d/2],.06,m.wood);
  if(tiles)for(let i=0;i<=Math.ceil(w/.35);i++){const dx=x-w/2+i*w/Math.ceil(w/.35);for(const side of [-1,1])this.beam([dx,y+.08,z+side*d/2],[x+(dx-x)*.5,y+h+.05,z],.045,m.plaster);}
 }
 tree(x:number,z:number,kind:'leaf'|'blossom'|'autumn'|'pine'|'palm',size=1){
  this.beam([x,.35,z],[x,2.8*size,z],.18*size,m.wood);
  if(kind==='pine'){for(let i=0;i<3;i++)this.g.ring([x,.8+i*.75*size,z],(1.1-i*.25)*size,0,1.7*size,m.pine,9);return;}
  if(kind==='palm'){
   for(let i=0;i<8;i++){const a=i*Math.PI/4;this.g.quad([x,3.2*size,z],[x+Math.cos(a-.22)*1.1*size,3.45*size,z+Math.sin(a-.22)*1.1*size],[x+Math.cos(a)*2*size,2.45*size,z+Math.sin(a)*2*size],[x+Math.cos(a+.22)*1.1*size,3.45*size,z+Math.sin(a+.22)*1.1*size],m.leaf);}
   return;
  }
  for(const [dx,dy,dz]of [[-.45,2.8,0],[.55,3.1,.1],[0,2.65,.5]])this.g.crown([x+dx*size,dy*size,z+dz*size],[.9*size,.85*size,.8*size],kind==='blossom'?m.flower:m.leaf,x+dx);
 }
 lamp(x:number,z:number,h=2.3){this.beam([x,.35,z],[x,h,z],.07,m.ink);this.box(x,h,z,.28,.35,.28,m.lamp);this.roof(x,h+.2,z,.5,.5,.2,m.ink);}
 bench(x:number,z:number,rotation=0){
  this.g.box([x,.85,z],[1.45,.12,.55],m.wood,rotation);this.g.box([x,1.2,z-.2],[1.45,.45,.1],m.wood,rotation);
  for(const dx of [-.55,.55])this.box(x+dx,.55,z,.08,.5,.45,m.ink);
 }
 boat(x:number,z:number,scale=1,longtail=false){
  this.g.crown([x,.55,z],[1.3*scale,.25*scale,.4*scale],m.wood,x);
  this.box(x,.8,z,1.5*scale,.08,.45*scale,m.path);
  for(const dx of [-.5,.1,.65])this.box(x+dx*scale,.85,z,.12*scale,.07,.62*scale,m.wood);
  for(const side of [-1,1])this.beam([x-.9*scale,.77,z+side*.29*scale],[x+.9*scale,.77,z+side*.29*scale],.035,m.path);
  if(longtail){this.beam([x-1,.65,z],[x-2.5,1,z],.06,m.ink);this.box(x-.4,1.45,z,1.6*scale,.1,.8*scale,m.red);for(const dx of [-1,.3])this.beam([x+dx,.8,z],[x+dx,1.4,z],.045,m.wood);}
  else this.beam([x-.3,.85,z-.8],[x+.3,.85,z+.8],.045,m.wood);
 }
 water(x:number,z:number,w:number,d:number){
  this.g.crown([x,.35,z],[w,.075,d],m.water,x);
  for(let i=0;i<5;i++)this.box(x-w*.55+i*w*.25,.435,z+Math.sin(i*2)*d*.55,w*.18,.015,.045,m.plaster,0,.8);
 }
 bridge(x:number,z:number,length:number,width:number,mat:Material,height=.6){
  let prev:V3|null=null;
  for(let i=0;i<=14;i++){
   const t=i/14,px=x+(t-.5)*length,py=.45+Math.sin(t*Math.PI)*height;
   this.box(px,py,z,length/14+.03,.13,width,mat);
   for(const side of [-1,1]){this.beam([px,py,z+side*width/2],[px,py+.7,z+side*width/2],.055,mat);if(prev)this.beam([prev[0],prev[1]+.7,z+side*width/2],[px,py+.7,z+side*width/2],.07,mat);}
   if(prev)for(const side of [-1,1])this.g.quad([prev[0],prev[1]-.06,z+side*width/2],[px,py-.06,z+side*width/2],[px,py-.28,z+side*width/2],[prev[0],prev[1]-.28,z+side*width/2],mat,.85);
   prev=[px,py,z];
  }
 }
 flowers(x:number,z:number,w:number,d:number,rows=3){for(let row=0;row<rows;row++)for(let i=0;i<8;i++){
  const px=x+(i/7-.5)*w,pz=z+(row/Math.max(1,rows-1)-.5)*d;
  this.beam([px,.4,pz],[px,.65,pz],.025,m.leaf);this.box(px,.7,pz,.16,.12,.16,m.flower,Math.PI/4);
 }}
}

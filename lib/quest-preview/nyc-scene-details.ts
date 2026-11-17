import {Sculpture,MATERIAL as m} from './restored/world.ts';
import {letters} from './culture-geometry.ts';
import type {SceneVariant} from './variants.ts';

/** Coordinates match the elevated deck after the original backdrop transform. */
export const HIGHLINE_DECK=Array.from({length:9},(_,i)=>({x:-9.7+i*2.35,y:2.55,z:-7.4+i*.16}));
export const ASTOR_PLACE={x:-10.5,z:.2,width:2.2,length:2.6,label:'ASTOR PLACE'} as const;
export function hasAstorPlace(v:SceneVariant){return v.city==='nyc'&&!v.place&&(v.season==='spring'||v.season==='autumn');}

function highLineGarden(g:Sculpture){
 for(const [i,{x,y,z}]of HIGHLINE_DECK.entries()){
  // Beds flank the existing centre walkway, retaining its exposed railway tracks.
  for(const side of [-1,1]){
   const pz=z+side*.76;
   g.box([x,y+.09,pz],[1.85,.2,.45],m.metal);
   g.box([x,y+.21,pz],[1.7,.06,.38],m.evergreen);
   for(let j=0;j<7;j++){
    const px=x-.72+j*.24,h=.23+(j%3)*.1;
    g.beam([px,y+.23,pz],[px+.06,y+.23+h,pz],.022,m.leaf);
    g.beam([px,y+.25,pz],[px-.09,y+.2+h,pz+.06],.018,m.gold);
    if(j%2===0)g.crown([px+.04,y+.26+h,pz],[.075,.08,.07],i%2?m.flower:m.gold);
   }
  }
  // Varied small trees sit on the rear side; the front edge offers many seats.
  const tx=x+(i%2?.3:-.25),tz=z-.76,height=1.35+(i%3)*.2;
  g.beam([tx,y+.22,tz],[tx,y+height,tz],.075,i%2?m.plaster:m.wood);
  for(let branch=0;branch<3;branch++){
   const dx=(branch-1)*.3,top=y+height+(branch%2)*.25;
   g.beam([tx,y+.8,tz],[tx+dx,top,tz+(branch%2)*.12],.035,m.wood);
   g.crown([tx+dx,top,tz+(branch%2)*.12],[.37,.45,.32],i%3===0?m.gold:i%3===1?m.copper:m.leaf);
  }
  if(i>0&&i<8){
   const bx=x,bz=z+.48;
   for(const dx of [-.45,.45])for(const dz of [-.1,.1])g.box([bx+dx,y+.18,bz+dz],[.055,.35,.055],m.ink);
   for(let slat=0;slat<3;slat++)g.box([bx,y+.37,bz-.12+slat*.12],[1.18,.055,.095],m.wood);
   for(const dx of [-.48,.48])g.beam([bx+dx,y+.3,bz+.17],[bx+dx,y+.74,bz+.23],.045,m.ink);
   for(let slat=0;slat<2;slat++)g.box([bx,y+.55+slat*.15,bz+.22],[1.18,.1,.055],m.wood);
  }
 }
}
function subway(g:Sculpture,v:SceneVariant){
 const {x,z,width,length}=ASTOR_PLACE;
 // A dark recessed mouth and narrowing descending treads imply an underground stair.
 g.box([x,.34,z],[width,.055,length],m.ink);
 for(let i=0;i<8;i++){
  const pz=z+length/2-.18-i*.3,y=.9-i*.075;
  g.box([x,y,pz],[width-.25,.1,.28],i<5?m.stone:m.ink,0,1-i*.055);
  if(i<5)g.box([x,y+.056,pz+.115],[width-.28,.018,.03],m.plaster);
 }
 for(const side of [-1,1]){
  const px=x+side*(width/2+.03);
  g.box([px,.52,z],[.16,.3,length+.15],m.stone);
  for(let i=0;i<5;i++)g.beam([px,.6,z-length/2+i*length/4],[px,1.4,z-length/2+i*length/4],.045,m.evergreen);
  g.beam([px,1.43,z-length/2],[px,1.43,z+length/2],.065,m.evergreen);
  const front=z+length/2+.1;
  g.beam([px,.4,front],[px,2.3,front],.095,m.evergreen);
  g.ring([px,2.28,front],.13,.13,.09,m.ink,10);
  g.crown([px,2.48,front],[.16,.18,.16],m.lamp);
  g.crown([px,2.39,front],[.17,.09,.17],m.evergreen);
 }
 const front=z+length/2+.13;
 g.box([x,2.04,front],[2.65,.44,.12],m.ink);
 letters(g,ASTOR_PLACE.label,x,2.04,front+.08,.24,m.plaster,v.light==='night'?3:1);
}
/** Add detail only to the current homepage scenes; comparison sources stay intact. */
export function makeNycSceneDetails(v:SceneVariant){
 const g=new Sculpture();
 if(v.city!=='nyc')return new Float32Array();
 if(v.place==='highline')highLineGarden(g);
 if(hasAstorPlace(v))subway(g,v);
 return new Float32Array(g.values);
}

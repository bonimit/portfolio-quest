import {Sculpture,MATERIAL as m} from './restored/world.ts';
import {BROADWAY_PROGRAM} from './broadway-shows.ts';
import {sign,letters,NEON} from './culture-geometry.ts';
/** Three theatre entrances share the approved door coordinates and walking routes. */
export function makeBroadwayEntrances(){
 const g=new Sculpture(),curtains=new Sculpture(),banner=new Sculpture(),motion:Record<string,Float32Array>={};
 const theatre=(path:'concepts'|'portfolio'|'world',x:number,front:number,w:number,h:number,style:'deco'|'brick'|'palace',show:string)=>{
  const text=new Sculpture(),lights=new Sculpture();
  const material=style==='brick'?m.brick:style==='deco'?m.ink:m.plaster,depth=2.65;
  g.box([x,.35+h/2,front-depth/2],[w,h,depth],material);
  for(const y of [.52,h+.35])g.box([x,y,front-depth/2],[w+.25,.18,depth+.15],m.metal);
  // Recessed glazed double doors under a projecting light-bulb canopy.
  g.box([x,1.3,front+.025],[1.4,1.9,.06],m.ink);
  for(const side of [-1,1]){g.box([x+side*.32,1.3,front+.065],[.56,1.7,.035],m.glass);g.box([x+side*.09,1.2,front+.1],[.035,.3,.025],m.gold);}
  g.box([x,2.52,front+.38],[w+.35,.25,1.05],m.ink);
  sign(g,show,x,2.8,front+.93,w-.12,.52,style==='deco'?m.glass:m.gold,text);
  for(let i=0;i<15;i++)lights.ring([x-w/2+i*w/14,2.36,front+.88],.045,.04,.08,m.lamp,8,4);
  for(const side of [-1,1]){
   g.box([x+side*(w/2-.25),1.55,front+.1],[.15,2.05,.22],m.metal);
   g.box([x+side*(w/2-.65),1.43,front+.14],[.55,.85,.04],m.ink);
   sign(g,side<0?'LIVE':'SHOW',x+side*(w/2-.65),1.45,front+.2,.48,.7,side<0?m.flower:m.glass);
  }
  if(style==='deco'){
   for(let i=0;i<3;i++)g.box([x,h+.5+i*.15,front-1.3],[w-.6*i,.15,2.7],m.metal);
   for(const side of [-1,1])lights.box([x+side*(w/2-.35),h-.25,front+.08],[.1,.8,.04],m.glass,0,NEON);
  }else if(style==='brick'){
   for(const y of [3.52,4.12])for(const dx of [-1.65,-.82,0,.82,1.65]){g.box([x+dx,y,front+.035],[.48,.42,.04],m.ink);lights.box([x+dx,y,front+.06],[.32,.28,.02],m.lamp,0,4);}
   g.box([x,h+.5,front-1.3],[w+.4,.18,2.9],m.metal);
  }else{
   for(const dx of [-1.65,-.85,0,.85,1.65])lights.box([x+dx,3.55,front+.06],[.14,.65,.12],m.gold,0,4);
   for(let i=0;i<3;i++)g.box([x,h+.4+i*.12,front-1.3],[w-.5*i,.12,2.8],m.metal);
  }
  motion[`neon-text-${path}`]=new Float32Array(text.values);motion[`neon-lights-${path}`]=new Float32Array(lights.values);
 };
 theatre('concepts',-7.8,.61,3.9,2.75,'deco',BROADWAY_PROGRAM.entrances[0]);
 theatre('portfolio',0,-.92,5.1,4.25,'brick',BROADWAY_PROGRAM.entrances[1]);
 theatre('world',7.8,-.4,4.8,3.8,'palace',BROADWAY_PROGRAM.entrances[2]);
 // Physical cloth and canopy details use the existing hover pivots.
 curtains.box([-7.8,2.0,.84],[1.25,.6,.025],m.vermilion);
 banner.beam([1.35,3.1,-.85],[2.05,3.1,-.85],.045,m.metal);banner.box([1.7,2.77,-.85],[.45,.66,.035],m.vermilion);
 letters(g,'BROADWAY',0,4.91,-1.1,.29,m.gold,NEON);
 return {motion,base:new Float32Array(g.values),curtains:new Float32Array(curtains.values),banner:new Float32Array(banner.values),bounds:{concepts:{min:[-9.9,.3,-2.1] as [number,number,number],max:[-5.7,3.6,1.6] as [number,number,number]},portfolio:{min:[-2.8,.3,-3.7] as [number,number,number],max:[2.8,5.1,.1] as [number,number,number]},world:{min:[5.2,.3,-3.2] as [number,number,number],max:[10.4,4.65,.6] as [number,number,number]}}};
}

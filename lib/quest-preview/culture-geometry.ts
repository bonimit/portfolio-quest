import {Sculpture,MATERIAL as m,type Material} from './restored/world.ts';
import type {V3} from './math.ts';
export type Limb={start:number;end:number;pivot:V3;axis:'x'|'z';amount:number;phase:number};
export const NEON=5;
const glyphs:Record<string,string[]>={
 A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],J:['001','001','001','101','010'],K:['101','101','110','101','101'],L:['100','100','100','100','111'],M:['101','111','111','101','101'],N:['101','111','111','111','101'],O:['010','101','101','101','010'],P:['110','101','110','100','100'],Q:['010','101','101','011','001'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],V:['101','101','101','101','010'],W:['101','101','111','111','101'],X:['101','101','010','101','101'],Y:['101','101','010','010','010'],Z:['111','001','010','100','111']
};
export function letters(g:Sculpture,text:string,x:number,y:number,z:number,h:number,color:Material=m.lamp,tone=NEON){
 const unit=h/5,width=(text.length*4-1)*unit;
 for(const [index,char] of [...text].entries())for(const [row,line]of (glyphs[char]??['000','000','000','000','000']).entries())for(let col=0;col<3;col++)if(line[col]==='1')g.box([x-width/2+(index*4+col+.5)*unit,y+(2-row)*unit,z],[unit*.8,unit*.8,.025],color,0,tone);
}
export function sign(g:Sculpture,text:string,x:number,y:number,z:number,w:number,h:number,color:Material=m.copper,textGeometry?:Sculpture){
 g.box([x,y,z],[w+.14,h+.14,.15],m.ink);g.box([x,y,z+.09],[w,h,.035],color,0,NEON);
 letters(textGeometry??g,text,x,y,z+.13,Math.min(h*.6,w/(text.length*4)*5*.86),m.ink,1);
}
export function person(g:Sculpture,shirt:Material,pose:'walk'|'stand'|'sit'|'surf'|'ski'|'throw'='walk'){
 const limbs:Limb[]=[],seated=pose==='sit',hip=seated?.35:.53,shoulder=seated?.67:.86,head=seated?.92:1.12;
 g.crown([.04,head,0],[.13,.15,.125],m.path);g.crown([.015,head+.075,-.01],[.135,.095,.13],m.ink);
 g.box([.165,head,0],[.035,.045,.055],m.ink);g.beam([0,hip,0],[0,shoulder,0],.26,shirt);
 for(const side of [-1,1]){
  const z=side*.09,start=g.values.length;
  if(seated){g.beam([0,hip,z],[.26,.27,z],.075,m.ink);g.beam([.26,.27,z],[.37,.1,z],.065,m.ink);}
  else{g.beam([0,hip,z],[pose==='ski'||pose==='surf'?.14:0,.27,z],.075,m.ink);g.beam([pose==='ski'||pose==='surf'?.14:0,.27,z],[.03,.04,z],.065,m.ink);}
  g.box([.07,.035,z],[.19,.065,.09],m.ink);
  if(pose==='walk')limbs.push({start,end:g.values.length,pivot:[0,hip,z],axis:'z',amount:.29,phase:side<0?0:Math.PI});
  const arm=g.values.length;g.beam([0,shoulder,z*1.6],[pose==='surf'?-.24:.15,pose==='surf'?.8:shoulder-.2,z*2.1],.055,m.path);
  if(pose==='walk'||pose==='throw'&&side>0)limbs.push({start:arm,end:g.values.length,pivot:[0,shoulder,z*1.6],axis:'z',amount:pose==='throw'?.8:.18,phase:side<0?Math.PI:0});
 }
 return limbs;
}
export function palm(g:Sculpture,x:number,y:number,z:number,scale=.6){
 g.beam([x,y,z],[x+.12*scale,y+1.7*scale,z],.09*scale,m.wood);
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2;g.tri([x,y+1.65*scale,z],[x+Math.cos(a-.25)*.65*scale,y+1.9*scale,z+Math.sin(a-.25)*.65*scale],[x+Math.cos(a)*1.2*scale,y+1.3*scale,z+Math.sin(a)*1.2*scale],m.leaf);}
}

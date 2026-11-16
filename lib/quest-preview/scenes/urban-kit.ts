import type {Sculpture,Material} from '../world.ts';
import {roof,windowPane,tree,flowers} from './kit.ts';
import type {Season} from '../variants.ts';
/** Small construction vocabulary; each city owns its street/terrain assembly. */
export function facade(g:Sculpture,x:number,z:number,w:number,d:number,floors:number,material:Material,style:'brick'|'shop'|'modern',snow=false){
 const h=floors*1.65;g.box([x,.35+h/2,z],[w,h,d],material);
 g.box([x,h+.45,z],[w+.2,.2,d+.2],snow?18:style==='brick'?3:8);
 for(let r=0;r<floors;r++){
  for(let col=0;col<3;col++)windowPane(g,x+(col-1)*w*.28,1.2+r*1.65,z+d/2+.035,w*.18,.82);
  if(style==='brick')g.box([x,.5+r*1.65,z+d/2+.1],[w,.12,.2],3);
  if(style==='shop'&&r>0){g.box([x,.65+r*1.65,z+d/2+.35],[w,.1,.7],3);g.beam([x-w/2,1.2+r*1.65,z+d/2+.65],[x+w/2,1.2+r*1.65,z+d/2+.65],.05,8);}
 }
 if(style==='shop')roof(g,x,2.1,z+d/2+.4,w+.35,1.2,snow?18:4,.22);
}
export function curb(g:Sculpture,x:number,z:number,w:number,d:number){g.box([x,.24,z],[w,.2,d],3);}
export function markings(g:Sculpture,x:number,z:number,horizontal=false,length=17){
 for(let i=0;i<Math.floor(length/1.4);i++){const p=i*1.4-length/2;g.box([x+(horizontal?p:0),.365,z+(horizontal?0:p)],[horizontal?.7:.09,.025,horizontal?.09:.7],14);}
}
export function zebra(g:Sculpture,x:number,z:number,w=3,d=2){for(let i=0;i<6;i++)g.box([x-w/2+i*w/6,.37,z],[w/10,.025,d],14);}
export function snowCap(g:Sculpture,x:number,z:number,w:number,d:number,y=.4){g.box([x,y,z],[w,.16,d],18);}
export function seasonalGarden(g:Sculpture,x:number,z:number,season:Season,scale=1){
 tree(g,x,z,scale,season==='winter'?'bare':season==='spring'?'bloom':season==='autumn'?'maple':'green');
 if(season==='spring')flowers(g,x,z+1.5,2.3,1.2);
 if(season==='autumn')for(let i=0;i<18;i++)g.tri([x+Math.sin(i*2.4)*1.8,.4,z+Math.cos(i*2.1)*1.4],[x+Math.sin(i*2.4)*1.8+.13,.4,z+Math.cos(i*2.1)*1.4],[x+Math.sin(i*2.4)*1.8,.4,z+Math.cos(i*2.1)*1.4+.18],11);
 if(season==='winter')g.crown([x,.38,z],[1.4,.16,1],18);
}
const LETTERS:Record<string,string[]>={M:['10101','11111','10101','10101','10101'],E:['111','100','110','100','111'],T:['111','010','010','010','010'],R:['110','101','110','101','101'],O:['111','101','101','101','111'],S:['111','100','111','001','111'],H:['101','101','111','101','101'],P:['110','101','110','100','100'],I:['111','010','010','010','111'],A:['010','101','111','101','101'],L:['100','100','100','100','111']};
/** Original pixel letter geometry, no third-party signage assets or textures. */
export function sign(g:Sculpture,text:string,x:number,y:number,z:number,width:number,bg:Material=8){
 const units=[...text].reduce((n,c)=>n+(LETTERS[c]?.[0].length??3)+1,0),s=width/units;
 g.box([x,y,z],[width+.25,s*6.4,.13],bg);let cursor=x-width/2;
 for(const c of text){const glyph=LETTERS[c];if(glyph)for(let r=0;r<5;r++)for(let col=0;col<glyph[r].length;col++)if(glyph[r][col]==='1')g.box([cursor+col*s,y+(2-r)*s,z+.08],[s*.8,s*.8,.035],9);cursor+=((glyph?.[0].length??3)+1)*s;}
}
export function boat(g:Sculpture,x:number,z:number,material:Material=5){
 g.box([x,.02,z],[1.2,.3,3.2],material);g.tri([x-.6,.16,z-1.6],[x+.6,.16,z-1.6],[x,.16,z-2.2],material);
 g.box([x,.25,z],[.9,.1,2.7],4);g.beam([x,.3,z+1.4],[x,.05,z+3],.055,8);
 for(const dz of [-.7,.4])g.box([x,.35,z+dz],[1.05,.14,.22],3);
}

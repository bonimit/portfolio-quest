import {MATERIAL,type Sculpture,type Material} from './world.ts';
import type {V3} from './math.ts';
/** Original deep floating-island base, recovered from the pre-city-direction
 * 2026-11-11 snapshot. Seasonal surface material is the only parameter. */
export function originalIsland(g:Sculpture,surface:Material=MATERIAL.grass) {
  const sides=36;
  const shape=(i:number,shrink:number,y:number):V3=>{
    const a=i/sides*Math.PI*2,r=1+.06*Math.sin(a*3+.4)+.035*Math.cos(a*7);
    return [Math.cos(a)*14*r*shrink+(.3-y)*.06,y,Math.sin(a)*11.6*r*shrink];
  };
  for(let i=0;i<sides;i++){
    const top=shape(i,1,.2),next=shape(i+1,1,.2);
    const inner=shape(i,.55,.28+Math.sin(i*2)*.02),innerNext=shape(i+1,.55,.28+Math.sin((i+1)*2)*.02);
    g.tri([0,.25,0],innerNext,inner,surface,1+.03*Math.sin(i));
    g.quad(inner,innerNext,next,top,surface,1+.045*Math.cos(i*3));
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

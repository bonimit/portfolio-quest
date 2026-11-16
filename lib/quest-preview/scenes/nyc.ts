import type {Sculpture} from '../world.ts';
import type {Season} from '../variants.ts';
import {ground,roundedOutline,door,tree,lamp,bench,pond} from './kit.ts';
import {facade,curb,markings,zebra,seasonalGarden,sign,snowCap} from './urban-kit.ts';
/** Manhattan-inspired architecture on the owner-preferred organic floating island. */
function manhattan(g:Sculpture,season:Season){
 const index=['spring','summer','autumn','winter'].indexOf(season),snow=season==='winter';
 ground(g,roundedOutline([[-14,-6],[-12,-10],[-7,-11.2],[3,-11.7],[10,-10.8],[13,-7],[14,-1],[13.7,6],[10.5,10.7],[4,12],[-6,11.8],[-12,10],[-14,5]]),8,0,1.6,.25,.84);
 // Asphalt avenues, double yellow center line, raised sidewalk and a corner crossing.
 ground(g,roundedOutline([[-11.8,-6.5],[-2,-6.5],[-2,10.2],[-8.8,10.2],[-11.8,8.8]]),3,3,-.24,.34);
 ground(g,roundedOutline([[3,1],[11,1],[11,8.3],[9.5,10.5],[3,10.5]]),3,3,-.24,.34);curb(g,0,8,3.9,5.8);
 g.box([0,.13,-1],[3.3,.12,18],8);g.box([0,.14,4.1],[25,.1,2.8],8);
 markings(g,0,-2,false,13);markings(g,-1,4.1,true,24);zebra(g,0,4.1,2.8,3.2);zebra(g,-10.9,4.1,1.6,2.8);
 // Rear skyline is a real urban silhouette: stepped towers, glazed slabs, roof tank.
 for(const [i,x]of [-10,-5.2,.2,5.2,9.5].entries()){
  const h=5.4+(i%3)*1.25+(index%2)*.35,z=-8+(i%2)*.7;
  g.box([x,h/2+.3,z],[3,h,2.1],i%2?13:0);g.box([x,h+.55,z],[2.2,.5,1.8],13);
  if(i===2){g.box([x,h+1,z],[1.3,.5,1.2],14);g.beam([x,h+1.2,z],[x,h+1.5,z],.045,8);}
  for(let r=0;r<4;r++)for(let c=0;c<3;c++)g.box([x+(c-1)*.75,1+r*1.45,z+1.08],[.4,.75,.04],17);
  if(snow)snowCap(g,x,z,3.1,2.2,h+.9);
 }
 // Brownstone row: stoops, cornices, iron fire escapes and rooftop water tank.
 facade(g,-6,-2.4,4.4,4.2,3,12,'brick',snow);door(g,-6,-.2,2.15);
 for(const [x,z,f]of [[-10,-3.4+index*.2,2],[7.8,-5.5,3],[3.5,-5.8,2]]){
  facade(g,x,z,3.2,3,f+(index===2?1:0),12,'brick',snow);
  for(let row=0;row<f;row++){
   g.box([x,1.3+row*1.65,z+1.8],[2.6,.08,.65],8);
   g.beam([x-1.1,1.6+row*1.65,z+2],[x+1.1,1.6+row*1.65,z+2],.045,8);
   if(row)g.beam([x-1,1.3+row*1.65,z+2],[x+1,1.3+(row-1)*1.65,z+2],.065,8);
  }
 }
 for(let step=0;step<3;step++)g.box([-6,.26+step*.07,1.1-step*.36],[1.4,.14,.36],3);
 for(const x of [-6.8,-5.2])g.beam([x,.4,1.4],[x,1.1,-.1],.045,8);
 g.ring([-10,4.5,-3.2],.65,.65,1.1,5,12);g.ring([-10,5.6,-3.2],.75,0,.5,8,12);
 sign(g,'PORT',-6,2.7,-.21,2.7);
 // Subway destination: open stairwell, iron handrails, paired globe lamps, METRO sign.
 g.box([5.6,.28,1],[3.2,.08,3.4],8);
 for(let step=0;step<6;step++)g.box([5.6,.31,2.6-step*.46],[2.3,.025,.22],3,0,1-step*.1);
 for(const x of [3.9,7.3]){
  for(const z of [-.8,.3,1.4,2.5])g.beam([x,.3,z],[x,1.25,z],.055,8);
  g.beam([x,1.25,-.8],[x,1.25,2.8],.07,8);
  g.beam([x,.35,2.9],[x,2.5,2.9],.1,8);g.crown([x,2.65,2.9],[.24,.24,.24],9);
 }
 sign(g,'METRO',5.6,2.35,-.7,3.1);
 // Pocket park occupies its own west-side pavement, away from pedestrian routes.
 const parkZ=season==='summer'?7.1:6.8;
 ground(g,roundedOutline([[-11.7,parkZ-2.8],[-3.6,parkZ-2.8],[-3.6,parkZ+2.6],[-9.2,parkZ+2.6],[-11.7,parkZ+1.7]]),snow?18:1,3,-.34,.4);
 for(const [x,z]of [[-10,6],[-4.4,6.5],[-10,9.2]])seasonalGarden(g,x,z,season,.8);
 bench(g,-8.8,9.7);bench(g,-4.6,9.5);
 if(season==='summer'){pond(g,-9,7.5,1,.8);g.ring([-9,.5,7.5],.3,.1,.6,3,12);}
 if(season==='autumn')for(let i=0;i<6;i++)g.crown([-10+i*.4,.6,6],[.2,.2,.2],11);
 if(snow){for(const x of [-11,-4,8])g.crown([x,.4,5.8],[.7,.2,.5],18);g.ring([-9,.4,7.5],1.2,1.2,.07,7,16);}
 // Distinctive street furniture and yellow taxi, confined to the avenue.
 g.box([-.7,.65,-4],[1.15,.65,2.7],4);g.box([-.7,1.1,-4],[1,.45,1.5],17);
 for(const x of [-1.3,-.1])for(const z of [-4.8,-3.2])g.crown([x,.4,z],[.13,.24,.24],8);
 for(const [x,z]of [[-2.3,-5],[-2.3,2],[10,3],[2.7,9.6]])lamp(g,x,z,2.5);
 for(const z of [-5.8,-1.5,1.5]){g.box([-2.3,.6,z],[.28,.7,.28],8);}
 if(snow){for(const [x,z,w,d]of [[-6,9.8,7,.4],[8,-5.5,3.3,3.1],[-5,-6,5,.5]])snowCap(g,x,z,w,d,z===-5.5?5.8:.4);}
 if(season==='spring')tree(g,10,7.8,.9,'bloom');else if(!snow)tree(g,10,8.8,.8,season==='autumn'?'maple':'green');
}
export function nycSpring(g:Sculpture){manhattan(g,'spring');}
export function nycSummer(g:Sculpture){manhattan(g,'summer');}
export function nycAutumn(g:Sculpture){manhattan(g,'autumn');}
export function nycWinter(g:Sculpture){manhattan(g,'winter');}

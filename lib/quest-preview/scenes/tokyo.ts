import type {Sculpture} from '../world.ts';
import type {Season} from '../variants.ts';
import {ground,roundedOutline,roof,door,tree,fuji,lamp,bench} from './kit.ts';
import {facade,markings,zebra,seasonalGarden,sign,snowCap} from './urban-kit.ts';
/** Layered rail neighborhood: asymmetric street cuts, train edge and dense side lots. */
function neighborhood(g:Sculpture,season:Season){
 const i=['spring','summer','autumn','winter'].indexOf(season),snow=season==='winter';
 ground(g,roundedOutline([[-14,-5],[-12.5,-9],[-7,-11.3],[-4,-13.3],[6,-13.3],[10,-11.3],[13.7,-8],[14,-3],[12.8,7],[8.8,11.7],[1,12],[-8,11.2],[-12.9,7.5]]),3,0,1.9,.25,.82);
 // Narrow central alley and offset cross street, not NYC's broad traffic grid.
 g.box([0,.29,4],[4,.1,14],13);g.box([0,.3,3],[23,.1,2.5],13);
 ground(g,roundedOutline([[-12,4.75],[-2,4.75],[-2,10.4],[-8.6,10.4],[-11.6,8.8]]),3,3,-.24,.34);ground(g,roundedOutline([[2.5,4.75],[11.5,4.75],[11.5,8],[8.5,10.4],[2.5,10.4]]),3,3,-.24,.34);zebra(g,0,3,3.8,2.4);markings(g,.5,7,false,4);
 // Rear railway with sleepers, two rails, raised station platform and compact train.
 g.box([2,.35,-7],[21,.3,2.4],8);
 for(let n=0;n<34;n++)g.box([-8+n*.6,.55,-7],[.16,.1,2.4],5);
 for(const z of [-7.7,-6.3])g.box([2,.64,z],[21,.1,.07],13);
 const trainX=season==='autumn'?5:season==='spring'?3:0;
 g.box([trainX,1.65,-7],[5.8,1.9,1.8],14);g.box([trainX,1.45,-6.07],[5.8,.25,.04],15);
 for(let n=0;n<6;n++)g.box([trainX-2.4+n*.95,1.9,-6.05],[.65,.7,.04],17);
 if(snow)snowCap(g,trainX,-7,5.8,1.85,2.65);
 // Railroad crossing: striped gates, twin warning lights and overhead power lines.
 for(const [x,z]of [[-2.1,-5.5],[2.3,-8.5]]){
  g.beam([x,.3,z],[x,3.1,z],.1,8);
  for(let k=0;k<9;k++)g.box([x-.7+k*.25,1.4,z],[.23,.14,.15],k%2?8:4);
  for(const dx of [-.25,.25])g.crown([x+dx,2.7,z],[.13,.13,.12],16);
  g.beam([x-.4,3.3,z],[x+.4,2.85,z],.07,4);g.beam([x-.4,2.85,z],[x+.4,3.3,z],.07,4);
 }
 for(const x of [-10,9.5]){g.beam([x,.3,-6],[x,5,-6],.12,5);g.box([x,4.8,-6],[3,.1,.12],8);}
 for(const z of [-5.8,-6.2])g.beam([-11,4.7,z],[11,4.7,z],.025,8);
 // Left destination: traditional corner atelier with tiled roof and noren curtains.
 facade(g,-5.8,-3.8,4,3.8,2,14,'shop',snow);roof(g,-5.8,3.8,-3.8,4.6,4.4,snow?18:8,1.15);
 for(let n=0;n<6;n++)g.box([-7.55+n*.6,2.2,-1.65],[.5,.6,.06],16);door(g,-5.8,-1.65,1.85);
 sign(g,'SHOP',-5.8,2.95,-1.6,2.3);
 // Right destination: contemporary stacked studio, projecting glass corner and roof terrace.
 facade(g,6,-1.8,3.9,4,3,13,'modern',snow);g.box([6.8,3,-.15],[2.2,2.5,.3],17);
 g.box([6,5.6,-1.8],[4.2,.17,4.3],snow?18:3);door(g,6,.25);
 for(let n=0;n<7;n++)g.beam([4.2+n*.6,5.65,.25],[4.2+n*.6,6.15,.25],.045,8);
 // Layered small shops, vertical signs, vending machine, outdoor AC and roof services.
 for(const [x,z,f]of [[-10,-1.8+i*.3,3],[10,-4,2],[9,2.8,2],[-9,1.8,2]]){
  facade(g,x,z,2.5,2.5,f,14,'shop',snow);
  g.box([x+.9,2.9,z+1.45],[.5,1.6,.15],16);
  for(let k=0;k<4;k++)g.box([x+.9,3.4-k*.3,z+1.55],[.28,.08,.025],9);
  g.box([x-1.2,3,z],[.45,.65,.8],13);for(let k=0;k<5;k++)g.box([x-1.45,2.8+k*.08,z+.42],[.03,.035,.65],8);
 }
 g.box([9.7,1.1,5],[.85,1.7,.7],16);g.box([9.7,1.3,5.37],[.65,1,.04],17);
 for(let row=0;row<3;row++)for(let col=0;col<3;col++)g.box([9.5+col*.2,1+row*.25,5.4],[.1,.16,.025],9);
 // Seasonal neighborhood life: sakura pocket, matsuri lane, persimmon stand, snow shelters.
 for(const [x,z]of [[-10,9.2],[9,9]])seasonalGarden(g,x,z,season,.75);
 if(season==='summer'){
  for(const z of [1,4.7]){g.beam([-10,4,z],[10,4,z],.025,8);for(let n=0;n<12;n++)g.crown([-9+n*1.6,3.7,z],[.22,.3,.22],9);}
  g.box([-9,.8,6],[2,1,1],5);roof(g,-9,1.8,6,2.6,1.8,16,.4);
 }
 if(season==='autumn')for(let n=0;n<9;n++)g.crown([-10+(n%3)*.35,.65,6+Math.floor(n/3)*.3],[.18,.18,.18],11);
 if(snow){for(const [x,z]of [[-10,6],[9,9],[-4,9.5]])g.crown([x,.4,z],[1,.22,.7],18);roof(g,-9,2.5,6,2.8,1.4,18,.4);}
 fuji(g,season==='spring'?-1:1,-10.7,7.6,snow?4.1:3.5,snow);
 bench(g,-5,9.5);for(const [x,z]of [[-3,5],[3,8],[-11,3]])lamp(g,x,z,2);
 if(season==='spring')tree(g,10,-8,.8,'bloom');
}
export function tokyoSpring(g:Sculpture){neighborhood(g,'spring');}
export function tokyoSummer(g:Sculpture){neighborhood(g,'summer');}
export function tokyoAutumn(g:Sculpture){neighborhood(g,'autumn');}
export function tokyoWinter(g:Sculpture){neighborhood(g,'winter');}

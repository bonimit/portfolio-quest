import type {Sculpture} from '../world.ts';
import type {Season} from '../variants.ts';
import {ground,roundedOutline,roof,door,tree,lamp,bench,flowers} from './kit.ts';
import {facade,boat,sign} from './urban-kit.ts';
/** River district: a deep side canal and backwater embrace separate urban quays. */
function riverside(g:Sculpture,season:Season){
 const wet=season==='raining',cool=season==='winter',index=wet?0:cool?2:1;
 ground(g,roundedOutline([[-14,-6],[-12.7,-10.2],[-6.5,-12],[2,-12.4],[9,-11.7],[13.5,-7.5],[14,-1],[13,6.5],[9.5,10.8],[2,12],[-7,11.6],[-12.5,8],[-14,1]]),7,0,1.5,.25,.85);
 // Rounded riverbanks and quays retain the canal neighborhood on an organic island.
 const front=roundedOutline([[-11.5,4],[11.5,4],[11,7.5],[8.5,10],[2,10.7],[-7.8,10.2],[-11,8]]);ground(g,front,3,12,.55,.35);
 ground(g,roundedOutline([[-3,-7],[9.8,-7],[11.5,-4],[11.7,2],[11.2,4],[-3,4]]),3,12,.55,.35);
 ground(g,roundedOutline([[-12.6,-9.3],[-8,-10.8],[2,-11.2],[9,-10],[11.5,-7.2],[-12.6,-7.2]]),3,12,.45,.32);
 ground(g,[[-10,-6],[-3,-6],[-3,1],[-10,1]],5,5,.45,.35);
 g.box([-6.4,.34,1.9],[7,.1,2],5);ground(g,front,3,3,-.35,.39);
 g.box([-1,.33,.5],[3,.12,7],3);
 for(let n=0;n<18;n++)g.box([-9.8+n*.4,.395,1.9],[.035,.01,2],2);
 for(const x of [-10.2,-3.2])for(const z of [-6,-2,1,4,8])g.box([x,-.35,z],[.16,1.2,.16],5);
 // Left destination: narrow colonnaded shophouse with timber balcony and tiled awnings.
 facade(g,-6,-4,4.2,3.8,3,14,'shop');roof(g,-6,5.6,-4,4.6,4.2,wet?15:4,1.1);door(g,-6,-1.95,2.1);sign(g,'SHOP',-6,2.6,-1.8,2.2,16);
 for(const x of [-7.7,-4.3])g.beam([x,.35,-1.6],[x,2.5,-1.6],.16,3);
 // Right destination: open river ferry pavilion with a Thai roof and mooring bollards.
 for(const x of [4.3,7.7])for(const z of [-3.8,-.7])g.beam([x,.3,z],[x,3.3,z],.13,5);
 roof(g,6,3.3,-2.3,5,4.5,wet?15:4,1.6);roof(g,6,4.45,-2.3,3.5,3.2,19,.7);
 for(const side of [-1,1])g.beam([6+side*2.4,3.4,-.1],[6+side*2.7,4.2,-.1],.09,19);
 sign(g,'PIER',6,2.7,-.2,2.3);bench(g,6,-3.5);
 // Dense back-bank shophouses and small temple courtyard rise behind the ferry.
 for(const [x,z,f]of [[-11,-8,2],[-7,-8.5,3],[-2.5,-8.8,2],[2,-8.8,3],[10,-4.5,2]]){
  facade(g,x,z,2.7,2.5,f+(cool&&x===2?1:0),x===-7?16:14,'shop');roof(g,x,f*1.65+.5,z,3.1,3.1,4,.65);
 }
 for(let n=0;n<4;n++)g.ring([7,.35+n*.5,-8.7],1.7-n*.25,1.45-n*.25,.5,19,16);
 g.ring([7,2.4,-8.7],.6,.03,3.2,19,16);
 for(const side of [-1,1])g.ring([7+side*2, .4,-8],.35,.04,2.2,19,12);
 // Long-tail boat, covered market boat and a small working skiff sit in the canal.
 boat(g,-12,2,5);boat(g,-12,-4,16);boat(g,9.5,-9.3,5);
 for(const x of [-12.5,-11.5])g.beam([x,.35,-4],[x,1.8,-4],.05,5);
 roof(g,-12,1.8,-4,1.5,2.3,wet?15:16,.3);
 // Tropical garden is an urban river-edge strip, never a shared island park.
 for(const [x,z]of [[-11,5],[10,6.5],[10,-1.2],[-12,-7]])tree(g,x,z,cool?.85:1.1,'palm');
 for(let n=0;n<5;n++)g.crown([9.8,.6,4+n*.8],[.8,.5,.6],15,n);
 bench(g,-9,9.3);bench(g,9,9.3);
 // Street market, canvas awnings and parked original tuk-tuk.
 const stallX=wet?3.8:cool?9:3.5;
 g.box([stallX,.95,4],[2.2,1.1,1.1],5);roof(g,stallX,2.2,4,2.8,1.8,wet?15:16,.3);
 for(let n=0;n<7;n++)g.crown([stallX-.8+n*.25,1.6,4.3],[.13,.18,.13],cool?11:4);
 g.box([9,.8,1.8],[1.3,.65,2.5],15);g.box([9,1.8,2],[1.5,.14,1.8],16);g.box([9,1.35,.9],[1,.7,.06],17);
 for(const x of [8.35,9.65])g.crown([x,.4,2.5],[.16,.3,.3],8);g.crown([9,.4,.6],[.16,.3,.3],8);
 for(const x of [-2,2])for(const z of [5,9])lamp(g,x,z,1.65);
 if(wet){
  // Monsoon shutters, broad rain canopies, puddles and raised sandbag stacks.
  for(const x of [-8,-4])g.box([x,2,-1.9],[.5,1.4,.08],15);
  for(const [x,z]of [[-9,5],[8,8],[2,5.5]])g.crown([x,.42,z],[.8,.035,.4],7);
  for(let n=0;n<6;n++)g.crown([-10+n*.45,.6,4.2],[.3,.2,.2],2);
 }else if(cool){
  // Northern-inspired winter festival details; no artificial tropical snow.
  for(const z of [4.5,8.9]){g.beam([-10,3.2,z],[10,3.2,z],.025,5);for(let n=0;n<11;n++)g.crown([-9+n*1.8,2.95,z],[.24,.34,.24],9);}
  for(const x of [-9,9])flowers(g,x,5.5,2.8,1,11);
 }else{
  for(const x of [-9,9]){g.ring([x,2.4,5.5],1.1,.06,.5,4,12);g.beam([x,.4,5.5],[x,2.8,5.5],.06,5);}
  flowers(g,8,8.8,2,1,11);
 }
 // Water-level markers make the canal a working environment.
 for(let n=0;n<5;n++)g.box([-3.05,-.2+n*.12,-3+index*.2],[.06,.055,.4],n%2?14:16);
}
export function bangkokRain(g:Sculpture){riverside(g,'raining');}
export function bangkokSummer(g:Sculpture){riverside(g,'summer');}
export function bangkokWinter(g:Sculpture){riverside(g,'winter');}

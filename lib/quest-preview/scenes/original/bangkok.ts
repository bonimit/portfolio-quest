import type {Sculpture} from '../../world.ts';
import {ground,roof,windowPane,door,route,tree,lamp,bench,pond,flowers} from './kit.ts';
export function bangkokRain(g:Sculpture){
 ground(g,[[-13,-8],[10,-10],[14,-4],[13,7],[8,11],[-9,11],[-14,4]],7,0,.85);
 // A canal village on timber piers, with no shared garden-island terrain.
 ground(g,[[-10,4],[-7,1],[-3,-1],[2,-1],[9,3],[10,8],[7,11],[-8,11],[-11,8]],5,5,.5,.34);g.box([-5.3,.23,-2],[7,.22,6],5);g.box([5.1,.23,-2.8],[7,.22,5.5],5);
 for(let i=0;i<25;i++)g.box([-8+i*.66,.35,7.7],[.035,.02,5.5],2);
 for(const x of [-8.5,-2.3,2.2,8.3])for(const z of [-5,-1,3,8.5])g.box([x,-.6,z],[.2,2,.2],5);
 route(g,[[0,10.4],[0,2.6],[-2.7,.5],[-5.3,-.6]],2,1.15,true);route(g,[[0,2.6],[2.7,.5],[5.1,-1.05]],2,1.15,true);
 // Low stilt house with wraparound veranda, wide monsoon roof and shutters.
 g.box([-5.3,1.8,-2.8],[4.2,2.6,3.3],5);roof(g,-5.3,3.3,-2.8,5.2,4.6,4,1.8);
 for(const dx of [-1.4,0,1.4]){windowPane(g,-5.3+dx,2,-1.12,.8,1.1);g.box([-5.3+dx,2.1,-.99],[.08,1.4,.06],5);}
 door(g,-5.3,-1.1);for(const dx of [-2.2,2.2])g.beam([-5.3+dx,.35,-.5],[-5.3+dx,3.4,-.5],.1,5);
 // Open ferry pier: long covered roof, mooring bollards and a waiting bench.
 for(const dx of [-1.8,1.8])for(const dz of [-1.2,1.2])g.beam([5.1+dx,.3,-2.8+dz],[5.1+dx,3.5,-2.8+dz],.14,5);
 roof(g,5.1,3.5,-2.8,5,4.1,15,1.5);g.box([5.1,2.8,-1.45],[3,.45,.1],4);
 bench(g,5.1,-3.7);
 // Side canals have their own long-tail boats and a waterside market row.
 for(const [x,z]of [[-10,2.5],[10,4]]){
  g.box([x,.05,z],[1.1,.28,3],5);g.tri([x-.55,.2,z-1.5],[x+.55,.2,z-1.5],[x,.2,z-2.1],5);
  g.box([x,.3,z],[.9,.12,2.3],4);g.beam([x,.4,z+1.3],[x,.05,z+3],.06,13);
 }
 for(const [x,h]of [[-7,2.8],[-1,3.2],[5,2.6]]){g.box([x,h/2+.2,-8],[2.4,h,2],5);roof(g,x,h+.25,-8,3,2.7,4,.8);windowPane(g,x,1.8,-6.95,1.4,.9);}
 for(const [x,z]of [[-10,-5],[10,-5]])tree(g,x,z,1.1,'palm');
 for(const x of [-9,9]){bench(g,x,8.8);lamp(g,x,5,1.6);}
}
export function bangkokSummer(g:Sculpture){
 ground(g,[[-10,-10],[8,-10],[13,-5],[13,6],[8,11],[-8,11],[-13,6],[-13,-4]],3,14,1.2);
 // Octagonal terracotta-and-stone temple court, with concentric inlaid paving.
 for(let row=0;row<18;row++)for(let col=0;col<20;col++){
  const x=-11+col*1.15,z=-8+row*1.05;if(Math.abs(x)<11.5&&z<9)g.box([x,.34,z],[1.06,.08,.96],(row+col)%5===0?4:3,0,1+(col%3)*.015);
 }
 g.ring([0,.32,2.6],2.2,2.2,.08,14,8);g.box([0,.32,7.5],[3.4,.1,6.4],14);
 // Open golden sala: slender columns and two stacked sweeping roofs.
 for(const dx of [-1.7,1.7])for(const dz of [-1.3,1.3])g.ring([-5.3+dx,.35,-2.8+dz],.16,.12,3.8,19,12);
 g.box([-5.3,.45,-2.8],[4.6,.2,3.6],14);roof(g,-5.3,3.7,-2.8,5,4.3,4,1.5);roof(g,-5.3,4.9,-2.8,3.4,2.8,19,1.2);
 for(const side of [-1,1])g.beam([-5.3+side*2.4,3.9,-.7],[-5.3+side*2.65,4.8,-.7],.1,19);
 g.box([-5.3,1.4,-3.8],[1.6,1.7,.18],17);
 // Temple portal has two complete stepped spires, not the old market gate.
 for(const dx of [-1.5,1.5]){
  g.box([5.1+dx,2,-2.8],[.8,3.4,1.2],14);
  for(let i=0;i<4;i++)g.ring([5.1+dx,3.7+i*.38,-2.8],.7-i*.11,.6-i*.11,.35,19,12);
  g.ring([5.1+dx,5.25,-2.8],.22,.015,1.35,19,12);
 }
 g.box([5.1,3.1,-2.8],[3.8,.55,1.2],19);g.box([5.1,1.4,-3.5],[1.2,2,.1],17);
 // Rear chedi and a lotus fountain anchor this composition, away from entry routes.
 for(let i=0;i<6;i++)g.ring([0,.3+i*.5,-8],2.25-i*.27,1.95-i*.27,.48,19,20);
 g.ring([0,3.3,-8],.7,.03,3.6,19,20);
 pond(g,9.7,3.2,2.3,2.3);g.ring([9.7,.55,3.2],.65,.4,1,14,12);g.crown([9.7,1.8,3.2],[.5,.5,.5],7);
 for(const [x,z]of [[-10,2],[-9,6],[10,-5]])tree(g,x,z,1.1,'palm');
 flowers(g,-8.8,4.5,3.3,2,11);flowers(g,7.6,7,3,1.3,11);
 // A stationary original tuk-tuk near the court edge.
 g.box([-9,.8,-5],[1.3,.6,2.4],15);g.box([-9,1.7,-4.7],[1.5,.14,1.8],16);g.box([-9,1.3,-5.7],[1,.6,.06],17);
 for(const dx of [-.65,.65])g.crown([-9+dx,.42,-4.5],[.16,.3,.3],8);g.crown([-9,.42,-6],[.16,.3,.3],8);
 for(const x of [-2,2])lamp(g,x,6);
}
export function bangkokWinter(g:Sculpture){
 ground(g,[[-13,-5],[-9,-9],[-2,-10],[6,-8],[12,-5],[14,1],[12,7],[8,11],[-8,11],[-13,6]],1,0,2.2);
 // Northern mountain retreat: broad ridges behind a warm dry-season terrace.
 for(const [x,h,w,z]of [[-8,4.5,5.5,-8],[1,6.7,5.5,-8.2],[8,4.8,4.7,-8]])g.ring([x,.25,z],w,.15,h,15,10,1,x*.1);
 g.crown([0,.3,3],[5,.07,3.4],3);g.box([0,.32,8],[3,.1,5.7],3);g.box([0,.32,-.7],[13,.1,2.2],3);
 // Lanna-inspired timber lodge: asymmetrical stacked roofs, balcony and shutters.
 g.box([-5.3,2.5,-2.8],[4.3,4.2,3.5],5);roof(g,-5.3,4.6,-2.8,5,4.2,4,1.4);roof(g,-5.8,3.2,-1.1,4.3,2.2,4,1);
 for(const dx of [-1.4,0,1.4])windowPane(g,-5.3+dx,3.1,-1.02,.85,1.1);
 g.box([-5.3,2.2,-.75],[4.4,.15,.8],5);for(let i=0;i<9;i++)g.beam([-7.3+i*.5,2.25,-.4],[-7.3+i*.5,2.9,-.4],.045,5);
 g.beam([-7.4,2.9,-.4],[-3.2,2.9,-.4],.07,5);door(g,-5.3,-1.02);
 // High lantern pavilion: a completely open lattice with hanging tiers.
 for(const dx of [-1.8,1.8])for(const dz of [-1.2,1.2])g.beam([5.1+dx,.3,-2.8+dz],[5.1+dx,4.4,-2.8+dz],.1,19);
 roof(g,5.1,4.4,-2.8,4.8,3.8,5,.7);
 for(const dx of [-1.2,0,1.2])for(const y of [1.6,2.7,3.8]){g.beam([5.1+dx,4.4,-2.4],[5.1+dx,y,-2.4],.02,5);g.crown([5.1+dx,y,-2.4],[.35,.43,.35],9,dx+y);}
 g.box([5.1,.4,-2.8],[4.4,.2,3.4],5);
 // Terraced tea planting, low craft stalls and a curved stream at the edge.
 for(let row=0;row<4;row++)for(const side of [-1,1]){
  const x=side*(8.5+row*.45),z=1.4+row*1.1;
  g.box([x,.4+row*.12,z],[2.8,.3,.75],3);g.crown([x,.7+row*.12,z],[1.4,.3,.35],15,row);
 }
 pond(g,-8,-5,2.1,1.2);bench(g,-9,7.7);bench(g,9,8.3);
 for(const x of [-2,2])for(const z of [4,7])lamp(g,x,z);
}

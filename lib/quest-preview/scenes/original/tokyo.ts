import type {Sculpture} from '../../world.ts';
import {ground,roof,windowPane,door,route,tree,lamp,bench,pond,fuji,flowers} from './kit.ts';
export function tokyoSpring(g:Sculpture){
 ground(g,[[-12,-7],[-7,-10],[3,-9],[10,-7],[13,-2],[12,6],[8,11],[-8,11],[-13,6],[-14,0]],1,3,1.5);
 fuji(g,1,-10,7.6,4.4);
 // Asymmetric tea garden: water to the west, blossom grove to the east.
 pond(g,-9,1.8,3.1,2.7);flowers(g,9,3.5,4,3);flowers(g,8,-5.8,3,2);
 route(g,[[0,10.4],[0,2.6],[-2.7,.5],[-5.3,-.6]],3,1.2);route(g,[[0,2.6],[2.7,.5],[5.1,-1.05]],3,1.2);
 // Broad, one-storey tea house with an open waterside veranda.
 g.box([-5.3,1.5,-2.8],[4.2,2.3,3.5],5);g.box([-5.3,.5,-.6],[4.8,.2,1],5);
 roof(g,-5.3,2.9,-2.8,5,4.4,15,1.3);
 for(const dx of [-1.4,0,1.4]){windowPane(g,-5.3+dx,1.7,-1,.9,1.45);g.beam([-5.3+dx,.5,-.35],[-5.3+dx,3.1,-.35],.1,5);}door(g,-5.3,-.98,1.9);
 // Flower pergola: open posts, crossing rails, a complete blossom canopy.
 for(const dx of [-1.7,1.7])for(const dz of [-1.3,1.3])g.beam([5.1+dx,.4,-2.8+dz],[5.1+dx,3.25,-2.8+dz],.12,5);
 for(let i=0;i<7;i++)g.box([3.1+i*.66,3.3,-2.8],[.13,.15,3.6],5);
 for(const z of [-4,-1.6])g.box([5.1,3.35,z],[4.5,.15,.15],5);
 for(const [x,z]of [[3.8,-4],[5.2,-4],[6.5,-4],[3.7,-1.5],[6.5,-1.5]])g.crown([x,3.6,z],[.75,.55,.55],11,x);
 for(const [x,z,s]of [[-10,-5,.9],[10,-4,1.2],[9,5,1.1],[-8,6,.9],[2,-7,.8]])tree(g,x,z,s,'bloom');
 for(const x of [-8.4,8.4]){g.box([x,.4,6],[2.8,.05,1.8],16);g.box([x,.65,6],[1.2,.3,.6],5);}
 for(const [x,z]of [[-3,4],[3,4],[0,8],[-7,-.4]])lamp(g,x,z,1.3);
 bench(g,10,7.7);
}
export function tokyoSummer(g:Sculpture){
 ground(g,[[-12,-9],[12,-9],[12,8],[9,11],[-9,11],[-12,7]],3,8,.75);
 fuji(g,-1,-10,7.6,4.2);
 // Dense urban street grid: curb strips, center paving and shop fronts.
 for(let i=0;i<24;i++)g.box([-11.5+i, .27,2],[.04,.025,18],8);
 for(let i=0;i<18;i++)g.box([0,.28,-7+i],[23,.025,.04],8);
 g.box([0,.32,4.5],[5.6,.1,13],2);g.box([0,.33,-.3],[18,.1,3],2);
 // Two-storey lantern merchant, painted shutters and striped noren.
 g.box([-5.3,2.3,-2.8],[4.5,3.9,3.4],14);roof(g,-5.3,4.4,-2.8,5,4,8,.7);
 for(const dx of [-1.4,0,1.4]){windowPane(g,-5.3+dx,3.2,-1.05,.9,1.1);g.box([-5.3+dx,1.8,-1],[.9,1.8,.08],5);}
 for(let i=0;i<7;i++)g.box([-7.4+i*.6,2.2,-.8],[.55,.55,.04],i%2?16:14);
 door(g,-5.3,-1.02);
 // Festival theater: raised hip roof and a visible taiko-like drum facade.
 g.box([5.1,1.8,-2.8],[4.3,2.7,3.5],16);roof(g,5.1,3.5,-2.8,5,4.2,8,1.6);
 for(const dx of [-1.5,1.5]){g.beam([5.1+dx,.35,-.98],[5.1+dx,3.6,-.98],.14,16);g.crown([5.1+dx,2.4,-.85],[.42,.55,.38],9);}
 door(g,5.1,-1.02,2.3);
 for(const x of [-9,9]){
  g.box([x,1,3.5],[2.4,1.2,1.5],5);roof(g,x,2.1,3.5,3,2.2,16,.6);
  for(const dx of [-.8,0,.8])g.crown([x+dx,1.9,4.2],[.17,.22,.17],9);
 }
 for(const z of [-.1,4.5]){
  g.beam([-10,4.7,z],[10,4.7,z],.035,5);
  for(let i=0;i<13;i++){const x=-9+i*1.5;g.beam([x,4.7,z],[x,4.15,z],.025,5);g.crown([x,4,z],[.25,.35,.25],9,i);}
 }
 for(const [x,z]of [[-9,7.5],[9,7.5]]){tree(g,x,z,.7,'green');bench(g,x,8.4);}
}
export function tokyoAutumn(g:Sculpture){
 ground(g,[[-13,-5],[-10,-9],[-4,-10],[3,-9],[11,-8],[14,-2],[12,6],[8,11],[-8,11],[-13,5]],1,0,2.4);
 fuji(g,0,-10,7.6,4.8);
 // Meandering river bends across the sides; timber approach bridges span its channels.
 for(const [x,z,w,d]of [[-9,2,3,2.5],[-8,-2,2.6,2],[9,2,2.8,2.5],[10,-2,2,2]])pond(g,x,z,w,d);
 g.box([0,.32,6],[4,.1,9],5);g.box([-4,.32,0],[7,.1,4],5);g.box([4,.32,0],[7,.1,4],5);g.box([0,.32,2],[8,.1,3],5);
 for(let i=0;i<21;i++)g.box([0,.38,2+i*.4],[3.9,.02,.025],2);
 // Long timber ryokan with projecting upper balcony and two pitched roofs.
 g.box([-5.3,2.2,-2.8],[4.7,3.7,3.6],5);roof(g,-5.3,4.3,-2.8,5,4.2,15,1.1);roof(g,-5.3,2.3,-.9,5.1,1.7,15,.5);
 for(const dx of [-1.5,0,1.5]){windowPane(g,-5.3+dx,3.3,-.96,.9,1);g.box([-5.3+dx,2.7,-.68],[.06,.7,.08],5);}g.beam([-7.6,2.9,-.68],[-3,2.9,-.68],.07,5);door(g,-5.3,-.97);
 // Persimmon farm shop, low roof and large fruit baskets.
 g.box([5.1,1.7,-2.8],[4.2,2.7,3.4],14);roof(g,5.1,3.2,-2.8,5,4,4,1.4);door(g,5.1,-1.05);
 for(const dx of [-1.4,1.4]){windowPane(g,5.1+dx,1.8,-1.04,.8,1.1);g.ring([5.1+dx,.4,-.5],.35,.45,.4,5,12);for(const ox of [-.15,.15])g.crown([5.1+dx+ox,.95,-.5],[.2,.2,.2],11);}
 for(const [x,z,s]of [[-10,-6,1.1],[10,-6,1.25],[-10,4,1.15],[10,5,1.1],[-4,-7,.8]])tree(g,x,z,s,'maple');
 // A broad arched pedestrian bridge over the left pond.
 for(let i=0;i<9;i++){const z=.3+i*.45,y=.55+Math.sin(i/8*Math.PI)*.55;g.box([-9,y,z],[1.7,.12,.44],16);for(const x of [-9.8,-8.2])g.beam([x,y,z],[x,y+.6,z],.06,16);}
 for(const x of [-2,2])lamp(g,x,6,1.4);
}
export function tokyoWinter(g:Sculpture){
 ground(g,[[-13,-7],[-7,-10],[3,-10],[12,-6],[13,4],[10,9],[7,11],[-8,11],[-13,5]],18,0,2);
 fuji(g,0,-10,7.8,5,true);
 // Alpine valley, with a pronounced sloping ski field on the far west.
 g.quad([-12,.4,5],[-9,.4,5],[-9,3.1,-6],[-12,3.1,-6],18);
 for(const x of [-11.5,-9.5])g.beam([x,.45,4.8],[x,3.15,-5.8],.045,13);
 // Original static skier on the side slope, separate from the interactive guide.
 for(const x of [-10.68,-10.32]){
  g.beam([x,2.29,-2.6],[x,1.93,-1.15],.08,16);
  g.beam([x,2.15,-2],[x,2.6,-2.15],.1,8);
 }
 g.box([-10.5,2.82,-2.13],[.45,.5,.3],16);
 g.crown([-10.5,3.25,-2.1],[.22,.24,.21],14);
 g.crown([-10.5,3.4,-2.1],[.24,.15,.23],16);
 g.box([-10.5,3.26,-1.9],[.32,.09,.04],8);
 for(const side of [-1,1]){
  g.beam([-10.5+side*.18,2.95,-2.1],[-10.5+side*.43,2.65,-1.9],.08,16);
  g.beam([-10.5+side*.43,2.65,-1.9],[-10.5+side*.6,2.05,-2.4],.025,13);
 }
 g.ring([0,.28,2.6],3.5,3.5,.1,2,20);g.box([0,.32,7],[3.3,.1,7.5],2);for(const x of [-4,4])g.box([x,.32,-.1],[4.8,.1,3],2);
 // Steep A-frame chalet; silhouette differs completely from the other Japan entries.
 g.box([-5.3,1.65,-2.8],[4.3,2.5,3.7],5);
 g.tri([-7.8,1.8,-.8],[-2.8,1.8,-.8],[-5.3,6,-.8],5);
 g.quad([-7.9,1.75,-.7],[-5.3,6.1,-.7],[-5.3,6.1,-5],[-7.9,1.75,-5],18);
 g.quad([-5.3,6.1,-.7],[-2.7,1.75,-.7],[-2.7,1.75,-5],[-5.3,6.1,-5],18);
 windowPane(g,-5.3,3.1,-.74,1.3,1.5);door(g,-5.3,-.73);
 // Glass gondola station, cable supports and two suspended cabins.
 g.box([5.1,1.8,-2.8],[4.5,2.8,3.4],17);roof(g,5.1,3.4,-2.8,5,4,18,1.7);door(g,5.1,-1.03);
 for(const z of [-5.5,-8]){g.beam([9,.3,z],[9,5,z],.16,13);g.box([9,5,z],[2.8,.15,.2],13);}
 for(const x of [8.4,9.6])g.beam([x,5,-8],[5.1,4,-2.8],.035,13);
 for(const [x,z,y]of [[8.3,-6,4.65],[6.7,-4,4.2]]){g.box([x,y-.55,z],[.7,.8,.8],16);windowPane(g,x,y-.5,z+.42,.5,.35);}
 for(const [x,z,s]of [[-9,7,.8],[10,6,1.1],[11,-2,.8]])tree(g,x,z,s,'pine');
 for(const [x,z]of [[-7,6],[8,7],[-2,-6]])g.crown([x,.45,z],[2,.3,1.2],18,x);
 bench(g,9,8.5);lamp(g,-2,7);lamp(g,2,7);
}

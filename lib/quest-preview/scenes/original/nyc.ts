import type {Sculpture} from '../../world.ts';
import {ground,roof,windowPane,door,route,tree,lamp,bench,pond,flowers} from './kit.ts';
export function nycSpring(g:Sculpture){
 ground(g,[[-12,-8],[-8,-10],[9,-10],[13,-6],[13,6],[9,11],[-9,11],[-13,6]],1,3,1.2);
 // Long central lawn, two radial garden beds and a glazed conservatory.
 route(g,[[0,10.5],[0,1.2],[-5.3,-.6]],2,1.4);route(g,[[0,2.6],[3,.4],[5.1,-1.05]],2,1.4);
 const x=-5.3,z=-2.8;g.box([x,.45,z],[5,.3,4.2],3);g.box([x,2.3,z],[4.7,3.6,3.6],17);
 roof(g,x,4.1,z,5,4.2,17,1.5);
 for(let i=0;i<9;i++){const px=x-2.4+i*.6;g.beam([px,.5,z+1.86],[px,4.2,z+1.86],.07,14);g.beam([px,4.28,z+2.15],[x+(px-x)*.52,5.7,z],.07,14);}
 for(const [y,zz,half]of [[4.72,-1.36,2.1],[5.18,-2.05,1.7],[5.7,-2.8,1.3]])g.beam([x-half,y,zz],[x+half,y,zz],.075,14);
 for(const y of [1.1,2.7,4.1])g.box([x,y,z+1.86],[4.8,.065,.07],14);
 for(const dx of [-2.35,2.35])for(let i=0;i<5;i++)g.beam([x+dx,.5,z-1.7+i*.85],[x+dx,4.1,z-1.7+i*.85],.06,14);
 door(g,x,-.88,2.3);flowers(g,x,-2.8,3.8,1.8);
 // An open white octagonal garden pavilion is a different destination silhouette.
 g.ring([5.1,.4,-2.8],2.35,2.35,.25,3,8);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beam([5.1+Math.cos(a)*1.8,.6,-2.8+Math.sin(a)*1.4],[5.1+Math.cos(a)*1.8,3.5,-2.8+Math.sin(a)*1.4],.11,14);}
 g.ring([5.1,3.5,-2.8],2.45,.12,.95,14,8);g.ring([5.1,4.45,-2.8],.12,0,.4,4,10);
 for(const [tx,tz,s]of [[-10,-5,1.1],[10,-5,1.2],[-9,3,.9],[9,3,1.1]])tree(g,tx,tz,s,'bloom');
 for(const x of [-8.4,8.4]){flowers(g,x,5,3.8,2);bench(g,x,7);}
 pond(g,0,-7.5,2.5,1.6);g.ring([0,.55,-7.5],.7,.45,.8,3,16);g.crown([0,1.6,-7.5],[.35,.5,.35],7);
 for(const x of [-2,2])for(const z of [3,6.5])lamp(g,x,z);
}
export function nycSummer(g:Sculpture){
 ground(g,[[-13,-8],[10,-10],[14,-4],[13,8],[9,11],[-10,11],[-14,5]],7,0,.65);
 // Full waterfront composition: broad front boardwalk, branching piers and open water.
 g.box([0,.23,7.5],[21,.23,7.4],5);g.box([-5.8,.23,-1.2],[7,.23,11],5);g.box([5.6,.23,-.8],[6.8,.23,10.5],5);g.box([0,.23,2],[5,.23,6],5);
 for(let i=0;i<35;i++)g.box([-10+i*.59,.365,7.5],[.035,.015,7.4],2);
 for(const x of [-9.3,-2.5,2.3,9])for(const z of [-5,-1,3,8.5])g.box([x,-.4,z],[.28,1.9,.28],5);
 route(g,[[0,10.4],[0,2.6],[-2.7,.5],[-5.3,-.6]],2,1.1,true);route(g,[[0,2.6],[2.7,.5],[5.1,-1.05]],2,1.1,true);
 // White boathouse, with big blue glazing and a barrel-like roof profile.
 g.box([-5.3,1.9,-2.8],[4.6,3,3.4],14);roof(g,-5.3,3.5,-2.8,5,4,13,1.2);
 for(const dx of [-1.4,0,1.4])windowPane(g,-5.3+dx,2,-1.05,.95,1.6);door(g,-5.3,-1,2.1);
 for(const y of [1,1.4,2.8,3.2])g.box([-5.3,y,-1.06],[4.6,.045,.04],13);
 // Sail pavilion: asymmetric triangular fabric canopy rather than a reused gate.
 for(const dx of [-1.9,1.9])g.beam([5.1+dx,.35,-1.2],[5.1+dx,3.7,-1.2],.09,13);
 g.beam([5.1,.3,-4.6],[5.1,5.1,-4.6],.11,13);
 g.tri([3.1,3.7,-1.1],[7.1,3.7,-1.1],[5.1,5.1,-4.6],14);g.tri([3.1,3.7,-1.1],[5.1,5.1,-4.6],[2.9,2.9,-4.3],4);
 g.box([5.1,.5,-2.8],[4.4,.3,3.3],2);
 // Distant river skyline uses low blocks with many reflective windows.
 for(const [x,h]of [[-7,3.6],[-3,5],[0,6],[3,4.4],[7,3.4]]){g.box([x,h/2+.1,-9],[2,h,1.2],13);for(let r=0;r<Math.floor(h/.7);r++)for(const dx of [-.5,.5])windowPane(g,x+dx,.7+r*.7,-8.35,.45,.4);}
 for(const x of [-8,8]){g.ring([x,2,5],1.65,.08,.55,4,12);g.beam([x,.4,5],[x,2.55,5],.07,13);bench(g,x,8.7);}
 for(const z of [4.2,8.5])for(const x of [-10,10])lamp(g,x,z,1.4);
}
export function nycAutumn(g:Sculpture){
 ground(g,[[-13,-6],[-9,-10],[8,-10],[13,-5],[13,6],[8,11],[-9,11],[-13,5]],12,3,1.8);
 // Recessed stone bands and broad civic paving make a city square, not a lawn island.
 for(let i=0;i<27;i++)g.box([-12+i*.9,.27,2],[.035,.02,17],3);
 for(let i=0;i<19;i++)g.box([0,.28,-6+i*.9],[24,.02,.035],3);
 g.box([0,.32,1.5],[15,.1,6.2],3);g.box([0,.32,7.3],[5.4,.1,7.4],3);
 // Brick museum with a classical column front and stepped pediment.
 g.box([-5.3,2.9,-2.8],[4.8,5,3.6],12);g.box([-5.3,5.6,-2.8],[5.1,.2,4],3);
 for(const dx of [-1.8,-.9,.9,1.8]){g.ring([-5.3+dx,.5,-.9],.16,.13,4.8,3,12);g.box([-5.3+dx,5.3,-.9],[.4,.2,.5],3);}
 g.tri([-7.9,5.7,-.7],[-2.7,5.7,-.7],[-5.3,6.6,-.7],3);door(g,-5.3,-.92,2.5);
 for(const dx of [-1.55,1.55])for(const y of [2,4.2])windowPane(g,-5.3+dx,y,-.94,.7,1.1);
 // Market clockhouse with a square tower and a conspicuous clock face.
 g.box([5.1,1.8,-2.8],[4.2,2.8,3.2],5);roof(g,5.1,3.3,-2.8,4.8,3.8,4,.8);
 g.box([5.1,3.8,-3.4],[1.5,2.7,1.5],12);g.box([5.1,4.45,-2.6],[1.1,1.1,.06],14);g.beam([5.1,4.45,-2.54],[5.1,4.85,-2.54],.05,8);g.beam([5.1,4.45,-2.54],[5.45,4.25,-2.54],.05,8);roof(g,5.1,5.2,-3.4,2,2,4,.5);door(g,5.1,-1.15);
 for(const x of [-10,10]){tree(g,x,-4,1.1,'maple');g.box([x,1,3],[3,.9,2],5);roof(g,x,2.3,3,3.5,2.8,4,.6);for(let i=0;i<5;i++)g.crown([x-1+i*.5,1.75,3.7],[.3,.28,.3],11,i);}
 for(const [x,z]of [[-9,6],[9,6],[-1,-7]])tree(g,x,z,1,'maple');
 for(const x of [-2,2]){lamp(g,x,6.5);g.box([x,.45,5],[.65,.3,.65],3);}
}
export function nycWinter(g:Sculpture){
 ground(g,[[-12,-9],[11,-9],[13,-5],[12,8],[8,11],[-9,11],[-13,5]],18,13,.9);
 // Rail-terminal composition with platforms along the rear and an icy front court.
 for(const x of [-10,-7,-4,0,4,8,11])g.box([x,.3,-7.5],[.08,.06,5],13);
 g.box([0,.32,3.8],[16,.1,13],2);
 g.box([-5.3,3.4,-2.8],[4.6,6.2,3.5],14);g.box([-5.3,6.9,-2.8],[3.2,.8,2.8],14);g.box([-5.3,7.5,-2.8],[1.9,.6,2],13);
 for(const dx of [-1.7,-.85,0,.85,1.7]){g.box([-5.3+dx,3.4,-.98],[.1,6,.1],13);for(const y of [1.8,3.2,4.6,6])windowPane(g,-5.3+dx,y,-.96,.5,.9);}
 g.box([-5.3,7.9,-2.8],[1.3,.18,1.5],18);door(g,-5.3,-.94,2.6);
 // Crystal winter hall: stepped pale towers and faceted translucent roof.
 g.box([5.1,1.9,-2.8],[4.2,3,3.2],17);
 for(const dx of [-1.6,0,1.6]){g.box([5.1+dx,3.5,-2.8],[.9,2,2.9],18);g.ring([5.1+dx,4.5,-2.8],.65,.03,.75,18,4,1,Math.PI/4);}
 door(g,5.1,-1.14,2.3);pond(g,0,5.5,3.2,1.7,7);
 for(const x of [-10,10]){tree(g,x,-5,1.2,'pine');tree(g,x,4,.9,'pine');bench(g,x,7.3);g.crown([x,.5,7.3],[1,.17,.5],18);}
 for(let i=0;i<9;i++)g.crown([-10+i*2.5,.38,-7],[.7,.18,.5],18,i);
 for(const x of [-3.7,3.7])lamp(g,x,6.7);
}

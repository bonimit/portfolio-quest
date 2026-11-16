import type {Sculpture} from './world.ts';
/** Open gallery pavilion and short branching boardwalk; existing meshes are never moved. */
export function addConceptGallery(g:Sculpture){
 g.box([0,.15,10.4],[3.8,.2,1.9],3);
 for(const x of [-1.6,1.6])for(const z of [9.8,11])g.box([x,1.65,z],[.12,2.9,.12],5);
 g.box([0,3.1,10.4],[3.8,.16,2],4);
 g.box([0,1.6,9.72],[3.4,2.7,.12],14);
 // The doorway remains open; artwork hangs either side of the approach.
 for(const x of [-1.15,1.15]){g.box([x,1.6,11.03],[.75,1.25,.1],5);g.box([x,1.6,11.1],[.6,1.1,.04],14);g.ring([x,1.35,11.13],.2,.2,.04,x<0?11:4,12,1,0);}
 g.box([0,1.8,9.8],[1.5,.9,.04],11);
 for(const [a,b]of [[[0,8.6],[2.4,9.3]],[[2.4,9.3],[2.4,11.5]],[[2.4,11.5],[0,11.5]]] as const){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.ceil(length/.42);
  for(let i=0;i<=n;i++){const t=i/n;g.box([a[0]+(b[0]-a[0])*t,.27,a[1]+(b[1]-a[1])*t],[.66,.08,.32],2,-Math.atan2(b[0]-a[0],b[1]-a[1]));}
 }
}

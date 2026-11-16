import type {Sculpture,Material} from './world.ts';
import type {V3} from './math.ts';
/** Keep complete silhouettes inside the narrow camera, above the path-label band. */
export const CLOUD_CLUSTERS:readonly {center:V3;scale:number}[]=[
  {center:[-12,4.6,-7.8],scale:1.2},
  {center:[12.2,4.2,-8.6],scale:1},
  {center:[-10.8,-2.8,8],scale:.8},
];
export function addClouds(g:Sculpture,material:Material){
  const lobes=[
    {offset:[-.15,0,0],radius:[1.55,.43,.67]},
    {offset:[-1.05,.28,.03],radius:[.7,.6,.66]},
    {offset:[-.05,.62,-.06],radius:[.88,.92,.74]},
    {offset:[1.02,.24,0],radius:[.74,.65,.63]},
  ];
  for(const {center,scale:s}of CLOUD_CLUSTERS)for(const {offset,radius}of lobes){
    g.ellipsoid(center.map((value,i)=>value+offset[i]*s) as V3,radius.map(value=>value*s) as V3,material);
  }
}

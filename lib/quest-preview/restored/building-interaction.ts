import {project,type Mat4,type V3} from './math.ts';
import type {SceneVariant} from './variants.ts';
export const ENTRY_FADE_MS=560;
export const BUILDING_PATHS=['portfolio','world'] as const;
/** Project actual landmark volumes, shared by WebGL and fixed illustration cameras. */
export function projectBuildings(variant:SceneVariant,matrix:Mat4,width:number,height:number){
  return Object.fromEntries(BUILDING_PATHS.map(path=>{
    const x=path==='portfolio'?-5.3:5.1,z=-2.8;
    const roof=path==='portfolio'?(variant.city==='nyc'?8.3:variant.city==='tokyo'?5.2:6.6):variant.city==='bangkok'?7.3:5.4;
    const corners:V3[]=[];
    for(const dx of [-2.5,2.5])for(const y of [.3,roof])for(const dz of [-1.5,1.7])corners.push([x+dx,y,z+dz]);
    const points=corners.map(point=>project(matrix,point,width,height));
    const left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y));
    return [path,{left,top,width:Math.max(44,Math.max(...points.map(p=>p.x))-left),height:Math.max(44,Math.max(...points.map(p=>p.y))-top)}];
  })) as Record<typeof BUILDING_PATHS[number],{left:number;top:number;width:number;height:number}>;
}

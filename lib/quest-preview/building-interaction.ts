import {CONCEPT_GALLERY} from './concept-gallery-layout.ts';
import {cityLayout} from './city-layout.ts';
import {sceneConfig} from './scene-config.ts';
import {project,type Mat4,type V3} from './math.ts';
import type {SceneVariant} from './variants.ts';
export const ENTRY_FADE_MS=560;
export const BUILDING_PATHS=['portfolio','world'] as const;
export const sceneBuildingPaths=(variant:SceneVariant):readonly ('portfolio'|'world'|'concepts')[]=>variant.conceptLab?[...BUILDING_PATHS,'concepts']:BUILDING_PATHS;
/** Project actual landmark volumes, shared by WebGL and fixed illustration cameras. */
export function projectBuildings(variant:SceneVariant,matrix:Mat4,width:number,height:number){
  return Object.fromEntries(sceneBuildingPaths(variant).map(path=>{
    const entry=path==='concepts'?CONCEPT_GALLERY:cityLayout(variant.city,variant.edition).entries[path],[x,z]=entry.center;
    const roof=path==='concepts'?CONCEPT_GALLERY.roof:sceneConfig(variant).roofs[path==='portfolio'?0:1];
    const corners:V3[]=[];
    for(const dx of [-entry.width/2,entry.width/2])for(const y of [.3,roof])for(const dz of [-entry.depth/2,entry.depth/2])corners.push([x+dx,y,z+dz]);
    const points=corners.map(point=>project(matrix,point,width,height));
    const left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y));
    return [path,{left,top,width:Math.max(44,Math.max(...points.map(p=>p.x))-left),height:Math.max(44,Math.max(...points.map(p=>p.y))-top)}];
  })) as Record<'portfolio'|'world'|'concepts',{left:number;top:number;width:number;height:number}>;
}

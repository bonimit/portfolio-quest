import {addConceptGallery} from './concept-gallery-mesh.ts';
import {makeWorld as restoredWorld} from './restored/world.ts';
import {makeWorld as heritageWorld} from './heritage/world.ts';
import {makeWorld as classicWorld} from './classic/world.ts';
import {add,sub,scale,cross,normalize,type V3} from './math.ts';
import {addClouds} from './clouds.ts';
import {sceneId} from './scene-config.ts';
import {SCENE_BUILDERS,NEW_SCENE_BUILDERS} from './scenes/index.ts';
import {DEFAULT_VARIANT,type SceneVariant} from './variants.ts';
/** Batched architecture with smooth foliage normals: position, face normal, material index, tonal variation. */
export const MATERIAL = {rock:0,grass:1,path:2,stone:3,copper:4,wood:5,leaf:6,water:7,ink:8,lamp:9,cloud:10,flower:11,brick:12,metal:13,plaster:14,evergreen:15,vermilion:16,glass:17,snow:18,gold:19} as const;
export type Material = typeof MATERIAL[keyof typeof MATERIAL];
export class Sculpture {
  values: number[]=[];
  tri(a: V3,b: V3,c: V3,material: Material,tone=1,normals?:V3[]) {
    const n=normalize(cross(sub(b,a),sub(c,a)));
    for(const [i,p]of [a,b,c].entries())this.values.push(...p,...(normals?.[i]??n),material,tone);
  }
  quad(a: V3,b: V3,c: V3,d: V3,m: Material,tone=1){this.tri(a,b,c,m,tone);this.tri(a,c,d,m,tone);}
  box(center: V3,size: V3,m: Material,rotation=0,tone=1) {
    const point=(x:number,y:number,z:number):V3=>[center[0]+x*Math.cos(rotation)+z*Math.sin(rotation),center[1]+y,center[2]-x*Math.sin(rotation)+z*Math.cos(rotation)];
    const [x,y,z]=size.map(v=>v/2);
    const p=[point(-x,-y,-z),point(x,-y,-z),point(x,y,-z),point(-x,y,-z),point(-x,-y,z),point(x,-y,z),point(x,y,z),point(-x,y,z)];
    for(const [a,b,c,d] of [[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]])this.quad(p[a],p[b],p[c],p[d],m,tone);
  }
  ring(center: V3,bottom: number,top: number,height: number,m: Material,sides=12,tone=1,phase=0) {
    const at=(r:number,y:number,i:number):V3=>[center[0]+Math.cos(i/sides*Math.PI*2+phase)*r,center[1]+y,center[2]+Math.sin(i/sides*Math.PI*2+phase)*r];
    for(let i=0;i<sides;i++){
      const a=at(bottom,0,i),b=at(bottom,0,i+1),c=at(top,height,i+1),d=at(top,height,i);
      this.quad(a,d,c,b,m,tone);this.tri([center[0],center[1]+height,center[2]],c,d,m,tone);
      this.tri(center,a,b,m,tone*.9);
    }
  }
  beam(from: V3,to: V3,width: number,m: Material,tone=1) {
    const axis=normalize(sub(to,from));const u=scale(normalize(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),width/2),v=scale(cross(axis,normalize(u)),width/2);
    const corner=(p:V3,a:number,b:number)=>add(p,add(scale(u,a),scale(v,b)));
    for(let i=0;i<4;i++){const a=[[1,1],[-1,1],[-1,-1],[1,-1]][i],b=[[1,1],[-1,1],[-1,-1],[1,-1]][(i+1)%4];this.quad(corner(from,...a as [number,number]),corner(to,...a as [number,number]),corner(to,...b as [number,number]),corner(from,...b as [number,number]),m,tone);}
  }
  /** Seam-closed ellipsoid, with analytic normals and uniform tone for soft cloud lobes. */
  ellipsoid(center:V3,size:V3,m:Material){
    const rows=8,sides=20;
    const point=(row:number,col:number):V3=>{
      const lat=-Math.PI/2+row/rows*Math.PI,angle=(col%sides)/sides*Math.PI*2;
      return [center[0]+Math.cos(lat)*Math.cos(angle)*size[0],center[1]+Math.sin(lat)*size[1],center[2]+Math.cos(lat)*Math.sin(angle)*size[2]];
    };
    const normal=(p:V3):V3=>normalize(p.map((value,i)=>(value-center[i])/(size[i]*size[i])) as V3);
    for(let row=0;row<rows;row++)for(let col=0;col<sides;col++){
      const a=point(row,col),b=point(row+1,col),c=point(row+1,col+1),d=point(row,col+1);
      if(row<rows-1)this.tri(a,b,c,m,1,[normal(a),normal(b),normal(c)]);
      if(row>0)this.tri(a,c,d,m,1,[normal(a),normal(c),normal(d)]);
    }
  }

  crown(center: V3,size: V3,m: Material,phase=0) {
    const rows=6,sides=12;
    const point=(row:number,i:number):V3=>{
      const lat=-Math.PI/2+row/rows*Math.PI,angle=i/sides*Math.PI*2;
      const scallop=1+.06*Math.sin(angle*3+row*.7+phase)+.035*Math.cos(angle*5-row*.45+phase);
      return [center[0]+Math.cos(lat)*Math.cos(angle)*size[0]*scallop,center[1]+Math.sin(lat)*size[1],center[2]+Math.cos(lat)*Math.sin(angle)*size[2]*scallop];
    };
    const normal=(p:V3):V3=>normalize([(p[0]-center[0])/(size[0]*size[0]),(p[1]-center[1])/(size[1]*size[1]),(p[2]-center[2])/(size[2]*size[2])]);
    for(let row=0;row<rows;row++)for(let i=0;i<sides;i++){
      const a=point(row,i),b=point(row+1,i),c=point(row+1,i+1),d=point(row,i+1),tone=.98+.015*Math.sin(i/sides*Math.PI*6+row+phase);
      this.tri(a,b,c,m,tone,[normal(a),normal(b),normal(c)]);
      this.tri(a,c,d,m,tone,[normal(a),normal(c),normal(d)]);
    }
  }
}
/** Each supported city/season has its own composition. Day/night share that scene. */
export function makeWorld(variant:SceneVariant=DEFAULT_VARIANT){
  if(variant.edition==='restored'){const original=restoredWorld({...variant,edition:'restored'});if(!variant.conceptLab)return original;const extra=new Sculpture();addConceptGallery(extra);const result=new Float32Array(original.length+extra.values.length);result.set(original);result.set(extra.values,original.length);return result;}
  if(variant.edition==='classic')return classicWorld();
  if(variant.edition==='heritage')return heritageWorld(variant);
  const g=new Sculpture();(variant.edition==='new'?NEW_SCENE_BUILDERS:SCENE_BUILDERS)[sceneId(variant)](g);addClouds(g,MATERIAL.cloud);
  return new Float32Array(g.values);
}
export const LANDMARKS = {portfolio:[-5.3,10.6,-2.8] as V3,world:[5.1,6.3,-2.7] as V3};

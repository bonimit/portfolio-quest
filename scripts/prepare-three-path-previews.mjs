import {studyModel} from '../lib/quest-preview/study-renderer.ts';
import {THREE_PATH_VIEWS,threePathId} from '../lib/quest-preview/three-path-catalog.ts';
import {STUDY_ROUTES} from '../lib/quest-preview/study-navigation.ts';
import {placePalette} from '../lib/quest-preview/restored/place-scenes/palette.ts';
/** Restored-preview fallback art, rasterized from the same procedural geometry with a CPU
 * depth buffer and shadow map. Uses Sharp already installed by Next for encoding;
 * no downloaded art, generation API or new dependency. */
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import sharp from 'sharp';
import {MATERIAL} from '../lib/quest-preview/restored/world.ts';
import {cameraMatrix} from '../lib/quest-preview/restored/math.ts';
import {dot,normalize,project,multiply,ortho,lookAt} from '../lib/quest-preview/restored/math.ts';
import {worldPalette,atmosphere} from '../lib/quest-preview/restored/palette.ts';
import {variantId} from '../lib/quest-preview/restored/variants.ts';

const selected=new Set(process.argv.slice(2));
for(const id of selected)if(!THREE_PATH_VIEWS.some(v=>threePathId(v)===id))throw Error(`Unknown scene: ${id}`);
const VARIANTS=THREE_PATH_VIEWS.filter(v=>!selected.size||selected.has(threePathId(v))).map(v=>({...v,layer:'all'}));
const width=1440,height=980;
const cloudSun=normalize([-.6,1,.4]);

const folder=new URL('../public/quest-preview/three-path/',import.meta.url);mkdirSync(folder,{recursive:true});
const assetFolder=new URL('../assets/quest-preview/three-path/',import.meta.url);mkdirSync(assetFolder,{recursive:true});
const depth=(m,p)=>m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14];
function raster(points,w,h,visit){
 const [a,b,c]=points,area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);if(Math.abs(area)<.00001)return;
 const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(w-1,Math.ceil(Math.max(a.x,b.x,c.x)));
 const minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(h-1,Math.ceil(Math.max(a.y,b.y,c.y)));
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
  const u=((b.x-x-.5)*(c.y-y-.5)-(b.y-y-.5)*(c.x-x-.5))/area;
  const v=((c.x-x-.5)*(a.y-y-.5)-(c.y-y-.5)*(a.x-x-.5))/area,t=1-u-v;
  if(u>=-.00001&&v>=-.00001&&t>=-.00001)visit(x,y,u,v,t);
 }
}
function prepare(variant){
const matrix=cameraMatrix(width,height);
const geometry=studyModel(variant).geometry,faces=[];
const sunMatrix=multiply(ortho(-21,21,-21,21,.1,85),lookAt(atmosphere(variant).direction,[0,0,0]));
for(let i=0;i<geometry.length;i+=24){
 const p=[0,8,16].map(offset=>Array.from(geometry.slice(i+offset,i+offset+3))),n=Array.from(geometry.slice(i+3,i+6));
 const normals=[3,11,19].map(offset=>Array.from(geometry.slice(i+offset,i+offset+3)));
 const center=p[0].map((value,j)=>(value+p[1][j]+p[2][j])/3);
 faces.push({p,n,normals,center,material:geometry[i+6],tone:geometry[i+7],screen:p.map(v=>({...project(matrix,v,width,height),z:depth(matrix,v)})),shadow:p.map(v=>({...project(sunMatrix,v,1024,1024),z:depth(sunMatrix,v)}))});
}
const shadowDepth=new Float32Array(1024*1024).fill(Infinity);
for(const face of faces){if([MATERIAL.water,MATERIAL.cloud].includes(face.material))continue;
 raster(face.shadow,1024,1024,(x,y,a,b,c)=>{const z=a*face.shadow[0].z+b*face.shadow[1].z+c*face.shadow[2].z,index=y*1024+x;if(z<shadowDepth[index])shadowDepth[index]=z;});
}
return {geometry,faces,shadowDepth};
}
const previous=selected.size?JSON.parse(readFileSync(new URL('manifest.json',assetFolder),'utf8')):{};
const sizes={...previous.files},geometryStats={...previous.geometry};
let prepared,key;
for(const variant of VARIANTS){
 const nextKey=variantId(variant)+variant.light+variant.layer;
 if(key!==nextKey){prepared=prepare(variant);key=nextKey;}
 const {geometry,faces,shadowDepth}=prepared;
 geometryStats[`${threePathId(variant)}-${variant.light}`]={vertices:geometry.length/8,triangles:geometry.length/24};
 const {light}=variant;
 const palette=placePalette(variant,worldPalette(variant)),weather=atmosphere(variant),sun=normalize(weather.direction),pixels=new Uint8Array(width*height*4),zBuffer=new Float32Array(width*height).fill(Infinity);
 for(const face of faces){
  // Match the two-sided live renderer. Culling by a shading normal leaves gaps
  // in the sculpted, irregular underside even when the depth buffer is correct.
  const {n,center,material,tone,screen}=face;
  const rounded=[MATERIAL.leaf,MATERIAL.evergreen,MATERIAL.flower,MATERIAL.cloud].includes(material);
  const diffuse=Math.max(0,dot(n,sun)),sky=.5+.5*n[1],occlusion=.72+.28*Math.max(0,Math.min(1,(center[1]+4)/6));
  const base=[0,1,2].map(j=>palette[material*3+j]*tone),fill=[0,1,2].map(j=>(weather.ground[j]*(1-sky)+weather.sky[j]*sky)*weather.fill);
  const fog=Math.min(.35,Math.hypot(center[0],center[2])*.003+Math.max(0,-center[1])*.025);
  const entries=STUDY_ROUTES;
  const bounce=light==='night'?(['portfolio','world'].reduce((sum,key)=>sum+Math.exp(-Math.hypot(center[0]-entries[key].center[0],center[1]-1.4,center[2]-entries[key].center[1])*(key==='portfolio'?.65:.7)),0))*.45:0;
  raster(screen,width,height,(x,y,a,b,c)=>{
   const index=y*width+x,z=a*screen[0].z+b*screen[1].z+c*screen[2].z;if(z>=zBuffer[index])return;zBuffer[index]=z;
   const sx=a*face.shadow[0].x+b*face.shadow[1].x+c*face.shadow[2].x,sy=a*face.shadow[0].y+b*face.shadow[1].y+c*face.shadow[2].y;
   const sz=a*face.shadow[0].z+b*face.shadow[1].z+c*face.shadow[2].z;
   let lit=0;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const xx=Math.max(0,Math.min(1023,Math.round(sx)+dx)),yy=Math.max(0,Math.min(1023,Math.round(sy)+dy));lit+=sz-.002<=shadowDepth[yy*1024+xx]?1:weather.shadowFloor;}lit/=9;
   const pn=rounded?normalize([0,1,2].map(j=>a*face.normals[0][j]+b*face.normals[1][j]+c*face.normals[2][j])):n;
   const pixelDiffuse=rounded?Math.max(0,dot(pn,sun)):diffuse,pixelSky=.5+.5*pn[1];
   const cloudLight=material===MATERIAL.cloud?.72+.28*Math.max(0,dot(pn,cloudSun)):1;
   for(let j=0;j<3;j++){
    const pixelFill=rounded?(weather.ground[j]*(1-pixelSky)+weather.sky[j]*pixelSky)*weather.fill:fill[j];
    let value=base[j]*(pixelFill+weather.sun[j]*pixelDiffuse*lit*.83)*occlusion+base[j]*[.8,.34,.09][j]*bounce;
    if(material===MATERIAL.lamp)value=base[j]*(light==='night'?1.85:1.1);
    if(material===MATERIAL.glass){const mix=light==='night'?.12:.45;value=value*(1-mix)+weather.sky[j]*.65*mix+.05*Math.pow(Math.max(pn[1],0),4)+(light==='night'?[.2,.075,.018][j]:0);}
    if(material===MATERIAL.cloud){const fogMix=light==='night'?.35:.12;value=(base[j]*(1-fogMix)+weather.fog[j]*fogMix)*weather.cloudGain*cloudLight;}
    if(tone>3)value=base[j]*(light==='night'?1.35:.45);if(tone>5.5&&tone<6.5)value=[1,.16,.012][j]*(light==='night'?2:1);
    value=value*(1-fog)+weather.fog[j]*fog;
    pixels[index*4+j]=Math.round(Math.pow(1-Math.exp(-Math.max(0,value)*weather.exposure),1/2.2)*255);
   }pixels[index*4+3]=255;
  });
 }
 const file=variant.layer==='all'?`${threePathId(variant)}-${variant.light}.webp`:`${variant.layer}.webp`,output=await sharp(pixels,{raw:{width,height,channels:4}}).webp({quality:91,alphaQuality:100,effort:6}).toBuffer();
 writeFileSync(new URL(file,folder),output);sizes[file]=output.length;console.log(`Prepared ${file}`);
}
const geometry=studyModel().geometry;
const manifest={schemaVersion:2,source:'Same live three-path geometry, CPU artwork previews; not browser screenshots',vertices:geometry.length/8,triangles:geometry.length/24,petTriangles:0,dimensions:[width,height],geometry:geometryStats,files:sizes};
writeFileSync(new URL('manifest.json',assetFolder),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({variants:Object.keys(sizes).length,geometry:geometryStats,totalBytes:Object.values(sizes).reduce((sum,n)=>sum+n,0)},null,2));

import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {makeWorld,MATERIAL} from '../lib/quest-preview/world.ts';
import {CITY_IDS,VARIANTS} from '../lib/quest-preview/variants.ts';

test('complete independent scenes stay finite and within the camera/geometry envelope',()=>{
 for(const v of VARIANTS.filter(v=>v.light==='day')){
  const values=makeWorld(v);assert.ok(values.length/24<24000);assert.ok(values.length/24>4000);
  for(let i=0;i<values.length;i+=8){assert.ok(Math.abs(values[i])<15&&Math.abs(values[i+2])<14&&values[i+1]<10&&values[i+1]>-7);}
 }
});
test('cities do not reuse the same structural assembly',()=>{
 const fingerprints=city=>{
  const g=makeWorld({city,season:'summer',light:'day'}),triangles=new Set();
  for(let i=0;i<g.length;i+=24){if(g[i+6]===MATERIAL.cloud)continue;triangles.add([0,8,16].map(o=>[0,1,2].map(j=>Math.round(g[i+o+j]*100)).join(',')).sort().join('|'));}
  return triangles;
 };
 const scenes=CITY_IDS.map(fingerprints);
 for(let i=0;i<scenes.length;i++)for(let j=i+1;j<scenes.length;j++){
  const shared=[...scenes[i]].filter(p=>scenes[j].has(p)).length;
  assert.ok(shared/Math.min(scenes[i].size,scenes[j].size)<.35,`${CITY_IDS[i]} and ${CITY_IDS[j]} share too much structural geometry`);
 }
});
test('city silhouettes and settings change at least 30 percent of shared visible daytime pixels',async()=>{
 const frames=[];
 for(const city of CITY_IDS)frames.push(await sharp(new URL(`../public/quest-preview/${city}-summer-day.webp`,import.meta.url).pathname).resize(320,218).ensureAlpha().raw().toBuffer());
 for(let a=0;a<frames.length;a++)for(let b=a+1;b<frames.length;b++){
  let pixels=0,changed=0;
  for(let i=0;i<frames[a].length;i+=4)if(frames[a][i+3]>180&&frames[b][i+3]>180){pixels++;if(Math.hypot(...[0,1,2].map(j=>frames[a][i+j]-frames[b][i+j]))>24)changed++;}
  assert.ok(changed/pixels>=.3,`${CITY_IDS[a]}/${CITY_IDS[b]} changes ${(changed/pixels*100).toFixed(1)}%`);
 }
});

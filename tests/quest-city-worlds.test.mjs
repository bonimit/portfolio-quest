import test from 'node:test';
import assert from 'node:assert/strict';
import {CITY_LAYOUTS,onCityWalkway} from '../lib/quest-preview/city-layout.ts';
import {cityCameraMatrix,arrivalProgress} from '../lib/quest-preview/city-camera.ts';
import {IslandActors} from '../lib/quest-preview/actors.ts';
import {makeWorld,MATERIAL} from '../lib/quest-preview/world.ts';
import {NEW_VARIANTS as VARIANTS,CITY_IDS} from '../lib/quest-preview/variants.ts';
import {project} from '../lib/quest-preview/math.ts';
import {projectBuildings} from '../lib/quest-preview/building-interaction.ts';

test('each city has its own camera, destination positions and wander routes',()=>{
 assert.equal(new Set(CITY_IDS.map(city=>JSON.stringify(CITY_LAYOUTS[city]))).size,3);
 assert.equal(new Set(CITY_IDS.map(city=>[...cityCameraMatrix(city,1280,800)].join(','))).size,1,'previous default angle stays consistent');
 for(const city of CITY_IDS){
  const c=CITY_LAYOUTS[city].camera;
  assert.equal(arrivalProgress(city,0),1);assert.equal(arrivalProgress(city,c.duration),0);
  assert.equal(arrivalProgress(city,0,true),0);
  assert.ok(arrivalProgress(city,c.duration/2)>0&&arrivalProgress(city,c.duration/2)<.5);
 }
});
test('guide and pets remain on authored city pedestrian areas throughout wandering',()=>{
 for(const city of CITY_IDS){const a=new IslandActors(city,'new');for(let t=0;t<180000;t+=50){
  for(const pose of Object.values(a.advance(50)))assert.ok(onCityWalkway(city,[pose.x,pose.z],'new'),`${city}: ${pose.x},${pose.z}`);
 }}
});
test('both city-specific approaches remain walkable and arrive at the exact door',()=>{
 for(const city of CITY_IDS)for(const path of ['portfolio','world']){
  const a=new IslandActors(city,'new');a.advance(5100);a.navigate(path);
  let duration=0;while(!a.arrived&&duration<20000){duration+=25;for(const p of Object.values(a.advance(25)))assert.ok(onCityWalkway(city,[p.x,p.z],'new'));}
  assert.equal(a.arrived,path);assert.ok(Math.hypot(a.poses.guide.x-CITY_LAYOUTS[city].entries[path].door[0],a.poses.guide.z-CITY_LAYOUTS[city].entries[path].door[1])<1e-9);
 }
});
test('cancelled entry retraces its route without crossing water, rails or buildings',()=>{
 for(const city of CITY_IDS)for(const path of ['portfolio','world'])for(const delay of [500,1700,3200,4800,9000]){
  const a=new IslandActors(city,'new');a.navigate(path);a.advance(delay);a.cancel();
  for(let t=0;t<30000;t+=50){const p=a.advance(50).guide;assert.ok(onCityWalkway(city,[p.x,p.z],'new'),`${city}/${path}/${delay}: ${p.x},${p.z}`);}
  assert.equal(a.arrived,null);
 }
});
test('all scene geometry, including the skyline, stays framed at arrival and settled cameras',()=>{
 for(const v of VARIANTS.filter(v=>v.light==='day'))for(const [w,h]of [[360,520],[768,600],[1280,650]])for(const a of [0,1]){
  const matrix=cityCameraMatrix(v.city,w,h,0,0,0,0,0,a,'new'),g=makeWorld(v);
  for(let i=0;i<g.length;i+=8){const p=project(matrix,[g[i],g[i+1],g[i+2]],w,h);assert.ok(p.x>=0&&p.x<=w&&p.y>=0&&p.y<=h,`${v.city}/${v.season}: ${p.x},${p.y}`);}
  const {portfolio,world}=projectBuildings(v,matrix,w,h);assert.ok(portfolio.left+portfolio.width<world.left);
 }
});
test('seasons change physical geometry, winter snow, and Thai monsoon structures',()=>{
 for(const city of CITY_IDS){
  const scenes=VARIANTS.filter(v=>v.city===city&&v.light==='day').map(makeWorld);
  assert.equal(new Set(scenes.map(g=>Buffer.from(g.buffer).toString('base64'))).size,scenes.length);
 }
 const count=(v,m)=>{const g=makeWorld(v);let n=0;for(let i=6;i<g.length;i+=8)if(g[i]===m)n++;return n;};
 for(const city of ['nyc','tokyo'])assert.ok(count({city,season:'winter',light:'day'},MATERIAL.snow)>count({city,season:'summer',light:'day'},MATERIAL.snow));
 assert.equal(count({city:'bangkok',season:'winter',light:'day'},MATERIAL.snow),0);
});

test('offset quays and concave street plots triangulate without inventing ground at the origin',async()=>{
 const {Sculpture}=await import('../lib/quest-preview/world.ts');
 const {ground}=await import('../lib/quest-preview/scenes/kit.ts');
 for(const polygon of [[[-10,-6],[-3,-6],[-3,1],[-10,1]],[[-11,4],[11,4],[11,10],[-11,10]],[[0,0],[6,0],[6,2],[2,2],[2,6],[0,6]]]){
  const g=new Sculpture();ground(g,polygon,MATERIAL.grass,MATERIAL.rock);
  const expected=Math.abs(polygon.reduce((n,p,i)=>{const q=polygon[(i+1)%polygon.length];return n+p[0]*q[1]-q[0]*p[1];},0))/2;
  let area=0,count=0;
  for(let i=0;i<g.values.length;i+=24)if(g.values[i+6]===MATERIAL.grass){
   const [a,b,c]=[0,8,16].map(o=>g.values.slice(i+o,i+o+3));
   area+=Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))/2;count++;
   assert.ok(g.values[i+4]>.99,'terrain top normals face upward');
   for(const p of [a,b,c])assert.ok(polygon.some(q=>q[0]===p[0]&&q[1]===p[2]),'no out-of-plot origin fan');
  }
  assert.equal(count,polygon.length-2);assert.equal(area,expected);
 }
});

test('changing the selected path mid-walk or after cancellation stays on city pedestrian surfaces',()=>{
 for(const city of CITY_IDS)for(const first of ['portfolio','world'])for(const delay of [800,2400,4200,7000])for(const cancel of [false,true]){
  const a=new IslandActors(city,'new');a.navigate(first);a.advance(delay);
  if(cancel){a.cancel();a.advance(3200);}
  const next=first==='portfolio'?'world':'portfolio';a.navigate(next);
  for(let t=0;!a.arrived&&t<24000;t+=25){const p=a.advance(25).guide;assert.ok(onCityWalkway(city,[p.x,p.z],'new'),`${city}/${first}/${delay}/${cancel}: ${p.x},${p.z}`);}
  assert.equal(a.arrived,next);
 }
});

test('pitched roof and snow-cap normals face the sky rather than shading the roof underside',async()=>{
 const {Sculpture}=await import('../lib/quest-preview/world.ts');const {roof}=await import('../lib/quest-preview/scenes/kit.ts');
 const g=new Sculpture();roof(g,0,3,0,5,4,MATERIAL.snow,1.2);
 let faces=0;for(let i=0;i<g.values.length;i+=24)if(g.values[i+6]===MATERIAL.snow){assert.ok(g.values[i+4]>0);faces++;}
 assert.equal(faces,6);
});

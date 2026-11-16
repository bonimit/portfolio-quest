import test from 'node:test';
import assert from 'node:assert/strict';
import {BROADWAY_SHOWS} from '../lib/quest-preview/broadway-shows.ts';
import {THREE_PATH_STOPS,threePathFromQuery,threePathId,threePathTitle,REVIEW_PLACES} from '../lib/quest-preview/three-path-catalog.ts';
import {makeCultureScene,COAST_ISLANDS,SKI_BOUNDS} from '../lib/quest-preview/culture-scenes.ts';
import {culturePose,placeCulture,CULTURE_PATHS,skiHeight} from '../lib/quest-preview/culture-motion.ts';
import {makeThreePathGeometry} from '../lib/quest-preview/three-path-world.ts';
import {studyModel} from '../lib/quest-preview/study-renderer.ts';
import {STUDY_PET_SPACE} from '../lib/quest-preview/pet-space.ts';
test('Hakuba replaces Niseko in review labels and URLs while old saved links remain usable',()=>{
 const hakuba=threePathFromQuery('place-hakuba','night');assert.equal(hakuba.place,'hokkaido');assert.equal(threePathId(hakuba),'place-hakuba');assert.match(threePathTitle(hakuba),/Hakuba/);assert.doesNotMatch(threePathTitle(hakuba),/Niseko|Hokkaido/);assert.equal(threePathId(threePathFromQuery('place-hokkaido','day')),'place-hakuba');assert.match(REVIEW_PLACES.hokkaido.description,/Alps/);assert.match(REVIEW_PLACES.rockefeller.title,/Times Square.*Broadway/);
});
test('walking figures are absent in every scene while sports participants, riders and lanterns remain',()=>{
 for(const v of THREE_PATH_STOPS){const scene=makeCultureScene(v);assert.ok(scene.actors.every(a=>a.kind!=='visitor'));assert.equal(scene.base.length%24,0);assert.ok(scene.base.every(Number.isFinite));for(const actor of scene.actors){assert.ok(actor.mesh.length>0&&actor.mesh.length%24===0);assert.ok(actor.mesh.every(Number.isFinite));}
  if(v.place==='okinawa'||v.place==='krabi')for(const kind of ['surfer','kayaker','paddler','speedboat'])assert.ok(scene.actors.some(a=>a.kind===kind));
  if(v.place==='hokkaido'){assert.ok(scene.actors.filter(a=>a.kind==='skier').length>=3);assert.ok(scene.actors.some(a=>a.kind==='lift'));}
 }
 const day=makeCultureScene({city:'bangkok',season:'winter',place:'inthanon',light:'day'}),night=makeCultureScene({city:'bangkok',season:'winter',place:'inthanon',light:'night'});assert.equal(day.actors.filter(a=>a.kind==='sky-lantern').length,0);assert.equal(night.actors.filter(a=>a.kind==='sky-lantern').length,10);assert.notDeepEqual(day.base,night.base);
});
function waterTriangles(mesh){const triangles=[];for(let i=0;i<mesh.length;i+=24)if(mesh[i+6]===7)triangles.push([[mesh[i],mesh[i+2]],[mesh[i+8],mesh[i+10]],[mesh[i+16],mesh[i+18]]]);return triangles;}
function contains(triangles,p){return triangles.some(([a,b,c])=>{const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(area)<1e-8)return false;const u=((b[0]-p[0])*(c[1]-p[1])-(b[1]-p[1])*(c[0]-p[0]))/area,v=((c[0]-p[0])*(a[1]-p[1])-(c[1]-p[1])*(a[0]-p[0]))/area;return u>=-.0001&&v>=-.0001&&1-u-v>=-.0001;});}
test('water sports and speedboats remain in the bays and clear the small islands over full loops',()=>{
 const scene=makeCultureScene({city:'tokyo',season:'summer',place:'okinawa',light:'day'}),water=waterTriangles(scene.base);assert.ok(COAST_ISLANDS.length>=7);
 for(const actor of scene.actors.filter(a=>a.kind!=='visitor')){
  const buffer=new Float32Array(actor.mesh);for(let frame=0;frame<160;frame++){const time=frame*.35;placeCulture(buffer,0,actor,time);for(let i=0;i<buffer.length;i+=8){const point=[buffer[i],buffer[i+2]];assert.ok(contains(water,point),`${actor.kind} leaves water at ${point} time ${time}`);for(const [x,z,r]of COAST_ISLANDS)assert.ok(Math.hypot(point[0]-x,point[1]-z)>r*1.2,`${actor.kind} crosses island ${x}, ${z} at ${point}, time ${time}`);}}
 }
});
test('skiers stay over the graded piste and visitors stay outside complete pet clearings',()=>{
 for(const variant of [{city:'tokyo',season:'winter',place:'hokkaido',light:'day'},{city:'nyc',season:'summer',light:'day'}])for(const actor of makeCultureScene(variant).actors){
  if(actor.kind!=='visitor'&&actor.kind!=='skier')continue;const buffer=new Float32Array(actor.mesh);for(let i=0;i<120;i++){placeCulture(buffer,0,actor,i*.4);const pose=culturePose(actor,i*.4);if(actor.kind==='skier')assert.ok(Math.abs(pose.y-skiHeight(pose.z)-.035)<.0001);
   for(let j=0;j<buffer.length;j+=8){const x=buffer[j],z=buffer[j+2];if(actor.kind==='skier')assert.ok(x>=SKI_BOUNDS.left&&x<=SKI_BOUNDS.right&&z>=SKI_BOUNDS.back&&z<=SKI_BOUNDS.front,`Skier leaves piste ${x}, ${z}`);for(const [left,right,back,front]of Object.values(STUDY_PET_SPACE.bounds))assert.ok(Math.hypot(Math.max(left-x,0,x-right),Math.max(back-z,0,z-front))>.7);}
  }
 }
});
test('culture motion changes articulated people and lanterns, and pause holds their exact positions',()=>{
 for(const variant of [{city:'tokyo',season:'summer',place:'okinawa',light:'day'},{city:'tokyo',season:'winter',place:'hokkaido',light:'night'},{city:'bangkok',season:'winter',place:'inthanon',light:'night'}]){
  const model=studyModel(variant),initial=new Float32Array(model.geometry);model.update(2,null,false);assert.notDeepEqual(model.geometry,initial);assert.ok(model.geometry.every(Number.isFinite));model.update(2,null,true);const paused=new Float32Array(model.geometry);model.update(20,null,true);assert.deepEqual(model.geometry,paused);
 }
 assert.ok(CULTURE_PATHS.speedboat.length>20);
});

test('Yi Peng lanterns visibly rise into the sky with gentle lateral drift',()=>{
 const actor=makeCultureScene({city:'bangkok',season:'winter',place:'inthanon',light:'night'}).actors.find(a=>a.kind==='sky-lantern'&&a.phase===.2);assert.ok(actor);const a=culturePose(actor,0),b=culturePose(actor,4);assert.ok(b.y-a.y>1.5);assert.ok(Math.abs(b.x-a.x)>.02);assert.ok(Math.abs(a.x)>6);const mesh=new Float32Array(actor.mesh);placeCulture(mesh,0,actor,4);assert.ok(mesh.every(Number.isFinite));
});

test('Broadway has twelve separated queued taxis and a moving genie clear of the entrances',()=>{
 const actors=makeCultureScene({city:'nyc',season:'summer',light:'night'}).actors,taxis=actors.filter(a=>a.kind==='taxi-queue');assert.equal(taxis.length,12);const genie=actors.find(a=>a.kind==='genie');assert.ok(genie);assert.notEqual(culturePose(genie,0).y,culturePose(genie,1).y);
 const boxes=taxis.map(actor=>{const mesh=new Float32Array(actor.mesh);placeCulture(mesh,0,actor,1);const xs=[],zs=[];for(let i=0;i<mesh.length;i+=8){xs.push(mesh[i]);zs.push(mesh[i+2]);}return {left:Math.min(...xs),right:Math.max(...xs),back:Math.min(...zs),front:Math.max(...zs)};});
 for(const [i,a]of boxes.entries()){assert.ok(a.left>=-7&&a.right<=7&&a.back>=2.925&&a.front<=4.475);assert.ok(a.right< -1.3||a.left>1.3);for(const b of boxes.slice(i+1))assert.ok(a.right<b.left||b.right<a.left||a.front<b.back||b.front<a.back);}
});

test('Broadway musical names are unique across entrances, billboards, marquees and posters',()=>{assert.equal(BROADWAY_SHOWS.length,14);assert.equal(new Set(BROADWAY_SHOWS).size,BROADWAY_SHOWS.length);assert.ok(BROADWAY_SHOWS.includes('ALADDIN'));assert.ok(BROADWAY_SHOWS.includes('WICKED'));assert.ok(BROADWAY_SHOWS.includes('THE LION KING'));assert.equal(BROADWAY_SHOWS.includes('CATS'),false);});

test('hover moves only the selected Broadway lettering and chases its lights; pause restores both',()=>{
 const v={city:'nyc',season:'summer',light:'night'},layers=makeThreePathGeometry(v).layers;let offset=layers.base.length+['banner','curtains','lantern-0','lantern-1','lantern-2'].reduce((n,id)=>n+layers[id].length,0);const ranges=Object.entries(layers).filter(([id])=>id.startsWith('neon-')).map(([id,mesh])=>{const start=offset;offset+=mesh.length;return {id,start,end:offset};});assert.equal(ranges.length,6);
 for(const path of ['concepts','portfolio','world']){const model=studyModel(v),rest=new Float32Array(model.geometry);for(let i=1;i<=8;i++)model.update(i*.1,path,false);for(let i=0;i<layers.base.length;i+=8)if(layers.base[i+6]!==10)assert.deepEqual(model.geometry.slice(i,i+8),rest.slice(i,i+8));
  for(const range of ranges){const before=rest.slice(range.start,range.end),active=model.geometry.slice(range.start,range.end);if(range.id.endsWith(path)){assert.notDeepEqual(active,before);if(range.id.includes('lights')){for(let i=0;i<active.length;i++)if(i%8!==7)assert.equal(active[i],before[i]);assert.ok(active.every((n,i)=>i%8!==7||n>3&&n<5.7));}else for(let i=0;i<active.length;i++)if(i%8>1)assert.equal(active[i],before[i]);}else assert.deepEqual(active,before);}
  model.update(1,path,true);for(const range of ranges)assert.deepEqual(model.geometry.slice(range.start,range.end),rest.slice(range.start,range.end));
 }
});

test('cloud clusters drift and autumn gusts lift leaves; pause freezes both',()=>{
 const v={city:'tokyo',season:'autumn',light:'day'},scene=makeCultureScene(v);assert.equal(scene.actors.filter(a=>a.kind==='wind-leaf').length,24);const leaf=scene.actors.find(a=>a.kind==='wind-leaf');assert.ok(culturePose(leaf,2).x-culturePose(leaf,0).x>2);
 const model=studyModel(v),rest=new Float32Array(model.geometry),cloud=[];for(let i=0;i<rest.length;i+=8)if(rest[i+6]===10)cloud.push(i);assert.ok(cloud.length);model.update(3,null,false);assert.ok(cloud.some(i=>model.geometry[i]!==rest[i]));model.update(3,null,true);const stopped=new Float32Array(model.geometry);model.update(10,null,true);assert.deepEqual(model.geometry,stopped);
});

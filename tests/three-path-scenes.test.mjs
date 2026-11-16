import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {THREE_PATH_STOPS,THREE_PATH_VIEWS,threePathId,stepThreePath,threePathFromQuery} from '../lib/quest-preview/three-path-catalog.ts';
import {SCENE_STOPS} from '../lib/quest-preview/restored/variants.ts';
import {PLACE_IDS} from '../lib/quest-preview/restored/places.ts';
import {makeThreePathGeometry} from '../lib/quest-preview/three-path-world.ts';
import {currentIslandBase} from '../lib/quest-preview/current-island-base.ts';
import {hasBangkokRiver,makeBangkokRiverfront,BANGKOK_RIVER,BANGKOK_RIVER_WIDTH,RIVER_BOATS} from '../lib/quest-preview/bangkok-river.ts';
import {STUDY_ROUTES} from '../lib/quest-preview/study-navigation.ts';
import {worldPalette} from '../lib/quest-preview/palette.ts';
import {studyModel,studyTargets} from '../lib/quest-preview/study-renderer.ts';
import {cityCameraRig,cameraFromRig} from '../lib/quest-preview/city-camera.ts';
const hash=b=>createHash('sha256').update(b).digest('hex');
test('the review includes every current city/season and destination in both day and night',()=>{
 assert.equal(THREE_PATH_STOPS.length,22);assert.equal(THREE_PATH_VIEWS.length,44);
 assert.deepEqual(THREE_PATH_STOPS.filter(v=>!v.place).map(v=>`${v.city}-${v.season}`),SCENE_STOPS.map(v=>`${v.city}-${v.season}`));
 assert.deepEqual(THREE_PATH_STOPS.filter(v=>v.place).map(v=>v.place),PLACE_IDS);
 assert.equal(new Set(THREE_PATH_VIEWS.map(v=>threePathId(v)+v.light)).size,44);
 assert.equal(threePathFromQuery('bogus','bogus').season,'autumn');
});
test('each collection cycles independently, retaining day/night and covering all eleven stops',()=>{
 for(const first of [THREE_PATH_STOPS[0],THREE_PATH_STOPS[11]]){
  let v={...first,light:'night'};const seen=new Set();
  for(let i=0;i<11;i++){seen.add(threePathId(v));v=stepThreePath(v);assert.equal(v.light,'night');assert.equal(!!v.place,!!first.place);}
  assert.equal(seen.size,11);assert.equal(threePathId(v),threePathId(first));assert.equal(threePathId(stepThreePath(stepThreePath(first),-1)),threePathId(first));
 }
});
test('all scenes retain the approved base, three separate architectural destinations and physical hover parts',()=>{
 const base=currentIslandBase(),identities=new Set();
 for(const v of THREE_PATH_STOPS){
  const g=makeThreePathGeometry(v);assert.deepEqual(g.layers.base.slice(0,base.length),base,threePathId(v));
  for(const mesh of Object.values(g.layers)){assert.equal(mesh.length%24,0);assert.ok(mesh.length>0);assert.ok(mesh.every(Number.isFinite));}
  assert.ok(g.bounds.concepts.max[0]<-4.5);assert.ok(g.bounds.portfolio.min[0]>-4&&g.bounds.portfolio.max[0]<4);assert.ok(g.bounds.world.min[0]>3.5);
  assert.ok(g.bounds.concepts.max[1]<=3.6);assert.ok(g.bounds.world.max[1]<6);
  if(v.city==='bangkok')assert.equal([...g.layers.base].filter((n,i)=>i%8===6&&n===18).length,0,threePathId(v)+' has no northern snow');
  identities.add(hash(Buffer.concat([Buffer.from(g.layers.base.buffer),Buffer.from(worldPalette(v).buffer)])));
  const model=studyModel(v),original=new Float32Array(model.geometry);model.update(.1,'world',false);model.update(.2,'world',false);assert.notDeepEqual(model.geometry,original);model.update(.3,null,true);const paused=new Float32Array(model.geometry);model.update(3,null,true);assert.deepEqual(model.geometry,paused);
  const matrix=cameraFromRig(cityCameraRig(v.city,1440,980,0,0,0,0,0,0,'restored',true),1440,980);
  for(const target of Object.values(studyTargets(matrix,1440,980,g.bounds)))assert.ok(Object.values(target).every(Number.isFinite)&&target.width>=44&&target.height>=44);
 }
 assert.equal(identities.size,22);
});
test('the original comparison and source scenes stay preserved after the new island becomes home',()=>{
 const fixture=JSON.parse(readFileSync('tests/fixtures/three-path-comparison-preserved.json'));
 for(const [file,expected]of Object.entries(fixture.files))assert.equal(hash(readFileSync(file)),expected,file);
});

test('Bangkok riverfront spans the island with boats, a temple and a skyline in every Bangkok season',()=>{
 for(const v of THREE_PATH_STOPS){
  const expected=v.city==='bangkok'&&(!v.place||v.place==='canalmarket');assert.equal(hasBangkokRiver(v),expected);
  const mesh=makeBangkokRiverfront(v);assert.equal(mesh.length>0,expected);assert.ok(mesh.every(Number.isFinite));if(!expected)continue;
  const water=[];let high=0,gold=0;for(let i=0;i<mesh.length;i+=8){if(mesh[i+6]===7)water.push([mesh[i],mesh[i+2]]);high=Math.max(high,mesh[i+1]);if(mesh[i+6]===19)gold++;}
  assert.ok(Math.min(...water.map(p=>p[0]))< -12&&Math.max(...water.map(p=>p[0]))>12);assert.ok(BANGKOK_RIVER_WIDTH>=2.5);assert.ok(high>6);assert.ok(gold>100);
 }
});
test('the broad Bangkok river stays behind every walking route, and boats sit within its channel',()=>{
 function distance(a,b,p){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]);}
 const shore=BANGKOK_RIVER_WIDTH/2;
 for(const route of Object.values(STUDY_ROUTES))for(const point of [...route.via,route.door])for(let i=1;i<BANGKOK_RIVER.length;i++)assert.ok(distance(BANGKOK_RIVER[i-1],BANGKOK_RIVER[i],point)>shore+.75);
 assert.equal(RIVER_BOATS.length,3);assert.ok(RIVER_BOATS.some(b=>b.ferry));
 for(const boat of RIVER_BOATS)assert.ok(Math.min(...BANGKOK_RIVER.slice(1).map((b,i)=>distance(BANGKOK_RIVER[i],b,[boat.x,boat.z])))<shore-.5);
});

test('homepage uses the same latest three-path experience as the scene review route',()=>{const home=readFileSync('app/page.tsx','utf8'),review=readFileSync('app/quest-preview/concept-scene/page.tsx','utf8');for(const source of [home,review]){assert.match(source,/SceneStudyExperience/);assert.match(source,/threePathFromQuery/);assert.doesNotMatch(source,/QuestPreviewExperience/);}assert.match(home,/concept-scene\/study.css/);});

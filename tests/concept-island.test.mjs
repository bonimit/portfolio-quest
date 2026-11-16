import test from 'node:test';import assert from 'node:assert/strict';
import {makeWorld} from '../lib/quest-preview/world.ts';
import {PLACES,PLACE_IDS} from '../lib/quest-preview/restored/places.ts';
import {VARIANTS} from '../lib/quest-preview/restored/variants.ts';
import {IslandActors} from '../lib/quest-preview/actors.ts';
import {DestinationTransition,entryPortal} from '../lib/quest-preview/destination-transition.ts';
import {cityCameraMatrix} from '../lib/quest-preview/city-camera.ts';
import {projectBuildings,sceneBuildingPaths} from '../lib/quest-preview/building-interaction.ts';
import {islandPathHref} from '../lib/quest-preview/concept-gallery-layout.ts';
test('gallery is additive in all current and new scenes, with original geometry unchanged',()=>{
 const scenes=[...VARIANTS,...PLACE_IDS.map(place=>({...PLACES[place],place,light:'day'}))];
 for(const scene of scenes){const v={...scene,edition:'restored'},original=makeWorld(v),added=makeWorld({...v,conceptLab:true});assert.deepEqual(added.slice(0,original.length),original);assert.ok(added.length>original.length);assert.ok(added.every(Number.isFinite));assert.ok(added.length/24<25000);}
});
test('third doorway finishes its cinematic approach in each city',()=>{
 for(const city of ['nyc','tokyo','bangkok']){
  const actors=new IslandActors(city,'restored'),journey=new DestinationTransition(city,'restored');actors.navigate('concepts',entryPortal(city,'concepts','restored').speed);journey.start('concepts',actors.poses.guide,actors.entryLength);assert.ok(journey.canCancel);
  let frame;for(let i=0;i<600;i++){const poses=actors.advance(20);frame=journey.advance(20,poses.guide,!!actors.arrived);if(frame.phase==='complete')break;}
  assert.equal(frame.phase,'complete');assert.equal(frame.opacity,0);
 }
});
test('third hit target is projected with the camera and routes to Concept Lab',()=>{
 const v={city:'tokyo',season:'autumn',light:'day',edition:'restored',conceptLab:true};assert.equal(islandPathHref('concepts'),'/concepts');assert.equal(sceneBuildingPaths({...v,conceptLab:false}).length,2);assert.equal(sceneBuildingPaths(v).length,3);
 for(const width of [360,768,1280]){const matrix=cityCameraMatrix('tokyo',width,900,0,0,0,0,0,0,'restored'),targets=projectBuildings(v,matrix,width,900);for(const p of Object.values(targets)){assert.ok(p.width>=44&&p.height>=44);assert.ok(Object.values(p).every(Number.isFinite));}}
});

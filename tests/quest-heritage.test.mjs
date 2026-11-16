import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {HERITAGE_VARIANTS,CLASSIC_VARIANT,EARLIER_STOPS,stepScene,sceneIndex,seasonLabel,variantId} from '../lib/quest-preview/variants.ts';
import {makeWorld} from '../lib/quest-preview/world.ts';
import {makeWorld as recoveredWorld} from '../lib/quest-preview/heritage/world.ts';
import {IslandActors} from '../lib/quest-preview/actors.ts';
import {DestinationTransition,entryPortal} from '../lib/quest-preview/destination-transition.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
test('earlier city geometry, palette and all 22 original fallback assets match their recovery fixture',()=>{
 for(const [p,h] of Object.entries(JSON.parse(read('tests/fixtures/quest-heritage-preserved.json'))))assert.equal(createHash('sha256').update(read(p)).digest('hex'),h,p);
 assert.deepEqual(['nyc','tokyo','bangkok'].map(city=>HERITAGE_VARIANTS.filter(v=>v.city===city).length),[8,8,6]);
 for(const v of HERITAGE_VARIANTS){assert.deepEqual(makeWorld(v),recoveredWorld(v));assert.ok(makeWorld(v).every(Number.isFinite));assert.equal(read('public/quest-preview/'+variantId(v)+'.webp').toString('ascii',0,4),'RIFF');}
 assert.deepEqual([...new Set(HERITAGE_VARIANTS.filter(v=>v.city==='bangkok').map(v=>seasonLabel(v.city,v.season)))],['Monsoon','Summer','Winter · Northern Thai mood']);
});
test('the original collection cycles through the opening island and every earlier city season without losing night mode',()=>{
 assert.equal(EARLIER_STOPS.length,12);let v={...CLASSIC_VARIANT,light:'night'};const seen=[];
 for(let i=0;i<12;i++){seen.push(v.edition==='classic'?'classic':v.city+'-'+v.season);assert.equal(sceneIndex(v),i);assert.equal(v.light,'night');v=stepScene(v);}
 assert.equal(new Set(seen).size,12);assert.deepEqual(v,{...CLASSIC_VARIANT,light:'night'});
 assert.deepEqual(stepScene(CLASSIC_VARIANT,-1),{city:'bangkok',season:'winter',light:'day',edition:'heritage'});
});
test('both destination sequences finish for every restored city-season scene',()=>{
 for(const v of HERITAGE_VARIANTS.filter(v=>v.light==='day'))for(const path of ['portfolio','world']){
  const actors=new IslandActors(v.city,'heritage'),journey=new DestinationTransition(v.city,'heritage');
  actors.navigate(path,entryPortal(v.city,path,'heritage').speed);journey.start(path,actors.poses.guide,actors.entryLength);
  let frame;for(let i=0;i<600;i++){const p=actors.advance(20);frame=journey.advance(20,p.guide,!!actors.arrived);if(frame.phase==='complete')break;}
  assert.equal(frame.phase,'complete');assert.equal(frame.opacity,0);
 }
});

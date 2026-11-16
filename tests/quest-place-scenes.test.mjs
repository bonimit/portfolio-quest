import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeWorld} from '../lib/quest-preview/restored/world.ts';
import {makeWorld as renderedWorld} from '../lib/quest-preview/world.ts';
import {VARIANTS,stepScene,variantId} from '../lib/quest-preview/restored/variants.ts';
import {PLACES,PLACE_IDS} from '../lib/quest-preview/restored/places.ts';
import {IslandActors} from '../lib/quest-preview/actors.ts';
import {DestinationTransition,entryPortal} from '../lib/quest-preview/destination-transition.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
test('all eleven current scenes keep exactly the same geometry after adding new destinations',()=>{
 const before=JSON.parse(read('tests/fixtures/quest-current-city-geometry.json'));
 for(const v of VARIANTS.filter(v=>v.light==='day')){const g=makeWorld(v);assert.equal(createHash('sha256').update(new Uint8Array(g.buffer,g.byteOffset,g.byteLength)).digest('hex'),before[v.city+'-'+v.season]);assert.deepEqual(renderedWorld({...v,edition:'restored'}),g);}
});
test('eleven new places have distinct complete geometry and twenty-two day/night assets',()=>{
 const fingerprints=new Set();
 for(const place of PLACE_IDS){for(const light of ['day','night']){
  const v={...PLACES[place],place,light,edition:'restored'},g=makeWorld(v);assert.ok(g.every(Number.isFinite));assert.ok(g.length/24<24000);assert.deepEqual(renderedWorld(v),g);
  assert.equal(read('public/quest-preview/restored/'+variantId(v)+'.webp').toString('ascii',0,4),'RIFF');
  if(light==='day')fingerprints.add(createHash('sha256').update(new Uint8Array(g.buffer)).digest('hex'));
 }
 }
 assert.equal(fingerprints.size,11);assert.deepEqual(['nyc','tokyo','bangkok'].map(city=>PLACE_IDS.filter(p=>PLACES[p].city===city).length),[4,4,3]);
 let v={...PLACES.okinawa,place:'okinawa',light:'night',edition:'restored'};for(let i=0;i<11;i++)v=stepScene(v);assert.equal(v.place,'okinawa');assert.equal(v.light,'night');
});
test('both cinematic paths complete for every new place and can cancel before entry',()=>{
 for(const place of PLACE_IDS)for(const path of ['portfolio','world']){
  const actors=new IslandActors(PLACES[place].city,'restored'),journey=new DestinationTransition(PLACES[place].city,'restored');actors.navigate(path,entryPortal(PLACES[place].city,path,'restored').speed);journey.start(path,actors.poses.guide,actors.entryLength);assert.equal(journey.canCancel,true);
  let f;for(let i=0;i<600;i++){const poses=actors.advance(20);f=journey.advance(20,poses.guide,!!actors.arrived);if(f.phase==='complete')break;}
  assert.equal(f.phase,'complete');assert.equal(f.opacity,0);
 }
});
test('active preview reuses GPU camera entry, removes arrow glyphs and sizes chat text consistently',()=>{
 const scene=read('components/quest-preview/scene.tsx').toString(),ui=read('components/quest-preview/restored/experience.tsx').toString(),guide=read('components/quest-preview/restored/guide.tsx').toString();
 assert.ok(scene.includes('engine.current?.journey(entry)'));assert.ok(ui.includes('finishImmediately'));assert.ok(ui.includes('Current city &amp; season scenes'));assert.ok(ui.includes('New destination scenes'));
 for(const source of [scene,ui,guide,read('components/quest-preview/restored/scene-controls.tsx').toString()])assert.doesNotMatch(source,/[↗↶↷←→]/);
 assert.ok(guide.includes('aria-label="Send question"><svg aria-hidden="true"'));
 assert.ok(read('app/quest-preview/quest-preview.css').toString().includes('font-size:16px'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {VARIANTS,NEW_VARIANTS,DEFAULT_VARIANT,variantId,stepScene} from '../lib/quest-preview/variants.ts';
import {makeWorld} from '../lib/quest-preview/world.ts';
import {SCENE_BUILDERS,NEW_SCENE_BUILDERS} from '../lib/quest-preview/scenes/index.ts';
import {sceneConfig} from '../lib/quest-preview/scene-config.ts';
import {cityCameraMatrix} from '../lib/quest-preview/city-camera.ts';
const file=p=>readFileSync(new URL('../'+p,import.meta.url));
test('retained scene sources and refreshed original-base fallback images match the regression fixture',()=>{
 const fixture=JSON.parse(file('tests/fixtures/quest-original-scenes-preserved.json'));
 for(const [p,hash]of Object.entries({...fixture.sources,...fixture.assets}))assert.equal(createHash('sha256').update(file(p)).digest('hex'),hash,p);
});
test('both collections retain every city, season and time with distinct assets and builders',()=>{
 assert.equal(VARIANTS.length,22);
 assert.equal(NEW_VARIANTS.length,22);assert.equal(new Set([...VARIANTS,...NEW_VARIANTS].map(variantId)).size,44);
 assert.equal(Object.keys(SCENE_BUILDERS).length,11);assert.equal(Object.keys(NEW_SCENE_BUILDERS).length,11);
 for(const v of VARIANTS){const key=`${v.city}-${v.season}`;assert.notEqual(SCENE_BUILDERS[key],NEW_SCENE_BUILDERS[key]);assert.notDeepEqual(makeWorld(v),makeWorld({...v,edition:'new'}));}
});
test('original collection remains the default and tour navigation preserves the selected collection',()=>{
 assert.equal(DEFAULT_VARIANT.edition,undefined);assert.equal(sceneConfig(DEFAULT_VARIANT).title,'Conservatory garden');
 for(const edition of ['original','new']){let v={...DEFAULT_VARIANT,edition};for(let i=0;i<11;i++){v=stepScene(v);assert.equal(v.edition,edition);}assert.equal(v.city,'nyc');assert.equal(v.season,'spring');}
});
test('new fallback assets and their separate manifest do not replace original files',()=>{
 const original=JSON.parse(file('assets/quest-preview/manifest.json')),added=JSON.parse(file('assets/quest-preview/new-manifest.json'));
 for(const [variants,manifest]of [[VARIANTS,original],[NEW_VARIANTS,added]])for(const v of variants){const p=variantId(v)+'.webp',bytes=file('public/quest-preview/'+p);assert.equal(bytes.length,manifest.files[p]);assert.ok(bytes.length<200000);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(manifest.geometry[`${v.city}-${v.season}`].vertices,makeWorld(v).length/8);}
});
test('previous settled camera angle is shared across cities in either collection',()=>{
 for(const edition of ['original','new'])assert.deepEqual(cityCameraMatrix('nyc',1280,800,0,0,0,0,0,0,edition),cityCameraMatrix('tokyo',1280,800,0,0,0,0,0,0,edition));
});

test('original deep island function matches the actual pre-direction snapshot, not a shallow substitute',async()=>{
 const fixture=JSON.parse(file('tests/fixtures/quest-original-island.json'));
 const source=file('lib/quest-preview/original-island.ts').toString();
 const body=source.slice(source.indexOf('export function')).trimEnd();
 assert.equal(createHash('sha256').update(body).digest('hex'),fixture.bodySha256);
 const {Sculpture}=await import('../lib/quest-preview/world.ts');
 const {originalIsland}=await import('../lib/quest-preview/original-island.ts');
 const g=new Sculpture();originalIsland(g);
 assert.equal(Math.min(...g.values.filter((_,i)=>i%8===1)),fixture.lowestY);
 assert.ok(g.values.every(Number.isFinite));
 for(const edition of ['original','new']){const mesh=makeWorld({...DEFAULT_VARIANT,edition});assert.ok(Array.from(mesh).some((v,i)=>i%8===1&&v<-6.7));}
});

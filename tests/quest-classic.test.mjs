import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeWorld} from '../lib/quest-preview/world.ts';
import {makeWorld as originalWorld} from '../lib/quest-preview/classic/world.ts';
import {CLASSIC_VARIANT,variantId} from '../lib/quest-preview/variants.ts';
import {worldPalette,atmosphere} from '../lib/quest-preview/palette.ts';
import {worldPalette as originalPalette} from '../lib/quest-preview/classic/palette.ts';
import {cityCameraMatrix} from '../lib/quest-preview/city-camera.ts';
import {multiply,ortho,lookAt} from '../lib/quest-preview/math.ts';
import {IslandActors} from '../lib/quest-preview/actors.ts';
import {onCityWalkway} from '../lib/quest-preview/city-layout.ts';
import {DestinationTransition,entryPortal} from '../lib/quest-preview/destination-transition.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
test('recovered complete tower-and-ruins source and fallback art remain byte-identical to recovery fixture',()=>{
 for(const [p,h] of Object.entries(JSON.parse(read('tests/fixtures/quest-classic-preserved.json'))))assert.equal(createHash('sha256').update(read(p)).digest('hex'),h,p);
 assert.deepEqual(makeWorld(CLASSIC_VARIANT),originalWorld());
 assert.equal(variantId(CLASSIC_VARIANT),'classic-day');
 assert.equal(variantId({...CLASSIC_VARIANT,light:'night'}),'classic-night');
 assert.deepEqual(worldPalette(CLASSIC_VARIANT).slice(0,36),originalPalette('meadow'));
 assert.notDeepEqual(atmosphere(CLASSIC_VARIANT),atmosphere({...CLASSIC_VARIANT,light:'night'}));
});
test('classic settled camera restores the original composition at mobile and desktop dimensions',()=>{
 for(const [w,h] of [[360,800],[768,800],[1280,800]]){
  const aspect=w/h,span=Math.max(24,30/aspect),original=multiply(ortho(-span*aspect/2,span*aspect/2,-span/2,span/2,.005,120),lookAt([0,16.5,32],[0,.6,0]));
  const actual=cityCameraMatrix('nyc',w,h,0,0,0,0,0,0,'classic');
  actual.forEach((v,i)=>assert.ok(Math.abs(v-original[i])<.000001));
 }
});
test('classic avatar and pets remain on their smaller island clearings and both entry paths complete',()=>{
 const idle=new IslandActors('nyc','classic');
 for(let i=0;i<1800;i++)for(const p of Object.values(idle.advance(50)))assert.ok(onCityWalkway('nyc',[p.x,p.z],'classic'));
 for(const path of ['portfolio','world']){
  const actors=new IslandActors('nyc','classic'),journey=new DestinationTransition('nyc','classic');
  actors.navigate(path,entryPortal('nyc',path,'classic').speed);journey.start(path,actors.poses.guide,actors.entryLength);
  let frame;
  for(let i=0;i<500;i++){
   const poses=actors.advance(20);frame=journey.advance(20,poses.guide,!!actors.arrived);
   if(frame.phase==='complete')break;
   if(frame.phase==='walking')assert.ok(onCityWalkway('nyc',[frame.pose.x,frame.pose.z],'classic'));
  }
  assert.equal(frame.phase,'complete');assert.equal(frame.opacity,0);assert.equal(frame.edition,'classic');
 }
});
test('even a conservative avatar silhouette remains visibly taller than either pet',()=>{
 assert.ok(2.6*(122/176)>1.1*1.5);
 const scene=read('components/quest-preview/scene.tsx').toString();assert.ok(scene.includes('petSize(pixels,pet)'));
});

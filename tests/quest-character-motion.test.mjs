import test from 'node:test';
import assert from 'node:assert/strict';
import {petSize,motionDelta,travelFacing} from '../lib/quest-preview/character-motion.ts';
import {cameraPreview} from '../lib/quest-preview/camera-preview.ts';
import {IslandActors,samplePath} from '../lib/quest-preview/actors.ts';

test('approved size changes compound the current sizes; camera zoom stays unchanged',()=>{
  assert.equal(cameraPreview('').avatar,1.25*1.2);
  assert.equal(cameraPreview('').zoom,1.1);
  for(const pixels of [0,5,20,60,200])assert.equal(petSize(pixels),Math.max(8,Math.min(128,pixels*1.1))*1.15*1.3);
});
test('facing remains stable near forward and backward travel, then changes at a real turn',()=>{
  for(const angle of [0,.05,-.05,Math.PI,Math.PI+.05]){
    assert.equal(travelFacing(angle,'left'),'left');
    assert.equal(travelFacing(angle,'right'),'right');
  }
  assert.equal(travelFacing(-Math.PI/2,'right'),'left');
  assert.equal(travelFacing(Math.PI/2,'left'),'right');
});
test('display-frame motion preserves 60/120Hz steps and bounds stalled-frame jumps',()=>{
  for(const delta of [8.33,16.67,33.33])assert.equal(motionDelta(delta,true),delta);
  assert.equal(motionDelta(1000,true),50);
  assert.equal(motionDelta(4500,false),4500);
  assert.equal(motionDelta(-10,true),0);
});
test('repeated waypoint does not introduce a spurious facing at the start of a route',()=>{
  assert.equal(samplePath([[0,0],[0,0],[-2,0]],0).angle,-Math.PI/2);
});
test('both restored paths keep smooth, monotonic travel at display-frame cadence in each city',()=>{
  for(const city of ['nyc','tokyo','bangkok'])for(const path of ['portfolio','world']){
    const actors=new IslandActors(city,'restored');actors.navigate(path,3.8);
    let old=actors.poses.guide;
    for(let ms=0;ms<15000&&!actors.arrived;ms+=1000/60){
      const pose=actors.advance(1000/60).guide;
      assert.ok(pose.distance>=old.distance);
      assert.ok(Math.hypot(pose.x-old.x,pose.z-old.z)<.09);
      old=pose;
    }
    assert.equal(actors.arrived,path);
  }
});

test('species have distinct proportions before the common fifteen percent boost',()=>{
 for(const pixels of [5,25,60,200]){
  const base=Math.max(8,Math.min(128,pixels*1.1));
  const scales={capybara:1.3,kitsune:1.05,sloth:.9*1.25,frenchie:.75*1.25,cat:.65*1.25};
  for(const [pet,scale]of Object.entries(scales))assert.equal(petSize(pixels,pet),base*1.15*scale);
  assert.ok(petSize(pixels,'capybara')>petSize(pixels,'kitsune'));
  assert.ok(petSize(pixels,'sloth')>petSize(pixels,'cat'));
  assert.ok(petSize(pixels,'frenchie')>petSize(pixels,'cat'));
 }
});

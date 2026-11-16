import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASSISTANT_ATLAS } from '../lib/guide/assistant-atlas.ts';
import { avatarClips, sampleClip, walkFrame, turnFrames, travelProgress, travelKeyframes } from '../lib/guide/assistant-motion.ts';
import { wanderTarget } from '../lib/guide/walking.ts';
const groups=ASSISTANT_ATLAS.groups;

test('every published cue references an extracted frame and has a positive hold',()=>{
  const total=Object.values(groups).flat().length;
  assert.equal(total,42);
  for(const clip of Object.values(avatarClips)) for(const cue of clip.cues) { assert.ok(cue.frame>=0 && cue.frame<total); assert.ok(cue.duration>=100); }
});
test('clip timing uses elapsed time, holds the last one-shot pose, and loops exactly',()=>{
  const cues=[{frame:2,duration:100},{frame:7,duration:200}];
  assert.equal(sampleClip(cues,99,true).frame,2);
  assert.equal(sampleClip(cues,100,true).frame,7);
  assert.deepEqual(sampleClip(cues,300,false),{frame:7,remaining:0,done:true});
  assert.equal(sampleClip(cues,300,true).frame,2);
  assert.equal(sampleClip(cues,30300,true).frame,2);
  assert.throws(()=>sampleClip([],0,true));
});
test('walk frames follow distance rather than an independent time loop',()=>{
  for(const facing of ['left','right']) {
    const samples=Array.from({length:36},(_,distance)=>walkFrame(facing,distance));
    assert.ok(new Set(samples).size>=6);
    assert.equal(walkFrame(facing,0),walkFrame(facing,36));
    assert.equal(walkFrame(facing,0),walkFrame(facing,-10));
    const allowed=groups[`walk-${facing}`];
    samples.forEach(frame=>assert.ok(allowed.includes(frame)));
  }
});
test('turns bridge facing changes with real orientation frames',()=>{
  assert.deepEqual(turnFrames('front','front'),[]);
  assert.deepEqual(turnFrames('right','left').map(cue=>cue.frame),[groups.turn[1],groups.turn[2],groups.turn[3]]);
  assert.equal(turnFrames('left','front').at(-1).frame,groups.turn[0]);
  assert.equal(turnFrames('back','front').length,3);
});
test('speech and greeting stay front-facing instead of looping through back poses',()=>{
  const back=new Set([...groups['idle-back'],groups.turn[2],groups.talking[2]]);
  for(const pose of ['talking','happy','wave','thinking']) for(const cue of avatarClips[pose].cues) assert.ok(!back.has(cue.frame));
  for(const pose of ['talking','wave','thinking','happy']) assert.ok(new Set(avatarClips[pose].cues.map(cue=>cue.frame)).size>=2);
});
test('acceleration and braking are monotonic and bounded at mobile/desktop distances',()=>{
  for(const duration of [1200,2400,6500]) {
    assert.equal(travelProgress(0,duration),0);assert.equal(travelProgress(duration,duration),1);
    assert.ok(Math.abs(travelProgress(duration/2,duration)-.5)<1e-9);
    let previous=0;
    for(let t=0;t<=duration;t+=10){const next=travelProgress(t,duration);assert.ok(next>=previous && next<=1);previous=next;}
    assert.ok(travelProgress(40,duration)<40/duration);
    for(const width of [320,360,768,1280,2560]) {
      const stage=Math.min(width,480),from=16,to=wanderTarget(stage,96,1);
      for(const frame of travelKeyframes(from,to,duration)){
        const x=Number(frame.transform.match(/\(([-\d.]+)px/)[1]);assert.ok(x>=0 && x<=stage-96);
      }
    }
  }
});
test('source map records irregular crops and shared feet without stretched runtime frames',()=>{
  const map=JSON.parse(readFileSync(new URL('../assets/guide/frame-map.json',import.meta.url)));
  assert.equal(map.frames.length,42);assert.equal(map.footAnchor[1],160);
  assert.ok(new Set(map.frames.map(frame=>frame.sourceRegion[2]-frame.sourceRegion[0])).size>5);
  for(const frame of map.frames){ assert.equal(frame.outputFootY,160);assert.equal(frame.outputBounds[3],160);assert.ok(frame.outputBounds[0]>0 && frame.outputBounds[2]<map.cell[0]); }
});

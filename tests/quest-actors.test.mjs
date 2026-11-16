import test from 'node:test';
import assert from 'node:assert/strict';
import {IslandActors,ENTRY_SPEED,ENTRY_TURN_MS,DESTINATIONS,GUIDE_HOME,pathLength,samplePath,onIsland,mayPrompt,canWalkEntry} from '../lib/quest-preview/actors.ts';
import {ORIGINAL_LAYOUT} from '../lib/quest-preview/city-layout.ts';
import {getLocalGuideAnswer} from '../lib/guide/local-guide.ts';
import {PET_SPRITES,PET_IDS,petFrame} from '../lib/quest-preview/pet-sprites.ts';
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {guideGait} from '../lib/quest-preview/guide-gait.ts';
import {walkFrame} from '../lib/guide/assistant-motion.ts';
import {guideScale,worldPixelsPerUnit} from '../lib/quest-preview/math.ts';

test('guide scale follows the world camera and stays bounded on narrow and wide screens',()=>{
  assert.ok(guideScale(worldPixelsPerUnit(320,320))>=.2);
  assert.ok(guideScale(worldPixelsPerUnit(2560,1200))>1);
  for(const pixels of [4,8,12,20,36,60,120]){
    const petHeight=Math.max(8,Math.min(128,pixels*1.1));
    assert.ok(110*guideScale(pixels)>=petHeight*1.5,`Guide must be larger than pets at ${pixels}px per world unit`);
  }
  const desktop=guideScale(worldPixelsPerUnit(1280,632));assert.ok(desktop>.6&&desktop<=1.1);
});

test('path sampling follows distance through bends and clamps at both ends',()=>{
  const p=[[0,0],[3,0],[3,4]];
  assert.equal(pathLength(p),7);assert.equal(samplePath(p,3/7).x,3);assert.equal(samplePath(p,5/7).z,2);
  assert.equal(samplePath(p,-2).x,0);assert.equal(samplePath(p,5).z,4);
});
test('both destination walks follow the full fork and report arrival only at the entrance',()=>{
  for(const path of ['portfolio','world']){
    const simulation=new IslandActors();simulation.navigate(path);
    simulation.holdGuide(true);assert.equal(simulation.wait,0,'hover must not stall an active entry walk');
    assert.equal(simulation.poses.guide.preparing,true);
    simulation.advance(200);assert.equal(simulation.poses.guide.walking,false);
    assert.equal(simulation.poses.guide.z,GUIDE_HOME[1]);
    const mid=simulation.advance(600).guide;
    assert.ok(mid.walking);assert.ok(mid.z<GUIDE_HOME[1]);assert.ok(onIsland([mid.x,mid.z]));
    assert.equal(simulation.arrived,null);
    let elapsed=800;
    while(!simulation.arrived&&elapsed<12000){simulation.advance(50);elapsed+=50;}
    const end=simulation.poses.guide;
    assert.equal(simulation.arrived,path);assert.ok(elapsed>4500&&elapsed<9000);
    assert.ok(Math.abs(end.x-DESTINATIONS[path][0])<.00001);assert.ok(Math.abs(end.z-DESTINATIONS[path][1])<.00001);
    assert.ok(end.x*(path==='portfolio'?-1:1)>0);assert.ok(end.z<GUIDE_HOME[1]);
    assert.ok(end.distance>10);assert.ok(onIsland([end.x,end.z]));
    assert.equal(end.walking,false);assert.equal(end.preparing,false);
  }
});
test('cancellation stops the guide in place instead of continuing toward a stale destination',()=>{
  const simulation=new IslandActors();simulation.navigate('portfolio');simulation.advance(800);
  const before=simulation.poses.guide;simulation.cancel();simulation.advance(1000);
  assert.equal(simulation.poses.guide.x,before.x);assert.equal(simulation.poses.guide.z,before.z);assert.equal(simulation.poses.guide.walking,false);
  assert.equal(simulation.arrived,null);
  simulation.navigate('world');simulation.advance(12000);
  const end=simulation.poses.guide;
  assert.ok(Math.hypot(end.x-DESTINATIONS.world[0],end.z-DESTINATIONS.world[1])<Math.hypot(before.x-DESTINATIONS.world[0],before.z-DESTINATIONS.world[1]));
});
test('guide focus can hold it still while the two pets wander independently',()=>{
  const simulation=new IslandActors(),initial=simulation.poses;simulation.holdGuide(true);
  let restingFrames=0;
  for(let i=0;i<240;i++){simulation.advance(50);if(simulation.wait>0)restingFrames++;}
  assert.equal(simulation.poses.guide.x,initial.guide.x);assert.equal(simulation.poses.guide.z,initial.guide.z);
  assert.notDeepEqual(simulation.poses.capybara,initial.capybara);assert.notDeepEqual(simulation.poses.cat,initial.cat);
  assert.ok(restingFrames>0,'rest periods should allow the RAF driver to sleep');
});
test('all actors remain inside the enlarged terrain through repeated wander cycles',()=>{
  const a=new IslandActors(),b=new IslandActors();
  for(let i=0;i<2400;i++){
    const poses=a.advance(50);assert.deepEqual(poses,b.advance(50));
    for(const pose of Object.values(poses)){
      assert.ok(onIsland([pose.x,pose.z]));assert.ok(Number.isFinite(pose.angle));assert.ok(pose.distance>=0);
    }
  }
});
test('illustrated fallback can freeze pets without disabling guide movement',()=>{
  const simulation=new IslandActors();simulation.animatePets(false);const before=simulation.poses;
  for(let i=0;i<200;i++)simulation.advance(50);
  assert.deepEqual(simulation.poses.capybara,before.capybara);assert.deepEqual(simulation.poses.cat,before.cat);
  assert.notDeepEqual(simulation.poses.guide,before.guide);
});
test('reference pet maps use only measured walking frames and rest on frame zero',()=>{
  for(const pet of PET_IDS){
    const data=PET_SPRITES[pet],pose={x:0,z:0,angle:0,walking:false,preparing:false,distance:0};
    assert.equal(petFrame(pet,pose),0);
    for(let step=0;step<32;step++)assert.equal(petFrame(pet,{...pose,walking:true,distance:(step+.01)*data.stride/4}),data.walk[step%4]);
    assert.ok(data.walk.every(frame=>frame>=3&&frame<data.frames));
    assert.equal(petFrame(pet,{...pose,distance:100}),0);
  }
});
test('packed reference atlases retain transparent borders, bounded tiles and common feet',async()=>{
  const manifest=JSON.parse(readFileSync(new URL('../assets/quest-preview/pet-reference-manifest.json',import.meta.url)));
  for(const pet of PET_IDS){
    const data=PET_SPRITES[pet],entry=manifest.pets[pet],file=readFileSync(new URL('../public'+data.src,import.meta.url));
    assert.equal(entry.frames.length,data.frames);assert.equal(entry.bytes,file.length);assert.ok(file.length<200000);
    const {data:pixels,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(info.width,1280);assert.equal(info.height,512);
    for(let i=0;i<data.frames;i++){
      const frame=entry.frames[i];assert.match(frame.sha256,/^[a-f0-9]{64}$/);assert.ok(frame.width>0&&frame.height>0);
      let bottom=-1,left=256,right=0;
      for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(pixels[((Math.floor(i/5)*256+y)*1280+(i%5)*256+x)*4+3]>16){bottom=y;left=Math.min(left,x);right=Math.max(right,x);}
      assert.equal(bottom,247,pet+' '+i);assert.ok(left>=8&&right<256,pet+' '+i);
    }
  }
});
test('idle prompt waits ten seconds and is suppressed during editing, navigation or invisibility',()=>{
  const context={shown:false,hidden:false,busy:false,editing:false,visible:true};
  assert.equal(mayPrompt(context,9999),false);assert.equal(mayPrompt(context,10000),true);
  for(const key of ['shown','hidden','busy','editing'])assert.equal(mayPrompt({...context,[key]:true}),false);
  assert.equal(mayPrompt({...context,visible:false}),false);
});
test('modified clicks, pause and reduced motion retain immediate native navigation',()=>{
  const e={defaultPrevented:false,button:0,metaKey:false,ctrlKey:false,altKey:false,shiftKey:false};
  assert.equal(canWalkEntry(e,false,false),true);
  for(const key of ['defaultPrevented','metaKey','ctrlKey','altKey','shiftKey'])assert.equal(canWalkEntry({...e,[key]:true},false,false),false);
  assert.equal(canWalkEntry({...e,button:1},false,false),false);
  assert.equal(canWalkEntry(e,true,false),false);assert.equal(canWalkEntry(e,false,true),false);
});

test('full entry duration follows route length and cancellation clears arrival',()=>{
  const a=new IslandActors();a.navigate('portfolio');
  const length=pathLength([GUIDE_HOME,...ORIGINAL_LAYOUT.entries.portfolio.via,DESTINATIONS.portfolio]);
  const duration=length/ENTRY_SPEED*1000+ENTRY_TURN_MS;
  a.advance(duration-1);assert.equal(a.arrived,null);assert.ok(a.poses.guide.walking);
  a.advance(1);assert.equal(a.arrived,'portfolio');
  a.cancel();assert.equal(a.arrived,null);a.advance(1000);assert.equal(a.arrived,null);
});

test('compact companion examples produce useful honest answers',()=>{
  assert.equal(getLocalGuideAnswer('Help me choose').id,'choose');
  const answer=getLocalGuideAnswer('Is Adventure playable?');
  assert.equal(answer.id,'adventure');assert.match(answer.text,/three playable prototype demos/);assert.match(answer.text,/not a roaming RPG/);
  assert.equal(answer.avatarCue,'idle-front');
});

test('preview jogging cadence is distance-based, slower, bounded and unaffected by camera scale',()=>{
  const pose={x:0,z:0,angle:1,walking:true,preparing:false,distance:0};
  const start=guideGait(pose,.65,true);
  const cycle=guideGait({...pose,distance:2.4},.65,true);
  assert.equal(walkFrame('right',start.distance),walkFrame('right',cycle.distance));
  assert.equal(guideGait({...pose,distance:.5},.24,true).distance,guideGait({...pose,distance:.5},.65,true).distance);
  for(let i=0;i<40;i++){
    const gait=guideGait({...pose,distance:i*.07},.65,true);assert.ok(gait.bob>=-1.951&&gait.bob<=0);assert.equal(gait.lean,3);
  }
  assert.equal(guideGait({...pose,walking:false},.65,true).bob,0);
  assert.equal(guideGait(pose,.65,false).lean,0);
});

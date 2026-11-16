import test from 'node:test';
import assert from 'node:assert/strict';
import {DestinationTransition,ENTRY_PORTALS,ENTRY_TIMING,entryPortal} from '../lib/quest-preview/destination-transition.ts';
import {IslandActors} from '../lib/quest-preview/actors.ts';
import {CITY_IDS} from '../lib/quest-preview/variants.ts';
import {onCityWalkway,CITY_LAYOUTS} from '../lib/quest-preview/city-layout.ts';
import {cityCameraRig,cameraFromRig,destinationCamera,blendRig} from '../lib/quest-preview/city-camera.ts';
import {project} from '../lib/quest-preview/math.ts';
import {GUIDE_HEIGHT} from '../lib/quest-preview/journey-drawing.ts';

function start(city,path,edition='new'){const actors=new IslandActors(city,edition),journey=new DestinationTransition(city,edition);actors.navigate(path,entryPortal(city,path,edition).speed);assert.ok(journey.start(path,actors.poses.guide,actors.entryLength));return {actors,journey};}
test('all six entries use the full ordered state machine and commit only after disappearance',()=>{
 for(const city of CITY_IDS)for(const path of ['portfolio','world']){
  const {actors,journey}=start(city,path),phases=[];let f,time=0;
  while(time<8000){time+=20;const p=actors.advance(20).guide;f=journey.advance(20,p,!!actors.arrived);
   if(phases.at(-1)!==f.phase)phases.push(f.phase);
   if(['turning','walking','aligning'].includes(f.phase))assert.ok(onCityWalkway(city,[f.pose.x,f.pose.z],'new'));
   if(f.phase==='committing')assert.equal(f.opacity,0);
   if(f.phase==='complete')break;
  }
  assert.deepEqual(phases,['turning','walking','aligning','entering','committing','complete']);
  assert.ok(time>=3000&&time<6500,`${city}/${path}: ${time}ms`);
  assert.equal(f.opacity,0);assert.equal(f.push,1);assert.equal(f.entry,1);
  assert.equal(f.floorY,ENTRY_PORTALS[city][path].inside[1]);
  assert.ok(Math.hypot(f.pose.x-ENTRY_PORTALS[city][path].inside[0],f.pose.z-ENTRY_PORTALS[city][path].inside[2])<1e-8);
 }
});
test('duplicate starts are rejected; cancellation works until entry and permits a fresh selection',()=>{
 for(const city of CITY_IDS)for(const path of ['portfolio','world']){
  const {actors,journey}=start(city,path);assert.equal(journey.start(path,actors.poses.guide,1),false);
  assert.equal(journey.canCancel,true);assert.equal(journey.cancel(),true);assert.equal(journey.active,false);
  assert.ok(journey.start(path,actors.poses.guide,actors.entryLength));
  let f;for(let t=0;t<8000;t+=20){f=journey.advance(20,actors.advance(20).guide,!!actors.arrived);if(f.phase==='entering')break;}
  assert.equal(f.phase,'entering');assert.equal(journey.canCancel,false);assert.equal(journey.cancel(),false);
 }
});
test('camera starts exactly at the current city/orbit view and frames the visible avatar on desktop and mobile',()=>{
 for(const city of CITY_IDS)for(const path of ['portfolio','world'])for(const [w,h]of [[360,520],[768,620],[1280,650]])for(const yaw of [-.5,0,.5]){
  const {actors,journey}=start(city,path),base=cityCameraRig(city,w,h,-.5,.2,0,yaw,.04,0,'new');
  const first=journey.advance(0,actors.poses.guide,false);assert.deepEqual(destinationCamera(base,first,w,h),base);
  let previous=null;
  for(let t=0;t<7000;t+=20){const f=journey.advance(20,actors.advance(20).guide,!!actors.arrived),rig=destinationCamera(base,f,w,h),m=cameraFromRig(rig,w,h);
   assert.ok([...m].every(Number.isFinite));
   if(f.opacity>.12){
    const foot=project(m,[f.pose.x,f.floorY,f.pose.z],w,h),head=project(m,[f.pose.x,f.floorY+GUIDE_HEIGHT,f.pose.z],w,h);
    assert.ok(foot.x>0&&foot.x<w&&foot.y>0&&foot.y<h&&head.y>0&&head.y<h,`${city}/${path}/${w}/${yaw}/${f.phase}: ${JSON.stringify({foot,head})}`);
    if(previous)assert.ok(Math.hypot(foot.x-previous.x,foot.y-previous.y)<Math.max(w,h)*.06,'continuous framing');
    previous=foot;
   }
   if(f.phase==='complete')break;
  }
 }
});
test('final world-space portal covers the viewport before route handoff',()=>{
 for(const city of CITY_IDS)for(const path of ['portfolio','world'])for(const [w,h]of [[360,520],[1280,650]]){
  const {actors,journey}=start(city,path);let f;for(let t=0;t<8000;t+=20){f=journey.advance(20,actors.advance(20).guide,!!actors.arrived);if(f.phase==='complete')break;}
  const p=ENTRY_PORTALS[city][path],m=cameraFromRig(destinationCamera(cityCameraRig(city,w,h),f,w,h),w,h);
  const points=[[-.5,0],[.5,0],[-.5,1],[.5,1]].map(([x,y])=>project(m,p.stairs?[p.point[0]+x*p.width,p.point[1]+.015,p.point[2]+(y-.5)*p.height]:[p.point[0]+x*p.width,p.point[1]+y*p.height,p.point[2]+.015],w,h));
  assert.ok(Math.min(...points.map(p=>p.x))<0&&Math.max(...points.map(p=>p.x))>w);
  assert.ok(Math.min(...points.map(p=>p.y))<0&&Math.max(...points.map(p=>p.y))>h);
 }
});
test('camera return uses a bounded interpolation without moving the stopped avatar',()=>{
 const base=cityCameraRig('tokyo',1280,650),b=blendRig(base,{...base,target:[6,1.5,.2],span:7},.6);
 assert.deepEqual(blendRig(b,base,0),b);assert.deepEqual(blendRig(b,base,1),base);assert.ok(ENTRY_TIMING.return<800);
});
test('door geometry and camera destinations are explicitly distinct per city and path',()=>{
 assert.equal(new Set(CITY_IDS.flatMap(city=>['portfolio','world'].map(path=>JSON.stringify(ENTRY_PORTALS[city][path])))).size,6);
 for(const city of CITY_IDS)for(const path of ['portfolio','world']){
  const p=ENTRY_PORTALS[city][path],e=CITY_LAYOUTS[city].entries[path];assert.equal(p.point[0],e.door[0]);assert.ok(p.inside[2]<e.door[1]);
 }
});

test('preserved original islands support both doorway transitions in every city',()=>{
 for(const city of CITY_IDS)for(const path of ['portfolio','world']){
  const {actors,journey}=start(city,path,'original');let f;
  for(let t=0;t<8000;t+=20){f=journey.advance(20,actors.advance(20).guide,!!actors.arrived);if(['turning','walking','aligning'].includes(f.phase))assert.ok(onCityWalkway(city,[f.pose.x,f.pose.z],'original'));if(f.phase==='complete')break;}
  assert.equal(f.phase,'complete');assert.equal(f.edition,'original');assert.equal(f.opacity,0);
 }
});

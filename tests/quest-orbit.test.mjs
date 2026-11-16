import test from 'node:test';
import assert from 'node:assert/strict';
import {Sculpture,MATERIAL} from '../lib/quest-preview/world.ts';
import {addClouds} from '../lib/quest-preview/clouds.ts';
import {MapOrbit,ORBIT_LIMITS,boundedOrbit,orbitFit} from '../lib/quest-preview/map-orbit.ts';
import {cameraMatrix,project,multiply,ortho,lookAt} from '../lib/quest-preview/math.ts';
import {projectBuildings} from '../lib/quest-preview/building-interaction.ts';
import {cityCameraMatrix} from '../lib/quest-preview/city-camera.ts';
import {VARIANTS,NEW_VARIANTS} from '../lib/quest-preview/variants.ts';

test('drag threshold, pointer identity and click-versus-drag completion stay distinct',()=>{
 const o=new MapOrbit();assert.equal(o.begin(1,100,100),true);assert.equal(o.begin(2,0,0),false);
 assert.equal(o.move(2,300,100,900,500),null);assert.equal(o.move(1,104,100,900,500),null);
 assert.equal(o.end(2),false);assert.equal(o.end(1),false);assert.equal(o.dragging,false);
 o.begin(3,100,100);const moved=o.move(3,240,130,900,500);assert.ok(moved.yaw>0&&moved.pitch<0);assert.equal(o.end(3),true);
});
test('touch vertical scroll does not rotate or consume the gesture, horizontal swipe rotates without tilt',()=>{
 const o=new MapOrbit();o.begin(1,100,100,true);assert.equal(o.move(1,104,150,390,300),null);assert.equal(o.end(1),false);
 o.begin(2,100,100,true);const moved=o.move(2,220,120,390,300);assert.ok(moved.yaw>0);assert.equal(moved.pitch,0);
});
test('orbit limits, cancel rollback and reset are deterministic and finite',()=>{
 const o=new MapOrbit();o.set(.3,.05);o.begin(1,0,0);o.move(1,2000,-2000,400,300);
 assert.deepEqual({yaw:o.yaw,pitch:o.pitch},{yaw:ORBIT_LIMITS.yaw,pitch:ORBIT_LIMITS.pitchMax});
 assert.deepEqual(o.cancel(),{yaw:.3,pitch:.05});assert.equal(o.pointerId,null);
 assert.deepEqual(o.reset(),{yaw:0,pitch:0});assert.deepEqual(boundedOrbit(Infinity,NaN),{yaw:0,pitch:0});
 assert.equal(orbitFit(0,0),1);assert.ok(orbitFit(ORBIT_LIMITS.yaw,ORBIT_LIMITS.pitchMax)<1.35);
});
test('default camera remains byte-identical to the existing illustration projection',()=>{
 for(const [w,h]of [[390,800],[1440,980],[2560,800]]){
  const aspect=Math.max(.2,w/h),span=Math.max(20,34/aspect);
  assert.deepEqual(cameraMatrix(w,h),multiply(ortho(-span*aspect/2,span*aspect/2,-span/2+1,span/2+1,.1,120),lookAt([0,16.5,32],[0,.6,0])));
 }
});
test('rotated projections keep destination targets separate and in bounds across city/season/viewport combinations',()=>{
 for(const width of [320,390,768,1024,1440,2560])for(const height of [320,800])for(const yaw of [-ORBIT_LIMITS.yaw,0,ORBIT_LIMITS.yaw])for(const pitch of [ORBIT_LIMITS.pitchMin,0,ORBIT_LIMITS.pitchMax])for(const v of [...VARIANTS,...NEW_VARIANTS].filter(v=>v.light==='day')){
  const matrix=cityCameraMatrix(v.city,width,height,0,0,0,yaw,pitch,0,v.edition),{portfolio:a,world:b}=projectBuildings(v,matrix,width,height);
  for(const p of [a,b])assert.ok(p.left>=0&&p.top>=0&&p.left+p.width<=width&&p.top+p.height<=height,JSON.stringify({width,height,yaw,pitch,p}));
  assert.ok(a.left+a.width<=b.left,`Overlapping destinations: ${width}×${height}, yaw ${yaw}`);
  const guide=project(matrix,[0,.4,8.6],width,height);assert.ok(guide.x>0&&guide.x<width&&guide.y>0&&guide.y<height);
 }
});

test('complete cloud silhouettes stay framed at the extreme orbit angles and short heights',()=>{
 const g=new Sculpture();addClouds(g,MATERIAL.cloud);
 for(const w of [320,768,1440,2560])for(const h of [320,800])for(const yaw of [-ORBIT_LIMITS.yaw,0,ORBIT_LIMITS.yaw])for(const pitch of [ORBIT_LIMITS.pitchMin,ORBIT_LIMITS.pitchMax])for(const focus of [-.9,.9]){
  const matrix=cameraMatrix(w,h,focus,0,0,yaw,pitch);
  for(let i=0;i<g.values.length;i+=8){const point=g.values.slice(i,i+3);point[0]+=.12;point[1]+=.035;const p=project(matrix,point,w,h);assert.ok(p.x>0&&p.x<w&&p.y>0&&p.y<h);}
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {IslandActors} from '../lib/quest-preview/actors.ts';
import {DestinationTransition} from '../lib/quest-preview/destination-transition.ts';
import {STUDY_ROUTES,STUDY_PORTALS} from '../lib/quest-preview/study-navigation.ts';
import {cityCameraRig,destinationCamera} from '../lib/quest-preview/city-camera.ts';
import {projectedTravelFacing,depthStride} from '../lib/quest-preview/depth-walk.ts';
import {project} from '../lib/quest-preview/math.ts';
import {cameraFromRig} from '../lib/quest-preview/city-camera.ts';
for(const path of ['portfolio','concepts','world'])test(`study ${path} follows its authored path, enters its own doorway and zooms`,()=>{
 const actors=new IslandActors('tokyo','restored',STUDY_ROUTES),journey=new DestinationTransition('tokyo','restored',STUDY_PORTALS);
 actors.navigate(path,STUDY_PORTALS[path].speed);journey.start(path,actors.poses.guide,actors.entryLength);
 const base=cityCameraRig('tokyo',1440,980,0,0,0,0,0,0,'restored');
 let frame,walked=0,previous=actors.poses.guide;
 for(let tick=0;tick<1200;tick++){
  const poses=actors.advance(20);frame=journey.advance(20,poses.guide,!!actors.arrived);
  if(frame.phase==='walking'){
   walked++;assert.ok(Math.hypot(poses.guide.x-previous.x,poses.guide.z-previous.z)<.15);
   const x=poses.guide.x,z=poses.guide.z;
   // Every authored stone segment or the existing foreground clearing.
   const nodes=[...STUDY_ROUTES[path].via,STUDY_ROUTES[path].door];
   const onPath=nodes.slice(1).some((b,i)=>{const a=nodes[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<.6;});
   assert.ok(z>=6.3||onPath,`${path}: ${x},${z}`);
  }
  const camera=destinationCamera(base,frame,1440,980,true,STUDY_PORTALS[path]);assert.ok(camera.span>0&&Number.isFinite(camera.span));
  previous=poses.guide;if(frame.phase==='complete')break;
 }
 assert.ok(walked>10);assert.equal(frame.phase,'complete');assert.equal(frame.opacity,0);
 assert.equal(frame.pose.x,STUDY_PORTALS[path].inside[0]);assert.equal(frame.pose.z,STUDY_PORTALS[path].inside[2]);
 assert.ok(destinationCamera(base,frame,1440,980,true,STUDY_PORTALS[path]).span<base.span/10);
});
test('study cancellation prevents arrival and retraces the authored approach',()=>{
 const actors=new IslandActors('tokyo','restored',STUDY_ROUTES),journey=new DestinationTransition('tokyo','restored',STUDY_PORTALS);
 actors.navigate('world',3.8);journey.start('world',actors.poses.guide,actors.entryLength);
 for(let i=0;i<80;i++){const pose=actors.advance(20);journey.advance(20,pose.guide,false);}
 assert.equal(journey.cancel(),true);actors.cancel();assert.equal(actors.arrived,null);assert.equal(journey.active,false);
});
test('Portfolio walks straight toward the studio with its back to the front camera',()=>{
 const actors=new IslandActors('tokyo','restored',STUDY_ROUTES);
 const matrix=cameraFromRig(cityCameraRig('tokyo',1440,980,0,0,0,0,0,0,'restored',true),1440,980);
 actors.navigate('portfolio',3.8);let previous=actors.poses.guide;
 for(let i=0;i<300&&!actors.arrived;i++){
  const pose=actors.advance(20).guide;
  assert.equal(pose.x,0);assert.ok(pose.z<=previous.z);
  const at=project(matrix,[pose.x,.4,pose.z],1440,980),next=project(matrix,[pose.x+Math.sin(pose.angle),.4,pose.z+Math.cos(pose.angle)],1440,980);
  assert.equal(projectedTravelFacing(next.x-at.x,next.y-at.y,'back'),'back');previous=pose;
 }
 assert.equal(actors.arrived,'portfolio');
});
test('reselecting Portfolio resumes forward without returning to the old start waypoint',()=>{
 const actors=new IslandActors('tokyo','restored',STUDY_ROUTES);
 actors.navigate('portfolio',3.8);for(let i=0;i<90;i++)actors.advance(20);
 const before=actors.poses.guide;actors.cancel();actors.navigate('portfolio',3.8);
 for(let i=0;i<300&&!actors.arrived;i++){const pose=actors.advance(20).guide;assert.ok(pose.z<=before.z);assert.equal(pose.x,0);}
 assert.equal(actors.arrived,'portfolio');
});
test('depth facing follows the camera and the stride alternates feet without a wall-clock timer',()=>{
 for(const [dx,dy,expected]of [[0,-10,'back'],[0,10,'front'],[-10,0,'left'],[10,0,'right']])assert.equal(projectedTravelFacing(dx,dy,'front'),expected);
 assert.equal(projectedTravelFacing(-10,-10,'left'),'back','a slight diagonal correction toward the central path keeps the back view');
 for(const yaw of [0,Math.PI]){
  const matrix=cameraFromRig(cityCameraRig('tokyo',1440,980,0,0,0,yaw,0,0,'restored',true),1440,980);
  const a=project(matrix,[0,.4,5],1440,980),b=project(matrix,[0,.4,4],1440,980);
  assert.equal(projectedTravelFacing(b.x-a.x,b.y-a.y,'back'),yaw===0?'back':'front');
 }
 const a=depthStride(9),b=depthStride(27);assert.ok(a.leftLift>0&&a.rightLift===0);assert.ok(b.rightLift>0&&b.leftLift===0);
 assert.ok(Math.abs(depthStride(36).step-depthStride(0).step)<1e-10);
});

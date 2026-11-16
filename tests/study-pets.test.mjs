import test from 'node:test';
import assert from 'node:assert/strict';
import {IslandActors} from '../lib/quest-preview/actors.ts';
import {PET_IDS} from '../lib/quest-preview/pet-sprites.ts';
import {petCanTravel,STUDY_PET_SPACE as space} from '../lib/quest-preview/pet-space.ts';
import {STUDY_ROUTES} from '../lib/quest-preview/study-navigation.ts';
test('five study pets keep moving without intersecting each other, objects or clearings',()=>{
 const actors=new IslandActors('tokyo','restored',STUDY_ROUTES,space);
 const starts=actors.poses;
 for(let tick=0;tick<18000;tick++){
  const poses=actors.advance([16,20,33,50][tick%4]);
  for(const pet of PET_IDS){
   const pose=poses[pet],radius=space.radii[pet],[a,b,c,d]=space.bounds[pet];
   assert.ok(pose.x-radius>=a&&pose.x+radius<=b&&pose.z-radius>=c&&pose.z+radius<=d,`${pet} stays in its grass clearing`);
   for(const obstacle of space.obstacles)assert.ok(Math.hypot(pose.x-obstacle.x,pose.z-obstacle.z)>=radius+obstacle.radius);
   for(const other of PET_IDS)if(pet!==other)assert.ok(Math.hypot(pose.x-poses[other].x,(pose.z-poses[other].z)*.5)>=radius+space.radii[other]+.149,`${pet} / ${other}`);
  }
 }
 for(const pet of PET_IDS)assert.ok(actors.poses[pet].distance-starts[pet].distance>2,`${pet} actually walks instead of staying blocked`);
});
test('swept collision rejects a path through another pet even when its end is clear',()=>{
 const actors=new IslandActors('tokyo','restored',STUDY_ROUTES,space),poses=actors.poses;
 const blocked={...poses,sloth:{...poses.sloth,x:-5.2,z:8}};
 assert.equal(petCanTravel('frenchie',[-6.4,8],[-3.3,8],blocked,space),false);
});
test('pause and resume preserve spacing without teleporting',()=>{
 const actors=new IslandActors('tokyo','restored',STUDY_ROUTES,space);actors.advance(3500);actors.animatePets(false);const stopped=actors.poses;
 actors.advance(60000);for(const pet of PET_IDS)assert.deepEqual(actors.poses[pet],stopped[pet]);
 actors.animatePets(true);const previous=actors.poses;actors.advance(20);
 for(const pet of PET_IDS)assert.ok(Math.hypot(actors.poses[pet].x-previous[pet].x,actors.poses[pet].z-previous[pet].z)<.1);
});

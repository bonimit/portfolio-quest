import test from 'node:test';
import assert from 'node:assert/strict';
import {MapOrbit,ORBIT_LIMITS} from '../lib/quest-preview/map-orbit.ts';
import {cityCameraRig,cameraFromRig} from '../lib/quest-preview/city-camera.ts';
import {project} from '../lib/quest-preview/math.ts';
import {makeWorld as currentWorld} from '../lib/quest-preview/restored/world.ts';
import {makeConceptSceneStudy} from '../lib/quest-preview/concept-scene-study.ts';
import {makeThreePathGeometry} from '../lib/quest-preview/three-path-world.ts';
import {studyTargets,studyModel} from '../lib/quest-preview/study-renderer.ts';
import {nextStudySeason} from '../lib/quest-preview/study-seasons.ts';
test('study starts with the exact current island geometry, including its deep rocky underside',()=>{
 const base=currentWorld({city:'tokyo',season:'autumn',light:'day'}).slice(0,(36*10+6*144)*24),geometry=makeConceptSceneStudy();
 assert.deepEqual(geometry.slice(0,base.length),base);
 assert.ok(base.some((n,i)=>i%8===1&&n< -8));
});
test('full orbit crosses every quadrant and multiple complete turns while existing limits stay intact',()=>{
 const orbit=new MapOrbit(true);
 for(let turn=0;turn<3;turn++){orbit.begin(turn,0,0);orbit.move(turn,1000,0,900,980);orbit.end(turn);}
 assert.ok(orbit.yaw>Math.PI*2);assert.deepEqual(orbit.reset(),{yaw:0,pitch:0});
 assert.equal(new MapOrbit().set(100,0).yaw,ORBIT_LIMITS.yaw);
});
test('full camera does not clamp rear views; targets and projected points track a complete circle',()=>{
 const matrices=[];
 for(let i=0;i<=16;i++){
  const matrix=cameraFromRig(cityCameraRig('tokyo',1440,980,0,0,0,i*Math.PI/8,0,0,'restored',true),1440,980);matrices.push(matrix);
  for(const target of Object.values(studyTargets(matrix,1440,980)))assert.ok(Object.values(target).every(Number.isFinite)&&target.width>=44&&target.height>=44);
  const point=project(matrix,[7.8,.4,-.4],1440,980);assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));
 }
 for(let j=0;j<16;j++)assert.ok(Math.abs(matrices[0][j]-matrices[16][j])<.00001);
 assert.notDeepEqual(matrices[4],matrices[8]);assert.notDeepEqual(matrices[8],matrices[12]);
});
test('hover moves actual architectural vertices and reduced motion restores their resting geometry',()=>{
 const model=studyModel(),rest=new Float32Array(model.geometry);
 model.update(.1,'world',false);model.update(.2,'world',false);assert.notDeepEqual(model.geometry,rest);
 model.update(.3,null,true);const layers=makeThreePathGeometry({city:'tokyo',season:'autumn',light:'day'}).layers,architecture=Object.entries(layers).filter(([id])=>id!=='frog'&&id!=='vehicle'&&!id.startsWith('boat-')).reduce((n,[,mesh])=>n+mesh.length,0);for(let i=0;i<architecture;i+=8)if(rest[i+6]!==10)assert.deepEqual(model.geometry.slice(i,i+8),rest.slice(i,i+8));
});
test('season changes cycle Tokyo only and preserve the same base and destination layout',()=>{
 let season='autumn';const seen=[];
 const base=currentWorld({city:'tokyo',season:'autumn',light:'day'}).slice(0,(36*10+6*144)*24);
 const sizes=[];
 for(let i=0;i<4;i++){
  seen.push(season);const geometry=makeConceptSceneStudy('all',season);sizes.push(geometry.length);
  assert.deepEqual(geometry.slice(0,base.length),base);assert.ok(geometry.every(Number.isFinite));
  season=nextStudySeason(season);
 }
 assert.deepEqual(seen,['autumn','winter','spring','summer']);assert.equal(season,'autumn');assert.ok(new Set(sizes).size>1);
});

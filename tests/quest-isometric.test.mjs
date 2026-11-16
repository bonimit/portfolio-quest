import test from 'node:test';
import assert from 'node:assert/strict';
import {Sculpture,MATERIAL,makeWorld} from '../lib/quest-preview/world.ts';
import {addClouds} from '../lib/quest-preview/clouds.ts';
import {cameraMatrix,project} from '../lib/quest-preview/math.ts';

function assertClosedMesh(g){
  const edges=new Map(),key=p=>p.map(v=>Math.round(v*1e6)).join(',');
  for(let i=0;i<g.values.length;i+=24){
    const points=[0,8,16].map(offset=>key(g.values.slice(i+offset,i+offset+3)));
    if(new Set(points).size!==3)continue; // Collapsed pole triangles have no area.
    for(let j=0;j<3;j++){
      const edge=[points[j],points[(j+1)%3]].sort().join('|');edges.set(edge,(edges.get(edge)||0)+1);
    }
  }
  assert.ok(edges.size>100);
  for(const [edge,count]of edges)assert.equal(count,2,`Open or overlapping edge: ${edge}`);
}
test('soft cloud geometry is closed and has normalized analytic surface normals',()=>{
  const g=new Sculpture();g.ellipsoid([0,0,0],[2,1,.7],MATERIAL.cloud);assertClosedMesh(g);
  for(let i=0;i<g.values.length;i+=8){assert.ok(Math.abs(Math.hypot(...g.values.slice(i+3,i+6))-1)<1e-8);assert.equal(g.values[i+7],1);}
});
test('rounded foliage and rocks meet at their longitude seam for different shapes and phases',()=>{
  for(const phase of [0,.9,12]){const g=new Sculpture();g.crown([3,2,-1],[2,1,.7],MATERIAL.leaf,phase);assertClosedMesh(g);}
});
test('complete cloud silhouettes fit narrow, short and ultrawide cameras including parallax and drift',()=>{
  const g=new Sculpture();addClouds(g,MATERIAL.cloud);
  for(const width of [320,390,768,1024,1280,1440,1920,2560])for(const height of [240,480,700,980])for(const focus of [-.9,.9])for(const pan of [-1,1]){
    const matrix=cameraMatrix(width,height,focus,pan,pan);
    for(let i=0;i<g.values.length;i+=8){
      const p=g.values.slice(i,i+3);p[0]+=.12*pan;p[1]+=.035*pan;
      const point=project(matrix,p,width,height);
      assert.ok(point.x>width*.05&&point.x<width*.95&&point.y>height*.05&&point.y<height*.95,`${width}×${height}: ${JSON.stringify(point)}`);
    }
  }
});
test('cloud-only material never applies cloud drift to the waterfall or city scenery',()=>{
  const g=new Sculpture();addClouds(g,MATERIAL.cloud);const world=makeWorld(),clouds=[];
  for(let i=0;i<world.length;i+=8)if(world[i+6]===MATERIAL.cloud)clouds.push(...world.slice(i,i+8));
  assert.deepEqual(new Float32Array(clouds),new Float32Array(g.values));
});

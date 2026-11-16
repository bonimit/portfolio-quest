import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraPreview} from '../lib/quest-preview/camera-preview.ts';
import {cityCameraRig,destinationCamera} from '../lib/quest-preview/city-camera.ts';
const direction=r=>{const d=r.eye.map((v,i)=>v-r.target[i]),n=Math.hypot(...d);return d.map(v=>v/n);};
test('normal view uses the approved balanced preset; alternatives require an explicit query',()=>{
 for(const query of ['', '?cameraPreview=invalid','?cameraPreview=__proto__'])assert.deepEqual(cameraPreview(query),{key:'balanced',zoom:1.1,avatar:1.5,lockAngle:true,enabled:false});
 assert.equal(cameraPreview('?cameraPreview=closer').zoom,1.15);assert.equal(cameraPreview('?cameraPreview=avatar').avatar,1.25);assert.equal(cameraPreview('?cameraPreview=balanced').zoom,1.1);assert.equal(cameraPreview('?cameraPreview=balanced').avatar,1.25);
});
test('proposed approach keeps the original viewing direction throughout the whole zoom',()=>{
 for(const yaw of [0,.3]){
  const base=cityCameraRig('tokyo',640,460,0,0,0,yaw,0,0,'restored'),d=direction(base);
  for(const progress of [0,.3,1])for(const entry of [0,.5,1])for(const push of [0,.5,1]){
   const f={city:'tokyo',edition:'restored',destination:'world',phase:'walking',elapsed:1800,progress,entry,push,pose:{x:5.1,z:-2.4,walking:true,angle:0,preparing:false,distance:3},floorY:.4,opacity:1};
   direction(destinationCamera(base,f,640,460,true)).forEach((v,i)=>assert.ok(Math.abs(v-d[i])<.000001));
  }
 }
});

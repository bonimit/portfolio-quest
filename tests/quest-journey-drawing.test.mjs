import test from 'node:test';
import assert from 'node:assert/strict';
import {createJourneyDrawing} from '../lib/quest-preview/journey-drawing.ts';
import {ASSISTANT_ATLAS} from '../lib/guide/assistant-atlas.ts';
import {cityCameraMatrix} from '../lib/quest-preview/city-camera.ts';
function fakeGL(fail=false){
 const calls=[];let id=0;
 const methods={createShader:()=>fail?null:{id:++id},createProgram:()=>({id:++id}),createTexture:()=>({id:++id}),getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(_p,name)=>name};
 const gl=new Proxy({}, {get(_target,key){if(key in methods)return (...args)=>{calls.push([key,...args]);return methods[key](...args);};if(/^[A-Z_0-9]+$/.test(key))return key;return (...args)=>{calls.push([key,...args]);};}});
 return {gl,calls};
}
test('one decoded atlas texture is reused across frames and released with all shader resources',()=>{
 const {gl,calls}=fakeGL(),sprite=createJourneyDrawing(gl,()=>{});
 const image={complete:false,naturalWidth:0},root={querySelector:()=>image,dataset:{frame:'999'}};
 assert.equal(sprite.attach(root),false);assert.equal(calls.filter(c=>c[0]==='texImage2D').length,0);
 image.complete=true;image.naturalWidth=ASSISTANT_ATLAS.width*ASSISTANT_ATLAS.columns;
 assert.equal(sprite.attach(root),true);assert.equal(sprite.attach(root),true);assert.equal(calls.filter(c=>c[0]==='texImage2D').length,1);
 sprite.draw(cityCameraMatrix('nyc',1280,650),{x:0,z:7,angle:0,walking:true,preparing:false,distance:1},null);
 assert.ok(calls.some(c=>c[0]==='uniform2f'&&c[1]==='tile'&&c[2]===6&&c[3]===5),'invalid atlas indices stay within the final tile');
 assert.deepEqual(calls.filter(c=>c[0]==='depthMask').map(c=>c[1]),[false,true]);
 sprite.destroy();assert.equal(calls.filter(c=>c[0]==='deleteTexture').length,1);assert.equal(calls.filter(c=>c[0]==='deleteShader').length,2);assert.equal(calls.filter(c=>c[0]==='deleteProgram').length,1);
});
test('shader allocation failure releases its program and can fall back cleanly',()=>{
 const {gl,calls}=fakeGL(true);assert.throws(()=>createJourneyDrawing(gl,()=>{}),/shader unavailable/);assert.equal(calls.filter(c=>c[0]==='deleteProgram').length,1);
});
test('GPU pose changes blend at the common feet anchor and static mode settles immediately',()=>{
 const {gl,calls}=fakeGL(),sprite=createJourneyDrawing(gl,()=>{});
 const root={querySelector:()=>({complete:true,naturalWidth:1008}),dataset:{pose:'idle-front',frame:'0',motion:'running'}};
 sprite.attach(root);
 const camera=cityCameraMatrix('tokyo',1280,650),pose={x:1,z:3,angle:0,walking:false,preparing:false,distance:0};
 sprite.draw(camera,pose,null);
 root.dataset.pose='walk-right';root.dataset.frame='15';sprite.draw(camera,pose,null);
 assert.deepEqual(calls.filter(c=>c[0]==='uniform1f'&&c[1]==='poseMix').map(c=>c[2]),[1,0]);
 const feet=calls.filter(c=>c[0]==='uniform3fv'&&c[1]==='actor').map(c=>c[2]);assert.deepEqual(feet,[[1,.4,3],[1,.4,3]]);
 root.dataset.motion='static';sprite.draw(camera,pose,null);
 assert.equal(calls.filter(c=>c[0]==='uniform1f'&&c[1]==='poseMix').at(-1)[2],1);
 sprite.destroy();
});
test('supplied atlas uses eight columns, measured UV crops and crisp non-overlapping poses',()=>{
 const {gl,calls}=fakeGL(),sprite=createJourneyDrawing(gl,()=>{});
 const root={querySelector:()=>({complete:true,naturalWidth:712}),dataset:{atlas:'provided',pose:'walk-right',frame:'8',motion:'running'}};
 sprite.attach(root);const camera=cityCameraMatrix('tokyo',1280,650),pose={x:0,z:4,angle:0,walking:true,preparing:false,distance:.2};
 sprite.draw(camera,pose,null);root.dataset.pose='turn';root.dataset.frame='24';sprite.draw(camera,pose,null);
 assert.ok(calls.some(c=>c[0]==='uniform2f'&&c[1]==='grid'&&c[2]===8&&c[3]===10));
 assert.equal(calls.filter(c=>c[0]==='uniform4f'&&c[1]==='crop').length,2);
 assert.deepEqual(calls.filter(c=>c[0]==='uniform1f'&&c[1]==='poseMix').map(c=>c[2]),[1,1]);
 assert.ok(calls.filter(c=>c[0]==='uniform1f'&&c[1]==='footAnchor').every(c=>c[2]>0&&c[2]<.02));
 sprite.destroy();
});

test('atlas filtering and every sprite pass use premultiplied alpha without leaking upload state',()=>{
 const {gl,calls}=fakeGL(),sprite=createJourneyDrawing(gl,()=>{});
 const root={querySelector:()=>({complete:true,naturalWidth:712}),dataset:{atlas:'provided',frame:'0'}};
 sprite.attach(root);sprite.draw(cityCameraMatrix('tokyo',1280,650),{x:0,z:4,angle:0,walking:false,preparing:false,distance:0},null);
 assert.deepEqual(calls.filter(c=>c[0]==='pixelStorei').map(c=>c.slice(1)),[['UNPACK_PREMULTIPLY_ALPHA_WEBGL',true],['UNPACK_PREMULTIPLY_ALPHA_WEBGL',false]]);
 assert.ok(calls.some(c=>c[0]==='blendFunc'&&c[1]==='ONE'&&c[2]==='ONE_MINUS_SRC_ALPHA'));
 const fragment=calls.find(c=>c[0]==='shaderSource'&&c[2].includes('out vec4 color'))[2];
 assert.ok(fragment.includes('vec4(rgb*opacity,a*opacity)'));
 assert.ok(fragment.includes('vec3(.07,.12,.14)*a'));
 assert.ok(fragment.includes('mix(inside,routeColor,push)*opening'));
 sprite.destroy();
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {Sculpture,MATERIAL,makeWorld} from '../lib/quest-preview/world.ts';
import {addClouds} from '../lib/quest-preview/clouds.ts';
import {captureSceneFrame,clearSceneTransition,fadeSceneFrame,SCENE_TRANSITION_MS} from '../lib/quest-preview/scene-transition.ts';
test('all four Tokyo seasons have independent finite complete scene geometry',()=>{
 const scenes=['spring','summer','autumn','winter'].map(season=>makeWorld({city:'tokyo',season,light:'day'}));
 for(const g of scenes){assert.ok(g.length>100);assert.ok(g.every(Number.isFinite));}
 for(let i=0;i<scenes.length;i++)for(let j=i+1;j<scenes.length;j++)assert.notDeepEqual(scenes[i],scenes[j]);
});
test('Mount Fuji remains a large, in-budget backdrop in all four Tokyo seasons',()=>{
  for(const season of ['spring','summer','autumn','winter']){
    const values=makeWorld({city:'tokyo',season,light:'day'}),backdrop=[];
    for(let i=0;i<values.length;i+=8)if(values[i+2]<-8&&Math.abs(values[i])<5)backdrop.push(values[i+1]);
    assert.ok(Math.max(...backdrop)>7.3);assert.ok(values.length/24<24000);
  }
});
test('transition captures exactly the current canvas dimensions and pixels',()=>{
  const source={width:1640,height:970};let args;
  const target={width:1,height:1,getContext:type=>{assert.equal(type,'2d');return {drawImage:(...values)=>{args=values;}};}};
  captureSceneFrame(source,target);assert.equal(target.width,1640);assert.equal(target.height,970);assert.deepEqual(args,[source,0,0]);
});
test('transition releases pixel memory on completion or cancellation',()=>{
  let cancelled=false,frames,options;const animation={cancel:()=>{cancelled=true;}};
  const layer={width:2000,height:1000,getAnimations:()=>[animation],animate:(f,o)=>{frames=f;options=o;return animation;}};
  fadeSceneFrame(layer);assert.deepEqual(frames,[{opacity:1},{opacity:0}]);assert.equal(options.duration,SCENE_TRANSITION_MS);assert.ok(options.duration>=1000);
  animation.onfinish();assert.equal(layer.width,1);assert.equal(layer.height,1);
  clearSceneTransition(layer);assert.equal(cancelled,true);assert.equal(layer.width*layer.height,1);
});

test('winter snow faces upwards and ground snow cannot inherit cloud drift',()=>{
  const snow=makeWorld({city:'tokyo',season:'winter',light:'day'});let upwardSnow=false;for(let i=0;i<snow.length;i+=8)if(snow[i+6]===MATERIAL.snow&&snow[i+4]>.9)upwardSnow=true;assert.ok(upwardSnow);
  const clouds=new Sculpture();addClouds(clouds,MATERIAL.cloud);
  for(const city of ['tokyo','nyc']){
    const world=makeWorld({city,season:'winter',light:'day'}),actual=[];
    for(let i=0;i<world.length;i+=8)if(world[i+6]===MATERIAL.cloud)actual.push(...world.slice(i,i+8));
    assert.deepEqual(new Float32Array(actual),new Float32Array(clouds.values));
  }
});

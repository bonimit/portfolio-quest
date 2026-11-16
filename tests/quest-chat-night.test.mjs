import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {atmosphere} from '../lib/quest-preview/palette.ts';
import {VARIANTS,variantId,CITY_IDS,CITIES} from '../lib/quest-preview/variants.ts';
import {SCENE_BUILDERS} from '../lib/quest-preview/scenes/index.ts';
import {sceneId,sceneConfig} from '../lib/quest-preview/scene-config.ts';
import {submitsChatMessage} from '../lib/quest-preview/chat-composer.ts';
test('composer sends Enter, preserves Shift+Enter and never sends during IME confirmation',()=>{
  const e={key:'Enter',shiftKey:false,isComposing:false};assert.equal(submitsChatMessage(e),true);
  for(const update of [{shiftKey:true},{isComposing:true},{keyCode:229},{defaultPrevented:true},{key:'Escape'}])assert.equal(submitsChatMessage({...e,...update}),false);
});
test('all night variants have dimmer key/fill/cloud light and their own softer moon shadows',()=>{
  for(const v of VARIANTS.filter(v=>v.light==='day')){
    const d=atmosphere(v),n=atmosphere({...v,light:'night'});
    assert.notDeepEqual(n.direction,d.direction);assert.ok(n.sun.every((value,i)=>value<d.sun[i]*.7));
    assert.ok(n.fill<d.fill);assert.ok(n.shadowFloor>d.shadowFloor);assert.ok(n.cloudGain<d.cloudGain*.3);
    assert.ok(n.ground[2]>n.ground[0]);
  }
});
test('every supported city and season resolves to its own complete scene builder and setting',()=>{
 const ids=VARIANTS.filter(v=>v.light==='day').map(sceneId);
 assert.equal(Object.keys(SCENE_BUILDERS).length,11);
 assert.equal(new Set(ids.map(id=>SCENE_BUILDERS[id])).size,11);
 assert.equal(new Set(VARIANTS.filter(v=>v.light==='day').map(v=>sceneConfig(v).title)).size,11);
 for(const city of CITY_IDS)for(const season of CITIES[city].seasons)assert.equal(sceneId({city,season,light:'day'}),`${city}-${season}`);
});
async function luminance(v){
  const {data,info}=await sharp(new URL('../public/quest-preview/'+variantId(v)+'.webp',import.meta.url).pathname).raw().toBuffer({resolveWithObject:true});
  let sum=0,count=0;
  for(let i=0;i<data.length;i+=info.channels)if(data[i+3]>240){sum+=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;count++;}
  return sum/count;
}
test('all eleven rendered night illustrations are darker than day while retaining visible scene luminance',async()=>{
  for(const v of VARIANTS.filter(v=>v.light==='day')){
    const day=await luminance(v),night=await luminance({...v,light:'night'});
    assert.ok(night<day*.8,`${variantId(v)}: ${night}/${day}`);assert.ok(night>day*.22,`${variantId(v)} is too dark`);
  }
});

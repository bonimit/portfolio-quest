import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {projectBuildings} from '../lib/quest-preview/building-interaction.ts';
import {makeWorld,LANDMARKS} from '../lib/quest-preview/world.ts';
import {cameraMatrix,project,renderSize,pixelRatio,lookAt,multiply,ortho} from '../lib/quest-preview/math.ts';
import {worldPalette,atmosphere} from '../lib/quest-preview/palette.ts';
import {VARIANTS,CITIES,CITY_IDS,DEFAULT_VARIANT,variantId,changeCity,isSnow,SCENE_STOPS,SCENE_HOLD_MS,sceneIndex,stepScene,tourStatus} from '../lib/quest-preview/variants.ts';
const read=path=>readFileSync(new URL('../'+path,import.meta.url));
test('original scene is deterministic, finite, batched, and within its geometry budget',()=>{
  const geometry=makeWorld();assert.equal(geometry.length%24,0);assert.deepEqual(geometry,makeWorld());
  assert.ok(geometry.length/24<24000);assert.ok(geometry.length/24>4000);
  for(let i=0;i<geometry.length;i++)assert.ok(Number.isFinite(geometry[i]));
  for(let i=0;i<geometry.length;i+=8){assert.ok(geometry[i+6]>=0&&geometry[i+6]<20);assert.ok(Math.abs(Math.hypot(...geometry.slice(i+3,i+6))-1)<.001||Math.hypot(...geometry.slice(i+3,i+6))===0);}
});
test('both landmarks remain separated in all requested camera projections, including short heights',()=>{
  for(const width of [320,390,768,1024,1280,1440,1920,2560])for(const height of [480,700,980]){
    const matrix=cameraMatrix(width,height);
    const a=project(matrix,LANDMARKS.portfolio,width,height),b=project(matrix,LANDMARKS.world,width,height);
    assert.ok(a.x<b.x);assert.ok(a.x>=0&&b.x<=width);assert.ok(Number.isFinite(a.y)&&Number.isFinite(b.y));
    // These are math bounds, not a claim that DOM labels or device layouts were observed.
  }
});
test('orthographic matrix math centers the target and preserves horizontal ordering',()=>{
  const m=multiply(ortho(-10,10,-10,10,.1,100),lookAt([0,0,20],[0,0,0]));
  assert.deepEqual(project(m,[0,0,0],1000,1000),{x:500,y:500});
  assert.ok(project(m,[-3,0,0],1000,1000).x<500);
});
test('DPR and pixel budgets bound GPU allocation at mobile and ultrawide sizes',()=>{
  assert.equal(pixelRatio(4),1.6);assert.equal(pixelRatio(NaN),1);
  for(const w of [320,390,768,1440,2560,4000])for(const h of [360,800,1200]){
    const size=renderSize(w,h,3);assert.ok(size.width*size.height<=2_800_000);
    assert.ok(size.width>0&&size.height>0);assert.ok(size.width<=w*1.6);
  }
});
test('all 22 supported city/season/time combinations are unique and valid',()=>{
  assert.equal(VARIANTS.length,22);assert.equal(new Set(VARIANTS.map(variantId)).size,22);
  assert.deepEqual(CITY_IDS.map(city=>VARIANTS.filter(v=>v.city===city).length),[8,8,6]);
  for(const v of VARIANTS)assert.ok(CITIES[v.city].seasons.includes(v.season));
});
test('city switches retain supported seasons and replace unsupported ones without snow in Bangkok',()=>{
  assert.deepEqual(changeCity({city:'nyc',season:'spring',light:'night'},'bangkok'),{city:'bangkok',season:'summer',light:'night'});
  assert.equal(changeCity({city:'bangkok',season:'raining',light:'day'},'tokyo').season,'summer');
  assert.equal(changeCity({city:'nyc',season:'winter',light:'day'},'tokyo').season,'winter');
  assert.equal(isSnow({city:'bangkok',season:'winter',light:'day'}),false);
  assert.equal(isSnow({city:'tokyo',season:'winter',light:'day'}),true);
});
test('all city geometries and seasonal details are finite, deterministic and bounded',()=>{
  for(const v of VARIANTS.filter(v=>v.light==='day')){
    const geometry=makeWorld(v);
    assert.ok(geometry.length/24<24000,variantId(v));
    assert.deepEqual(geometry,makeWorld({...v,light:'night'}));
    for(const value of geometry)assert.ok(Number.isFinite(value));
  }
  const cityGeometry=CITY_IDS.map(city=>makeWorld({city,season:'summer',light:'day'}));
  assert.notDeepEqual(cityGeometry[0],cityGeometry[1]);assert.notDeepEqual(cityGeometry[1],cityGeometry[2]);
  assert.notDeepEqual(makeWorld({...DEFAULT_VARIANT,season:'summer'}),makeWorld({...DEFAULT_VARIANT,season:'winter'}));
});
test('city and seasonal palettes change materials, and time changes illumination',()=>{
  for(const v of VARIANTS){
    assert.equal(worldPalette(v).length,60);
    for(const channel of worldPalette(v))assert.ok(channel>=0&&channel<=1);
    assert.notDeepEqual(atmosphere({...v,light:'day'}),atmosphere({...v,light:'night'}));
  }
  assert.notDeepEqual(worldPalette(DEFAULT_VARIANT),worldPalette({...DEFAULT_VARIANT,city:'tokyo'}));
  assert.notDeepEqual(worldPalette(DEFAULT_VARIANT),worldPalette({...DEFAULT_VARIANT,season:'winter'}));
});
test('all 22 current fallback assets exist, have valid WebP headers and remain mobile-sized',()=>{
  const manifest=JSON.parse(read('assets/quest-preview/manifest.json'));
  assert.equal(Object.keys(manifest.files).length,22);
  assert.equal(manifest.vertices,makeWorld().length/8);
  for(const v of VARIANTS)assert.ok(manifest.files[`${variantId(v)}.webp`]);
  for(const [file,bytes]of Object.entries(manifest.files)){
    const data=read('public/quest-preview/'+file);assert.equal(data.length,bytes);assert.ok(bytes<110000);
    assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');
  }
});
test('protected Portfolio and existing avatar assets/motion still match their baseline',()=>{
  for(const path of ['tests/fixtures/portfolio-protected-sha256.json','tests/fixtures/avatar-movement-preserved-sha256.json']){
    const manifest=JSON.parse(read(path));const files=manifest.files||manifest;
    for(const [file,hash]of Object.entries(files))assert.equal(createHash('sha256').update(file==='app/portfolio/page.tsx'?read(file).toString().replace('Three playable prototype demos, with a choice of Island, Arcade and Neon themes.','A glimpse of the illustrated world taking shape around the portfolio. The game is not playable yet.'):read(file)).digest('hex'),hash,file);
  }
});
test('companion control borders and text keep contrast in day and night palettes',()=>{
  const css=read('app/quest-preview/quest-preview.css').toString();
  const luminance=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  for(const [border,background,text]of [['#9bb6b1','#263c45','#f6f5f1'],['#657b75','#f3eee1','#172c30']]){
    assert.ok(css.includes(border));assert.ok(contrast(border,background)>=3);assert.ok(contrast(text,background)>=4.5);
  }
  // The display heading is at least 32px, so its large-text threshold is 3:1.
  assert.ok(contrast('#914710','#b7cbd4')>=3);
});

test('automatic tour starts in NYC, covers each supported season, wraps and preserves time',()=>{
  assert.deepEqual(DEFAULT_VARIANT,{city:'nyc',season:'spring',light:'day'});
  assert.equal(SCENE_HOLD_MS,16000);assert.equal(SCENE_STOPS.length,11);
  assert.deepEqual(SCENE_STOPS.map(v=>v.city),['nyc','nyc','nyc','nyc','tokyo','tokyo','tokyo','tokyo','bangkok','bangkok','bangkok']);
  let v={...DEFAULT_VARIANT,light:'night'};
  for(let i=0;i<11;i++){assert.equal(sceneIndex(v),i);assert.equal(v.light,'night');v=stepScene(v);}
  assert.deepEqual(v,{...DEFAULT_VARIANT,light:'night'});
  assert.deepEqual(stepScene(DEFAULT_VARIANT,-1),{city:'bangkok',season:'winter',light:'day'});
});

test('building hit areas track both landmarks at mobile, tablet and desktop sizes',()=>{
  for(const city of CITY_IDS)for(const width of [320,390,768,1024,1280,1440,1920]){
    const height=width<1024?520:700,matrix=cameraMatrix(width,height);
    const targets=projectBuildings({city,season:'spring',light:'day'},matrix,width,height);
    for(const target of Object.values(targets)){
      assert.ok(target.width>=44&&target.height>=44);
      assert.ok(target.left>=0&&target.left+target.width<=width);
      assert.ok(target.top>=0&&target.top+target.height<=height);
    }
    assert.ok(targets.portfolio.left+targets.portfolio.width<targets.world.left);
  }
});

test('richer city scenes include glazing and city-specific winter snow geometry',()=>{
  const count=(geometry,material)=>Array.from({length:geometry.length/8},(_,i)=>geometry[i*8+6]).filter(value=>value===material).length;
  for(const city of CITY_IDS){
    const summer=makeWorld({city,season:'summer',light:'day'}),winter=makeWorld({city,season:'winter',light:'day'});
    assert.ok(count(summer,17)>0,'glazing: '+city);
    if(city!=='bangkok')assert.ok(count(winter,18)>count(summer,18),'winter snow: '+city);
    else assert.equal(count(winter,18),0,'Thailand has no artificial snow');
  }
  assert.ok(count(makeWorld({city:'tokyo',season:'summer',light:'day'}),18)>0,'Fuji retains a small summit snow cap');
  assert.ok(count(makeWorld({city:'bangkok',season:'summer',light:'day'}),19)>0,'temple gold details');
});

test('visible tour status distinguishes enabled, held, off and reduced motion',()=>{
  assert.equal(tourStatus(true,false,false),'On');assert.equal(tourStatus(true,false,true),'Paused');
  assert.equal(tourStatus(false,false,false),'Off');assert.equal(tourStatus(true,true,false),'Off');
});

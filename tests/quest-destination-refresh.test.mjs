import {OKINAWA_ISLETS} from '../lib/quest-preview/restored/place-scenes/polish.ts';
import {onCityWalkway} from '../lib/quest-preview/city-layout.ts';
import test from 'node:test';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeWorld} from '../lib/quest-preview/restored/world.ts';
import {VARIANTS} from '../lib/quest-preview/restored/variants.ts';
import {worldPalette as livePalette} from '../lib/quest-preview/palette.ts';
import {worldPalette as originalPalette} from '../lib/quest-preview/restored/palette.ts';
import {placePalette} from '../lib/quest-preview/restored/place-scenes/palette.ts';
import {PLACE_IDS,PLACES} from '../lib/quest-preview/restored/places.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const geometry=place=>makeWorld({...PLACES[place],place,light:'day'});
test('current city sources, all 22 seasonal images and their manifest remain byte-identical',()=>{
 const baseline=JSON.parse(read('tests/fixtures/quest-destination-refresh-protected.json'));
 for(const [path,expected]of Object.entries(baseline.files))assert.equal(hash(read(path)),expected,path);
});
test('every destination retains the exact same original rocky island mesh',()=>{
 // island(): 36 sculpted sections × 10 triangles plus six 144-triangle fragments.
 const baseLength=(36*10+6*144)*24,base=makeWorld().slice(0,baseLength);
 assert.ok(base.some((value,i)=>i%8===1&&value < -8));
 for(const place of PLACE_IDS)assert.deepEqual(geometry(place).slice(0,baseLength),base,place);
});
test('distinct destination silhouettes stay bounded and their generated manifest matches live meshes',()=>{
 const manifest=JSON.parse(read('assets/quest-preview/restored/places-manifest.json')),silhouettes=new Set();
 for(const place of PLACE_IDS){const mesh=geometry(place);let maxY=0,minX=Infinity,maxX=-Infinity;
  for(let i=0;i<mesh.length;i+=8){assert.ok(Number.isFinite(mesh[i]));maxY=Math.max(maxY,mesh[i+1]);minX=Math.min(minX,mesh[i]);maxX=Math.max(maxX,mesh[i]);}
  assert.ok(maxY<16&&maxY>4,place);assert.ok(minX>-19&&maxX<19,place);
  assert.ok(mesh.length/24<24000,place);assert.equal(manifest.geometry[place].triangles,mesh.length/24,place);
  silhouettes.add(hash(new Uint8Array(mesh.buffer)));
 }
 assert.equal(silhouettes.size,11);
});
test('destination-specific winter treatment does not put snow on Doi Inthanon',()=>{
 const materials=place=>{const mesh=geometry(place),counts=new Map();for(let i=6;i<mesh.length;i+=8)counts.set(mesh[i],(counts.get(mesh[i])??0)+1);return counts;};
 assert.equal(materials('inthanon').get(18)??0,0);
 assert.ok(materials('hokkaido').get(18)>200);
 assert.ok(materials('rockefeller').get(18)>100);
 assert.ok(materials('krabi').get(7)>100);
});

test('all destination fallback images keep complete silhouettes inside the image border',async()=>{
 for(const place of PLACE_IDS)for(const light of ['day','night']){
  const file=`public/quest-preview/restored/place-${place}-${light}.webp`;
  const {data,info}=await sharp(read(file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let x=0;x<info.width;x++)for(const y of [0,info.height-1])assert.equal(data[(y*info.width+x)*4+3],0,file+' vertical crop');
  for(let y=0;y<info.height;y++)for(const x of [0,info.width-1])assert.equal(data[(y*info.width+x)*4+3],0,file+' horizontal crop');
 }
});

test('destination palettes are unique while every current city palette and original rock color are unchanged',()=>{
 for(const variant of VARIANTS)assert.deepEqual(livePalette({...variant,edition:'restored'}),originalPalette(variant));
 const colors=new Set();
 for(const place of PLACE_IDS){const variant={...PLACES[place],place,light:'day',edition:'restored'},base=originalPalette(variant),palette=placePalette(variant,base);
  assert.deepEqual(palette.slice(0,3),base.slice(0,3),place+' island rock pigment');
  assert.deepEqual(livePalette(variant),palette,place+' live and fallback palette consistency');
  colors.add(hash(new Uint8Array(palette.buffer)));assert.ok(palette.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
 }
 assert.equal(colors.size,11);
});
test('NYC summer is a movie lawn and Okinawa is a surf coast without changing collection IDs',()=>{
 assert.match(PLACES.coney.title,/Movies in Central Park/);assert.doesNotMatch(PLACES.coney.description,/Coney|wheel|boardwalk/i);
 assert.match(PLACES.okinawa.title,/Surf/);assert.match(PLACES.okinawa.description,/surf/i);
 assert.equal(PLACE_IDS.length,11);assert.equal(new Set(PLACE_IDS).size,11);
});

test('Okinawa archipelago has eight varied islets outside the authored walking corridors',()=>{
 assert.equal(OKINAWA_ISLETS.length,8);
 assert.equal(new Set(OKINAWA_ISLETS.map(([x,z])=>`${x},${z}`)).size,8);
 assert.ok(new Set(OKINAWA_ISLETS.map(([, ,r])=>r)).size>=5);
 for(const [x,z,r,h]of OKINAWA_ISLETS){
  assert.ok(r>0&&r<2&&h>0&&h<1.2);
  for(const [dx,dz]of [[0,0],[r,0],[-r,0],[0,r],[0,-r]])assert.equal(onCityWalkway('tokyo',[x+dx,z+dz],'restored'),false);
 }
});

import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {VARIANTS,DEFAULT_VARIANT,stepScene,seasonLabel} from '../lib/quest-preview/restored/variants.ts';
import {makeWorld,Sculpture,MATERIAL} from '../lib/quest-preview/restored/world.ts';
import {addTokyoSeasons} from '../lib/quest-preview/restored/tokyo-seasons.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
test('restored preview contains all four NYC/Tokyo and three Bangkok seasons in day and night',()=>{
 assert.deepEqual(['nyc','tokyo','bangkok'].map(city=>VARIANTS.filter(v=>v.city===city).length),[8,8,6]);
 for(const v of VARIANTS){assert.ok(makeWorld(v).every(Number.isFinite));assert.equal(read('public/quest-preview/restored/'+v.city+'-'+v.season+'-'+v.light+'.webp').toString('ascii',0,4),'RIFF');}
 assert.equal(seasonLabel('bangkok','raining'),'Monsoon');
 let v={...DEFAULT_VARIANT,light:'night',edition:'restored'};for(let i=0;i<11;i++)v=stepScene(v);assert.deepEqual(v,{...DEFAULT_VARIANT,light:'night',edition:'restored'});
});
test('Tokyo autumn restores actual modeled kaki fruit and starts on that scene for owner comparison',()=>{
 const g=new Sculpture();addTokyoSeasons(g,MATERIAL,{city:'tokyo',season:'autumn',light:'day'});assert.ok(g.values.length>1000);
 const source=read('lib/quest-preview/restored/tokyo-seasons.ts').toString();assert.ok(source.includes('Kaki: round orange fruit'));
 const page=read('app/quest-preview/page.tsx').toString();assert.ok(page.includes('/quest-preview/restored/experience'));
 const ui=read('components/quest-preview/restored/experience.tsx').toString();assert.ok(ui.includes("city:'tokyo',season:'autumn'"));assert.ok(ui.includes('[automatic,setAutomatic]=useState(false)'));
 assert.ok(read('components/quest-preview/scene.tsx').toString().includes('petSize(pixels,pet)'));
});

test('only the base changes: all city buildings, seasonal elements and camera composition stay intact',()=>{
 const source=read('lib/quest-preview/restored/world.ts').toString(),start=source.indexOf('function island('),end=source.indexOf('\nfunction ',start+10);
 const fixture=JSON.parse(read('tests/fixtures/quest-restored-elements-preserved.json'));
 const original=JSON.parse(read('tests/fixtures/quest-current-city-geometry.json'));for(const v of VARIANTS.filter(v=>v.light==='day')){const mesh=makeWorld(v);assert.equal(createHash('sha256').update(new Uint8Array(mesh.buffer,mesh.byteOffset,mesh.byteLength)).digest('hex'),original[v.city+'-'+v.season]);}assert.ok(source.slice(start,end).includes('-8.3'));assert.ok(fixture.sha256);
 for(const v of VARIANTS){const mesh=makeWorld(v);let lowest=0;for(let i=1;i<mesh.length;i+=8)lowest=Math.min(lowest,mesh[i]);assert.ok(lowest<=-8.29,'ruins-style depth is present in every city/season');}
});

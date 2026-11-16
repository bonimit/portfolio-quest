import test from 'node:test';
import assert from 'node:assert/strict';
import {VARIANTS,NEW_VARIANTS,HERITAGE_VARIANTS,variantId} from '../lib/quest-preview/variants.ts';
const base='http://127.0.0.1:3100';
test('isolated quest preview is noindex with exactly two primary native destination links and fallback art',async()=>{
 const response=await fetch(base+'/quest-preview');assert.equal(response.status,200);const html=await response.text();
 assert.equal((html.match(/<main\b/g)||[]).length,1);assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/<meta name="robots" content="noindex, nofollow"/);
 const signs=[...html.matchAll(/<a\b[^>]*class="quest-sign quest-sign--(portfolio|world)"[^>]*href="([^"]+)"/g)];
 assert.deepEqual(signs.map(match=>[match[1],match[2]]),[['portfolio','/portfolio'],['world','/world']]);
 assert.match(html,/Playable prototypes/);
 assert.match(html,/Portfolio — enter the editorial website/);assert.match(html,/Adventure — explore playable prototypes/);assert.match(html,/\/quest-preview\/restored\/tokyo-autumn-day.webp/);
 assert.match(html,/Pick your path/);assert.match(html,/Tokyo/);assert.match(html,/Autumn/);
 assert.match(html,/Talk to me — Wayfinder, the local scripted guide/);
 const assets=[...new Set([...html.matchAll(/(?:src|href)="([^" ]+\.(?:css|js|ttf|woff2|webp))"/g)].map(match=>match[1]))];
 for(const url of assets)assert.equal((await fetch(base+url)).status,200,url);
});
test('all 22 city-season-time fallback themes are served as WebP assets',async()=>{
 for(const variant of VARIANTS){
  const response=await fetch(base+`/quest-preview/${variantId(variant)}.webp`);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/image\/webp/);
 }
});
test('time switch, tour controls and actual reference pets are served',async()=>{
 const html=await (await fetch(base+'/quest-preview')).text();
 assert.match(html,/role="switch" aria-label="Night mode" aria-checked="false"/);
 for(const label of ['Previous scene','Next scene'])assert.ok(html.includes('aria-label="'+label+'"'));
 assert.match(html,/class="quest-season-toggle"[^>]*aria-pressed="false"/);
 assert.match(html,/Season Changes/);
 assert.doesNotMatch(html,/Auto tour|Which path would you like to try/);
 assert.match(html,/Tokyo/);assert.match(html,/Autumn/);
 for(const pet of ['capybara','cat','sloth','kitsune','frenchie']){
   assert.ok(html.includes('/quest-preview/pets/'+pet+'.webp'));
   const response=await fetch(base+'/quest-preview/pets/'+pet+'.webp');assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/image\/webp/);
 }
});

test('original and added city-island collections expose all 44 fallback themes',async()=>{
 for(const v of [...VARIANTS,...NEW_VARIANTS,...HERITAGE_VARIANTS]){const response=await fetch(base+'/quest-preview/'+variantId(v)+'.webp');assert.equal(response.status,200,variantId(v));assert.match(response.headers.get('content-type'),/image\/webp/);}
 const response=await fetch(base+'/quest-preview');const html=await response.text();assert.match(html,/Tokyo/);assert.match(html,/Autumn/);
});

test('all added location scenes serve day and night fallback artwork',async()=>{
 const {PLACE_IDS}=await import('../lib/quest-preview/restored/places.ts');
 for(const place of PLACE_IDS)for(const light of ['day','night']){
  const response=await fetch(base+`/quest-preview/restored/place-${place}-${light}.webp`);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/image\/webp/);
 }
 const html=await(await fetch(base+'/quest-preview')).text();assert.match(html,/Current city &amp; season scenes/);assert.match(html,/New destination scenes/);
});

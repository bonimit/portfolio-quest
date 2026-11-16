import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const origin='http://127.0.0.1:3100';
for(const theme of ['A5','H3','A2'])for(const view of ['grid','carousel'])test(`Adventure SSR: ${theme}/${view}`,async()=>{
 const r=await fetch(`${origin}/world?theme=${theme}&view=${view}`);assert.equal(r.status,200);const html=await r.text();
 assert.match(html,new RegExp(`data-theme="${theme}"`));assert.match(html,new RegExp(`adventure v-${view}`));
 assert.match(html,/Seat Optimizer/);assert.match(html,/AI Concierge/);assert.match(html,/Break the Bot/);
 assert.doesNotMatch(html,/Budget Run|Vacancy Radar|Festival Sound Logo|Full case study|Coming Soon|not playable yet/);
 assert.match(html,/href="\/"/);assert.equal((html.match(/<h1\b/g)||[]).length,1);
});
test('machine HTTP responses preserve all original bytes',async()=>{
 const hashes=JSON.parse(readFileSync(new URL('../lib/adventure/machine-hashes.json',import.meta.url)));
 for(const [name,hash]of Object.entries(hashes)){const r=await fetch(`${origin}/arcade/${name}`);assert.equal(r.status,200);assert.equal(createHash('sha256').update(new Uint8Array(await r.arrayBuffer())).digest('hex'),hash,name);}
});
test('production sample projects stay inaccessible even with template overrides',async()=>{
 for(const template of ['D0','D6']){const r=await fetch(`${origin}/work/sample-payments-onboarding?template=${template}`);assert.equal(r.status,404);}
 const html=await(await fetch(origin+'/work')).text();assert.doesNotMatch(html,/Payments onboarding flow|Template preview/);
});

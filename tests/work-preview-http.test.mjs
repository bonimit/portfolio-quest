import test from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_PROJECTS} from '../lib/work/sample-projects.ts';
import {parseWorkQuery,matches,sortProjects} from '../lib/work/projects.ts';
const origin=process.env.PREVIEW_ORIGIN||'http://localhost:3000';
const slugs=html=>[...html.matchAll(/<a class="work-card-link"[^>]*href="\/work\/(sample-[^"]+)"/g)].map(m=>m[1]);
for(const search of ['','?q=payments','?industry=FinTech','?discipline=Branding&model=B2C','?sort=az','?sort=newest','?sort=colour','?layout=grid','?q=zzzzz-no-matching-project'])test(`development discovery ${search||'default'}`,async()=>{
 const response=await fetch(origin+'/work'+search);assert.equal(response.status,200);const html=await response.text();
 const query=parseWorkQuery(Object.fromEntries(new URLSearchParams(search)));
 const expected=sortProjects(SAMPLE_PROJECTS.filter(p=>matches(p,query)),query.sort).map(p=>p.slug);
 assert.deepEqual(slugs(html),expected);
 if(!expected.length)assert.match(html,/No projects match/);
});
test('all twelve mock cards have working D6 project pages and return links',async()=>{
 for(const project of SAMPLE_PROJECTS){
  const response=await fetch(origin+'/work/'+project.slug);assert.equal(response.status,200,project.slug);const html=await response.text();
  assert.match(html,/class="tpl t6"/);assert.match(html,/Sample case study/);assert.match(html,/href="\/work"/);
 }
});

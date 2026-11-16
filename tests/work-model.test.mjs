import test from 'node:test';
import assert from 'node:assert/strict';
import {DIMENSIONS,emptyFilters,parseWorkQuery,toSearchString,matches,sortProjects,facetCount,quiltLayout,gridLayout} from '../lib/work/projects.ts';
import {SAMPLE_PROJECTS} from '../lib/work/sample-projects.ts';
test('all Selected Work filter dimensions round-trip through shareable URLs',()=>{
 const filters=emptyFilters();for(const d of DIMENSIONS)filters[d.key]=[...d.options].slice(0,2);
 const query={q:'restaurant & design',filters,sort:'az',layout:'grid'};
 assert.deepEqual(parseWorkQuery(Object.fromEntries(new URLSearchParams(toSearchString(query)))),query);
 const clean=parseWorkQuery({industry:'FinTech,unknown',sort:'bogus',layout:'bogus',q:'x'.repeat(100)});
 assert.deepEqual(clean.filters.industry,['FinTech']);assert.equal(clean.sort,'curated');assert.equal(clean.layout,'collage');assert.equal(clean.q.length,80);
});
test('Selected Work combines facets across dimensions and alternatives within a facet',()=>{
 const p=SAMPLE_PROJECTS[0],filters=emptyFilters();filters.industry=[p.tags.industry[0],'Real Estate'];filters.discipline=[p.tags.discipline[0]];
 const query={q:'',filters,sort:'curated',layout:'collage'};assert.ok(matches(p,query));
 const mismatch={...p,tags:{...p.tags,discipline:['Unrelated']}};assert.equal(matches(mismatch,query),false);
 assert.equal(facetCount([p,mismatch],query,'discipline',p.tags.discipline[0]),1);
});
test('sorting is stable in curated order and never mutates the project source',()=>{
 const source=[...SAMPLE_PROJECTS],before=source.map(p=>p.slug);
 assert.deepEqual(sortProjects(source,'curated').map(p=>p.slug),before);
 const az=sortProjects(source,'az');assert.ok(az.every((p,i)=>!i||az[i-1].title.localeCompare(p.title)<=0));
 const newest=sortProjects(source,'newest');assert.ok(newest.every((p,i)=>!i||newest[i-1].year>=p.year));
 assert.deepEqual(source.map(p=>p.slug),before);
});
test('collage and grid slots stay inside their twelve-column layout at every collection size',()=>{
 for(let n=0;n<35;n++)for(const layout of [quiltLayout,gridLayout]){const slots=layout(n);assert.equal(slots.length,n);for(const s of slots){assert.ok(s.colStart>=1&&s.colStart+s.col-1<=12);assert.ok(s.rowStart>=1);}}
});

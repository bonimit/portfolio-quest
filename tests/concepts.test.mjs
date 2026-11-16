import test from 'node:test';import assert from 'node:assert/strict';
import {labProjects,visualStudy} from '../lib/concepts.ts';
import {SAMPLE_PROJECTS} from '../lib/work/sample-projects.ts';
test('Concept Lab cross-lists concepts and graphic work without duplicating records',()=>{
 const all=labProjects(SAMPLE_PROJECTS);assert.equal(all.length,7);assert.equal(new Set(all.map(p=>p.slug)).size,7);
 assert.equal(labProjects(SAMPLE_PROJECTS,'Concepts & pitches').length,3);assert.equal(labProjects(SAMPLE_PROJECTS,'Art & graphic work').length,5);
 assert.equal(labProjects([]).length,0);
});
test('visual reading mode keeps original figures and concise text without modifying the full study',()=>{
 const study={lede:'Intro',facts:[],summary:['One','Two'],chapters:[{id:'text',title:'Context',body:['A','B']},{id:'image',title:'Exploration',body:['Caption','Longer details'],figure:{variant:'board',caption:'Original caption',alt:'Original description'}}]};
 const before=structuredClone(study),visual=visualStudy(study);assert.equal(visual.chapters.length,1);assert.equal(visual.chapters[0].body.length,1);assert.deepEqual(visual.chapters[0].figure,study.chapters[1].figure);assert.equal(visual.summary.length,1);assert.deepEqual(study,before);
 assert.equal(visualStudy({...study,chapters:[study.chapters[0]]}).chapters.length,1);
});

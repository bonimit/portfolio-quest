import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {adventureProjects,publishedCaseStudy} from '../lib/adventure/projects.ts';
import {DEFAULT_TEMPLATE,parseTemplate,TEMPLATES} from '../lib/work/templates.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
test('production exposes only the three built machines; examples stay development-only',()=>{
 const production=adventureProjects(false),development=adventureProjects(true);
 assert.equal(production.length,3);assert.equal(development.length,8);
 assert.ok(production.every(p=>p.machine&&!p.sample));
 assert.ok(development.slice(3).every(p=>p.sample&&!p.machine));
 assert.equal(new Set(development.map(p=>p.id)).size,8);
 assert.match(production[1].hook,/scripted/);assert.match(production[1].hook,/No live AI/);
});
test('case studies require an explicit slug present in published records',()=>{
 assert.equal(publishedCaseStudy(undefined,[{slug:'approved'}]),undefined);
 assert.equal(publishedCaseStudy('unpublished',[{slug:'approved'}]),undefined);
 assert.equal(publishedCaseStudy('approved',[]),undefined);
 assert.equal(publishedCaseStudy('approved',[{slug:'approved'}]),'/work/approved');
});
test('D6 is the approved default while all seven template choices remain available',()=>{
 assert.equal(DEFAULT_TEMPLATE,'D6');assert.equal(TEMPLATES.length,7);
 for(let i=0;i<=6;i++)assert.equal(parseTemplate(`d${i}`),`D${i}`);
 assert.equal(parseTemplate('D7'),undefined);
});
test('all machines and shared files match their handoff hashes exactly',()=>{
 const hashes=JSON.parse(read('lib/adventure/machine-hashes.json'));
 for(const [name,hash]of Object.entries(hashes))assert.equal(createHash('sha256').update(read('public/arcade/'+name)).digest('hex'),hash,name);
});
test('existing case study templates remain byte-identical to integration baseline',()=>{
 const hashes=JSON.parse(read('tests/fixtures/ad1-templates-protected.json'));
 for(const [name,hash]of Object.entries(hashes).filter(([p])=>p.startsWith('components/work/templates/')||p==='app/work/[slug]/case-study.css'))assert.equal(createHash('sha256').update(read(name)).digest('hex'),hash,name);
});
test('new self-hosted fonts retain source hashes and included OFL notices',()=>{
 const fonts=JSON.parse(read('assets/adventure-fonts.json'));
 for(const [path,record]of Object.entries(fonts)){const bytes=read(path);assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256,path);assert.match(record.source,/^https:\/\/raw\.githubusercontent\.com\/google\/fonts\/main\/ofl\//);if(path.endsWith('OFL.txt'))assert.match(bytes.toString(),/SIL OPEN FONT LICENSE/);}
});

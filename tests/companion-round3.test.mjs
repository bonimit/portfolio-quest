import test from 'node:test';
import assert from 'node:assert/strict';
import {getLocalGuideAnswer,guidePrompts,guideAnswers} from '../lib/guide/local-guide.ts';
import {dismissesCompanion,shouldRestoreCompanionFocus,suggestedPath} from '../lib/guide/panel-interaction.ts';
import {observeGuideVisibility} from '../lib/guide/observe-visibility.ts';
import {renderCompanion} from '../scripts/preview-companion.mjs';
const cases=[['Which way should I go?','choose'],["I'm lost",'choose'],['I’m lost','choose'],['lost','choose'],['directions','choose'],['How does this work?','site'],['chatgpt','transparency'],['skip the game','portfolio'],['I want to skip the game','portfolio'],['What can you do?','transparency']];
for(const [q,id] of cases)test(`Round 3 intent: ${q}`,()=>assert.equal(getLocalGuideAnswer(q).id,id));
test('all displayed examples resolve and fallback makes no unimplemented AI promise',()=>{
  for(const prompt of guidePrompts)assert.notEqual(getLocalGuideAnswer(prompt).id,'unmatched');
  assert.doesNotMatch(guideAnswers.unmatched.text,/yet|future|coming soon|will|real AI/i);
  assert.equal(guideAnswers.unmatched.avatarCue,'idle-front');
});
test('welcome offers visible destinations and the exact disclosure in a complementary region',()=>{
  const html=renderCompanion();
  assert.match(html,/Scripted guide · Not AI/);assert.match(html,/href="\/work"/);assert.match(html,/href="\/world"/);
  assert.match(html,/aria-label="Choose a destination"/);assert.doesNotMatch(html,/role="dialog"|aria-modal=/);
  assert.match(html,/tabindex="-1"/);
});
test('Escape and delayed close cannot steal focus from unrelated elements',()=>{
  const event={key:'Escape',defaultPrevented:false,isComposing:false};
  assert.equal(dismissesCompanion(event,false),false);assert.equal(dismissesCompanion(event,true),true);
  const inside={},outside={},panel={contains:node=>node===inside};
  assert.equal(shouldRestoreCompanionFocus(panel,inside),true);
  assert.equal(shouldRestoreCompanionFocus(panel,outside),false);assert.equal(shouldRestoreCompanionFocus(null,inside),false);
});
test('only specific requested paths receive a suggestion, not unknown or transparency answers',()=>{
  for(const answer of Object.values(guideAnswers))assert.equal(suggestedPath(answer),answer.id==='portfolio'?'portfolio':answer.id==='adventure'?'world':null);
});
test('visibility observer handles missing API, empty/unrelated batches, and late callbacks after cleanup',()=>{
  const original=globalThis.IntersectionObserver;
  try {
    delete globalThis.IntersectionObserver;
    const values=[];observeGuideVisibility({},v=>values.push(v))();assert.deepEqual(values,[true]);
    let callback,disconnected=false;const target={};
    globalThis.IntersectionObserver=class {constructor(fn){callback=fn;}observe(value){assert.equal(value,target);}disconnect(){disconnected=true;}};
    values.length=0;const stop=observeGuideVisibility(target,v=>values.push(v));
    callback([]);callback([{target:{},isIntersecting:false}]);assert.deepEqual(values,[]);
    callback([{target,isIntersecting:false}]);callback([{target,isIntersecting:true}]);assert.deepEqual(values,[false,true]);
    callback([{target,isIntersecting:false},{target,isIntersecting:true}]);assert.deepEqual(values,[false,true]);
    stop();assert.equal(disconnected,true);callback([{target,isIntersecting:false}]);assert.deepEqual(values,[false,true]);
  }finally{globalThis.IntersectionObserver=original;}
});

test('walking algorithm, atlas, extracted art and playback implementation match pre-Round-3 hashes',async()=>{
  const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
  const read=path=>readFileSync(new URL('../'+path,import.meta.url));
  const fixture=JSON.parse(read('tests/fixtures/avatar-movement-preserved-sha256.json'));
  for(const [path,hash] of Object.entries(fixture.files))assert.equal(createHash('sha256').update(read(path)).digest('hex'),hash,path);
  const walking=read('components/entrance/walking-guide.tsx').toString();
  const core=walking.slice(walking.indexOf('    const limit ='),walking.indexOf('    const enter ='));
  assert.equal(createHash('sha256').update(core).digest('hex'),fixture.walkingCoreSha256);
});

test('live matrix runner covers all requested widths and has valid browser-script syntax',async()=>{
  const {readFileSync}=await import('node:fs');const {Script}=await import('node:vm');
  const html=readFileSync(new URL('./browser/companion.html',import.meta.url),'utf8');
  const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];assert.doesNotThrow(()=>new Script(source));
  const widths=JSON.parse('['+source.match(/const widths=\[([^\]]+)\]/)[1]+']');
  assert.deepEqual(widths,[320,390,768,1024,1279,1280,1440,1920]);
});

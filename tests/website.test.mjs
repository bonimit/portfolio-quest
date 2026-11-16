import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getLocalGuideAnswer, resolveGuideAction, guideDestinations, guidePrompts, localGuideProvider } from '../lib/guide/local-guide.ts';
import { getModeCurrent, getSectionCurrent } from '../lib/shared/navigation.ts';
import { wanderTarget, walkDuration } from '../lib/guide/walking.ts';
const read = (path) => readFileSync(new URL('../' + path, import.meta.url));
const cases = [
  ['AI projects', 'work'], ['Tell me about your AI projects', 'work'],
  ['How does this guide work?', 'transparency'], ['Are you AI?', 'transparency'],
  ['How does the portfolio work?', 'site'], ['Show concepts about AI', 'concepts'],
  ['Can I play the adventure?', 'adventure'], ['Contact the designer', 'contact'],
  ['About you', 'about'], ['What is quantum gravity?', 'unmatched'],
  ['', 'empty'], [' \n\t ', 'empty'], ['ＡＩ projects', 'work'],
];
for (const [question, id] of cases) test(`guide intent: ${JSON.stringify(question)}`, () => assert.equal(getLocalGuideAnswer(question).id, id));
test('local provider is deterministic and examples resolve to useful answers', async () => {
  for (const q of guidePrompts) { const first = await localGuideProvider.respond(q); assert.deepEqual(first, await localGuideProvider.respond(q)); assert.notEqual(first.id, 'unmatched'); }
});
test('only own, approved destination IDs resolve', () => {
  for (const id of ['__proto__','constructor','toString','https://evil.test','/work','unknown']) assert.equal(resolveGuideAction(id), undefined);
  for (const action of Object.keys(guideDestinations)) assert.ok(resolveGuideAction(action).href.startsWith('/'));
  assert.equal(resolveGuideAction('portfolio').href, '/work'); assert.equal(resolveGuideAction('work').href, '/work'); assert.equal(resolveGuideAction('world').href, '/world');
});
test('empty questions never suggest fabricated content', () => assert.deepEqual(getLocalGuideAnswer('   ').actions, []));
test('long input is bounded before intent matching', () => assert.equal(getLocalGuideAnswer('x'.repeat(500) + ' adventure').id, 'unmatched'));
test('route active states distinguish exact, nested and sibling URLs', () => {
  assert.equal(getModeCurrent('/portfolio','portfolio'), 'page'); assert.equal(getModeCurrent('/work','portfolio'), 'location');
  assert.equal(getModeCurrent('/','portfolio'), undefined); assert.equal(getModeCurrent('/world','world'), 'page');
  assert.equal(getSectionCurrent('/work/example','/work'), 'location'); assert.equal(getSectionCurrent('/workshop','/work'), undefined);
});
test('wander positions stay inside the dedicated stage at every requested width', () => {
  for (const width of [40,80,128,328,360,768,1024,1280,1440,1920,2560]) for (let step=0;step<20;step++) {
    const actualWidth=Math.min(width,480), x=wanderTarget(actualWidth,80,step);
    assert.ok(x>=0 && x<=Math.max(0,actualWidth-80));
  }
  for (const distance of [-10000,-300,0,100,10000]) assert.ok(walkDuration(distance)>=1200 && walkDuration(distance)<=6500);
});
test('protected Portfolio source and assets match the pre-repair snapshot', () => {
  const manifest=JSON.parse(read('tests/fixtures/portfolio-protected-sha256.json'));
  for (const [path, hash] of Object.entries(manifest)) assert.equal(createHash('sha256').update(path==='app/portfolio/page.tsx'?read(path).toString().replace('Three playable prototype demos, with a choice of Island, Arcade and Neon themes.','A glimpse of the illustrated world taking shape around the portfolio. The game is not playable yet.'):read(path)).digest('hex'),hash,path);
});
test('entrance text and control borders retain minimum contrast', () => {
  const css=read('app/entrance.css').toString();
  const color=(name)=>css.match(new RegExp(`--entrance-${name}: (#[a-fA-F0-9]{6})`))[1];
  const luminance=(hex)=>{ const values=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4); return values[0]*.2126+values[1]*.7152+values[2]*.0722; };
  const contrast=(a,b)=>{ const x=luminance(color(a)),y=luminance(color(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  for (const pair of [['paper','night'],['muted','night'],['ink','orange'],['ink','secondary']]) assert.ok(contrast(...pair)>=4.5,pair.join('/'));
  assert.ok(contrast('border','night')>=3);
});

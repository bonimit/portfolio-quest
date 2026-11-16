import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCompanion } from '../scripts/preview-companion.mjs';
import { dismissesCompanion, companionExitDelay } from '../lib/guide/panel-interaction.ts';

test('real React panel renders complementary semantics, labelled controls and honest disclosure',()=> {
  const html=renderCompanion();
  assert.match(html,/<aside[^>]*id="companion-panel"/);
  assert.doesNotMatch(html,/role="dialog"|aria-modal=/);
  assert.doesNotMatch(html,/<dialog\b|\sinert(?:=|\s|>)/);
  assert.match(html,/aria-labelledby="guide-title"/);assert.match(html,/Scripted guide · Not AI/);
  assert.match(html,/aria-label="Close guide"/);assert.match(html,/id="guide-question"/);
  assert.match(html,/role="status" aria-atomic="true"/);
  assert.equal((html.match(/disabled=""/g)||[]).length,0);
  assert.equal((html.match(/class="guide-examples"/g)||[]).length,1);
  assert.match(html,/data-paused="true"/);
});
test('Escape dismisses without stealing composition or already-handled keys',()=> {
  assert.equal(dismissesCompanion({key:'Escape',defaultPrevented:false,isComposing:false}),true);
  for(const e of [{key:'Tab',defaultPrevented:false,isComposing:false},{key:'Escape',defaultPrevented:true,isComposing:false},{key:'Escape',defaultPrevented:false,isComposing:true}])assert.equal(dismissesCompanion(e),false);
});
test('exit is immediate for pause/reduced motion, otherwise one short closing gesture',()=> {
  assert.equal(companionExitDelay(false,false),180);
  for(const [reduce,pause] of [[true,false],[false,true],[true,true]])assert.equal(companionExitDelay(reduce,pause),0);
});

test('paper panel text, muted disclosure and focus indicator have sufficient contrast',async()=> {
  const {readFileSync}=await import('node:fs');
  const css=readFileSync(new URL('../app/entrance.css',import.meta.url),'utf8');
  const hex=(name)=>css.match(new RegExp(`--guide-${name}: (#[a-f0-9]{6})`))[1];
  const lum=(hex)=>{const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
  const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  assert.ok(ratio(hex('ink'),hex('paper'))>=4.5);
  assert.ok(ratio(hex('muted'),hex('paper'))>=4.5);
  assert.ok(ratio('#a44700',hex('paper'))>=3);
  assert.ok(ratio(hex('ink'),hex('orange'))>=4.5);
});

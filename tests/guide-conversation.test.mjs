import test from 'node:test';
import assert from 'node:assert/strict';
import { guideAnswers, getLocalGuideAnswer } from '../lib/guide/local-guide.ts';
import { ConversationActivity } from '../lib/guide/conversation-activity.ts';
import { holdsGuideFocus, travelClockProgress, travelKeyframes, walkFrame } from '../lib/guide/assistant-motion.ts';
import { ASSISTANT_ATLAS } from '../lib/guide/assistant-atlas.ts';
import { readFileSync } from 'node:fs';

const mapping = {greeting:'idle-front',portfolio:'happy',site:'idle-front',transparency:'idle-front',work:'idle-front',adventure:'idle-front',concepts:'idle-front',about:'idle-front',contact:'idle-front',choose:'idle-front',unmatched:'idle-front',empty:'idle-front'};
test('complete explicit answer-to-animation mapping', () => {
  assert.deepEqual(Object.keys(guideAnswers).sort(),Object.keys(mapping).sort());
  for (const [id,cue] of Object.entries(mapping)) {
    assert.equal(guideAnswers[id].id,id); assert.equal(guideAnswers[id].avatarCue,cue,id);
  }
  assert.deepEqual(guideAnswers.portfolio.actions,['portfolio']);
});
const cases=[
  ['Hi','greeting'],['Hello!','greeting'],['Hey Wayfinder','greeting'],['Good morning','greeting'],
  ['Are you real AI?','transparency'],['Are you a human or a bot?','transparency'],
  ['Do you use AI?','transparency'],['What AI model are you?','transparency'],
  ['What can you do?','transparency'],['Who are you?','transparency'],
  ['Is this guide AI powered?','transparency'],['How does the guide work?','transparency'],
  ['Tell me about this site','site'],['What is Portfolio Quest?','site'],
  ['How does this website work?','site'],['Tell me about yourself','about'],
  ['View Portfolio','portfolio'],['Take me to the portfolio','portfolio'],['Go home','portfolio'],
  ['Open the homepage','portfolio'],['Where is the work?','work'],['Show me your AI projects','work'],
  ['Show concepts about AI','concepts'],['Open Prototype Arcade','concepts'],
  ['Are you AI? Show projects','transparency'],['Are your AI projects published?','work'],
  ['Can I play the adventure?','adventure'],['Show me game projects','work'],
  ['Can I contact the designer?','contact'],['Which path should I choose?','choose'],
  ['What is quantum gravity?','unmatched'],['  ','empty'],
];
for (const [q,id] of cases) test(`intent/cue: ${q}`,()=> {
  const answer=getLocalGuideAnswer(q);assert.equal(answer.id,id);assert.equal(answer.avatarCue,mapping[id]);
});
test('unavailable destinations disclose content status and never celebrate',()=> {
  for(const id of ['work','concepts','about','contact']) {
    assert.equal(guideAnswers[id].avatarCue,'idle-front');
    assert.match(guideAnswers[id].text,/not available|not a playable|placeholders|awaiting/);
  }
});
function harness() {
  let now=0,id=0;const tasks=new Map(),events=[];
  const clock={set(fn,delay){const key=++id;tasks.set(key,{at:now+delay,fn});return key;},clear(key){tasks.delete(key);}};
  const activity=new ConversationActivity(pose=>events.push([now,pose]),clock);
  const advance=(ms)=>{const end=now+ms;while(true){const next=[...tasks].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;now=next[1].at;tasks.delete(next[0]);next[1].fn();}now=end;};
  return {activity,advance,events,tasks};
}
test('successful navigation talks then celebrates and returns to idle at exact boundaries',()=> {
  const h=harness();h.activity.answer('happy');h.advance(2199);assert.deepEqual(h.events,[[0,'talking']]);
  h.advance(1);assert.deepEqual(h.events.at(-1),[2200,'happy']);h.advance(899);assert.equal(h.tasks.size,1);
  h.advance(1);assert.deepEqual(h.events.at(-1),[3100,'idle-front']);assert.equal(h.tasks.size,0);
});
test('all neutral answers cancel old activity and remain idle without thinking or happiness',()=> {
  for(const answer of Object.values(guideAnswers).filter(x=>x.avatarCue==='idle-front')) {
    const h=harness();h.activity.answer('happy');h.advance(100);h.activity.answer(answer.avatarCue);h.advance(10000);
    assert.deepEqual(h.events,[[0,'talking'],[100,'idle-front']]);assert.equal(h.tasks.size,0);
  }
});
test('greeting ends, response replacement cancels old timers, destroy prevents later updates',()=> {
  const h=harness();h.activity.greet();h.advance(1100);assert.deepEqual(h.events.at(-1),[1100,'idle-front']);
  h.activity.answer('happy');h.advance(500);h.activity.answer('happy');h.advance(1700);assert.equal(h.events.at(-1)[1],'talking');
  h.activity.destroy();const count=h.events.length;h.advance(10000);assert.equal(h.events.length,count);assert.equal(h.tasks.size,0);
});
test('keyboard focus holds the guide; restored pointer/touch focus does not',()=> {
  assert.equal(holdsGuideFocus(true,true),true);
  for(const [keyboard,visible] of [[false,true],[false,false],[true,false]])assert.equal(holdsGuideFocus(keyboard,visible),false);
});
test('gait phase uses the same native interpolation at 60/120Hz and after missed frames',()=> {
  for(const duration of [1200,2400,6500]) {
    const keys=travelKeyframes(16,360,duration),position=key=>Number(key.transform.match(/\(([-\d.]+)px/)[1]);
    for(let i=1;i<keys.length;i++) {
      const t=(keys[i-1].offset+keys[i].offset)/2;
      const expected=(position(keys[i-1])+position(keys[i]))/2;
      assert.ok(Math.abs(16+344*travelClockProgress(t*duration,duration)-expected)<1e-9);
    }
    for(const elapsed of [0,1000/120,1000/60,450,1199,duration,duration+100]){
      const distance=344*travelClockProgress(elapsed,duration);
      assert.ok(distance>=0 && distance<=344);
      assert.ok(ASSISTANT_ATLAS.groups['walk-right'].includes(walkFrame('right',distance)));
    }
  }
});
test('runtime atlas IDs/coordinates agree exactly with every measured asset map frame',()=> {
  const map=JSON.parse(readFileSync(new URL('../assets/guide/frame-map.json',import.meta.url)));
  assert.deepEqual(map.groups,ASSISTANT_ATLAS.groups);
  assert.equal(map.cell[0],ASSISTANT_ATLAS.width);assert.equal(map.cell[1],ASSISTANT_ATLAS.height);
  assert.equal(map.columns,ASSISTANT_ATLAS.columns);assert.equal(map.rows,ASSISTANT_ATLAS.rows);
  map.frames.forEach((frame,i)=>{assert.equal(frame.id,i);assert.equal(frame.outputFootY,160);});
});

test("Adventure describes actual prototypes without implying a roaming RPG",()=>{ assert.equal(guideAnswers.adventure.avatarCue,"idle-front"); assert.match(guideAnswers.adventure.text,/three playable prototype demos/); assert.match(guideAnswers.adventure.text,/not a roaming RPG/); });

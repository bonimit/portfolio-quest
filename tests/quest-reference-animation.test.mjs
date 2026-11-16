import test from 'node:test';
import assert from 'node:assert/strict';
import {PoseBlend,POSE_BLEND_MS,questWalkFrame,questTurnFrames,TURN_SETTLE_MS} from '../lib/quest-preview/avatar-animation.ts';
import {PROVIDED_WALK,frameBounds} from '../lib/quest-preview/provided-avatar.ts';
import {QuestSpritePlayer} from '../lib/quest-preview/quest-sprite-player.ts';
import {ENTRY_TURN_MS} from '../lib/quest-preview/actors.ts';
import {ENTRY_TIMING} from '../lib/quest-preview/destination-transition.ts';

test('forward gait uses each measured frame once and loops without reversing its order',()=>{
  for(const direction of ['left','right']){
    const frames=PROVIDED_WALK[direction];
    assert.deepEqual(frames.map((_,i)=>questWalkFrame(direction,(i+.01)*36/frames.length)),frames);
    assert.equal(questWalkFrame(direction,36),frames[0]);
    assert.equal(questWalkFrame(direction,-100),frames[0]);
  }
});
test('turn preparation and doorway alignment allow every partial turn to finish before entry',()=>{
  assert.equal(ENTRY_TURN_MS,TURN_SETTLE_MS);assert.equal(ENTRY_TIMING.align,TURN_SETTLE_MS);
  for(const from of ['front','right','back','left'])for(const to of ['front','right','back','left']){
    const frames=questTurnFrames(from,to);
    assert.ok(frames.reduce((sum,f)=>sum+f.duration,0)<=TURN_SETTLE_MS);
    if(from===to)assert.equal(frames.length,0);
  }
});
test('poses blend for 200ms while walking frames remain crisp and do not restart the blend',()=>{
  const b=new PoseBlend();assert.equal(b.sample('idle-front',0,0).mix,1);
  assert.deepEqual(b.sample('walk-right',15,100),{from:0,to:15,mix:0});
  assert.deepEqual(b.sample('walk-right',16,200),{from:0,to:16,mix:.5});
  assert.equal(b.sample('walk-right',17,100+POSE_BLEND_MS).mix,1);
  assert.equal(b.sample('walk-right',18,500).mix,1);
  assert.deepEqual(b.sample('turn',10,501),{from:18,to:10,mix:0});
});
test('paused/reduced static mode immediately settles the pose and never resumes an old blend',()=>{
  const b=new PoseBlend();b.sample('walk-left',22,0);
  assert.equal(b.sample('idle-front',0,20,true).mix,1);
  assert.equal(b.sample('idle-front',0,30,false).mix,1);
});
test('quest player advances atlas transforms without foot-clock timers and returns safely to idle',async()=>{
  const prior=globalThis.window,pending=new Map();let id=0;
  globalThis.window={setTimeout(fn){pending.set(++id,fn);return id;},clearTimeout(key){pending.delete(key);}};
  const sheet=new EventTarget();Object.assign(sheet,{complete:true,naturalWidth:1008,style:{},decode:()=>Promise.resolve()});
  const root={dataset:{},querySelector:()=>sheet};
  try {
    const p=new QuestSpritePlayer(root);for(let i=0;i<5;i++)await Promise.resolve();
    for(const direction of ['right','left'])for(let i=0;i<8;i++){
      p.walk(direction,(i+.01)*36/8);
      const frame=PROVIDED_WALK[direction][i];
      assert.equal(root.dataset.frame,String(frame));assert.equal(root.dataset.pose,`walk-${direction}`);
      const [x,y]=sheet.style.transform.match(/-?[\d.]+(?=%)/g).map(Number);
      const [bx,by]=frameBounds(frame);
      assert.ok(Math.abs(x+(frame%8*89+bx)/712*100)<1e-8);assert.ok(Math.abs(y+(Math.floor(frame/8)*150+by)/1500*100)<1e-8);
      assert.equal(pending.size,0);
    }
    p.play('idle-front');assert.equal(root.dataset.pose,'idle-front');assert.equal(root.dataset.frame,'0');assert.equal(pending.size,1);
    p.destroy();assert.equal(pending.size,0);
  } finally {globalThis.window=prior;}
});
test('depth steps retain the supplied back pose, stop for a side turn, and clean up their layers',async()=>{
 const prior=globalThis.window,pending=new Map();let id=0;
 globalThis.window={setTimeout(fn){pending.set(++id,fn);return id;},clearTimeout(key){pending.delete(key);}};
 const style=()=>({cssText:'',setProperty(name,value){this[name]=value;}});
 const children=[],sheet=new EventTarget();Object.assign(sheet,{complete:true,naturalWidth:712,style:style(),decode:()=>Promise.resolve(),cloneNode(){return {style:{...this.style},removeAttribute(){}};}});
 const root={dataset:{},style:style(),querySelector:()=>sheet,append(node){children.push(node);},ownerDocument:{createElement(){return {append(child){child.parentElement=this;},remove(){children.splice(children.indexOf(this),1);}};}}};
 const player=new QuestSpritePlayer(root);
 try{
  for(let i=0;i<6;i++)await Promise.resolve();
  player.depthWalk('back',9);assert.equal(root.dataset.frame,'26');assert.equal(root.dataset.depthWalking,'back');assert.equal(children.length,5);assert.equal(pending.size,0);
  const left=root.style['--depth-left-lift'];player.depthWalk('back',27);assert.equal(children.length,5);assert.notEqual(root.style['--depth-left-lift'],left);
  player.walk('left',9);assert.equal(root.dataset.depthWalking,undefined);assert.equal(root.dataset.pose,'walk-left');
  player.depthWalk('front',9);assert.equal(root.dataset.frame,'0');player.staticFront();assert.equal(root.dataset.depthWalking,undefined);
 }finally{player.destroy();globalThis.window=prior;}
 assert.equal(children.length,0);assert.equal(pending.size,0);
});

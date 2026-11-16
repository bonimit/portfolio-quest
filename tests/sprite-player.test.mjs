import test from 'node:test';
import assert from 'node:assert/strict';
import { SpritePlayer } from '../lib/guide/sprite-player.ts';
import { ASSISTANT_ATLAS } from '../lib/guide/assistant-atlas.ts';

function surface(decode = () => Promise.resolve()) {
  const pending=new Map();let next=0;
  const prior=globalThis.window;
  globalThis.window={setTimeout(fn){pending.set(++next,fn);return next;},clearTimeout(id){pending.delete(id);}};
  const sheet=new EventTarget();Object.assign(sheet,{complete:true,naturalWidth:1008,style:{},decode});
  const root={dataset:{},querySelector:()=>sheet};
  return {sheet,root,pending,restore(){globalThis.window=prior;}};
}
const loaded=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
test('one decoded atlas paints all frame positions using transforms and stops on destroy',async()=> {
  const h=surface();try {
    const player=new SpritePlayer(h.root);await loaded();assert.equal(player.ready,true);assert.equal(h.root.dataset.loaded,'true');
    for(let frame=0;frame<42;frame++){
      player.sequence('turn',[{frame,duration:100}],false);
      assert.equal(h.root.dataset.frame,String(frame));
      const [x,y]=h.sheet.style.transform.match(/-?[\d.]+(?=%)/g).map(Number);
      assert.ok(Math.abs(x+(frame%7)*100/7)<1e-8);
      assert.ok(Math.abs(y+Math.floor(frame/7)*100/6)<1e-8);
      assert.equal(h.sheet.style.left,undefined);assert.equal(h.sheet.style.top,undefined);
    }
    player.staticFront();assert.equal(h.root.dataset.frame,String(ASSISTANT_ATLAS.groups['idle-front'][0]));
    assert.equal(h.pending.size,0);player.play('talking');assert.equal(h.pending.size,1);
    player.destroy();assert.equal(h.pending.size,0);
  }finally{h.restore();}
});
test('late decode cannot restart a destroyed player',async()=> {
  let resolve;const h=surface(()=>new Promise(done=>{resolve=done;}));try {
    const player=new SpritePlayer(h.root);player.destroy();resolve();await loaded();
    assert.equal(h.root.dataset.loaded,undefined);assert.equal(h.pending.size,0);
  }finally{h.restore();}
});
test('failed atlas keeps the static poster visible and clears the player clock',()=> {
  const h=surface();try {
    h.sheet.complete=false;h.sheet.naturalWidth=0;
    const player=new SpritePlayer(h.root);h.sheet.dispatchEvent(new Event('error'));
    assert.equal(h.root.dataset.failed,'true');assert.equal(h.root.dataset.loaded,undefined);
    assert.equal(h.pending.size,0);player.destroy();
  }finally{h.restore();}
});

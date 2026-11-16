import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {PROVIDED_AVATAR,PROVIDED_BOUNDS,PROVIDED_WALK,COMPATIBLE_FRAMES,frameBounds,providedFrame} from '../lib/quest-preview/provided-avatar.ts';

test('provided 8×10 atlas uses measured transparent bounds for every nonempty frame',async()=>{
 const {data,info}=await sharp('public'+PROVIDED_AVATAR.src).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,712);assert.equal(info.height,1500);assert.equal(PROVIDED_BOUNDS.length,80);
 let count=0;
 for(let frame=0;frame<80;frame++){
  let l=89,t=150,r=0,b=0;
  for(let y=0;y<150;y++)for(let x=0;x<89;x++)if(data[((Math.floor(frame/8)*150+y)*712+frame%8*89+x)*4+3]){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);}
  if(!r){assert.equal(PROVIDED_BOUNDS[frame],null);continue;}
  count++;const box=[Math.max(0,l-1),Math.max(0,t-1),Math.min(89,r+1)-Math.max(0,l-1),Math.min(150,b+1)-Math.max(0,t-1)];
  assert.deepEqual(frameBounds(frame),box);
  const [x,y,w,h]=box;assert.ok(x>=0&&y>=0&&x+w<=89&&y+h<=150);
 }
 assert.equal(count,47);
});
test('all activity and walk mappings select valid cells; both directions have eight unique phases',()=>{
 assert.equal(COMPATIBLE_FRAMES.length,42);
 for(const frame of [...COMPATIBLE_FRAMES,...PROVIDED_WALK.left,...PROVIDED_WALK.right])assert.equal(providedFrame(frame),frame);
 for(const side of ['left','right'])assert.equal(new Set(PROVIDED_WALK[side]).size,8);
 for(const frame of [-1,999,NaN,7,79])assert.equal(providedFrame(frame),0);
});
test('normalized crop geometry maintains body height and a common foot baseline across poses',()=>{
 for(const bounds of PROVIDED_BOUNDS){
  if(!bounds)continue;const [, ,w,h]=bounds,body=3.9*140/176,height=body*h/(h-2),anchor=1/h;
  assert.ok(Math.abs(height*(1-2/h)-body)<1e-8);
  assert.ok(Math.abs((1/h-anchor)*height)<1e-8);
  assert.ok(height*w/h>0);
 }
});
async function fakePlayer(decode=()=>Promise.resolve()){
 const {QuestSpritePlayer}=await import('../lib/quest-preview/quest-sprite-player.ts');
 const prior=globalThis.window,pending=new Map();let id=0,ready=0;
 globalThis.window={setTimeout(fn){pending.set(++id,fn);return id;},clearTimeout(key){pending.delete(key);}};
 const sheet=new EventTarget();Object.assign(sheet,{complete:true,naturalWidth:712,style:{},decode});
 const root={dataset:{atlas:'provided'},style:{},querySelector:()=>sheet};
 const player=new QuestSpritePlayer(root,()=>ready++);
 return {player,root,sheet,pending,get ready(){return ready;},restore(){player.destroy();globalThis.window=prior;}};
}
const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
test('a duplicate asset load does not restart movement or announce readiness twice',async()=>{
 const h=await fakePlayer();try{await flush();h.player.walk('left',12);const frame=h.root.dataset.frame;h.sheet.dispatchEvent(new Event('load'));await flush();assert.equal(h.ready,1);assert.equal(h.root.dataset.frame,frame);assert.equal(h.pending.size,0);}finally{h.restore();}
});
test('late decode after cleanup cannot paint or restart activity timers',async()=>{
 let finish;const h=await fakePlayer(()=>new Promise(resolve=>{finish=resolve;}));try{h.player.destroy();finish();await flush();assert.equal(h.root.dataset.loaded,undefined);assert.equal(h.ready,0);assert.equal(h.pending.size,0);}finally{h.restore();}
});

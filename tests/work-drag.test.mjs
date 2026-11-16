import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
// Run the actual hook against a deterministic event/animation clock; no copied drag algorithm.
function harness(){
 const effects=[],frames=new Map(),listeners=new Map(),timers=[];let now=0,id=0;const swaps=[],drops=[];
 const classes=()=>({values:new Set(),add(v){this.values.add(v)},remove(v){this.values.delete(v)}});
 const node=(slug,x)=>({dataset:{slug},offsetLeft:x,offsetTop:0,offsetWidth:200,offsetHeight:200,style:{transform:''},classList:classes(),getBoundingClientRect(){return {left:this.offsetLeft,top:0,width:200,height:200}},getAnimations:()=>[],animate(){}});
 const a=node('a',0),b=node('b',230),ghost=node('',0);
 const grid={getBoundingClientRect:()=>({left:0,top:100}),contains:n=>n===a||n===b,querySelectorAll:()=>[a,b]};
 a.closest=()=>a;
 const win={innerHeight:1000,scrollBy(){},addEventListener(k,f){listeners.set(k,f)},removeEventListener(k,f){if(listeners.get(k)===f)listeners.delete(k)}};
 const doc={documentElement:{classList:classes()}};
 const hookModule={exports:{}};
 const code=ts.transpileModule(readFileSync(new URL('../components/work/use-card-drag.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module:hookModule,exports:hookModule.exports,require:()=>({useRef:current=>({current}),useEffect:f=>effects.push(f)}),window:win,document:doc,performance:{now:()=>now},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i),getComputedStyle:()=>({transform:'none'}),matchMedia:()=>({matches:false}),setTimeout:f=>timers.push(f)});
 const hook=hookModule.exports.useCardDrag({onSwap:(...args)=>{swaps.push(args);a.offsetLeft=230;b.offsetLeft=0;},onDrop:s=>drops.push(s)});
 hook.ghostRef.current=ghost;const cleanup=effects.map(f=>f()).filter(Boolean);
 const event=(extra={})=>({pointerType:'mouse',button:0,target:a,currentTarget:grid,clientX:100,clientY:200,preventDefault(){this.prevented=true},...extra});
 const tick=()=>{now+=16;const batch=[...frames.values()];frames.clear();batch.forEach(f=>f());};
 return {hook,event,tick,listeners,frames,timers,swaps,drops,a,ghost,cleanup,doc};
}
test('drag reorders the actual card, suppresses accidental navigation, and releases the animation clock',()=>{
 const h=harness(),e=h.event();h.hook.onPointerDown(e);assert.ok(e.prevented);
 h.listeners.get('pointermove')({clientX:330,clientY:200});for(let i=0;i<13;i++)h.tick();
 assert.deepEqual(Array.from(h.swaps[0]),['a','b']);assert.match(h.a.style.transform,/translate/);assert.ok(h.ghost.classList.values.has('on'));
 h.listeners.get('pointerup')();assert.deepEqual(h.drops,['a']);assert.equal(h.listeners.size,0);assert.equal(h.frames.size,0);assert.equal(h.a.style.transform,'');
 let prevented=false,stopped=false;h.hook.onClickCapture({preventDefault(){prevented=true},stopPropagation(){stopped=true}});assert.ok(prevented&&stopped);
 h.timers.forEach(f=>f());prevented=false;h.hook.onClickCapture({preventDefault(){prevented=true},stopPropagation(){}});assert.equal(prevented,false);
});
test('ordinary clicks do not reorder or suppress project links',()=>{
 const h=harness();h.hook.onPointerDown(h.event());h.tick();h.listeners.get('pointerup')();assert.equal(h.swaps.length,0);assert.equal(h.drops.length,0);
 let prevented=false;h.hook.onClickCapture({preventDefault(){prevented=true},stopPropagation(){}});assert.equal(prevented,false);
});
test('touch scrolling and secondary mouse buttons never start a drag',()=>{
 for(const extra of [{pointerType:'touch'},{button:2}]){const h=harness(),e=h.event(extra);h.hook.onPointerDown(e);assert.equal(e.prevented,undefined);assert.equal(h.listeners.size,0);assert.equal(h.frames.size,0);}
});
test('unmount during dragging disposes listeners and frames without a drop callback',()=>{
 const h=harness();h.hook.onPointerDown(h.event());h.cleanup.forEach(f=>f());assert.equal(h.frames.size,0);assert.equal(h.listeners.size,0);assert.equal(h.drops.length,0);assert.equal(h.hook.draggingSlug(),undefined);assert.equal(h.a.style.transform,'');
});

test('a fast drop between animation frames still reorders at the final pointer position',()=>{
 const h=harness();h.hook.onPointerDown(h.event());h.listeners.get('pointermove')({clientX:330,clientY:200});h.listeners.get('pointerup')();assert.deepEqual(Array.from(h.swaps[0]),['a','b']);assert.equal(h.frames.size,0);assert.deepEqual(h.drops,['a']);
});

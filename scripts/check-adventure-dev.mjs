// Read-only acceptance check against the owner's existing development server.
import assert from 'node:assert/strict';
const origin=process.env.PREVIEW_ORIGIN||'http://127.0.0.1:3000';
for(let i=0;i<=6;i++){
 const response=await fetch(`${origin}/work/sample-payments-onboarding?template=D${i}`);
 assert.equal(response.status,200,`D${i}`);const html=await response.text();
 assert.match(html,/Sample case study|Sample project/);assert.match(html,/Template preview/);
 if(i>0)assert.match(html,new RegExp(`class="tpl t${i}"`));
 console.log(`PASS D${i}: sample-only template renders`);
}
const html=await(await fetch(origin+'/work/sample-payments-onboarding')).text();assert.match(html,/class="tpl t6"/);console.log('PASS default: D6');
const adventure=await(await fetch(origin+'/world')).text();assert.match(adventure,/Budget Run/);assert.match(adventure,/sample, not built/);console.log('PASS development-only Adventure tiles');
console.log('HTTP coverage only; browser visual, focus, drag and console checks are separate.');

import test from 'node:test';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:3100';
const routes=['/','/portfolio','/work','/concepts','/arcade','/about','/contact','/world'];
for (const route of routes) test(`production route ${route}`, async () => {
  const response=await fetch(origin+route); assert.equal(response.status,200);
  const html=await response.text();
  assert.equal((html.match(/<main\b/g)||[]).length,1);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/<title>[^<]+<\/title>/);
  assert.match(html,/<meta name="description" content="[^"]+"/);
  assert.match(html,/href="#main-content"/);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]); assert.equal(new Set(ids).size,ids.length);
  if (route==='/') {
    assert.equal((html.match(/class="quest-sign quest-sign--/g)||[]).length,3);
    assert.match(html,/href="\/portfolio"/);assert.match(html,/href="\/world"/);
    assert.match(html,/class="quest-sign quest-sign--concepts"[^>]*href="\/concepts"/);
    assert.match(html,/href="\/work"[^>]*>Selected Work/);
    assert.match(html,/Talk to me — Wayfinder, the local scripted guide/);
    assert.match(html,/Playable prototypes/);
    assert.match(html,/New destination scenes/);
    assert.match(html,/<summary>Settings/);
    assert.doesNotMatch(html,/Coming soon|Not playable|class="mode-bar/);
  } else if(route!=='/world') assert.match(html,new RegExp(`aria-current="page" href="${route}"`));
  if (route==='/portfolio') {
    assert.equal((html.match(/class="landing-card landing-card--/g)||[]).length,6);
    assert.match(html,/Pause motion/); assert.match(html,/>Selected Work<\/span>/);
  }
  if (route==='/contact') { assert.match(html,/Copy message draft/); assert.match(html,/LinkedIn/); assert.match(html,/type="email"/); assert.match(html,/No server submission/); assert.doesNotMatch(html,/href="mailto:/); }
  if (route==='/world') { assert.match(html,/Choose a project to play/); assert.match(html,/Seat Optimizer/); assert.doesNotMatch(html,/Budget Run|Template preview|not implemented yet/); }
  const assets=[...new Set([...html.matchAll(/(?:src|href)="([^" ]+\.(?:css|js|ttf|woff2|webp))"/g)].map(x=>x[1]))];
  for (const asset of assets) assert.equal((await fetch(origin+asset)).status,200,asset);
});
test('unknown route retains custom 404',async()=> { const response=await fetch(origin+'/round2-missing'); assert.equal(response.status,404); assert.match(await response.text(),/Lost|lost|404/); });

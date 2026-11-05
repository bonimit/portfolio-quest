import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

// This helper is a rendering adapter, not a security sandbox. The integration
// coordinator executes it inside the OS sandbox along with all other checks.
export async function renderNotice(worktree, message) {
  const require = createRequire(join(resolve(worktree), "package.json"));
  const ts = require("typescript");
  const source = await readFile(join(worktree, "components/integration/IntegrationNotice.tsx"), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const fixtureModule = { exports: {} };
  runInNewContext(compiled, {
    module: fixtureModule, exports: fixtureModule.exports,
    require: name => {
      assert.ok(["react", "react/jsx-runtime"].includes(name), `Unexpected component dependency: ${name}`);
      return require(name);
    },
  }, { timeout: 1000 });
  const { createElement } = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  assert.equal(typeof fixtureModule.exports.IntegrationNotice, "function");
  return renderToStaticMarkup(createElement(fixtureModule.exports.IntegrationNotice, { message }));
}

export async function validateNotice(worktree, final = false) {
  const html = await renderNotice(worktree, "Hello <world>");
  assert.match(html, /^<p\b/);
  assert.match(html, /role="status"/);
  assert.ok(html.includes("Hello &lt;world&gt;"));
  if (final) assert.doesNotMatch(html, /aria-hidden="true"|\bhidden(?:[ =])|display:\s*none|visibility:\s*hidden/);
  return html;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await validateNotice(process.argv[2], process.argv[3] === "final");
  console.log(`Notice oracle passed (${process.argv[3] ?? "base"})`);
}

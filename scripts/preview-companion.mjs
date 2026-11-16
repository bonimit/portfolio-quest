/** Static review artifacts from production HTML/CSS and the real React panel.
 * This local-only renderer uses the installed TypeScript compiler; no browser/API.
 * Run --before before rebuilding, then run without it after the new build.
 */
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const req=createRequire(import.meta.url), cache=new Map();
// Compile only this repository's local TS/TSX modules for a static design preview.
export function loadPreviewModule(filename) {
  const file=resolve(root,filename);
  if(cache.has(file))return cache.get(file).exports;
  const record={exports:{}};cache.set(file,record);
  const localRequire=(name)=>{
    if(!name.startsWith('.')&&!name.startsWith('@/'))return req(name);
    const base=name.startsWith('@/')?resolve(root,name.slice(2)):resolve(dirname(file),name);
    const path=[base,base+'.ts',base+'.tsx'].find(existsSync);
    if(!path)throw new Error('Cannot resolve preview module '+name);
    return loadPreviewModule(path);
  };
  const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText;
  // Evaluate local application code only, exactly as a compiler-generated module.
  new Function('require','module','exports',code)(localRequire,record,record.exports);
  return record.exports;
}
export function renderCompanion() {
  const {LocalGuide}=loadPreviewModule('components/entrance/local-guide.tsx');
  return renderToStaticMarkup(React.createElement(LocalGuide,{onClose:()=>{},animationPaused:true}));
}
function page(html,css,panel,open,before) {
  panel=panel.replace(/<link\b[^>]*>/g,'');
  const inline=(url)=>{
    const path=resolve(root,'public',url.replace(/^\//,''));
    if(!existsSync(path))return url;
    const mime=url.endsWith('.webp')?'image/webp':url.endsWith('.ttf')?'font/ttf':'application/octet-stream';
    return `data:${mime};base64,${readFileSync(path).toString('base64')}`;
  };
  css=css.replace(/url\(["']?(\/[^)'" ]+)["']?\)/g,(_,url)=>`url("${inline(url)}")`);
  let body=html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1]
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')
    .replace(/<link\b[^>]*>/g,'');
  if(open){
    if(!before)body=body.replace('class="title-screen"','class="title-screen title-screen--companion"');
    const start=!before && body.includes('class="entrance-intro"') ? body.search(/<div class="title-screen-content"/) : body.search(/<div class="title-screen(?: title-screen--companion)?"/);
    if(start<0)throw new Error('Entrance root not found in production HTML');
    const tags=/<div\b[^>]*>|<\/div>/g;tags.lastIndex=start;
    let depth=0, end=-1, match;
    while((match=tags.exec(body))){
      depth+=match[0].startsWith('</')?-1:1;
      if(depth===0){end=match.index;break;}
    }
    if(end<0)throw new Error('Entrance root end not found');
    body=body.slice(0,end)+panel+body.slice(end);
  }
  body=body.replace(/src="(\/guide\/[^"]+)"/g,(_,url)=>`src="${inline(url)}"`);
  const overlay=before&&open?'body::after{content:"";position:fixed;inset:0;background:#050c16b8;z-index:20}.guide-dialog{position:fixed;z-index:21;inset:0;max-height:calc(100vh - 2rem);height:max-content}':'';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${before?'Before':'After'} · ${open?'Open':'Closed'} companion — STATIC PREVIEW</title><base href="http://127.0.0.1:3100/"><style>${css}\n${overlay}\n*,*::before,*::after{animation:none!important;transition:none!important}</style></head><body>${body}</body></html>`;
}
function main(){
  const before=process.argv.includes('--before');
  const destination=process.argv.find(arg=>arg.startsWith('--out='))?.slice(6) || 'docs/previews/companion';
  const directory=resolve(root,destination);mkdirSync(directory,{recursive:true});
  const baseline=resolve(root,'.local-snapshots/companion-before-render');
  const html=readFileSync(before?resolve(baseline,'page.html'):resolve(root,'.next/server/app/index.html'),'utf8');
  const css=before?readFileSync(resolve(baseline,'styles.css'),'utf8'):readdirSync(resolve(root,'.next/static/css')).filter(p=>p.endsWith('.css')).map(p=>readFileSync(resolve(root,'.next/static/css',p),'utf8')).join('\n');
  let panel=renderCompanion();
  if(before){
    const portrait=panel.match(/<span class="guide-portrait">[\s\S]*?<\/span><\/span>/)?.[0]||'';
    panel=`<aside class="guide-dialog" role="dialog" aria-modal="true"><header><div class="guide-identity">${portrait}<div><h2>Wayfinder</h2><p id="guide-disclosure">AI not connected · Local scripted fallback</p></div></div><button type="button" aria-label="Close guide">×</button></header><p class="guide-privacy">Questions stay in this tab. I can explain the site; general answers need a future AI service.</p><div class="guide-history" role="log"><p>Where would you like to go?</p></div><div class="guide-examples"><button>Where is the work?</button><button>Can I play the adventure?</button><button>Are you AI?</button></div><form><label>Ask Wayfinder</label><div class="guide-input-row"><input placeholder="Ask about the paths…"><button>Send</button></div></form></aside>`;
  }
  for(const open of [false,true])writeFileSync(resolve(directory,`${before?'before':'after'}-${open?'open':'closed'}.html`),page(html,css,panel,open,before));
  console.log('Wrote '+(before?'before':'after')+' static previews (not browser screenshots). Serve with a local preview server for assets.');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main();

/** Local-only browser/tab recording harness. Does not ship with Next or automate UI. */
import http from 'node:http';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const host='127.0.0.1',port=3102,origin=`http://${host}:${port}`,token=randomBytes(24).toString('hex');
const folder=new URL('../.local-snapshots/quest-destination-transition/videos/',import.meta.url);await mkdir(folder,{recursive:true});
const cases=['nyc','tokyo','bangkok'].flatMap(city=>['portfolio','world'].flatMap(path=>['desktop','mobile'].map(size=>`${city}-${path}-${size}`)));
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Quest transition recording review</title>
<style>*{box-sizing:border-box}body{margin:0;background:#182a30;color:#f6f5f1;font:14px system-ui}header{padding:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}button,select{min-height:36px;font:inherit;border:1px solid #789590;border-radius:6px;padding:5px 10px;background:#f6f5f1;color:#172c30}button:disabled{opacity:.4}#stage{position:absolute;top:108px;left:50%;transform-origin:50% 0;translate:-50% 0}iframe{border:0;display:block;background:#f6f5f1}#status{padding:0 12px;line-height:1.5}a{color:#f79a3b}#cases{max-width:280px}</style>
<header><strong>Local QA · actual tab recording</strong><label>Case <select id="cases">${cases.map(id=>`<option>${id}</option>`).join('')}</select></label><button id="load">Load case</button><button id="capture">Capture this tab</button><button id="record" disabled>Record</button><button id="save" disabled>Stop &amp; save</button><button id="release" disabled>Release capture</button></header><div id="status" role="status">Select a case. City steps: NYC 0, Tokyo 4, Bangkok 8 Next clicks. Turn Auto tour Off before recording. Then activate the actual destination in the frame.</div><main id="stage"><iframe id="preview" title="Actual Portfolio Quest website" width="1280" height="800" src="http://127.0.0.1:3100/quest-preview"></iframe></main>
<script>
const select=document.getElementById('cases'),frame=document.getElementById('preview'),stage=document.getElementById('stage'),status=document.getElementById('status');let stream,recorder,chunks=[],recordingCase='';
function fit(){const w=select.value.endsWith('mobile')?360:1280;frame.width=w;frame.height=800;stage.style.width=w+'px';stage.style.transform='scale('+Math.min(1,(innerWidth-24)/w,(innerHeight-120)/800)+')';}
window.addEventListener('resize',fit);fit();
document.getElementById('load').onclick=()=>{if(recorder?.state==='recording')return;frame.src='http://127.0.0.1:3100/quest-preview';fit();status.textContent='Loaded '+select.value+'. Use the real scene controls to select the city, then turn Auto tour Off.';};
document.getElementById('capture').onclick=async()=>{try{stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser'},audio:false,preferCurrentTab:true,selfBrowserSurface:'include'});document.getElementById('record').disabled=false;document.getElementById('release').disabled=false;status.textContent='Capture ready. Only this local QA tab should be shared. Press Record, use the destination, verify the final route, then Stop & save.';}catch(e){status.textContent='Capture unavailable: '+e.message;}};
document.getElementById('record').onclick=()=>{if(!stream||recorder?.state==='recording')return;recordingCase=select.value;chunks=[];const type=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:4000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=async()=>{try{const response=await fetch('/record/'+recordingCase,{method:'POST',headers:{'X-Review-Token':'${token}','Content-Type':type},body:new Blob(chunks,{type})});if(!response.ok)throw Error('Save failed: '+response.status);const result=await response.json();status.innerHTML='Saved actual browser video: <a href="/video/'+result.file+'" target="_blank">'+result.file+'</a>';document.getElementById('record').disabled=false;}catch(e){status.textContent=e.message;}};recorder.start(250);document.getElementById('record').disabled=true;document.getElementById('save').disabled=false;status.textContent='Recording '+recordingCase+'. Activate the destination in the actual website below.';};
document.getElementById('save').onclick=()=>{if(recorder?.state==='recording')recorder.stop();document.getElementById('save').disabled=true;};
document.getElementById('release').onclick=()=>{if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());stream=null;document.getElementById('record').disabled=true;document.getElementById('release').disabled=true;};
window.addEventListener('beforeunload',()=>stream?.getTracks().forEach(t=>t.stop()));
</script></html>`;
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,origin);
 if(req.method==='GET'&&url.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);return;}
 if(req.method==='POST'&&url.pathname.startsWith('/record/')){
  const id=url.pathname.slice(8);if(!cases.includes(id)||req.headers['x-review-token']!==token||req.headers.origin!==origin){res.writeHead(403);res.end();return;}
  const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>120_000_000){res.writeHead(413);res.end();req.destroy();return;}chunks.push(chunk);}
  const file=id+'-'+Date.now()+'.webm';await writeFile(new URL(file,folder),Buffer.concat(chunks),{flag:'wx'});res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({file,bytes}));return;
 }
 if(req.method==='GET'&&/^\/video\/[a-z0-9-]+\.webm$/.test(url.pathname)){const name=url.pathname.slice(7);if(!(await readdir(folder)).includes(name)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'video/webm'});res.end(await readFile(new URL(name,folder)));return;}
 res.writeHead(404);res.end();
}catch{res.writeHead(500);res.end('Local recording error');}}).listen(port,host,()=>console.log('Local transition review: '+origin));

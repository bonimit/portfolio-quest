/** Local-only proxy for the browser regression page; never part of the website build. */
import http from 'node:http';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const port=3101;
http.createServer((request,response)=>{
  if(request.url==='/__companion-checks' && request.method==='GET'){
    response.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    response.end(readFileSync(new URL('tests/browser/companion.html',root)));return;
  }
  if(request.url==='/__companion-results' && request.method==='POST'){
    let body='';request.on('data',chunk=>{body+=chunk;if(body.length>262144)request.destroy();});
    request.on('end',()=>{
      try {
        const results=JSON.parse(body);if(!Array.isArray(results.rows))throw new Error('Invalid results');
        mkdirSync(new URL('.local-snapshots/',root),{recursive:true});
        writeFileSync(new URL('.local-snapshots/companion-round3-browser-results.json',root),JSON.stringify(results,null,2)+'\n');
        console.log('Browser checks:',results.rows.length,'rows;',results.rows.filter(row=>row.passed).length,'passed');
        response.writeHead(200);response.end('saved');
      }catch{response.writeHead(400);response.end('invalid results');}
    });return;
  }
  const upstream=http.request({hostname:'127.0.0.1',port:3100,path:request.url,method:request.method,headers:{...request.headers,host:'127.0.0.1:3100'}},incoming=>{
    response.writeHead(incoming.statusCode||502,incoming.headers);incoming.pipe(response);
  });
  upstream.on('error',()=>{response.writeHead(502);response.end('Start the production website on port 3100 first.');});
  request.pipe(upstream);
}).listen(port,'127.0.0.1',()=>console.log('Open http://127.0.0.1:'+port+'/__companion-checks · localhost only · '+fileURLToPath(root)));

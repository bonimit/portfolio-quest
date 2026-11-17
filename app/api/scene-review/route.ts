import {mkdir,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {THREE_PATH_VIEWS,threePathArtworkId} from '@/lib/quest-preview/three-path-catalog';
import {REVIEW_CAPTURE_VERSION} from '@/lib/quest-preview/review-capture-layout';
import {decodeReviewPng,MAX_REVIEW_DATA_LENGTH} from '@/lib/quest-preview/review-png';
export async function POST(request:Request){
 if(process.env.NODE_ENV!=='development')return new Response('Local review only',{status:403});
 const origin=request.headers.get('origin'),host=request.headers.get('host');
 let originHost='';try{originHost=origin?new URL(origin).host:'';}catch{}
 if(!originHost||originHost!==host)return new Response('Same origin only',{status:403});
 if(Number(request.headers.get('content-length'))>MAX_REVIEW_DATA_LENGTH)return new Response('Image too large',{status:413});
 const body=await request.json().catch(()=>null);if(!body)return new Response('Invalid screenshot',{status:400});const {scene,light,png,captureVersion}=body;
 const views=[...THREE_PATH_VIEWS,...THREE_PATH_VIEWS.filter(v=>v.place==='nikko').map(v=>({...v,season:'spring' as const}))];
 if(captureVersion!==REVIEW_CAPTURE_VERSION||!views.some(v=>threePathArtworkId(v)===scene&&v.light===light))return new Response('Invalid screenshot',{status:400});
 const image=decodeReviewPng(png);if(!image)return new Response('Invalid PNG',{status:400});
 const folder=join(process.cwd(),'public/quest-preview/scene-review');await mkdir(folder,{recursive:true});
 const target=join(folder,`${scene}-${light}.png`),temporary=join(folder,`${scene}-${light}-${crypto.randomUUID()}.tmp`);
 await writeFile(temporary,image.bytes);await rename(temporary,target);
 await writeFile(join(folder,`${scene}-${light}.meta.json`),JSON.stringify({scene,light,captureVersion,width:image.width,height:image.height},null,2)+'\n');
 return Response.json({saved:`${scene}-${light}.png`});
}

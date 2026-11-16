import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {REVIEW_CAPTURE_VERSION} from '@/lib/quest-preview/review-capture-layout';
import {readdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {THREE_PATH_STOPS,threePathId,threePathTitle,threePathHref} from '@/lib/quest-preview/three-path-catalog';
import './review.css';
export const metadata:Metadata={title:'All island scenes — approval review',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function SceneReview(){
 const files:string[]=await readdir(join(process.cwd(),'public/quest-preview/scene-review')).catch(()=>[] as string[]);
 const artwork:string[]=await readdir(join(process.cwd(),'public/quest-preview/three-path')).catch(()=>[] as string[]);
 const current=new Set((await Promise.all(files.filter(file=>file.endsWith('.meta.json')).map(async file=>{try{const meta=JSON.parse(await readFile(join(process.cwd(),'public/quest-preview/scene-review',file),'utf8'));return meta.captureVersion===REVIEW_CAPTURE_VERSION?`${meta.scene}-${meta.light}.png`:'';}catch{return '';}}))).filter(Boolean));
 const archiveCurrent=await readFile(join(process.cwd(),'public/quest-preview/scene-review/manifest.json'),'utf8').then(text=>JSON.parse(text).captureVersion===REVIEW_CAPTURE_VERSION).catch(()=>false);
 const count=THREE_PATH_STOPS.reduce((n,v)=>n+(['day','night'] as const).filter(light=>current.has(`${threePathId(v)}-${light}.png`)).length,0);
 return <section className="island-review"><header><p>Homepage scene collection</p><h1>Three paths. Every scene.</h1><p>22 scenes, each in day and night. {count} of 44 screenshots saved. This collection is now used on the homepage.</p><nav><Link href="/quest-preview/concept-scene">Open interactive preview</Link><Link href="/">Open island homepage</Link><Link href="/quest-preview">Original island comparison</Link>{count===44&&archiveCurrent&&files.includes('all-scenes.zip')?<a href="/quest-preview/scene-review/all-scenes.zip" download>Download all 44 screenshots</a>:null}{count===44&&archiveCurrent&&files.includes('contact-sheet.jpg')?<a href="/quest-preview/scene-review/contact-sheet.jpg">View all scenes together</a>:files.includes('artwork-contact-sheet.jpg')?<a href="/quest-preview/scene-review/artwork-contact-sheet.jpg">View all artwork previews together</a>:null}</nav></header>
  {[false,true].map(places=><section key={String(places)}><h2>{places?'New destination scenes':'Current city & season scenes'}</h2><div className="island-review-grid">{THREE_PATH_STOPS.filter(v=>!!v.place===places).map(v=><article key={threePathId(v)}><h3>{threePathTitle(v)}</h3><div className="island-review-pair">{(['day','night'] as const).map(light=>{const file=`${threePathId(v)}-${light}.png`,art=`${threePathId(v)}-${light}.webp`,saved=current.has(file),rendered=artwork.includes(art);return <figure key={light}><a href={saved?`/quest-preview/scene-review/${file}`:threePathHref({...v,light})}>{saved?<Image src={`/quest-preview/scene-review/${files.includes(art)?art:file}`} width={2880} height={1960} alt={`${threePathTitle(v)}, ${light}; Concept Lab left, Portfolio centre, Adventure right`} unoptimized/>:rendered?<div className={`island-review-art island-review-art--${light}`}><Image src={`/quest-preview/three-path/${art}`} width={1440} height={980} alt={`Rendered artwork preview of ${threePathTitle(v)}, ${light}`} unoptimized/></div>:<span className="island-review-pending">Screenshot pending</span>}</a><figcaption><strong>{light==='day'?'Day':'Night'}</strong><Link href={threePathHref({...v,light})}>Try this scene ↗</Link>{saved?<a href={`/quest-preview/scene-review/${file}`} download>PNG ↓</a>:<span>Artwork preview · screenshot pending</span>}</figcaption></figure>;})}</div></article>)}</div></section>)}
 </section>;
}

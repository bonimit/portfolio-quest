import sharp from 'sharp';
import {mkdirSync,writeFileSync,copyFileSync} from 'node:fs';
import {THREE_PATH_STOPS,threePathId,threePathTitle} from '../lib/quest-preview/three-path-catalog.ts';
const items=[],tileWidth=360,tileHeight=280;
for(const [i,v]of THREE_PATH_STOPS.entries())for(const [j,light]of ['day','night'].entries()){
 const left=(i%2)*720+j*tileWidth,top=Math.floor(i/2)*tileHeight;
 const label=(threePathTitle(v)+' · '+light).replaceAll('&','&amp;');
 const image=await sharp(`public/quest-preview/three-path/${threePathId(v)}-${light}.webp`).resize(360,245).flatten({background:light==='day'?'#d8d9c7':'#282b43'}).toBuffer();
 items.push({input:image,left,top:top+35});
 items.push({input:Buffer.from(`<svg width="360" height="35"><rect width="360" height="35" fill="#f3eee1"/><text x="8" y="22" font-size="12" font-family="sans-serif" fill="#182d30">${label}</text></svg>`),left,top});
}
mkdirSync('docs/previews/three-path',{recursive:true});mkdirSync('public/quest-preview/scene-review',{recursive:true});
await sharp({create:{width:1440,height:11*tileHeight,channels:3,background:'#f3eee1'}}).composite(items).jpeg({quality:91}).toFile('docs/previews/three-path/artwork-contact-sheet.jpg');
copyFileSync('docs/previews/three-path/artwork-contact-sheet.jpg','public/quest-preview/scene-review/artwork-contact-sheet.jpg');
writeFileSync('docs/previews/three-path/README.md','# Three-path scene review\n\n44 artwork previews are generated from the live geometry. They are not browser screenshots. The homepage uses the latest island collection. Current browser captures appear separately when their version matches the live preview.\n');
console.log('Prepared 44-view artwork contact sheet; browser screenshots remain separate.');

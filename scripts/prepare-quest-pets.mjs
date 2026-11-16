/** Deterministic atlas packing of owner-supplied references: no generated artwork. */
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const sources={capybara:'mascot-capybara',cat:'mascot-scotishfolded',sloth:'mascot-slot',kitsune:'mascot-kitsune',frenchie:'mascot-frenchie'};
const additionsOnly=process.argv.includes('--additions-only');
const output=new URL('../public/quest-preview/pets/',import.meta.url);
mkdirSync(output,{recursive:true});
const manifest=additionsOnly?JSON.parse(readFileSync(new URL('../assets/quest-preview/pet-reference-manifest.json',import.meta.url))):{tile:256,columns:5,rows:2,feet:248,source:'Owner-supplied reference folder; capybara and cat selected for local preview',pets:{}};
for(const [pet,folder]of Object.entries(sources)){
  if(additionsOnly&&manifest.pets[pet])continue;
  const directory=`/Users/workspace/portfolio-reference/${folder}`;
  const files=pet==='frenchie'?['idle/00.png','idle/01.png','idle/02.png','run/00.png','run/01.png','run/02.png','run/03.png','jump/00.png']:readdirSync(directory).filter(f=>/^\d+\.png$/.test(f)).sort();
  const frames=[];
  for(const name of files){
    const path=`${directory}/${name}`,{data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let left=info.width,top=info.height,right=0,bottom=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>16){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
    frames.push({name,path,left,top,width:right-left+1,height:bottom-top+1,bottom,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')});
  }
  const union={left:Math.min(...frames.map(f=>f.left)),top:Math.min(...frames.map(f=>f.top)),right:Math.max(...frames.map(f=>f.left+f.width)),bottom:Math.max(...frames.map(f=>f.bottom+1))};
  const scale=232/Math.max(union.right-union.left,union.bottom-union.top);
  const center=(256-(union.right-union.left)*scale)/2,tiles=[];
  for(let i=0;i<frames.length;i++){
    const f=frames[i],w=Math.max(1,Math.round(f.width*scale)),h=Math.max(1,Math.round(f.height*scale));
    const sprite=await sharp(f.path).extract({left:f.left,top:f.top,width:f.width,height:f.height}).resize(w,h,{kernel:'nearest'}).png().toBuffer();
    const tile=await sharp({create:{width:256,height:256,channels:4,background:'#00000000'}}).composite([{input:sprite,left:Math.round(center+(f.left-union.left)*scale),top:248-h}]).png().toBuffer();
    tiles.push({input:tile,left:i%5*256,top:Math.floor(i/5)*256});
  }
  const atlas=await sharp({create:{width:1280,height:512,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:92,alphaQuality:100,effort:6}).toBuffer();
  writeFileSync(new URL(`${pet}.webp`,output),atlas);
  manifest.pets[pet]={folder,frames:frames.map(f=>({name:f.name,left:f.left,top:f.top,width:f.width,height:f.height,bottom:f.bottom,sha256:f.sha256})),scale,bytes:atlas.length};
}
manifest.source='Owner-supplied reference folder; capybara, cat, sloth, kitsune and Frenchie selected for local preview';
writeFileSync(new URL('../assets/quest-preview/pet-reference-manifest.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(manifest.pets).map(([k,v])=>[k,{frames:v.frames.length,bytes:v.bytes}])));

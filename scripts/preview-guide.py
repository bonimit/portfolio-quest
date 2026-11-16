#!/usr/bin/env python3
"""Creates an owner-review animation from the actual production cue tables and atlas.
This is an asset preview, not a browser recording or proof of UI interaction.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import subprocess,json,shutil
ROOT=Path(__file__).resolve().parents[1]
js="""
import {avatarClips,sampleClip,walkFrame,turnFrames} from './lib/guide/assistant-motion.ts';
const names=['idle-front','idle-back','walk-left','walk-right','turn','thinking','talking','happy','wave'];
console.log(JSON.stringify(Array.from({length:48},(_,step)=>names.map(name=>({name,frame:name.startsWith('walk-')?walkFrame(name.slice(5),step/12*35):name==='turn'?sampleClip(turnFrames('right','left'),step/12*1000,true).frame:sampleClip(avatarClips[name].cues,step/12*1000,true).frame})))));
"""
result=subprocess.run(['node','--input-type=module','-e',js],cwd=ROOT,capture_output=True,text=True,check=True)
samples=json.loads(result.stdout)
atlas=Image.open(ROOT/'public/guide/assistant-atlas.webp').convert('RGBA')
manifest=json.loads((ROOT/'assets/guide/frame-map.json').read_text())
w,h=manifest['cell']; cols=manifest['columns']
frames=[atlas.crop(((i%cols)*w,(i//cols)*h,(i%cols+1)*w,(i//cols+1)*h)) for i in range(42)]
out=ROOT/'docs/previews';out.mkdir(exist_ok=True)
# 2x density: illustration renders at 90 x 110 CSS pixels when displayed at 624px.
canvas_frames=[]
for sample in samples:
    sheet=Image.new('RGB',(1248,1320),'#f6f5f1');d=ImageDraw.Draw(sheet)
    for i,item in enumerate(sample):
        x=(i%3)*416;y=(i//3)*440
        d.rectangle((x,y,x+416,y+440),fill='#f6f5f1' if i%2==0 else '#101d2b')
        color='#131313' if i%2==0 else '#f5e9d2'
        d.text((x+24,y+20),item['name']+' · 90x110 CSS px @2x',fill=color)
        picture=frames[item['frame']].resize((180,220),Image.Resampling.LANCZOS)
        sheet.paste(picture,(x+118,y+90),picture)
        d.line((x+28,y+290,x+388,y+290),fill='#f79a3b',width=1)
        d.text((x+24,y+350),'Production frames; loops for art review',fill=color)
    canvas_frames.append(sheet)
canvas_frames[0].save(out/'assistant-states.webp',save_all=True,append_images=canvas_frames[1:],duration=83,loop=0,quality=87,method=6)
canvas_frames[0].save(out/'assistant-real-size-2x.png')
shutil.copyfile(ROOT/'.local-snapshots/avatar-review/contact-sheet.png',out/'assistant-contact-sheet.png')
print('Prepared 48-frame / ~4-second 2x animation preview and still/contact sheets')
for p in out.iterdir():print(p.relative_to(ROOT),p.stat().st_size)

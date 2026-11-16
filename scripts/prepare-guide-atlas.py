#!/usr/bin/env python3
"""Deterministic, measured extraction of the owner's irregular RGBA character atlas.
Requires Pillow for asset preparation only; no website/runtime dependency.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
import hashlib
import json
import math

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/guide/source-atlas.png'
EXPECTED_SHA = 'ea86951126787ae4e9893a4285afb640e602f1669a898e205fd5a18e5485d4c6'
CELL = (144, 176)
FOOT = (72, 160)
BODY_HEIGHT = 140
# Each region/anchor was measured separately. These are NOT equal input cells.
GROUPS = {
    'idle-front': [((18,45,124,197),71),((128,45,232,197),181),((236,45,340,197),289),((344,45,448,197),397),((452,45,559,197),508)],
    'idle-back': [((579,44,669,195),626),((670,44,759,195),714),((759,44,847,195),801),((847,44,935,195),891),((935,44,1020,195),976)],
    'turn': [((1027,44,1129,195),1081),((1131,44,1223,195),1180),((1225,44,1321,195),1272),((1324,44,1410,195),1369),((1410,44,1510,195),1458)],
    'walk-right': [((22,238,139,374),78),((142,234,238,374),187),((247,234,342,374),291),((351,234,447,374),395),((455,234,552,374),501),((558,234,654,374),605),((662,234,758,374),710)],
    'walk-left': [((784,238,895,374),836),((895,234,986,374),940),((1000,234,1096,374),1046),((1109,234,1203,374),1154),((1212,234,1307,374),1259),((1319,234,1413,374),1363),((1424,234,1518,374),1468)],
    'thinking': [((22,585,123,726),73),((149,585,247,726),200),((254,585,355,726),307)],
    'happy': [((368,585,481,726),421),((478,585,586,726),527),((586,585,709,726),637)],
    'talking': [((715,585,818,726),765),((822,585,916,726),866),((914,585,1001,726),960),((1001,585,1112,726),1047)],
    'wave': [((1269,790,1348,934),1309),((1349,790,1423,934),1389),((1424,790,1525,934),1470)],
}


def character_mask(crop):
    """Keep the connected character, discard separate labels/emote marks/strays."""
    a = crop.getchannel('A')
    w, h = a.size
    pixels = a.load()
    seen = set()
    largest = []
    for y in range(h):
        for x in range(w):
            if (x,y) in seen or pixels[x,y] < 128:
                continue
            queue = [(x,y)]
            seen.add((x,y))
            component = []
            while queue:
                px, py = queue.pop()
                component.append((px,py))
                for dy in (-1,0,1):
                    for dx in (-1,0,1):
                        xx, yy = px+dx, py+dy
                        if 0 <= xx < w and 0 <= yy < h and (xx,yy) not in seen and pixels[xx,yy] >= 128:
                            seen.add((xx,yy))
                            queue.append((xx,yy))
            if len(component) > len(largest):
                largest = component
    if len(largest) < 4000:
        raise ValueError('Region does not contain a complete character')
    mask = Image.new('L', crop.size)
    mp = mask.load()
    for x,y in largest:
        mp[x,y] = 255
    # One pixel of source antialiasing; no blurred/glowing flood-fill expansion.
    return mask.filter(ImageFilter.MaxFilter(3))


def extract(source, region, anchor):
    x0,y0,x1,y1 = region
    crop = source.crop(region)
    # Measured exclusions for the first left-walk label and attached gold marks.
    for cy in range(crop.height):
        for cx in range(crop.width):
            sx,sy = x0+cx,y0+cy
            r,g,b,a = crop.getpixel((cx,cy))
            label = 784 <= sx < 895 and 238 <= sy < 242 and max(r,g,b)-min(r,g,b) < 20 and min(r,g,b) > 30
            happy_mark = 679 <= sx < 709 and 585 <= sy < 640 and r > 170 and g > 105 and b < g*.72
            talk_mark = (1088 <= sx < 1112 and 625 <= sy < 670) or (635 <= sy < 655 and 1086-(sy-635)*.5 <= sx < 1088)
            happy_fringe = ((684 <= sx < 698 and 597 <= sy < 614) or (687 <= sx < 705 and 613 <= sy < 625) or (679 <= sx < 690 and 622 <= sy < 635))
            if label or happy_mark or happy_fringe or talk_mark:
                crop.putpixel((cx,cy),(0,0,0,0))
    mask = character_mask(crop)
    cleaned = Image.new('RGBA', crop.size)
    for y in range(crop.height):
        for x in range(crop.width):
            r,g,b,a = crop.getpixel((x,y))
            # Reject faint background/shadow alpha and normalize near-opaque core.
            alpha = round(max(0, min(1, (a-96)/144)) * 255) if mask.getpixel((x,y)) else 0
            if alpha <= 8:
                continue
            if a < 224:
                # Pull edge RGB from the nearest strongest interior pixel to avoid
                # source-background color fringes on light and dark surfaces.
                neighbors = [(crop.getpixel((xx,yy)),(xx-x)**2+(yy-y)**2)
                    for yy in range(max(0,y-2),min(crop.height,y+3))
                    for xx in range(max(0,x-2),min(crop.width,x+3)) if mask.getpixel((xx,yy))]
                solid = sorted(neighbors, key=lambda item: (-item[0][3], item[1]))[0][0]
                r,g,b = solid[:3]
            cleaned.putpixel((x,y),(r,g,b,alpha))
    bounds = cleaned.getbbox()
    tight = cleaned.crop(bounds)
    scale = BODY_HEIGHT / tight.height
    size = (round(tight.width*scale), BODY_HEIGHT)
    resized = tight.resize(size, Image.Resampling.LANCZOS)
    # Remove resampler alpha ringing; RGB for fully transparent pixels is zero.
    data = [(r,g,b,a) if a>8 else (0,0,0,0) for r,g,b,a in resized.get_flattened_data()]
    resized.putdata(data)
    bounds2 = resized.getbbox()
    normalized = Image.new('RGBA', CELL)
    anchor_in_tight = anchor - x0 - bounds[0]
    dx = FOOT[0] - round(anchor_in_tight * scale)
    dy = FOOT[1] - bounds2[3]
    if dx < 0 or dx + resized.width > CELL[0]:
        raise ValueError(f'Character outside canonical canvas: region={region}, bounds={bounds}, anchor={anchor}, dx={dx}, size={size}')
    normalized.paste(resized, (dx,dy))
    bbox = normalized.getbbox()
    assert bbox[3] == FOOT[1]
    return normalized, {
        'sourceRegion': list(region),
        'characterBounds': [bounds[0]+x0,bounds[1]+y0,bounds[2]+x0,bounds[3]+y0],
        'sourceAnchorX': anchor,
        'uniformScale': round(scale,6),
        'outputBounds': list(bbox),
        'outputFootY': FOOT[1],
    }


def main():
    raw = SOURCE.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == EXPECTED_SHA, 'Re-measure frames if the source changes'
    source = Image.open(SOURCE).convert('RGBA')
    assert source.size == (1536,1024)
    frames = []
    images = []
    groups = {}
    for group, regions in GROUPS.items():
        groups[group] = []
        for index,(region,anchor) in enumerate(regions):
            image, detail = extract(source, region, anchor)
            frame_id = len(frames)
            frames.append({'id':frame_id,'name':f'{group}-{index}',**detail})
            images.append(image)
            groups[group].append(frame_id)
    columns = 7
    rows = math.ceil(len(frames)/columns)
    atlas = Image.new('RGBA',(CELL[0]*columns,CELL[1]*rows))
    for i,image in enumerate(images):
        atlas.paste(image,((i%columns)*CELL[0],(i//columns)*CELL[1]))
    output = ROOT/'public/guide'
    output.mkdir(parents=True,exist_ok=True)
    atlas.save(output/'assistant-atlas.webp',quality=94,alpha_quality=100,method=6,exact=True)
    decoded = Image.open(output/'assistant-atlas.webp').convert('RGBA')
    assert decoded.getchannel('A').tobytes() == atlas.getchannel('A').tobytes(), 'Alpha must remain exact'
    images = [decoded.crop(((i%columns)*CELL[0],(i//columns)*CELL[1],(i%columns+1)*CELL[0],(i//columns+1)*CELL[1])) for i in range(len(frames))]
    images[0].save(output/'assistant-idle.webp',lossless=True,method=6)
    manifest = {'sourceSha256':EXPECTED_SHA,'sourceSize':list(source.size),'cell':list(CELL),'footAnchor':list(FOOT),'columns':columns,'rows':rows,'groups':groups,'frames':frames}
    (ROOT/'assets/guide/frame-map.json').write_text(json.dumps(manifest,indent=2)+'\n')
    runtime = {'src':'/guide/assistant-atlas.webp','poster':'/guide/assistant-idle.webp','width':CELL[0],'height':CELL[1],'columns':columns,'rows':rows,'groups':groups}
    (ROOT/'lib/guide/assistant-atlas.ts').write_text('// Generated by scripts/prepare-guide-atlas.py. Input regions are individually measured.\nexport const ASSISTANT_ATLAS = '+json.dumps(runtime,indent=2)+' as const;\n')
    # Local inspection artifacts: contact sheet at 1x and transparent GIF preview.
    review = ROOT/'.local-snapshots/avatar-review'
    review.mkdir(parents=True,exist_ok=True)
    contact = Image.new('RGB',(columns*160,rows*210),'#f6f5f1')
    draw = ImageDraw.Draw(contact)
    for i,image in enumerate(images):
        x=(i%columns)*160+16;y=(i//columns)*210
        contact.paste(image,(x,y),image)
        draw.line((x,y+160,x+144,y+160),fill='#f79a3b')
        draw.text((x,y+178),frames[i]['name'],fill='#131313')
    contact.save(review/'contact-sheet.png')
    # A shareable, self-contained animation preview will be created after clip review.
    print('Prepared',len(frames),'measured transparent frames')
    print('Public bytes:',{p.name:p.stat().st_size for p in output.glob('*.webp')})


if __name__ == '__main__':
    main()

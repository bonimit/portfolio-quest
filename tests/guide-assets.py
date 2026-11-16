"""Validate the built transparent atlas; run with python3 tests/guide-assets.py."""
from PIL import Image
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'assets/guide/frame-map.json').read_text())
assert hashlib.sha256((root/'assets/guide/source-atlas.png').read_bytes()).hexdigest()==m['sourceSha256']
atlas=Image.open(root/'public/guide/assistant-atlas.webp').convert('RGBA')
w,h=m['cell'];assert atlas.size==(w*m['columns'],h*m['rows'])
for i,frame in enumerate(m['frames']):
    cell=atlas.crop(((i%m['columns'])*w,(i//m['columns'])*h,(i%m['columns']+1)*w,(i//m['columns']+1)*h))
    alpha=cell.getchannel('A');bounds=alpha.getbbox()
    assert list(bounds)==frame['outputBounds'],frame['name']
    assert bounds[3]==160 and bounds[3]-bounds[1] in (139,140),frame['name']
    assert max(alpha.crop((0,0,w,1)).getextrema())==0
    assert max(alpha.crop((0,h-1,w,h)).getextrema())==0
    assert max(alpha.crop((0,0,1,h)).getextrema())==0
    assert max(alpha.crop((w-1,0,w,h)).getextrema())==0
poster=Image.open(root/'public/guide/assistant-idle.webp').convert('RGBA');assert poster.size==(w,h)
first=atlas.crop((0,0,w,h))
assert poster.getchannel('A').tobytes()==first.getchannel('A').tobytes()
assert all(p[:3]==a[:3] for p,a in zip(poster.get_flattened_data(),first.get_flattened_data()) if a[3]), 'Visible poster pixels must match the decoded first atlas frame without a load flash'
assert (root/'public/guide/assistant-atlas.webp').stat().st_size<220_000
assert (root/'public/guide/assistant-idle.webp').stat().st_size<16_000
print('PASS: 42 measured crops, exact alpha bounds, feet baseline, clear borders, native dimensions and mobile byte budgets')

import {useMemo} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import './illustrations.css';
import {CardArt} from '@/components/work/work-art';
import {Layer, ModeFrame} from '../carbon/CarbonColors';
import {MODES} from '../carbon/carbon-model';
import {CopyButton, Snippet} from '../icons/Icons';
import {GuidelineCube, SizeScaleIll, ResponsiveComparison, brandStyle} from '../icons/Illustrations';
import {
  AUDIT, BASIS_LABEL, DO_DONT, EDITORIAL, EDITORIAL_OPTIONS, EXPORTS, FAMILIES, FRAMES, GUIDELINE_KEYS, ILL_SIZES, KEY_LABEL, MAX_CONTENT, PAD, SAFE,
  bytesStats, displayWidth, family, filesOf, gallerySample, kb, lightVariants, rasterPx, ratioLabel, sizeAt, totalAudited, unreferenced,
  type AuditFile, type Basis, type Cell, type FamilyId,
} from './illustrations-model';

/* ---------------------------------------------------------------- shared */

type Kind = Basis | 'existing' | 'proposed' | 'preserved' | 'do' | 'dont';
const KIND_LABEL: Record<Kind, string> = {...BASIS_LABEL, existing: 'Existing artwork', proposed: 'Proposed specimen', preserved: 'Preserved, not replaced', do: 'Do', dont: "Don't"};
export const Tag = ({kind, children}: {kind: Kind; children?: ReactNode}) => <span className="pqn-tag" data-kind={kind}>{children ?? KIND_LABEL[kind]}</span>;
export const Page = ({title, children, testId = 'illus-page'}: {title: string; children: ReactNode; testId?: string}) => <div className="pqn-page" data-testid={testId}><h1 style={{fontSize: '1.5rem'}}>{title}</h1>{children}</div>;

export function Banner() {
  return (
    <div className="pqn-box" role="note">
      <p>
        <Tag kind="existing" /> Artwork already in the repo, shown read-only by URL; sizes and counts are measured from the files and code. <Tag kind="proposed" /> A plain shape drawn only for this page to explain a rule; it is never artwork and never an approved design.
        {' '}<Tag kind="owner" /> Specified by the owner. <Tag kind="local" /> A local proposal. <Tag kind="open" /> No evidence yet: owner decision.
      </p>
      <p className="pqn-muted">Documentation and proposal only. No production asset, color, typography, spacing, S0 baseline or protected file is changed, no migration starts, and no Figma library is created. Airbnb&rsquo;s dimensional illustrations are general inspiration for the 3D family only; nothing is copied.</p>
    </div>
  );
}

const Cells = ({cells}: {cells: Cell[]}) => <div className="pqn-cell">{cells.map(c => <div key={c.t}><Tag kind={c.b} />{c.t}</div>)}</div>;

/* ------------------------------------------------- existing art (read-only) */

/** One frame of a sprite sheet, cropped by CSS from the existing image. Shown by URL; the file is never copied or changed. */
export function SpriteFrame({src, cols, rows, index, w, h, label, pixel}: {src: string; cols: number; rows: number; index: number; w: number; h: number; label: string; pixel?: boolean}) {
  const col = index % cols, row = Math.floor(index / cols);
  const style: CSSProperties = {width: w, height: h, backgroundImage: `url(${src})`, backgroundSize: `${cols * 100}% ${rows * 100}%`, backgroundPosition: `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`};
  return <div className="pqn-sprite pqn-checker" role="img" aria-label={label} data-pixel={pixel ? 'true' : undefined} style={style} />;
}
const atlas = AUDIT.sheet.atlas;
const GuideFrame = ({scale = 1}: {scale?: number}) => <SpriteFrame src={atlas.src} cols={atlas.columns} rows={atlas.rows} index={0} w={90 * scale} h={110 * scale} label="Existing guide companion, idle frame" />;
const PetFrame = ({id = 'cat'}: {id?: 'cat' | 'capybara'}) => <SpriteFrame src={`/quest-preview/restored/pets/${id}.webp`} cols={5} rows={2} index={0} w={128} h={128} label={`Existing ${id} sprite, first frame`} pixel />;
const ART = ['interface', 'phones', 'chart', 'orbit', 'poster', 'code'] as const;
export function ExistingArt({art, w = '100%', ratio = [1, 1]}: {art: (typeof ART)[number]; w?: string; ratio?: [number, number]}) {
  return <div className="pqn-art" data-testid={`art-${art}`} style={{'--pqn-w': w, '--pqn-rw': ratio[0], '--pqn-rh': ratio[1], '--card-tint': 'var(--pqi-hue-orange)', '--color-paper': 'Canvas', ...brandStyle()} as CSSProperties}><CardArt type="Professional Work" art={art} /></div>;
}
const Scene = ({f, className = 'pqn-thumb'}: {f: AuditFile; className?: string}) => (
  // eslint-disable-next-line @next/next/no-img-element -- read-only previews of production files by URL
  <img className={className} src={`/${f.path}`} alt="" width={f.w ?? undefined} height={f.h ?? undefined} loading="lazy" data-testid="existing-img" />
);
const SceneByName = ({name}: {name: string}) => { const f = AUDIT.files.find(x => x.path === `quest-preview/${name}.webp`)!; return <Scene f={f} />; };

/* -------------------------------------------------------- 1. overview */

export function FamilyOverview() {
  const lv = lightVariants();
  const unref = unreferenced();
  return (
    <section>
      <div className="pqn-box" data-testid="audit-line">
        <p><Tag kind="existing" /> Audit of <code>public/</code> ({totalAudited()} image files, excluding the untracked scene-review output) plus the code-drawn SVG art: {filesOf('characters').length} character and sprite files, {filesOf('world').length} world and scene files, <strong>0 raster editorial files</strong>, <strong>0 3D illustrations</strong>. Day/night variants in the file names: {lv.day} day, {lv.night} night, {lv.dusk} dusk. {unref.length} files are present with no code reference found (listed in the Asset Gallery); that is not proof they are unused.</p>
      </div>
      <div className="pqn-grid" data-testid="family-grid" style={{marginTop: '1rem'}}>
        {FAMILIES.map(f => (
          <article key={f.id} className="pqn-card" data-testid={`family-${f.id}`}>
            <h3>{f.name}</h3>
            <p className="pqn-muted">{f.tagline}</p>
            <p>{f.existing === 'none' ? <><Tag kind="open">None produced</Tag>Specification only.</> : <><Tag kind="existing" />{f.existing === 'code-drawn' ? 'Code-drawn SVG (work-art, destination-art)' : `${filesOf(f.id).length} files in public/`}. <Tag kind="preserved" /></>}</p>
            <div className="pqn-row">
              {f.id === 'spot3d' && <div style={brandStyle()}><div className="pqn-canvas" style={{'--pqn-s': '4rem'} as CSSProperties}><GuideCubeSpecimen /></div></div>}
              {f.id === 'editorial' && <ExistingArt art="phones" w="6rem" />}
              {f.id === 'characters' && <><GuideFrame /><PetFrame /></>}
              {f.id === 'world' && <div style={{width: '12rem'}}><SceneByName name="classic-day" /></div>}
            </div>
            {f.id === 'spot3d' && <p className="pqn-muted"><Tag kind="proposed" /> A guideline cube, not artwork.</p>}
          </article>
        ))}
      </div>
      <h2 style={{marginTop: '1rem'}}>Separate from functional icons</h2>
      <p>Functional icons are documented in <strong>Foundations → Icons</strong> (Material Symbols Rounded, outlined by default, filled for active or selected). Illustrations are never used as functional icons, and icons are never used as illustrations.</p>
      <h2>Decided by the owner</h2>
      <ul data-testid="decided">
        <li>The 3D documentation lives under this section (<code>Foundations / Illustrations / 3D Spot Illustrations</code>).</li>
        <li>Editorial art supports <strong>1:1, 4:3, 3:2 and 16:9</strong>, chosen by usage. The usage-to-ratio mapping is still a proposal.</li>
        <li>Rendering is standardized <strong>within each pixel-art family</strong>.</li>
        <li>Responsive scene cropping <strong>preserves each scene&rsquo;s focal point</strong>.</li>
        <li><strong>AI-generated 3D artwork</strong> is the future production approach, behind explicit gates. Nothing is generated yet.</li>
      </ul>
      <h2>Still open (not approved)</h2>
      <ol>
        <li>Which usage takes which editorial ratio, and the mobile crop for 16:9.</li>
        <li>The focal-point values for each existing scene (none are recorded) and the export density for new scenery.</li>
        <li>Whether sprites scale on mobile, and whether the pet walk honors reduced motion (not verified).</li>
      </ol>
      <p className="pqn-muted">All open items, with visual comparisons, are in Design Review / Open Decisions.</p>
    </section>
  );
}
function GuideCubeSpecimen() { return <GuidelineCube hue="orange" label="Guideline cube (specimen)" />; }

/* ---------------------------------------------------- 2. guidelines */

export function FamilyGuidelines({only}: {only?: FamilyId}) {
  return (
    <section style={{display: 'grid', gap: '1.5rem'}}>
      {FAMILIES.filter(f => !only || f.id === only).map(f => (
        <div key={f.id} data-testid={`guidelines-${f.id}`}>
          <h2>{f.name}</h2>
          <div className="pqn-scroll"><table>
            <caption className="pqn-muted" style={{textAlign: 'left'}}>{f.tagline}</caption>
            <thead><tr><th scope="col">Guideline</th><th scope="col">Rule, with its basis</th></tr></thead>
            <tbody>{GUIDELINE_KEYS.map(k => <tr key={k} data-testid={`g-${f.id}-${k}`}><th scope="row">{KEY_LABEL[k]}</th><td><Cells cells={f.guidelines[k]} /></td></tr>)}</tbody>
          </table></div>
        </div>
      ))}
    </section>
  );
}

/* ----------------------------------------------- 3. size & proportion */

const RatioBox = ({w, rw, rh, label}: {w: number | string; rw: number; rh: number; label: string}) => <div className="pqn-ratio" style={{'--pqn-w': typeof w === 'number' ? `${w}px` : w, '--pqn-rw': rw, '--pqn-rh': rh} as CSSProperties}><span>{label}</span></div>;

export function SizeProportion() {
  const o = EDITORIAL;
  const a = AUDIT.sheet.atlas;
  return (
    <section style={{display: 'grid', gap: '1.5rem'}}>
      <div data-testid="size-3d">
        <h2>3D Spot Illustrations <Tag kind="owner" /></h2>
        <p className="pqn-muted">Five square tokens, default M 64. Reused from the committed 3D model, not retyped.</p>
        <SizeScaleIll />
      </div>
      <div data-testid="size-editorial">
        <h2>Editorial Illustrations <Tag kind="local" /></h2>
        <p>Editorial art is sized by <strong>container width and ratio</strong>, not by an icon token, and is never forced into a square. {o.summary}</p>
        <p className="pqn-muted" style={{marginTop: '.5rem'}}>Each outline is drawn 12rem wide to compare proportions. Real display sizes are in Desktop vs Mobile.</p>
        <div className="pqn-row" data-testid="ratio-row" style={{marginTop: '.5rem'}}>
          {o.ratios.map(r => <div key={r.key} className="pqn-card" data-testid={`ratio-${r.key}`}><RatioBox w="12rem" rw={r.w} rh={r.h} label={`${r.w}:${r.h}`} /><strong>{r.label}</strong><span className="pqn-muted">{r.use}</span></div>)}
        </div>
        <div className="pqn-scroll"><table data-testid="ratio-table" style={{marginTop: '.75rem'}}>
          <thead><tr><th scope="col">Ratio</th>{FRAMES.map(f => <th scope="col" key={f.key}>{f.label} ({f.width}px page)</th>)}<th scope="col">Raster export at 2× (desktop)</th></tr></thead>
          <tbody>{o.ratios.map(r => { const d = sizeAt(r, 'desktop'); return (
            <tr key={r.key}><th scope="row">{r.label} {r.w}:{r.h}</th>{FRAMES.map(f => { const s = sizeAt(r, f.key); return <td key={f.key}>{s.w}×{s.h}{s.ratio[0] !== r.w ? ` (crops to ${s.ratio[0]}:${s.ratio[1]})` : ''}</td>; })}<td>{rasterPx(d.w, 2)}×{rasterPx(d.h, 2)}</td></tr>); })}</tbody>
        </table></div>
        <p className="pqn-muted">Existing art for comparison (<Tag kind="existing" />): work-art is drawn on 200×200 and scaled to fit; destination-art is 240×220 ({ratioLabel(240, 220)}).</p>
        <div className="pqn-row"><ExistingArt art="interface" w="8rem" /><ExistingArt art="orbit" w="8rem" ratio={[4, 3]} /><ExistingArt art="phones" w="8rem" ratio={[16, 9]} /></div>
      </div>
      <div data-testid="size-characters">
        <h2>Characters &amp; Sprites <Tag kind="measured" /></h2>
        <p>Sprite frames are measured from the sheets and drawn to scale below at 1× of the shown box.</p>
        <div className="pqn-row">
          <figure className="pqn-card"><GuideFrame /><figcaption>Guide companion: shown {90}×{110} CSS px from a {a.cellW}×{a.cellH} cell ({ratioLabel(a.cellW, a.cellH)}), {a.columns}×{a.rows} grid.</figcaption></figure>
          <figure className="pqn-card"><PetFrame /><figcaption>Pet frame: 256×256 cell (derived from a 1280×512 sheet in a 5×2 grid), shown at 128×128.</figcaption></figure>
        </div>
      </div>
      <div data-testid="size-world">
        <h2>World &amp; Environment <Tag kind="measured" /></h2>
        <p>Scenes are 1440×980 ({ratioLabel(1440, 980)}). The code-drawn island preview is 600×440 ({ratioLabel(600, 440)}).</p>
        <div className="pqn-row"><div style={{width: '16rem'}}><SceneByName name="classic-day" /></div><RatioBox w="10rem" rw={600} rh={440} label="600×440 island SVG" /></div>
      </div>
    </section>
  );
}

/* ----------------------------------------------- 4. desktop vs mobile */

export function DesktopMobile() {
  const o = EDITORIAL;
  const sample = ['classic-day', 'autumn-dusk'];
  return (
    <section style={{display: 'grid', gap: '1.5rem'}}>
      <p className="pqn-muted">Frames are drawn at their real pixel widths ({FRAMES.map(f => f.width).join(', ')}). Page padding is {PAD}px and content is capped at {MAX_CONTENT}px; both are local proposals. Scroll sideways inside a frame to see it whole.</p>
      <div data-testid="dm-3d"><h2>3D Spot Illustrations</h2><ResponsiveComparison /></div>
      <div data-testid="dm-editorial">
        <h2>Editorial Illustrations <Tag kind="local" /></h2>
        <div style={{display: 'grid', gap: '1rem', marginTop: '.5rem'}}>
          {FRAMES.map(f => (
            <div key={f.key} className="pqn-frame-wrap" role="region" aria-label={`${f.label} frame`} tabIndex={0}>
              <div className="pqn-frame" data-testid={`dm-ed-${f.key}`} style={{'--pqn-frame': `${f.width}px`, '--pqn-pad': `${PAD}px`} as CSSProperties}>
                <strong>{f.label} · {f.width}px</strong>
                <div className="pqn-row" style={{alignItems: 'flex-start'}}>{o.ratios.filter(r => (f.key === 'mobile' ? ['wide'] : ['cover', 'wide']).includes(r.key)).map(r => { const s = sizeAt(r, f.key); return <div key={r.key} style={{width: f.key === 'desktop' && o.ratios.length > 1 ? Math.min(s.w, 400) : s.w, maxWidth: '100%'}}><RatioBox w="100%" rw={s.ratio[0]} rh={s.ratio[1]} label={`${r.label} ${s.ratio[0]}:${s.ratio[1]}`} /><span className="pqn-muted">{f.key === 'desktop' && o.ratios.length > 1 ? `Full width would be ${s.w}×${s.h}` : `${s.w}×${s.h}`}</span></div>; })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div data-testid="dm-characters">
        <h2>Characters &amp; Sprites <Tag kind="open" /></h2>
        <p>The existing sprite boxes are fixed CSS pixel sizes (guide {90}×{110}); no separate mobile or desktop size was found. Whether sprites should scale on mobile is not specified.</p>
        <div className="pqn-row">{FRAMES.filter(f => f.key !== 'tablet').map(f => <div key={f.key} className="pqn-card"><strong>{f.label}</strong><GuideFrame /></div>)}</div>
      </div>
      <div data-testid="dm-world">
        <h2>World &amp; Environment <Tag kind="owner" /></h2>
        <p>Scenes are shown whole at frame width, as the code does today (object-fit: contain). Owner decision: any responsive crop must preserve the scene&rsquo;s <strong>focal point</strong>. No focal values are recorded yet, so no crop is applied here.</p>
        {FRAMES.filter(f => f.key !== 'tablet').map((f, i) => (
          <div key={f.key} className="pqn-frame-wrap" role="region" aria-label={`${f.label} scene frame`} tabIndex={0}>
            <div className="pqn-frame" data-testid={`dm-world-${f.key}`} style={{'--pqn-frame': `${f.width}px`, '--pqn-pad': `${PAD}px`} as CSSProperties}><strong>{f.label} · {f.width}px</strong><div style={{width: displayWidth(f.width)}}><SceneByName name={sample[i]} /></div></div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------- 5. light and dark */

const MODE_NAME: Record<string, string> = {light: 'Carbon White', dark: 'Gray 100'};
export function LightDark() {
  return (
    <section>
      <div className="pqn-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))'}}>
        {MODES.map(m => (
          <ModeFrame key={m} mode={m} title={MODE_NAME[m] ?? m}>
            <Layer hideMeta title={`Illustrations on ${MODE_NAME[m] ?? m}`}>
              <div style={{display: 'grid', gap: '1rem'}} data-testid={`ld-${m}`}>
                <div><strong>3D spot</strong> <Tag kind="proposed" /><div className="pqn-row" style={brandStyle()}>{ILL_SIZES.slice(0, 3).map(s => <div key={s.key} className="pqn-canvas" style={{'--pqn-s': `${s.px}px`} as CSSProperties}><GuidelineCube hue="teal" dark={m === 'dark'} label={`Guideline cube ${s.px}px`} /></div>)}</div>
                  <p className="pqn-muted">The form must read without its shadow on both themes.</p></div>
                <div><strong>Editorial</strong> <Tag kind="existing" /><div className="pqn-row"><ExistingArt art="chart" w="9rem" ratio={[4, 3]} /></div>
                  <p className="pqn-muted">Existing SVG art draws in the page&rsquo;s text color, so it follows the theme.</p></div>
                <div><strong>Characters</strong> <Tag kind="existing" /><div className="pqn-row"><GuideFrame /><PetFrame id="cat" /><PetFrame id="capybara" /></div>
                  <p className="pqn-muted">Sprites keep their own palette (transparent background) on both themes.</p></div>
                <div><strong>World</strong> <Tag kind="existing" /><div className="pqn-row"><div style={{width: '10rem'}}><SceneByName name="classic-day" /></div><div style={{width: '10rem'}}><SceneByName name="classic-night" /></div></div>
                  <p className="pqn-muted">Scenes carry their own day and night art; they do not change with the theme.</p></div>
              </div>
            </Layer>
          </ModeFrame>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 6. gallery */

const fmtDims = (f: AuditFile) => `${f.w}×${f.h}`;
export function AssetGallery() {
  const unref = unreferenced();
  return (
    <section style={{display: 'grid', gap: '1.5rem'}}>
      <p className="pqn-muted"><Tag kind="existing" /> Read-only previews by URL, sampled and lazy-loaded. Nothing is copied or restyled. &ldquo;Referenced&rdquo; is a text search of app/, components/ and lib/; it is evidence of use, not proof.</p>
      <div data-testid="gal-3d"><h2>3D Spot Illustrations</h2><p><Tag kind="open">None produced</Tag> There is no existing 3D artwork to show.</p></div>
      <div data-testid="gal-editorial"><h2>Editorial Illustrations</h2>
        <p className="pqn-muted">Code-drawn SVG; work-art.tsx calls itself placeholder artwork for sample projects. Drawn on {AUDIT.drawn[0].viewBoxes.join(', ')}.</p>
        <div className="pqn-grid">{ART.map(a => <figure key={a} className="pqn-card"><ExistingArt art={a} /><figcaption><code>{a}</code> composition</figcaption></figure>)}</div>
      </div>
      <div data-testid="gal-characters"><h2>Characters &amp; Sprites</h2>
        <div className="pqn-grid">{gallerySample('characters').map(f => (
          <figure key={f.path} className="pqn-card"><Scene f={f} className="pqn-img pqn-checker" /><figcaption><code>{f.path}</code><br />{fmtDims(f)} · {kb(f.bytes)} · referenced: {f.referenced}</figcaption></figure>
        ))}</div>
        <p className="pqn-muted">Sheets are shown whole; the frame grids are in Guidelines.</p>
      </div>
      <div data-testid="gal-world"><h2>World &amp; Environment</h2>
        <p className="pqn-muted">Six of {filesOf('world').length} files, chosen to show cities, seasons and day and night.</p>
        <div className="pqn-grid">{gallerySample('world').map(f => (
          <figure key={f.path} className="pqn-card"><Scene f={f} /><figcaption><code>{f.path}</code><br />{fmtDims(f)} · {kb(f.bytes)} · referenced: {f.referenced}</figcaption></figure>
        ))}</div>
      </div>
      <div data-testid="gal-unreferenced"><h2>Present, no reference found</h2>
        <p className="pqn-muted">{unref.length} files are in public/ but no code reference was found (a path or its directory). They may be used some other way.</p>
        <ul>{unref.map(f => <li key={f.path}><code>{f.path}</code> ({fmtDims(f)}, {kb(f.bytes)})</li>)}</ul></div>
    </section>
  );
}

/* --------------------------------------------------------- 7. usage */

export function UsageExamples() {
  return (
    <section style={{display: 'grid', gap: '1rem'}}>
      <p className="pqn-muted">Each example shows where a family sits in a page. Existing art is real; the 3D slot is a labelled specimen at its proposed size.</p>
      <div className="pqn-grid">
        <article className="pqn-card" data-testid="use-3d"><h3>Category tile <Tag kind="proposed" /></h3>
          <div className="pqn-row" style={{alignItems: 'center', ...brandStyle()}}><div className="pqn-canvas" style={{'--pqn-s': '64px'} as CSSProperties}><GuideCubeSpecimen /></div><div><strong>Selected Work</strong><p className="pqn-muted">3D spot at M 64 (the default for categories).</p></div></div></article>
        <article className="pqn-card" data-testid="use-editorial"><h3>Case-study card <Tag kind="existing" /></h3>
          <ExistingArt art="interface" ratio={[4, 3]} /><p>Project title</p><p className="pqn-muted">Existing SVG in a 4:3 frame; the art, not the container, sets the look.</p></article>
        <article className="pqn-card" data-testid="use-characters"><h3>Guide companion <Tag kind="existing" /></h3>
          <div className="pqn-row" style={{alignItems: 'center'}}><GuideFrame /><p className="pqn-muted">Existing sprite at its 90×110 box beside a speech line.</p></div></article>
        <article className="pqn-card" data-testid="use-world"><h3>Scene hero <Tag kind="existing" /></h3>
          <SceneByName name="classic-day" /><p className="pqn-muted">Existing scene shown whole at 1440:980.</p></article>
      </div>
    </section>
  );
}

/* ------------------------------------------------ 8. do and don't */

function Specimen({id}: {id: string}) {
  const brand = brandStyle();
  switch (id) {
    case 'safe-in': return <div style={brand}><div className="pqn-canvas" style={{'--pqn-s': '8rem'} as CSSProperties}><GuideCubeSpecimen /></div></div>;
    case 'safe-out': return <div style={brand}><div className="pqn-canvas" style={{'--pqn-s': '8rem', overflow: 'hidden'} as CSSProperties}><div style={{position: 'absolute', inset: 0, transform: 'scale(1.5)'}}><GuideCubeSpecimen /></div></div></div>;
    case 'own-ratio': return <RatioBox w="14rem" rw={16} rh={9} label="16:9 art in a 16:9 frame" />;
    case 'square-crop': return <div style={{width: '9rem', aspectRatio: '1', overflow: 'hidden', border: '2px solid CanvasText', display: 'grid', placeItems: 'center'}}><RatioBox w="16rem" rw={16} rh={9} label="16:9 art, cropped" /></div>;
    case 'integer': return <Baseline offsets={[0, 0, 0]} />;
    case 'fraction': return <Baseline offsets={[0, 10, 4]} />;
    case 'edge-safe': return <SceneZone x={50} />;
    default: return <SceneZone x={4} />;
  }
}
const Baseline = ({offsets}: {offsets: number[]}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: '.5rem', height: '5.5rem', borderBottom: '2px solid CanvasText', paddingBottom: 0, width: '14rem'}} aria-hidden="true">
    {offsets.map((o, i) => <div key={i} style={{width: '3rem', height: '4rem', border: '2px solid CanvasText', borderRadius: '50% 50% .5rem .5rem', marginBottom: `${o}px`, background: 'color-mix(in srgb, CanvasText 15%, Canvas)'}} />)}
  </div>
);
const SceneZone = ({x}: {x: number}) => (
  <div style={{position: 'relative', width: '14rem', aspectRatio: '1440 / 980', border: '2px solid CanvasText'}} aria-hidden="true">
    <div style={{position: 'absolute', inset: `${SAFE.scene * 100}%`, border: '1px dashed GrayText'}} />
    <div style={{position: 'absolute', left: `${x}%`, top: '45%', width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: 'CanvasText'}} />
  </div>
);

export function DoDont() {
  return (
    <section style={{display: 'grid', gap: '1.5rem'}}>
      <p className="pqn-muted"><Tag kind="proposed" /> Every specimen here is a plain shape drawn for this page. They illustrate the rules; they are not artwork. Each is labelled Do or Don&rsquo;t in words, not by color.</p>
      {FAMILIES.map(f => (
        <div key={f.id} data-testid={`dd-${f.id}`}><h2>{f.name}</h2>
          <div className="pqn-pair">{DO_DONT.filter(d => d.family === f.id).map(d => (
            <article key={d.id} className={`pqn-card ${d.verdict === 'do' ? 'pqn-do' : 'pqn-dont'}`} data-testid={`dd-${f.id}-${d.verdict}`}>
              <h3><Tag kind={d.verdict} /></h3><Specimen id={d.id} /><p>{d.text}</p>
            </article>
          ))}</div>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------- 9. production and export */

export function systemJson() {
  return {
    families: FAMILIES.map(f => ({id: f.id, name: f.name, existing: f.existing, guidelines: Object.fromEntries(GUIDELINE_KEYS.map(k => [k, f.guidelines[k].map(c => ({basis: c.b, text: c.t}))]))})),
    editorialOptions: EDITORIAL_OPTIONS.map(o => ({id: o.id, ratios: o.ratios.map(r => ({key: r.key, ratio: `${r.w}:${r.h}`, mobileCrop: r.mobileCrop ? `${r.mobileCrop[0]}:${r.mobileCrop[1]}` : null}))})),
    spot3dSizes: ILL_SIZES.map(s => ({key: s.key, px: s.px})),
    exports: EXPORTS.map(e => ({family: e.family, format: e.format.t, density: e.density.t, naming: e.naming.t, budget: e.budget.t})),
  };
}
export function ProductionExport() {
  const json = useMemo(() => JSON.stringify(systemJson(), null, 2), []);
  const chars = bytesStats(filesOf('characters'));
  return (
    <section style={{display: 'grid', gap: '1rem'}}>
      <div className="pqn-scroll"><table data-testid="export-table">
        <thead><tr><th scope="col">Family</th><th scope="col">Format</th><th scope="col">Export resolution</th><th scope="col">Naming</th><th scope="col">Size budget</th></tr></thead>
        <tbody>{EXPORTS.map(e => <tr key={e.family} data-testid={`export-${e.family}`}><th scope="row">{family(e.family).name}</th><td><Cells cells={[e.format]} /></td><td><Cells cells={[e.density]} /></td><td><Cells cells={[e.naming]} /></td><td><Cells cells={[e.budget]} /></td></tr>)}</tbody>
      </table></div>
      <h2>Rules for any new asset</h2>
      <ul data-testid="export-rules">
        <li>Raster assets are exported at 2× or higher of their largest display size. Existing files are never re-exported or renamed by this system.</li>
        <li>Transparent background wherever the art sits on a themed surface; check it on Carbon White and Gray 100.</li>
        <li>Brand colors and Carbon tokens only; no third-party shapes, text or logos inside artwork.</li>
        <li>Decorative art gets <code>alt=&quot;&quot;</code>; art that carries meaning gets a short accessible name. Sprites and scenes with motion honor <code>prefers-reduced-motion</code>.</li>
        <li>Existing characters measure {chars ? `${kb(chars.min)} to ${kb(chars.max)}` : 'n/a'} per file; use that as a sanity check, not as a budget.</li>
      </ul>
      <h2>Machine-readable system</h2>
      <Snippet label="Illustration system (JSON)" code={json} />
      <div className="pqn-row"><CopyButton text={json} label="Copy illustration system JSON" /></div>
      <p className="pqn-muted">For future React and Figma variables. No Figma file or library is created, and nothing in production reads this.</p>
    </section>
  );
}

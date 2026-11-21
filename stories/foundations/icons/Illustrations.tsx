import {useId, useMemo} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import './icons.css';
import {
  CAMERA, CANVAS, DEFAULT_ILL, DENSITIES, FRAMES, HUES, ILL_SIZES, LIGHT, MASTER_PX, MATERIALS, NAMING, OPTICAL, PLANNED, RAMP, RASTER_MIN_DENSITY, RESPONSIVE, SHADOW, SPEC,
  cubeFaces, deliveredPx, hueRgb, illPx, inkRgb, lightVector, margin, plannedName, rampCss, sizeFor, specJson, type Hue, type IllKey, type Planned,
} from './illustration-model';
import {Tag, CopyButton, Snippet} from './Icons';
import {assetDirs} from './icons-census';

/* ---------------------------------------------------------------- shared */

/** Existing brand colors, read live, exposed as custom properties for color-mix() ramps. Never hex literals. */
export const brandStyle = (): CSSProperties => {
  const s: Record<string, string> = {'--pqi-ink': inkRgb()};
  for (const h of HUES) s[`--pqi-hue-${h}`] = hueRgb(h);
  return s as CSSProperties;
};
const Diagram = ({children, label, testId}: {children: ReactNode; label: string; testId?: string}) => (
  <svg className="pqi-diagram" viewBox="0 0 100 100" role="img" aria-label={label} data-testid={testId}>{children}</svg>
);
const REF = 0.62;
/** Face color from its Lambert shade: lit faces mix toward white, shadowed faces toward black, by the shared ramp percentages. */
export function shadeFill(varName: string, s: number): string {
  if (s >= REF) return `color-mix(in srgb, ${varName} ${100 - Math.round(((s - REF) / (1 - REF)) * RAMP[0].pct)}%, white)`;
  return `color-mix(in srgb, ${varName} ${100 - Math.round(((REF - s) / REF) * RAMP[2].pct * 1.6)}%, black)`;
}
const hueVar = (h: Hue) => `var(--pqi-hue-${h})`;

/** The shared contact shadow: same ellipse, offset and softness for every object. */
function ContactShadow({cx = 50, width = 36, dark}: {cx?: number; width?: number; dark: boolean}) {
  const id = useId();
  const rx = (width * SHADOW.widthRatio) / 1, ry = rx * SHADOW.heightRatio;
  return (
    <>
      <defs><filter id={id} x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation={SHADOW.blurRatio * 100} /></filter></defs>
      <ellipse cx={cx + 3} cy={CANVAS.groundLine * 100} rx={rx} ry={ry} fill="black" opacity={dark ? SHADOW.alphaDark : SHADOW.alphaLight} filter={`url(#${id})`} data-testid="contact-shadow" />
    </>
  );
}

export function GuidelineCube({hue = 'orange', dark = false, label = 'Guideline cube'}: {hue?: Hue; dark?: boolean; label?: string}) {
  const faces = cubeFaces();
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={label} style={{width: '100%', height: '100%', display: 'block'}} data-testid="guideline-cube">
      <ContactShadow dark={dark} />
      {faces.filter(f => f.visible).map(f => <polygon key={f.id} className="edge" points={f.points} fill={shadeFill(hueVar(hue), f.shade)} stroke={shadeFill(hueVar(hue), f.shade)} data-face={f.id} data-shade={f.shade.toFixed(3)} />)}
    </svg>
  );
}

export function GuidelineSphere({hue = 'teal', specular = 0.1, dark = false}: {hue?: Hue; specular?: number; dark?: boolean}) {
  const id = useId();
  const [lx, ly] = lightVector();
  const fx = 50 + lx * 14, fy = 46 + ly * 14;
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`Guideline sphere, specular ${Math.round(specular * 100)}%`} style={{width: '100%', height: '100%', display: 'block'}}>
      <defs>
        <radialGradient id={id} cx={fx} cy={fy} r="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={shadeFill(hueVar(hue), 1)} /><stop offset="0.55" stopColor={hueVar(hue)} /><stop offset="1" stopColor={shadeFill(hueVar(hue), 0.1)} />
        </radialGradient>
      </defs>
      <ContactShadow dark={dark} width={34} />
      <circle cx="50" cy="46" r="28" fill={`url(#${id})`} />
      <ellipse cx={fx} cy={fy - 2} rx="6" ry="4" fill="white" opacity={specular} />
    </svg>
  );
}

/* ----------------------------------------------------------- placeholder slot */

export function Slot({size, label, planned, children}: {size: IllKey; label?: string; planned?: boolean; children?: ReactNode}) {
  const px = illPx(size);
  return (
    <span className="pqi-slot" data-size={size} data-planned={planned ? 'true' : undefined} role="img" aria-label={`${label ?? 'Illustration'} placeholder, ${px} by ${px} pixels, not produced`} style={{'--pqi-slot': `${px}px`} as CSSProperties}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ sections */

export function IllBanner() {
  return (
    <div className="pqi-box" role="note">
      <p><Tag kind="owner" /> The five size tokens and the 64px default. <Tag kind="local" /> Everything else: camera, light, shadow, ramp, optical sizing, responsive mapping, naming, formats and budgets.</p>
      <p className="pqi-muted">This is a design system and asset specification. <strong>No finished illustration exists.</strong> Diagrams use neutral primitives drawn from the shared constants; slots are empty placeholders. Airbnb’s dimensional illustrations are general inspiration only; no proprietary asset is copied, traced or embedded. The style is a proposal, not an approved replacement.</p>
    </div>
  );
}

export function SizeScaleIll() {
  const cube = (k: IllKey) => <Slot size={k} label={`${k.toUpperCase()} guideline`}><GuidelineCube hue="orange" /></Slot>;
  return (
    <section style={brandStyle()}>
      <div className="pqi-scroll"><table data-testid="ill-size-table">
        <thead><tr><th>Size</th><th>Dimensions</th><th>Guideline (diagram, not an asset)</th><th>Delivered at 2×</th><th>Delivered at 3×</th><th>Intended use</th></tr></thead>
        <tbody>{ILL_SIZES.map(s => (
          <tr key={s.key} data-testid={`ill-size-${s.key}`}>
            <td>{s.label} <Tag kind="owner" />{s.key === DEFAULT_ILL ? <> <strong>default</strong></> : null}</td><td>{s.px} × {s.px} px</td><td>{cube(s.key)}</td>
            <td>{deliveredPx(s.key, 2)} px</td><td>{deliveredPx(s.key, 3)} px</td><td>{s.use}</td>
          </tr>
        ))}</tbody>
      </table></div>
      <p className="pqi-muted">Default is <strong>{illPx(DEFAULT_ILL)}px (M)</strong> for categories and destinations. Raster assets are delivered at least {RASTER_MIN_DENSITY}× the display size.</p>
    </section>
  );
}

export function CanvasGrid() {
  const m = margin() * 100;
  return (
    <section style={brandStyle()}>
      <div className="pqi-grid">
        <article className="pqi-box">
          <h3>Canvas and safe area</h3>
          <Diagram label="Square canvas with an 80 percent safe area, center lines and a ground line" testId="canvas-diagram">
            <rect className="guide" x="0.2" y="0.2" width="99.6" height="99.6" />
            <rect className="safe" x={m} y={m} width={100 - 2 * m} height={100 - 2 * m} data-testid="safe-rect" />
            <line className="guide" x1="50" y1="0" x2="50" y2="100" /><line className="guide" x1="0" y1="50" x2="100" y2="50" />
            <line className="guide" x1="0" y1={CANVAS.groundLine * 100} x2="100" y2={CANVAS.groundLine * 100} />
            <text x="2" y={m - 1}>safe area {CANVAS.safeArea * 100}% (margin {m}%)</text>
            <text x="2" y={CANVAS.groundLine * 100 - 1}>ground line {CANVAS.groundLine * 100}%</text>
          </Diagram>
          <p className="pqi-muted">Square, {CANVAS.background} background, {CANVAS.safeArea * 100}% safe area. Artwork stays inside the shaded square; only the soft contact shadow may touch the ground line.</p>
        </article>
        <article className="pqi-box">
          <h3>Object inside the safe area</h3>
          <Diagram label="A guideline cube placed inside the safe area">
            <rect className="safe" x={m} y={m} width={100 - 2 * m} height={100 - 2 * m} />
            <line className="guide" x1="0" y1={CANVAS.groundLine * 100} x2="100" y2={CANVAS.groundLine * 100} />
            <foreignObject x="0" y="0" width="100" height="100"><div style={{width: '100%', height: '100%'}}><GuidelineCube /></div></foreignObject>
          </Diagram>
        </article>
        <article className="pqi-box">
          <h3>Optical sizing by shape</h3>
          <div className="pqi-scroll"><table data-testid="optical-table"><thead><tr><th>Shape</th><th>Scale</th><th>Why</th></tr></thead>
            <tbody>{OPTICAL.map(o => <tr key={o.shape}><td>{o.shape}</td><td>×{o.scale}</td><td>{o.why}</td></tr>)}</tbody></table></div>
        </article>
      </div>
    </section>
  );
}

export function PerspectiveLighting() {
  const [lx, ly] = lightVector();
  const faces = cubeFaces();
  return (
    <section style={brandStyle()}>
      <div className="pqi-grid">
        <article className="pqi-box">
          <h3>Camera: {CAMERA.name}</h3>
          <div style={{width: '100%', maxWidth: '20rem', aspectRatio: '1'}} className="pqi-box"><GuidelineCube label="Cube seen from the shared camera" /></div>
          <p className="pqi-muted">Yaw {CAMERA.yawDeg}°, pitch {CAMERA.pitchDeg}°. {CAMERA.note} Every asset uses this one camera.</p>
        </article>
        <article className="pqi-box">
          <h3>Light</h3>
          <Diagram label="Light direction: key from the upper left" testId="light-diagram">
            <circle className="guide" cx="50" cy="50" r="30" />
            <line x1={50 + lx * 30} y1={50 + ly * 30} x2="50" y2="50" stroke="CanvasText" strokeWidth="1" markerEnd="url(#arrow)" />
            <defs><marker id="arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0 0L4 2L0 4Z" fill="CanvasText" /></marker></defs>
            <circle cx={50 + lx * 30} cy={50 + ly * 30} r="3" fill="Mark" stroke="CanvasText" strokeWidth=".5" />
            <text x="8" y="10">key light · azimuth {LIGHT.azimuthDeg}°, elevation {LIGHT.elevationDeg}°</text><text x="8" y="94">fill {LIGHT.fillIntensity * 100}% from the right</text>
          </Diagram>
          <p className="pqi-muted">{LIGHT.note}</p>
        </article>
        <article className="pqi-box">
          <h3>Shading follows the light</h3>
          <div className="pqi-scroll"><table data-testid="shade-table"><thead><tr><th>Face</th><th>Shade (0 to 1)</th></tr></thead>
            <tbody>{faces.map(f => <tr key={f.id} data-testid={`shade-${f.id}`}><td>{f.id}</td><td>{f.shade.toFixed(3)}</td></tr>)}</tbody></table></div>
          <p className="pqi-muted">Computed from the same light vector for the guideline cube. Top is brightest, the face toward the light is next, the face away is darkest.</p>
        </article>
        <article className="pqi-box">
          <h3>Contact shadow</h3>
          <p>{SHADOW.shape}; width {SHADOW.widthRatio * 100}% of the footprint, blur {SHADOW.blurRatio * 100}% of the canvas, alpha {SHADOW.alphaLight * 100}% on light surfaces and {SHADOW.alphaDark * 100}% on dark. {SHADOW.note}</p>
          <div className="pqi-row">
            <span className="pqi-box" style={{background: 'Canvas', width: '8rem', height: '8rem'}} data-testid="shadow-light"><GuidelineSphere /></span>
            <span className="pqi-box" style={{background: 'CanvasText', color: 'Canvas', width: '8rem', height: '8rem'}} data-testid="shadow-dark"><GuidelineSphere dark /></span>
          </div>
          <p className="pqi-muted">Left: a light surface. Right: a dark surface (shown with the dark alpha). On Gray 100 the shadow nearly disappears, so the form must read from its shading alone; that is a review rule.</p>
        </article>
      </div>
    </section>
  );
}

export function ColorMaterial() {
  return (
    <section style={brandStyle()}>
      <h2>Brand colors and the shading ramp</h2>
      <p className="pqi-muted">Base colors are the existing Portfolio Quest brand tokens, read live from production CSS. Ramp steps are <code>color-mix()</code> percentages of the base, never new hex values.</p>
      <div className="pqi-grid" data-testid="ramps">
        {HUES.map(h => {
          const r = rampCss(hueVar(h));
          return (
            <article key={h} className="pqi-box" data-testid={`ramp-${h}`}>
              <h3>{h}</h3>
              <div className="pqi-rampsw">{(['highlight', 'base', 'shade', 'bounce'] as const).map(k => <div key={k} style={{background: r[k]}}><span style={{background: 'Canvas', padding: '0 .15rem'}}>{k}</span></div>)}</div>
            </article>
          );
        })}
      </div>
      <div className="pqi-scroll"><table data-testid="ramp-table"><thead><tr><th>Step</th><th>Mix</th><th>Used on</th><th>Note</th></tr></thead>
        <tbody>{RAMP.map(r => <tr key={r.step}><td>{r.step}</td><td>{r.pct ? `${r.mix} ${r.pct}%` : 'none'}</td><td>{r.face}</td><td>{r.note}</td></tr>)}</tbody></table></div>
      <h2>Materials</h2>
      <div className="pqi-grid">{MATERIALS.map(m => (
        <article key={m.name} className="pqi-box"><h3>{m.name}</h3><div style={{width: '8rem', height: '8rem'}}><GuidelineSphere specular={m.specular} /></div><p className="pqi-muted">Specular {m.specular * 100}%. {m.use}</p></article>
      ))}</div>
      <p className="pqi-muted">Rules: at most 3 hues per asset plus ink and paper neutrals; shadows are never pure black on the form; no outlines, no text, no gradients that read as a different brand color. Both Carbon White and Gray 100 must be checked.</p>
    </section>
  );
}

/* ------------------------------------------------------------ responsive */

function Ctx({context, size, hue, label}: {context: string; size: IllKey; hue: Hue; label: string}) {
  return (
    <div className="pqi-ctx" data-testid={`ctx-${context}`}>
      <Slot size={size} label={context}><GuidelineCube hue={hue} /></Slot>
      <div><strong>{label}</strong><br /><span className="pqi-muted">{illPx(size)}px · {context}</span></div>
    </div>
  );
}
export function ResponsiveComparison() {
  const hues: Hue[] = ['orange', 'teal', 'lilac', 'yellow'];
  return (
    <section style={brandStyle()}>
      <div className="pqi-scroll"><table data-testid="responsive-table"><thead><tr><th>Context</th><th>Mobile</th><th>Desktop</th><th>Note</th></tr></thead>
        <tbody>{RESPONSIVE.map(r => <tr key={r.context} data-testid={`resp-${r.context}`}><td>{r.context}</td><td>{illPx(r.mobile)}px ({r.mobile.toUpperCase()})</td><td>{illPx(r.desktop)}px ({r.desktop.toUpperCase()})</td><td>{r.note}</td></tr>)}</tbody></table></div>
      <p className="pqi-muted">One master asset serves every breakpoint. A simplified small-size variant (<code>-sm</code>) is allowed only for 32 and 48px, and only if the squint test fails. Raster files are delivered at 2× and 3×.</p>
      <div className="pqi-stack" style={{display: 'grid', gap: '1rem'}}>
        {FRAMES.map(f => (
          <div key={f.key} className="pqi-scroll">
            <div className="pqi-frame" style={{'--pqi-frame': `${f.width}px`} as CSSProperties} data-testid={`frame-${f.key}`}>
              <p className="pqi-frame-label">{f.label} · {f.width}px frame (fixed-width: media queries would follow the preview, not the frame)</p>
              {RESPONSIVE.map((r, i) => <Ctx key={r.context} context={r.context} size={sizeFor(r, f.key)} hue={hues[i]} label={r.context} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- asset gallery */

export function AssetGallery() {
  return (
    <section style={brandStyle()}>
      <p data-testid="gallery-note"><Tag kind="issue">None produced</Tag> These are the planned subjects, taken from the real destinations. Each slot is empty. The motif is read from the existing line artwork and is not a design.</p>
      <div className="pqi-grid" data-testid="planned-grid">
        {PLANNED.map(p => <PlannedCard key={p.subject} p={p} />)}
      </div>
    </section>
  );
}
function PlannedCard({p}: {p: Planned}) {
  return (
    <article className="pqi-card" data-testid={`planned-${p.subject}`}>
      <div className="pqi-row"><Slot size="m" label={p.label} planned /><Slot size="xl" label={p.label} planned /></div>
      <h3>{p.label}</h3>
      <p className="pqi-muted">{p.destination} · proposed hue <strong>{p.hue}</strong> <span className="pqi-swatch" style={{background: hueVar(p.hue)}} /> · status: {p.status}</p>
      <p>{p.motif}</p>
      <p className="pqi-muted">Files: <code>pq-ill-{p.subject}-master.png</code>, <code>{plannedName(p, 'm')}</code>, <code>pq-ill-{p.subject}@3x.webp</code>, <code>{plannedName(p, 's')}</code> (simplified small variant, only if needed)</p>
    </article>
  );
}

export function UsageExamples() {
  return (
    <section style={brandStyle()}>
      <p className="pqi-muted">Placeholders show where a produced asset would sit at its proposed size. Nothing here is artwork.</p>
      <div className="pqi-grid">
        <article className="pqi-card" data-testid="use-nav"><h3>Navigation</h3>
          <nav aria-label="Example" className="pqi-ctx">{PLANNED.slice(0, 4).map(p => <span key={p.subject} className="pqi-ctx"><Slot size="xs" label={p.label}><GuidelineCube hue={p.hue} /></Slot>{p.label}</span>)}</nav></article>
        <article className="pqi-card" data-testid="use-category"><h3>Category tiles (M, default)</h3>
          <div className="pqi-ctx">{PLANNED.slice(0, 3).map(p => <span key={p.subject} className="pqi-card"><Slot size="m" label={p.label}><GuidelineCube hue={p.hue} /></Slot>{p.label}</span>)}</div></article>
        <article className="pqi-card" data-testid="use-destination"><h3>Destination card</h3>
          <div className="pqi-ctx"><Slot size="l" label="Selected Work"><GuidelineCube hue="orange" /></Slot><div><strong>Selected Work</strong><p className="pqi-muted">Case studies with real outcomes.</p></div></div></article>
        <article className="pqi-card" data-testid="use-featured"><h3>Featured section</h3>
          <div className="pqi-ctx"><Slot size="xl" label="Island world"><GuidelineCube hue="lime" /></Slot><div><strong>Explore the island</strong><p className="pqi-muted">A playable way to browse the portfolio.</p></div></div></article>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ spec */

export function AssetSpec() {
  const json = useMemo(() => JSON.stringify(specJson(), null, 2), []);
  return (
    <section>
      <h2>Naming</h2>
      <div className="pqi-scroll"><table data-testid="naming-table"><tbody>
        <tr><th>Pattern</th><td><code>{NAMING.pattern}</code></td></tr><tr><th>subject</th><td>{NAMING.subject}</td></tr><tr><th>variant</th><td>{NAMING.variant}</td></tr>
        <tr><th>density</th><td>{NAMING.density}</td></tr><tr><th>ext</th><td>{NAMING.ext}</td></tr><tr><th>Examples</th><td>{NAMING.example.map(e => <div key={e}><code>{e}</code></div>)}</td></tr><tr><th>Folder</th><td>{NAMING.folder}</td></tr>
      </tbody></table></div>
      <h2>Formats, resolution and delivery</h2>
      <div className="pqi-scroll"><table data-testid="spec-table"><tbody>
        {Object.entries(SPEC).map(([section, rows]) => (
          <tr key={section}><th style={{textTransform: 'capitalize'}}>{section}</th><td>{Array.isArray(rows) ? (rows as readonly string[]).map(r => <div key={r}>{r}</div>) : Object.entries(rows).map(([k, v]) => <div key={k}><strong>{k}:</strong> {String(v)}</div>)}</td></tr>
        ))}
      </tbody></table></div>
      <p className="pqi-muted" data-testid="density-note">Raster assets must be exported at least {RASTER_MIN_DENSITY}× ({DENSITIES.join('× and ')}× delivered) and mastered at {MASTER_PX}px. Example: XL (128px) ships at {deliveredPx('xl', 2)}px and {deliveredPx('xl', 3)}px.</p>
      <h2>Machine-readable specification</h2>
      <Snippet label="Asset specification (JSON)" code={json} />
      <div className="pqi-row"><CopyButton text={json} label="Copy specification JSON" /></div>
    </section>
  );
}

/* ------------------------------------------------------------- exceptions */

export function IllExceptions() {
  const dirs = assetDirs();
  return (
    <section>
      <p><Tag kind="preserved" /> The proposed 3D style is separate from, and never replaces, the existing pixel art, avatars, game assets and scene illustrations, or the existing destination line artwork.</p>
      <div className="pqi-scroll"><table data-testid="ill-exceptions"><thead><tr><th>Existing asset family</th><th>Where</th><th>Files</th><th>Treatment</th></tr></thead>
        <tbody>
          {dirs.map(d => <tr key={d.dir} data-testid={`ill-dir-${d.dir}`}><td>{d.label}</td><td><code>public/{d.dir}/</code></td><td>{d.count}</td><td>Preserved. Not restyled, not recolored, not replaced.</td></tr>)}
          <tr><td>Destination line artwork (work, concepts, arcade, about, contact)</td><td><code>components/home/destination-art.tsx</code></td><td>5 drawings</td><td>Preserved. Reference for the planned subjects only.</td></tr>
          <tr><td>Work and world art, island scene SVG</td><td><code>components/work/work-art.tsx</code>, <code>components/home/world-preview.tsx</code></td><td>—</td><td>Preserved.</td></tr>
        </tbody></table></div>
      <div className="pqi-grid">{dirs.slice(0, 6).map(d => (
        <article key={d.dir} className="pqi-box"><h3>{d.label}</h3>
          {/* eslint-disable-next-line @next/next/no-img-element -- read-only previews of production files by URL */}
          <div className="pqi-row">{d.sample.map(f => <img key={f} src={`/${f}`} alt="" width={64} height={64} loading="lazy" style={{objectFit: 'contain', imageRendering: /pets|guide/.test(d.dir) ? 'pixelated' : 'auto'}} className="pqi-checker" />)}</div></article>
      ))}</div>
    </section>
  );
}

export {RAMP, DEFAULT_ILL};

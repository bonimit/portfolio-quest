import type {CSSProperties, ReactNode} from 'react';
import {Layer, ModeFrame} from '../foundations/carbon/CarbonColors';
import {MODES, MODE_LABEL, brandColor, carbonColor, depthVars, existingOrangeText, modeVars} from '../foundations/carbon/carbon-model';
import {contrastRatio, toRgb} from '../foundations/color-math';
import {shadowVars} from '../foundations/depth/depth-model';
import {Icon, IconFontStyles} from '../foundations/icons/Icons';
import {EDITORIAL} from '../foundations/illustrations/illustrations-model';
import {Legend, Page, Tag} from '../foundations/overview/ui';
import {FULLSCREEN, committedPx, committedSpecimens, radiusVars, shapeFor} from '../foundations/shape/shape-model';
import {CLASSES, spacingVars} from '../foundations/spacing/spacing-model';
import {TARGETS, CHIP_HEIGHT} from '../foundations/accessibility/accessibility-model';
import verification from './token-verification.json';
import {DECIDED, OPEN, PROVENANCE, foundationsOf, type Open, type VisualId} from './review-model';

export const ReviewPage = ({title, children}: {title: string; children: ReactNode}) => <Page title={title} testId="review-page"><Legend />{children}</Page>;
const rgb = (c: Parameters<typeof toRgb>[0]) => toRgb(c);

/* ---------------------------------------------------------------- visuals */

function Compare({children}: {children: ReactNode}) { return <div className="pqv-cmp" data-testid="visual">{children}</div>; }
const Opt = ({title, children}: {title: string; children: ReactNode}) => <div className="pqv-opt"><h4>{title}</h4>{children}</div>;

function PageBg() {
  const paper = rgb(brandColor('paper')), white = rgb(carbonColor('light', 'background'));
  const ink = rgb(brandColor('ink'));
  return (
    <Compare>
      <Opt title="Warm paper"><div className="pqv-swatch" style={{background: paper, color: ink}} data-testid="swatch-paper">Page text on paper</div></Opt>
      <Opt title="Carbon White"><div className="pqv-swatch" style={{background: white, color: ink}} data-testid="swatch-white">Page text on Carbon White</div></Opt>
    </Compare>
  );
}
function OrangeText() {
  const orange = brandColor('orange'), dark = existingOrangeText(), white = carbonColor('light', 'background');
  return (
    <Compare>
      <Opt title="Accent orange as text"><div className="pqv-swatch" style={{background: rgb(white), color: rgb(orange)}}>Orange text</div><p data-testid="orange-ratio">{contrastRatio(orange, white).toFixed(2)}:1 on Carbon White (4.5:1 needed)</p></Opt>
      <Opt title="Existing darker orange literal">{dark ? <><div className="pqv-swatch" style={{background: rgb(white), color: rgb(dark)}}>Darker orange text</div><p>{contrastRatio(dark, white).toFixed(2)}:1 on Carbon White</p></> : <p>Not found in source.</p>}</Opt>
    </Compare>
  );
}
function FocusRingVisual() {
  return (
    <div className="pqv-cmp" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))'}}>
      {MODES.map(m => (
        <ModeFrame key={m} mode={m} title={MODE_LABEL[m]}>
          <Layer hideMeta>
            <div className="pqv-row" style={{padding: '.75rem', gap: '1.25rem'}} data-testid={`focus-${m}`}>
              <button type="button" className="pqv-ring" style={{'--pqv-ring': rgb(m === 'light' ? brandColor('ink') : brandColor('paper')), minHeight: '2.5rem', padding: '0 1rem', borderRadius: '999px', border: '1px solid currentColor', background: 'transparent', color: 'inherit'} as CSSProperties}>Existing ink / paper ring</button>
              <button type="button" className="pqv-ring" style={{'--pqv-ring': rgb(carbonColor(m, 'focus')), minHeight: '2.5rem', padding: '0 1rem', borderRadius: '999px', border: '1px solid currentColor', background: 'transparent', color: 'inherit'} as CSSProperties}>Carbon focus ring</button>
            </div>
          </Layer>
        </ModeFrame>
      ))}
    </div>
  );
}
function DarkFloating() {
  return (
    <ModeFrame mode="dark" title="Gray 100">
      <Layer hideMeta>
        <div className="pqv-cmp" style={{padding: '1rem'}} data-testid="floating">
          {(['carbon', 'border-first'] as const).map(opt => (
            <Opt key={opt} title={opt === 'carbon' ? 'Carbon shadow' : 'Border-first'}>
              <div style={{...shadowVars('dark', opt), padding: '1rem', background: 'var(--pqc-layer-02)', boxShadow: 'var(--pqs-shadow-floating)', border: '1px solid var(--pqs-floating-border)', borderRadius: '4px'} as CSSProperties} data-testid={`floating-${opt}`}>Floating menu</div>
            </Opt>
          ))}
        </div>
      </Layer>
    </ModeFrame>
  );
}
function Touch() {
  return (
    <div className="pqv-row" style={{alignItems: 'flex-end'}} data-testid="touch-visual">
      {TARGETS.map(t => <figure key={t.px} className="pqv-card" style={{margin: 0}}><div className="pqv-box-size" style={{'--pqv-s': `${t.px}px`} as CSSProperties}>{t.px}</div><figcaption>{t.px}px</figcaption></figure>)}
      <figure className="pqv-card" style={{margin: 0}}><div className="pqv-box-size" style={{'--pqv-s': `${CHIP_HEIGHT}px`, width: '5rem', borderRadius: '8px'} as CSSProperties}>chip</div><figcaption>{CHIP_HEIGHT}px chip</figcaption></figure>
    </div>
  );
}
function MenuShape() {
  const base = shapeFor('menu', 'M').css;
  const big = '16px', group = '8px'; // Material expressive menu container and group corners (Shape: Component Shapes)
  return (
    <Compare>
      <Opt title="Baseline menu (decided)"><div style={{borderRadius: base, border: '2px solid currentColor', padding: '.5rem', display: 'grid', gap: '.25rem'}} data-testid="menu-base"><span>Item</span><span>Item</span></div><p>{base}</p></Opt>
      <Opt title="Expressive menu (not adopted)"><div style={{borderRadius: big, border: '2px solid currentColor', padding: '.5rem', display: 'grid', gap: '.25rem'}} data-testid="menu-expressive"><span style={{borderRadius: group, border: '1px solid currentColor', padding: '.25rem'}}>Item</span><span style={{borderRadius: group, border: '1px solid currentColor', padding: '.25rem'}}>Item</span></div><p>{big} container, {group} groups</p></Opt>
    </Compare>
  );
}
function DialogMap() {
  const dlg = shapeFor('dialog', 'M').css, sheet = shapeFor('sheet', 'M').css, full = FULLSCREEN.css;
  const rows = [
    {name: 'Confirmation or alert', pat: 'Dialog', css: dlg, w: '12rem', h: '6rem', note: 'every window class'},
    {name: 'Short choice', pat: 'Bottom sheet (compact)', css: sheet.includes(' ') ? sheet : `${sheet} ${sheet} 0 0`, w: '12rem', h: '6rem', note: 'dialog on medium and larger'},
    {name: 'Long form or task', pat: 'Full-screen dialog (compact)', css: full, w: '12rem', h: '6rem', note: 'dialog on medium and larger'},
  ];
  return <Compare>{rows.map(r => <Opt key={r.name} title={r.name}><div style={{width: r.w, height: r.h, border: '2px solid currentColor', borderRadius: r.css, display: 'grid', placeItems: 'center', textAlign: 'center', fontSize: '.75rem'}} data-testid={`pattern-${r.pat.split(' ')[0].toLowerCase()}`}>{r.pat}</div><p className="pqv-muted">{r.note}</p></Opt>)}</Compare>;
}
function EditorialMap() {
  return (
    <div className="pqv-row" style={{alignItems: 'flex-end'}} data-testid="ratio-map">
      {EDITORIAL.ratios.map(r => <figure key={r.key} className="pqv-card" style={{margin: 0}}><div style={{width: '9rem', aspectRatio: `${r.w} / ${r.h}`, border: '2px dashed currentColor', display: 'grid', placeItems: 'center'}}>{r.w}:{r.h}</div><figcaption><strong>{r.label}</strong><br />{r.use}</figcaption></figure>)}
    </div>
  );
}
function Focal() {
  // A plain specimen: a scene with an off-center focal point and two crops. No real scene and no real coordinates.
  const frame = {position: 'relative', width: '16rem', aspectRatio: '1440 / 980', border: '2px solid currentColor'} as CSSProperties;
  const dot = {position: 'absolute', left: '78%', top: '40%', width: '1rem', height: '1rem', borderRadius: '50%', background: 'currentColor', transform: 'translate(-50%, -50%)'} as CSSProperties;
  return (
    <Compare>
      <Opt title="Crop around the center"><div style={frame} data-testid="focal-center"><div style={dot} /><div style={{position: 'absolute', inset: '0 30%', border: '2px dashed currentColor'}} /></div><p>The focal subject falls outside the crop.</p></Opt>
      <Opt title="Crop around the focal point"><div style={frame} data-testid="focal-anchored"><div style={dot} /><div style={{position: 'absolute', inset: '0 0 0 46%', border: '2px dashed currentColor'}} /></div><p>The crop is anchored on the focal point.</p></Opt>
    </Compare>
  );
}
function IconXs() {
  return <><IconFontStyles /><div className="pqv-row" data-testid="icon-sizes">{[16, 20, 24].map(px => <figure key={px} className="pqv-card" style={{margin: 0}}><span style={{fontSize: px}}><Icon name="search" size={px === 16 ? 'xs' : px === 20 ? 'sm' : 'md'} /></span><figcaption>{px}px{px === 16 ? ' (below the font\'s 20px minimum optical size)' : ''}</figcaption></figure>)}</div></>;
}
function TypeResp() { return <p className="pqv-muted">No inline comparison: Options P and Q change which roles scale on mobile. Compare them in Foundations / Typography · Desktop vs Mobile.</p>; }

const VISUALS: Record<VisualId, () => ReactNode> = {
  'page-bg': PageBg, 'orange-text': OrangeText, 'focus-ring': FocusRingVisual, 'dark-floating': DarkFloating, touch: Touch, 'menu-shape': MenuShape, 'dialog-map': DialogMap,
  'editorial-map': EditorialMap, focal: Focal, 'icon-xs': IconXs, 'type-resp': TypeResp,
};

/* ------------------------------------------------------------- open decisions */

function Item({d}: {d: Open}) {
  const V = d.visual ? VISUALS[d.visual] : null;
  return (
    <article className="pqv-card" data-testid={`open-${d.id}`}>
      <h3><Tag kind="open" /> {d.question}</h3>
      <ul>{d.options.map(o => <li key={o.name}><strong>{o.name}.</strong> {o.summary}</li>)}</ul>
      {V ? <V /> : <p className="pqv-muted" data-testid="no-visual">No inline visual: a policy or number decision. See the source story.</p>}
      <p className="pqv-muted">Discussed in {d.source}</p>
    </article>
  );
}
export function OpenDecisions() {
  return (
    <section style={{display: 'grid', gap: '1.5rem'}}>
      <div className="pqv-box" data-testid="open-summary">
        <p><strong>{OPEN.length} open decisions</strong> across {foundationsOf().length} foundations, {OPEN.filter(d => d.visual).length} with an inline visual comparison. <strong>None is approved</strong>, and no option here is a default or a recommendation. They are compiled from each foundation&rsquo;s own open list, after removing what the owner has already decided (listed last).</p>
      </div>
      {foundationsOf().map(f => (
        <div key={f} data-testid={`group-${f}`}><h2>{f}</h2><div style={{display: 'grid', gap: '1rem', marginTop: '.5rem'}}>{OPEN.filter(d => d.foundation === f).map(d => <Item key={d.id} d={d} />)}</div></div>
      ))}
      <div data-testid="decided-list"><h2>Decided by the owner</h2>
        <ul>{DECIDED.map(d => <li key={d.id} data-testid={`decided-${d.id}`}><Tag kind="decided" /> <strong>{d.foundation}.</strong> {d.decision}</li>)}</ul></div>
    </section>
  );
}

/* ------------------------------------------------------------- provenance */

export function ProvenanceTables() {
  return (
    <section style={{display: 'grid', gap: '1rem'}}>
      <p>For each foundation: what is an <Tag kind="official" /> published standard or verified source, what is a <Tag kind="local" /> local adaptation, and what is an <Tag kind="exception" /> intentional exception. They are listed separately and never merged.</p>
      <div className="pqv-scroll"><table data-testid="provenance-table">
        <thead><tr><th scope="col">Foundation</th><th scope="col">Official or verified</th><th scope="col">Local adaptation</th><th scope="col">Intentional exceptions</th></tr></thead>
        <tbody>{PROVENANCE.map(p => (
          <tr key={p.foundation} data-testid={`prov-${p.foundation}`}>
            <th scope="row">{p.foundation}</th>
            <td>{p.official.map(x => <div key={x}><Tag kind="official" /> {x}</div>)}</td>
            <td>{p.local.map(x => <div key={x}><Tag kind="local" /> {x}</div>)}</td>
            <td>{p.exceptions.map(x => <div key={x}><Tag kind="exception" /> {x}</div>)}</td>
          </tr>))}</tbody>
      </table></div>
    </section>
  );
}

/* ----------------------------------------------------- token verification */

/** Every custom property the real injectors can produce, resolved at runtime (not guessed from text). */
export function injectedNames(): Set<string> {
  const s = new Set<string>();
  for (const m of MODES) {
    for (const o of ['A', 'B'] as const) Object.keys(modeVars(m, o)).forEach(k => s.add(k));
    for (let d = 1; d <= 4; d++) Object.keys(depthVars(m, d)).forEach(k => s.add(k));
    for (const f of ['carbon', 'border-first'] as const) Object.keys(shadowVars(m, f)).forEach(k => s.add(k));
  }
  for (const c of CLASSES) for (const u of ['px', 'rem'] as const) Object.keys(spacingVars(c, u)).forEach(k => s.add(k));
  for (const o of ['M', 'C'] as const) Object.keys(radiusVars(o)).forEach(k => s.add(k));
  return s;
}
/** A template definition such as `--pqt-${group}-${step}-size` becomes a pattern; names it matches are listed, not silently accepted. */
const templateRegex = (t: string) => new RegExp(`^${t.replace(/[.*+?^$()|[\]\\]/g, m => (m === '$' ? '\\$' : `\\${m}`)).replace(/\\\$\{[^}]*\}/g, '[a-z0-9-]+').replace(/\{|\}/g, '')}$`);
export function resolveReferences() {
  const defined = new Set<string>([...verification.cssDefined, ...verification.tsLiteral, ...injectedNames()]);
  // Colors, Spacing, Shape and Depth are resolved exactly by their injectors above, so their (very broad) templates are not used as a loophole.
  const patterns = verification.templates.filter(t => !/^--pq[cxrs]-/.test(t)).map(t => ({t, re: templateRegex(t)}));
  const viaTemplate = verification.references.filter(r => !defined.has(r.name) && patterns.some(p => p.re.test(r.name)));
  const withFallback = verification.references.filter(r => !defined.has(r.name) && !viaTemplate.includes(r) && r.fallback);
  const unresolved = verification.references.filter(r => !defined.has(r.name) && !viaTemplate.includes(r) && !r.fallback);
  return {defined, unresolved, viaTemplate, withFallback};
}
const folderOf = (f: string) => f.replace(/^stories\/(foundations\/)?/, '').split('/')[0];
export const PREFIX_OWNER: Record<string, string> = {pqc: 'Colors', pqs: 'Surfaces & Depth', pqx: 'Spacing', pqt: 'Typography', pqr: 'Shape', pqm: 'Motion', pqi: 'Icons', pqn: 'Illustrations', pqv: 'Overview / Review'};

export function TokenVerification() {
  const {unresolved, defined, viaTemplate, withFallback} = resolveReferences();
  const byPrefix = (() => {
    const m = new Map<string, Map<string, number>>();
    for (const r of verification.references) {
      const p = /^--(pq[a-z]+)-/.exec(r.name)![1];
      const row = m.get(p) ?? new Map<string, number>();
      for (const f of r.files) row.set(folderOf(f), (row.get(folderOf(f)) ?? 0) + 1);
      m.set(p, row);
    }
    return m;
  })();
  const committed = (() => committedSpecimens().map(x => ({x, px: committedPx(x), m: shapeFor(x.comp, 'M')})).map(r => ({...r, same: (r.m.css === '9999px' ? Infinity : Number.parseFloat(r.m.css)) === r.px && !r.m.css.includes(' ')})))();
  const differs = committed.filter(r => !r.same);
  return (
    <section style={{display: 'grid', gap: '1.5rem'}}>
      <div className="pqv-box" data-testid="verify-summary">
        <p><strong>{verification.filesScanned} source files</strong> scanned on {verification.generatedOn} (CSS, TS and TSX under {verification.scope.join(', ')}; excluding stories/review, test files, generators and JSON data). <strong>{verification.hex.length} hex color literals.</strong> <strong>{verification.references.length} distinct custom properties referenced</strong>, {defined.size} names available (static declarations plus the real var injectors of Colors, Surfaces &amp; Depth, Spacing and Shape, resolved at runtime). <strong data-testid="unresolved-count">{unresolved.length} unresolved</strong>. {verification.dynamic.length} references are built from template strings and are checked by the rendered specimens, not by name.</p>
      </div>
      <div>
        <h2>One prefix per foundation, and who uses it</h2>
        <div className="pqv-scroll"><table data-testid="prefix-table">
          <thead><tr><th scope="col">Prefix</th><th scope="col">Owner</th><th scope="col">Names in source</th><th scope="col">Referenced from</th></tr></thead>
          <tbody>{Object.entries(verification.prefixes).map(([p, n]) => (
            <tr key={p} data-testid={`prefix-${p}`}><td><code>--{p}-*</code></td><td>{PREFIX_OWNER[p] ?? 'Unassigned'}</td><td>{n}</td><td>{[...(byPrefix.get(p) ?? [])].map(([f, c]) => `${f} (${c})`).join(', ') || '—'}</td></tr>))}</tbody>
        </table></div>
        <p className="pqv-muted">Colors (<code>--pqc</code>) are consumed by every other foundation; that shared use is the point of the system. Each other prefix is defined by its own foundation.</p>
      </div>
      <div>
        <h2>Names defined from templates or with fallbacks</h2>
        <p data-testid="indirect-note">{viaTemplate.length} referenced names are defined from a template string (matched by pattern, listed below) and {withFallback.length} are never declared but every use carries a fallback value, so they are optional by design.</p>
        <div className="pqv-scroll"><table data-testid="indirect-table"><thead><tr><th scope="col">Name</th><th scope="col">How it resolves</th></tr></thead><tbody>
          {viaTemplate.map(r => <tr key={r.name}><td><code>{r.name}</code></td><td>Template definition</td></tr>)}
          {withFallback.map(r => <tr key={r.name}><td><code>{r.name}</code></td><td>Optional: every use has a fallback</td></tr>)}
        </tbody></table></div>
        <h2>Unresolved references</h2>
        {unresolved.length === 0 ? <p data-testid="unresolved-none"><Tag kind="measured" /> Every referenced custom property is declared statically or produced by a real injector.</p> : (
          <div className="pqv-scroll"><table data-testid="unresolved-table"><thead><tr><th scope="col">Name</th><th scope="col">Referenced in</th></tr></thead><tbody>{unresolved.map(r => <tr key={r.name}><td><code>{r.name}</code></td><td>{r.files.join(', ')}</td></tr>)}</tbody></table></div>)}
      </div>
      <div>
        <h2>Light, dark and themes</h2>
        <ul data-testid="mode-checks">
          <li><Tag kind="measured" /> Colors, depth and shadow tokens are produced per mode; shape, spacing and motion tokens are mode-independent. The Foundations Overview asserts this on rendered specimens in Carbon White and Gray 100.</li>
          <li><Tag kind="measured" /> Island, Arcade and Neon palettes are read live from production CSS and are independent of the global mode (Colors · Independent Themes).</li>
          <li><Tag kind="exception" /> Existing creative themes keep their own colors, shapes and type; no foundation token overrides them.</li>
        </ul>
      </div>
      <div>
        <h2>Committed specimens that disagree with the decided shapes</h2>
        <p>Option M is adopted. These specimens were committed earlier (read live from their CSS); {differs.length} of {committed.length} draw a different corner from Option M. They are specimens, not production, and are not edited by this work.</p>
        <div className="pqv-scroll"><table data-testid="specimen-diffs">
          <thead><tr><th scope="col">Section</th><th scope="col">Selector</th><th scope="col">Role</th><th scope="col">Draws</th><th scope="col">Option M</th></tr></thead>
          <tbody>{differs.map(r => <tr key={r.x.file + r.x.selector}><td>{r.x.section}</td><td><code>{r.x.selector}</code></td><td>{r.x.comp}</td><td>{r.x.css}</td><td>{r.m.label}</td></tr>)}</tbody>
        </table></div>
      </div>
    </section>
  );
}
export const DecisionsPage = () => <ReviewPage title="Open decisions and visual comparisons"><OpenDecisions /></ReviewPage>;
export const unresolvedCount = () => resolveReferences().unresolved.length;
export {OPEN, DECIDED, PROVENANCE};

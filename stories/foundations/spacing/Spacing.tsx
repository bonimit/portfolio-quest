import {useEffect, useMemo, useState, type CSSProperties, type ReactNode} from 'react';
import '../colors.css';
import '../carbon/carbon.css';
import './spacing.css';
import {modeVars} from '../carbon/carbon-model';
import {
  BASIS_LABEL, BREAKPOINTS, CLASSES, CLASS_LABEL, COMPONENT, FRAME_WIDTHS, GRID_COLUMNS, M3, PRIMITIVES, SEMANTIC, TOKENS_CROSSWALK, UNIT_OPTIONS,
  classOf, dpFor, duplicates, fmt, measureValue, nearest, runCensus, spacingVars, toPx,
  type Basis, type Census, type Unit, type WindowClass,
} from './spacing-model';
import {readDecl} from '../color-source';

const vars = (v: Record<string, string>) => v as CSSProperties;

export const BasisTag = ({basis}: {basis: Basis}) => <span className="pqx-tag" data-basis={basis}>{BASIS_LABEL[basis]}</span>;

export function SpacingBanner() {
  return (
    <div className="fx-banner" role="note">
      <strong>Proposal for review — nothing here is implemented or approved.</strong>
      Material 3 spacing is the reference; every value below is labeled <em>Official M3 system token</em>, <em>Official M3 layout guidance</em>,{' '}
      <em>Material Web component value</em> or <em>Local adaptation</em>. Material states its spacing tokens are published for Jetpack Compose (Web: “Unavailable”),
      so 1dp = 1px, rem output and every semantic name are local. Retrieved {M3.provenance.retrievedOn} from m3.material.io and <code>{M3.provenance.package}</code>.
      No production CSS, color or typography token, protected file or S0 baseline is changed.
    </div>
  );
}

export function useCensus(): Census | null {
  const [c, setC] = useState<Census | null>(null);
  useEffect(() => { let live = true; runCensus().then(x => live && setC(x)); return () => { live = false; }; }, []);
  return c;
}

export function UnitSwitcher({value, onChange}: {value: Unit; onChange: (u: Unit) => void}) {
  return (
    <div className="fx-switcher"><fieldset><legend>Output unit (named option)</legend>
      {(['px', 'rem'] as Unit[]).map(u => <label key={u}><input type="radio" name="pqx-unit" checked={value === u} onChange={() => onChange(u)} />{UNIT_OPTIONS[u].name}</label>)}
    </fieldset></div>
  );
}
export function useUnit(initial: Unit) {
  const [v, setV] = useState(initial); const [seen, setSeen] = useState(initial);
  if (seen !== initial) { setSeen(initial); setV(initial); }
  return [v, setV] as const;
}

/** Light-mode neutral surface carrying the spacing variables for one window class. */
export function Surface({cls, unit, children, width, testId}: {cls: WindowClass; unit: Unit; children: ReactNode; width?: number; testId?: string}) {
  const style = useMemo(() => vars({...modeVars('light', 'A'), ...spacingVars(cls, unit), ...(width ? {'--w': `${width}px`} : {})}), [cls, unit, width]);
  return <div className={`pqx-surface${width ? ' pqx-frame' : ''}`} style={style} data-wc={cls} data-testid={testId}>{children}</div>;
}

/* ----------------------------------------------------------------- scale */

export function ScaleBars({unit}: {unit: Unit}) {
  const style = vars(spacingVars('compact', unit));
  return (
    <div className="pqx-surface pqx-scale" style={style} data-testid="scale">
      {PRIMITIVES.map(p => (
        <div className="pqx-scale-row" key={p.name} data-adopted={p.adopted} data-testid={`scale-${p.name}`}>
          <code>{p.name}</code>
          <span>{p.dp}px</span>
          <span className="pqx-bar" style={vars({'--v': `var(--pqx-${p.name})`})} role="img" aria-label={`${p.dp} pixels`} />
          <span className="pqx-muted"><BasisTag basis="official-system" />{p.adopted ? 'adopted' : 'available'} · {p.usage}</span>
        </div>
      ))}
    </div>
  );
}

export function ScaleTable({unit}: {unit: Unit}) {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Primitive spacing tokens">
      <table data-testid="scale-table">
        <caption>Primitive tokens: official Material steps (name = md.sys.measurement.&lt;token&gt;); local web output shown for {unit}</caption>
        <thead><tr><th scope="col">Local name</th><th scope="col">Official token</th><th scope="col">dp → px</th><th scope="col">{unit} output</th><th scope="col">Status</th></tr></thead>
        <tbody>{PRIMITIVES.map(p => <tr key={p.name}><th scope="row"><code>{p.name}</code></th><td><code>{p.official}</code></td><td>{p.dp}</td><td>{fmt(p.dp, unit)}</td><td>{p.adopted ? 'Adopted (in the brief’s scale)' : 'Official, available, not adopted'}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------- padding */

export function PaddingSpecimens({unit}: {unit: Unit}) {
  return (
    <Surface cls="medium" unit={unit}>
      <div className="pqx-stack" data-testid="padding-specimens" style={{padding: '1rem'}}>
        <h3>Button <BasisTag basis="material-web" /></h3>
        <p className="pqx-muted">padding-inline <code>button-padding-x</code> · height <code>button-height</code> · target ≥ <code>spacing-touch-target</code> (hit area dashed)</p>
        <div className="pqx-row">
          <span className="pqx-hit"><button type="button" className="pqx-btn pqx-viz" data-testid="pad-button">Button</button></span>
          <span className="pqx-hit"><button type="button" className="pqx-btn pqx-btn--secondary pqx-viz">Secondary</button></span>
          <span className="pqx-hit"><button type="button" className="pqx-btn pqx-btn--icon pqx-viz" data-testid="pad-button-icon"><span aria-hidden="true">＋</span>With icon</button></span>
        </div>
        <h3>Chip <BasisTag basis="material-web" /></h3>
        <p className="pqx-muted">padding-inline <code>chip-padding-x</code> · height <code>chip-height</code>. The chip is shorter than the target, so the hit area (dashed) is larger than the chip: <strong>review item</strong>.</p>
        <div className="pqx-row">
          <span className="pqx-hit" data-testid="chip-hit"><button type="button" className="pqx-chip pqx-viz" aria-pressed="false" data-testid="pad-chip">Design</button></span>
          <span className="pqx-hit"><button type="button" className="pqx-chip pqx-viz" aria-pressed="true">Selected</button></span>
        </div>
        <h3>Input <BasisTag basis="material-web" /></h3>
        <p className="pqx-muted">padding <code>input-padding-y</code> / <code>input-padding-x</code> · label gap <code>spacing-field-label</code></p>
        <div className="pqx-field" style={{maxWidth: '22rem'}}><label htmlFor="pqx-in">Label</label><input id="pqx-in" className="pqx-input pqx-viz" placeholder="Placeholder" data-testid="pad-input" /></div>
        <h3>Card / panel <BasisTag basis="local" /></h3>
        <div className="pqx-card pqx-viz" style={{maxWidth: '22rem'}} data-testid="pad-card"><strong>Card</strong><p className="pqx-muted">padding <code>card-padding</code>, gap <code>card-gap</code>.</p></div>
        <h3>Dialog <BasisTag basis="material-web" /></h3>
        <div className="pqx-dialog pqx-viz" style={{maxWidth: '26rem'}} data-testid="pad-dialog"><strong>Dialog</strong><p>Padding <code>dialog-padding</code>; actions add the top padding <code>space-200</code>.</p>
          <div className="pqx-dialog-actions"><span className="pqx-hit"><button type="button" className="pqx-btn pqx-btn--secondary">Cancel</button></span><span className="pqx-hit"><button type="button" className="pqx-btn">OK</button></span></div></div>
      </div>
    </Surface>
  );
}

/* ------------------------------------------------------------------- gaps */

export function GapSpecimens({unit}: {unit: Unit}) {
  return (
    <Surface cls="medium" unit={unit}>
      <div className="pqx-stack" style={{padding: '1rem'}} data-testid="gap-specimens">
        <h3>Icon-to-label <code>spacing-component-gap</code> <BasisTag basis="material-web" /></h3>
        <div className="pqx-row pqx-gapviz" data-testid="gap-icon"><span aria-hidden="true">★</span><span>Label</span></div>
        <h3>Chip row (horizontal) <code>spacing-component-gap</code></h3>
        <div className="pqx-row pqx-gapviz" data-testid="gap-chips">{['Design', 'Research', 'Games'].map(c => <span className="pqx-hit" key={c}><button type="button" className="pqx-chip" aria-pressed="false">{c}</button></span>)}</div>
        <h3>Label to input <code>spacing-field-label</code> and field group <code>spacing-field-group</code> <BasisTag basis="local" /></h3>
        <form className="pqx-form" style={{maxWidth: '22rem'}} data-testid="gap-form" onSubmit={e => e.preventDefault()}>
          <div className="pqx-field"><label htmlFor="g1">Name</label><input id="g1" className="pqx-input" placeholder="Your name" /></div>
          <div className="pqx-field"><label htmlFor="g2">Email</label><input id="g2" className="pqx-input" placeholder="you@example.com" /></div>
        </form>
        <h3>Navigation <code>spacing-nav-gap</code> · item padding <code>spacing-nav-item-y</code></h3>
        <nav className="pqx-nav" aria-label="Gap demo" data-testid="gap-nav"><a href="#a">Work</a><a href="#b">Concepts</a><a href="#c">Arcade</a></nav>
        <h3>Stacked content <code>spacing-stack</code> (vertical)</h3>
        <div className="pqx-card pqx-gapviz" style={{maxWidth: '22rem'}}><p>First block</p><p>Second block</p><p>Third block</p></div>
        <h3>Card grid <code>spacing-grid-gap</code> (horizontal and vertical)</h3>
        <div className="pqx-grid pqx-gapviz" style={vars({'--cols': '3'})} data-testid="gap-grid">{[1, 2, 3, 4, 5, 6].map(n => <div className="pqx-card" key={n}>Card {n}</div>)}</div>
      </div>
    </Surface>
  );
}

/* ------------------------------------------------------------ page layout */

export function PageContent({cls}: {cls: WindowClass}) {
  return (
    <div className="pqx-page" data-testid="page">
      <nav className="pqx-nav" aria-label={`${CLASS_LABEL[cls]} navigation`}><a href="#w">Work</a><a href="#c">Concepts</a><a href="#a">Arcade</a><a href="#x">About</a></nav>
      <section className="pqx-section" aria-label="Cards"><h2>Section ({CLASS_LABEL[cls]})</h2>
        <div className="pqx-grid" style={vars({'--cols': String(GRID_COLUMNS[cls])})} data-testid="grid">{[1, 2, 3, 4].map(n => <div className="pqx-card" key={n}><strong>Card {n}</strong><p className="pqx-muted">Content padding and gaps follow the tokens.</p></div>)}</div></section>
      <section className="pqx-section" aria-label="Form"><h2>Form</h2>
        <form className="pqx-form" onSubmit={e => e.preventDefault()}>
          <div className="pqx-field"><label htmlFor={`f-${cls}-1`}>Name</label><input id={`f-${cls}-1`} className="pqx-input" placeholder="Your name" /></div>
          <div className="pqx-field"><label htmlFor={`f-${cls}-2`}>Message</label><input id={`f-${cls}-2`} className="pqx-input" placeholder="Message" /></div>
          <span className="pqx-hit"><button type="button" className="pqx-btn">Send</button></span>
        </form></section>
      <section className="pqx-section" aria-label="Dialog"><div className="pqx-dialog"><strong>Dialog</strong><p>A dialog keeps its padding at every class.</p>
        <div className="pqx-dialog-actions"><span className="pqx-hit"><button type="button" className="pqx-btn pqx-btn--secondary">Cancel</button></span><span className="pqx-hit"><button type="button" className="pqx-btn">OK</button></span></div></div></section>
    </div>
  );
}

export function ResponsiveFrames({unit, widths = FRAME_WIDTHS}: {unit: Unit; widths?: number[]}) {
  return (
    <div className="pqx-frames" tabIndex={0} role="region" aria-label="Responsive frames" data-testid="frames">
      {widths.map(w => {
        const cls = classOf(w);
        return (
          <div key={w}>
            <p className="fx-muted"><strong>{w}px</strong> · {CLASS_LABEL[cls]}{w === 320 ? ' · WCAG reflow width' : ''}</p>
            <Surface cls={cls} unit={unit} width={w} testId={`frame-${w}`}><PageContent cls={cls} /></Surface>
          </div>
        );
      })}
    </div>
  );
}

export function ResponsiveTable() {
  const rows: {label: string; render: (c: WindowClass) => string}[] = [
    {label: 'Page margin · spacing-page', render: c => `${dpFor('spacing-page', c)}`},
    {label: 'Pane gutter · spacing-gutter', render: c => `${dpFor('spacing-gutter', c)}`},
    {label: 'Grid gap · spacing-grid-gap', render: c => `${dpFor('spacing-grid-gap', c)}`},
    {label: 'Section spacing · spacing-section', render: c => `${dpFor('spacing-section', c)}`},
    {label: 'Content padding · spacing-content', render: c => `${dpFor('spacing-content', c)}`},
    {label: 'Grid columns (local)', render: c => `${GRID_COLUMNS[c]}`},
    {label: 'Nav / dialog / form tokens', render: () => 'unchanged — context, not breakpoint'},
  ];
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Responsive spacing table">
      <table data-testid="responsive-table">
        <caption>Responsive spacing by window class (dp). Official ranges and margins from m3.material.io; the rest are local proposals.</caption>
        <thead><tr><th scope="col">Token</th>{CLASSES.map(c => <th scope="col" key={c}>{CLASS_LABEL[c]}<br /><span className="fx-muted">{BREAKPOINTS[c].min}{BREAKPOINTS[c].max === null ? '+' : `–${BREAKPOINTS[c].max}`}dp</span></th>)}</tr></thead>
        <tbody>
          {rows.map(r => <tr key={r.label}><th scope="row">{r.label}</th>{CLASSES.map(c => <td key={c}>{r.render(c)}</td>)}</tr>)}
          <tr><th scope="row">Fixed pane (official)</th>{CLASSES.map(c => <td key={c}>{(M3.layout as Record<string, {fixedPane?: number}>)[c].fixedPane ?? '—'}</td>)}</tr>
          <tr><th scope="row">Recommended panes (official)</th>{CLASSES.map(c => <td key={c}>{(M3.panes as Record<string, string>)[c]}</td>)}</tr>
        </tbody>
      </table>
      <p className="fx-muted">Not every component changes per class: only page margin, gutter, grid gap, section and content padding adapt. Component padding, nav and form spacing stay constant (Material applies adaptive spacing by context). {M3.quotes.lineLength}</p>
    </div>
  );
}

/* ------------------------------------------------------- existing vs proposed */

const dpText = (parts: ReturnType<typeof measureValue>) => parts.map(p => (p.px === null ? `${p.part} (dynamic)` : `${Math.round(p.px * 100) / 100}`)).join(' / ');
const onScale = (px: number | null) => (px === null ? '—' : PRIMITIVES.some(p => p.dp === Math.round(px * 100) / 100) ? 'on scale' : `off scale → ${nearest(px).name} (${nearest(px).dp})`);

export function Crosswalk() {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Existing token crosswalk">
      <table data-testid="crosswalk">
        <caption>Existing tokens (tokens.css, read live) mapped to the nearest official step. Index names like <code>--temp-space-4</code> (= 16px) are NOT M3 names (<code>space-400</code> = 32px) and must not be reused.</caption>
        <thead><tr><th scope="col">Existing token</th><th scope="col">Value</th><th scope="col">px</th><th scope="col">Nearest official</th><th scope="col">Delta</th></tr></thead>
        <tbody>{TOKENS_CROSSWALK.map(t => {
          const d = readDecl('tokens', ':root', t);
          const r = d ? toPx(d.value) : {px: null as number | null, dynamic: 'not found'};
          const spacingLike = /space|gutter/.test(t);
          const n = r.px !== null && spacingLike ? nearest(r.px) : null;
          const touch = t === '--temp-touch-target' && r.px !== null;
          return <tr key={t}><th scope="row"><code>{t}</code></th><td><code>{d?.value ?? 'not found'}</code></td><td>{r.px === null ? 'dynamic' : Math.round(r.px * 100) / 100}</td>
            <td>{n ? <code>{n.name} ({n.dp})</code> : touch ? <>Material Web touch target ({M3.touchTarget})</> : <span className="fx-muted">not a spacing step (width / ring)</span>}</td>
            <td>{n && r.px !== null ? (r.px === n.dp ? 'exact' : `${(r.px - n.dp > 0 ? '+' : '') + Math.round((r.px - n.dp) * 100) / 100}`) : touch && r.px !== null ? `${Math.round((r.px - M3.touchTarget) * 100) / 100}` : '—'}</td></tr>;
        })}</tbody>
      </table>
      <p className="fx-muted" data-testid="gutter-note">Observation (not merged): <code>--temp-page-gutter</code> and <code>--landing-gutter</code> both describe a page gutter with different values; the proposal replaces both with the single <code>spacing-page</code>.</p>
    </div>
  );
}

export function CuratedTable({census}: {census: Census | null}) {
  if (!census) return <p>Scanning source…</p>;
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Existing versus proposed components">
      <table data-testid="curated">
        <caption>Existing component spacing (read live from CSS, px) vs proposed Material-based tokens</caption>
        <thead><tr><th scope="col">Component</th><th scope="col">Existing</th><th scope="col">Value (px)</th><th scope="col">On scale?</th><th scope="col">Proposed</th><th scope="col">Status</th></tr></thead>
        <tbody>{census.curated.map(({item, value, line, measured}) => (
          <tr key={item.id} data-found={value !== null}>
            <th scope="row">{item.group} · {item.label}</th>
            <td><code>{item.file}{line ? `:${line}` : ''}</code><br /><code>{item.selector} {'{'} {item.prop}: {value ?? 'not found'} {'}'}</code></td>
            <td>{dpText(measured)}</td><td>{measured.map((m, i) => <div key={i}>{onScale(m.px)}</div>)}</td><td>{item.proposed}</td>
            <td>{item.exception ? <><span className="fx-tag">Proposed exception</span>{item.exception}</> : <span className="fx-tag">Requires review</span>}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function CensusView({census}: {census: Census | null}) {
  if (!census) return <p>Scanning source…</p>;
  const t = census.totals; const total = t.official + t.offScale + t.dynamic;
  return (
    <div data-testid="census">
      <p>Census of every padding, margin and gap length in {census.files.length} CSS files: <strong>{total}</strong> values — <strong data-testid="census-official">{t.official}</strong> on the official scale, <strong>{t.offScale}</strong> off scale, <strong>{t.dynamic}</strong> dynamic (clamp, calc, %, vw, em, unresolved var — reported separately, not graded). Zeros and <code>auto</code> are skipped.</p>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Spacing census by file">
        <table><caption>On-scale, off-scale and dynamic values per file (bar: solid = on scale, hatched = off scale, grey = dynamic)</caption>
          <thead><tr><th scope="col">File</th><th scope="col">Counts</th><th scope="col">Chart</th><th scope="col">Exception class (proposed)</th></tr></thead>
          <tbody>{census.files.map(f => { const sum = f.official + f.offScale + f.dynamic; return (
            <tr key={f.file}><th scope="row"><code>{f.file}</code></th><td>{f.official} / {f.offScale} / {f.dynamic}</td>
              <td><span className="pqx-chart" aria-hidden="true"><i style={{width: `${(f.official / sum) * 100}%`}} /><i style={{width: `${(f.offScale / sum) * 100}%`}} /><i style={{width: `${(f.dynamic / sum) * 100}%`}} /></span></td>
              <td>{f.exception ?? 'Requires review'}</td></tr>); })}</tbody></table>
      </div>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Most common off-scale values">
        <table><caption>Most common off-scale lengths and the nearest official step</caption>
          <thead><tr><th scope="col">Existing px</th><th scope="col">Uses</th><th scope="col">Nearest official</th></tr></thead>
          <tbody>{census.off.slice(0, 14).map(o => <tr key={o.px}><th scope="row">{o.px}</th><td>{o.count}</td><td><code>{o.nearest.name} ({o.nearest.dp})</code></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

export function BreakpointCensus({census}: {census: Census | null}) {
  if (!census) return <p>Scanning source…</p>;
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Existing media-query widths">
      <table data-testid="bp-census">
        <caption>Existing <code>@media</code> width conditions (rem × 16) mapped to the five Material classes. Material breaks at 600 / 840 / 1200 / 1600.</caption>
        <thead><tr><th scope="col">Width (px)</th><th scope="col">Uses</th><th scope="col">Falls in</th><th scope="col">On a Material boundary?</th></tr></thead>
        <tbody>{census.breakpoints.map(b => <tr key={b.px}><th scope="row">{b.px}</th><td>{b.count}</td><td>{CLASS_LABEL[b.cls]}</td><td>{b.boundary ? 'yes' : 'no'}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function ExceptionsTable({census}: {census: Census | null}) {
  const classes = ['Adventure / Island / Arcade', 'Game world / scenes', 'D0–D6 case-study templates', 'Hero / editorial / entrance composition'];
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Intentional exceptions">
      <table data-testid="exceptions-spacing">
        <caption>Proposed intentional exceptions (derived from your preserve list by file path). All need approval; nothing is changed.</caption>
        <thead><tr><th scope="col">Exception class</th><th scope="col">Files with spacing declarations</th><th scope="col">Off-scale values</th></tr></thead>
        <tbody>
          {classes.map(c => { const fs = census?.files.filter(f => f.exception === c) ?? []; return <tr key={c}><th scope="row">{c}</th><td>{fs.length ? fs.map(f => <code key={f.file}>{f.file} </code>) : census ? 'none found' : '…'}</td><td>{fs.reduce((n, f) => n + f.offScale, 0)}</td></tr>; })}
          <tr><th scope="row">Everything else</th><td>Requires review</td><td>{census ? census.files.filter(f => !f.exception).reduce((n, f) => n + f.offScale, 0) : '…'}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------------------------------------------- tokens */

export function TokenTables() {
  const dup = duplicates();
  const groups = [...new Set(SEMANTIC.map(s => s.group))];
  return (
    <div data-testid="token-tables">
      <p>Duplicate-purpose check: <strong data-testid="dup-count">{dup.length}</strong> {dup.length ? dup.join('; ') : '— no two tokens share a purpose'}.</p>
      <h3>Semantic spacing (values per window class, dp)</h3>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Semantic spacing tokens">
        <table><thead><tr><th scope="col">Token</th><th scope="col">Role</th><th scope="col">Basis</th>{CLASSES.map(c => <th key={c} scope="col">{CLASS_LABEL[c]}</th>)}</tr></thead>
          <tbody>{groups.flatMap(g => SEMANTIC.filter(s => s.group === g).map(s => (
            <tr key={s.name}><th scope="row"><code>{s.name}</code><br /><span className="fx-muted">{g}</span></th><td>{s.role}{s.note && <><br /><span className="fx-muted">{s.note}</span></>}</td><td><BasisTag basis={s.basis} /></td>
              {CLASSES.map(c => <td key={c}><code>{s.values[c]}</code> {dpFor(s.name, c)}</td>)}</tr>)))}</tbody></table>
      </div>
      <h3>Component spacing</h3>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Component spacing tokens">
        <table><thead><tr><th scope="col">Token</th><th scope="col">Component · role</th><th scope="col">Maps to</th><th scope="col">Basis · source</th></tr></thead>
          <tbody>{COMPONENT.map(c => <tr key={c.name}><th scope="row"><code>{c.name}</code></th><td>{c.component} · {c.role}</td><td><code>{c.primitive}</code></td><td><BasisTag basis={c.basis} />{c.source && <><br /><span className="fx-muted">{c.source}</span></>}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

export function SpacingJson() {
  const json = useMemo(() => JSON.stringify({
    note: 'PREVIEW of a possible future variables export. Not synced to Figma; no components created.',
    collections: [
      {name: 'Primitive / Space', modes: ['Default'], variables: Object.fromEntries(PRIMITIVES.filter(p => p.adopted).map(p => [p.name, p.dp]))},
      {name: 'Semantic / Spacing', modes: CLASSES.map(c => CLASS_LABEL[c]), variables: Object.fromEntries(SEMANTIC.map(s => [s.name, Object.fromEntries(CLASSES.map(c => [CLASS_LABEL[c], s.values[c]]))]))},
      {name: 'Component / Spacing', modes: ['Default'], variables: Object.fromEntries(COMPONENT.map(c => [c.name, c.primitive]))},
    ],
  }, null, 2), []);
  return <details><summary>Preview: Figma-style variables export (documentation only; not synced)</summary><pre data-testid="spacing-json" style={{overflow: 'auto', maxHeight: '24rem'}}>{json}</pre></details>;
}

export function ValidationTable() {
  const rows: [string, string, string][] = [
    ['320px reflow (WCAG 2.2 SC 1.4.10, AA): no horizontal scroll at 320 CSS px (= 1280px at 400% zoom)', 'Play test: 320px frame scrollWidth ≤ clientWidth', 'Verified automatically'],
    ['200% text (SC 1.4.4, AA): no overflow or clipping with root font-size 200%, in both unit options', 'Play test (restores the font size afterwards)', 'Verified automatically'],
    ['Target size: all specimen controls ≥ 24px (SC 2.5.8, AA) and hit areas ≥ 48px (Material Web)', 'Play test of computed sizes', 'Verified automatically; chip body is 32px, hit area 48px (review item)'],
    ['Target size 44px (SC 2.5.5, AAA) vs Material 48px vs existing mix of 44 and 48', 'Documented', 'Open decision'],
    ['Focus ring: offset + width (6px) fits inside the page margin (min 16px) where ancestors could clip', 'Play test', 'Verified automatically'],
    ['Text spacing (SC 1.4.12): line-height 1.5, letter 0.12em, word 0.16em, paragraph 2em without loss', 'Not run', 'Not run (manual)'],
    ['Layout shift when spacing changes at a breakpoint', 'Not run', 'Not run'],
    ['Screen reader, real devices, true browser zoom', 'Not run', 'Not run'],
  ];
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Validation">
      <table data-testid="validation"><caption>Validation matrix (WCAG 2.2 thresholds verified against w3.org Understanding pages)</caption>
        <thead><tr><th scope="col">Check</th><th scope="col">Method</th><th scope="col">Status</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>
    </div>
  );
}

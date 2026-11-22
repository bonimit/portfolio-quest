import {useEffect, useId, useMemo, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import './shape.css';
import {Layer, ModeFrame} from '../carbon/CarbonColors';
import {MODES, MODE_LABEL, type Mode} from '../carbon/carbon-model';
import {shadowVars} from '../depth/depth-model';
import {CopyButton} from '../icons/Icons';
import {
  ASYMMETRIC, DECISIONS, EXISTING, FRAMES, FULLSCREEN, M3, OPTIONS, PRIMITIVES, classRange, committedPx, committedSpecimens, decision, fmtNearest, nearestStep, radiusVars, resolve, shapeFor,
  type Existing, type Option,
} from './shape-model';
import {find, productionRadiusTokens, runRadiusCensus, summary, type RadiusUse} from './shape-census';
import {parseRaw} from './shape-census';

/* ---------------------------------------------------------------- shared */

export type Kind = 'official' | 'package' | 'local' | 'current' | 'preserved' | 'issue';
const LABEL: Record<Kind, string> = {official: 'Official (page + package)', package: 'Package only', local: 'Local proposal', current: 'Current (live CSS)', preserved: 'Preserved, not adopted', issue: 'Review issue'};
export const Tag = ({kind, children}: {kind: Kind; children?: ReactNode}) => <span className="pqr-tag" data-kind={kind}>{children ?? LABEL[kind]}</span>;
export const Page = ({title, children, testId = 'shape-page'}: {title: string; children: ReactNode; testId?: string}) => <div className="pqr-page" data-testid={testId}><h1 style={{fontSize: '1.5rem'}}>{title}</h1>{children}</div>;

export function Banner() {
  return (
    <div className="pqr-box" role="note">
      <p><Tag kind="official" /> The nine numeric corner steps (0 to 48dp), cross-checked between <code>@material/web {M3.provenance.packages['@material/web']}</code> and the rendered m3.material.io page. <Tag kind="package" /> <code>full</code> (9999px), the asymmetric tokens and every component’s own shape.
        {' '}<Tag kind="local" /> Which component uses which step, the two named options, all token names and every responsive statement. <Tag kind="current" /> Read live from production CSS. <Tag kind="preserved" /> Existing cards, panels, navigation and creative themes.</p>
      <p className="pqr-muted">Proposal only. No production UI, color, typography or spacing changes, and no one-radius-fits-all rule: buttons are pills, but each other component takes its own step.</p>
    </div>
  );
}

export function useOption(initial: Option) {
  const [opt, setOpt] = useState<Option>(initial);
  return [opt, setOpt] as const;
}
export function OptionSwitcher({opt, onChange}: {opt: Option; onChange: (o: Option) => void}) {
  const name = useId();
  return (
    <fieldset className="pqr-box" data-testid="option-switcher">
      <legend>Standard controls <Tag kind="local" /></legend>
      <div className="pqr-row">{(['M', 'C'] as Option[]).map(o => <label key={o}><input type="radio" name={name} checked={opt === o} onChange={() => onChange(o)} /> {OPTIONS[o].name}</label>)}</div>
      <p className="pqr-muted">{OPTIONS[opt].summary}</p>
    </fieldset>
  );
}
export function Switched({children, initial = 'M'}: {children: (opt: Option) => ReactNode; initial?: Option}) {
  const [opt, setOpt] = useOption(initial);
  return <><OptionSwitcher opt={opt} onChange={setOpt} />{children(opt)}</>;
}

const cssPx = (v: number) => (v >= 999 ? '9999px' : `${v}px`);
export function Sample({css, w, h, label, outline, testId}: {css: string; w?: string; h?: string; label?: string; outline?: boolean; testId?: string}) {
  return <div className="pqr-sample" data-outline={outline ? 'true' : undefined} data-testid={testId} style={{'--pqr-r': css, ...(w ? {'--pqr-w': w} : {}), ...(h ? {'--pqr-h': h} : {})} as CSSProperties}>{label}</div>;
}

/* ----------------------------------------------------------------- scale */

export function ShapeScale() {
  const [h, setH] = useState(64);
  return (
    <section>
      <div className="pqr-row">
        <label>Example height <input type="range" min={32} max={160} step={8} value={h} onChange={e => setH(Number(e.target.value))} data-testid="scale-height" /> <span data-testid="scale-height-value">{h}px</span></label>
        <span className="pqr-muted">Fixed-px steps stay the same size as the box grows; <code>full</code> always rounds to half the shortest side.</span>
      </div>
      <div className="pqr-scroll"><table data-testid="scale-table">
        <thead><tr><th>Token</th><th>Local name</th><th>Value</th><th>rem</th><th>Example ({'{w}'} × {h}px)</th><th>Basis</th></tr></thead>
        <tbody>{PRIMITIVES.map(p => (
          <tr key={p.key} data-testid={`scale-${p.key}`}>
            <td><code>{p.token}</code></td><td><code>{p.local}</code></td>
            <td>{p.key === 'full' ? '9999px' : `${p.px}dp`}</td><td>{p.key === 'full' ? 'n/a' : `${p.px / 16}rem`}</td>
            <td><Sample css={cssPx(p.px)} w={`${Math.round(h * 1.5)}px`} h={`${h}px`} label={p.key === 'full' ? 'pill' : `${p.px}`} testId={`sample-${p.key}`} /></td>
            <td>{p.pageVerified ? <Tag kind="official" /> : <Tag kind="package" />}{p.note ? <><br /><span className="pqr-muted">{p.note}</span></> : null}</td>
          </tr>
        ))}</tbody>
      </table></div>
      <h2>Asymmetric corners <Tag kind="package" /></h2>
      <p className="pqr-muted">{M3.quotes.asymmetric} The page names these tokens without values; the values are from the package.</p>
      <div className="pqr-row" data-testid="asym-row">{ASYMMETRIC.map(a => (
        <div key={a.name} className="pqr-box"><Sample css={`${a.corners.tl}px ${a.corners.tr}px ${a.corners.br}px ${a.corners.bl}px`} w="6rem" h="4rem" testId={`asym-${a.name}`} /><p><code>{a.local}</code></p><p className="pqr-muted">{a.corners.tl} {a.corners.tr} {a.corners.br} {a.corners.bl} (tl tr br bl)</p></div>
      ))}</div>
      <h2>Official guidance</h2>
      <ul>
        <li>{M3.quotes.tenStyles} {M3.quotes.assigned}</li>
        <li>{M3.quotes.defaultRounded}. {M3.quotes.fullWas50}</li>
        <li><strong>{M3.quotes.customize}</strong> This is the official basis for preserving Portfolio Quest’s custom shapes.</li>
      </ul>
    </section>
  );
}

/* ------------------------------------------------------ component specimens */

export function ComponentSet({mode, opt, testId}: {mode: Mode; opt: Option; testId?: string}) {
  const vars = useMemo(() => ({...radiusVars(opt), ...shadowVars(mode, 'carbon')} as CSSProperties), [mode, opt]);
  const [chip, setChip] = useState(true);
  return (
    <div className="pqr-set" style={vars} data-testid={testId ?? `set-${mode}`}>
      <div><h3>Buttons (pill)</h3><div className="pqr-row">
        <button type="button" className="pqr-btnf" data-testid="shape-button" data-decision="button">Filled</button>
        <button type="button" className="pqr-btnf" data-v="outlined" data-decision="button">Outlined</button>
        <button type="button" className="pqr-btnf" data-v="tonal" data-decision="button">Tonal</button>
        <button type="button" className="pqr-btnf" data-v="text" data-decision="button">Text</button>
        <button type="button" className="pqr-iconbtn" aria-label="Add" data-testid="shape-icon-button" data-decision="icon-button">+</button>
        <button type="button" className="pqr-fab" aria-label="Create" data-testid="shape-fab" data-decision="fab">+</button>
      </div></div>
      <div><h3>Chips</h3><div className="pqr-row">
        <button type="button" className="pqr-chip" aria-pressed={chip} onClick={() => setChip(v => !v)} data-testid="shape-chip" data-decision="chip">Research</button>
        <button type="button" className="pqr-chip" aria-pressed="false" data-decision="chip">Product</button>
        <span className="pqr-seg" data-testid="shape-segmented" data-decision="segmented"><span aria-current="true">Grid</span><span>List</span></span>
        <span className="pqr-badge" data-testid="shape-badge" data-decision="badge">3</span>
      </div></div>
      <div><h3>Inputs</h3><div className="pqr-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))'}}>
        <input className="pqr-field" placeholder="Outlined" aria-label="Outlined field" data-testid="shape-input-outlined" data-decision="input-outlined" />
        <input className="pqr-field" data-kind="filled" placeholder="Filled" aria-label="Filled field" data-testid="shape-input-filled" data-decision="input-filled" />
        <input className="pqr-search" placeholder="Search" aria-label="Search bar" data-testid="shape-search-bar" data-decision="search-bar" />
      </div></div>
      <div><h3>Menu, tooltip, snackbar, checkbox, switch</h3><div className="pqr-row" style={{alignItems: 'start'}}>
        <div className="pqr-menu" role="menu" data-testid="shape-menu" data-decision="menu"><span role="menuitem">Selected work</span><span role="menuitem">Concept lab</span></div>
        <span className="pqr-tip" data-testid="shape-tooltip" data-decision="tooltip">Plain tooltip</span>
        <span className="pqr-snack" data-testid="shape-snackbar" data-decision="snackbar">Saved</span>
        <span className="pqr-check" data-testid="shape-checkbox" data-decision="checkbox" />
        <span className="pqr-switch" data-testid="shape-switch" data-decision="switch" />
      </div></div>
      <div><h3>Dialog and sheet</h3><div className="pqr-row" style={{alignItems: 'start'}}>
        <div className="pqr-dialog" role="dialog" aria-label="Example dialog" data-testid="shape-dialog" data-decision="dialog"><strong>Delete this project?</strong><span>This removes the draft.</span></div>
        <div className="pqr-sheet" data-testid="shape-sheet" data-decision="sheet"><strong>Bottom sheet</strong><span>Top corners only.</span></div>
      </div></div>
    </div>
  );
}

export function ComponentShapes({opt}: {opt: Option}) {
  const [mode, setMode] = useState<Mode>('light');
  return (
    <section>
      <div className="pqr-row"><label>Surface <select value={mode} onChange={e => setMode(e.target.value as Mode)} data-testid="comp-mode">{MODES.map(m => <option key={m} value={m}>{MODE_LABEL[m]}</option>)}</select></label></div>
      <ModeFrame mode={mode} title={`Component shapes · ${mode}`}><Layer hideMeta title="Standard controls"><ComponentSet mode={mode} opt={opt} /></Layer></ModeFrame>
      <DecisionTable opt={opt} />
    </section>
  );
}

export function DecisionTable({opt}: {opt: Option}) {
  return (
    <div className="pqr-scroll"><table data-testid="decision-table">
      <thead><tr><th>Component</th><th>Option M</th><th>Option C</th><th>Source</th><th>Note</th></tr></thead>
      <tbody>{DECISIONS.map(d => {
        const m = resolve(d.m), c = resolve(d.c);
        return (
          <tr key={d.id} data-testid={`decision-${d.id}`} data-active={opt}>
            <td>{d.label}</td><td>{m.label}<br /><span className="pqr-muted">{m.prim}</span></td><td>{c.label}<br /><span className="pqr-muted">{c.prim}</span></td>
            <td>{d.basis === 'official' ? <Tag kind="package">Package component token</Tag> : d.basis === 'package-literal' ? <Tag kind="package">Package literal</Tag> : <Tag kind="local" />}<br /><code>{d.official}</code></td><td>{d.note}</td>
          </tr>
        );
      })}</tbody>
    </table></div>
  );
}

/* ------------------------------------------------------------ census hooks */

export function useRadii(): {uses: RadiusUse[]; files: number} | null {
  const [c, setC] = useState<{uses: RadiusUse[]; files: number} | null>(null);
  useEffect(() => { let live = true; runRadiusCensus().then(x => live && setC(x)); return () => { live = false; }; }, []);
  return c;
}

/* ----------------------------------------------------- existing vs proposed */

type Row = {e: Existing; use: RadiusUse | null; label: string; px: number | null; kind: string; step: ReturnType<typeof nearestStep> | null};
export function rowsFor(uses: RadiusUse[]): Row[] {
  return EXISTING.map(e => {
    const use = find(uses, e.file, e.selector);
    if (!use) return {e, use, label: 'no radius declared (sharp corners)', px: 0, kind: 'none', step: null};
    const s = summary(use);
    return {e, use, label: s.label, px: s.kind === 'pill' ? Infinity : s.px, kind: s.kind, step: s.kind === 'px' && s.px !== null ? nearestStep(s.px) : null};
  });
}
const changeOf = (r: Row, o: Option): string => {
  if (r.e.comp === null) return 'Preserved';
  const p = shapeFor(r.e.comp, o);
  const want = p.css.includes(' ') ? null : p.css === '9999px' ? Infinity : Number.parseFloat(p.css);
  if (want === null || r.px === null) return 'Review';
  return want === r.px ? 'Unchanged' : 'Visible change';
};
export function ExistingVsProposed({opt}: {opt: Option}) {
  const c = useRadii();
  if (!c) return <p>Reading production CSS…</p>;
  const rows = rowsFor(c.uses);
  const committed = committedSpecimens();
  return (
    <section>
      <p className="pqr-muted" data-testid="evp-line">{rows.length} curated production selectors (evidence-backed). Anything not listed is “requires review”. Current values are read live from the cited file.</p>
      <div className="pqr-scroll"><table data-testid="evp-table">
        <thead><tr><th>Role</th><th>Element</th><th>Current</th><th>Nearest M3 step</th><th>Option M</th><th>Option C</th><th>Change ({opt})</th><th>Compare (current · M · C)</th><th>Source</th></tr></thead>
        <tbody>{rows.map(r => {
          const m = r.e.comp ? shapeFor(r.e.comp, 'M') : null, cc = r.e.comp ? shapeFor(r.e.comp, 'C') : null;
          const cur = r.px === Infinity ? '9999px' : `${r.px ?? 0}px`;
          return (
            <tr key={r.e.selector + r.e.file} data-testid={`evp-${r.e.selector}`} data-change={changeOf(r, opt)}>
              <td>{r.e.role}</td><td>{r.e.label}{r.e.note ? <><br /><span className="pqr-muted">{r.e.note}</span></> : null}</td>
              <td data-testid={`evp-cur-${r.e.selector}`}>{r.label}</td>
              <td>{r.kind === 'pill' ? 'full' : r.kind === 'circle' ? 'circle' : r.step ? fmtNearest(r.step) : r.kind === 'none' ? 'none (0)' : '—'}</td>
              <td style={{whiteSpace: 'nowrap'}}>{m ? m.label : 'Preserved'}</td><td style={{whiteSpace: 'nowrap'}}>{cc ? cc.label : 'Preserved'}</td>
              <td>{changeOf(r, opt) === 'Visible change' ? <Tag kind="issue">Visible change</Tag> : changeOf(r, opt)}</td>
              <td><div className="pqr-compare"><Sample css={r.kind === 'circle' ? '50%' : cur} label="now" />{m ? <Sample css={m.css} label="M" /> : null}{cc ? <Sample css={cc.css} label="C" /> : null}</div></td>
              <td><code>{r.e.file}{r.use ? `:${r.use.line}` : ''}</code></td>
            </tr>
          );
        })}</tbody>
      </table></div>
      <h2>Where your committed Storybook sections already differ</h2>
      <p className="pqr-muted">These specimens were committed earlier and are not edited here. Their shapes are read live and compared with the two options.</p>
      <div className="pqr-scroll"><table data-testid="committed-table">
        <thead><tr><th>Section</th><th>Selector</th><th>Role</th><th>Shows</th><th>Option M</th><th>Option C</th><th>Matches</th></tr></thead>
        <tbody>{committed.map(x => {
          const pxv = committedPx(x);
          const m = shapeFor(x.comp, 'M'), cc = shapeFor(x.comp, 'C');
          const val = (css: string) => (css.includes(' ') ? NaN : css === '9999px' ? Infinity : Number.parseFloat(css));
          const matchM = val(m.css) === pxv, matchC = val(cc.css) === pxv;
          return <tr key={x.file + x.selector} data-testid={`committed-${x.selector}`}><td>{x.section}</td><td><code>{x.selector}</code></td><td>{x.comp}</td><td>{x.css}</td><td>{m.label}</td><td>{cc.label}</td><td>{matchM && matchC ? 'both' : matchM ? 'Option M' : matchC ? 'Option C' : 'neither'}</td></tr>;
        })}</tbody>
      </table></div>
    </section>
  );
}

/* ------------------------------------------------------------ responsive */

export function Responsive({opt}: {opt: Option}) {
  const vars = useMemo(() => radiusVars(opt) as CSSProperties, [opt]);
  return (
    <section>
      <p className="pqr-muted" data-testid="resp-note">Material’s shape pages give no per-window-class guidance, so this is a local statement: corner values are constant across window classes. What changes is the PATTERN: a dialog on Medium and larger, a bottom sheet on Compact, and a full-screen dialog (corner none, a Material component token) when a task needs the whole screen.</p>
      <div className="pqr-scroll"><table data-testid="resp-table">
        <thead><tr><th>Component</th>{FRAMES.map(f => <th key={f.key}>{f.label} ({f.cls}, {classRange(f.key).min}px{classRange(f.key).max ? `–${classRange(f.key).max}px` : '+'})</th>)}</tr></thead>
        <tbody>{['button', 'chip', 'input-outlined', 'menu'].map(id => <tr key={id}><td>{decision(id).label}</td>{FRAMES.map(f => <td key={f.key} data-testid={`resp-${id}-${f.key}`}>{shapeFor(id, opt).label}</td>)}</tr>)}
          <tr><td>Dialog pattern</td><td>Bottom sheet · {shapeFor('sheet', opt).label}</td><td>Dialog · {shapeFor('dialog', opt).label}</td><td>Dialog · {shapeFor('dialog', opt).label}</td></tr>
          <tr><td>Full-screen task dialog</td><td colSpan={3}>{FULLSCREEN.label} (Material <code>full-screen-dialog.container-shape</code>, corner none), any window class</td></tr>
        </tbody>
      </table></div>
      <ModeFrame mode="light" title="Fixed-width frames (media queries would follow the preview, not the frame)">
        <div className="pqr-grid" style={{gridTemplateColumns: '1fr'}}>
          {FRAMES.map(f => (
            <div key={f.key} className="pqr-scroll">
              <div className="pqr-frame" style={{'--pqr-frame': `${f.width}px`, ...vars} as CSSProperties} data-testid={`frame-${f.key}`}>
                <p className="pqr-frame-label">{f.label} · {f.width}px · {f.cls}</p>
                <div className="pqr-row"><button type="button" className="pqr-btnf" data-decision="button" data-testid={`frame-button-${f.key}`}>Primary</button><button type="button" className="pqr-chip" aria-pressed="true" data-decision="chip" data-testid={`frame-chip-${f.key}`}>Chip</button></div>
                <input className="pqr-field" placeholder="Outlined field" aria-label={`Field ${f.label}`} data-testid={`frame-input-${f.key}`} data-decision="input-outlined" />
                {f.key === 'mobile'
                  ? <div className="pqr-sheet" data-decision="sheet" data-testid="frame-sheet-mobile"><strong>Bottom sheet</strong><span>Compact windows use a sheet.</span></div>
                  : <div className="pqr-dialog" data-decision="dialog" data-testid={`frame-dialog-${f.key}`}><strong>Dialog</strong><span>Medium and larger use a dialog.</span></div>}
              </div>
            </div>
          ))}
        </div>
      </ModeFrame>
    </section>
  );
}

/* --------------------------------------------------------- theme previews */

export function ThemePreviews({opt}: {opt: Option}) {
  return (
    <section>
      <div className="pqr-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))'}}>
        {MODES.map(m => <ModeFrame key={m} mode={m}><Layer hideMeta title={`Shapes on ${m === 'light' ? 'Carbon White' : 'Gray 100'}`}><ComponentSet mode={m} opt={opt} /></Layer></ModeFrame>)}
      </div>
      <p className="pqr-muted">Shape does not change with the theme: the same radii apply on Carbon White and Gray 100. Only the layer, border and shadow tokens differ (unchanged from the approved Carbon and Surfaces &amp; Depth foundations).</p>
    </section>
  );
}

/* ------------------------------------------------------------- exceptions */

export function Exceptions() {
  const c = useRadii();
  if (!c) return <p>Reading production CSS…</p>;
  const rows = rowsFor(c.uses).filter(r => r.e.kind === 'preserved');
  const byGroup = new Map<string, RadiusUse[]>();
  for (const u of c.uses) byGroup.set(u.group, [...(byGroup.get(u.group) ?? []), u]);
  const curatedKey = new Set(EXISTING.map(e => `${e.file}|${e.selector}`));
  const review = c.uses.filter(u => u.group === 'Standard UI' && !u.selector.split(',').some(p => curatedKey.has(`${u.file}|${p.trim()}`)));
  const distinct = (us: RadiusUse[]) => { const m = new Map<string, number>(); for (const u of us) { const k = summary(u).label; m.set(k, (m.get(k) ?? 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]); };
  const a5 = find(c.uses, 'app/world/adventure.css', '.adventure[data-theme="A5"] .tile');
  return (
    <section>
      <p data-testid="ex-line">{c.uses.length} border-radius declarations in {new Set(c.uses.map(u => u.file)).size} of {c.files} CSS files, excluding the untracked <code>app/design-audit/**</code> and scene-review tooling. Preserved by path: Adventure / Island / Arcade / Neon, game world, D0–D6 templates, hero / editorial composition. Preserved by role: cards, panels, navigation.</p>
      <h2>Preserved by role <Tag kind="preserved" /></h2>
      <div className="pqr-scroll"><table data-testid="ex-roles">
        <thead><tr><th>Role</th><th>Element</th><th>Current shape</th><th>Source</th><th>Example</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.e.selector} data-testid={`ex-${r.e.selector}`}><td>{r.e.role}</td><td>{r.e.label}{r.e.note ? <><br /><span className="pqr-muted">{r.e.note}</span></> : null}</td><td>{r.label}</td><td><code>{r.e.file}{r.use ? `:${r.use.line}` : ''}</code></td>
          <td><Sample css={r.kind === 'circle' ? '50%' : r.px === Infinity ? '9999px' : `${r.px ?? 0}px`} label="now" /></td></tr>)}</tbody>
      </table></div>
      <h2>Preserved by path <Tag kind="preserved" /></h2>
      <div className="pqr-scroll"><table data-testid="ex-groups">
        <thead><tr><th>Group</th><th>Declarations</th><th>Most common shapes</th></tr></thead>
        <tbody>{[...byGroup].filter(([g]) => g !== 'Standard UI').map(([g, us]) => <tr key={g} data-testid={`group-${g}`}><td>{g}</td><td>{us.length}</td><td>{distinct(us).slice(0, 6).map(([l, n]) => `${l} ×${n}`).join(', ')}</td></tr>)}</tbody>
      </table></div>
      {a5 && <p className="pqr-muted" data-testid="ex-a5">Example creative shape: Island (A5) tile <code>{summary(a5).label}</code> in <code>app/world/adventure.css:{a5.line}</code>; this is off the Material scale on purpose.</p>}
      <h2>Standard UI not in the curated list <Tag kind="issue">requires review</Tag></h2>
      <p data-testid="review-line">{review.length} declarations in standard-UI files are not covered by the curated roles above. They are neither mapped nor preserved until reviewed.</p>
      <h2>Existing production radius tokens <Tag kind="current" /></h2>
      <div className="pqr-scroll"><table data-testid="tok-table"><thead><tr><th>Token</th><th>Value</th><th>px</th><th>Nearest step</th></tr></thead>
        <tbody>{productionRadiusTokens().map(t => { const n = t.px !== null && t.px < 999 ? nearestStep(t.px) : null; return <tr key={t.name} data-testid={`tok-${t.name}`}><td><code>{t.name}</code></td><td>{t.value}</td><td>{t.px ?? '—'}</td><td>{t.px !== null && t.px >= 999 ? 'full' : n ? fmtNearest(n) : '—'}</td></tr>; })}</tbody></table></div>
    </section>
  );
}

export function RadiusCensus() {
  const c = useRadii();
  if (!c) return null;
  const m = new Map<string, {n: number; px: number | null; kind: string}>();
  for (const u of c.uses) { const s = summary(u); const e = m.get(s.label) ?? {n: 0, px: s.px, kind: s.kind}; e.n++; m.set(s.label, e); }
  const list = [...m].sort((a, b) => b[1].n - a[1].n);
  return (
    <div className="pqr-scroll"><table data-testid="census-table">
      <thead><tr><th>Value</th><th>Declarations</th><th>Nearest Material step</th></tr></thead>
      <tbody>{list.map(([label, e]) => {
        const n = e.kind === 'px' && e.px !== null ? nearestStep(e.px) : null;
        return <tr key={label}><td>{label}</td><td>{e.n}</td><td>{e.kind === 'pill' ? 'full' : e.kind === 'circle' ? 'circle (50%)' : n ? fmtNearest(n) : '—'}</td></tr>;
      })}</tbody>
    </table></div>
  );
}

/* ----------------------------------------------------------------- tokens */

export function tokenJson() {
  return {
    primitive: Object.fromEntries([...PRIMITIVES.map(p => [p.local, {value: p.key === 'full' ? '9999px' : `${p.px}px`, material: p.token}]), ...ASYMMETRIC.map(a => [a.local, {value: `${a.corners.tl}px ${a.corners.tr}px ${a.corners.br}px ${a.corners.bl}px`, material: a.token}])]),
    component: Object.fromEntries(DECISIONS.map(d => [`shape-${d.id}`, {M: shapeFor(d.id, 'M').css, C: shapeFor(d.id, 'C').css, usesPrimitive: {M: shapeFor(d.id, 'M').prim, C: shapeFor(d.id, 'C').prim}}])),
    preserved: 'Documentation names only; production CSS is never aliased to these tokens.',
    note: 'Figma variables: collection "Shape / Primitive" (10 numbers + 5 corner sets), collection "Shape / Component" with modes M and C.',
  };
}
export function TokenTables() {
  const json = useMemo(() => JSON.stringify(tokenJson(), null, 2), []);
  const prod = productionRadiusTokens();
  return (
    <section>
      <h2>1 · Primitive corner values <Tag kind="official" /></h2>
      <div className="pqr-scroll"><table data-testid="prim-table"><thead><tr><th>Local token</th><th>Material token</th><th>Value</th></tr></thead>
        <tbody>{PRIMITIVES.map(p => <tr key={p.key} data-testid={`prim-${p.key}`}><td><code>{p.local}</code></td><td><code>{p.token}</code></td><td>{p.key === 'full' ? '9999px (package; page says “fully rounded”)' : `${p.px}px`}</td></tr>)}
          {ASYMMETRIC.map(a => <tr key={a.name}><td><code>{a.local}</code></td><td><code>{a.token}</code></td><td>{a.corners.tl} {a.corners.tr} {a.corners.br} {a.corners.bl} <Tag kind="package" /></td></tr>)}</tbody></table></div>
      <h2>2 · Component shape decisions <Tag kind="local" /></h2>
      <p className="pqr-muted">Components reference primitives and never hold their own number, except the checkbox’s 2px package literal. The two options differ only for chip, outlined input and menu.</p>
      <DecisionTable opt="M" />
      <h2>3 · Preserved shapes (documentation names, never aliased) <Tag kind="preserved" /></h2>
      <div className="pqr-scroll"><table data-testid="pres-table"><thead><tr><th>Documentation name</th><th>Production source</th><th>Value</th></tr></thead>
        <tbody>{prod.map(t => <tr key={t.name}><td><code>shape-existing-{t.name.replace('--temp-', '').replace('--', '')}</code></td><td><code>{t.name}</code> in <code>app/tokens.css</code></td><td>{t.value}{t.px !== null ? ` (${t.px}px)` : ''}</td></tr>)}</tbody></table></div>
      <h2>Machine-readable preview (React / Figma later)</h2>
      <div className="pqr-row"><CopyButton text={json} label="Copy JSON" /></div>
      <pre className="pqr-box pqr-scroll" data-testid="token-json"><code>{json}</code></pre>
    </section>
  );
}

export {parseRaw};

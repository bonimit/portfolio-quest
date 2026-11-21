import {useEffect, useId, useMemo, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import './icons.css';
import fontUrl from './assets/material-symbols-rounded.woff2?url';
import {Layer, ModeFrame} from '../carbon/CarbonColors';
import {MODES, MODE_LABEL, SURFACES, pair, toHex, type Mode} from '../carbon/carbon-model';
import {shadowVars} from '../depth/depth-model';
import {
  CATEGORIES, COLORS, FAMILY, ICON_DATA, ICONS, IMPORT_SNIPPET, OPSZ_MAX, OPSZ_MIN, PAIRS, SIZES, STATE_MS, TOUCH_TARGET, buttonSnippet, colorVar, fontFaceSnippet, htmlSnippet, isBundled, opszFinding, opszFor,
  reactSnippet, searchCatalog, searchIcons, sizePx, type IconRecord, type SizeKey,
} from './icons-model';
import {assetDirs, ASSET_INDEX, classifySvg, evidentFor, runIconCensus, type IconCensus} from './icons-census';
import motion from '../material/material-motion.json';

/* ---------------------------------------------------------------- shared */

export type Kind = 'official' | 'local' | 'current' | 'preserved' | 'issue' | 'owner';
const KIND_LABEL: Record<Kind, string> = {official: 'Official / documented', local: 'Local proposal', current: 'Current (live source)', preserved: 'Preserved, not adopted', issue: 'Review issue', owner: 'Owner-specified'};
export const Tag = ({kind, children}: {kind: Kind; children?: ReactNode}) => <span className="pqi-tag" data-kind={kind}>{children ?? KIND_LABEL[kind]}</span>;
export const Page = ({title, children, testId = 'icons-page'}: {title: string; children: ReactNode; testId?: string}) => (
  <div className="pqi-page" data-testid={testId}><IconFontStyles /><h1 style={{fontSize: '1.5rem'}}>{title}</h1>{children}</div>
);
/** @font-face for the self-hosted subset. Loaded only by these stories; the asset lives under stories/, never under public/. */
export function IconFontStyles() {
  return <style data-testid="icon-font-face">{`@font-face { font-family: "${FAMILY}"; src: url("${fontUrl}") format("woff2"); font-weight: 400; font-style: normal; font-display: block; }`}</style>;
}
const std = (motion.easings.find(e => e.token === 'md.sys.motion.easing.standard')!.css as number[]);

/* --------------------------------------------------------------- the wrapper */

export type IconSpec = {name: string; size?: SizeKey; filled?: boolean; color?: string; label?: string; className?: string; style?: CSSProperties};
/**
 * Material Symbols Rounded. `filled` is for ACTIVE / SELECTED states only (FILL 1); the default is outline (FILL 0).
 * FILL, wght, GRAD and opsz are always set together, and opsz depends on size only, so the glyph shape never changes between states.
 * Decorative by default (aria-hidden). Pass `label` for a meaningful icon (role="img").
 */
export function Icon({name, size = 'md', filled = false, color = 'icon-primary', label, className, style}: IconSpec) {
  const px = sizePx(size);
  const known = isBundled(name);
  if (!known && typeof console !== 'undefined') console.error(`Icon "${name}" is not in the bundled Material Symbols Rounded subset`);
  const vars = {
    '--pqi-size': `${px}px`, '--pqi-fill': filled ? 1 : 0, '--pqi-opsz': opszFor(px), '--pqi-color': colorVar(color),
    '--pqi-ms': `${STATE_MS}ms`, '--pqi-ease': `cubic-bezier(${std.join(', ')})`, ...style,
  } as CSSProperties;
  if (!known) return <span className="pqi" data-missing="true" role="img" aria-label={`Missing icon ${name}`} style={vars}>{name}?</span>;
  const a11y = label ? {role: 'img', 'aria-label': label} : {'aria-hidden': true as const};
  return (
    <span className={`pqi${className ? ` ${className}` : ''}`} data-size={size} data-fill={filled ? '1' : '0'} data-name={name} style={vars} {...a11y}>
      <span className="pqi-g" aria-hidden="true">{name}</span>
    </span>
  );
}

export type IconButtonProps = {icon: string; label: string; size?: SizeKey; selected?: boolean; selectionRole?: 'pressed' | 'current'; onClick?: () => void; disabled?: boolean; hover?: boolean; testId?: string};
/**
 * Icon-only button. `label` is REQUIRED (it is the accessible name). The target is at least TOUCH_TARGET regardless of the glyph.
 * `selected` switches the glyph to FILL 1 and is exposed with aria-pressed (toggle) or aria-current (navigation).
 * Hover never changes the fill; it only shows the state layer.
 */
export function IconButton({icon, label, size = 'md', selected, selectionRole = 'pressed', onClick, disabled, hover, testId}: IconButtonProps) {
  const sel = selected === undefined ? {} : selectionRole === 'current' ? {'aria-current': selected ? ('page' as const) : undefined} : {'aria-pressed': selected};
  return (
    <button type="button" className={`pqi-btn-icon${hover ? ' is-hover' : ''}`} aria-label={label} onClick={onClick} disabled={disabled} style={{'--pqi-target': `${TOUCH_TARGET}px`} as CSSProperties} data-testid={testId} {...sel}>
      <Icon name={icon} size={size} filled={!!selected} color={disabled ? 'icon-disabled' : selected ? 'interactive-primary' : 'icon-primary'} />
    </button>
  );
}

/* ------------------------------------------------------------------ copy */

export function CopyButton({text, label = 'Copy'}: {text: string; label?: string}) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); try { document.execCommand('copy'); } finally { t.remove(); } }
    setDone(true);
    window.setTimeout(() => setDone(false), 1500);
  };
  return <button type="button" className="pqi-copy" onClick={copy} data-text={text}>{done ? 'Copied' : label}</button>;
}
export function Snippet({code, label}: {code: string; label: string}) {
  return (
    <div className="pqi-snippet">
      <div><p className="pqi-muted">{label}</p><pre className="pqi-box" data-testid="snippet-text">{code}</pre></div>
      <CopyButton text={code} label={`Copy ${label.toLowerCase()}`} />
    </div>
  );
}

/* --------------------------------------------------------------- gallery */

export function Banner() {
  const v = ICON_DATA.provenance;
  return (
    <div className="pqi-box" role="note">
      <p><Tag kind="official" /> <strong>{v.family}</strong>, self-hosted subset: <strong>{v.bundledCount}</strong> of {v.catalogCount} icons, {Math.round(v.fontBytes / 1024)} KB, Google Fonts version {v.cssVersion}. Variable axes: optical size {OPSZ_MIN} to {OPSZ_MAX}, FILL 0 to 1; weight 400 and grade 0 fixed. License: Apache 2.0.
        {' '}<Tag kind="local" /> Size scale, color usage, selection rules and wrapper API.</p>
      <p className="pqi-muted">“Outline” here means the Rounded family at FILL 0, not the separate Material Symbols Outlined family. The default is outline; filled is for active or selected states only, never for hover. Proposal only: no production icon or component changes.</p>
    </div>
  );
}

export function useFontReady(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { let live = true; document.fonts.load(`24px "${FAMILY}"`, 'home').then(() => live && setOk(document.fonts.check(`24px "${FAMILY}"`, 'home'))).catch(() => live && setOk(false)); return () => { live = false; }; }, []);
  return ok;
}

export function Gallery({mode}: {mode: 'outline' | 'filled'}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [size, setSize] = useState<SizeKey>('md');
  const [pick, setPick] = useState<string>('home');
  const ready = useFontReady();
  const list = useMemo(() => searchIcons(q, cat), [q, cat]);
  const missing = useMemo(() => searchCatalog(q), [q]);
  const filled = mode === 'filled';
  const rec = ICONS.find(i => i.name === pick) ?? list[0];
  const searchId = useId();
  return (
    <section>
      <div className="pqi-row">
        <label htmlFor={searchId}>Search</label>
        <input id={searchId} type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="name, tag or category" data-testid="gallery-search" style={{minHeight: '2.75rem', padding: '0 .75rem'}} />
        <label>Category <select value={cat} onChange={e => setCat(e.target.value)} data-testid="gallery-category"><option value="all">All</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Size <select value={size} onChange={e => setSize(e.target.value as SizeKey)} data-testid="gallery-size">{SIZES.map(s => <option key={s.key} value={s.key}>{s.label} · {s.px}px</option>)}</select></label>
        <span className="pqi-muted" data-testid="gallery-count">{list.length} of {ICONS.length} bundled icons · Rounded · FILL {filled ? 1 : 0} ({filled ? 'filled' : 'outline'}) · font {ready === null ? 'loading' : ready ? 'loaded' : 'NOT loaded'}</span>
      </div>
      <div className="pqi-cells" role="list" data-testid="gallery-cells" style={{marginTop: '.75rem'}}>
        {list.map(i => (
          <div key={i.name} role="listitem">
            <button type="button" className="pqi-cell" aria-pressed={pick === i.name} onClick={() => setPick(i.name)} data-testid={`cell-${i.name}`} aria-label={`${i.name}, show usage`} style={{width: '100%'}}>
              <Icon name={i.name} size={size} filled={filled} />{i.name}
            </button>
          </div>
        ))}
      </div>
      {!list.length && <p data-testid="gallery-empty">No bundled icon matches “{q}”.</p>}
      {missing.length > 0 && (
        <p className="pqi-muted" data-testid="gallery-unbundled">Also in the full Rounded catalog but <strong>not bundled</strong> (add the name to the generator’s required list and regenerate): {missing.join(', ')}.</p>
      )}
      {rec && <IconDetail rec={rec} startFilled={filled} size={size} />}
    </section>
  );
}

export function IconDetail({rec, startFilled, size}: {rec: IconRecord; startFilled: boolean; size: SizeKey}) {
  const [filled, setFilled] = useState(startFilled);
  const [prev, setPrev] = useState(startFilled);
  if (prev !== startFilled) { setPrev(startFilled); setFilled(startFilled); }
  const spec = {name: rec.name, size, filled};
  return (
    <article className="pqi-box" data-testid="icon-detail" style={{marginTop: '.75rem'}}>
      <h3><code>{rec.name}</code> <span className="pqi-muted">· U+{rec.codepoint.toUpperCase()} · {rec.categories.join(', ')}</span></h3>
      <p className="pqi-muted">Tags: {rec.tags.slice(0, 12).join(', ')}</p>
      <div className="pqi-row" style={{margin: '.5rem 0'}}>
        {SIZES.map(s => <span key={s.key} className="pqi-box pqi-row" style={{gap: '.5rem'}}><Icon name={rec.name} size={s.key} filled={false} /><Icon name={rec.name} size={s.key} filled /><span className="pqi-muted">{s.label} {s.px}</span></span>)}
      </div>
      <label><input type="checkbox" checked={filled} onChange={e => setFilled(e.target.checked)} /> Show usage as active / selected (FILL 1)</label>
      <div className="pqi-stack" style={{marginTop: '.5rem'}}>
        <Snippet label="React" code={reactSnippet({...spec, filled})} />
        <Snippet label="Icon button" code={buttonSnippet({name: rec.name, label: `Describe the action`, selected: filled ? true : undefined, size})} />
        <Snippet label="HTML and CSS" code={htmlSnippet({...spec, filled})} />
      </div>
    </article>
  );
}

/* ------------------------------------------------------ default vs active */

export function DefaultVsActive() {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(true);
  const [tab, setTab] = useState('home');
  const tabs = [['home', 'Home'], ['work', 'Work'], ['lightbulb', 'Concepts'], ['sports_esports', 'Arcade']] as const;
  return (
    <section>
      <h2>Same shape, two states</h2>
      <p className="pqi-muted">Rows show the default (outline, FILL 0) and the active or selected state (FILL 1) at the same size and optical size. Only the fill changes.</p>
      <div className="pqi-scroll"><table data-testid="pairs-table">
        <thead><tr><th>Icon</th><th>Default (FILL 0)</th><th>Active (FILL 1)</th><th>Typical use</th><th>FILL / opsz</th></tr></thead>
        <tbody>{PAIRS.map(p => (
          <tr key={p.name} data-testid={`pair-${p.name}`}>
            <td><code>{p.name}</code></td><td><Icon name={p.name} /></td><td><Icon name={p.name} filled /></td><td>{p.use}</td><td className="pqi-muted">0 → 1 · opsz {opszFor(sizePx('md'))} both</td>
          </tr>
        ))}</tbody>
      </table></div>
      <h2>Toggle buttons</h2>
      <div className="pqi-row" data-testid="toggle-row">
        <IconButton icon="bookmark" label={saved ? 'Remove bookmark' : 'Bookmark'} selected={saved} onClick={() => setSaved(v => !v)} testId="toggle-bookmark" />
        <IconButton icon="favorite" label={liked ? 'Unlike' : 'Like'} selected={liked} onClick={() => setLiked(v => !v)} testId="toggle-favorite" />
        <IconButton icon="favorite" label="Like (forced hover state)" selected={false} hover testId="toggle-hover" />
        <span className="pqi-muted">Third button shows the hover state layer only: the glyph stays outline. Selection uses <code>aria-pressed</code>.</span>
      </div>
      <h2>Navigation</h2>
      <ModeFrame mode="light" title="Navigation selected state · light">
        <Layer hideMeta title="Selected item: filled glyph + indicator pill + bold label + aria-current">
          <nav aria-label="Example navigation" className="pqi-nav" style={{'--pqi-target': `${TOUCH_TARGET}px`} as CSSProperties} data-testid="demo-nav">
            {tabs.map(([n, l]) => (
              <button key={n} type="button" className="pqi-nav-item" aria-current={tab === n ? 'page' : undefined} onClick={() => setTab(n)} data-testid={`nav-${n}`}>
                <span className="pqi-pill"><Icon name={n} filled={tab === n} color={tab === n ? 'icon-primary' : 'icon-secondary'} /></span>{l}
              </button>
            ))}
          </nav>
          <p className="pqi-muted">Fill is never the only cue: the selected item also has an indicator pill, a heavier label and an underline.</p>
        </Layer>
      </ModeFrame>
    </section>
  );
}

/* ------------------------------------------------------- sizes and colors */

export function SizeScale() {
  return (
    <section>
      <div className="pqi-scroll"><table data-testid="size-table">
        <thead><tr><th>Size</th><th>px</th><th>Outline</th><th>Filled</th><th>Optical size (opsz)</th><th>Minimum hit area for an icon-only button</th><th>Usage</th></tr></thead>
        <tbody>{SIZES.map(s => {
          const f = opszFinding(s.px);
          return (
            <tr key={s.key} data-testid={`size-${s.key}`}>
              <td>{s.label} {s.basis === 'material-default' ? <Tag kind="official">Material default</Tag> : <Tag kind="local" />}</td><td>{s.px}</td>
              <td><Icon name="home" size={s.key} /></td><td><Icon name="home" size={s.key} filled /></td>
              <td>{opszFor(s.px)}{f ? <><br /><Tag kind="issue" /> {f}</> : null}</td>
              <td>{TOUCH_TARGET}px, whatever the glyph size</td><td>{s.usage}</td>
            </tr>
          );
        })}</tbody>
      </table></div>
      <p className="pqi-muted">Material documents optical sizes 20 to 48 and says only the 20 and 24px designs are pixel-grid aligned. The XL (40) and L (32) sizes render crisply but are not native grid designs. The {TOUCH_TARGET}px target is Material’s value and is still an unconfirmed default for this project.</p>
      <h2>Icon-only button targets</h2>
      <div className="pqi-row" data-testid="target-row">{SIZES.map(s => <span key={s.key} className="pqi-box"><IconButton icon="close" label={`Close (${s.label})`} size={s.key} testId={`target-${s.key}`} /><br /><span className="pqi-muted">{s.label}</span></span>)}</div>
    </section>
  );
}

export function ColorUsage() {
  return (
    <section>
      <p className="pqi-muted">Icons take semantic Carbon color tokens (and the existing brand tokens). The wrapper accepts a token name, never a literal color. Ratios are WCAG contrast of the glyph color against each surface layer.</p>
      <div className="pqi-grid">
        {MODES.map(m => (
          <ModeFrame key={m} mode={m}>
            <Layer hideMeta title={`Semantic colors · ${m}`}>
              <div className="pqi-row" data-testid={`colors-${m}`}>
                {COLORS.map(c => <span key={c.token} className="pqi-box" style={{display: 'grid', justifyItems: 'center', gap: '.25rem'}}><Icon name="check_circle" size="lg" filled color={c.token} /><span style={{fontSize: '.7rem'}}>{c.token}</span></span>)}
              </div>
            </Layer>
          </ModeFrame>
        ))}
      </div>
    </section>
  );
}

const KIND_OF = (ui: boolean) => (ui ? 'ui' : 'info');
export function ContrastTable() {
  return (
    <section>
      <p data-testid="contrast-note">Non-text contrast: WCAG 2.2 SC 1.4.11 (level AA) asks 3:1 for visual information needed to identify user interface components and states, with an exception for inactive components. These details come from a W3C summary, not verbatim text, so treat the criterion wording as unconfirmed. The disabled token is translucent and is shown for information, not graded.</p>
      {MODES.map(m => (
        <div key={m} className="pqi-scroll"><table data-testid={`contrast-${m}`}>
          <caption style={{textAlign: 'left', fontWeight: 700}}>{MODE_LABEL[m]}</caption>
          <thead><tr><th>Icon color</th>{SURFACES.map(s => <th key={s}>on {s}</th>)}</tr></thead>
          <tbody>{COLORS.map(c => (
            <tr key={c.token} data-testid={`contrast-${m}-${c.token}`}>
              <td><code>{c.token}</code></td>
              {c.on ? (() => {
                const r = pair(m, 'A', c.token, c.on, 'ui');
                return <td colSpan={SURFACES.length} data-grade={r.grade}>{r.ratio.toFixed(2)}:1 on the <code>{c.on}</code> fill {r.grade === 'pass' ? '✓ 3:1' : '✗ below 3:1'}</td>;
              })() : SURFACES.map(s => {
                const r = pair(m, 'A', c.token, s, KIND_OF(c.ui) as 'ui' | 'info');
                return <td key={s} data-grade={r.grade}>{r.ratio.toFixed(2)}:1 {r.grade === 'pass' ? '✓ 3:1' : r.grade === 'fail' ? '✗ below 3:1' : '(info)'}</td>;
              })}
            </tr>
          ))}</tbody>
        </table></div>
      ))}
    </section>
  );
}

/* -------------------------------------------------------------- components */

export function ComponentExamples() {
  const [mode, setMode] = useState<Mode>('light');
  const [chip, setChip] = useState(true);
  const [text, setText] = useState('');
  const [nav, setNav] = useState('work');
  const [open, setOpen] = useState(true);
  const vars = {'--pqi-target': `${TOUCH_TARGET}px`, ...shadowVars(mode, 'carbon')} as CSSProperties;
  return (
    <section>
      <div className="pqi-row"><label>Surface <select value={mode} onChange={e => setMode(e.target.value as Mode)} data-testid="comp-mode">{MODES.map(m => <option key={m} value={m}>{MODE_LABEL[m]}</option>)}</select></label></div>
      <ModeFrame mode={mode} title={`Icons in components · ${mode}`}>
        <Layer hideMeta title="Button, chip, input, navigation and dialog">
          <div className="pqi-stack" style={vars} data-testid="comp-stack">
            <div className="pqi-row">
              <button type="button" className="pqi-sbtn" data-testid="btn-lead"><Icon name="download" size="sm" color="on-interactive-primary" />Download case study</button>
              <button type="button" className="pqi-sbtn pqi-sbtn--text"><Icon name="open_in_new" size="sm" />Open prototype</button>
              <IconButton icon="share" label="Share" testId="btn-icon-only" />
              <IconButton icon="more_vert" label="More actions" />
            </div>
            <div className="pqi-row">
              <button type="button" className="pqi-chip" aria-pressed={chip} onClick={() => setChip(v => !v)} data-testid="chip"><Icon name={chip ? 'check' : 'add'} size="sm" filled={false} />Research</button>
              <button type="button" className="pqi-chip" aria-pressed="false"><Icon name="add" size="sm" />Product</button>
            </div>
            <label className="pqi-field" data-testid="field">
              <Icon name="search" size="sm" color="icon-secondary" />
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Search projects" aria-label="Search projects" />
              {text && <IconButton icon="close" label="Clear search" size="sm" onClick={() => setText('')} testId="field-clear" />}
            </label>
            <nav aria-label="Example navigation" className="pqi-nav">
              {[['home', 'Home'], ['work', 'Work'], ['lightbulb', 'Concepts'], ['person', 'About']].map(([n, l]) => (
                <button key={n} type="button" className="pqi-nav-item" aria-current={nav === n ? 'page' : undefined} onClick={() => setNav(n)}>
                  <span className="pqi-pill"><Icon name={n} filled={nav === n} color={nav === n ? 'icon-primary' : 'icon-secondary'} /></span>{l}
                </button>
              ))}
            </nav>
            {open ? (
              <div className="pqi-dialog" role="dialog" aria-label="Delete project" data-testid="comp-dialog">
                <header><Icon name="warning" size="lg" filled color="support-warning" label="Warning" /><h3>Delete this project?</h3><IconButton icon="close" label="Close dialog" onClick={() => setOpen(false)} testId="dialog-close" /></header>
                <p>This removes the draft. You can’t undo it.</p>
                <div className="pqi-row"><button type="button" className="pqi-sbtn pqi-sbtn--text" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="pqi-sbtn"><Icon name="delete" size="sm" color="on-interactive-primary" />Delete</button></div>
              </div>
            ) : <button type="button" className="pqi-sbtn" onClick={() => setOpen(true)}>Show dialog</button>}
          </div>
        </Layer>
      </ModeFrame>
    </section>
  );
}

export function LightDark() {
  const sample = ['home', 'search', 'favorite', 'bookmark', 'settings', 'person', 'star', 'notifications'];
  return (
    <section>
      <div className="pqi-grid">
        {MODES.map(m => (
          <ModeFrame key={m} mode={m}>
            {[0, 1, 2].map(depth => (
              <Layer key={depth} hideMeta title={`Surface layer ${depth + 1}`}>
                {(['xs', 'sm', 'md'] as SizeKey[]).map(sz => (
                  <div key={sz} className="pqi-row" data-testid={`ld-${m}-${depth}-${sz}`}>
                    <span style={{width: '4.5rem'}} className="pqi-muted">{sz} · outline</span>{sample.map(n => <Icon key={n} name={n} size={sz} />)}
                    <span style={{width: '4.5rem'}} className="pqi-muted">filled</span>{sample.map(n => <Icon key={n} name={n} size={sz} filled />)}
                  </div>
                ))}
              </Layer>
            ))}
          </ModeFrame>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- exceptions */

export function useCensus(): IconCensus | null {
  const [c, setC] = useState<IconCensus | null>(null);
  useEffect(() => { let live = true; runIconCensus().then(x => live && setC(x)); return () => { live = false; }; }, []);
  return c;
}
export function Exceptions() {
  const c = useCensus();
  const dirs = assetDirs();
  const kinds = c ? c.svgs.map(s => ({s, k: classifySvg(s)})) : [];
  const n = (k: string) => kinds.filter(x => x.k.kind === k).length;
  return (
    <section>
      <h2>Inline SVG in production source <Tag kind="current" /></h2>
      {!c ? <p>Reading source…</p> : (
        <>
          <p data-testid="svg-line">{c.svgs.length} inline <code>&lt;svg&gt;</code> elements in {new Set(c.svgs.map(s => s.file)).size} files ({c.filesScanned} source files scanned, excluding the untracked <code>app/design-audit/**</code> and scene-review tooling):
            {' '}<strong>{n('ui-glyph')}</strong> small glyphs in standard UI, <strong>{n('preserved-control')}</strong> small controls inside preserved groups, <strong>{n('illustration')}</strong> illustrations, <strong>{n('unknown')}</strong> with a dynamic or missing viewBox.</p>
          <div className="pqi-scroll"><table data-testid="svg-table">
            <thead><tr><th>Source</th><th>viewBox</th><th>Class</th><th>Group</th><th>Proposed Material name</th></tr></thead>
            <tbody>{kinds.map(({s, k}) => {
              const ev = evidentFor(s);
              return (
                <tr key={s.file + s.line} data-testid={`svg-${s.file}:${s.line}`}>
                  <td><code>{s.file}:{s.line}</code>{s.className ? <> <code>.{s.className.split(' ')[0]}</code></> : null}</td><td>{s.viewBox ?? 'none'}</td>
                  <td>{k.kind === 'ui-glyph' ? 'UI glyph' : k.kind === 'illustration' ? 'Illustration' : k.kind === 'preserved-control' ? 'Preserved control' : 'Unknown'}<br /><span className="pqi-muted">{k.reason}</span></td>
                  <td>{s.group}</td>
                  <td>{k.kind === 'ui-glyph' ? (ev ? <><code>{ev.name}</code> <span className="pqi-muted">({ev.why})</span></> : <Tag kind="issue">owner review</Tag>) : '—'}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
          <h2>Non-SVG glyphs <Tag kind="current" /></h2>
          <p className="pqi-muted" data-testid="glyph-line">{c.glyphs.length} decorative glyphs found in CSS <code>content:</code> and in JSX text (arrows, geometric shapes, emoji). All are left as they are.</p>
          <div className="pqi-scroll"><table data-testid="glyph-table"><thead><tr><th>Source</th><th>Kind</th><th>Text</th><th>Group</th></tr></thead>
            <tbody>{c.glyphs.map(g => <tr key={g.file + g.line + g.text}><td><code>{g.file}:{g.line}</code></td><td>{g.kind}</td><td>{g.text}</td><td>{g.group}</td></tr>)}</tbody></table></div>
        </>
      )}
      <h2>Production images, pixel art, avatars and scenes <Tag kind="preserved" /></h2>
      <p className="pqi-muted" data-testid="asset-line">{ASSET_INDEX.count} image files in {dirs.length} folders under <code>public/</code> (index generated {ASSET_INDEX.generatedOn}; <code>public/quest-preview/scene-review/**</code> is excluded as untracked review output). Shown by URL for reference only and never changed.</p>
      <div className="pqi-grid">
        {dirs.map(d => (
          <article key={d.dir} className="pqi-box" data-testid={`dir-${d.dir}`}>
            <h3>{d.label}</h3>
            <p className="pqi-muted"><code>public/{d.dir}/</code> · {d.count} files · {Math.round(d.bytes / 1024)} KB · {d.group}</p>
            {/* eslint-disable @next/next/no-img-element -- read-only previews of production files by URL */}
            <div className="pqi-row">{d.sample.map(f => <img key={f} src={`/${f}`} alt="" width={64} height={64} loading="lazy" style={{objectFit: 'contain', imageRendering: /pets|guide/.test(d.dir) ? 'pixelated' : 'auto'}} className="pqi-checker" />)}</div>
          </article>
        ))}
      </div>
      <p className="pqi-muted">Pixel art, avatars, game assets and scene illustrations are preserved. The functional icon library is never used for them, and neither is the proposed 3D style.</p>
    </section>
  );
}

export {fontFaceSnippet, IMPORT_SNIPPET, toHex};

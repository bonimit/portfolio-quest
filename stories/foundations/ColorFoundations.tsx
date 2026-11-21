import {Fragment, useEffect, useMemo, useState, type CSSProperties} from 'react';
// Real production styles, imported unmodified. Both files only declare variables / .adventure-scoped rules.
import '../../app/tokens.css';
import '../../app/world/adventure.css';
import './colors.css';
import {PLAYABLE_PROJECTS} from '../../lib/adventure/projects';
import {luminance, toHex, toRgb, parseColor} from './color-math';
import {
  CATALOG, GROUPS, THEMES, inventory, resolveTheme, resolveThemeView, runAudit, themeById, allRules, compoundsOf,
  type Audit, type GroupId, type ResolvedToken, type ThemeDef, type ThemeId, type TokenRow,
} from './color-source';
import {PAIRS, citationExists, describeSide, evaluatePair, isFlagged, type PairCell, type PairSpec} from './color-pairs';

const style = (vars: Record<string, string>) => vars as CSSProperties;

/* ------------------------------------------------------------------ shared */

export function useAudit(): Audit | null {
  const [audit, setAudit] = useState<Audit | null>(null);
  useEffect(() => {
    let live = true;
    runAudit().then(a => live && setAudit(a));
    return () => { live = false; };
  }, []);
  return audit;
}

const useInventory = () => useMemo(() => inventory(), []);

export function Banner() {
  return (
    <div className="fx-banner" role="note">
      <strong>Documentation only — nothing here changes production.</strong>
      Every value is parsed from the current source CSS at build time. No colors were added, altered, replaced or migrated, no
      Material 3 palette was generated, and no design migration is approved by this page. Contrast results are measurements, not fixes.
    </div>
  );
}

function SourceLine({t}: {t: ResolvedToken}) {
  return <><code>{t.from.path}:{t.from.line}</code> · <code>{t.from.selector}</code></>;
}

export function Swatch({row, themeId, audit}: {row: TokenRow; themeId?: ThemeId; audit: Audit | null}) {
  const tok = (themeId ? row.present[themeId] : Object.values(row.present)[0]) as ResolvedToken | undefined;
  if (!tok) return null;
  const c = tok.color;
  const used = audit ? audit.usage[row.name] ?? 0 : null;
  const remaps = themeId
    ? []
    : Object.entries(row.present).filter(([, t]) => t.value !== tok.value);
  return (
    <article className="fx-swatch" data-token={row.name} data-testid={`swatch-${row.name}`}>
      <div className="fx-chip" style={style({'--fx-chip': c ? `rgb(${c.r} ${c.g} ${c.b} / ${c.a})` : 'transparent'})} role="img" aria-label={`${row.name} ${c ? toHex(c) : tok.value}`} />
      <div className="fx-swatch-body">
        <h4><code>{row.name}</code></h4>
        <div>
          <span className="fx-tag">{row.subgroup}</span>
          {tok.composite && <span className="fx-tag">composite</span>}
          {tok.aliasOf && <span className="fx-tag">alias of {tok.aliasOf}</span>}
          {row.basis === 'unknown' && <span className="fx-tag">role unknown</span>}
        </div>
        <dl>
          <dt>HEX</dt><dd>{c ? toHex(c) : '—'}</dd>
          <dt>RGB</dt><dd>{c ? toRgb(c) : '—'}</dd>
          {tok.composite && <><dt>Value</dt><dd><code>{tok.value}</code></dd></>}
          <dt>CSS</dt><dd><code>var({row.name})</code></dd>
          <dt>Role</dt><dd>{row.role}{row.basis === 'source' && <span className="fx-muted"> (stated in source)</span>}</dd>
          <dt>Source</dt><dd><SourceLine t={tok} /></dd>
          <dt>Used</dt><dd>{used === null ? 'counting…' : used ? `${used}× via var()` : 'no var() usage found'}</dd>
        </dl>
        {remaps.map(([tid, t]) => (
          <div className="fx-remap" key={tid}>
            <span className="fx-remap-chip" style={style({'--fx-chip': t.color ? `rgb(${t.color.r} ${t.color.g} ${t.color.b} / ${t.color.a})` : 'transparent'})} />
            In <strong>{themeById(tid as ThemeId)?.label ?? tid}</strong>: {t.color ? toHex(t.color) : t.value}
            {t.aliasOf && <> (alias of <code>{t.aliasOf}</code>)</>}
          </div>
        ))}
      </div>
    </article>
  );
}

function bySubgroup(rows: TokenRow[]) {
  const map = new Map<string, TokenRow[]>();
  for (const r of rows) map.set(r.subgroup, [...(map.get(r.subgroup) ?? []), r]);
  return [...map.entries()];
}

/* -------------------------------------------------------- group renderings */

export function GroupSection({group, themeId, audit}: {group: GroupId; themeId?: ThemeId; audit: Audit | null}) {
  const {rows} = useInventory();
  const mine = rows.filter(r => r.group === group && (!themeId || r.present[themeId]));
  return (
    <section aria-labelledby={`g-${group}`} data-testid={`group-${group}`}>
      <h2 id={`g-${group}`}>{GROUPS[group].title}</h2>
      <p className="fx-muted">{GROUPS[group].intro}</p>
      {bySubgroup(mine).map(([sub, list]) => (
        <Fragment key={sub}>
          <h3>{sub} <span className="fx-muted">({list.length})</span></h3>
          <div className="fx-grid">{list.map(r => <Swatch key={r.name} row={r} themeId={themeId} audit={audit} />)}</div>
        </Fragment>
      ))}
    </section>
  );
}

export function appearanceOf(t: ThemeDef) {
  return t.views.map(v => {
    const bg = resolveThemeView(t.id, v.id).get(v.bg)?.color;
    return {view: v.label, tone: bg ? (luminance(bg) < 0.18 ? 'Dark' : 'Light') : 'Unknown'};
  });
}

export function ThemeSection({theme, audit}: {theme: ThemeDef; audit: Audit | null}) {
  const {rows} = useInventory();
  const mine = rows.filter(r => r.group === 'theme' && r.present[theme.id]);
  const look = appearanceOf(theme);
  return (
    <section aria-labelledby={`t-${theme.id}`} data-testid={`theme-${theme.id}`}>
      <h3 id={`t-${theme.id}`}>{theme.label} <span className="fx-muted">· {theme.family}</span></h3>
      <p>
        {look.map(l => <span className="fx-tag" key={l.view}>{l.view}: {l.tone}</span>)}
        <code>{theme.selector}</code>
      </p>
      {theme.note && <p className="fx-muted">{theme.note}</p>}
      <div className="fx-grid">{mine.map(r => <Swatch key={r.name} row={r} themeId={theme.id} audit={audit} />)}</div>
    </section>
  );
}

export function ThemeComparison() {
  const {rows} = useInventory();
  const themes = THEMES.filter(t => t.kind === 'theme');
  const list = rows.filter(r => r.group === 'theme');
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Scrollable table">
      <table data-testid="theme-comparison">
        <caption>Token values across themes (resolved from the real cascade; “—” = not declared for that theme)</caption>
        <thead><tr><th scope="col">Token</th>{themes.map(t => <th scope="col" key={t.id}>{t.label}</th>)}</tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.name}>
              <th scope="row"><code>{r.name}</code></th>
              {themes.map(t => {
                const v = r.present[t.id];
                return (
                  <td key={t.id}>
                    {v?.color ? (<>
                      <span className="fx-remap-chip" style={style({'--fx-chip': `rgb(${v.color.r} ${v.color.g} ${v.color.b} / ${v.color.a})`})} />
                      {toHex(v.color)}
                    </>) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Sky gradients for the Island scene, read from every rule that declares --sky-top / --sky-bottom. */
export function SkyVariants() {
  const rows = useMemo(() => {
    const out: {cond: string; top?: ResolvedToken; bottom?: ResolvedToken; line: number}[] = [];
    for (const rule of allRules()) {
      if (rule.source !== 'quest') continue;
      const top = rule.decls.find(d => d.name === '--sky-top');
      const bottom = rule.decls.find(d => d.name === '--sky-bottom');
      if (!top && !bottom) continue;
      const cmp = compoundsOf(rule.selector).find(c => c.compound);
      const mk = (d?: {value: string}): ResolvedToken | undefined => {
        const color = d ? parseColor(d.value) : null;
        return d && color ? {name: '', value: d.value, declared: d.value, color, composite: false, from: {path: 'app/quest-preview/quest-preview.css', selector: rule.selector, line: rule.line}} : undefined;
      };
      out.push({cond: cmp?.part ?? rule.selector, top: mk(top), bottom: mk(bottom), line: rule.line});
    }
    return out;
  }, []);
  const chip = (t?: ResolvedToken) => t?.color
    ? <><span className="fx-remap-chip" style={style({'--fx-chip': `rgb(${t.color.r} ${t.color.g} ${t.color.b})`})} />{toHex(t.color)}</>
    : '—';
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Scrollable table">
      <table data-testid="sky-variants">
        <caption>Island scene sky gradients by city / season / light (every declaring rule in source order)</caption>
        <thead><tr><th scope="col">Rule</th><th scope="col">--sky-top</th><th scope="col">--sky-bottom</th><th scope="col">Line</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}><th scope="row"><code>{r.cond}</code></th><td>{chip(r.top)}</td><td>{chip(r.bottom)}</td><td>{r.line}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function DuplicateValues() {
  const {rows} = useInventory();
  const groups = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const r of rows) for (const [tid, t] of Object.entries(r.present)) {
      if (!t.color || t.composite) continue;
      const hex = toHex(t.color);
      const label = r.group === 'theme' ? `${r.name} (${themeById(tid as ThemeId)?.label ?? tid})` : r.name;
      map.set(hex, (map.get(hex) ?? new Set()).add(label));
    }
    return [...map.entries()].filter(([, s]) => s.size > 1).sort((a, b) => b[1].size - a[1].size);
  }, [rows]);
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Scrollable table">
      <table data-testid="duplicates">
        <caption>Same value declared by more than one token — an observation for the owner; nothing is merged or renamed</caption>
        <thead><tr><th scope="col">Value</th><th scope="col">Tokens</th></tr></thead>
        <tbody>{groups.map(([hex, names]) => (
          <tr key={hex}>
            <th scope="row"><span className="fx-remap-chip" style={style({'--fx-chip': hex})} />{hex}</th>
            <td>{[...names].map(n => <code key={n}>{n} </code>)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function Completeness() {
  const {unclassified, missing} = useInventory();
  return (
    <section aria-labelledby="g-complete" data-testid="completeness">
      <h2 id="g-complete">Completeness check</h2>
      <p className="fx-muted">Guards against drift between the CSS and this catalog.</p>
      <p>Catalog entries: <strong>{Object.keys(CATALOG).length}</strong>.{' '}
        Color tokens found in source but not classified: <strong data-testid="unclassified-count">{unclassified.length}</strong>{unclassified.length > 0 && <> ({unclassified.map(u => u.name).join(', ')})</>}.{' '}
        Catalog entries no longer found in source: <strong data-testid="missing-count">{missing.length}</strong>{missing.length > 0 && <> ({missing.join(', ')})</>}.
      </p>
    </section>
  );
}

export function LiteralAudit({audit}: {audit: Audit | null}) {
  if (!audit) return <p>Scanning source…</p>;
  const top = audit.literals.slice(0, 40);
  return (
    <section aria-labelledby="g-literals" data-testid="literals">
      <h2 id="g-literals">Hard-coded colors outside tokens</h2>
      <p className="fx-muted">
        {audit.literals.length} distinct literal color values used directly in color/background/border/outline/fill/shadow declarations across {audit.filesScanned} source files (CSS, TS and TSX scanned for token usage; CSS for literals).
        Listed for the owner’s awareness. They are preserved; none were changed.
      </p>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Scrollable table">
        <table>
          <caption>Most-used literal colors (top {top.length})</caption>
          <thead><tr><th scope="col">Value</th><th scope="col">Uses</th><th scope="col">Files</th><th scope="col">Example selectors</th></tr></thead>
          <tbody>{top.map(l => {
            const c = parseColor(l.value);
            return (
              <tr key={l.hex}>
                <th scope="row">{c && <span className="fx-remap-chip" style={style({'--fx-chip': `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`})} />}{c ? toHex(c) : l.value}</th>
                <td>{l.count}</td>
                <td>{[...l.files].slice(0, 3).map(f => <code key={f}>{f} </code>)}{l.files.size > 3 && `+${l.files.size - 3}`}</td>
                <td>{l.samples.map(s => <code key={s}>{s}<br /></code>)}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- contrast */

const GRADE_LABEL: Record<PairCell['grade'], string> = {
  pass: '✓ Pass', 'large-only': '▲ Large text only', fail: '✕ Fail', info: 'Info (not graded)', 'n/a': 'Not resolved',
};

function Cell({spec, cell}: {spec: PairSpec; cell: PairCell}) {
  if (!cell.fg?.color || !cell.bg?.color) return <td data-grade="n/a">Not resolved<br /><code>{cell.fgName}/{cell.bgName}</code></td>;
  const f = cell.fg.color, b = cell.bg.color;
  return (
    <td data-grade={cell.grade} data-testid={`cell-${spec.id}-${cell.theme}`}>
      <div className="fx-cell">
        <span className="fx-sample" style={style({'--fx-fg': `rgb(${f.r} ${f.g} ${f.b} / ${f.a})`, '--fx-bg': `rgb(${b.r} ${b.g} ${b.b})`})}>Aa</span>
        <span>{cell.ratio?.toFixed(2)}:1 <span className="fx-muted">({toHex(f)} on {toHex(b)})</span></span>
        <span className="fx-grade" data-grade={cell.grade}>{GRADE_LABEL[cell.grade]}</span>
      </div>
    </td>
  );
}

export function ContrastMatrix({only}: {only?: ThemeId[]}) {
  const sections = useMemo(() => {
    const map = new Map<string, PairSpec[]>();
    for (const p of PAIRS) {
      if (only && !p.themes.some(t => only.includes(t))) continue;
      map.set(p.section, [...(map.get(p.section) ?? []), p]);
    }
    return [...map.entries()];
  }, [only]);
  const evaluated = useMemo(() => new Map(PAIRS.map(p => [p.id, evaluatePair(p)])), []);
  const all = [...evaluated.entries()].flatMap(([id, cells]) => cells.map(c => ({spec: PAIRS.find(p => p.id === id)!, cell: c})));
  const graded = all.filter(x => x.cell.grade !== 'info' && x.cell.grade !== 'n/a');
  const flagged = graded.filter(x => isFlagged(x.cell)).sort((a, b) => (a.cell.ratio ?? 0) - (b.cell.ratio ?? 0));
  const fails = flagged.filter(x => x.cell.grade === 'fail').length;
  return (
    <div data-testid="contrast">
      <p>
        <strong>{graded.length}</strong> pairings measured across themes: <strong data-testid="flag-count">{flagged.length}</strong> flagged
        ({fails} below 3:1, {flagged.length - fails} between 3:1 and 4.5:1 text).
        Flagged pairings are <strong>reported only — no color was changed</strong>.
      </p>
      <p className="fx-muted">
        Method: WCAG 2.x relative-luminance ratio computed from the resolved token values; translucent foregrounds are composited over their background first.
        Text: ≥ 4.5:1 passes AA; 3–4.5:1 is acceptable for large text only; &lt; 3:1 fails. Non-text UI: ≥ 3:1. The project’s target policy is an owner decision.
        “Source rule” pairings are set by the cited production selector; “Suggested check” pairings are not documented in source and are included for awareness.
      </p>
      <details open>
        <summary>Flagged pairings, lowest ratio first ({flagged.length})</summary>
        <div className="fx-scroll" tabIndex={0} role="region" aria-label="Scrollable table">
          <table data-testid="flagged">
            <thead><tr><th scope="col">Pairing</th><th scope="col">Theme</th><th scope="col">Ratio</th><th scope="col">Result</th><th scope="col">Basis</th></tr></thead>
            <tbody>{flagged.map(({spec, cell}) => (
              <tr className="fx-flagrow" key={`${spec.id}-${cell.theme}`}>
                <th scope="row">{spec.label}<br /><code>{cell.fgName} on {cell.bgName}</code></th>
                <td>{themeById(cell.theme).label}</td>
                <td>{cell.ratio?.toFixed(2)}:1</td>
                <td><span className="fx-grade" data-grade={cell.grade}>{GRADE_LABEL[cell.grade]}</span> ({spec.kind === 'ui' ? 'non-text, needs 3:1' : 'text, needs 4.5:1'})</td>
                <td>{spec.basis === 'source' ? 'Source rule' : 'Suggested check'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </details>
      {sections.map(([section, specs]) => {
        const themeIds = THEMES.map(t => t.id).filter(id => specs.some(s => s.themes.includes(id)) && (!only || only.includes(id)));
        return (
          <section key={section} aria-label={section}>
            <h3>{section}</h3>
            <div className="fx-scroll" tabIndex={0} role="region" aria-label="Scrollable table">
              <table>
                <thead><tr><th scope="col">Pairing</th>{themeIds.map(id => <th scope="col" key={id}>{themeById(id).label}</th>)}</tr></thead>
                <tbody>
                  {specs.map(spec => {
                    const cells = evaluated.get(spec.id)!;
                    const ok = citationExists(spec);
                    return (
                      <tr key={spec.id}>
                        <th scope="row">
                          {spec.label}
                          <br /><span className="fx-tag">{spec.basis === 'source' ? 'Source rule' : 'Suggested check'}</span>
                          <span className="fx-tag">{spec.kind === 'text' ? 'text' : spec.kind === 'ui' ? 'non-text' : 'info'}</span>
                          <br /><code>{describeSide(spec.fg)} on {describeSide(spec.bg)}</code>
                          <br /><span className="fx-muted"><code>{spec.source.selector}</code> in <code>{spec.source.file}</code></span>
                          {!ok && <><br /><strong data-testid="stale-citation">⚠ citation not found in source</strong></>}
                          {spec.note && <><br /><span className="fx-muted">{spec.note}</span></>}
                        </th>
                        {themeIds.map(id => {
                          const cell = cells.find(c => c.theme === id);
                          return cell ? <Cell key={id} spec={spec} cell={cell} /> : <td key={id}>—</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ theme preview */

const ADV_CODE: Partial<Record<ThemeId, string>> = {island: 'A5', arcade: 'H3', neon: 'A2'};
export const SWITCHABLE = THEMES.filter(t => t.kind === 'theme');
export type PreviewView = 'grid' | 'carousel';

export function AdventurePreview({theme, view}: {theme: ThemeId; view: PreviewView}) {
  const tiles = PLAYABLE_PROJECTS.slice(0, 3);
  return (
    <div className="fx-adv-scope" data-testid="preview-scope">
      <div className={`adventure ${view === 'grid' ? 'v-grid' : 'v-carousel'}`} data-theme={ADV_CODE[theme]} data-testid="adventure-root">
        <header className="top">
          <span className="logo">Portfolio <span>Quest</span></span>
          <nav>
            <div className="switch2" role="group" aria-label="View">
              <button type="button" aria-pressed={view === 'grid'}>Grid</button>
              <button type="button" aria-pressed={view === 'carousel'}>Carousel</button>
            </div>
            <button type="button" className="btn" aria-pressed="true">Settings</button>
          </nav>
        </header>
        <ul className="lineup" data-lineup>
          {tiles.map((p, i) => (
            <li key={p.id}>
              <button type="button" className={`tile${i === 0 ? ' sel' : ''}`} style={style({'--c': p.color})} aria-label={`${p.name}, ${p.kind}`}>
                <span className="prev" aria-hidden="true" />
                <span className="meta"><span className="no">{String(i + 1).padStart(2, '0')}</span><span className="name">{p.name}</span><span className="kind">{p.kind}</span></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="hint">
          <button type="button" className="play">PLAY ▶</button>
          <ul className="tech" aria-label="Built with" style={{display: 'flex', gap: '.4rem', listStyle: 'none', margin: 0, padding: 0}}>
            <li>React</li><li>TypeScript</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function EditorialSpecimen() {
  return (
    <div className="fx-ed" data-testid="editorial-specimen">
      <div className="fx-ed-hero"><h3>Hero on --color-accent</h3><p>Ink text on the orange accent.</p></div>
      <div>
        <h3>Page surface</h3>
        <p>Body text uses <code>--color-ink</code> on <code>--color-paper</code>.</p>
        <p className="fx-ed-muted">Secondary text uses <code>--color-muted</code>.</p>
        <p><button type="button">Primary action</button> <button type="button" className="fx-ed-secondary">Secondary action</button></p>
        <div className="fx-ed-chips" aria-label="Pastel accents">
          {['orange', 'yellow', 'lime', 'teal', 'pink', 'lilac'].map(n => <span key={n} style={style({'--fx-pastel': `var(--landing-${n})`})}>{n}</span>)}
        </div>
      </div>
      <div className="fx-ed-alt"><h3>Alternate section</h3><p>Text on <code>--color-secondary-paper</code>.</p></div>
      <div className="fx-ed-footer"><b>Footer eyebrow</b><p>Inverse text on ink.</p><small>Muted footer text</small></div>
    </div>
  );
}

function IslandSpecimen({theme}: {theme: 'island-day' | 'island-night'}) {
  const vars = useMemo(() => Object.fromEntries([...resolveTheme(theme)].map(([k, t]) => [k, t.value])), [theme]);
  return (
    <div className="fx-isl" data-light={theme === 'island-day' ? 'day' : 'night'} style={style(vars)} data-testid="island-specimen">
      <h3 style={{margin: 0}}>Island scene · <span className="fx-isl-orange">{theme === 'island-day' ? 'Day' : 'Night'}</span></h3>
      <p style={{margin: 0}}>Scene text sits directly on the animated sky gradient.</p>
      <div className="fx-isl-panel">
        <p><strong>Guide panel</strong> — note text on the note surface.</p>
        <p className="fx-isl-hint">Placeholder / muted text.</p>
        <hr />
        <div className="fx-isl-controls"><button type="button" aria-pressed="true">Selected</button><button type="button" aria-pressed="false">Choice</button></div>
      </div>
    </div>
  );
}

export function ThemePreview({theme: themeProp = 'island', view: viewProp = 'grid', audit}: {theme?: ThemeId; view?: PreviewView; audit: Audit | null}) {
  // Local state follows the Storybook controls when they change (adjusted during render, not in an effect).
  const [theme, setTheme] = useState<ThemeId>(themeProp);
  const [seenTheme, setSeenTheme] = useState<ThemeId>(themeProp);
  if (seenTheme !== themeProp) { setSeenTheme(themeProp); setTheme(themeProp); }
  const [view, setView] = useState<PreviewView>(viewProp);
  const [seenView, setSeenView] = useState<PreviewView>(viewProp);
  if (seenView !== viewProp) { setSeenView(viewProp); setView(viewProp); }
  const def = themeById(theme);
  const adventure = !!ADV_CODE[theme];
  const look = appearanceOf(def);
  return (
    <div data-testid="theme-preview">
      <div className="fx-switcher">
        <fieldset>
          <legend>Theme</legend>
          {SWITCHABLE.map(t => (
            <label key={t.id}><input type="radio" name="fx-theme" value={t.id} checked={theme === t.id} onChange={() => setTheme(t.id)} />{t.label}</label>
          ))}
        </fieldset>
        {adventure && (
          <fieldset>
            <legend>Adventure view</legend>
            {(['grid', 'carousel'] as const).map(v => (
              <label key={v}><input type="radio" name="fx-view" value={v} checked={view === v} onChange={() => setView(v)} />{v === 'grid' ? 'Grid (cabinet)' : 'Carousel (select)'}</label>
            ))}
          </fieldset>
        )}
      </div>
      <p className="fx-preview-note">
        <strong>{def.label}</strong> — {look.map(l => `${l.view}: ${l.tone}`).join(' · ')}. Source: <code>{def.selector}</code>.{' '}
        {adventure
          ? 'Rendered with the real production Adventure CSS and class names; tiles come from lib/adventure/projects.ts. Fonts are not loaded in Storybook, so system fallbacks show.'
          : 'A token specimen: production styling for this theme is page-scoped, so a small layout is built from the same resolved tokens.'}
      </p>
      {adventure ? <AdventurePreview theme={theme} view={view} /> : theme === 'editorial' ? <EditorialSpecimen /> : <IslandSpecimen theme={theme as 'island-day' | 'island-night'} />}
      <h3>Tokens resolved for “{def.label}”</h3>
      <p className="fx-muted">{def.note}</p>
      <ActiveTokens theme={theme} audit={audit} />
    </div>
  );
}

function ActiveTokens({theme, audit}: {theme: ThemeId; audit: Audit | null}) {
  const {rows} = useInventory();
  const wanted: GroupId[] = theme === 'editorial' ? ['semantic', 'primitive'] : ['theme'];
  const mine = rows.filter(r => wanted.includes(r.group) && r.present[theme]);
  return <div className="fx-grid" data-testid="active-tokens">{mine.map(r => <Swatch key={r.name} row={r} themeId={theme} audit={audit} />)}</div>;
}

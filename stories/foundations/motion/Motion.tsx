import {createContext, useContext, useEffect, useId, useMemo, useRef, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import './motion.css';
import {ModeFrame, Layer} from '../carbon/CarbonColors';
import {shadowVars} from '../depth/depth-model';
import {spacingVars} from '../spacing/spacing-model';
import {
  BASIS_LABEL, COMPONENT_MOTION, COMPOSITES, GAME_TOKEN_NAMES, M3, PREF_LABEL, REDUCE_RULES, SEMANTIC_DURATIONS, SEMANTIC_EASINGS,
  bezOf, classify, compositeTiming, cssEasing, demoKeyframes, durationByToken, easingByToken, nearestDuration, nearestEasing, productionTokens, resolveReduced, systemPrefersReduced, tokenShort,
  type Axis, type Basis, type MotionPref,
} from './motion-model';
import {exceptionFor, runCssCensus, runJsCensus, type CssCensus, type JsEvidence} from './motion-census';

/* ---------------------------------------------------------------- shared */

export const Tag = ({kind, children}: {kind: Basis | 'preserved' | 'issue'; children?: ReactNode}) => (
  <span className="pqm-tag" data-kind={kind}>{children ?? (kind === 'preserved' ? 'Preserved, not adopted' : kind === 'issue' ? 'Review issue' : BASIS_LABEL[kind])}</span>
);
export const Surface = ({children, testId}: {children: ReactNode; testId?: string}) => <div className="pqm" data-testid={testId}>{children}</div>;

export function Banner() {
  return (
    <div className="pqm-box" role="note">
      <p><Tag kind="official" /> Easing curves and durations from <code>@material/web {M3.provenance.packages['@material/web']}</code>, each cross-checked against the rendered m3.material.io Tokens page.
        {' '}<Tag kind="official-pair" /> Material’s own suggested easing and duration pairs. <Tag kind="package" /> Spring values (package only).
        {' '}<Tag kind="local" /> Every semantic token name, bucket choice, component mapping and reduced-motion rule. <Tag kind="current" /> Read live from production CSS/TSX.</p>
      <p className="pqm-muted">Proposal only. Production animations, timings, easings and game motion are not changed or aliased to these tokens. Material states that its easing and duration system is legacy and that the current expressive system uses springs; both are shown.</p>
    </div>
  );
}

/** Three-state motion preference. Follow system reads matchMedia live; Reduce / Allow override it for the demos only. */
type Ctx = {pref: MotionPref; reduced: boolean; system: boolean};
const MotionCtx = createContext<Ctx>({pref: 'system', reduced: false, system: false});
export const useMotion = () => useContext(MotionCtx);

export function MotionRoot({children, initial = 'system'}: {children: ReactNode; initial?: MotionPref}) {
  const [pref, setPref] = useState<MotionPref>(initial);
  const [system, setSystem] = useState(systemPrefersReduced());
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setSystem(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  const reduced = resolveReduced(pref, system);
  const name = useId();
  const value = useMemo(() => ({pref, reduced, system}), [pref, reduced, system]);
  return (
    <MotionCtx.Provider value={value}>
      <fieldset className="pqm-box pqm-pref" data-testid="motion-pref">
        <legend>Reduced motion</legend>
        {(['system', 'reduce', 'allow'] as MotionPref[]).map(p => (
          <label key={p}><input type="radio" name={name} checked={pref === p} onChange={() => setPref(p)} /> {PREF_LABEL[p]}</label>
        ))}
        <span data-testid="motion-effective">Effective: <strong>{reduced ? 'reduced' : 'full motion'}</strong> · system preference: {system ? 'reduce' : 'no preference'}</span>
      </fieldset>
      {children}
    </MotionCtx.Provider>
  );
}

const px = (n: number) => `${n}ms`;
/** Cancel any earlier run first so the newest animation is the only one on the element (and the one reported). */
function animateFresh(el: Element | null | undefined, kf: Keyframe[], opts: KeyframeAnimationOptions): Animation | undefined {
  if (!el) return undefined;
  el.getAnimations().forEach(a => a.cancel());
  return el.animate(kf, opts);
}
const fmt = (b: readonly number[]) => cssEasing(b);

/* ----------------------------------------------------------------- easing */

function curvePath(b: readonly number[]) {
  const s = 100; // drawing space only
  return `M0,${s} C${b[0] * s},${s - b[1] * s} ${b[2] * s},${s - b[3] * s} ${s},0`;
}
export function EasingCurves() {
  const {reduced} = useMotion();
  const [ms, setMs] = useState(durationByToken('md.sys.motion.duration.long2').token);
  const dots = useRef<Record<string, HTMLElement | null>>({});
  const play = () => {
    for (const e of M3.easings) {
      const el = dots.current[e.token];
      const d = durationByToken(ms).ms;
      if (reduced) animateFresh(el, [{opacity: 0.2}, {opacity: 1}], {duration: Math.min(d, durationByToken('md.sys.motion.duration.short4').ms), easing: fmt(bezOf(e)), fill: 'both'});
      else animateFresh(el, [{transform: 'translateX(0)'}, {transform: 'translateX(calc(var(--pqm-track) - 1.25rem))'}], {duration: d, easing: fmt(bezOf(e)), fill: 'both'});
    }
  };
  const rows = [...M3.easings.slice(0, 3), M3.easings[3], M3.easings[4]];
  return (
    <section>
      <div className="pqm-row">
        <label>Duration <select value={ms} onChange={e => setMs(e.target.value)} data-testid="curve-duration">
          {M3.durations.map(d => <option key={d.token} value={d.token}>{tokenShort(d.token)} · {px(d.ms)}</option>)}
        </select></label>
        <button type="button" className="pqm-btn" onClick={play} data-testid="curve-play">Play / Replay</button>
        <span className="pqm-muted">{reduced ? 'Reduced: movement is replaced by a short fade.' : 'Each dot runs the same distance with its own curve.'}</span>
      </div>
      <div className="pqm-grid" style={{'--pqm-track': '100%'} as CSSProperties}>
        {rows.map(e => (
          <article key={e.token} className="pqm-box" data-testid={`curve-${tokenShort(e.token)}`}>
            <h3>{tokenShort(e.token).replace('easing.', '')}</h3>
            <p><Tag kind="official" /> <code>{fmt(bezOf(e))}</code></p>
            <svg className="pqm-curve" viewBox="0 0 100 100" role="img" aria-label={`${tokenShort(e.token)} curve ${fmt(bezOf(e))}`}>
              <line x1="0" y1="100" x2="100" y2="0" /><path className="c" d={curvePath(bezOf(e))} />
            </svg>
            <div className="pqm-track" style={{'--pqm-track': '100%'} as CSSProperties}><span className="pqm-dot" ref={n => { dots.current[e.token] = n; }} data-testid={`dot-${tokenShort(e.token)}`} /></div>
          </article>
        ))}
        <article className="pqm-box" data-testid="curve-emphasized">
          <h3>easing.emphasized</h3>
          <p><Tag kind="official" /> CSS: <strong>none</strong>. Official: “N/A (Use Standard as a fallback)”.</p>
          <p className="pqm-muted">On the web emphasized resolves to <code>{fmt(bezOf(easingByToken(M3.emphasized.fallback)))}</code> (standard). Use emphasized decelerate to enter and emphasized accelerate to exit.</p>
        </article>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- durations */

export function DurationComparison() {
  const {reduced} = useMotion();
  const dots = useRef<Record<string, HTMLElement | null>>({});
  const std = fmt(bezOf(easingByToken('md.sys.motion.easing.standard')));
  const play = () => {
    for (const d of M3.durations) {
      const el = dots.current[d.token];
      if (reduced) animateFresh(el, [{opacity: 0.2}, {opacity: 1}], {duration: Math.min(d.ms, 200), easing: std, fill: 'both'});
      else animateFresh(el, [{transform: 'translateX(0)'}, {transform: 'translateX(calc(var(--pqm-track) - 1.25rem))'}], {duration: d.ms, easing: std, fill: 'both'});
    }
  };
  return (
    <section>
      <div className="pqm-row"><button type="button" className="pqm-btn" onClick={play} data-testid="dur-play">Play all / Replay</button>
        <span className="pqm-muted">All 16 official durations with Standard easing. Bar length is proportional to time (1000ms = full width).</span></div>
      <div className="pqm-scroll"><div style={{display: 'grid', gap: '.35rem', minWidth: '30rem'}}>
        {M3.durations.map(d => (
          <div key={d.token} className="pqm-dur-row" data-testid={`dur-${tokenShort(d.token)}`}>
            <code>{tokenShort(d.token).replace('duration.', '')}</code>
            <span>{px(d.ms)}</span>
            <div style={{'--pqm-track': '100%', '--pqm-bar': `${d.ms / 10}%`} as CSSProperties}>
              <div className="pqm-bar" />
              <div className="pqm-track"><span className="pqm-dot" ref={n => { dots.current[d.token] = n; }} data-testid={`ddot-${tokenShort(d.token)}`} /></div>
            </div>
          </div>
        ))}
      </div></div>
    </section>
  );
}

/* ---------------------------------------------------------- transition lab */

const AXES: {kind: Axis; label: string; note: string}[] = [
  {kind: 'fade', label: 'Fade', note: 'Opacity only. The reduced-motion form of every transition.'},
  {kind: 'scale', label: 'Scale', note: 'Material avoids scale for components on Android (implies elevation change); shown for completeness.'},
  {kind: 'slide', label: 'Slide', note: 'Translate plus fade, travelling away from the edge it belongs to.'},
  {kind: 'expand', label: 'Expand / collapse', note: 'Reveals along one axis. Preferred over scale for menus (Material).'},
];
export function TransitionLab() {
  const {reduced} = useMotion();
  const [en, setEn] = useState('motion-enter');
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const [info, setInfo] = useState('not played yet');
  const play = (kind: Axis, dir: 'in' | 'out') => {
    const name = dir === 'in' ? en : en.replace('enter', 'exit');
    const t = compositeTiming(name, reduced);
    const a = animateFresh(refs.current[kind], demoKeyframes(kind, dir, reduced), {duration: t.ms, easing: t.easing, fill: 'both'});
    const x = a?.effect?.getTiming();
    setInfo(`${kind} ${dir}: ${x?.duration}ms · ${x?.easing}`);
  };
  const all = (dir: 'in' | 'out') => AXES.forEach(a => play(a.kind, dir));
  return (
    <section>
      <div className="pqm-row">
        <label>Pair <select value={en} onChange={e => setEn(e.target.value)} data-testid="lab-pair">
          <option value="motion-enter">motion-enter / motion-exit (emphasized, 400 / 200ms)</option>
          <option value="motion-enter-small">motion-enter-small / motion-exit-small (standard, 250 / 200ms)</option>
        </select></label>
        <button type="button" className="pqm-btn" onClick={() => all('in')} data-testid="lab-enter">Play enter</button>
        <button type="button" className="pqm-btn" onClick={() => all('out')} data-testid="lab-exit">Play exit</button>
      </div>
      <p className="pqm-muted" data-testid="lab-info">Last run: {info}</p>
      <div className="pqm-grid">
        {AXES.map(a => (
          <article key={a.kind} className="pqm-box">
            <h3>{a.label}</h3>
            <div className="pqm-stage">
              {a.kind === 'expand'
                ? <div className="pqm-expand" ref={n => { refs.current[a.kind] = n; }} data-testid={`lab-${a.kind}`}>Content</div>
                : <div className="pqm-item" ref={n => { refs.current[a.kind] = n; }} data-testid={`lab-${a.kind}`}>Item</div>}
            </div>
            <p className="pqm-note">{a.note}{reduced && a.kind !== 'fade' ? ' Reduced: shown as a fade.' : ''}</p>
          </article>
        ))}
      </div>
      <p className="pqm-muted">Shared-element / container-transform is an official pattern (see Tokens). It needs layout measurement, so it is not reproduced here. The FLIP reorder in <code>components/work/work-explorer.tsx</code> is documented under Preserved Animations instead.</p>
    </section>
  );
}

/* ------------------------------------------------------ component previews */

type DeviceMode = 'desktop' | 'mobile';
const FRAME: Record<DeviceMode, number> = {desktop: 720, mobile: 360};
export function ComponentDemos() {
  const {reduced} = useMotion();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const state = compositeTiming('motion-state-change', false);
  const stateVars = {'--pqm-state-ms': px(state.ms), '--pqm-state-ease': state.easing} as CSSProperties;
  const vars = {...stateVars, ...spacingVars('medium', 'rem'), ...shadowVars(mode, 'carbon')} as CSSProperties;
  const [chip, setChip] = useState(false);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState('not played yet');
  const record = (label: string, a: Animation | undefined) => { const t = a?.effect?.getTiming(); setInfo(`${label}: ${t?.duration}ms · ${t?.easing}`); };
  const toggleMenu = () => {
    const el = menu.current; if (!el) return;
    if (!open) {
      el.hidden = false; setOpen(true);
      const t = compositeTiming('motion-enter-small', reduced);
      record('menu enter', animateFresh(el, demoKeyframes('menu', 'in', reduced), {duration: t.ms, easing: t.easing, fill: 'both'}));
    } else {
      setOpen(false);
      const t = compositeTiming('motion-exit-small', reduced);
      const a = animateFresh(el, demoKeyframes('menu', 'out', reduced), {duration: t.ms, easing: t.easing, fill: 'both'});
      record('menu exit', a);
      a?.finished.then(() => { el.hidden = true; }).catch(() => undefined);
    }
  };
  return (
    <section>
      <div className="pqm-row">
        <label>Surface <select value={mode} onChange={e => setMode(e.target.value as 'light' | 'dark')} data-testid="demo-mode">
          <option value="light">Light (Carbon White)</option><option value="dark">Dark (Carbon Gray 100)</option></select></label>
        <span className="pqm-muted">Surface, spacing and shadow come from the approved Carbon, Material spacing and Surfaces &amp; Depth foundations, unchanged.</span>
      </div>
      <ModeFrame mode={mode} title={`Button, chip and menu · ${mode}`}>
        <Layer title="State layer, chip and dropdown" hideMeta>
          <div style={vars} className="pqm-surface" data-testid="demo-surface">
            <div className="pqm-row">
              <button type="button" className="pqm-sbtn" data-testid="demo-button">Primary</button>
              <button type="button" className="pqm-sbtn is-hover" data-testid="demo-button-hover">Hover state</button>
              <button type="button" className="pqm-chip" aria-pressed={chip} onClick={() => setChip(v => !v)} data-testid="demo-chip">Chip</button>
              <div className="pqm-anchor">
                <button type="button" className="pqm-sbtn" aria-expanded={open} onClick={toggleMenu} data-testid="demo-menu-toggle">{open ? 'Close menu' : 'Open menu'}</button>
                <div className="pqm-menu" ref={menu} hidden role="menu" data-testid="demo-menu">
                  <button type="button" role="menuitem" className="pqm-menuitem">Selected work</button>
                  <button type="button" role="menuitem" className="pqm-menuitem">Concept lab</button>
                </div>
              </div>
            </div>
            <p className="pqm-note" data-testid="demo-state-note">State layer: <code>background-color {px(state.ms)} {state.easing}</code> (token <code>motion-state-change</code>). Colour only, so it is kept under Reduce.</p>
            <p className="pqm-note" data-testid="demo-info">Last run: {info}</p>
          </div>
        </Layer>
      </ModeFrame>
      <div className="pqm-row" style={{alignItems: 'start'}}>
        {(['desktop', 'mobile'] as DeviceMode[]).map(d => <DialogDemo key={d} device={d} mode={mode} />)}
      </div>
    </section>
  );
}

function DialogDemo({device, mode}: {device: DeviceMode; mode: 'light' | 'dark'}) {
  const {reduced} = useMotion();
  const kind = device === 'desktop' ? 'dialog' : 'sheet';
  const dlg = useRef<HTMLDivElement>(null), scrim = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState('not played yet');
  const run = (dir: 'in' | 'out') => {
    const d = dlg.current, s = scrim.current; if (!d || !s) return;
    const t = compositeTiming(dir === 'in' ? 'motion-enter' : 'motion-exit', reduced);
    if (dir === 'in') { d.hidden = false; s.hidden = false; }
    const a = animateFresh(d, demoKeyframes(kind, dir, reduced), {duration: t.ms, easing: t.easing, fill: 'both'});
    animateFresh(s, [{opacity: dir === 'in' ? 0 : 1}, {opacity: dir === 'in' ? 1 : 0}], {duration: t.ms, easing: t.easing, fill: 'both'});
    const x = a?.effect?.getTiming();
    setInfo(`${dir === 'in' ? 'enter' : 'exit'}: ${x?.duration}ms · ${x?.easing}`);
    if (dir === 'out') a?.finished.then(() => { d.hidden = true; s.hidden = true; }).catch(() => undefined);
  };
  const toggle = () => { run(open ? 'out' : 'in'); setOpen(!open); };
  return (
    <ModeFrame mode={mode} title={`${device === 'desktop' ? 'Desktop dialog' : 'Mobile bottom sheet'} · ${FRAME[device]}px`}>
      <div className="pqm-scroll">
        <div className="pqm-device" onKeyDown={e => { if (e.key === 'Escape' && open) toggle(); }} style={{'--pqm-frame': `${FRAME[device]}px`, ...shadowVars(mode, 'carbon')} as CSSProperties} data-testid={`device-${device}`}>
          <button type="button" className="pqm-sbtn" onClick={toggle} aria-expanded={open} data-testid={`open-${device}`}>{open ? 'Close' : device === 'desktop' ? 'Open dialog' : 'Open sheet'}</button>
          <p className="pqm-note">Page content behind the {device === 'desktop' ? 'dialog' : 'sheet'}.</p>
          <div className="pqm-scrim" ref={scrim} hidden />
          <div className="pqm-dialog" ref={dlg} hidden role="dialog" aria-label={device === 'desktop' ? 'Example dialog' : 'Example sheet'} data-kind={kind} data-testid={`dialog-${device}`}>
            <h3>{device === 'desktop' ? 'Dialog' : 'Sheet'}</h3>
            <p>Enter uses emphasized decelerate; exit uses emphasized accelerate and is shorter.</p>
            <div><button type="button" className="pqm-sbtn" onClick={toggle}>Done</button></div>
          </div>
        </div>
      </div>
      <p className="pqm-note" data-testid={`info-${device}`}>Last run: {info}. {device === 'mobile' ? 'Same durations as desktop; only the distance travelled differs (sheet from the bottom edge).' : 'Enters within the screen bounds: fade plus a short slide.'}</p>
    </ModeFrame>
  );
}

/* ----------------------------------------------------------------- tokens */

export function tokenJson() {
  return {
    primitive: {
      duration: Object.fromEntries(M3.durations.map(d => [tokenShort(d.token), `${d.ms}ms`])),
      easing: Object.fromEntries([...M3.easings.map(e => [tokenShort(e.token), fmt(bezOf(e))]), ['easing.emphasized', 'none (use standard)']]),
    },
    semantic: {
      duration: Object.fromEntries(SEMANTIC_DURATIONS.map(d => [d.name, {ref: tokenShort(d.step), ms: durationByToken(d.step).ms}])),
      easing: Object.fromEntries(SEMANTIC_EASINGS.map(e => [e.name, e.token ? fmt(bezOf(easingByToken(e.token))) : `fallback: ${tokenShort(e.fallback ?? '')}`])),
      composite: Object.fromEntries(COMPOSITES.map(c => [c.name, {easing: tokenShort(c.easing), ms: c.ms, basis: c.basis}])),
    },
    reducedMotion: {rule: 'Reduce replaces movement with an opacity fade at motion-duration-short; colour, focus and pressed feedback unchanged.'},
    note: 'Documentation only. Production animation definitions are not replaced or aliased.',
  };
}
export function TokenTables() {
  const prod = productionTokens();
  return (
    <>
      <h2>1 · Primitive tokens <Tag kind="official" /></h2>
      <div className="pqm-scroll"><table data-testid="prim-table">
        <thead><tr><th>Token</th><th>Value</th><th>Page-verified</th></tr></thead>
        <tbody>
          {M3.durations.map(d => <tr key={d.token} data-testid={`prim-${tokenShort(d.token)}`}><td><code>{d.token}</code></td><td>{px(d.ms)}</td><td>{d.pageVerified ? 'yes' : 'no'}</td></tr>)}
          {M3.easings.map(e => <tr key={e.token}><td><code>{e.token}</code></td><td><code>{fmt(bezOf(e))}</code></td><td>{e.pageVerified ? 'yes' : 'no'}</td></tr>)}
          <tr><td><code>{M3.emphasized.token}</code></td><td>no CSS form; fallback <code>{tokenShort(M3.emphasized.fallback)}</code></td><td>yes (stated on page)</td></tr>
        </tbody>
      </table></div>
      <h2>2 · Semantic tokens <Tag kind="local" /></h2>
      <div className="pqm-scroll"><table data-testid="sem-table">
        <thead><tr><th>Token</th><th>Resolves to</th><th>Basis</th><th>Why</th></tr></thead>
        <tbody>
          {SEMANTIC_DURATIONS.map(d => <tr key={d.name} data-testid={`sem-${d.name}`}><td><code>{d.name}</code></td><td>{px(durationByToken(d.step).ms)} · <code>{tokenShort(d.step)}</code></td><td><Tag kind="local">Local bucket, official value</Tag></td><td>{d.why}</td></tr>)}
          {SEMANTIC_EASINGS.map(e => <tr key={e.name}><td><code>{e.name}</code></td><td>{e.token ? <><code>{fmt(bezOf(easingByToken(e.token)))}</code></> : <>fallback: <code>{tokenShort(e.fallback ?? '')}</code></>}</td><td><Tag kind="local">Local name</Tag></td><td>{e.why}</td></tr>)}
          {COMPOSITES.map(c => <tr key={c.name} data-testid={`sem-${c.name}`}><td><code>{c.name}</code></td><td><code>{tokenShort(c.easing)}</code> · {px(c.ms)}</td><td><Tag kind={c.basis} /></td><td>{c.use}</td></tr>)}
        </tbody>
      </table></div>
      <h2>3 · Component mapping <Tag kind="local" /></h2>
      <div className="pqm-scroll"><table>
        <thead><tr><th>Component</th><th>Enter</th><th>Exit</th><th>State</th><th>Note</th></tr></thead>
        <tbody>{COMPONENT_MOTION.map(c => <tr key={c.component}><td>{c.component}</td><td>{c.enter ?? '—'}</td><td>{c.exit ?? '—'}</td><td>{c.state ?? '—'}</td><td>{c.note}</td></tr>)}</tbody>
      </table></div>
      <h2>4 · Game and expressive tokens (documentation only) <Tag kind="current" /></h2>
      <p className="pqm-muted">Named from production’s existing values, which stay exactly as they are. Production CSS never aliases these names.</p>
      <div className="pqm-scroll"><table data-testid="game-table">
        <thead><tr><th>Proposed name (docs only)</th><th>Existing token</th><th>Value</th><th>Nearest official</th></tr></thead>
        <tbody>{prod.map(p => {
          const n = p.kind === 'easing' ? nearestEasing(p.value) : null;
          const d = p.ms !== null ? nearestDuration(p.ms) : null;
          return (
            <tr key={p.name} data-testid={`game-${p.name}`}>
              <td><code>{GAME_TOKEN_NAMES[p.name] ?? '—'}</code></td><td><code>{p.name}</code></td><td><code>{p.value}</code></td>
              <td>{n ? (n.close ? `${tokenShort(n.easing!.token)} (distance ${n.distance})` : `no close match (distance ${n.distance}, overshoot ${n.overshoot})`) : d ? (d.delta === 0 ? `${tokenShort(d.d.token)} exactly` : `${tokenShort(d.d.token)} (${d.delta > 0 ? '+' : ''}${d.delta}ms)`) : 'keyword easing, no match computed'}</td>
            </tr>
          );
        })}</tbody>
      </table></div>
      <h2>Spring tokens <Tag kind="package" /></h2>
      <p className="pqm-muted">{M3.quotes.legacyNote}</p>
      <div className="pqm-scroll"><table data-testid="spring-table">
        <thead><tr><th>Token</th><th>Damping</th><th>Stiffness</th></tr></thead>
        <tbody>{M3.springs.map(s => <tr key={s.token}><td><code>{s.token}</code></td><td>{s.damping}</td><td>{s.stiffness}</td></tr>)}</tbody>
      </table></div>
      <p className="pqm-muted">Springs are shown for reference only. No <code>linear()</code> spring approximation is proposed. Easing/duration versus springs is an owner decision.</p>
      <h2>Machine-readable preview (React / Figma later)</h2>
      <pre className="pqm-box pqm-scroll" data-testid="token-json"><code>{JSON.stringify(tokenJson(), null, 2)}</code></pre>
    </>
  );
}

/* ----------------------------------------------------------- reduced motion */

export function ReducedMotionRules() {
  return (
    <div className="pqm-scroll"><table data-testid="reduce-table">
      <thead><tr><th>Motion</th><th>When Reduce is on</th><th>What stays</th></tr></thead>
      <tbody>{REDUCE_RULES.map(r => <tr key={r.motion}><td>{r.motion}</td><td>{r.reduce}</td><td>{r.keeps}</td></tr>)}</tbody>
    </table></div>
  );
}

/* --------------------------------------------------------------- census UI */

export function useCensus(): {css: CssCensus | null; js: JsEvidence[] | null} {
  const [css, setCss] = useState<CssCensus | null>(null);
  const [js, setJs] = useState<JsEvidence[] | null>(null);
  useEffect(() => { let live = true; runCssCensus().then(x => live && setCss(x)); runJsCensus().then(x => live && setJs(x)); return () => { live = false; }; }, []);
  return {css, js};
}

const ms = (n: number | null) => (n === null ? 'dynamic' : px(n));
export function CoverageSummary({css}: {css: CssCensus}) {
  const count = (c: string) => css.uses.filter(u => u.coverage === c).length;
  const infinite = css.uses.filter(u => u.timing.iterations === 'infinite');
  const loose = infinite.filter(u => u.coverage === 'unguarded');
  return (
    <>
      <p data-testid="coverage-line">{css.uses.length} motion declarations (transitions and animations) in {css.filesWithMotion.length} CSS files, excluding the untracked <code>app/design-audit/**</code> and scene-review tooling:{' '}
        <strong>{count('guarded')}</strong> inside <code>no-preference</code>, <strong>{count('neutralised')}</strong> neutralised by a <code>reduce</code> block, <strong>{count('unguarded')}</strong> with no reduced-motion rule matching their selector in the same file (static match only: an ancestor-scope rule such as <code>.quest-preview *</code> can still cover them), <strong>{count('inert')}</strong> inert (already none/zero).</p>
      <p data-testid="infinite-line"><Tag kind="issue" /> {infinite.length} looping (<code>infinite</code>) animations; <strong>{loose.length}</strong> have no matching reduce rule found by static selector match.
        Real-app check (one-off Playwright run against <code>next dev</code>, 2026-11-21, not part of the suite): at load, /world ran 47 CSS animations with no preference and 0 with reduced motion emulated; /, /work, /concepts, /contact, /quest-preview and /entrance ran 0 in both modes at load, so loops that start on interaction were not exercised.
        WCAG 2.2.2 Pause, Stop, Hide (level A, per a W3C summary) concerns moving content that starts automatically and lasts more than five seconds; confirm each against real use before treating as a failure.</p>
      <div className="pqm-scroll"><table data-testid="loose-table">
        <thead><tr><th>Selector</th><th>Animation</th><th>Duration</th><th>Source</th><th>Group</th></tr></thead>
        <tbody>{loose.map(u => <tr key={u.file + u.line + u.selector + u.timing.name}><td><code>{u.selector}</code></td><td>{u.timing.name ?? '—'}</td><td>{ms(u.ms)}</td><td><code>{u.file}:{u.line}</code></td><td>{classify(u).group}</td></tr>)}</tbody>
      </table></div>
    </>
  );
}

export function ExistingVsProposed({css}: {css: CssCensus}) {
  const cands = css.uses.filter(u => classify(u).kind === 'candidate');
  return (
    <>
      <p data-testid="cand-line"><strong>{cands.length}</strong> of {css.uses.length} motion declarations are ordinary-UI candidates (short, finite, non-overshooting, outside every preserved group). Everything else is preserved and gets no proposed column.</p>
      <div className="pqm-scroll"><table data-testid="cand-table">
        <thead><tr><th>Selector</th><th>Kind</th><th>Current duration</th><th>Current easing</th><th>Nearest official duration</th><th>Nearest official easing</th><th>Source</th></tr></thead>
        <tbody>{cands.map(u => {
          const e = u.timing.easing ? nearestEasing(u.timing.easing) : null;
          const d = u.ms !== null ? nearestDuration(u.ms) : null;
          return (
            <tr key={u.file + u.line + u.selector + u.kind + u.timing.raw}>
              <td><code>{u.selector}</code></td><td>{u.kind}</td><td>{ms(u.ms)}</td><td><code>{u.timing.easing ?? 'default (ease)'}</code></td>
              <td>{d ? `${tokenShort(d.d.token)} ${px(d.d.ms)} (${d.delta > 0 ? '+' : ''}${d.delta}ms)` : 'variable'}</td>
              <td>{e ? (e.close ? `${tokenShort(e.easing!.token)} (distance ${e.distance})` : `no close match (distance ${e.distance}, overshoot ${e.overshoot})`) : 'keyword / variable'}</td>
              <td><code>{u.file}:{u.line}</code></td>
            </tr>
          );
        })}</tbody>
      </table></div>
    </>
  );
}

const injectKeyframes = (css: CssCensus) => css.keyframes.map(k => k.raw.replace(/^@(-webkit-)?keyframes\s+([\w-]+)/, '@keyframes pqm-$2')).join('\n');
export function PreservedAnimations({css, js}: {css: CssCensus; js: JsEvidence[] | null}) {
  const [run, setRun] = useState(false);
  const {reduced} = useMotion();
  const byName = useMemo(() => {
    const m = new Map<string, CssCensus['uses'][number]>();
    for (const u of css.uses) if (u.kind === 'animation' && u.timing.name && !m.has(u.timing.name)) m.set(u.timing.name, u);
    return m;
  }, [css]);
  const groups = useMemo(() => {
    const g = new Map<string, CssCensus['keyframes']>();
    for (const k of css.keyframes) { const key = classify({...(byName.get(k.name) ?? {file: k.file, line: k.line, selector: '', chain: [], kind: 'animation', timing: {} as never, guard: 'none', coverage: 'unguarded', ms: null})}).group; g.set(key, [...(g.get(key) ?? []), k]); }
    return [...g.entries()];
  }, [css, byName]);
  return (
    <>
      <style data-testid="pqm-keyframes">{injectKeyframes(css)}</style>
      <div className="pqm-row">
        <button type="button" className="pqm-btn" onClick={() => setRun(v => !v)} aria-pressed={run} data-testid="preserved-play">{run ? 'Pause previews' : 'Play previews'}</button>
        <span className="pqm-muted">{reduced ? 'Reduce is on: loops stay on their first frame.' : 'Keyframes are injected verbatim from production (renamed pqm-*). Timing and easing are read live from the rule that uses them.'}</span>
      </div>
      {groups.map(([group, list]) => (
        <section key={group}>
          <h3>{group} <Tag kind="preserved" /></h3>
          <div className="pqm-grid">
            {list.map(k => {
              const u = byName.get(k.name);
              const t = u?.timing;
              const style = u && t ? {animationName: `pqm-${k.name}`, animationDuration: t.durationMs !== null ? px(t.durationMs) : '1s', animationTimingFunction: t.easing ?? 'ease', animationIterationCount: t.iterations ?? '1', animationDelay: t.delayMs !== null ? px(t.delayMs) : '0ms', animationFillMode: t.fill ?? 'both'} as CSSProperties : undefined;
              return (
                <article key={k.file + k.name} className="pqm-box" data-testid={`pv-${k.name}`}>
                  <h3><code>{k.name}</code></h3>
                  <div className="pqm-pv" data-run={run && !reduced ? 'true' : 'false'}><i style={style} /></div>
                  <p className="pqm-note">{t ? `${ms(t.durationMs)} · ${t.easing ?? 'default easing'} · ${t.iterations ?? '1'}× · ${u!.coverage}` : 'timing from a variable or keyframes only'}<br /><code>{k.file}:{k.line}</code> · selector <code>{u?.selector ?? 'not found'}</code></p>
                </article>
              );
            })}
          </div>
        </section>
      ))}
      <h2>JavaScript-driven motion <Tag kind="preserved" /></h2>
      <p className="pqm-muted">Not re-implemented here: avatar walking and idle, island zoom, scene changes and game interactions are code-driven simulations. They are listed with the evidence found in the real files, so they can’t drift from production.</p>
      {!js ? <p>Reading source…</p> : (
        <div className="pqm-scroll"><table data-testid="js-table">
          <thead><tr><th>File</th><th>WAAPI .animate</th><th>rAF loops</th><th>View transitions</th><th>Timers</th><th>prefers-reduced-motion checks</th><th>Evidence (file line)</th></tr></thead>
          <tbody>{js.map(f => (
            <tr key={f.file} data-testid={`js-${f.file}`}>
              <td><code>{f.file}</code><br />{exceptionLabel(f.file)}</td><td>{f.waapi}</td><td>{f.raf}</td><td>{f.startViewTransition}</td><td>{f.timers}</td>
              <td>{f.reducedMotionChecks > 0 ? f.reducedMotionChecks : <><Tag kind="issue">none found</Tag></>}</td>
              <td>{f.lines.map(l => <div key={l.line}><code>{l.line}: {l.text}</code></div>)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </>
  );
}
const exceptionLabel = (f: string) => exceptionFor(f);

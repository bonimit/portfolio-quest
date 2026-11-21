import {createContext, useContext, useId, useMemo, useState, type CSSProperties, type ReactNode} from 'react';
import '../colors.css';
import '../../../app/tokens.css';
import './carbon.css';
import {toHex, toRgb, type RGBA} from '../color-math';
import {AdventurePreview} from '../ColorFoundations';
import {resolveTheme} from '../color-source';
import {
  BRAND_TOKENS, CARBON_REFERENCE, GROUP_ORDER, MODES, MODE_LABEL, PALETTES, PRIMARY_OPTIONS, PROVENANCE, SEMANTIC, SURFACES,
  brandColor, carbonColor, depthVars, existingOrangeText, kebab, layerAliases, layerTokenNames, measure, modeVars, pair, semanticValue,
  type BrandKey, type Kind, type Mode, type PrimaryOption, type Result,
} from './carbon-model';

const vars = (v: Record<string, string>) => v as CSSProperties;
const hexOf = (c: RGBA) => toHex(c);

/* ------------------------------------------------------------------ chrome */

export type BadgeKind = 'current' | 'proposed' | 'new';
const BADGE: Record<BadgeKind, string> = {current: '● CURRENT · live source', proposed: '◇ PROPOSED · Carbon-based', new: '★ NEW COLOR · needs approval'};
export const Badge = ({kind}: {kind: BadgeKind}) => <span className="pqc-badge" data-kind={kind}>{BADGE[kind]}</span>;

export function V2Banner() {
  return (
    <div className="fx-banner" role="note">
      <strong>Proposal for visual approval — nothing here is implemented or approved.</strong>
      Carbon supplies neutral layering, semantic tokens and support colors (light = White, dark = Gray 100). Portfolio Quest keeps its brand primary,
      accent, pastels and every Island / Arcade / Neon palette. No production CSS, protected file or S0 baseline is changed; Material 3 stays the
      component direction. Carbon data: <code>@carbon/themes {PROVENANCE.packages['@carbon/themes']}</code>, <code>@carbon/colors {PROVENANCE.packages['@carbon/colors']}</code>,
      layer rules from <code>@carbon/styles {PROVENANCE.packages['@carbon/styles (layer sets)']}</code> (generated {PROVENANCE.generatedOn}).
    </div>
  );
}

const Sw = ({c}: {c: RGBA}) => <span className="pqc-sw" style={vars({'--sw': `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`})} />;
const Val = ({c}: {c: RGBA}) => <><Sw c={c} />{hexOf(c)}</>;

/* ----------------------------------------------------------- mode + layers */

const Ctx = createContext<{mode: Mode; depth: number}>({mode: 'light', depth: 0});

export function ModeFrame({mode, opt = 'A', title, children}: {mode: Mode; opt?: PrimaryOption; title?: string; children: ReactNode}) {
  const style = useMemo(() => vars(modeVars(mode, opt)), [mode, opt]);
  return (
    <section className="pqc-mode" data-mode={mode} data-testid={`mode-${mode}`} style={style} aria-label={MODE_LABEL[mode]}>
      <div className="pqc-mode-label"><Badge kind="proposed" />{title ?? MODE_LABEL[mode]}</div>
      <Ctx.Provider value={{mode, depth: 0}}>{children}</Ctx.Provider>
    </section>
  );
}

/** Carbon Layer: each nesting increments depth and re-binds layer / field / border aliases. */
export function Layer({title, children, keepShadow, className = '', hideMeta, testId}: {title?: string; children: ReactNode; keepShadow?: boolean; className?: string; hideMeta?: boolean; testId?: string}) {
  const {mode, depth} = useContext(Ctx);
  const d = depth + 1;
  const names = layerTokenNames(d);
  return (
    <div className={`pqc-layer${keepShadow ? ' pqc-card-keep' : ''}${className ? ` ${className}` : ''}`} data-depth={d} data-testid={testId ?? `layer-${mode}-${d}`} style={vars(depthVars(mode, d))}>
      {title && <div className="pqc-layer-title">{title}</div>}
      {!hideMeta && <div className="pqc-layer-meta">depth {d}: layer → {names.layer} · field → {names.field} · border-subtle → {names['border-subtle']}</div>}
      <Ctx.Provider value={{mode, depth: d}}>{children}</Ctx.Provider>
    </div>
  );
}

export function FieldDemo({label, placeholder, state}: {label: string; placeholder?: string; state?: 'hover' | 'focus' | 'error' | 'disabled'}) {
  const id = useId();
  return (
    <div className="pqc-fieldgroup">
      <label htmlFor={id}>{label}</label>
      <input id={id} className={`pqc-input${state ? ` is-${state}` : ''}`} placeholder={placeholder ?? 'Placeholder'} disabled={state === 'disabled'} aria-invalid={state === 'error'} data-testid="pqc-input" />
      {state === 'error' && <span className="pqc-help is-error">Something is wrong with this value.</span>}
      {state !== 'error' && <span className="pqc-help">Helper text</span>}
    </div>
  );
}

function LayerStack({mode}: {mode: Mode}) {
  return (
    <ModeFrame mode={mode} title={`${MODE_LABEL[mode]} — Layer 00 (background) → 03`}>
      <p className="pqc-mode-sub">Layer 00 is the page. Each nested container steps one layer deeper; fields and borders re-bind with it.</p>
      <Layer title="Layer 01 · card">
        <FieldDemo label="Field (field-01)" />
        <Layer title="Layer 02 · panel inside the card">
          <FieldDemo label="Field (field-02)" />
          <Layer title="Layer 03 · menu / nested panel">
            <FieldDemo label="Field (field-03)" />
            <div className="pqc-row"><button type="button" className="pqc-btn pqc-btn--secondary">Cancel</button><button type="button" className="pqc-btn pqc-btn--primary">Save</button></div>
          </Layer>
        </Layer>
      </Layer>
    </ModeFrame>
  );
}
export const LayerDemo = () => <div className="pqc-pair">{MODES.map(m => <LayerStack key={m} mode={m} />)}</div>;

export function LayerBindingTable() {
  const rows = ['layer', 'field', 'border-subtle', 'border-strong', 'layer-hover', 'layer-active', 'layer-selected', 'field-hover'];
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Layer bindings">
      <table data-testid="layer-bindings">
        <caption>Which numbered Carbon token each alias resolves to at each Layer depth (from @carbon/styles layer sets), with values</caption>
        <thead><tr><th scope="col">Alias</th>{[1, 2, 3].map(d => <th scope="col" key={d}>Depth {d}</th>)}</tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r}>
            <th scope="row"><code>{r}</code></th>
            {[1, 2, 3].map(d => (
              <td key={d}><code>{layerTokenNames(d)[r]}</code><br />
                {MODES.map(m => { const hv = layerAliases(m, d)[r]; return <span key={m}><span className="pqc-sw" style={vars({'--sw': hv})} />{m === 'light' ? 'L' : 'D'} {hv} </span>; })}
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------- palettes */

export function Palettes() {
  const used = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const m of MODES) for (const d of SEMANTIC) {
      if (d.origin !== 'carbon') continue;
      const h = hexOf(semanticValue(m, 'A', d.name)).toLowerCase();
      map.set(h, [...(map.get(h) ?? []), `${d.name} (${m})`]);
    }
    return map;
  }, []);
  const scales = ['gray', 'red', 'yellow', 'green', 'blue'];
  const brand: BrandKey[] = ['ink', 'paper', 'surface', 'muted', 'border', 'orange', 'lime', 'yellow', 'teal', 'pink', 'lilac'];
  return (
    <div>
      <h2>IBM Carbon palettes <Badge kind="proposed" /></h2>
      <p className="fx-muted">From @carbon/colors {PROVENANCE.packages['@carbon/colors']}. “Used by” lists Carbon semantic tokens whose value equals the step (only for the neutral + support roles adopted here).</p>
      {scales.map(s => (
        <section key={s} aria-label={`${s} scale`}>
          <h3>{s[0].toUpperCase() + s.slice(1)}</h3>
          <div className="pqc-scale">
            {Object.entries(PALETTES[s] as Record<string, string>).map(([step, hex]) => {
              const u = used.get(hex.toLowerCase());
              return (
                <div className="pqc-step" key={step} data-testid={`step-${s}-${step}`}>
                  <i style={vars({'--sw': hex})} />
                  <div><b>{s}-{step}</b><span>{hex.toUpperCase()}</span>{u && <span className="fx-muted">used by {u.slice(0, 3).join(', ')}{u.length > 3 ? ` +${u.length - 3}` : ''}</span>}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <h2>Existing Portfolio Quest palette <Badge kind="current" /></h2>
      <p className="fx-muted">Read live from production CSS (not copied). Preserved as-is; these are the brand, accent and pastel colors used in the proposal.</p>
      <div className="pqc-scale">
        {brand.map(k => { const c = brandColor(k); return (
          <div className="pqc-step" key={k}><i style={vars({'--sw': `rgb(${c.r} ${c.g} ${c.b})`})} /><div><b>{BRAND_TOKENS[k]}</b><span>{hexOf(c)}</span><span className="fx-muted">{toRgb(c)}</span></div></div>
        ); })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- semantic table */

export function SemanticTable({opt}: {opt: PrimaryOption}) {
  return (
    <div>
      {GROUP_ORDER.map(g => {
        const rows = SEMANTIC.filter(d => d.group === g);
        if (!rows.length) return null;
        return (
          <section key={g} aria-label={g} data-testid={`semantic-${g}`}>
            <h3>{g}</h3>
            <div className="fx-scroll" tabIndex={0} role="region" aria-label={`${g} tokens`}>
              <table>
                <thead><tr><th scope="col">Token</th><th scope="col">Usage role</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Source</th></tr></thead>
                <tbody>{rows.map(d => (
                  <tr key={d.name}>
                    <th scope="row"><code>--pqc-{d.name}</code><br />
                      <span className="pqc-badge" data-kind={d.origin === 'carbon' ? 'proposed' : d.origin === 'derived' ? 'new' : 'current'}>{d.origin === 'carbon' ? 'Carbon' : d.origin === 'derived' ? 'New · needs approval' : 'Portfolio'}</span></th>
                    <td>{d.role}{d.carbonRef && <><br /><span className="fx-muted">Carbon reference: {d.carbonRef} (not adopted)</span></>}</td>
                    {MODES.map(m => <td key={m}><Val c={semanticValue(m, opt, d.name)} /></td>)}
                    <td><code>{d.source}</code></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function CarbonReference() {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Carbon reference tokens">
      <table data-testid="carbon-reference">
        <caption>Carbon IBM-Blue interactive tokens — reference only, not adopted (brand primary/accent are preserved)</caption>
        <thead><tr><th scope="col">Carbon token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Portfolio proposal instead</th></tr></thead>
        <tbody>{CARBON_REFERENCE.map(k => (
          <tr key={k}>
            <th scope="row"><code>{kebab(k)}</code></th>
            {MODES.map(m => <td key={m}><Val c={carbonColor(m, k)} /></td>)}
            <td>{k === 'interactive' ? 'interactive-primary (brand ink/paper or orange)' : k.startsWith('link') ? 'link = text-primary + underline (current behavior)' : k.startsWith('focus') || k === 'borderInteractive' ? 'focus = existing ink / paper ring' : '—'}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

/* --------------------------------------------------------------- specimens */

export const ACCENTS = ['accent', 'accent-yellow', 'accent-lime', 'accent-teal', 'accent-pink', 'accent-lilac'];
const BTN_STATES = ['default', 'hover', 'pressed', 'focus', 'disabled'] as const;
const stateClass = (s: string) => (s === 'default' ? '' : s === 'disabled' ? ' is-disabled' : ` is-${s}`);

export function Specimens({compact}: {compact?: boolean}) {
  return (
    <>
      <nav className="pqc-nav" aria-label="Navigation specimen">
        <a href="#a" aria-current="page">Work</a><a href="#b">Concepts</a><a href="#c" className="is-hover">Arcade</a><a href="#d">About</a>
      </nav>
      <div className="pqc-row">
        <button type="button" className="pqc-btn pqc-btn--primary">Primary</button>
        <button type="button" className="pqc-btn pqc-btn--accent">Accent</button>
        <button type="button" className="pqc-btn pqc-btn--secondary">Secondary</button>
        <button type="button" className="pqc-btn pqc-btn--primary" disabled>Disabled</button>
      </div>
      <div className="pqc-row" role="group" aria-label="Chips">
        <button type="button" className="pqc-chip">Design</button>
        <button type="button" className="pqc-chip" aria-pressed="true">Selected</button>
        <button type="button" className="pqc-chip" disabled>Disabled</button>
      </div>
      <div className="pqc-row" role="group" aria-label="Accent fills">
        {ACCENTS.map(a => <span key={a} className="pqc-fill" style={vars({background: `var(--pqc-${a})`, color: 'var(--pqc-on-accent)'})}>{a.replace('accent-', '').replace('accent', 'orange')}</span>)}
      </div>
      <Layer title="Card · Layer 01">
        <p>Text on a layered card surface. <a href="#l" style={{color: 'var(--pqc-link)'}}>Link inherits text color, underlined</a>.</p>
        <FieldDemo label="Input (field-01)" />
        {!compact && <div className="pqc-row"><button type="button" className="pqc-btn pqc-btn--primary">Action</button></div>}
      </Layer>
      <div className="pqc-scrim" aria-label="Dialog specimen">
        <Layer title="Dialog · Layer 01 over scrim">
          <p>Dialog surface uses the layer token over the overlay scrim.</p>
          <FieldDemo label="Name (field-01)" />
          <div className="pqc-row"><button type="button" className="pqc-btn pqc-btn--secondary">Cancel</button><button type="button" className="pqc-btn pqc-btn--primary">Confirm</button></div>
        </Layer>
      </div>
    </>
  );
}

export function ComponentModes({mode, opt}: {mode: Mode | 'both'; opt: PrimaryOption}) {
  const modes: Mode[] = mode === 'both' ? MODES : [mode];
  return (
    <div className={mode === 'both' ? 'pqc-pair' : ''} data-testid="component-modes">
      {modes.map(m => <ModeFrame key={m} mode={m} opt={opt}><Specimens /></ModeFrame>)}
    </div>
  );
}

export function ComponentSwitcher({mode: modeProp = 'both', opt: optProp = 'A'}: {mode?: Mode | 'both'; opt?: PrimaryOption}) {
  const [mode, setMode] = useState<Mode | 'both'>(modeProp);
  const [seenMode, setSeenMode] = useState(modeProp);
  if (seenMode !== modeProp) { setSeenMode(modeProp); setMode(modeProp); }
  const [opt, setOpt] = useState<PrimaryOption>(optProp);
  const [seenOpt, setSeenOpt] = useState(optProp);
  if (seenOpt !== optProp) { setSeenOpt(optProp); setOpt(optProp); }
  return (
    <div>
      <div className="fx-switcher">
        <fieldset><legend>Mode</legend>
          {(['light', 'dark', 'both'] as const).map(m => <label key={m}><input type="radio" name="pqc-mode" checked={mode === m} onChange={() => setMode(m)} />{m === 'both' ? 'Side by side' : m === 'light' ? 'Light (White)' : 'Dark (Gray 100)'}</label>)}
        </fieldset>
        <fieldset><legend>Primary action (named option)</legend>
          {(['A', 'B'] as const).map(o => <label key={o}><input type="radio" name="pqc-opt" checked={opt === o} onChange={() => setOpt(o)} />{PRIMARY_OPTIONS[o].name}</label>)}
        </fieldset>
      </div>
      <p className="fx-muted">{PRIMARY_OPTIONS[opt].summary} Island, Arcade and Neon are unaffected by this switch.</p>
      <ComponentModes mode={mode} opt={opt} />
    </div>
  );
}

const COMPONENT_TOKENS: {component: string; token: string; maps: string; current: string}[] = [
  {component: 'Button', token: 'button-primary-bg / -text', maps: 'interactive-primary / on-interactive-primary', current: '.action-link--primary (app/globals.css) = ink fill, paper text'},
  {component: 'Button', token: 'button-primary-hover / -pressed', maps: 'interactive-primary-hover / -active', current: 'no brand-fill hover token today · NEW, needs approval'},
  {component: 'Button', token: 'button-accent-bg / -text', maps: 'accent / on-accent', current: '.home-hero uses --color-accent with ink text'},
  {component: 'Button', token: 'button-secondary-border / -text', maps: 'border-strong-01 / text-primary', current: '.action-link--secondary = transparent, ink text'},
  {component: 'Button', token: 'button-disabled-bg / -text', maps: 'layer-accent-01 / text-disabled', current: 'not defined as a token today'},
  {component: 'Chip', token: 'chip-border / -text / -hover', maps: 'border-strong-01 / text-primary / layer-hover-01', current: '.landing-toolbar a (app/landing.css); chips direction in Review stories'},
  {component: 'Chip', token: 'chip-selected-bg / -text', maps: 'chip-selected (lime) / on-chip-selected (ink)', current: '--landing-lime hover fill; Adventure .tech li'},
  {component: 'Input', token: 'input-bg / -hover', maps: 'field (depth-aware) / field-hover', current: '.contact-form inputs use --color-paper; .guide-input-row uses a literal'},
  {component: 'Input', token: 'input-border / -focus-ring', maps: 'border-strong (depth-aware) / focus', current: 'ink border, --color-focus outline (app/contact/contact.css)'},
  {component: 'Input', token: 'input-placeholder / -helper / -error', maps: 'text-placeholder / text-helper / support-error + text-error', current: 'not defined as tokens today'},
  {component: 'Card', token: 'card-bg / -border / -hover', maps: 'layer / border-subtle / layer-hover (depth-aware)', current: '.tile, .pcard (Adventure); .world-preview (app/globals.css) — hard offset shadows, see exceptions'},
  {component: 'Dialog', token: 'dialog-bg / -scrim', maps: 'layer / overlay', current: '.guide-dialog (app/entrance.css) uses --guide-paper'},
  {component: 'Navigation', token: 'nav-border / -link / -selected / -hover', maps: 'border-subtle-00 / text-primary / layer-selected-01 / background-hover', current: '.mode-bar uses --color-border; links inherit ink (app/globals.css)'},
];

export function ComponentTokenTable({opt}: {opt: PrimaryOption}) {
  const DEPTH_AWARE = ['layer', 'field', 'border-strong', 'layer-hover', 'field-hover', 'layer-selected'];
  const resolve = (m: Mode, maps: string): RGBA[] => {
    const names = maps.split('/').map(s => s.trim().split(' ')[0]).filter(n => n && !n.startsWith('-'));
    return names.flatMap(n => {
      const name = n === 'border-subtle' ? 'border-subtle-00' : DEPTH_AWARE.includes(n) ? `${n}-01` : n;
      try { return [semanticValue(m, opt, name)]; } catch { return []; }
    });
  };
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Component tokens">
      <table data-testid="component-tokens">
        <caption>Proposed component tokens (names only; they alias semantic tokens) <Badge kind="proposed" /> vs the current implementation <Badge kind="current" /> (depth 1 shown)</caption>
        <thead><tr><th scope="col">Component</th><th scope="col">Component token</th><th scope="col">Maps to</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Current code</th></tr></thead>
        <tbody>{COMPONENT_TOKENS.map(r => (
          <tr key={r.token}>
            <th scope="row">{r.component}</th><td><code>{r.token}</code></td><td><code>{r.maps}</code></td>
            {MODES.map(m => <td key={m}>{resolve(m, r.maps).map((c, i) => <span key={i}><Sw c={c} /></span>)}</td>)}
            <td>{r.current}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function StatesGrid({opt}: {opt: PrimaryOption}) {
  return (
    <div className="pqc-pair" data-testid="states">
      {MODES.map(m => (
        <ModeFrame key={m} mode={m} opt={opt} title={`${MODE_LABEL[m]} — states`}>
          <h4>Primary / accent / secondary button</h4>
          {(['pqc-btn--primary', 'pqc-btn--accent', 'pqc-btn--secondary'] as const).map(c => (
            <div className="pqc-row" key={c}>{BTN_STATES.map(s => <button key={s} type="button" className={`pqc-btn ${c}${stateClass(s)}`} disabled={s === 'disabled'}>{s}</button>)}</div>
          ))}
          <h4>Chip</h4>
          <div className="pqc-row">{['default', 'hover', 'selected', 'focus', 'disabled'].map(s => <button key={s} type="button" className={`pqc-chip${stateClass(s)}`} disabled={s === 'disabled'}>{s}</button>)}</div>
          <h4>Input</h4>
          <Layer>
            <div className="pqc-row"><FieldDemo label="default" /><FieldDemo label="hover" state="hover" /><FieldDemo label="focus" state="focus" /><FieldDemo label="error" state="error" /><FieldDemo label="disabled" state="disabled" /></div>
          </Layer>
          <h4>Navigation / list rows (hover, selected)</h4>
          <nav className="pqc-nav" aria-label="States nav"><a href="#a">default</a><a href="#b" className="is-hover">hover</a><a href="#c" aria-current="page">selected</a><a href="#d" className="is-focus">focus</a></nav>
        </ModeFrame>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- brand + supporting */

export function BrandSupport() {
  return (
    <div>
      <h2>Primary action — two named options <Badge kind="proposed" /></h2>
      <p className="fx-muted">Both options use only existing brand colors. Carbon’s IBM Blue interactive tokens are not used. Hover/pressed fills are derived and flagged as new.</p>
      {(['A', 'B'] as const).map(o => (
        <section key={o} aria-label={PRIMARY_OPTIONS[o].name} data-testid={`option-${o}`}>
          <h3>{PRIMARY_OPTIONS[o].name}</h3>
          <p>{PRIMARY_OPTIONS[o].summary}</p>
          <div className="pqc-pair">
            {MODES.map(m => (
              <ModeFrame key={m} mode={m} opt={o}>
                <div className="pqc-row">
                  <button type="button" className="pqc-btn pqc-btn--primary">Primary</button>
                  <button type="button" className="pqc-btn pqc-btn--primary is-hover">hover</button>
                  <button type="button" className="pqc-btn pqc-btn--primary is-pressed">pressed</button>
                  <button type="button" className="pqc-btn pqc-btn--accent">Accent</button>
                </div>
              </ModeFrame>
            ))}
          </div>
        </section>
      ))}
      <h2>Accent colors <Badge kind="current" /></h2>
      <p className="fx-muted">Existing orange and pastel accents are preserved in both modes; content on them is the existing ink. Neutrals come from Carbon, accents do not.</p>
      <div className="pqc-pair">{MODES.map(m => (
        <ModeFrame key={m} mode={m}><div className="pqc-row">{ACCENTS.map(a => <span key={a} className="pqc-fill" style={vars({background: `var(--pqc-${a})`, color: 'var(--pqc-on-accent)'})}>{a.replace('accent-', '').replace('accent', 'orange')} {hexOf(semanticValue(m, 'A', a))}</span>)}</div></ModeFrame>
      ))}</div>
      <h3>Per-theme accent hues (unchanged, independent of light/dark)</h3>
      <ThemeAccents />
      <h2>Supporting colors <Badge kind="proposed" /></h2>
      <p className="fx-muted">Official Carbon support tokens; values differ by mode (see error / success / info). Warning yellow is identical in both modes, so usage differs: see Accessibility.</p>
      <div className="pqc-pair">
        {MODES.map(m => (
          <ModeFrame key={m} mode={m}>
            {(['support-error', 'support-warning', 'support-success', 'support-info'] as const).map(t => (
              <div className="pqc-support" key={t} style={vars({'--pqc-edge': `var(--pqc-${t})`})}>
                <span>{t.replace('support-', '')} · icon/border {hexOf(semanticValue(m, 'A', t))}</span>
                <span className="pqc-fill" style={vars({'--fill': `var(--pqc-${t})`, '--on-fill': `var(--pqc-text-on-color)`, background: `var(--pqc-${t})`, color: t === 'support-warning' ? 'var(--pqc-text-primary)' : 'var(--pqc-text-on-color)'})}>Fill</span>
                {t === 'support-error' && <span style={{color: 'var(--pqc-text-error)'}}>text-error {hexOf(semanticValue(m, 'A', 'text-error'))}</span>}
              </div>
            ))}
          </ModeFrame>
        ))}
      </div>
    </div>
  );
}

export function ThemeAccents() {
  const themes = [['island', 'Island'], ['arcade', 'Arcade'], ['neon', 'Neon']] as const;
  const hues = ['--tint', '--orange', '--lime', '--teal', '--lilac', '--pink'];
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Per-theme accents">
      <table data-testid="theme-accents">
        <caption>Adventure accent hues resolved from the real theme CSS <Badge kind="current" /></caption>
        <thead><tr><th scope="col">Token</th>{themes.map(([, l]) => <th key={l} scope="col">{l}</th>)}</tr></thead>
        <tbody>{hues.map(h => (
          <tr key={h}><th scope="row"><code>{h}</code></th>{themes.map(([id, l]) => { const t = resolveTheme(id).get(h)?.color; return <td key={l}>{t ? <Val c={t} /> : '—'}</td>; })}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

/* ----------------------------------------------------------- paper vs white */

const COMPARE: {label: string; cur: BrandKey; carbon: string; mode: Mode; disposition: string}[] = [
  {label: 'Page background', cur: 'paper', carbon: 'background', mode: 'light', disposition: 'Open — warm paper (current) or neutral White. Both pass with ink/primary text; choice is visual.'},
  {label: 'Alternate surface', cur: 'surface', carbon: 'layer01', mode: 'light', disposition: 'Open — nearest to Carbon layer-01; White alternates so layer-02 returns to background.'},
  {label: 'Primary text', cur: 'ink', carbon: 'textPrimary', mode: 'light', disposition: 'Candidate: keep existing ink (near-identical to text-primary).'},
  {label: 'Secondary text', cur: 'muted', carbon: 'textSecondary', mode: 'light', disposition: 'Open — compare measured ratios below.'},
  {label: 'Border (boundary)', cur: 'border', carbon: 'borderStrong01', mode: 'light', disposition: 'Open — current border is faint; control boundaries would use border-strong.'},
  {label: 'Border (divider)', cur: 'border', carbon: 'borderSubtle01', mode: 'light', disposition: 'Open — subtle dividers are decorative; compare tone only.'},
];

export function PaperVsWhite() {
  const cell = (r: Result) => <>{r.ratio.toFixed(2)}:1 <span className="fx-grade" data-grade={r.grade}>{r.grade === 'pass' ? '✓ Pass' : r.grade === 'large-only' ? '▲ Large only' : r.grade === 'fail' ? '✕ Fail' : r.grade}</span></>;
  const paper = brandColor('paper'), white = carbonColor('light', 'background');
  const secPaper = brandColor('surface'), l1 = carbonColor('light', 'layer01');
  return (
    <div>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Paper versus White">
        <table data-testid="paper-vs-white">
          <caption>Existing warm palette <Badge kind="current" /> vs Carbon White <Badge kind="proposed" /> — no value has been decided</caption>
          <thead><tr><th scope="col">Role</th><th scope="col">Current token · value</th><th scope="col">Carbon token · value</th><th scope="col">Proposed disposition (not a decision)</th></tr></thead>
          <tbody>{COMPARE.map(r => {
            const c = brandColor(r.cur), w = carbonColor(r.mode, r.carbon);
            return (<tr key={r.label}><th scope="row">{r.label}</th><td><code>{BRAND_TOKENS[r.cur]}</code><br /><Val c={c} /></td><td><code>{kebab(r.carbon)}</code><br /><Val c={w} /></td><td>{r.disposition}</td></tr>);
          })}</tbody>
        </table>
      </div>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Measured contrast, current versus Carbon">
        <table data-testid="paper-vs-white-contrast">
          <caption>Measured contrast, current vs Carbon (WCAG 2.x; text ≥ 4.5:1, boundary ≥ 3:1)</caption>
          <thead><tr><th scope="col">Pair</th><th scope="col">Current</th><th scope="col">Carbon White</th></tr></thead>
          <tbody>
            <tr><th scope="row">Primary text on page</th><td>{cell(measure(brandColor('ink'), paper, 'text'))}</td><td>{cell(measure(carbonColor('light', 'textPrimary'), white, 'text'))}</td></tr>
            <tr><th scope="row">Secondary text on page</th><td>{cell(measure(brandColor('muted'), paper, 'text'))}</td><td>{cell(measure(carbonColor('light', 'textSecondary'), white, 'text'))}</td></tr>
            <tr><th scope="row">Secondary text on alternate surface</th><td>{cell(measure(brandColor('muted'), secPaper, 'text'))}</td><td>{cell(measure(carbonColor('light', 'textSecondary'), l1, 'text'))}</td></tr>
            <tr><th scope="row">Border as control boundary on page</th><td>{cell(measure(brandColor('border'), paper, 'ui'))}</td><td>{cell(measure(carbonColor('light', 'borderStrong01'), white, 'ui'))} (border-strong-01)</td></tr>
            <tr><th scope="row">Subtle border on page (decorative)</th><td>{cell(measure(brandColor('border'), paper, 'info'))}</td><td>{cell(measure(carbonColor('light', 'borderSubtle01'), white, 'info'))} (border-subtle-01)</td></tr>
            <tr><th scope="row">Alternate surface vs page (separation)</th><td>{cell(measure(secPaper, paper, 'info'))}</td><td>{cell(measure(l1, white, 'info'))}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ accessibility */

const GRADE_LABEL: Record<Result['grade'], string> = {pass: '✓ Pass', 'large-only': '▲ Large text only', fail: '✕ Fail', exempt: 'Exempt (disabled)', info: 'Info'};
function ResultCell({r, testId}: {r: Result; testId?: string}) {
  return (
    <td data-grade={r.grade} data-testid={testId}>
      <div className="fx-cell">
        <span className="fx-sample" style={vars({'--fx-fg': `rgb(${r.fg.r} ${r.fg.g} ${r.fg.b} / ${r.fg.a})`, '--fx-bg': `rgb(${r.bg.r} ${r.bg.g} ${r.bg.b})`})}>Aa</span>
        <span>{r.ratio.toFixed(2)}:1</span>
        <span className="fx-grade" data-grade={r.grade}>{GRADE_LABEL[r.grade]}</span>
      </div>
    </td>
  );
}

type SurfRow = {label: string; fg: string | ((m: Mode) => RGBA); kind: Kind; note?: string};
function SurfaceMatrix({title, rows, surfaces = SURFACES, opt = 'A', id}: {title: string; rows: SurfRow[]; surfaces?: string[]; opt?: PrimaryOption; id: string}) {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label={title}>
      <table data-testid={id}>
        <caption>{title}</caption>
        <thead>
          <tr><th rowSpan={2} scope="col">Foreground</th>{MODES.map(m => <th key={m} colSpan={surfaces.length} scope="colgroup">{MODE_LABEL[m]}</th>)}</tr>
          <tr>{MODES.flatMap(m => surfaces.map(s => <th key={`${m}-${s}`} scope="col"><code>{s}</code></th>))}</tr>
        </thead>
        <tbody>{rows.map(r => (
          <tr key={r.label}>
            <th scope="row">{r.label}<br /><span className="fx-tag">{r.kind === 'text' ? 'text 4.5:1' : r.kind === 'ui' ? 'non-text 3:1' : r.kind}</span>{r.note && <><br /><span className="fx-muted">{r.note}</span></>}</th>
            {MODES.flatMap(m => surfaces.map(s => <ResultCell key={`${m}-${s}`} r={pair(m, opt, r.fg, s, r.kind, 'background')} testId={`m-${id}-${r.label}-${m}-${s}`} />))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

type PairRow = {label: string; fg: string; bg: string; kind: Kind; opt?: PrimaryOption; on?: string; note?: string};
function PairTable({title, rows, id}: {title: string; rows: PairRow[]; id: string}) {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label={title}>
      <table data-testid={id}>
        <caption>{title}</caption>
        <thead><tr><th scope="col">Pairing</th>{MODES.map(m => <th key={m} scope="col">{MODE_LABEL[m]}</th>)}</tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r.label}>
            <th scope="row">{r.label}<br /><code>{r.fg} on {r.bg}</code> <span className="fx-tag">{r.kind === 'text' ? 'text 4.5:1' : r.kind === 'ui' ? 'non-text 3:1' : r.kind}</span>{r.note && <><br /><span className="fx-muted">{r.note}</span></>}</th>
            {MODES.map(m => <ResultCell key={m} r={pair(m, r.opt ?? 'A', r.fg, r.bg, r.kind, r.on ?? 'background')} testId={`m-${id}-${r.label}-${m}`} />)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function accessibilitySummary() {
  const out: Result[] = [];
  const surf = (rows: SurfRow[], surfaces = SURFACES) => rows.forEach(r => MODES.forEach(m => surfaces.forEach(s => out.push(pair(m, 'A', r.fg, s, r.kind)))));
  surf(TEXT_ROWS); surf(SUPPORT_ROWS); surf(BRAND_ROWS);
  return out.filter(r => r.grade === 'fail' || r.grade === 'large-only').length;
}

const TEXT_ROWS: SurfRow[] = [
  {label: 'text-primary', fg: 'text-primary', kind: 'text'},
  {label: 'text-secondary', fg: 'text-secondary', kind: 'text'},
  {label: 'text-helper', fg: 'text-helper', kind: 'text'},
  {label: 'text-placeholder', fg: 'text-placeholder', kind: 'text', note: 'Translucent; graded against the surface it sits on (flagged, not exempt).'},
  {label: 'text-error', fg: 'text-error', kind: 'text'},
  {label: 'text-disabled', fg: 'text-disabled', kind: 'exempt'},
  {label: 'icon-primary', fg: 'icon-primary', kind: 'ui'},
  {label: 'icon-secondary', fg: 'icon-secondary', kind: 'ui'},
  {label: 'focus (Portfolio ring)', fg: 'focus', kind: 'ui'},
];
const SUPPORT_ROWS: SurfRow[] = [
  {label: 'support-error (icon/border)', fg: 'support-error', kind: 'ui'},
  {label: 'support-warning (icon/border)', fg: 'support-warning', kind: 'ui', note: 'Same value in both modes; behavior differs by surface.'},
  {label: 'support-success (icon/border)', fg: 'support-success', kind: 'ui'},
  {label: 'support-info (icon/border)', fg: 'support-info', kind: 'ui'},
  {label: 'text-error (text)', fg: 'text-error', kind: 'text'},
];
const BRAND_ROWS: SurfRow[] = [
  {label: 'accent as icon/border (orange)', fg: 'accent', kind: 'ui'},
  {label: 'accent as text (orange)', fg: 'accent', kind: 'text', note: 'Existing orange as text color.'},
  {label: 'existing orange-text literal (entrance.css, not a token)', fg: () => existingOrangeText() ?? brandColor('orange'), kind: 'text', note: 'An existing darker orange used for text on paper. Using it would need tokenizing (needs approval).'},
  {label: 'chip-selected lime as border/icon', fg: 'chip-selected', kind: 'ui'},
  ...(['yellow', 'teal', 'pink', 'lilac'] as const).map(h => ({label: `accent-${h} as border/icon`, fg: `accent-${h}`, kind: 'ui' as Kind})),
];

const FILL_ROWS: PairRow[] = [
  {label: 'Primary button, Option A', fg: 'on-interactive-primary', bg: 'interactive-primary', kind: 'text', opt: 'A'},
  {label: 'Primary button, Option B', fg: 'on-interactive-primary', bg: 'interactive-primary', kind: 'text', opt: 'B'},
  {label: 'Accent fill, existing ink on orange', fg: 'on-accent', bg: 'accent', kind: 'text'},
  {label: 'Carbon text-on-color on orange (why on-accent is ink)', fg: 'text-on-color', bg: 'accent', kind: 'text'},
  ...(['yellow', 'lime', 'teal', 'pink', 'lilac'] as const).map(h => ({label: `Accent ${h}: on-accent (ink) on fill`, fg: 'on-accent', bg: `accent-${h}`, kind: 'text' as Kind})),
  {label: 'Selected chip, ink on lime', fg: 'on-chip-selected', bg: 'chip-selected', kind: 'text'},
  {label: 'Error fill with text-on-color', fg: 'text-on-color', bg: 'support-error', kind: 'text'},
  {label: 'Warning fill with text-on-color', fg: 'text-on-color', bg: 'support-warning', kind: 'text'},
  {label: 'Warning fill with text-primary', fg: 'text-primary', bg: 'support-warning', kind: 'text'},
  {label: 'Success fill with text-on-color', fg: 'text-on-color', bg: 'support-success', kind: 'text'},
  {label: 'Success fill with text-primary', fg: 'text-primary', bg: 'support-success', kind: 'text'},
  {label: 'Information fill with text-on-color', fg: 'text-on-color', bg: 'support-info', kind: 'text'},
];

const STATE_ROWS: PairRow[] = [
  ...['01', '02', '03'].map(n => ({label: `Hover — text on layer-hover-${n}`, fg: 'text-primary', bg: `layer-hover-${n}`, kind: 'text' as Kind})),
  {label: 'Hover — text on field-hover-01', fg: 'text-primary', bg: 'field-hover-01', kind: 'text'},
  {label: 'Hover — text on background-hover (translucent, over background)', fg: 'text-primary', bg: 'background-hover', kind: 'text'},
  ...['01', '02', '03'].map(n => ({label: `Pressed — text on layer-active-${n}`, fg: 'text-primary', bg: `layer-active-${n}`, kind: 'text' as Kind})),
  {label: 'Pressed — text on background-active (translucent, over background)', fg: 'text-primary', bg: 'background-active', kind: 'text'},
  ...['01', '02', '03'].map(n => ({label: `Selected — text on layer-selected-${n}`, fg: 'text-primary', bg: `layer-selected-${n}`, kind: 'text' as Kind})),
  {label: 'Selected — text on background-selected (translucent, over background)', fg: 'text-primary', bg: 'background-selected', kind: 'text'},
  {label: 'Disabled — text-disabled on layer-01', fg: 'text-disabled', bg: 'layer-01', kind: 'exempt'},
  {label: 'Disabled — border-disabled on background', fg: 'border-disabled', bg: 'background', kind: 'exempt'},
  {label: 'Primary hover, Option A', fg: 'on-interactive-primary', bg: 'interactive-primary-hover', kind: 'text', opt: 'A'},
  {label: 'Primary pressed, Option A', fg: 'on-interactive-primary', bg: 'interactive-primary-active', kind: 'text', opt: 'A'},
  {label: 'Primary hover, Option B', fg: 'on-interactive-primary', bg: 'interactive-primary-hover', kind: 'text', opt: 'B'},
  {label: 'Primary pressed, Option B', fg: 'on-interactive-primary', bg: 'interactive-primary-active', kind: 'text', opt: 'B'},
  {label: 'Accent hover', fg: 'on-accent', bg: 'accent-hover', kind: 'text'},
  {label: 'Accent pressed', fg: 'on-accent', bg: 'accent-active', kind: 'text'},
  ...['background', 'layer-01', 'layer-02', 'layer-03', 'field-01'].map(s => ({label: `Focus ring on ${s}`, fg: 'focus', bg: s, kind: 'ui' as Kind})),
];

export function Accessibility() {
  const flagged = accessibilitySummary();
  return (
    <div data-testid="a11y">
      <p><strong data-testid="a11y-flagged">{flagged}</strong> surface-matrix cells are flagged (fail, or large-text only) across Option A. Flags are <strong>reported, not fixed</strong>. Thresholds: text 4.5:1, non-text 3:1; disabled is exempt; the project’s target is an owner decision.</p>
      <ul>
        <li>Translucent tokens (placeholder, disabled, background hover/active/selected) are composited over the surface they sit on, not the page.</li>
        <li>Warning yellow is identical in light and dark, so it works as an icon/border on dark and gray surfaces but not on white; text on a yellow fill must be dark.</li>
        <li>Where an existing brand tone fails, the existing-color alternative is shown (e.g. the orange-text literal in entrance.css) and labeled as needing approval to tokenize. No new brand color is proposed.</li>
      </ul>
      <h3>Text, icons, borders and focus on layer surfaces</h3>
      <SurfaceMatrix id="matrix-text" title="Neutral roles on background and layers 01–03" rows={TEXT_ROWS} />
      <h3>Control boundaries by Layer depth</h3>
      <PairTable id="matrix-boundary" title="Layer-correct border-strong against the surface the control sits on" rows={[
        {label: 'Depth 1 control on the page', fg: 'border-strong-01', bg: 'background', kind: 'ui'},
        {label: 'Depth 2 control inside a layer-01 card', fg: 'border-strong-02', bg: 'layer-01', kind: 'ui'},
        {label: 'Depth 3 control inside a layer-02 panel', fg: 'border-strong-03', bg: 'layer-02', kind: 'ui'},
        {label: 'Field fill vs its surface, depth 1 (separation, informational)', fg: 'field-01', bg: 'background', kind: 'info'},
        {label: 'Field fill vs its surface, depth 2 (informational)', fg: 'field-02', bg: 'layer-01', kind: 'info'},
        {label: 'Field fill vs its surface, depth 3 (informational)', fg: 'field-03', bg: 'layer-02', kind: 'info'},
      ]} />
      <h3>Fields: text and placeholder on field backgrounds</h3>
      <SurfaceMatrix id="matrix-field" title="Field contexts" rows={[TEXT_ROWS[0], TEXT_ROWS[3], TEXT_ROWS[2]]} surfaces={['field-01', 'field-02', 'field-03']} />
      <h3>Supporting colors on layers</h3>
      <SurfaceMatrix id="matrix-support" title="Error / warning / success / information" rows={SUPPORT_ROWS} />
      <h3>Brand accent roles</h3>
      <SurfaceMatrix id="matrix-brand" title="Existing brand tones as text, icon and border on layers" rows={BRAND_ROWS} />
      <h3>Fills and their content</h3>
      <PairTable id="matrix-fills" title="Content on fills" rows={FILL_ROWS} />
      <h3>Hover, pressed, selected, disabled and focus</h3>
      <PairTable id="matrix-states" title="Interaction states" rows={STATE_ROWS} />
    </div>
  );
}

/* ----------------------------------------------------------- exceptions */

export function ExceptionCompare() {
  return (
    <div data-testid="exceptions">
      <p className="fx-muted">Carbon layering separates surfaces by flat fills and subtle borders. Portfolio Quest’s cards and panels use hard offset shadows and per-theme fills. Proposal: keep them. Carbon tokens would drive fill, border and text only; the shadow is a preserved identity element, and its color following text-primary is a new decision.</p>
      <div className="pqc-pair">
        <section aria-label="Current Adventure tile"><h3><Badge kind="current" />Adventure tile (real CSS)</h3><AdventurePreview theme="arcade" view="carousel" />
          <p className="fx-muted">`.tile` / `.pcard` use theme tokens and hard offset shadow (e.g. box-shadow 8px 8px 0 var(--c)). Independent of light/dark.</p></section>
        <section aria-label="Current editorial card"><h3><Badge kind="current" />Editorial card recipe</h3>
          <div style={{border: '1px solid var(--color-ink)', background: 'var(--color-secondary-paper)', color: 'var(--color-ink)', boxShadow: 'var(--temp-shadow)', padding: '1rem'}}>
            <strong>.world-preview recipe</strong><p style={{margin: '.4rem 0 0'}}>1px ink border, secondary-paper fill and the --temp-shadow hard offset (real tokens; specimen of the pattern).</p></div></section>
      </div>
      <h3><Badge kind="proposed" />Carbon-layered, two treatments</h3>
      <div className="pqc-pair">
        {MODES.map(m => (
          <ModeFrame key={m} mode={m} title={`${MODE_LABEL[m]}`}>
            <div className="pqc-pair">
              <Layer title="Flat Carbon"><p>Fill + subtle border.</p><span className="pqc-help">pure Carbon layering</span></Layer>
              <LayerKeep />
            </div>
          </ModeFrame>
        ))}
      </div>
    </div>
  );
}
function LayerKeep() {
  return <Layer title="Layered + preserved shadow" keepShadow><p>Fill + border + hard shadow.</p><span className="pqc-badge" data-kind="new">shadow color needs approval</span></Layer>;
}

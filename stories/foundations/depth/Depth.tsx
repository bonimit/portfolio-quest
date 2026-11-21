import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';
import '../colors.css';
import '../carbon/carbon.css';
import './depth.css';
import {Badge, FieldDemo, Layer, LayerBindingTable, ModeFrame, Specimens} from '../carbon/CarbonColors';
import {ThemePreview} from '../ColorFoundations';
import type {Audit} from '../color-source';
import {SOURCES} from '../color-source';
import {MODE_LABEL, PROVENANCE} from '../carbon/carbon-model';
import {toHex} from '../color-math';
import {
  DEPTH, EXISTING, FLOATING_OPTIONS, MODES, SHADOW_ROLES, SURFACE_ROLES, Z_ROWS, contextVars, existingModalShadow, existingValue,
  figmaVariables, layerTokenNames, semanticValue, separation, shadowSet, shadowVars, sourcePresent, type FloatingOption, type Mode,
} from './depth-model';

const vars = (v: Record<string, string>) => v as CSSProperties;

export function DepthBanner() {
  return (
    <div className="fx-banner" role="note">
      <strong>Proposal for visual review — nothing here is implemented or approved.</strong>
      Carbon layering is the primary depth system. Layer numbers describe surface <em>nesting</em>, not z-index or elevation, and no Material 3 elevation scale is introduced.
      Shadows are selective (floating and modal only). Existing sticker, glow and game effects are preserved as exceptions. No production CSS, protected file or S0 baseline is
      changed. Carbon data: <code>@carbon/themes {PROVENANCE.packages['@carbon/themes']}</code>, <code>@carbon/styles {DEPTH.provenance.packages['@carbon/styles']}</code>.
    </div>
  );
}

/** Mode frame that also carries the proposed shadow variables. */
export function DepthFrame({mode, float = 'carbon', title, children}: {mode: Mode; float?: FloatingOption; title?: string; children: ReactNode}) {
  const style = useMemo(() => vars(shadowVars(mode, float)), [mode, float]);
  return <ModeFrame mode={mode} title={title}><div className="pqs-ctx" style={style} data-floating={float}>{children}</div></ModeFrame>;
}

export function FloatSwitcher({value, onChange}: {value: FloatingOption; onChange: (v: FloatingOption) => void}) {
  return (
    <div className="fx-switcher">
      <fieldset><legend>Dark floating treatment (named option)</legend>
        {(Object.keys(FLOATING_OPTIONS) as FloatingOption[]).map(o => <label key={o}><input type="radio" name="pqs-float" checked={value === o} onChange={() => onChange(o)} />{FLOATING_OPTIONS[o].name}</label>)}
      </fieldset>
    </div>
  );
}
export function useFloat(initial: FloatingOption) {
  const [v, setV] = useState(initial);
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) { setSeen(initial); setV(initial); }
  return [v, setV] as const;
}

/* ------------------------------------------------------------ surface layers */

export function NestedLayers({mode}: {mode: Mode}) {
  return (
    <DepthFrame mode={mode} title={`${MODE_LABEL[mode]} — nested surfaces, no shadows`}>
      <p className="pqs-note">Each container sits one nesting level inside the last. The fill step and subtle border separate them; none carries a shadow.</p>
      <Layer title="Layer 01 · section" className="pqs-flat">
        <Layer title="Layer 02 · card" className="pqs-flat">
          <FieldDemo label="Field (field-02)" />
          <Layer title="Layer 03 · nested panel" className="pqs-flat"><p>Nesting depth is hierarchy, not height.</p></Layer>
        </Layer>
      </Layer>
    </DepthFrame>
  );
}

export function NestingNotElevation({mode}: {mode: Mode}) {
  return (
    <DepthFrame mode={mode} title={`${MODE_LABEL[mode]} — same nesting depth, different stacking`}>
      <p className="pqs-note">Two Layer 01 cards side by side share one nesting level. A dropdown above a card does not change that card’s layer; stacking is a separate z-index concern.</p>
      <div className="pqc-pair"><Layer title="Layer 01 card A" className="pqs-flat"><p>A sibling.</p></Layer><Layer title="Layer 01 card B" className="pqs-flat"><p>Another sibling.</p></Layer></div>
    </DepthFrame>
  );
}

/* ----------------------------------------------------------- surface tokens */

const val = (m: Mode, name: string) => semanticValue(m, 'A', name);
const Sw = ({m, name}: {m: Mode; name: string}) => { const c = val(m, name); return <><span className="pqc-sw" style={vars({'--sw': `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`})} />{toHex(c)}</>; };

export function SurfaceTokenTable() {
  const rows = [
    ['background', 'Layer 00 · page', 'Base surface'], ['layer-01', 'Depth 1', 'Cards, sections directly on the page'], ['layer-02', 'Depth 2', 'Content nested inside a depth-1 surface'],
    ['layer-03', 'Depth 3', 'Content nested inside a depth-2 surface'], ['field-01', 'Depth 1 fields', 'Inputs on the page'], ['field-02', 'Depth 2 fields', 'Inputs inside a layer-01 surface'],
    ['field-03', 'Depth 3 fields', 'Inputs inside a layer-02 surface'], ['border-subtle-00', 'Depth 1 dividers', 'Layer-01 container border on the page'], ['border-subtle-01', 'Depth 2 dividers', 'Layer-02 container border'],
    ['border-subtle-02', 'Depth 3 dividers', 'Layer-03 container border'], ['border-strong-01', 'Depth 1 control boundary', 'Input / control outline on the page'], ['overlay', 'Scrim', 'Behind modal dialogs'],
  ];
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Surface tokens">
      <table data-testid="surface-tokens">
        <caption>Semantic surface tokens (Carbon names; values from the generated Carbon data) <Badge kind="proposed" /></caption>
        <thead><tr><th scope="col">Token</th><th scope="col">Role</th><th scope="col">Usage rule</th><th scope="col">Light</th><th scope="col">Dark</th></tr></thead>
        <tbody>{rows.map(([n, r, u]) => <tr key={n}><th scope="row"><code>{n}</code></th><td>{r}</td><td>{u}</td>{MODES.map(m => <td key={m}><Sw m={m} name={n} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function RoleTable() {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Component surface roles">
      <table data-testid="roles">
        <caption>Component surface roles and depth treatment</caption>
        <thead><tr><th scope="col">Component</th><th scope="col">Surface</th><th scope="col">Border</th><th scope="col">Shadow</th><th scope="col">Rule</th><th scope="col">Treatment</th></tr></thead>
        <tbody>{SURFACE_ROLES.map(r => (
          <tr key={r.name}><th scope="row">{r.name}</th><td><code>{r.surface}</code></td><td>{r.border}</td><td><code>{r.shadow}</code></td><td>{r.depthRule}</td>
            <td><Badge kind={r.treatment === 'carbon' ? 'proposed' : 'current'} /></td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function ShadowTokenTable({float}: {float: FloatingOption}) {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Shadow tokens">
      <table data-testid="shadow-tokens">
        <caption>Optional floating shadows — {FLOATING_OPTIONS[float].name}</caption>
        <thead><tr><th scope="col">Token</th><th scope="col">Role</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Derived from</th></tr></thead>
        <tbody>{SHADOW_ROLES.map(r => {
          const key = r.name === 'shadow-none' ? 'none' : r.name === 'shadow-floating' ? 'floating' : 'modal';
          return <tr key={r.name}><th scope="row"><code>{r.name}</code></th><td>{r.role}</td>
            <td><code>{shadowSet('light', float)[key]}</code></td><td><code>{shadowSet('dark', float)[key]}</code>{key === 'modal' && <><br />+ scrim + strong border</>}</td><td>{r.basis}</td></tr>;
        })}</tbody>
      </table>
      <p className="fx-muted">Carbon shadow token: light <code>{DEPTH.shadowToken.light}</code>, dark <code>{DEPTH.shadowToken.dark}</code>. No new shadow value was invented: geometry is Carbon’s; the modal value is the existing soft layer of <code>.guide-dialog</code> in entrance.css.</p>
    </div>
  );
}

export function StackingTable() {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Stacking order">
      <table data-testid="stacking">
        <caption>Stacking order is separate from layers: existing z-index values (live), Carbon reference, proposed semantic names (not approved)</caption>
        <thead><tr><th scope="col">Role</th><th scope="col">Existing implementation</th><th scope="col">Carbon reference</th><th scope="col">Proposed name</th></tr></thead>
        <tbody>{Z_ROWS.map(r => (
          <tr key={r.role}><th scope="row">{r.role}</th><td>{r.existing.length ? r.existing.map(x => <div key={x.where}><code>{x.value}</code> <span className="fx-muted">{x.where}</span></div>) : '—'}</td><td>{r.carbon}</td><td><code>{r.proposed}</code></td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function Architecture({float}: {float: FloatingOption}) {
  const json = useMemo(() => JSON.stringify(figmaVariables(float), null, 2), [float]);
  return (
    <div>
      <ol data-testid="architecture">
        <li><strong>Primitive colors</strong> — Carbon gray scale (+ existing brand/accents) · <em>colors foundation</em></li>
        <li><strong>Semantic surface colors</strong> — background, layer-01…03, field, border-subtle/strong, overlay · values differ by mode, names do not</li>
        <li><strong>Component surface roles</strong> — page, card, field, dropdown, popover, dialog, nav → semantic tokens (+ shadow role)</li>
        <li><strong>Optional floating shadows</strong> — shadow-none / shadow-floating / shadow-modal</li>
        <li><strong>Expressive shadow exceptions</strong> — authored CSS, intentionally outside tokens</li>
        <li><strong>Stacking order</strong> — z-index roles, independent of layer numbers and of shadows</li>
      </ol>
      <details><summary>Preview: Figma-style variables export (documentation only; not synced)</summary><pre data-testid="figma-json" style={{overflow: 'auto', maxHeight: '24rem'}}>{json}</pre></details>
    </div>
  );
}

/* ---------------------------------------------------------- floating elements */

export function FloatingSpecimens({mode, float}: {mode: Mode; float: FloatingOption}) {
  return (
    <DepthFrame mode={mode} float={float} title={`${MODE_LABEL[mode]} — floating elements`}>
      <h4>Dropdown</h4>
      <div className="pqc-pair">
        <div className="pqs-anchor"><Layer hideMeta className="pqs-flat"><div className="pqs-trigger"><span>No shadow</span><span aria-hidden="true">▾</span></div></Layer>
          <Layer hideMeta className="pqs-menu pqs-flat" testId={`menu-flat-${mode}`}><ul role="listbox" aria-label="Without shadow"><li className="pqs-item" role="option" aria-selected="false">Option one</li><li className="pqs-item is-hover" role="option" aria-selected="false">Hovered</li><li className="pqs-item" role="option" aria-selected="true">Selected</li></ul></Layer></div>
        <div className="pqs-anchor"><Layer hideMeta className="pqs-flat"><div className="pqs-trigger"><span>shadow-floating</span><span aria-hidden="true">▾</span></div></Layer>
          <Layer hideMeta className="pqs-menu pqs-floating" testId={`float-menu-${mode}`}><ul role="listbox" aria-label="With floating shadow"><li className="pqs-item" role="option" aria-selected="false">Option one</li><li className="pqs-item is-hover" role="option" aria-selected="false">Hovered</li><li className="pqs-item" role="option" aria-selected="true">Selected</li></ul></Layer></div>
      </div>
      <h4>Popover</h4>
      <Layer title="Page content (Layer 01)" className="pqs-flat">
        <p>Content the popover overlaps.</p>
        <Layer hideMeta className="pqs-popover pqs-floating" testId={`float-popover-${mode}`}><strong>Popover</strong><p>Next nesting level of the surface it overlaps, plus the optional floating shadow.</p></Layer>
      </Layer>
      <h4>Modal dialog</h4>
      <div className="pqs-scrim" aria-label="Scrim">
        <Layer title="Dialog" className="pqs-modal" testId={`modal-${mode}`}>
          <p>Scrim + layer-01 surface{mode === 'light' ? ' + existing soft shadow' : ' + strong border (no heavy black shadow)'}.</p>
          <FieldDemo label="Name" /><div className="pqc-row"><button type="button" className="pqc-btn pqc-btn--secondary">Cancel</button><button type="button" className="pqc-btn pqc-btn--primary">Confirm</button></div>
        </Layer>
      </div>
    </DepthFrame>
  );
}

/* --------------------------------------------------------------- light vs dark */

const R = ({n}: {n: number}) => <>{n.toFixed(2)}:1</>;
export function SeparationTable() {
  return (
    <div className="fx-scroll" tabIndex={0} role="region" aria-label="Surface separation">
      <table data-testid="separation">
        <caption>Measured separation of nested surfaces (WCAG ratio). Fill and subtle border are decorative (informational); control boundaries and focus rings are graded at 3:1.</caption>
        <thead><tr><th scope="col">Mode</th><th scope="col">Depth</th><th scope="col">Surface on parent</th><th scope="col">Subtle border on surface</th><th scope="col">Control boundary on its surface (3:1)</th><th scope="col">Focus ring on surface (3:1)</th></tr></thead>
        <tbody>{MODES.flatMap(m => separation(m).map(r => (
          <tr key={`${m}-${r.depth}`}><th scope="row">{m}</th><td>{r.depth}</td>
            <td><code>{r.layer}</code> on <code>{r.parent}</code> · <R n={r.fillRatio} /></td><td><R n={r.borderRatio} /></td>
            <td data-grade={r.strongRatio >= 3 ? 'pass' : 'fail'}><R n={r.strongRatio} /> <span className="fx-grade" data-grade={r.strongRatio >= 3 ? 'pass' : 'fail'}>{r.strongRatio >= 3 ? '✓ Pass' : '✕ Fail'}</span></td>
            <td data-grade={r.focusRatio >= 3 ? 'pass' : 'fail'}><R n={r.focusRatio} /> <span className="fx-grade" data-grade={r.focusRatio >= 3 ? 'pass' : 'fail'}>{r.focusRatio >= 3 ? '✓ Pass' : '✕ Fail'}</span></td></tr>
        )))}</tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------ components in context */

function ContextLayout({mode}: {mode: Mode}) {
  return (
    <DepthFrame mode={mode} title={`${MODE_LABEL[mode]}`}>
      <div className="pqs-nav">
        <strong>Portfolio</strong>
        <div className="pqs-links"><a href="#w" aria-current="page">Work</a><a href="#c">Concepts</a><a href="#a">Arcade</a></div>
        <button type="button" className="pqc-btn pqc-btn--secondary pqs-menubtn">Menu</button>
      </div>
      <div className="pqs-grid">
        {['One', 'Two', 'Three'].map(n => <Layer key={n} title={`Card ${n}`} className="pqs-flat"><p>Depth 1 card.</p><Layer hideMeta className="pqs-flat"><span className="pqs-note">Nested depth 2</span></Layer></Layer>)}
      </div>
      <Layer title="Filters form" className="pqs-flat"><div className="pqc-row"><FieldDemo label="Search" /><button type="button" className="pqc-chip" aria-pressed="true">Design</button><button type="button" className="pqc-chip">Research</button></div></Layer>
    </DepthFrame>
  );
}
export function ContextFrames({widths = [375, 768, 1024]}: {widths?: number[]}) {
  return (
    <div className="pqs-vpwrap" tabIndex={0} role="region" aria-label="Responsive frames" data-testid="frames">
      {widths.map(w => (
        <div key={w}><p className="pqs-note"><Badge kind="proposed" />{w}px frame · {w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'} — same layer hierarchy at every width</p>
          <div className="pqs-vp" style={vars({'--w': `${w}px`})}><ContextLayout mode="light" /></div></div>
      ))}
    </div>
  );
}
export function ContextBoth({float}: {float: FloatingOption}) {
  return (
    <div className="pqc-pair">
      {MODES.map(m => (
        <DepthFrame key={m} mode={m} float={float} title={`${MODE_LABEL[m]} — cards, forms, dialogs, navigation`}>
          <Specimens compact />
        </DepthFrame>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- expressive */

const CTX: Record<string, () => Record<string, string>> = {
  dropdown: () => ({'--dropdown-accent': contextVars('guide')['--guide-orange']}),
  'guide-dialog': () => contextVars('guide'),
  stage: () => contextVars('arcade'),
  'tile-hover': () => ({...contextVars('arcade'), '--c': contextVars('arcade')['--orange']}),
  'tile-island': () => contextVars('island'),
  'tile-neon': () => ({...contextVars('neon'), '--c': contextVars('neon')['--lime']}),
};

export function ExpressiveSpecimens() {
  const rows = EXISTING.map(e => ({e, v: existingValue(e)}));
  return (
    <div>
      <p className="fx-muted"><Badge kind="current" />Values below are read live from production CSS. The boxes are <strong>reconstructions</strong> that apply the exact value; the real components appear in the Adventure preview above.</p>
      <div className="pqs-sticker-grid" data-testid="stickers">
        {rows.map(({e, v}) => v && (
          <div key={e.id} className="pqs-sticker" style={vars({...(CTX[e.id]?.() ?? {}), boxShadow: v.value})} data-testid={`sticker-${e.id}`}>
            <strong>{e.label}</strong><small>{e.flavor}</small>
          </div>
        ))}
      </div>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Expressive depth exceptions">
        <table data-testid="exceptions-table">
          <caption>Expressive Depth Exceptions — preserved, kept separate from depth tokens</caption>
          <thead><tr><th scope="col">Treatment</th><th scope="col">Kind</th><th scope="col">Live value</th><th scope="col">Source</th><th scope="col">Why preserved</th></tr></thead>
          <tbody>{rows.map(({e, v}) => (
            <tr key={e.id}><th scope="row">{e.label}</th><td>{e.kind === 'expressive' ? 'Expressive' : `${e.kind} (existing, comparable to ${e.kind === 'floating' ? 'shadow-floating' : 'shadow-modal'})`}</td>
              <td><code>{v?.value ?? 'not found'}</code></td><td><code>{v ? `${v.path}:${v.line}` : '—'}</code></td><td>{e.why}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <ul>
        <li><strong>Game scene shadows</strong> are rendered by the 3D scene (lighting and shadow parameters in <code>lib/quest-preview</code>), not CSS. They are untouched and outside this system.</li>
        <li><strong>Neon glow</strong> is derived from each tile’s hue and is independent of the global light/dark layers.</li>
        <li><strong>Reduced motion:</strong> adventure.css contains a <code>prefers-reduced-motion</code> rule: {sourcePresent('adventure', 'prefers-reduced-motion') ? '✓ present' : '✕ not found'}; its animations and transitions are unchanged by this proposal.</li>
      </ul>
    </div>
  );
}

export function ExpressiveLive({audit}: {audit: Audit | null}) {
  return <ThemePreview theme="island" view="grid" audit={audit} />;
}

export function ExistingFloating() {
  const modal = existingModalShadow();
  return (
    <p className="fx-muted" data-testid="existing-modal"><Badge kind="current" />Existing soft modal shadow used for <code>shadow-modal</code> (light): <code>{modal?.css ?? 'not found'}</code> from <code>{modal ? `${modal.path}:${modal.line}` : '—'}</code>.</p>
  );
}

export {LayerBindingTable, layerTokenNames, SOURCES};

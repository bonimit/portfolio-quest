import {useEffect, useId, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import './typography.css';
import {
  ADVENTURE_FACES, EXISTING, FAMILIES, FAM_LABEL, FRAME_WIDTH, HERO_EXCEPTIONS, M3, MODES, MODE_CLASS, PRODUCTION_FACES, RESP_OPTIONS, ROLE_GROUPS, ROLE_SLOT, STEPS,
  cssFamily, existingLeading, existingTypeTokens, exceptionFor, faceFor, familyDefFor, fontFaceCss, leadFamily, nearestRole, readLive, roleLabel, roleOf, runFontCensus,
  sizeFor, splitRoles, themeMaps, tokenName, typeVars, REM,
  type FamilyDef, type FontCensus, type LiveType, type Mode, type RespOption, type Slot, type ThemeMap,
} from './typography-model';

/* ---------------------------------------------------------------- shared */

export type Kind = 'official' | 'local' | 'current' | 'preserved' | 'issue';
export const KIND_LABEL: Record<Kind, string> = {official: 'Official Material', local: 'Local proposal', current: 'Current (live CSS)', preserved: 'Preserved, not adopted', issue: 'Review issue'};
export const Tag = ({kind, children}: {kind: Kind; children?: ReactNode}) => <span className="pqt-tag" data-kind={kind}>{children ?? KIND_LABEL[kind]}</span>;

/** @font-face rules derived from the production font files (no new assets). */
export function FontStyles() { return <style data-testid="pqt-fontfaces">{fontFaceCss()}</style>; }
export const Surface = ({children, style, testId}: {children: ReactNode; style?: CSSProperties; testId?: string}) => (
  <div className="pqt" style={style} data-testid={testId}><FontStyles />{children}</div>
);

export function useCensus(): FontCensus | null {
  const [c, setC] = useState<FontCensus | null>(null);
  useEffect(() => { let live = true; runFontCensus().then(x => live && setC(x)); return () => { live = false; }; }, []);
  return c;
}
export function useLive(list: typeof EXISTING): LiveType[] | null {
  const [c, setC] = useState<LiveType[] | null>(null);
  useEffect(() => { let live = true; readLive(list).then(x => live && setC(x)); return () => { live = false; }; }, [list]);
  return c;
}
export function useOption(initial: RespOption) {
  const [opt, setOpt] = useState<RespOption>(initial);
  const [prev, setPrev] = useState(initial);
  if (prev !== initial) { setPrev(initial); setOpt(initial); }
  return [opt, setOpt] as const;
}
export function OptionSwitcher({opt, onChange}: {opt: RespOption; onChange: (o: RespOption) => void}) {
  const name = useId();
  return (
    <fieldset className="pqt-box" data-testid="option-switcher">
      <legend>Responsive proposal <Tag kind="local" /></legend>
      <div className="pqt-row">
        {(['P', 'Q'] as RespOption[]).map(o => (
          <label key={o}><input type="radio" name={name} checked={opt === o} onChange={() => onChange(o)} /> {RESP_OPTIONS[o].name}</label>
        ))}
      </div>
      <p className="pqt-muted">{RESP_OPTIONS[opt].summary}</p>
    </fieldset>
  );
}

export function Banner() {
  return (
    <div className="pqt-box" role="note">
      <p><Tag kind="official" /> Sizes and line heights of the Material 3 type scale, generated from <code>@material/web {M3.provenance.packages['@material/web']}</code> and cross-checked with the rendered m3.material.io page for all {M3.roles.length} roles.
        {' '}<Tag kind="local" /> Every desktop, tablet and mobile value, role-to-family mapping and token name. Material publishes one scale and no per-window-class sizes.
        {' '}<Tag kind="current" /> Read live from production CSS. <Tag kind="preserved" /> Material font, weight and tracking are reference only and are not adopted.</p>
      <p className="pqt-muted">Proposal only. Nothing here changes production CSS, fonts, weights, line heights, tracking or hero treatments.</p>
    </div>
  );
}

const sampleFor: Record<string, string> = {
  display: 'Portfolio stories', headline: 'A considered reading rhythm', title: 'Wayfinding for a campus app', body: 'Body copy explains the project in plain sentences and should stay comfortable to read at any size.', label: 'Selected work',
};
const lineFor = (group: string) => (group === 'display' || group === 'headline' ? existingLeading('heading') : existingLeading('body'));
const px = (n: number) => `${n}px`;
const remStr = (n: number) => `${Math.round((n / REM) * 10000) / 10000}rem`;

/* -------------------------------------------------------------- families */

type FontCheck = {family: string; weight: number; ok: boolean};
export function useFontChecks(): FontCheck[] | null {
  const [res, setRes] = useState<FontCheck[] | null>(null);
  useEffect(() => {
    let live = true;
    (async () => {
      const out: FontCheck[] = [];
      for (const d of FAMILIES) {
        const f = faceFor(d);
        if (!f) continue;
        for (const w of d.weights.slice(0, 1).concat(d.weights.slice(1))) {
          try { await document.fonts.load(`${w} 16px "${f.family}"`, 'AaBb'); } catch { /* reported as not loaded */ }
          out.push({family: f.family, weight: w, ok: document.fonts.check(`${w} 16px "${f.family}"`, 'AaBb')});
        }
      }
      if (live) setRes(out);
    })();
    return () => { live = false; };
  }, []);
  return res;
}

export function FamilyCard({def, census, checks}: {def: FamilyDef; census: FontCensus | null; checks: FontCheck[] | null}) {
  const face = faceFor(def);
  const fam = cssFamily(def);
  const stack = def.id === 'arial' ? 'Arial, Helvetica, sans-serif' : `"${fam}"`;
  const styleVars = {'--pqt-f': stack} as CSSProperties;
  const rows = def.id === 'arial' ? 0 : null;
  const use = census ? ({instrument: census.familyUse.instrument, newsreader: census.familyUse.newsreader, anton: census.familyUse.anton, arial: census.familyUse.arial} as Record<string, number>)[def.id] : null;
  const loaded = checks?.filter(c => c.family === fam);
  return (
    <article className="pqt-box" style={styleVars} data-testid={`family-${def.id}`}>
      <p><Tag kind="current">{def.kind}</Tag><Tag kind="local">{def.proposedToken}</Tag></p>
      <h3 className="pqt-fam-name" data-caps={def.id === 'anton' ? 'true' : undefined} style={def.id === 'anton' ? {textTransform: 'uppercase'} : undefined}>{def.name}</h3>
      <p className="pqt-fam-sample" style={def.id === 'anton' ? {textTransform: 'uppercase'} : undefined}>Portfolio Quest: hiring managers read case studies in minutes. 0123456789</p>
      <div className="pqt-fam-weights" aria-label={`${def.name} declared weights`}>
        {def.weights.map(w => <span key={w} style={{fontWeight: w}}>{w} · Aa Bb Cc Handgloves</span>)}
      </div>
      <p className="pqt-muted">{def.purpose}</p>
      <p className="pqt-muted">Current token: <code>{def.token}</code>{face ? <> · source: <code>{face.src}</code> · declared weights: <code>{face.weights}</code> · from <code>{face.origin}</code></> : <> · system font, no asset</>}</p>
      {use !== null && use !== undefined && <p className="pqt-muted">Used in <strong>{use}</strong> CSS rules via this token (measured, excludes design-audit tooling).</p>}
      {loaded && loaded.length > 0 && <p className="pqt-muted" data-testid={`loaded-${def.id}`}>Load check: {loaded.map(l => `${l.weight} ${l.ok ? 'loaded' : 'NOT loaded'}`).join(', ')}</p>}
      {rows === 0 && <p><Tag kind="issue" /> Arial is the family of any text that sets none. Decide whether it is Primary-by-default or a fallback only.</p>}
    </article>
  );
}

export function FontFamilies() {
  const census = useCensus();
  const checks = useFontChecks();
  const order: FamilyDef['kind'][] = ['Primary', 'Secondary', 'Display', 'Theme', 'Fallback'];
  return (
    <>
      {order.map(k => (
        <section key={k}>
          <h2>{k === 'Theme' ? 'Theme-specific fonts' : `${k} font`}</h2>
          <div className="pqt-grid">{FAMILIES.filter(f => f.kind === k).map(f => <FamilyCard key={f.id} def={f} census={census} checks={checks} />)}</div>
        </section>
      ))}
      <p className="pqt-muted">Naming (Primary, Secondary, Display) is a proposal derived from usage counts. Nothing is renamed in production and no font is added or replaced.</p>
    </>
  );
}

/* ----------------------------------------------------------- scale tables */

const themeStack = (slot: Slot, theme: ThemeMap | undefined) => theme?.family[slot] ?? 'inherit';
export function slotFamilyVar(slot: Slot, theme: ThemeMap | undefined): string { return themeStack(slot, theme); }

export function RoleSpecimen({roleKey, mode, opt, theme, text}: {roleKey: string; mode: Mode; opt: RespOption; theme?: ThemeMap; text?: string}) {
  const r = M3.roles.find(x => x.role === roleKey)!;
  const slot = ROLE_SLOT.find(s => s.role === r.group)!.slot;
  const s = sizeFor(roleKey, mode, opt);
  const style = {'--pqt-f': slotFamilyVar(slot, theme), '--pqt-size': remStr(s.px), '--pqt-leading': String(lineFor(r.group))} as CSSProperties;
  const caps = theme?.id === 'editorial' && slot === 'display';
  return <p className="pqt-role" style={style} data-caps={caps ? 'true' : undefined} data-testid={`spec-${roleKey}-${mode}`}>{text ?? sampleFor[r.group]}</p>;
}

export function ScaleTable({mode, opt}: {mode: Mode; opt: RespOption}) {
  const editorial = themeMaps().find(t => t.id === 'editorial');
  return (
    <section>
      <p className="pqt-muted" data-testid={`scale-note-${mode}`}>{mode === 'desktop' ? 'Desktop' : mode === 'tablet' ? 'Tablet' : 'Mobile'} · window class: {MODE_CLASS[mode]}. Family shown is the Editorial slot; see Typography by Theme for the others. Line height in the specimen is the existing site leading; Material’s line height is listed as reference only.</p>
      <div className="pqt-scroll">
        <table>
          <thead><tr><th>Role</th><th>Token</th><th>Size</th><th>Material line height (reference)</th><th>Family slot</th><th>Basis</th><th>Specimen</th></tr></thead>
          <tbody>
            {M3.roles.map(r => {
              const s = sizeFor(r.role, mode, opt);
              const slot = ROLE_SLOT.find(x => x.role === r.group)!.slot;
              const split = splitRoles(opt).some(x => x.role === r.role);
              return (
                <tr key={r.role} data-testid={`row-${r.role}-${mode}`}>
                  <td>{roleLabel(r)}</td>
                  <td><code>{tokenName(r.role, split ? mode : null)}</code></td>
                  <td><strong data-testid={`px-${r.role}-${mode}`}>{px(s.px)}</strong> <span className="pqt-muted">({remStr(s.px)})</span></td>
                  <td>{px(s.lineHeightPx)}</td>
                  <td>{slot}</td>
                  <td>{s.changed ? <Tag kind="local">Adapted from {px(r.sizePx)}</Tag> : <Tag kind="official">Material size</Tag>}</td>
                  <td><RoleSpecimen roleKey={r.role} mode={mode} opt={opt} theme={editorial} text={r.group === 'display' ? 'Portfolio' : undefined} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ desktop vs mobile */

export function RoleComparison({opt}: {opt: RespOption}) {
  return (
    <div className="pqt-scroll">
      <table data-testid="comparison">
        <thead><tr><th>Role</th>{MODES.map(m => <th key={m}>{m[0].toUpperCase() + m.slice(1)}</th>)}<th>Needs split tokens</th></tr></thead>
        <tbody>
          {M3.roles.map(r => {
            const vals = MODES.map(m => sizeFor(r.role, m, opt));
            const split = vals.some(v => v.px !== r.sizePx);
            return (
              <tr key={r.role} data-testid={`cmp-${r.role}`}>
                <td>{roleLabel(r)}</td>
                {vals.map((v, i) => <td key={MODES[i]} data-testid={`cmp-${r.role}-${MODES[i]}`}>{px(v.px)} {v.changed ? <Tag kind="local">adapted</Tag> : <Tag kind="official" />}</td>)}
                <td>{split ? 'yes' : 'no, single token'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ResponsiveFrames({opt}: {opt: RespOption}) {
  const editorial = themeMaps().find(t => t.id === 'editorial');
  return (
    <div className="pqt-frames" data-testid="frames">
      {MODES.map(m => (
        <div key={m} className="pqt-scroll">
          <div className="pqt-frame" style={{'--pqt-frame': px(FRAME_WIDTH[m]), ...typeVars(m, opt)} as CSSProperties} data-testid={`frame-${m}`}>
            <p className="pqt-frame-label">{m} · {FRAME_WIDTH[m]}px frame · {MODE_CLASS[m]}</p>
            <RoleSpecimen roleKey="display-large" mode={m} opt={opt} theme={editorial} text="Selected work" />
            <RoleSpecimen roleKey="headline-large" mode={m} opt={opt} theme={editorial} text="A considered reading rhythm for long case studies" />
            <RoleSpecimen roleKey="title-large" mode={m} opt={opt} theme={editorial} text="Wayfinding for a campus app" />
            <RoleSpecimen roleKey="body-large" mode={m} opt={opt} theme={editorial} text="Body copy keeps the single Material size on every window class so the line length stays readable. Roles only change where a size change helps." />
            <RoleSpecimen roleKey="label-large" mode={m} opt={opt} theme={editorial} text="Label · UX research · 2024" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- by theme */

export function ThemeFamilyTable() {
  const maps = themeMaps();
  return (
    <div className="pqt-scroll">
      <table data-testid="theme-table">
        <thead><tr><th>Theme</th><th>Primary slot</th><th>Secondary slot</th><th>Display slot</th></tr></thead>
        <tbody>
          {maps.map(t => (
            <tr key={t.id} data-testid={`theme-${t.id}`}>
              <th scope="row">{t.label}<br /><code>{t.selector}</code></th>
              {(['primary', 'secondary', 'display'] as Slot[]).map(s => {
                const d = familyDefFor(t.family[s]);
                return (
                  <td key={s} data-testid={`theme-${t.id}-${s}`}>
                    <strong>{d?.name ?? leadFamily(t.family[s])}</strong><br />
                    <code>{t.family[s]}</code><br /><span className="pqt-muted">{t.from[s]}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="pqt-muted">Resolved from the real cascade, including the next/font override at the end of <code>app/world/adventure.css</code> that replaces the earlier per-theme <code>--display / --sans / --serif</code> declarations.</p>
    </div>
  );
}

export function ThemePreview({theme, opt}: {theme: ThemeMap; opt: RespOption}) {
  const mode: Mode = 'desktop';
  return (
    <article className="pqt-theme" data-testid={`preview-${theme.id}`}>
      <h3>{theme.label}</h3>
      {ROLE_GROUPS.map(g => {
        const key = `${g}-${g === 'display' || g === 'headline' ? 'medium' : 'medium'}`;
        const slot = ROLE_SLOT.find(r => r.role === g)!.slot;
        return (
          <div key={g}>
            <p className="pqt-frame-label">{roleLabel({group: g, step: 'medium'})} · slot: {slot} · {px(sizeFor(key, mode, opt).px)}</p>
            <RoleSpecimen roleKey={key} mode={mode} opt={opt} theme={theme} text={g === 'display' ? 'Portfolio' : undefined} />
          </div>
        );
      })}
    </article>
  );
}

export function ThemeSlotMap() {
  return (
    <div className="pqt-scroll">
      <table data-testid="slot-map">
        <thead><tr><th>Role</th><th>Family slot</th><th>Note</th></tr></thead>
        <tbody>{ROLE_SLOT.map(s => <tr key={s.role}><td>{s.role}</td><td>{s.slot}</td><td>{s.note}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------- existing vs proposed */

const fmtRange = (r: LiveType['range']) => !r ? 'n/a' : r.dynamic ? 'dynamic' : r.min === r.max ? px(Math.round(r.min! * 100) / 100) : `${px(Math.round(r.min! * 10) / 10)} to ${px(Math.round(r.max! * 10) / 10)}`;
export function ExistingTable() {
  const live = useLive(EXISTING);
  if (!live) return <p>Reading production CSS…</p>;
  return (
    <div className="pqt-scroll">
      <table data-testid="existing-table">
        <thead><tr><th>Context</th><th>Element</th><th>Live size (declared)</th><th>Resolved</th><th>Proposed Material role</th><th>Material size</th><th>Proposed minus current</th><th>Family · weight · tracking</th><th>Source</th></tr></thead>
        <tbody>
          {live.map(l => {
            const r = M3.roles.find(x => x.role === l.item.role)!;
            const cur = l.range && !l.range.dynamic && l.range.min === l.range.max ? l.range.min : null;
            const diff = cur === null ? null : Math.round((r.sizePx - cur) * 100) / 100;
            return (
              <tr key={l.item.selector + l.item.label} data-testid={`ex-${l.item.selector}`}>
                <td>{l.item.context}</td>
                <td>{l.item.label}</td>
                <td>{l.size ? <code>{l.size}</code> : 'not declared (inherits)'}</td>
                <td data-testid={`ex-cur-${l.item.selector}`}>{fmtRange(l.range)}</td>
                <td><Tag kind="local">{roleLabel(r)}</Tag></td>
                <td>{px(r.sizePx)}</td>
                <td className="pqt-delta" data-flag={diff !== null && Math.abs(diff) > 2}>{diff === null ? 'varies (clamp)' : `${diff > 0 ? '+' : ''}${diff}px`}</td>
                <td>{l.item.family === 'literal' ? 'inherits (no family set in this rule)' : FAM_LABEL[l.item.family]}{l.family ? <><br /><code>{l.family}</code></> : null}{l.weight ? <> · {l.weight}</> : null}{l.tracking ? <> · {l.tracking}</> : null}{l.transform ? <> · {l.transform}</> : null}</td>
                <td><code>{l.item.file}:{l.line ?? '?'}</code></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ContextSamples() {
  const live = useLive(EXISTING);
  const maps = themeMaps();
  if (!live) return null;
  return (
    <div className="pqt-grid">
      {live.filter(l => l.size && l.range && !l.range.dynamic).map(l => {
        const r = M3.roles.find(x => x.role === l.item.role)!;
        const advent = l.item.family.startsWith('adventure');
        const theme = maps.find(t => t.id === (l.item.selector.includes('A2') ? 'neon' : advent ? 'island' : 'editorial'));
        const slot: Slot = l.item.family === 'adventure-display' || l.item.family === 'anton' ? 'display' : l.item.family === 'newsreader' || l.item.family === 'adventure-serif' ? 'secondary' : 'primary';
        const fam = l.item.family === 'arial' || l.item.family === 'literal' ? 'Arial, Helvetica, sans-serif' : slotFamilyVar(slot, theme);
        const caps = l.item.family === 'anton' || l.item.family === 'adventure-display';
        const a = {'--pqt-f': fam, '--pqt-size': l.size!, '--pqt-leading': String(lineFor(r.group))} as CSSProperties;
        const b = {'--pqt-f': fam, '--pqt-size': remStr(r.sizePx), '--pqt-leading': String(lineFor(r.group))} as CSSProperties;
        return (
          <article key={l.item.selector + l.item.label} className="pqt-box" data-testid={`ctx-${l.item.selector}`}>
            <p className="pqt-frame-label">{l.item.context} · {l.item.label}</p>
            <p><Tag kind="current">Current {l.size}</Tag></p>
            <p className="pqt-role" style={a} data-caps={caps ? 'true' : undefined}>{l.item.sample}</p>
            <p><Tag kind="local">Proposed {roleLabel(r)} · {px(r.sizePx)}</Tag></p>
            <p className="pqt-role" style={b} data-caps={caps ? 'true' : undefined}>{l.item.sample}</p>
          </article>
        );
      })}
    </div>
  );
}

export function HeroExceptions() {
  const live = useLive(HERO_EXCEPTIONS);
  if (!live) return null;
  return (
    <div className="pqt-scroll">
      <table data-testid="hero-table">
        <thead><tr><th>Hero / display</th><th>Declared size</th><th>Resolved</th><th>Material Display Large</th><th>Treatment</th><th>Source</th></tr></thead>
        <tbody>
          {live.map(l => (
            <tr key={l.item.selector}>
              <td>{l.item.label}</td>
              <td>{l.size ? <code>{l.size}</code> : 'n/a'}</td>
              <td>{fmtRange(l.range)}</td>
              <td>{px(roleOf('display', 'large').sizePx)}</td>
              <td><Tag kind="preserved" /> {l.weight ?? ''} {l.tracking ? `· tracking ${l.tracking}` : ''} {l.transform ? `· ${l.transform}` : ''}</td>
              <td><code>{l.item.file}:{l.line ?? '?'}</code> · {exceptionFor(l.item.file) ?? 'not classified'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TypeTokenTable() {
  const toks = existingTypeTokens();
  return (
    <div className="pqt-scroll">
      <table data-testid="temp-type">
        <thead><tr><th>Existing token</th><th>Value</th><th>Resolved</th><th>Nearest Material size</th><th>On the Material scale?</th></tr></thead>
        <tbody>
          {toks.map(t => {
            const v = t.range.min;
            const exact = v !== null && t.range.min === t.range.max && M3.roles.some(r => r.sizePx === v);
            const n = v !== null ? nearestRole(v) : null;
            return (
              <tr key={t.name} data-testid={`tok-${t.name}`}>
                <td><code>{t.name}</code></td><td><code>{t.value}</code></td><td>{fmtRange(t.range)}</td>
                <td>{n ? (exact ? M3.roles.filter(r => r.sizePx === n.sizePx).map(roleLabel).join(', ') : `${roleLabel(n)} · ${px(n.sizePx)}`) + (exact ? ` · ${px(n.sizePx)}` : '') : 'n/a'}</td>
                <td>{t.range.dynamic ? 'fluid (clamp)' : exact ? 'yes' : 'no'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------------------------------- token architecture */

export const FAMILY_TOKENS = FAMILIES.map(f => ({name: f.proposedToken, current: f.token, family: f.name, kind: f.kind}));
export function tokenJson(opt: RespOption) {
  const split = new Set(splitRoles(opt).map(r => r.role));
  const type: Record<string, unknown> = {};
  for (const r of M3.roles) {
    if (split.has(r.role)) for (const m of MODES) type[tokenName(r.role, m)] = {fontSize: remStr(sizeFor(r.role, m, opt).px), basis: sizeFor(r.role, m, opt).changed ? 'local' : 'official'};
    else type[tokenName(r.role, null)] = {fontSize: remStr(r.sizePx), basis: 'official'};
  }
  return {
    font: Object.fromEntries(FAMILIES.map(f => [f.proposedToken, {resolvesTo: f.name, currentToken: f.token}])),
    type,
    note: 'Size only. Weight, line height, tracking and capitalization remain on the existing styles. Roles map to a font slot per theme.',
  };
}
export function TokenTables({opt}: {opt: RespOption}) {
  const split = splitRoles(opt);
  const maps = themeMaps();
  const names = new Set<string>();
  const dup: string[] = [];
  for (const t of Object.keys(tokenJson(opt).type)) { if (names.has(t)) dup.push(t); names.add(t); }
  return (
    <>
      <h2>Font-family tokens (no sizes)</h2>
      <div className="pqt-scroll"><table data-testid="font-tokens">
        <thead><tr><th>Proposed token</th><th>Resolves to</th><th>Current token</th>{maps.map(t => <th key={t.id}>{t.label}</th>)}</tr></thead>
        <tbody>{FAMILY_TOKENS.map(t => (
          <tr key={t.name}><td><code>{t.name}</code></td><td>{t.family} ({t.kind})</td><td><code>{t.current}</code></td>
            {maps.map(m => <td key={m.id}>{(['primary', 'secondary', 'display'] as Slot[]).some(s => familyDefFor(m.family[s])?.proposedToken === t.name) ? 'used' : ''}</td>)}</tr>
        ))}</tbody>
      </table></div>
      <h2>Semantic font slots by theme (theme mapping selects the family, never the hierarchy)</h2>
      <div className="pqt-scroll"><table>
        <thead><tr><th>Slot token</th>{maps.map(t => <th key={t.id}>{t.label}</th>)}</tr></thead>
        <tbody>{(['primary', 'secondary', 'display'] as Slot[]).map(s => (
          <tr key={s}><td><code>font-slot-{s}</code></td>{maps.map(m => <td key={m.id}>{familyDefFor(m.family[s])?.proposedToken ?? leadFamily(m.family[s])}</td>)}</tr>
        ))}</tbody>
      </table></div>
      <h2>Type-size tokens ({M3.roles.length} roles; {split.length} need per-mode values in this option)</h2>
      <div className="pqt-scroll"><table data-testid="size-tokens">
        <thead><tr><th>Token</th><th>Size</th><th>Basis</th></tr></thead>
        <tbody>{Object.entries(tokenJson(opt).type).map(([k, v]) => (
          <tr key={k} data-testid={`tok-${k}`}><td><code>{k}</code></td><td>{(v as {fontSize: string}).fontSize}</td><td>{(v as {basis: string}).basis === 'official' ? <Tag kind="official" /> : <Tag kind="local" />}</td></tr>
        ))}</tbody>
      </table></div>
      <p className="pqt-muted" data-testid="dup-note">Duplicate token names: {dup.length ? dup.join(', ') : 'none'}. Token names are unique per size, so one value is never defined twice.</p>
      <h2>Machine-readable preview (for React and Figma later)</h2>
      <pre className="pqt-box pqt-scroll" data-testid="token-json"><code>{JSON.stringify(tokenJson(opt), null, 2)}</code></pre>
    </>
  );
}

/* --------------------------------------------------------------- review issues */

export function ReviewIssues() {
  const c = useCensus();
  const checks = useFontChecks();
  if (!c) return <p>Reading production CSS…</p>;
  const synth = c.weightFindings.filter(f => f.kind === 'synthesized-bold');
  const near = c.weightFindings.filter(f => f.kind === 'nearest-weight');
  return (
    <>
      <p data-testid="census-line">Scanned <strong>{c.declarations}</strong> rules that set a family, weight or size in <strong>{c.files}</strong> CSS files (app/** and components/**, excluding the untracked <code>app/design-audit/**</code> tooling and scene-review). Static analysis: a weight set on an element whose family is inherited from an ancestor cannot be resolved statically ({c.weightsInherited} such rules are not judged).</p>
      <h2>Synthesized bold <Tag kind="issue" /></h2>
      <p className="pqt-muted">A weight of 600 or more requested on a family whose files stop below 600 makes the browser fake bold. Separate review issue; not changed.</p>
      <FindingTable rows={synth} id="synth" />
      <h2>Weight not provided by the loaded files (nearest weight is used)</h2>
      <FindingTable rows={near} id="nearest" />
      <h2>Font loading in Storybook</h2>
      <table data-testid="load-table"><thead><tr><th>Family (alias)</th><th>Weight</th><th>Status</th></tr></thead>
        <tbody>{(checks ?? []).map(k => <tr key={k.family + k.weight}><td>{k.family}</td><td>{k.weight}</td><td>{k.ok ? 'loaded' : 'not loaded'}</td></tr>)}</tbody></table>
      <h2>Glyph coverage and assets <Tag kind="issue" /></h2>
      <ul>
        <li>Instrument Sans and Newsreader load <code>latin.woff2</code> subsets. Characters outside Latin render in a fallback font. Coverage needs an owner check against real content (for example accented names or symbols).</li>
        <li>Press Start 2P and IBM Plex Mono load with <code>preload:false</code>; first paint may swap.</li>
        <li>Newsreader appears in <code>page.tsx</code> without a declared weight; the landing CSS declares 300 to 400 for the same file.</li>
      </ul>
      <h2>Sizes outside the Material range</h2>
      <p data-testid="below-floor">Below Label Small ({M3.roles.find(r => r.role === 'label-small')!.sizePx}px): <strong>{c.belowFloor.length}</strong> rules. Above Display Large ({roleOf('display', 'large').sizePx}px) at the largest clamp value: <strong>{c.aboveDisplay.length}</strong> rules. Fixed-size declarations on the official scale: <strong>{c.onScale}</strong>; off the scale: <strong>{c.offScale}</strong>; fluid or dynamic: <strong>{c.dynamic}</strong>.</p>
      <div className="pqt-scroll"><table data-testid="below-table">
        <thead><tr><th>Selector</th><th>Size</th><th>Source</th><th>Exception class</th></tr></thead>
        <tbody>{c.belowFloor.slice(0, 40).map(s => <tr key={s.file + s.line + s.selector}><td><code>{s.selector}</code></td><td>{s.value}</td><td><code>{s.file}:{s.line}</code></td><td>{exceptionFor(s.file) ?? 'requires review'}</td></tr>)}</tbody>
      </table></div>
      {c.belowFloor.length > 40 && <p className="pqt-muted">Showing 40 of {c.belowFloor.length}.</p>}
    </>
  );
}
function FindingTable({rows, id}: {rows: FontCensus['weightFindings']; id: string}) {
  if (!rows.length) return <p data-testid={`${id}-none`}>None found by the static scan.</p>;
  return (
    <div className="pqt-scroll"><table data-testid={`${id}-table`}>
      <thead><tr><th>Selector</th><th>Family · theme</th><th>Requested</th><th>Provided</th><th>Source</th><th>Exception class</th></tr></thead>
      <tbody>{rows.map(f => (
        <tr key={f.file + f.line + f.selector + f.theme + f.family}>
          <td><code>{f.selector}</code></td><td>{f.family} · {f.theme}</td><td>{f.requested}{f.implicit ? ' (heading default)' : ''}</td><td>{f.provided.join(', ')}</td>
          <td><code>{f.file}:{f.line}</code></td><td>{exceptionFor(f.file) ?? 'requires review'}</td>
        </tr>
      ))}</tbody>
    </table></div>
  );
}

export const ProductionFaceList = () => (
  <ul>{[...PRODUCTION_FACES, ...ADVENTURE_FACES].map(f => <li key={f.family}><code>{f.family}</code> · {f.weights} · <code>{f.src}</code> · {f.origin}</li>)}</ul>
);
export {STEPS, ROLE_GROUPS};

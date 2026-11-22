import {useMemo} from 'react';
import type {CSSProperties} from 'react';
import {Layer, ModeFrame} from '../carbon/CarbonColors';
import {MODES, MODE_LABEL, type Mode} from '../carbon/carbon-model';
import {radiusVars} from '../shape/shape-model';
import {Legend, Page, Tag} from '../overview/ui';
import {CHECKS, CHIP_HEIGHT, OPTION_A, RULES, TARGETS, contrastEvidence, sc, scLabel, type PairResult} from './accessibility-model';

export const A11yPage = ({title, children}: {title: string; children: React.ReactNode}) => <Page title={title} testId="a11y-page"><Legend />{children}</Page>;

export function Disclaimer() {
  return (
    <div className="pqv-box" role="note" data-testid="a11y-disclaimer">
      <p><strong>This is guidance, not a conformance claim.</strong> It records what WCAG 2.2 says, what our foundations measure, and how we adapt both. Automated checks cannot establish conformance, and the manual checks listed under Verification Status have not been run.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ rules */

export function RulesTable() {
  const areas = [...new Set(RULES.map(r => r.area))];
  return (
    <section style={{display: 'grid', gap: '1.5rem'}}>
      {areas.map(area => (
        <div key={area} data-testid={`area-${area}`}>
          <h2>{area}</h2>
          <div className="pqv-scroll"><table>
            <thead><tr><th scope="col">Rule</th><th scope="col">Official text</th><th scope="col">Our adaptation</th><th scope="col">Applies to</th></tr></thead>
            <tbody>{RULES.filter(r => r.area === area).map(r => (
              <tr key={r.id} data-testid={`rule-${r.id}`}>
                <td>{r.rule}{r.material ? <p><Tag kind="material" /> {r.material}</p> : null}</td>
                <td>{r.official ? r.official.map(id => <div key={id}><Tag kind="official" /> <a href={sc(id).url}>{scLabel(id)}</a><br /><span className="pqv-muted">{sc(id).text.slice(0, 200)}{sc(id).text.length > 200 ? '…' : ''}</span></div>) : <span className="pqv-muted">None (not a WCAG value)</span>}</td>
                <td><Tag kind="local" /> {r.local}</td>
                <td>{r.applies}</td>
              </tr>))}</tbody>
          </table></div>
        </div>
      ))}
    </section>
  );
}

/* --------------------------------------------------------------- contrast */

const gradeText = (r: PairResult) => (r.result.grade === 'pass' ? 'Pass' : r.result.grade === 'large-only' ? 'Large text only' : r.result.grade === 'fail' ? 'Fail' : String(r.result.grade));
export function ContrastEvidence() {
  const data = useMemo(() => MODES.map(m => ({mode: m, rows: contrastEvidence(m)})), []);
  return (
    <section style={{display: 'grid', gap: '1rem'}}>
      <p>Measured from the Carbon color model with primary action <strong>{OPTION_A}</strong>, in Carbon White (light) and Gray 100 (dark). &ldquo;Required&rdquo; is the WCAG minimum for that kind of pair (<a href={sc('contrast-minimum').url}>{scLabel('contrast-minimum')}</a>; <a href={sc('non-text-contrast').url}>{scLabel('non-text-contrast')}</a>). Grades are written in words, not only color.</p>
      <div className="pqv-scroll"><table data-testid="contrast-table">
        <thead><tr><th scope="col">Pair</th><th scope="col">Required</th>{MODES.map(m => <th scope="col" key={m}>{MODE_LABEL[m]}</th>)}</tr></thead>
        <tbody>{data[0].rows.map((row, i) => (
          <tr key={row.label} data-testid={`pair-${i}`}>
            <th scope="row">{row.label}{row.open ? <><br /><Tag kind="open" /> <span className="pqv-muted">{row.open}</span></> : null}</th>
            <td>{row.need}</td>
            {data.map(d => { const r = d.rows[i]; return <td key={d.mode} data-testid={`pair-${i}-${d.mode}`}><strong>{r.result.ratio.toFixed(2)}:1</strong> · {gradeText(r)}</td>; })}
          </tr>))}</tbody>
      </table></div>
    </section>
  );
}

/* ----------------------------------------------------------- touch targets */

export function TouchTargets() {
  return (
    <section style={{display: 'grid', gap: '1rem'}}>
      <p>Boxes are drawn at their real CSS pixel size. The three minimums are different kinds of source, and <Tag kind="open" /> <strong>which one this project uses is not decided</strong> (it is an open item in Spacing and Icons).</p>
      <div className="pqv-row" style={{alignItems: 'flex-end'}} data-testid="target-row">
        {TARGETS.map(t => <figure key={t.px} className="pqv-card" style={{margin: 0}}><div className="pqv-box-size" style={{'--pqv-s': `${t.px}px`} as CSSProperties} data-testid={`target-${t.px}`}>{t.px}</div><figcaption><Tag kind={t.basis} /> {t.label}</figcaption></figure>)}
      </div>
      <p>A Material chip is {CHIP_HEIGHT}px tall. It meets the {TARGETS[0].px}px minimum but is below {TARGETS[1].px}px and {TARGETS[2].px}px unless its hit area is padded.</p>
      <div className="pqv-row" style={{alignItems: 'center'}}>
        <div className="pqv-box-size" style={{'--pqv-s': `${CHIP_HEIGHT}px`, width: '6rem', borderRadius: '8px'} as CSSProperties} data-testid="target-chip">chip {CHIP_HEIGHT}</div>
        <div className="pqv-box-size" style={{'--pqv-s': `${TARGETS[2].px}px`, width: '6rem', borderStyle: 'dashed', borderRadius: '8px'} as CSSProperties}>padded to {TARGETS[2].px}</div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- focus */

export function FocusRings() {
  return (
    <section style={{display: 'grid', gap: '1rem'}}>
      <p>The focus ring uses the <code>--pqc-focus</code> token with a 2px outline and an offset, so it is not clipped by pill and rounded corners (<a href={sc('focus-visible').url}>{scLabel('focus-visible')}</a>). Rings are forced on here so you can compare them; the ring color choice (existing ink or paper, or Carbon blue) is <Tag kind="open" />.</p>
      <div className="pqv-cmp" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))'}}>
        {MODES.map(m => <ModeFrame key={m} mode={m} title={MODE_LABEL[m]}><Ring mode={m} /></ModeFrame>)}
      </div>
    </section>
  );
}
function Ring({mode}: {mode: Mode}) {
  const vars = {...radiusVars('M'), '--pqv-ring': 'var(--pqc-focus)'} as CSSProperties;
  return (
    <Layer hideMeta title="Focus ring follows each shape">
      <div className="pqv-row" style={{...vars, padding: '.75rem', gap: '1.25rem'}} data-testid={`ring-${mode}`}>
        <button type="button" className="pqv-spec-btn pqv-ring" style={{minHeight: '2.5rem', padding: '0 1rem', border: 0, borderRadius: 'var(--pqr-button)', background: 'var(--pqc-interactive-primary)', color: 'var(--pqc-on-interactive-primary)'}} data-testid={`ring-btn-${mode}`}>Pill button</button>
        <button type="button" className="pqv-ring" style={{minHeight: '2rem', padding: '0 .75rem', border: '1px solid var(--pqc-border-strong)', borderRadius: 'var(--pqr-chip)', background: 'transparent', color: 'var(--pqc-text-primary)'}} data-testid={`ring-chip-${mode}`}>8px chip</button>
        <input className="pqv-ring" aria-label={`Field with ring ${mode}`} placeholder="4px field" style={{minHeight: '2.5rem', padding: '0 .75rem', border: '1px solid var(--pqc-border-strong)', borderRadius: 'var(--pqr-input-outlined)', background: 'var(--pqc-field)', color: 'var(--pqc-text-primary)'}} data-testid={`ring-field-${mode}`} />
      </div>
    </Layer>
  );
}

/* ------------------------------------------------------------------ checks */

export function VerificationStatus() {
  const label = (s: string) => (s === 'run' ? 'Run' : s === 'partial' ? 'Partly run' : 'Not run');
  return (
    <section style={{display: 'grid', gap: '1rem'}}>
      <Disclaimer />
      <div className="pqv-scroll"><table data-testid="checks-table">
        <thead><tr><th scope="col">Check</th><th scope="col">Status</th><th scope="col">Detail</th></tr></thead>
        <tbody>{CHECKS.map(c => <tr key={c.check} data-testid={`check-${c.status}`}><th scope="row">{c.check}</th><td><Tag kind={c.status === 'not-run' ? 'not-run' : c.status === 'partial' ? 'local' : 'measured'}>{label(c.status)}</Tag></td><td>{c.detail}</td></tr>)}</tbody>
      </table></div>
    </section>
  );
}

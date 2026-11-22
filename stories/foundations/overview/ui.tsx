import type {ReactNode} from 'react';
import './overview.css';

export type Kind = 'official' | 'material' | 'measured' | 'local' | 'decided' | 'exception' | 'open' | 'not-run';
const LABEL: Record<Kind, string> = {
  official: 'Official guideline', material: 'Material package value', measured: 'Existing (measured)', local: 'Local adaptation',
  decided: 'Decided by owner', exception: 'Intentional exception', open: 'Not approved', 'not-run': 'Not run',
};
export const Tag = ({kind, children}: {kind: Kind; children?: ReactNode}) => <span className="pqv-tag" data-kind={kind}>{children ?? LABEL[kind]}</span>;
export const Page = ({title, children, testId = 'pqv-page'}: {title: string; children: ReactNode; testId?: string}) => <div className="pqv-page" data-testid={testId}><h1 style={{fontSize: '1.5rem'}}>{title}</h1>{children}</div>;
export function Legend() {
  return (
    <div className="pqv-box" role="note">
      <p><Tag kind="official" /> A published standard (WCAG, Material pages), text verified by a generator. <Tag kind="material" /> A Material package value, not on a page. <Tag kind="measured" /> Read from existing files or code. <Tag kind="local" /> Our adaptation of an official rule. <Tag kind="exception" /> A deliberate departure, with the reason. <Tag kind="decided" /> Decided by the owner. <Tag kind="open" /> Not approved: never assume it is.</p>
      <p className="pqv-muted">Documentation only. No production UI, protected file, existing asset or S0 baseline changes, no component migration begins, and no Figma components are created.</p>
    </div>
  );
}

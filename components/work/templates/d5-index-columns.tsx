import { CaseTop, ChapterArt, HeroArt, figureNumbers, pad, caseHref, type TemplateProps } from "./shared";
import { ReadingProgress } from "./reading-progress";
import Link from "next/link";
import "./d5-index-columns.css";

/** D5 · Index Columns — labels on the left, reading on the right; each chapter opens with a larger lead paragraph. */
export function D5IndexColumns({ project, study, art, next, query, sample }: TemplateProps) {
  const figs = figureNumbers(study.chapters);
  return (
    <article className="tpl t5">
      <ReadingProgress />
      <CaseTop sample={sample} />
      <header className="t5-g t5-head">
        <div className="t5-title">
          <p className="tpl-eyebrow">{project.tags.type[0]} · {project.year}</p>
          <h1>{project.title}</h1>
          <p className="t5-sub">{study.lede}</p>
        </div>
        <dl className="t5-facts">
          {study.facts.slice(0, 5).map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
        </dl>
      </header>
      <figure className="t5-fig">
        <HeroArt project={project} art={art} ratio="21 / 9" />
        <figcaption>Hero image (placeholder).</figcaption>
      </figure>

      {study.chapters.map((c, i) => {
        const [lead, ...rest] = c.body;
        return (
          <section key={c.id} id={c.id} className="t5-g t5-section" aria-labelledby={`${c.id}-t`}>
            <h2 id={`${c.id}-t`} className="t5-label"><span>{pad(i + 1)}</span>{c.title}</h2>
            <div>
              {lead && <p className="t5-lead">{lead}</p>}
              {rest.map((p) => <p key={p} className="t5-p">{p}</p>)}
              {c.figure && (
                <figure className="t5-fig">
                  <ChapterArt figure={c.figure} ratio="16 / 9" />
                  <figcaption>Fig. {pad(figs[i]!)} — {c.figure.caption}</figcaption>
                </figure>
              )}
            </div>
          </section>
        );
      })}

      <div className="t5-g t5-end">
        <span />
        <Link href={caseHref(next.slug, query)} rel="next"><span>Next project →</span><strong>{next.title}</strong></Link>
      </div>
    </article>
  );
}

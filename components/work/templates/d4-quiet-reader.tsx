import { CaseTop, ChapterArt, HeroArt, PrevNext, figureNumbers, pad, readMinutes, type TemplateProps } from "./shared";
import "./d4-quiet-reader.css";

/** D4 · Quiet Reader — one calm column, grey images, hierarchy from size, weight and space only. */
export function D4QuietReader({ project, study, art, prev, next, query, sample }: TemplateProps) {
  const figs = figureNumbers(study.chapters);
  const byline = [study.facts[0], ...study.facts.filter((f) => f.label === "Industry" || f.label === "Year")].filter(Boolean);
  return (
    <article className="tpl t4">
      <CaseTop sample={sample} />
      <header className="t4-col t4-head">
        <p className="tpl-eyebrow">{project.tags.type[0]} · {project.tags.industry.join(", ")} · {project.year}</p>
        <h1>{project.title}</h1>
        <p className="t4-sub">{study.lede}</p>
        <p className="t4-byline">
          {byline.map((f) => <span key={f.label}><b>{f.label}</b> {f.value}</span>)}
          <span><b>Read</b> {readMinutes(study)} min</span>
        </p>
      </header>

      <figure className="t4-wide t4-fig">
        <HeroArt project={project} art={art} ratio="16 / 9" />
        <figcaption>Hero image (placeholder).</figcaption>
      </figure>

      <div className="t4-col">
        {study.summary.length > 0 && (
          <section className="t4-summary" aria-labelledby="t4-brief">
            <h2 id="t4-brief" className="t4-label">In brief</h2>
            <ul>{study.summary.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
        )}

        <nav className="t4-contents" aria-labelledby="t4-contents">
          <h2 id="t4-contents" className="t4-label">Contents</h2>
          <ol>{study.chapters.map((c) => <li key={c.id}><a href={`#${c.id}`}>{c.title}</a></li>)}</ol>
        </nav>

        {study.chapters.map((c, i) => (
          <section key={c.id} id={c.id} className="t4-section" aria-labelledby={`${c.id}-t`}>
            <p className="t4-num">{pad(i + 1)}</p>
            <h2 id={`${c.id}-t`}>{c.title}</h2>
            {c.body.map((p) => <p key={p} className="t4-p">{p}</p>)}
            {c.figure && (
              <figure className="t4-fig">
                <ChapterArt figure={c.figure} ratio="4 / 3" />
                <figcaption>Fig. {pad(figs[i]!)} — {c.figure.caption}</figcaption>
              </figure>
            )}
          </section>
        ))}
        <PrevNext prev={prev} next={next} query={query} />
      </div>
    </article>
  );
}

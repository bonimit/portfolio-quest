import { CaseTop, ChapterArt, HeroArt, PrevNext, TagLinks, figureNumbers, pad, tintStyle, type TemplateProps } from "./shared";
import { FigureArt } from "../work-art";
import "./d3-chapter-spreads.css";

/** D3 · Chapter Spreads — tinted cover with a tilted collage, chapter chips, big outlined chapter numbers. */
export function D3ChapterSpreads({ project, study, art, prev, next, query, sample }: TemplateProps) {
  const figs = figureNumbers(study.chapters);
  const collage = study.chapters.flatMap((c) => (c.figure ? [c.figure] : [])).slice(0, 2);
  return (
    <article className="tpl t3" style={tintStyle(project)}>
      <header className="t3-hero">
        <CaseTop sample={sample} />
        <div className="t3-hero-grid">
          <div>
            <p className="tpl-eyebrow">{project.tags.type[0]} · {project.year}</p>
            <h1>{project.title}</h1>
            <p className="t3-lede">{study.lede}</p>
            <TagLinks project={project} />
          </div>
          <div className="t3-collage">
            <HeroArt project={project} art={art} ratio="4 / 3" />
            {collage.map((f, i) => (
              <div key={i}className="tpl-art" role="img" aria-label={f.alt} style={{ aspectRatio: "4 / 3" }}><FigureArt variant={f.variant} /></div>
            ))}
          </div>
        </div>
        <dl className="t3-facts">
          {study.facts.slice(0, 4).map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
        </dl>
      </header>

      {study.summary.length > 0 && (
        <section className="t3-insights" aria-label="At a glance">
          {study.summary.map((s, i) => <div key={s}><b>{pad(i + 1)}</b><p>{s}</p></div>)}
        </section>
      )}

      <nav className="t3-chips" aria-label="Chapters">
        <ol>{study.chapters.map((c, i) => <li key={c.id}><a href={`#${c.id}`}>{pad(i + 1)} {c.title}</a></li>)}</ol>
      </nav>

      {study.chapters.map((c, i) => (
        <section key={c.id} id={c.id} className="t3-spread" aria-labelledby={`${c.id}-t`}>
          <div className="t3-side">
            <div className="t3-num" aria-hidden="true">{pad(i + 1)}</div>
            <h2 id={`${c.id}-t`}>{c.title}</h2>
          </div>
          <div className="t3-main">
            {c.body.map((p) => <p key={p}>{p}</p>)}
            {c.figure && (
              <figure>
                <ChapterArt figure={c.figure} ratio={i % 2 ? "4 / 3" : "16 / 9"} />
                <figcaption><b>Fig. {pad(figs[i]!)}</b>{c.figure.caption}</figcaption>
              </figure>
            )}
          </div>
        </section>
      ))}
      <PrevNext prev={prev} next={next} query={query} />
    </article>
  );
}

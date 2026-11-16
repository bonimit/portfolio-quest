import { ChapterNav } from "../chapter-nav";
import { CaseTop, ChapterArt, HeroArt, PrevNext, TagLinks, figureNumbers, pad, readMinutes, tintStyle, type TemplateProps } from "./shared";
import "@/app/work/[slug]/case-study.css";
import "./d1-editorial-column.css";

/** D1 · Editorial Column — magazine reading column, sticky contents, key points in the margin, varied image widths. */
export function D1EditorialColumn({ project, study, art, prev, next, query, sample }: TemplateProps) {
  const figs = figureNumbers(study.chapters);
  const images = figs.filter(Boolean).length + 1;
  return (
    <article className="tpl t1" style={tintStyle(project)}>
      <CaseTop sample={sample} />
      <header className="t1-hero">
        <p className="tpl-eyebrow">{project.tags.type[0]} · {project.year}</p>
        <h1>{project.title}</h1>
        <p className="t1-lede">{study.lede}</p>
        <TagLinks project={project} />
      </header>
      <figure className="t1-hero-fig">
        <HeroArt project={project} art={art} ratio="21 / 9" />
        <figcaption><b>Fig. 01</b>Hero image (placeholder).</figcaption>
      </figure>

      <dl className="t1-facts">
        {study.facts.slice(0, 4).map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
      </dl>

      <div className="t1-layout">
        <div className="t1-toc">
          <ChapterNav chapters={study.chapters.map(({ id, title }) => ({ id, title }))} />
          <p className="t1-read">{readMinutes(study)} min read · {images} images</p>
        </div>
        <div className="t1-body">
          {study.chapters.map((c, i) => (
            <section key={c.id} id={c.id} className="t1-chapter" aria-labelledby={`${c.id}-t`}>
              <div className="t1-ch-head"><span className="t1-n">{pad(i + 1)}</span><h2 id={`${c.id}-t`}>{c.title}</h2></div>
              <div className="t1-row">
                <div className="t1-text">{c.body.map((p) => <p key={p}>{p}</p>)}</div>
                {study.summary[i] && <aside className="t1-note"><b>Key point</b>{study.summary[i]}</aside>}
              </div>
              {c.figure && (
                <figure className={i % 2 ? "t1-fig" : "t1-fig t1-fig--wide"}>
                  <ChapterArt figure={c.figure} ratio={i % 2 ? "4 / 3" : "16 / 9"} />
                  <figcaption><b>Fig. {pad(figs[i]!)}</b>{c.figure.caption}</figcaption>
                </figure>
              )}
            </section>
          ))}
        </div>
      </div>
      <PrevNext prev={prev} next={next} query={query} />
    </article>
  );
}

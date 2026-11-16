import Link from "next/link";
import { CaseTop, ChapterArt, HeroArt, TagLinks, caseHref, figureNumbers, pad, readMinutes, type TemplateProps } from "./shared";
import "./d6-art-book.css";

const WORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const PLATE_LAYOUT = ["t6-plate--r", "t6-plate--l", "t6-plate--full"];

/** D6 · Art Book — Bauhaus-inspired art-book layout: heavy sans titles, thick rules, images as numbered plates. (Approved mockup: D6e) */
export function D6ArtBook({ project, study, art, next, number, total, query, sample }: TemplateProps) {
  const plates = figureNumbers(study.chapters);
  const plateCount = plates.filter(Boolean).length + 1;
  const facts = [study.facts[0], ...study.facts.filter((f) => f.label === "Industry" || f.label === "Model")].filter(Boolean);
  return (
    <article className="tpl t6">
      <CaseTop sample={sample} />
      <hr className="t6-rule" />

      <header className="t6-g t6-cover">
        <div className="t6-cover-text">
          <span className="t6-spine" aria-hidden="true">{project.tags.type[0]} · No. {pad(number)} · {project.year}</span>
          <div>
            <p className="tpl-eyebrow">Case study {pad(number)} / {pad(total)}</p>
            <h1>{project.title}</h1>
            <p className="t6-sub">{study.lede}</p>
          </div>
          <TagLinks project={project} className="t6-tags" />
        </div>
        <figure className="t6-hero">
          <HeroArt project={project} art={art} ratio="4 / 5" />
          <figcaption><b>Plate 01</b>Hero image (placeholder).</figcaption>
        </figure>
      </header>

      <dl className="t6-g t6-colophon">
        {facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
        <div><dt>Plates</dt><dd>{plateCount} images · {readMinutes(study)} min read</dd></div>
      </dl>

      {study.chapters.map((c, i) => {
        const [lead, ...rest] = c.body;
        return (
          <section key={c.id} id={c.id} className="t6-chapter" aria-labelledby={`${c.id}-t`}>
            <div className="t6-g t6-opener">
              <div className="t6-n" aria-hidden="true">{pad(i + 1)}</div>
              <div className="t6-opener-text">
                <p className="tpl-eyebrow">Chapter {WORDS[i] ?? i + 1}</p>
                <h2 id={`${c.id}-t`}>{c.title}</h2>
                {lead && <p className="t6-lead">{lead}</p>}
              </div>
            </div>
            <div className="t6-g">
              {rest.length > 0 && <div className="t6-text">{rest.map((p) => <p key={p}>{p}</p>)}</div>}
              {c.figure && (
                <figure className={`t6-plate ${PLATE_LAYOUT[i % PLATE_LAYOUT.length]}`}>
                  <ChapterArt figure={c.figure} ratio={i % 3 === 2 ? "21 / 9" : "16 / 9"} />
                  <figcaption><b>Plate {pad(plates[i]!)}</b>{c.figure.caption}</figcaption>
                </figure>
              )}
            </div>
          </section>
        );
      })}

      <section className="t6-g t6-index" aria-labelledby="t6-index">
        <h2 id="t6-index">Index of plates</h2>
        <ol>
          <li>01 · Hero image<span>Cover</span></li>
          {study.chapters.map((c, i) => c.figure && <li key={c.id}>{pad(plates[i]!)} · {c.figure.caption.replace(/^Sample: /, "")}<span>Ch.{i + 1}</span></li>)}
        </ol>
      </section>

      <Link className="t6-next" href={caseHref(next.slug, query)} rel="next">
        <span><span className="tpl-eyebrow">Next · No. {pad((number % total) + 1)}</span><strong>{next.title}</strong></span>
        <span className="t6-arrow" aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

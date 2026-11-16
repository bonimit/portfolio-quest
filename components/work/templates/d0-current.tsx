import Link from "next/link";
import type { CSSProperties } from "react";
import { filterHref } from "@/lib/work/case-study";
import { DIMENSIONS } from "@/lib/work/projects";
import { ChapterNav } from "../chapter-nav";
import { CardArt, FigureArt } from "../work-art";
import { caseHref, tintStyle, type TemplateProps } from "./shared";
import "@/app/work/[slug]/case-study.css";

/** D0 · Current — the original case-study layout (styles in app/work/[slug]/case-study.css). */
export function D0Current({ project, study, art, related, prev, next, query, sample }: TemplateProps) {
  return (
    <article className="case" style={tintStyle(project)}>
      <nav className="case-crumbs" aria-label="Breadcrumb">
        <Link href="/work">← Selected Work</Link>
      </nav>

      {sample && (
        <p className="work-sample-note" role="note">
          <strong>Sample case study.</strong> Mock content for previewing the layout. Not real work; it never appears on the live site.
        </p>
      )}

      <header className="case-hero">
        <p className="work-eyebrow">{project.tags.type[0]} · {project.year}</p>
        <h1>{project.title}</h1>
        <p className="case-lede">{study.lede}</p>
        <ul className="case-tags" aria-label="Filter Selected Work by tag">
          {DIMENSIONS.flatMap((dim) =>
            project.tags[dim.key].map((tag) => (
              <li key={`${dim.key}-${tag}`}>
                <Link href={filterHref(dim.key, tag)} title={`See all ${tag} projects`}>
                  <span className="work-tag-dim">{dim.label}</span> {tag}
                </Link>
              </li>
            )),
          )}
        </ul>
        <div className="case-hero-art" role="img" aria-label={`Placeholder hero image for ${project.title}`}>
          <CardArt type={project.tags.type[0]} art={art} />
        </div>
      </header>

      <section className="case-summary" aria-labelledby="case-summary-title">
        <h2 id="case-summary-title" className="toolbar-label">At a glance</h2>
        <dl className="case-facts">
          {study.facts.map((f) => (
            <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
          ))}
        </dl>
        <ul className="case-summary-list">
          {study.summary.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>

      <div className="case-layout">
        <ChapterNav chapters={study.chapters.map(({ id, title }) => ({ id, title }))} />
        <div className="case-body">
          {study.chapters.map((chapter, i) => (
            <section key={chapter.id} id={chapter.id} className="case-chapter" aria-labelledby={`${chapter.id}-title`}>
              <p className="case-chapter-number">{String(i + 1).padStart(2, "0")}</p>
              <h2 id={`${chapter.id}-title`}>
                <a href={`#${chapter.id}`} className="case-anchor">{chapter.title}<span aria-hidden="true">#</span></a>
              </h2>
              {chapter.body.map((para) => <p key={para}>{para}</p>)}
              {chapter.figure && (
                <figure className="case-figure">
                  <div className="case-figure-art" role="img" aria-label={chapter.figure.alt}>
                    <FigureArt variant={chapter.figure.variant} />
                  </div>
                  <figcaption>{chapter.figure.caption}</figcaption>
                </figure>
              )}
            </section>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <section className="case-related" aria-labelledby="case-related-title">
          <h2 id="case-related-title">Related projects</h2>
          <ul>
            {related.map((p) => (
              <li key={p.slug} style={{ "--card-tint": `var(--landing-${p.tint})` } as CSSProperties}>
                <Link href={caseHref(p.slug, query)}>
                  <span className="work-eyebrow">{p.tags.type[0]}</span>
                  <span className="case-related-title">{p.title}</span>
                  <span className="case-related-tags">{[...p.tags.industry, ...p.tags.discipline].join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="case-pager" aria-label="More projects">
        <Link href={caseHref(prev.slug, query)} rel="prev"><span>← Previous</span>{prev.title}</Link>
        <Link href="/work" className="case-pager-all">All work</Link>
        <Link href={caseHref(next.slug, query)} rel="next"><span>Next →</span>{next.title}</Link>
      </nav>
    </article>
  );
}

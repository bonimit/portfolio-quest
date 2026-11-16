"use client";

import { useEffect, useRef, useState } from "react";
import { CaseTop, ChapterArt, HeroArt, PrevNext, TagLinks, figureNumbers, pad, tintStyle, type TemplateProps } from "./shared";
import "./d2-process-notebook.css";

/** D2 · Process Notebook — text scrolls on the left, the matching figure stays pinned on the right. */
export function D2ProcessNotebook({ project, study, art, prev, next, query, sample }: TemplateProps) {
  const [active, setActive] = useState(0);
  const steps = useRef<HTMLDivElement>(null);
  const chapters = study.chapters;
  const figs = figureNumbers(chapters);

  // The pinned figure for chapter i: its own, else the closest earlier one, else the hero (-1).
  const frameOf = chapters.map((_, i) => {
    for (let j = i; j >= 0; j--) if (chapters[j].figure) return j;
    return -1;
  });
  const frames = [-1, ...chapters.flatMap((c, i) => (c.figure ? [i] : []))];
  const current = frameOf[active] ?? -1;

  useEffect(() => {
    const els = steps.current?.querySelectorAll<HTMLElement>("[data-step]") ?? [];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step)); }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <article className="tpl t2" style={tintStyle(project)}>
      <CaseTop sample={sample} />
      <header className="t2-hero">
        <div>
          <p className="tpl-eyebrow">{project.tags.type[0]} · {project.year}</p>
          <h1>{project.title}</h1>
          <p className="t2-lede">{study.lede}</p>
          <TagLinks project={project} />
          <dl className="t2-facts">
            {study.facts.slice(0, 4).map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
          </dl>
        </div>
        <HeroArt project={project} art={art} ratio="4 / 3" />
      </header>

      <nav className="t2-phases" aria-label="Chapters">
        <ol style={{ gridTemplateColumns: `repeat(${chapters.length}, minmax(0, 1fr))` }}>
          {chapters.map((c, i) => (
            <li key={c.id} className={i === active ? "is-on" : i < active ? "is-done" : undefined}>
              <a href={`#${c.id}`} aria-current={i === active ? "location" : undefined}><span>{pad(i + 1)}</span>{c.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="t2-split">
        <div className="t2-steps" ref={steps}>
          {chapters.map((c, i) => (
            <section key={c.id} id={c.id} data-step={i} className="t2-step" aria-labelledby={`${c.id}-t`}>
              <p className="t2-k"><i>Step {pad(i + 1)}</i></p>
              <h2 id={`${c.id}-t`}>{c.title}</h2>
              {c.body.map((p) => <p key={p} className="t2-p">{p}</p>)}
              {c.figure && (
                <figure className="t2-inline">
                  <ChapterArt figure={c.figure} ratio="16 / 9" />
                  <figcaption><b>Fig. {pad(figs[i]!)}</b>{c.figure.caption}</figcaption>
                </figure>
              )}
              {i === 0 && study.summary.length > 0 && (
                <div className="t2-learn"><b>At a glance</b><ul>{study.summary.map((s) => <li key={s}>{s}</li>)}</ul></div>
              )}
            </section>
          ))}
        </div>

        <aside className="t2-stage" aria-label="Figures">
          <div className="t2-frames">
            {frames.map((f) => {
              const fig = f >= 0 ? chapters[f].figure! : undefined;
              return (
                <figure key={f} className={f === current ? "t2-frame is-on" : "t2-frame"} aria-hidden={f !== current}>
                  {fig ? <ChapterArt figure={fig} ratio="4 / 3" /> : <HeroArt project={project} art={art} ratio="4 / 3" />}
                  <figcaption><b>Fig. {pad(fig ? figs[f]! : 1)}</b>{fig ? fig.caption : "Hero image (placeholder)."}</figcaption>
                </figure>
              );
            })}
          </div>
          <div className="t2-bar">
            <span>Figure {frames.indexOf(current) + 1} of {frames.length}</span>
            <span className="t2-dots" aria-hidden="true">{frames.map((f) => <i key={f} className={f === current ? "is-on" : undefined} />)}</span>
          </div>
        </aside>
      </div>
      <PrevNext prev={prev} next={next} query={query} />
    </article>
  );
}

"use client";

import { useEffect, useState } from "react";

type Props = { chapters: { id: string; title: string }[] };

/** Sticky chapter list on wide screens, collapsible "Contents" on small screens; highlights the chapter in view. */
export function ChapterNav({ chapters }: Props) {
  const [active, setActive] = useState(chapters[0]?.id);

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  const list = (
    <ol>
      {chapters.map((c, i) => (
        <li key={c.id}>
          <a href={`#${c.id}`} aria-current={active === c.id ? "location" : undefined}>
            <span>{String(i + 1).padStart(2, "0")}</span> {c.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav className="case-nav" aria-label="Chapters">
      <details className="case-nav-mobile">
        <summary>Contents</summary>
        {list}
      </details>
      <div className="case-nav-desktop">
        <p className="toolbar-label">Chapters</p>
        {list}
      </div>
    </nav>
  );
}

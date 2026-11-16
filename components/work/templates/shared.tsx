import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { CaseStudy, Chapter } from "@/lib/work/case-study";
import type { Project } from "@/lib/work/projects";
import { filterHref } from "@/lib/work/case-study";
import { DIMENSIONS } from "@/lib/work/projects";
import { TEMPLATES, type TemplateId } from "@/lib/work/templates";
import { CardArt, FigureArt } from "../work-art";
import "./shared.css";

/** Everything a template needs. Plain data only, so client templates can receive it too. */
export type TemplateProps = {
  project: Project;
  study: CaseStudy;
  art?: string;
  related: Project[];
  prev: Project;
  next: Project;
  number: number;
  total: number;
  /** Appended to internal case-study links so a previewed template stays selected, e.g. "?template=D3". */
  query: string;
  sample: boolean;
};

export const caseHref = (slug: string, query: string) => `/work/${slug}${query}`;
export const pad = (n: number) => String(n).padStart(2, "0");
export const tintStyle = (p: Project) => ({ "--card-tint": `var(--landing-${p.tint})` }) as CSSProperties;

export function readMinutes(study: CaseStudy) {
  const words = [study.lede, ...study.summary, ...study.chapters.flatMap((c) => c.body)].join(" ").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Chapters with a figure get a running plate/figure number; the hero image is number 1. */
export function figureNumbers(chapters: Chapter[]) {
  let n = 1;
  return chapters.map((c) => (c.figure ? ++n : undefined));
}

export function CaseTop({ sample }: { sample: boolean }) {
  return (
    <nav className="tpl-top" aria-label="Breadcrumb">
      <Link href="/work">← Selected Work</Link>
      {sample && <span className="tpl-sample">Sample case study · not real work</span>}
    </nav>
  );
}

export function TagLinks({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <ul className={`tpl-tags ${className}`} aria-label="Filter Selected Work by tag">
      {DIMENSIONS.filter((d) => d.key !== "type").flatMap((dim) =>
        project.tags[dim.key].map((tag) => (
          <li key={`${dim.key}-${tag}`}>
            <Link href={filterHref(dim.key, tag)} title={`See all ${tag} projects`}>{tag}</Link>
          </li>
        )),
      )}
    </ul>
  );
}

export function ArtBox({ ratio, label, className = "", children }: { ratio: string; label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`tpl-art ${className}`} role="img" aria-label={label} style={{ aspectRatio: ratio }}>
      {children}
    </div>
  );
}

export function HeroArt({ project, art, ratio, className }: { project: Project; art?: string; ratio: string; className?: string }) {
  return (
    <ArtBox ratio={ratio} label={`Placeholder hero image for ${project.title}`} className={className}>
      <CardArt type={project.tags.type[0]} art={art} />
    </ArtBox>
  );
}

export function ChapterArt({ figure, ratio, className }: { figure: NonNullable<Chapter["figure"]>; ratio: string; className?: string }) {
  return (
    <ArtBox ratio={ratio} label={figure.alt} className={className}>
      <FigureArt variant={figure.variant} />
    </ArtBox>
  );
}

/** Development-only bar for previewing every template on the real page. */
export function TemplateSwitcher({ slug, current }: { slug: string; current: TemplateId }) {
  return (
    <nav className="tpl-switch" aria-label="Preview case-study template">
      <span className="tpl-switch-label">Template preview</span>
      <ul>
        {TEMPLATES.map((t) => (
          <li key={t.id}>
            <Link href={`/work/${slug}?template=${t.id}`} aria-current={t.id === current ? "page" : undefined} scroll={false}>
              <b>{t.id}</b> {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PrevNext({ prev, next, query, className = "" }: { prev: Project; next: Project; query: string; className?: string }) {
  return (
    <nav className={`tpl-pager ${className}`} aria-label="More projects">
      <Link href={caseHref(prev.slug, query)} rel="prev"><span>← Previous</span>{prev.title}</Link>
      <Link href={caseHref(next.slug, query)} rel="next"><span>Next →</span>{next.title}</Link>
    </nav>
  );
}

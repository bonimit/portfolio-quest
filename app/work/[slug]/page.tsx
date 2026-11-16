import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { assignArt } from "@/components/work/work-art";
import { D0Current } from "@/components/work/templates/d0-current";
import { D1EditorialColumn } from "@/components/work/templates/d1-editorial-column";
import { D2ProcessNotebook } from "@/components/work/templates/d2-process-notebook";
import { D3ChapterSpreads } from "@/components/work/templates/d3-chapter-spreads";
import { D4QuietReader } from "@/components/work/templates/d4-quiet-reader";
import { D5IndexColumns } from "@/components/work/templates/d5-index-columns";
import { D6ArtBook } from "@/components/work/templates/d6-art-book";
import { TemplateSwitcher, type TemplateProps } from "@/components/work/templates/shared";
import { buildCaseStudy, relatedProjects } from "@/lib/work/case-study";
import { getProject, getProjects, IS_SAMPLE } from "@/lib/work/source";
import { DEFAULT_TEMPLATE, parseTemplate, type TemplateId } from "@/lib/work/templates";
import "../work.css";
import "./visual.css";
import Link from "next/link";
import { visualStudy, labProjects } from "@/lib/concepts";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const RENDER: Record<TemplateId, ComponentType<TemplateProps>> = {
  D0: D0Current,
  D1: D1EditorialColumn,
  D2: D2ProcessNotebook,
  D3: D3ChapterSpreads,
  D4: D4QuietReader,
  D5: D5IndexColumns,
  D6: D6ArtBook,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: `${project.title} | Portfolio Quest`, description: project.summary },
    robots: IS_SAMPLE ? { index: false } : undefined,
  };
}

export default async function CaseStudyPage({ params, searchParams }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  // Preview override (?template=D3) is only honoured while sample data is on; otherwise the project's own choice.
  const queryParams = await searchParams;
  const preview = IS_SAMPLE ? parseTemplate(queryParams.template) : undefined;
  const visual = queryParams.view === "visual";
  const concept = queryParams.section === "concept" && labProjects([project]).length > 0;
  const study = buildCaseStudy(project);
  const previewQuery = preview ? `template=${preview}` : "";
  const query = [previewQuery, visual ? "view=visual" : "", concept ? "section=concept" : ""].filter(Boolean).join("&");
  const template = preview ?? project.template ?? DEFAULT_TEMPLATE;
  const Template = RENDER[template];

  const projects = getProjects();
  const all = concept ? labProjects(projects) : projects;
  const index = all.findIndex((p) => p.slug === project.slug);

  return (
    <>
      {IS_SAMPLE && <TemplateSwitcher slug={project.slug} current={template} />}
      <nav className="project-reading-mode" aria-label="Story view"><Link href={`/work/${project.slug}${previewQuery ? `?${previewQuery}` : ""}`} aria-current={!visual ? "page" : undefined}>Full story</Link><Link href={`${concept ? "/concepts" : "/work"}/${project.slug}?${[previewQuery, "view=visual"].filter(Boolean).join("&")}`} aria-current={visual ? "page" : undefined}>Visual story</Link>{visual && <Link href="/concepts">Back to Concept Lab</Link>}</nav>
      <Template
        project={project}
        study={visual ? visualStudy(study) : study}
        art={assignArt(projects).get(project.slug)}
        related={relatedProjects(project, all)}
        prev={all[(index - 1 + all.length) % all.length]}
        next={all[(index + 1) % all.length]}
        number={index + 1}
        total={all.length}
        query={query ? `?${query}` : ""}
        sample={IS_SAMPLE}
      />
    </>
  );
}

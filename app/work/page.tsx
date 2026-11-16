import type { Metadata } from "next";
import { WorkExplorer } from "@/components/work/work-explorer";
import { parseWorkQuery } from "@/lib/work/projects";
import { getProjects, IS_SAMPLE } from "@/lib/work/source";
import "./work.css";

const description =
  "Professional design projects, concepts and prototypes, filterable by discipline, industry and business model.";

export const metadata: Metadata = {
  title: "Selected Work",
  description,
  openGraph: { title: "Selected Work | Portfolio Quest", description },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function WorkPage({ searchParams }: Props) {
  const projects = getProjects();
  return <WorkExplorer projects={projects} initial={parseWorkQuery(await searchParams)} sample={IS_SAMPLE && projects.length > 0} />;
}

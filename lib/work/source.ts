import type { Project } from "./projects";
import { SAMPLE_PROJECTS } from "./sample-projects";

/**
 * Single source for published projects. Until the CMS is connected,
 * production has none; development uses the clearly marked sample data.
 */
export const IS_SAMPLE = process.env.NODE_ENV !== "production";

export function getProjects(): Project[] {
  return IS_SAMPLE ? SAMPLE_PROJECTS : [];
}

export function getProject(slug: string) {
  return getProjects().find((p) => p.slug === slug);
}

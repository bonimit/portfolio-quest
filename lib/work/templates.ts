/**
 * Case-study page templates. Every project renders with one of these.
 * D6 is the default; a project can later pick its own with `Project.template`.
 * While sample data is on (development), `?template=D3` previews any template.
 */
export const TEMPLATES = [
  { id: "D0", name: "Current" },
  { id: "D1", name: "Editorial Column" },
  { id: "D2", name: "Process Notebook" },
  { id: "D3", name: "Chapter Spreads" },
  { id: "D4", name: "Quiet Reader" },
  { id: "D5", name: "Index Columns" },
  { id: "D6", name: "Art Book" },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export const DEFAULT_TEMPLATE: TemplateId = "D6";

export function parseTemplate(value: unknown): TemplateId | undefined {
  const v = typeof value === "string" ? value.trim().toUpperCase() : "";
  return TEMPLATES.find((t) => t.id === v)?.id;
}

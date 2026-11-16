import { DIMENSIONS, type DimensionKey, type Project } from "./projects";

/**
 * Builds MOCK case-study content for the development sample projects.
 * The chapter structure follows the blueprint: long-form blocks for
 * professional work (adapted per discipline), medium form for concepts and
 * demo-first sections for Build Lab. Outcomes are left as clearly marked
 * placeholders so no metrics are invented.
 */

export type FigureVariant = "flow" | "grid" | "board" | "screens" | "code";
export type Chapter = { id: string; title: string; body: string[]; figure?: { variant: FigureVariant; caption: string; alt: string } };
export type CaseStudy = {
  lede: string;
  facts: { label: string; value: string }[];
  summary: string[];
  chapters: Chapter[];
};

const isProduct = (p: Project) => p.tags.discipline.some((d) => d === "Product Design" || d === "UX/UI");

export function buildCaseStudy(p: Project): CaseStudy {
  const type = p.tags.type[0];
  const industry = p.tags.industry.join(" and ");
  const audience = p.tags.model.join(" / ");
  const product = p.tags.product.join(", ").toLowerCase();
  const pending = "[Placeholder — real outcome to be added once approved.]";

  const facts = [
    { label: "Role", value: p.role },
    { label: "Year", value: String(p.year) },
    { label: "Type", value: type },
    { label: "Industry", value: p.tags.industry.join(", ") },
    { label: "Model", value: audience },
    { label: "Product", value: p.tags.product.join(", ") },
  ];

  if (type === "Build Lab") {
    return {
      lede: p.summary,
      facts: [...facts, { label: "State", value: "Prototype (sample)" }],
      summary: [
        `A small ${product} built to test an idea quickly in the ${industry} space.`,
        "Try-it-first: the demo leads, the write-up stays short.",
      ],
      chapters: [
        { id: "what-it-is", title: "What it is", body: [p.summary, `It is aimed at a ${audience} audience and runs in the browser with no sign-up.`], figure: { variant: "screens", caption: "Sample: the main screen of the prototype.", alt: "Placeholder sketch of a browser window with three content panels." } },
        { id: "why", title: "Why I built it", body: [`I wanted to see whether a lightweight ${product} could answer a question that usually needs a full product team.`, "Building it was faster than writing a spec about it."] },
        { id: "how-it-works", title: "How it works", body: ["Input goes in on the left, the result updates live on the right.", "State is kept locally, so nothing personal leaves the device."], figure: { variant: "flow", caption: "Sample: how data moves through the prototype.", alt: "Placeholder diagram of three boxes connected by arrows." } },
        { id: "behind-the-build", title: "Behind the build", body: ["Technology: placeholder stack description.", "AI use disclosure: placeholder — state clearly whether and how AI tools were used.", "Source code: link shown only if the repository is public."], figure: { variant: "code", caption: "Sample: a snippet of the core logic.", alt: "Placeholder illustration of code brackets." } },
      ],
    };
  }

  if (type === "Concept/Pitch") {
    return {
      lede: p.summary,
      facts: [...facts, { label: "Status", value: "Idea & pitch (sample)" }],
      summary: [`An unbuilt ${product} concept for ${industry}.`, "Shows the opportunity, the big idea and how far it got."],
      chapters: [
        { id: "opportunity", title: "Opportunity", body: [`People in ${industry} juggle several tools for one job. A focused ${product} could remove steps.`, "This chapter would cite the signals that pointed to the gap."] },
        { id: "big-idea", title: "The big idea", body: [p.summary, `One sentence pitch, written for a ${audience} decision-maker.`], figure: { variant: "board", caption: "Sample: the pitch board.", alt: "Placeholder moodboard of overlapping circles." } },
        { id: "exploration", title: "Visual & interaction exploration", body: ["Three directions were sketched, then one was taken to clickable screens.", "Discarded directions stay here so the reasoning is visible."], figure: { variant: "screens", caption: "Sample: two explored directions side by side.", alt: "Placeholder of two phone screens with different layouts." } },
        { id: "status", title: "Evolution & status", body: ["Status: idea and pitch. Not built.", "If it ships, this page will link to the real project instead of repeating it."] },
      ],
    };
  }

  // Professional Work: UX headings for product work, brand headings otherwise.
  if (isProduct(p)) {
    return {
      lede: p.summary,
      facts,
      summary: [
        `Challenge: a ${product} for ${industry} that asked too much of its ${audience} users.`,
        `My part: ${p.role.toLowerCase()}, from research to shipped screens.`,
        `Result: ${pending}`,
      ],
      chapters: [
        { id: "overview", title: "Overview", body: [p.summary, `I worked as ${p.role.toLowerCase()} alongside a placeholder team of product, engineering and research.`] },
        { id: "challenge", title: "Challenge", body: ["People dropped off before finishing the main task.", "This chapter would describe the business problem and the user problem in one paragraph each."] },
        { id: "research", title: "Discovery & research", body: ["Sample methods: interviews, a funnel review and a competitor teardown.", "Key insight placeholder: people did not understand why each step mattered."], figure: { variant: "board", caption: "Sample: affinity map from interviews.", alt: "Placeholder of grouped sticky notes." } },
        { id: "process", title: "Process & design decisions", body: ["Decision 1: cut steps by asking for information only when needed.", "Decision 2: show progress so people know how much is left.", "Each decision would link back to the research that supported it."], figure: { variant: "flow", caption: "Sample: the old and new flow compared.", alt: "Placeholder diagram showing a long flow shortened into fewer steps." } },
        { id: "solution", title: "Solution", body: [`The final ${product} screens, with notes on the key interactions.`], figure: { variant: "screens", caption: "Sample: final screens.", alt: "Placeholder of three app screens." } },
        { id: "impact", title: "Impact & reflections", body: [pending, "What I would do differently next time — placeholder reflection."] },
      ],
    };
  }

  return {
    lede: p.summary,
    facts,
    summary: [`Brief: ${p.summary.replace(/^A sample /, "a ")}`, `My part: ${p.role.toLowerCase()}.`, `Result: ${pending}`],
    chapters: [
      { id: "brief", title: "The brief", body: [p.summary, `The audience is ${audience}; the work had to feel at home in ${industry}.`] },
      { id: "concept", title: "Concept", body: ["One idea ties everything together. This chapter would name it and show where it came from."], figure: { variant: "board", caption: "Sample: early concept sketches.", alt: "Placeholder of loose overlapping shapes." } },
      { id: "system", title: p.tags.discipline.includes("Marketing Ads") ? "Campaign system" : "Identity system", body: ["Logo, type, colour and layout rules that make new pieces easy to produce.", "Brand projects skip UX-research headings on purpose."], figure: { variant: "grid", caption: "Sample: the system on a grid.", alt: "Placeholder grid of rectangles of different sizes." } },
      { id: "applications", title: "Applications", body: [`Where the work appears: ${product}.`], figure: { variant: "screens", caption: "Sample: the system applied across formats.", alt: "Placeholder of posters and screens." } },
      { id: "reflections", title: "Reflections", body: [pending] },
    ],
  };
}

/** Projects that share the most tags with this one. */
export function relatedProjects(project: Project, all: Project[], limit = 3) {
  const score = (p: Project) =>
    DIMENSIONS.reduce((n, d) => n + p.tags[d.key].filter((t) => project.tags[d.key].includes(t)).length, 0);
  return all
    .filter((p) => p.slug !== project.slug)
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

export const filterHref = (key: DimensionKey, tag: string) => `/work?${new URLSearchParams({ [key]: tag })}`;

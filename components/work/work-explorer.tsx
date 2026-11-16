"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { CardArt, assignArt } from "@/components/work/work-art";
import { useCardDrag } from "@/components/work/use-card-drag";
import {
  DIMENSIONS,
  SORTS,
  activeCount,
  emptyFilters,
  facetCount,
  matches,
  quiltLayout,
  gridLayout,
  sortProjects,
  toSearchString,
  type DimensionKey,
  type Project,
  type SortKey,
  type WorkQuery,
} from "@/lib/work/projects";

type Props = { projects: Project[]; initial: WorkQuery; sample: boolean };


export function WorkExplorer({ projects, initial, sample }: Props) {
  const [query, setQuery] = useState<WorkQuery>(initial);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const before = useRef<Map<string, DOMRect> | null>(null);

  /** A visitor's own arrangement (all slugs), made by dragging; applies to the Curated view. */
  const [custom, setCustom] = useState<string[] | null>(null);
  const [moved, setMoved] = useState("");

  const visible = useMemo(() => {
    const list = sortProjects(projects.filter((p) => matches(p, query)), query.sort);
    if (query.sort !== "curated" || !custom) return list;
    return [...list].sort((a, b) => custom.indexOf(a.slug) - custom.indexOf(b.slug));
  }, [projects, query, custom]);
  const artOf = useMemo(() => assignArt(projects), [projects]);
  const slots = useMemo(
    () => (query.layout === "grid" ? gridLayout : quiltLayout)(visible.length),
    [visible.length, query.layout],
  );

  const capture = () => {
    before.current = new Map([...nodes.current].map(([slug, el]) => [slug, el.getBoundingClientRect()]));
  };

  /** Every change goes through here so cards can glide from where they were. */
  function update(next: WorkQuery) {
    capture();
    setQuery(next);
    setBump((n) => n + 1);
  }

  // Drag to reorder: the card under the cursor gives up its slot and the quilt re-packs.
  const { onPointerDown: onCardPointerDown, onClickCapture: onCardClickCapture, ghostRef, draggingSlug } = useCardDrag({
    onSwap(dragSlug, overSlug) {
      const shown = visible.map((p) => p.slug);
      let order = custom ?? projects.map((p) => p.slug);
      if (query.sort !== "curated") {
        // Dragging inside another sort freezes what you see as your own arrangement.
        order = [...shown, ...order.filter((s) => !shown.includes(s))];
        setQuery({ ...query, sort: "curated" });
      }
      const next = [...order];
      next.splice(next.indexOf(overSlug), 0, next.splice(next.indexOf(dragSlug), 1)[0]);
      capture();
      setCustom(next);
    },
    onDrop(slug) {
      const title = projects.find((p) => p.slug === slug)?.title;
      setMoved(`${title} moved. Your arrangement is updated.`);
    },
  });

  function tidy() {
    capture();
    setCustom(null);
    setMoved("Original order restored.");
    setBump((n) => n + 1);
  }

  function toggle(key: DimensionKey, option: string) {
    const chosen = query.filters[key];
    const nextTags = chosen.includes(option) ? chosen.filter((t) => t !== option) : [...chosen, option];
    update({ ...query, filters: { ...query.filters, [key]: nextTags } });
  }

  const clearAll = () => update({ ...query, q: "", filters: emptyFilters() });

  // FLIP: kept cards glide to their new slot, new cards pop in, staggered 30ms like the reference.
  useLayoutEffect(() => {
    const prev = before.current;
    before.current = null;
    if (!prev || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const held = draggingSlug();
    visible.forEach((project, i) => {
      const el = nodes.current.get(project.slug);
      if (!el || project.slug === held) return; // the held card follows the cursor instead
      el.getAnimations().forEach((a) => a.cancel());
      const rest = getComputedStyle(el).transform;
      const base = rest === "none" ? "" : ` ${rest}`;
      const to = el.getBoundingClientRect();
      const from = prev.get(project.slug);
      // While dragging, neighbours make room quickly; filter and sort changes keep the slow staggered glide.
      const timing = { delay: held ? 0 : i * 30, fill: "backwards" as const };
      if (from) {
        // Centre-to-centre move plus a size change, since slots differ in width and height.
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        const dy = from.top + from.height / 2 - (to.top + to.height / 2);
        const sx = from.width / to.width, sy = from.height / to.height;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})${base}` }, { transform: base.trim() || "none" }],
          { ...timing, duration: held ? 450 : 900, easing: held ? "cubic-bezier(.2,.8,.25,1)" : "cubic-bezier(.2,.7,.2,1)" },
        );
      } else {
        el.animate(
          [{ opacity: 0, transform: `translateY(14px) scale(.94)${base}` }, { opacity: 1, transform: base.trim() || "none" }],
          { ...timing, duration: 500, easing: "cubic-bezier(.34,1.56,.64,1)" },
        );
      }
    });
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps -- draggingSlug reads a ref

  // Keep the URL shareable: /work?industry=FinTech&sort=az
  useEffect(() => {
    const url = `${window.location.pathname}${toSearchString(query)}`;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, "", url);
  }, [query]);

  // "/" jumps to search; Escape closes an open filter menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if (e.key === "/" && !typing) { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!projects.length) {
    return (
      <div className="work-page">
        <WorkHead />
        <section className="work-empty" aria-labelledby="work-empty-title">
          <h2 id="work-empty-title">Projects are on their way.</h2>
          <p>Case studies will appear here once they are approved for publishing.</p>
        </section>
      </div>
    );
  }

  const filterCount = activeCount(query.filters);
  const hasQuery = filterCount > 0 || query.q.trim().length > 0;
  const sortLabel = SORTS.find((s) => s.key === query.sort)!.label;

  return (
    <div className="work-page">
      <WorkHead />
      {sample && (
        <p className="work-sample-note" role="note">
          <strong>Sample data.</strong> These placeholder projects only appear while developing, so the filters can be previewed. They are not real work.
        </p>
      )}

      <div className="work-toolbar">
        <form className="work-search" role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="work-search-input" className="work-visually-hidden">Search projects</label>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="work-search-icon"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4.5 4.5" /></svg>
          <input
            id="work-search-input"
            ref={searchRef}
            type="search"
            placeholder="Search projects, tags or roles"
            autoComplete="off"
            value={query.q}
            maxLength={80}
            onChange={(e) => update({ ...query, q: e.target.value })}
          />
          <kbd aria-hidden="true">/</kbd>
        </form>

        <div className="work-controls">
          <FilterPanel
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            activeCount={filterCount}
            resultCount={visible.length}
            onClear={() => update({ ...query, filters: emptyFilters() })}
          >
            {DIMENSIONS.map((dim) => (
              <fieldset key={dim.key} className="work-facet">
                <legend>{dim.label}</legend>
                <div className="work-facet-options">
                  {dim.options.map((option) => {
                    const on = query.filters[dim.key].includes(option);
                    const count = facetCount(projects, query, dim.key, option);
                    return (
                      <button
                        type="button"
                        key={option}
                        className="work-chip work-chip--sm"
                        aria-pressed={on}
                        disabled={!on && !count}
                        onClick={() => toggle(dim.key, option)}
                      >
                        {option} <span className="work-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </FilterPanel>

          <label className="work-select">
            <span className="work-visually-hidden">Sort projects</span>
            <select value={query.sort} onChange={(e) => update({ ...query, sort: e.target.value as SortKey })}>
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <svg aria-hidden="true" viewBox="0 0 12 12" className="work-caret"><path d="m3 4.5 3 3 3-3" /></svg>
          </label>

          <span className="work-seg work-seg--icons" role="group" aria-label="Layout">
            <button
              type="button"
              className={query.layout === "collage" ? "on" : undefined}
              aria-pressed={query.layout === "collage"}
              aria-label="Collage layout"
              title="Collage"
              onClick={() => query.layout !== "collage" && update({ ...query, layout: "collage" })}
            >
              <svg aria-hidden="true" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="8" height="8" /><rect x="11" y="1.5" width="3.5" height="5" /><rect x="11" y="8" width="3.5" height="6.5" /><rect x="1.5" y="11" width="8" height="3.5" /></svg>
            </button>
            <button
              type="button"
              className={query.layout === "grid" ? "on" : undefined}
              aria-pressed={query.layout === "grid"}
              aria-label="Grid layout, equal boxes"
              title="Grid"
              onClick={() => query.layout !== "grid" && update({ ...query, layout: "grid" })}
            >
              <svg aria-hidden="true" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="5.5" height="5.5" /><rect x="9" y="1.5" width="5.5" height="5.5" /><rect x="1.5" y="9" width="5.5" height="5.5" /><rect x="9" y="9" width="5.5" height="5.5" /></svg>
            </button>
          </span>
        </div>
      </div>

      {hasQuery && (
        <div className="work-active" aria-label="Active filters">
          {query.q.trim() && (
            <button type="button" className="work-tag-chip" onClick={() => update({ ...query, q: "" })} aria-label={`Remove search “${query.q.trim()}”`}>
              “{query.q.trim()}” <span aria-hidden="true">×</span>
            </button>
          )}
          {DIMENSIONS.flatMap((dim) =>
            query.filters[dim.key].map((tag) => (
              <button type="button" className="work-tag-chip" key={`${dim.key}-${tag}`} onClick={() => toggle(dim.key, tag)} aria-label={`Remove ${dim.label}: ${tag}`}>
                <span className="work-tag-dim">{dim.label}</span> {tag} <span aria-hidden="true">×</span>
              </button>
            )),
          )}
          <button type="button" className="work-clear" onClick={clearAll}>Clear all</button>
        </div>
      )}

      <div className="work-tally-row">
        <p className="landing-tally work-tally">
          <b key={bump} className={bump ? "work-bump" : undefined}>{String(visible.length).padStart(2, "0")}</b>
          <span role="status" aria-live="polite">
            {visible.length === 1 ? "project" : "projects"} of {projects.length} · {custom && query.sort === "curated" ? "your arrangement" : `sorted ${query.sort === "curated" ? "by curation" : `by ${sortLabel}`}`}
            {moved && <span className="work-visually-hidden"> {moved}</span>}
          </span>
        </p>
        {visible.length > 1 && (
          <p className="work-drag-hint">
            <span aria-hidden="true">✥</span> Drag cards to rearrange
            {custom && <button type="button" className="work-tidy" onClick={tidy}>Tidy up</button>}
          </p>
        )}
      </div>

      {visible.length ? (
        <ul className="work-grid" aria-label="Projects" onPointerDown={onCardPointerDown} onClickCapture={onCardClickCapture}>
          <li className="work-ghost" ref={ghostRef} aria-hidden="true" />
          {visible.map((project, index) => (
            <li
              key={project.slug}
              data-slug={project.slug}
              ref={(el) => { if (el) nodes.current.set(project.slug, el); else nodes.current.delete(project.slug); }}
              className={`work-card work-card--${slots[index].shape}`}
              style={{
                "--card-tint": `var(--landing-${project.tint})`,
                "--card-tilt": `${index % 2 ? 1 : -0.8}deg`,
                "--col": slots[index].col,
                "--cs": slots[index].colStart,
                "--rs": slots[index].rowStart,
                "--align": slots[index].align,
              } as CSSProperties}
            >
              <ProjectCard project={project} index={index} sample={sample} art={artOf.get(project.slug)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="work-none">
          <h2>No projects match.</h2>
          <p>Try removing a filter, or search for something broader.</p>
          <button type="button" className="work-clear work-clear--solid" onClick={clearAll}>Clear all filters</button>
        </div>
      )}
    </div>
  );
}

function WorkHead() {
  return (
    <header className="work-head">
      <p className="work-eyebrow">Professional work · Concepts · Build Lab</p>
      <h1>Selected Work</h1>
      <p className="work-lede">Filter by discipline, industry or business model, or search for anything. Projects can sit in more than one category.</p>
    </header>
  );
}

function ProjectCard({ project, index, sample, art }: { project: Project; index: number; sample: boolean; art?: string }) {
  const type = project.tags.type[0];
  return (
    <article aria-labelledby={`work-title-${project.slug}`}>
      <p className="work-card-meta">
        <span className="work-card-index">{String(index + 1).padStart(2, "0")}</span>
        <span>{type} · {project.year}</span>
      </p>
      <div className="work-card-art" aria-hidden="true">
        <CardArt type={type} art={art} />
        <span className="work-card-wash" />
      </div>
      <div className="work-card-body">
        <h2 id={`work-title-${project.slug}`}>
          <Link href={`/work/${project.slug}`} className="work-card-link" draggable={false}>{project.title}</Link>
        </h2>
        <p className="work-card-summary">{project.summary}</p>
        <p className="work-card-role">{project.role}</p>
        <ul className="work-card-tags" aria-label="Tags">
          {[...project.tags.discipline, ...project.tags.industry, ...project.tags.model, ...project.tags.product].map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
          {sample && <li className="work-card-sample">Sample</li>}
        </ul>
      </div>
    </article>
  );
}

type PanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCount: number;
  resultCount: number;
  onClear: () => void;
  children: React.ReactNode;
};

/** One "Filters" button; every dimension lives in a single panel. */
function FilterPanel({ open, onOpenChange, activeCount, resultCount, onClear, children }: PanelProps) {
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) onOpenChange(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { onOpenChange(false); button.current?.focus(); } };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open, onOpenChange]);

  return (
    <div className="work-filters" ref={root}>
      <button
        type="button"
        ref={button}
        className={`work-chip work-filters-button${activeCount ? " has-value" : ""}`}
        aria-expanded={open}
        aria-controls="work-filters-panel"
        onClick={() => onOpenChange(!open)}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="work-filters-icon"><path d="M2 4h12M4.5 8h7M7 12h2" /></svg>
        Filters
        {activeCount > 0 && <span className="work-badge" aria-label={`${activeCount} active`}>{activeCount}</span>}
      </button>
      <div className="work-filters-panel" id="work-filters-panel" role="group" aria-label="Filter projects" hidden={!open}>
        {children}
        <div className="work-filters-foot">
          <button type="button" className="work-clear" onClick={onClear} disabled={!activeCount}>Clear filters</button>
          <button type="button" className="work-clear work-clear--solid" onClick={() => { onOpenChange(false); button.current?.focus(); }}>
            Show {resultCount} {resultCount === 1 ? "project" : "projects"}
          </button>
        </div>
      </div>
    </div>
  );
}

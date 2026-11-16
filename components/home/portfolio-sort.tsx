"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Additive sort control for the protected /portfolio quilt.
 * It mounts into the existing toolbar and reorders the existing cards, so the
 * protected page, CSS and reveal components stay untouched. Cards glide to
 * their new slots (FLIP) with the same stagger and easing as the reference
 * playground; the tally number bumps on every change.
 */

type SortKey = "curated" | "az" | "scale" | "colour";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "curated", label: "Curated" },
  { key: "az", label: "A–Z" },
  { key: "scale", label: "Scale" },
  { key: "colour", label: "Colour" },
];

const SCALE: Record<string, number> = { work: 0, concepts: 1, arcade: 1 };

type Card = { el: HTMLElement; index: number; title: string; kind: string; hue: number };

function hueOf(color: string) {
  const hex = color.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return 0;
  const n = parseInt(hex, 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return 0;
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return h * 60;
}

function compare(key: SortKey) {
  const byName = (a: Card, b: Card) => a.title.localeCompare(b.title);
  switch (key) {
    case "az": return byName;
    case "scale": return (a: Card, b: Card) => (SCALE[a.kind] ?? 2) - (SCALE[b.kind] ?? 2) || byName(a, b);
    case "colour": return (a: Card, b: Card) => a.hue - b.hue;
    default: return (a: Card, b: Card) => a.index - b.index;
  }
}

export function PortfolioSort() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [sort, setSort] = useState<SortKey>("curated");
  const cards = useRef<Card[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const toolbar = document.querySelector<HTMLElement>(".home--reference .landing-toolbar");
    const board = document.querySelector<HTMLElement>(".home--reference .landing-board");
    if (!toolbar || !board) return;
    cards.current = [...board.querySelectorAll<HTMLElement>(":scope > .landing-card")].map((el, index) => ({
      el,
      index,
      title: el.querySelector("h3")?.textContent?.trim() ?? "",
      kind: [...el.classList].find((c) => c.startsWith("landing-card--"))?.slice(14) ?? "",
      hue: hueOf(getComputedStyle(el).getPropertyValue("--card-tint")),
    }));
    const slot = document.createElement("span");
    slot.className = "portfolio-sort-host";
    toolbar.appendChild(slot);
    const frame = requestAnimationFrame(() => setHost(slot));
    const pending = timers.current;
    return () => {
      cancelAnimationFrame(frame);
      pending.forEach(clearTimeout);
      slot.remove();
    };
  }, []);

  function apply(key: SortKey) {
    if (key === sort) return;
    setSort(key);
    const list = cards.current;
    const board = document.querySelector<HTMLElement>(".home--reference .landing-board");
    if (!board || !list.length) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // First: where every card is now.
    const before = new Map(list.map((c) => [c.el, c.el.getBoundingClientRect()]));
    timers.current.forEach(clearTimeout);
    timers.current = [];
    list.forEach((c) => { c.el.style.transition = ""; c.el.style.transform = ""; c.el.style.transitionDelay = ""; });

    // Reorder the real DOM so keyboard and reading order follow the visual order.
    const sorted = [...list].sort(compare(key));
    board.dataset.sort = key;
    sorted.forEach((c) => board.appendChild(c.el));

    bumpTally();
    if (reduced) return;

    // Last, Invert, Play: each card starts where it was and glides to its new slot.
    sorted.forEach((c, i) => {
      const from = before.get(c.el)!;
      const to = c.el.getBoundingClientRect();
      const dx = from.left - to.left, dy = from.top - to.top;
      if (!dx && !dy) return;
      const rest = getComputedStyle(c.el).transform;
      const base = rest === "none" ? "" : ` ${rest}`;
      c.el.style.transition = "none";
      c.el.style.transform = `translate(${dx}px, ${dy}px)${base}`;
      void c.el.offsetWidth;
      c.el.style.transition = "transform var(--landing-card-duration) var(--landing-slide)";
      c.el.style.transitionDelay = `${i * 30}ms`;
      c.el.style.transform = base.trim() || "translate(0, 0)";
      timers.current.push(window.setTimeout(() => {
        c.el.style.transition = "";
        c.el.style.transitionDelay = "";
        c.el.style.transform = "";
      }, 900 + i * 30 + 60));
    });
  }

  function bumpTally() {
    const n = document.querySelector<HTMLElement>(".home--reference .landing-tally b");
    if (!n) return;
    n.classList.remove("portfolio-sort-bump");
    requestAnimationFrame(() => {
      n.classList.add("portfolio-sort-bump");
      timers.current.push(window.setTimeout(() => n.classList.remove("portfolio-sort-bump"), 380));
    });
  }

  if (!host) return null;
  const current = SORTS.find((s) => s.key === sort)!;
  return createPortal(
    <>
      <span className="portfolio-sort-rule" aria-hidden="true" />
      <span className="toolbar-label" id="portfolio-sort-label">Sort</span>
      <span className="portfolio-sort-seg" role="group" aria-labelledby="portfolio-sort-label">
        {SORTS.map((s) => (
          <button
            type="button"
            key={s.key}
            className={s.key === sort ? "on" : undefined}
            aria-pressed={s.key === sort}
            onClick={() => apply(s.key)}
          >
            {s.label}
          </button>
        ))}
      </span>
      <span className="portfolio-sort-status" aria-live="polite">
        {sort === "curated" ? "" : `Destinations sorted by ${current.label}`}
      </span>
    </>,
    host,
  );
}

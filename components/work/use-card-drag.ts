"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

/**
 * Mouse drag-to-reorder for the Selected Work quilt, after the reference playground:
 * pick a card up (spring lift), it chases the cursor with a little lag and tilt, a dashed
 * ghost marks its slot, cards re-pack live as it passes over them, and on release it
 * settles into place. Touch keeps native scrolling, so only mouse and pen start a drag.
 */

type Options = {
  /** Called when the dragged card moves over another card's slot. */
  onSwap: (dragSlug: string, overSlug: string) => void;
  /** Called once on release, if the card actually moved. */
  onDrop: (slug: string) => void;
};

type DragState = {
  el: HTMLElement;
  grid: HTMLElement;
  slug: string;
  fx: number; fy: number;      // where the card was grabbed, as a fraction of its size
  px: number; py: number;      // latest pointer position (client coords)
  sx: number; sy: number;      // pointer position at pick-up
  rx: number; ry: number;      // smoothed card position (grid coords)
  scale: number;
  moved: number;
  lastSwap: number;
  frame: number;
  dispose: () => void;
};

const SWAP_COOLDOWN = 180;
const PICKUP_THRESHOLD = 4;

export function useCardDrag(options: Options) {
  const drag = useRef<DragState | null>(null);
  const ghost = useRef<HTMLLIElement>(null);
  const suppressClick = useRef(false);
  const latest = useRef(options);
  useEffect(() => { latest.current = options; });

  useEffect(() => () => {
    const d = drag.current;
    if (d) {
      cancelAnimationFrame(d.frame);
      d.dispose();
      d.el.classList.remove("is-dragging");
      d.el.style.transform = "";
      drag.current = null;
    }
    document.documentElement.classList.remove("work-drag-active");
  }, []);

  function tick() {
    const d = drag.current;
    if (!d) return;
    const g = d.grid.getBoundingClientRect();
    const w = d.el.offsetWidth, h = d.el.offsetHeight;
    const lx = d.el.offsetLeft, ly = d.el.offsetTop;
    const live = d.moved >= PICKUP_THRESHOLD;
    const tx = live ? d.px - g.left - d.fx * w : lx;
    const ty = live ? d.py - g.top - d.fy * h : ly;

    // The card chases the hand rather than snapping to it — a little lag reads as weight.
    d.rx += (tx - d.rx) * 0.32;
    d.ry += (ty - d.ry) * 0.32;
    const lead = tx - d.rx;
    const tilt = Math.max(-9, Math.min(9, lead * 0.16));
    d.scale += (1.07 + Math.min(0.04, Math.abs(lead) * 0.0012) - d.scale) * 0.3;
    d.el.style.transform = `translate(${(d.rx - lx).toFixed(1)}px, ${(d.ry - ly).toFixed(1)}px) rotate(${tilt.toFixed(2)}deg) scale(${d.scale.toFixed(3)})`;

    const gh = ghost.current;
    if (gh) {
      gh.style.left = `${lx}px`; gh.style.top = `${ly}px`;
      gh.style.width = `${w}px`; gh.style.height = `${h}px`;
      gh.classList.add("on");
    }

    // Gentle auto-scroll near the top and bottom of the window.
    if (live && d.py < 80) window.scrollBy(0, -14);
    else if (live && d.py > window.innerHeight - 80) window.scrollBy(0, 14);

    considerSwap(d);
    d.frame = requestAnimationFrame(tick);
  }

  function considerSwap(d: DragState, final = false) {
    // Find the slot under the card; only take it if it is clearly closer than the card's own slot.
    const live = d.moved >= PICKUP_THRESHOLD;
    const w = d.el.offsetWidth, h = d.el.offsetHeight;
    const g = d.grid.getBoundingClientRect();
    const lx = d.el.offsetLeft, ly = d.el.offsetTop;
    const tx = d.px - g.left - d.fx * w, ty = d.py - g.top - d.fy * h;
    const now = performance.now();
    if (live && (final || now - d.lastSwap > SWAP_COOLDOWN)) {
      const cx = tx + w / 2, cy = ty + h / 2;
      const own = Math.hypot(cx - (lx + w / 2), cy - (ly + h / 2));
      let best: HTMLElement | null = null, bd = Infinity;
      d.grid.querySelectorAll<HTMLElement>(":scope > .work-card").forEach((card) => {
        if (card === d.el) return;
        const dist = Math.hypot(cx - (card.offsetLeft + card.offsetWidth / 2), cy - (card.offsetTop + card.offsetHeight / 2));
        if (dist < bd) { bd = dist; best = card; }
      });
      const over = best as HTMLElement | null;
      if (over?.dataset.slug && bd < 420 && bd < own - 24) {
        d.lastSwap = now;
        latest.current.onSwap(d.slug, over.dataset.slug);
      }
    }
  }

  function onMove(e: PointerEvent) {
    const d = drag.current;
    if (!d) return;
    d.px = e.clientX; d.py = e.clientY;
    d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.sx, e.clientY - d.sy));
  }

  function end() {
    const d = drag.current;
    if (!d) return;
    // A quick drop may arrive before RAF paints the last pointer position.
    considerSwap(d, true);
    drag.current = null;
    cancelAnimationFrame(d.frame);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    document.documentElement.classList.remove("work-drag-active");
    ghost.current?.classList.remove("on");

    // Set the card back down into its slot.
    const from = d.el.style.transform;
    d.el.classList.remove("is-dragging");
    d.el.style.transform = "";
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const rest = getComputedStyle(d.el).transform;
      d.el.animate([{ transform: from }, { transform: rest === "none" ? "none" : rest }], {
        duration: 550,
        easing: "cubic-bezier(.18,1.15,.32,1)",
      });
    }
    if (d.moved > 6) {
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 60);
      latest.current.onDrop(d.slug);
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    if (e.pointerType === "touch" || e.button !== 0 || drag.current) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>(".work-card");
    const grid = e.currentTarget;
    if (!el?.dataset.slug || !grid.contains(el)) return;
    e.preventDefault(); // no text selection or native link dragging; click still fires
    el.getAnimations().forEach((a) => a.cancel());
    const r = el.getBoundingClientRect();
    drag.current = {
      el, grid, slug: el.dataset.slug,
      fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height,
      px: e.clientX, py: e.clientY, sx: e.clientX, sy: e.clientY,
      rx: el.offsetLeft, ry: el.offsetTop,
      scale: 1, moved: 0, lastSwap: 0, frame: 0,
      dispose: () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
      },
    };
    el.classList.add("is-dragging");
    document.documentElement.classList.add("work-drag-active");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    drag.current.frame = requestAnimationFrame(tick);
  }

  /** A drag that moved should not also open the case study. */
  function onClickCapture(e: ReactMouseEvent) {
    if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); }
  }

  /** Slug of the card being dragged, so layout animations leave it alone. */
  const draggingSlug = () => drag.current?.slug;

  return { onPointerDown, onClickCapture, ghostRef: ghost, draggingSlug };
}

"use client";

import { useEffect, useRef } from "react";

/** Thin bar at the top of the window showing how far the page has been read. Decorative. */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => { removeEventListener("scroll", update); removeEventListener("resize", update); };
  }, []);
  return <div ref={bar} className="tpl-progress" aria-hidden="true" />;
}

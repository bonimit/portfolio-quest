"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function LandingReveals({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = root.current?.querySelectorAll<HTMLElement>(".landing-card");
    if (!cards) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!reduced.matches) (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return <div className="landing-board" ref={root}>{children}</div>;
}

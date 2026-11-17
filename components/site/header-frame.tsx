"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function HeaderFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/portfolio";
  const isIsland = pathname === "/" || pathname === "/quest-preview/concept-scene";
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isIsland) {
      document.documentElement.style.setProperty("--site-header-height", "0px");
      return () => document.documentElement.style.removeProperty("--site-header-height");
    }
    const header = root.current;
    if (!header) return;
    const update = () => document.documentElement.style.setProperty("--site-header-height", `${header.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, [isLanding, isIsland]);

  if (isIsland) return null;

  return (
    <header
      id="page-top"
      className={`site-header site-header--landing${pathname === "/world" ? " site-header--adventure" : ""}`}
      style={isLanding ? undefined : {height:"var(--site-header-height, 4rem)"}}
      tabIndex={-1}
    >
      <div className="site-header-frame" ref={root}>{children}</div>
    </header>
  );
}

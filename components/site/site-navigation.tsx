"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ADVENTURE_PREVIEW_LABEL,
  getModeCurrent,
  getSectionCurrent,
  navigation,
} from "@/lib/shared/navigation";

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="site-nav">
      <ul>
        {navigation.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} aria-current={getSectionCurrent(pathname, href)}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ModeNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Exploration modes" className="mode-links">
      <Link href="/work" aria-current={getModeCurrent(pathname, "portfolio")}>
        View Portfolio <span aria-hidden="true">↗</span>
      </Link>
      <Link href="/world" aria-current={getModeCurrent(pathname, "world")}>
        {ADVENTURE_PREVIEW_LABEL}
      </Link>
    </nav>
  );
}

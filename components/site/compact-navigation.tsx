"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSectionCurrent, navigation } from "@/lib/shared/navigation";

export function CompactNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        // A click on non-focusable content must not leave focus in the hidden menu.
        if (root.current?.querySelector(".compact-menu")?.contains(document.activeElement)) button.current?.focus({ preventScroll: true });
        setOpen(false);
      }
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 56rem)");
    const closeOnDesktop = () => { if (!mobile.matches) setOpen(false); };
    mobile.addEventListener("change", closeOnDesktop);
    return () => mobile.removeEventListener("change", closeOnDesktop);
  }, []);

  const links = navigation;

  return (
    <div className="compact-header" ref={root} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <Link href="/" className="compact-brand" aria-label="Portfolio Quest island home" onClick={() => setOpen(false)}>Portfolio Quest <span aria-hidden="true">✳</span></Link>
      <nav aria-label="Main navigation">
        <ul className="compact-direct-links">
          {links.filter(({ href }) => href !== "/").map(({ href, label }) => (
            <li key={href}><Link href={href} aria-current={getSectionCurrent(pathname, href)} onClick={() => setOpen(false)}>{label}</Link></li>
          ))}
        </ul>
        <button ref={button} type="button" className="compact-menu-button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((value) => !value)}>Menu <span aria-hidden="true">{open ? "−" : "+"}</span></button>
        <div className="compact-menu" id="site-menu" hidden={!open}>
          <ul>{links.map(({ href, label }) => <li key={href}><Link href={href} aria-current={getSectionCurrent(pathname, href)} onClick={() => setOpen(false)}>{label}</Link></li>)}</ul>
        </div>
      </nav>
    </div>
  );
}

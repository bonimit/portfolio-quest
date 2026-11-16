"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
export type EntrancePath = "/portfolio" | "/world";
export function PathTransition({ path, onCancel }: { path: EntrancePath; onCancel: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    cancel.current?.focus();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let entered = false;
    const enter = () => { if (!entered) { entered = true; router.push(path); } };
    const timer = window.setTimeout(enter, reduced.matches ? 0 : 1200);
    const preference = () => { if (reduced.matches) { clearTimeout(timer); enter(); } };
    reduced.addEventListener("change", preference);
    return () => { clearTimeout(timer); reduced.removeEventListener("change", preference); element?.close(); };
  }, [path, router]);
  function close() { dialog.current?.close(); onCancel(); }
  return <dialog ref={dialog} className={`path-transition path-transition--${path === "/portfolio" ? "portfolio" : "world"}`} aria-labelledby="transition-title" onCancel={(e) => { e.preventDefault(); close(); }}>
    <div className="path-wipe" aria-hidden="true" />
    <div className="path-transition-message"><h2 id="transition-title">Opening {path === "/portfolio" ? "Portfolio" : "Adventure"}…</h2><button type="button" ref={cancel} onClick={close}>Cancel</button><p>Escape also cancels</p></div>
  </dialog>;
}

/** Empty batches, late callbacks, and browsers without IO must remain safe. */
export function observeGuideVisibility(target: Element, change: (visible: boolean) => void) {
  if (typeof IntersectionObserver === 'undefined') { change(true); return () => {}; }
  let active = true;
  let previous: boolean | undefined;
  const observer = new IntersectionObserver((entries) => {
    if (!active) return;
    let latest: IntersectionObserverEntry | undefined;
    for (const entry of entries) if (entry.target === target) latest = entry;
    if (latest && latest.isIntersecting !== previous) { previous = latest.isIntersecting; change(previous); }
  });
  observer.observe(target);
  return () => { active = false; observer.disconnect(); };
}

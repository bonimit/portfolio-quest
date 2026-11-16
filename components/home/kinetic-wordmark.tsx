"use client";

import { useEffect, useRef, useState } from "react";
import { LETTER_WEIGHTS, springStep } from "@/lib/shared/landing-motion";

type KineticWordmarkProps = { firstLine: string; secondLine: string; id: string };

export function KineticWordmark({ firstLine, secondLine, id }: KineticWordmarkProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    const lines = Array.from(root.querySelectorAll<HTMLElement>(".kinetic-line"));
    const section = root.closest("section");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 48rem)");
    let disposed = false;
    let fitFrame = 0;
    let motionFrame = 0;
    let visible = false;
    let lastWidth = 0;
    let previousScroll = scrollY;
    let previousTime = performance.now();
    let velocity = 0;
    let stretch = 1;

    function fit() {
      if (disposed || !context || !root) return;
      root.dataset.enhanced = "true";
      const rootStyle = getComputedStyle(root);
      const width = root.clientWidth - parseFloat(rootStyle.paddingLeft) - parseFloat(rootStyle.paddingRight);
      if (!width) return;
      lines.forEach((line, lineIndex) => {
        const style = getComputedStyle(line);
        const size = parseFloat(style.fontSize);
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const letters = Array.from(line.querySelectorAll<HTMLElement>(".kinetic-letter"));
        const gap = Math.min(Math.max(4, innerWidth * .006), width / (letters.length * 2));
        const metrics = letters.map((letter) => {
          const char = letter.dataset.char ?? "";
          const ink = context.measureText(char);
          const inkWidth = ink.actualBoundingBoxLeft + ink.actualBoundingBoxRight;
          return char === " " || !Number.isFinite(inkWidth) || inkWidth <= 0
            ? { left: 0, width: size * .12 }
            : { left: -ink.actualBoundingBoxLeft, width: inkWidth };
        });
        const weightedWidth = metrics.reduce((sum, metric, index) =>
          sum + metric.width * LETTER_WEIGHTS[(index + lineIndex * 3) % LETTER_WEIGHTS.length], 0);
        const base = (width - gap * (letters.length - 1)) / weightedWidth;
        letters.forEach((letter, index) => {
          const scale = base * LETTER_WEIGHTS[(index + lineIndex * 3) % LETTER_WEIGHTS.length];
          const metric = metrics[index];
          const ink = letter.firstElementChild as HTMLElement;
          letter.style.width = `${metric.width * scale + (index < letters.length - 1 ? gap : 0)}px`;
          ink.style.transform = `translateX(${-metric.left * scale}px) scaleX(${scale})`;
        });
      });
    }

    function queueFit() {
      cancelAnimationFrame(fitFrame);
      fitFrame = requestAnimationFrame(fit);
    }

    function resetMotion() {
      cancelAnimationFrame(motionFrame);
      motionFrame = 0;
      velocity = 0;
      stretch = 1;
      lines.forEach((line) => { line.style.transform = ""; });
      previousScroll = scrollY;
      previousTime = performance.now();
      if (section) section.dataset.motionActive = String(canAnimate());
    }

    function canAnimate() {
      return !disposed && visible && desktop.matches && !reduced.matches && !document.hidden && !paused;
    }

    function tick() {
      motionFrame = 0;
      if (!canAnimate()) { resetMotion(); return; }
      const direction = Math.sign(velocity) || 1;
      ({ velocity, stretch } = springStep(velocity, stretch));
      lines.forEach((line, index) => {
        const scale = 1 + (stretch - 1) * (index === 0 ? 1 : .8);
        line.style.transform = `scaleY(${scale}) translateY(${direction * (stretch - 1) * -8}px)`;
      });
      if (Math.abs(velocity) > .001 || Math.abs(stretch - 1) > .001) {
        motionFrame = requestAnimationFrame(tick);
      } else {
        resetMotion();
      }
    }

    function onScroll() {
      const now = performance.now();
      if (canAnimate()) {
        velocity = (scrollY - previousScroll) / Math.max(1, now - previousTime);
        if (!motionFrame) motionFrame = requestAnimationFrame(tick);
      }
      previousScroll = scrollY;
      previousTime = now;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== lastWidth) {
        lastWidth = entry.contentRect.width;
        queueFit();
      }
    });
    resizeObserver.observe(root);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (section) section.dataset.motionActive = String(canAnimate());
      if (!visible) resetMotion();
    });
    visibilityObserver.observe(root.closest("section") ?? root);
    reduced.addEventListener("change", resetMotion);
    desktop.addEventListener("change", resetMotion);
    document.addEventListener("visibilitychange", resetMotion);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.fonts.addEventListener("loadingdone", queueFit);
    void document.fonts.ready.then(() => { if (!disposed) queueFit(); });
    fit();

    return () => {
      disposed = true;
      cancelAnimationFrame(fitFrame);
      resetMotion();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reduced.removeEventListener("change", resetMotion);
      desktop.removeEventListener("change", resetMotion);
      document.removeEventListener("visibilitychange", resetMotion);
      window.removeEventListener("scroll", onScroll);
      document.fonts.removeEventListener("loadingdone", queueFit);
    };
  }, [firstLine, secondLine, paused]);

  return (
    <>
    <button type="button" className="motion-toggle" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
      Pause motion
    </button>
    <h1 id={id} ref={rootRef} className="kinetic-wordmark">
      <span className="sr-only">{firstLine} {secondLine}</span>
      {[firstLine, secondLine].map((line, lineIndex) => (
        <span className="kinetic-line" aria-hidden="true" key={lineIndex}>
          {Array.from(line.toUpperCase()).map((char, index) => (
            <span className="kinetic-letter" data-char={char} key={index}>
              <span className="kinetic-ink">{char === " " ? "\u00a0" : char}</span>
            </span>
          ))}
        </span>
      ))}
    </h1>
    </>
  );
}

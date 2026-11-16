"use client";
import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { WalkingGuide } from "./walking-guide";
import { LocalGuide } from "./local-guide";
import { PathTransition, type EntrancePath } from "./path-transition";
export function EntranceExperience() {
  const [pending, setPending] = useState<EntrancePath | null>(null);
  const [avatarPaused, setAvatarPaused] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<'portfolio' | 'world' | null>(null);
  const [notice, setNotice] = useState("");
  const origin = useRef<HTMLElement | null>(null);
  const guideOrigin = useRef<HTMLElement | null>(null);
  const intro = useRef<HTMLElement>(null);
  const paths = useRef<HTMLElement>(null);
  const character = useRef<HTMLDivElement>(null);
  const previous = useRef<{ element: HTMLElement; rect: DOMRect }[]>([]);
  const stageAnimations = useRef<Animation[]>([]);
  const cancellation = useRef(0);
  const captureStage = useCallback(() => {
    stageAnimations.current.forEach(animation => animation.cancel());
    previous.current = [intro.current, paths.current, character.current].filter((element): element is HTMLElement => !!element).map(element => ({ element, rect: element.getBoundingClientRect() }));
  }, []);
  useLayoutEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => stageAnimations.current.forEach(animation => animation.cancel());
    preference.addEventListener('change', stop);
    if (!avatarPaused && !preference.matches) {
      stageAnimations.current = previous.current.flatMap(({element, rect}) => {
        const next = element.getBoundingClientRect();
        if (typeof element.animate !== 'function') return [];
        return [element.animate([{ transform: `translate(${rect.x-next.x}px, ${rect.y-next.y}px)` }, {transform: 'none'}], {duration: 420, easing: 'cubic-bezier(.16,1,.3,1)'})];
      });
    }
    previous.current = [];
    return () => { preference.removeEventListener('change', stop); stop(); };
  }, [guideOpen, avatarPaused]);
  const closeGuide = useCallback((restoreFocus: boolean) => {
    captureStage(); setGuideOpen(false); setSuggestion(null);
    if (restoreFocus && guideOrigin.current?.isConnected) guideOrigin.current.focus({ preventScroll: true });
  }, [captureStage]);
  const cancelPath = useCallback(() => { setPending(null); setNotice(`Transition cancelled (${++cancellation.current}). You are at the entrance.`); origin.current?.focus(); }, []);
  function choose(event: MouseEvent<HTMLAnchorElement>, path: EntrancePath) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault(); setGuideOpen(false); setSuggestion(null); origin.current = event.currentTarget; setPending(path);
  }
  return <div className={`title-screen${guideOpen ? " title-screen--companion" : ""}`} data-paused={avatarPaused}>
    <div className="title-screen-landscape" aria-hidden="true"><span className="title-moon" /><span className="title-horizon" /><span className="title-ground" /></div>
    <div className="title-screen-content">
      <section className="entrance-intro" ref={intro} aria-labelledby="entrance-title">
        <p className="title-kicker">Choose your path</p>
        <h1 id="entrance-title">PORTFOLIO<br /><span>QUEST</span></h1>
      </section>
      <nav className="title-paths" ref={paths} aria-label="Choose your path">
        <Link href="/portfolio" className="title-path title-path--portfolio" data-suggested={suggestion === 'portfolio'} onClick={(event) => choose(event, "/portfolio")}><span>PORTFOLIO</span><small>The orange editorial homepage</small></Link>
        <Link href="/world" className="title-path title-path--adventure" data-suggested={suggestion === 'world'} onClick={(event) => choose(event, "/world")} aria-describedby="adventure-status"><span>ADVENTURE</span><small id="adventure-status">Playable prototypes</small></Link>
      </nav>
      <div className="entrance-character" ref={character}>
        <WalkingGuide paused={avatarPaused} onPause={() => setAvatarPaused((value) => !value)} conversationOpen={guideOpen} onTalk={(button) => { guideOrigin.current = button; captureStage(); if (guideOpen) closeGuide(false); else setGuideOpen(true); }} />
      </div>
      {guideOpen ? <LocalGuide anchorRef={guideOrigin} animationPaused={avatarPaused} onSuggest={setSuggestion} onClose={closeGuide} /> : null}
    </div>
    <div className="sr-only" role="status" aria-atomic="true">{notice}</div>
    {pending ? <PathTransition path={pending} onCancel={cancelPath} /> : null}
  </div>;
}

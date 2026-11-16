"use client";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { GUIDE_INPUT_LIMIT, guidePrompts, localGuideProvider, resolveGuideAction, type GuideAnswer } from "@/lib/guide/local-guide";
import { GuidePortrait } from './guide-portrait';
import type { AvatarActivity } from '@/lib/guide/assistant-motion';
import { ConversationActivity } from '@/lib/guide/conversation-activity';
import { companionExitDelay, dismissesCompanion, shouldRestoreCompanionFocus, suggestedPath } from '@/lib/guide/panel-interaction';
type Message = { number: number; question: string; answer?: GuideAnswer; error?: string };
export function LocalGuide({ onClose, animationPaused, onSuggest, anchorRef }: { anchorRef?: RefObject<HTMLElement | null>; onClose: (restoreFocus: boolean) => void; animationPaused: boolean; onSuggest?: (path: 'portfolio' | 'world' | null) => void }) {
  const panel = useRef<HTMLElement>(null);
  const exitTimer = useRef(0);
  const exiting = useRef(false);
  const [closing, setClosing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);
  const mounted = useRef(true);
  const activityPlayer = useRef<ConversationActivity | null>(null);
  const [activity, setActivity] = useState<AvatarActivity>('wave');
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  useLayoutEffect(() => {
    const anchor = anchorRef?.current;
    if (!anchor || !panel.current) return;
    const from = anchor.getBoundingClientRect(), to = panel.current.getBoundingClientRect();
    panel.current.style.setProperty('--guide-origin-x', `${from.x+from.width/2-to.x}px`);
    panel.current.style.setProperty('--guide-origin-y', `${from.y+from.height/2-to.y}px`);
    panel.current.dataset.origin = 'ready';
  }, [anchorRef]);
  const close = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    setClosing(true);
    const delay = companionExitDelay(matchMedia('(prefers-reduced-motion: reduce)').matches, animationPaused);
    const finish = () => onClose(shouldRestoreCompanionFocus(panel.current, document.activeElement));
    if (!delay) finish();
    else exitTimer.current = window.setTimeout(finish, delay);
  }, [animationPaused, onClose]);
  useEffect(() => {
    mounted.current = true;
    panel.current?.focus();
    activityPlayer.current = new ConversationActivity(setActivity);
    activityPlayer.current.greet();
    return () => { mounted.current = false; activityPlayer.current?.destroy(); activityPlayer.current = null; clearTimeout(exitTimer.current); };
  }, []);
  useEffect(() => { if (history.current) history.current.scrollTop = history.current.scrollHeight; }, [messages]);
  async function ask(value: string) {
    if (busy) return;
    const trimmed = value.trim();
    if (!trimmed) { activityPlayer.current?.idle(); setError("Enter a question or choose an example."); return; }
    activityPlayer.current?.idle();
    const number = ++sequence.current;
    setError(""); setQuestion(""); setBusy(true);
    setMessages((items) => [...items.slice(-9), { number, question: trimmed }]);
    try {
      const answer = await localGuideProvider.respond(trimmed);
      if (!mounted.current) return;
      setMessages((items) => items.map((item) => item.number === number ? { ...item, answer } : item));
      const suggestion = suggestedPath(answer);
      onSuggest?.(suggestion);
      setAnnouncement(`Reply ${number}. ${answer.text}${suggestion ? ` Suggested path: ${suggestion === 'portfolio' ? 'Portfolio' : 'Adventure'}.` : ''}`);
      activityPlayer.current?.answer(answer.avatarCue);
    } catch {
      if (!mounted.current) return;
      const failure = "The local guide couldn’t reply. Try again, or close the guide and use either path button.";
      setMessages((items) => items.map((item) => item.number === number ? { ...item, error: failure } : item));
      onSuggest?.(null);
      setAnnouncement(`Reply ${number}. ${failure}`);
      activityPlayer.current?.idle();
    } finally { if (mounted.current) { setBusy(false); if (shouldRestoreCompanionFocus(panel.current, document.activeElement)) input.current?.focus({ preventScroll: true }); } }
  }
  function submit(event: FormEvent) { event.preventDefault(); void ask(question); }
  return <aside ref={panel} tabIndex={-1} id="companion-panel" className={`guide-dialog${closing ? ' guide-dialog--closing' : ''}`} aria-labelledby="guide-title" aria-describedby="guide-disclosure" data-paused={animationPaused} onKeyDown={(event) => {
    if (dismissesCompanion(event.nativeEvent, !!panel.current?.contains(event.target as Node))) { event.preventDefault(); close(); }
  }}>
    <div className="guide-paper-edge" aria-hidden="true" />
    <header><div className="guide-identity"><GuidePortrait paused={animationPaused} activity={activity} /><div><p className="guide-eyebrow">A little direction</p><h2 id="guide-title">Wayfinder<span aria-hidden="true">.</span></h2></div></div><button className="guide-close" type="button" onClick={close} aria-label="Close guide"><span aria-hidden="true">×</span></button></header>
    <p id="guide-disclosure">Scripted guide · Not AI</p>
    <div className="guide-history" ref={history} role="log" aria-label="Conversation history" aria-live="off" tabIndex={0}>
      {!messages.length ? <div className="guide-welcome"><span className="guide-chapter" aria-hidden="true">01 / A fork in the road</span><p>Every good quest<br />starts with a choice.</p><span>Portfolio opens Selected Work. Adventure opens three playable prototype demos.</span><nav aria-label="Choose a destination"><Link href="/work">Portfolio ↗</Link><Link href="/world">Adventure ↗</Link></nav></div> : messages.map((message) => <div className="guide-exchange" key={message.number}><p><strong>You ask</strong> {message.question}</p>{message.answer ? <><p><strong>Wayfinder</strong> {message.answer.text}</p><nav aria-label={`Destinations for reply ${message.number}`}>{message.answer.actions.map((id) => { const action = resolveGuideAction(id); return action ? <Link key={id} href={action.href}>{action.label} ↗</Link> : null; })}</nav></> : message.error ? <p>{message.error}</p> : <p>Preparing local reply…</p>}</div>)}
    </div>
    <div className="guide-examples" aria-label="Example questions">{guidePrompts.slice(0, 2).map((prompt) => <button key={prompt} type="button" disabled={busy} onClick={() => void ask(prompt)}>{prompt}</button>)}</div>
    <form onSubmit={submit} noValidate><label htmlFor="guide-question">Ask Wayfinder</label><div className="guide-input-row"><input ref={input} id="guide-question" value={question} onChange={(e) => { setQuestion(e.target.value); setError(""); }} maxLength={GUIDE_INPUT_LIMIT} autoComplete="off" placeholder="Which way should I go?" aria-invalid={!!error} aria-describedby={error ? "guide-error" : "guide-disclosure"} /><button type="submit" disabled={busy}>Send</button></div>{error ? <p id="guide-error" role="alert">{error}</p> : null}</form>
    <p className="guide-footnote">Just local directions. Your questions stay in this tab.</p>
    <div className="sr-only" role="status" aria-atomic="true">{announcement}</div>
  </aside>;
}

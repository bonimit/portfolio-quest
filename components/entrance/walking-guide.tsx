'use client';
import { useEffect, useRef } from 'react';
import { walkDuration, wanderTarget } from '@/lib/guide/walking';
import { SpritePlayer } from '@/lib/guide/sprite-player';
import { travelKeyframes, travelClockProgress, holdsGuideFocus, turnFrames, type Facing } from '@/lib/guide/assistant-motion';
import { GuideSprite } from './guide-sprite';
import { ASSISTANT_ATLAS } from '@/lib/guide/assistant-atlas';
import { observeGuideVisibility } from '@/lib/guide/observe-visibility';

type Director = { pause: (value: boolean) => void; converse: (value: boolean) => void };

export function WalkingGuide({ conversationOpen, paused, onPause, onTalk }: { conversationOpen: boolean; paused: boolean; onPause: () => void; onTalk: (button: HTMLButtonElement) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const avatar = useRef<HTMLButtonElement>(null);
  const spriteRoot = useRef<HTMLSpanElement>(null);
  const director = useRef<Director | null>(null);

  useEffect(() => {
    const arena = stage.current, actor = avatar.current, sprite = spriteRoot.current;
    if (!arena || !actor || !sprite) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, visible = true, hovered = false, focused = false, stopped = false, conversing = false, keyboardModality = true, pressed = false;
    let timer = 0, frameTimer = 0, step = 0, x = 16;
    let facing: Facing = 'front';
    let movement: Animation | null = null;
    let travel: { from: number; to: number; duration: number } | null = null;
    const limit = (value: number) => Math.max(0,Math.min(Math.max(0,arena.clientWidth-actor.offsetWidth),value));
    const staticMode = () => reduced.matches || stopped || document.hidden || !visible;
    const blocked = () => staticMode() || conversing || hovered || focused || pressed || disposed;
    const elapsed = () => typeof movement?.currentTime === 'number' ? movement.currentTime : 0;
    const freezePosition = () => {
      clearTimeout(timer); cancelAnimationFrame(frameTimer);
      if (travel && movement) x = travel.from+(travel.to-travel.from)*travelClockProgress(elapsed(),travel.duration);
      x = limit(x);
      actor.style.transform = `translateX(${x}px)`;
      movement?.cancel(); movement = null; travel = null;
    };
    const player = new SpritePlayer(sprite,() => restart());
    const face = (target: Facing, complete: () => void) => {
      const displayed = Number(sprite.dataset.frame);
      const turnIndex = (ASSISTANT_ATLAS.groups.turn as readonly number[]).indexOf(displayed);
      const actualFacing = turnIndex >= 0 ? (['front','right','back','left','front'] as const)[turnIndex] : facing;
      const sequence = turnFrames(actualFacing,target);
      facing = target; actor.dataset.facing = target;
      if (sequence.length) player.sequence('turn',sequence,false,complete);
      else complete();
    };
    const rest = () => {
      if (disposed) return;
      player.play('idle-front');
      if (!blocked()) timer = window.setTimeout(beginWalk,2200);
    };
    const finishWalk = () => {
      if (!travel || disposed) return;
      x = limit(travel.to); actor.style.transform = `translateX(${x}px)`;
      movement?.cancel(); movement = null; travel = null; cancelAnimationFrame(frameTimer);
      face('front',rest);
    };
    const beginWalk = () => {
      if (blocked() || !player.ready || typeof actor.animate !== 'function') return;
      const to = wanderTarget(arena.clientWidth,actor.offsetWidth,++step);
      if (Math.abs(to-x) < 2) { timer = window.setTimeout(beginWalk,2200); return; }
      const direction = to>x ? 'right' : 'left';
      face(direction,() => {
        if (blocked()) return;
        const from = x, duration = walkDuration(to-from);
        travel = { from,to,duration };
        movement = actor.animate(travelKeyframes(from,to,duration),{ duration,fill:'forwards',easing:'linear' });
        const animation = movement;
        animation.onfinish = () => { if (movement === animation) finishWalk(); };
        const frame = () => {
          if (!travel || movement !== animation || disposed) return;
          const distance = Math.abs(to-from)*travelClockProgress(elapsed(),duration);
          player.walk(direction,distance);
          frameTimer = requestAnimationFrame(frame);
        };
        frame();
      });
    };
    function restart(greet = false) {
      if (disposed || !actor) return;
      freezePosition();
      if (staticMode() || !player.ready) { facing = 'front'; actor.dataset.facing = 'front'; player.staticFront(); return; }
      face('front',() => {
        if (conversing) player.staticFront();
        else if (greet && !staticMode()) player.play('wave',rest);
        else rest();
      });
    }
    const enter = (event: PointerEvent) => { if (event.pointerType !== 'touch') { hovered = true; restart(true); } };
    const leave = (event: PointerEvent) => { if (event.pointerType !== 'touch') { hovered = false; restart(); } };
    const focus = () => { focused = holdsGuideFocus(keyboardModality,actor.matches(':focus-visible')); restart(focused); };
    const blur = () => { focused = false; restart(); };
    const touchDown = (event: PointerEvent) => { if (event.pointerType === 'touch') { pressed = true; restart(true); } };
    const touchUp = (event: PointerEvent) => { if (event.pointerType === 'touch') { pressed = false; focused = holdsGuideFocus(keyboardModality,actor.matches(':focus-visible')); restart(); } };
    const pointerModality = () => { keyboardModality = false; };
    const keyboard = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || ['Shift','Control','Alt','Meta'].includes(event.key)) return;
      keyboardModality = true;
      if (document.activeElement === actor) { focused = holdsGuideFocus(true,actor.matches(':focus-visible')); restart(); }
    };
    const environment = () => restart();
    director.current = {
      pause: (value) => { stopped = value; restart(); },
      converse: (value) => { conversing = value; if (!value) { pressed = false; hovered = false; focused = holdsGuideFocus(keyboardModality,actor.matches(':focus-visible')); } restart(); },
    };
    document.addEventListener('pointerdown',pointerModality,true); document.addEventListener('keydown',keyboard,true);
    actor.addEventListener('pointerenter',enter); actor.addEventListener('pointerleave',leave);
    actor.addEventListener('pointerdown',touchDown); actor.addEventListener('pointerup',touchUp); actor.addEventListener('pointercancel',touchUp);
    actor.addEventListener('focus',focus); actor.addEventListener('blur',blur);
    document.addEventListener('visibilitychange',environment); reduced.addEventListener('change',environment);
    const resize = new ResizeObserver(environment); resize.observe(arena);
    const stopObserving = observeGuideVisibility(arena, (isVisible) => { visible = isVisible; restart(); });
    restart();
    return () => {
      document.removeEventListener('pointerdown',pointerModality,true); document.removeEventListener('keydown',keyboard,true);
      disposed = true; clearTimeout(timer); cancelAnimationFrame(frameTimer); movement?.cancel(); player.destroy();
      resize.disconnect(); stopObserving();
      actor.removeEventListener('pointerdown',touchDown); actor.removeEventListener('pointerup',touchUp); actor.removeEventListener('pointercancel',touchUp);
      actor.removeEventListener('pointerenter',enter); actor.removeEventListener('pointerleave',leave); actor.removeEventListener('focus',focus); actor.removeEventListener('blur',blur);
      document.removeEventListener('visibilitychange',environment); reduced.removeEventListener('change',environment);
      director.current = null;
    };
  }, []);

  useEffect(() => { director.current?.pause(paused); }, [paused]);
  useEffect(() => { director.current?.converse(conversationOpen); }, [conversationOpen]);

  return <section className="wayfinder-stage" aria-label="Walking guide">
    <div className="wayfinder-arena" ref={stage}>
      <button ref={avatar} type="button" className="wayfinder-avatar" onClick={(event) => onTalk(event.currentTarget)} aria-label="Talk to me — Wayfinder, the local scripted guide" aria-controls={conversationOpen ? "companion-panel" : undefined} aria-expanded={conversationOpen} data-facing="front">
        <GuideSprite spriteRef={spriteRoot} />
        <span className="avatar-caption">Talk to me</span>
      </button>
    </div>
    <div className="wayfinder-caption"><span>Wayfinder <small>· local guide</small></span><button type="button" onClick={onPause}>{paused ? 'Resume animation' : 'Pause animation'}</button></div>
  </section>;
}

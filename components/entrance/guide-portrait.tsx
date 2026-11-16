'use client';
import { useEffect, useRef } from 'react';
import { SpritePlayer } from '@/lib/guide/sprite-player';
import type { AvatarActivity } from '@/lib/guide/assistant-motion';
import { GuideSprite } from './guide-sprite';
import { observeGuideVisibility } from '@/lib/guide/observe-visibility';

export function GuidePortrait({ activity, paused }: { activity: AvatarActivity; paused: boolean }) {
  const root = useRef<HTMLSpanElement>(null);
  const player = useRef<SpritePlayer | null>(null);
  const latest = useRef(activity);
  const visible = useRef(true);
  const pause = useRef(paused);
  useEffect(() => {
    if (!root.current) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const sprite = player.current;
      if (!sprite) return;
      if (pause.current || reduced.matches || document.hidden || !visible.current) sprite.staticFront();
      else sprite.play(latest.current);
    };
    player.current = new SpritePlayer(root.current,update);
    const stopObserving = observeGuideVisibility(root.current, (isVisible) => { visible.current = isVisible; update(); });
    reduced.addEventListener('change',update); document.addEventListener('visibilitychange',update);
    update();
    return () => { stopObserving(); reduced.removeEventListener('change',update); document.removeEventListener('visibilitychange',update); player.current?.destroy(); player.current = null; };
  }, []);
  useEffect(() => {
    latest.current = activity;
    pause.current = paused;
    if (!paused && !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden && visible.current) player.current?.play(activity);
    else player.current?.staticFront();
  }, [activity, paused]);
  return <span className="guide-portrait"><GuideSprite spriteRef={root} /></span>;
}

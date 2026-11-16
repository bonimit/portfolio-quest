import Image from 'next/image';
import type { CSSProperties, Ref } from 'react';
import { ASSISTANT_ATLAS } from '@/lib/guide/assistant-atlas';

/** Decorative art; the parent button/dialog supplies the accessible name. */
export function GuideSprite({ spriteRef }: { spriteRef?: Ref<HTMLSpanElement> }) {
  return <span className="assistant-sprite" ref={spriteRef} style={{ '--sprite-columns': ASSISTANT_ATLAS.columns, '--sprite-rows': ASSISTANT_ATLAS.rows } as CSSProperties} aria-hidden="true" data-pose="idle-front" data-frame="0">
    <Image className="assistant-poster" src={ASSISTANT_ATLAS.poster} width={ASSISTANT_ATLAS.width} height={ASSISTANT_ATLAS.height} alt="" unoptimized loading="eager" draggable={false} />
    <Image className="assistant-sheet" src={ASSISTANT_ATLAS.src} width={ASSISTANT_ATLAS.width*ASSISTANT_ATLAS.columns} height={ASSISTANT_ATLAS.height*ASSISTANT_ATLAS.rows} alt="" unoptimized loading="eager" draggable={false} />
  </span>;
}

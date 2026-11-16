import Image from 'next/image';
import type {Ref} from 'react';
import {PROVIDED_AVATAR} from '@/lib/quest-preview/provided-avatar';
import {ASSISTANT_ATLAS} from '@/lib/guide/assistant-atlas';

/** Isolated supplied atlas; entrance and conversation portraits keep their original art. */
export function QuestGuideSprite({spriteRef}:{spriteRef?:Ref<HTMLSpanElement>}){
  return <span className="assistant-sprite" ref={spriteRef} style={{translate:'none',rotate:'none'}} aria-hidden="true" data-atlas="provided" data-pose="idle-front" data-frame="0">
    <Image className="assistant-poster" src={ASSISTANT_ATLAS.poster} width={144} height={176} alt="" unoptimized loading="eager" draggable={false}/>
    <Image className="assistant-sheet" src={PROVIDED_AVATAR.src} width={712} height={1500} alt="" unoptimized loading="eager" draggable={false}/>
  </span>;
}

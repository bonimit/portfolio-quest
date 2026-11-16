import Image from 'next/image';
import type {RefObject} from 'react';
import {PET_SPRITES} from '@/lib/quest-preview/restored/pet-sprites';
export function QuestPets({capybaraRef,catRef}:{capybaraRef:RefObject<HTMLDivElement|null>;catRef:RefObject<HTMLDivElement|null>}){
  return <>{(['capybara','cat'] as const).map(pet=><div key={pet} ref={pet==='cat'?catRef:capybaraRef} className={`quest-reference-pet quest-reference-pet--${pet}`} aria-hidden="true">
    <span className="quest-pet-shadow"/><span className="quest-pet-facing"><span className="quest-pet-clip"><Image className="quest-pet-sheet" src={PET_SPRITES[pet].src} alt="" width={1280} height={512} unoptimized /></span></span>
  </div>)}</>;
}

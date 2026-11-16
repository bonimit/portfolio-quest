import Image from 'next/image';
import type {MutableRefObject} from 'react';
import {PET_SPRITES,PET_IDS,type Pet} from '@/lib/quest-preview/pet-sprites';
export function QuestPets({petRefs}:{petRefs:MutableRefObject<Partial<Record<Pet,HTMLDivElement>>>}){
  return <>{PET_IDS.map(pet=><div key={pet} ref={node=>{if(node)petRefs.current[pet]=node;else delete petRefs.current[pet];}} className={`quest-reference-pet quest-reference-pet--${pet}`} aria-hidden="true">
    <span className="quest-pet-shadow"/><span className="quest-pet-facing"><span className="quest-pet-clip"><Image className="quest-pet-sheet" src={PET_SPRITES[pet].src} alt="" width={1280} height={512} unoptimized /></span></span>
  </div>)}</>;
}

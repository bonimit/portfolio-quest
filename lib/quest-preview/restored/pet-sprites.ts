import type {ActorPose} from './actors.ts';
export const PET_SPRITES={
  capybara:{src:'/quest-preview/restored/pets/capybara.webp',frames:9,walk:[3,4,5,6],stride:.85},
  cat:{src:'/quest-preview/restored/pets/cat.webp',frames:10,walk:[3,4,5,6],stride:.65},
} as const;
export type Pet = keyof typeof PET_SPRITES;
export function petFrame(pet:Pet,pose:ActorPose){
  const data=PET_SPRITES[pet];
  return pose.walking?data.walk[Math.floor(pose.distance/data.stride*data.walk.length)%data.walk.length]:0;
}

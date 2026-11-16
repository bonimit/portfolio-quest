import type {ActorPose} from './actors.ts';
export const PET_SPRITES={
  capybara:{src:'/quest-preview/pets/capybara.webp',frames:9,walk:[3,4,5,6],stride:.85,scale:1.3,lane:'capybara',speed:.65},
  cat:{src:'/quest-preview/pets/cat.webp',frames:10,walk:[3,4,5,6],stride:.65,scale:.65*1.25,lane:'cat',speed:1},
  sloth:{src:'/quest-preview/pets/sloth.webp',frames:9,walk:[3,4,5,6],stride:.55,scale:.9*1.25,lane:'capybara',speed:.3},
  kitsune:{src:'/quest-preview/pets/kitsune.webp',frames:10,walk:[3,4,5,6],stride:.8,scale:1.05,lane:'cat',speed:1.1},
  frenchie:{src:'/quest-preview/pets/frenchie.webp',frames:8,walk:[3,4,5,6],stride:.55,scale:.75*1.25,lane:'capybara',speed:.85},
} as const;
export type Pet = keyof typeof PET_SPRITES;
export const PET_IDS=Object.keys(PET_SPRITES) as Pet[];
export function petFrame(pet:Pet,pose:ActorPose){
  const data=PET_SPRITES[pet];
  return pose.walking?data.walk[Math.floor(pose.distance/data.stride*data.walk.length)%data.walk.length]:0;
}

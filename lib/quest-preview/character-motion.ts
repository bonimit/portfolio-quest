import {PET_SPRITES,type Pet} from './pet-sprites.ts';
import type {Facing} from '../guide/assistant-motion.ts';

export const PET_SIZE_INCREASE=1.15;
export const AVATAR_SIZE_INCREASE=1.2;
export const petSize=(pixelsPerUnit:number,pet:Pet='capybara')=>Math.max(8,Math.min(128,pixelsPerUnit*1.1))*PET_SIZE_INCREASE*PET_SPRITES[pet].scale;

/** Preserve facing through nearly forward/backward travel instead of flickering sides. */
export function travelFacing(angle:number,previous:Facing):'left'|'right' {
  const side=Math.sin(angle);
  if(side<-.25)return 'left';
  if(side>.25)return 'right';
  return previous==='left'?'left':'right';
}

/** Advance active movement on each display frame; don't catch up a stalled tab. */
export const motionDelta=(elapsed:number,active:boolean)=>active?Math.min(50,Math.max(0,elapsed)):Math.max(0,elapsed);

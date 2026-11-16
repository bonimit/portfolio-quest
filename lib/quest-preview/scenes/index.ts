import type {Sculpture} from '../world.ts';
import type {SceneId} from '../scene-config.ts';
import {nycSpring,nycSummer,nycAutumn,nycWinter} from './nyc.ts';
import {tokyoSpring,tokyoSummer,tokyoAutumn,tokyoWinter} from './tokyo.ts';
import {bangkokRain,bangkokSummer,bangkokWinter} from './bangkok.ts';
export const NEW_SCENE_BUILDERS:Record<SceneId,(g:Sculpture)=>void>={
 'nyc-spring':nycSpring,'nyc-summer':nycSummer,'nyc-autumn':nycAutumn,'nyc-winter':nycWinter,
 'tokyo-spring':tokyoSpring,'tokyo-summer':tokyoSummer,'tokyo-autumn':tokyoAutumn,'tokyo-winter':tokyoWinter,
 'bangkok-raining':bangkokRain,'bangkok-summer':bangkokSummer,'bangkok-winter':bangkokWinter,
};

import {nycSpring as originalNycSpring,nycSummer as originalNycSummer,nycAutumn as originalNycAutumn,nycWinter as originalNycWinter} from './original/nyc.ts';
import {tokyoSpring as originalTokyoSpring,tokyoSummer as originalTokyoSummer,tokyoAutumn as originalTokyoAutumn,tokyoWinter as originalTokyoWinter} from './original/tokyo.ts';
import {bangkokRain as originalBangkokRain,bangkokSummer as originalBangkokSummer,bangkokWinter as originalBangkokWinter} from './original/bangkok.ts';
export const SCENE_BUILDERS={
 'nyc-spring':originalNycSpring,'nyc-summer':originalNycSummer,'nyc-autumn':originalNycAutumn,'nyc-winter':originalNycWinter,
 'tokyo-spring':originalTokyoSpring,'tokyo-summer':originalTokyoSummer,'tokyo-autumn':originalTokyoAutumn,'tokyo-winter':originalTokyoWinter,
 'bangkok-raining':originalBangkokRain,'bangkok-summer':originalBangkokSummer,'bangkok-winter':originalBangkokWinter,
};

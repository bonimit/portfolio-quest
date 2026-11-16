import {makeWorld} from './restored/world.ts';
/** The current scene's 36 sculpted sections and six detached rock fragments. */
export const CURRENT_ISLAND_BASE_FLOATS=(36*10+6*144)*24;
export function currentIslandBase(){return makeWorld({city:'tokyo',season:'autumn',light:'day'}).slice(0,CURRENT_ISLAND_BASE_FLOATS);}

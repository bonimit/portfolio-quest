import {SCENE_STOPS,seasonLabel,type SceneVariant,type Light} from './restored/variants.ts';
import {PLACES,PLACE_IDS} from './restored/places.ts';
export const REVIEW_PLACES={...PLACES,hokkaido:{...PLACES.hokkaido,title:'Japan · Hakuba · Japan Alps',description:'A jagged Japan Alps backdrop, skiers, a drag lift and a village of glowing ski bars.'},rockefeller:{...PLACES.rockefeller,title:'NYC · Times Square & Broadway',description:'A lively Broadway walk, theatre marquees, colorful Times Square billboards and city lights at night.'}};
export const THREE_PATH_DEFAULT:SceneVariant={city:'tokyo',season:'autumn',light:'day',edition:'restored'};
export const THREE_PATH_STOPS:readonly SceneVariant[]=[...SCENE_STOPS.map(v=>({...v,edition:'restored' as const,light:'day' as const})),...PLACE_IDS.map(place=>({...REVIEW_PLACES[place],place,edition:'restored' as const,light:'day' as const}))];
export const THREE_PATH_VIEWS=THREE_PATH_STOPS.flatMap(v=>(['day','night'] as const).map(light=>({...v,light})));
export function threePathId(v:SceneVariant){return v.place?`place-${v.place==='hokkaido'?'hakuba':v.place}`:`${v.city}-${v.season}`;}
export function threePathTitle(v:SceneVariant){return `${v.place?REVIEW_PLACES[v.place].title:v.city==='nyc'?'New York City':v.city==='tokyo'?'Tokyo':'Bangkok'} · ${seasonLabel(v.city,v.season)}`;}
export function threePathFromQuery(scene?:string,light?:string):SceneVariant{
 const id=scene==='place-hokkaido'?'place-hakuba':scene;
 const v=THREE_PATH_STOPS.find(v=>threePathId(v)===id)??THREE_PATH_DEFAULT;
 return {...v,light:light==='night'?'night':'day'};
}
export function threePathHref(v:SceneVariant){return `/quest-preview/concept-scene?scene=${threePathId(v)}&light=${v.light}`;}
export function stepThreePath(v:SceneVariant,direction=1):SceneVariant{
 const stops=THREE_PATH_STOPS.filter(stop=>!!stop.place===!!v.place),index=stops.findIndex(stop=>threePathId(stop)===threePathId(v));
 return {...stops[(Math.max(0,index)+direction%stops.length+stops.length)%stops.length],light:v.light as Light};
}

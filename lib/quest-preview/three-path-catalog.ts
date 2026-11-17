import {SCENE_STOPS,seasonLabel,type SceneVariant,type Light} from './restored/variants.ts';
import {PLACES,PLACE_IDS} from './restored/places.ts';
export const REVIEW_PLACES={...PLACES,nikko:{...PLACES.nikko,title:'Japan · Karuizawa',description:'A dense pine forest with a woodland studio, a fine-dining restaurant, colorful birds and a roaming black bear.'},okinawa:{...PLACES.okinawa,title:'Japan · Okinawa surf coast'},centralpark:{...PLACES.centralpark,description:'A broad curved lake with moving duck boats, a lakeside glasshouse, a grounded castle, picnic groups and a dog playing frisbee.'},highline:{...PLACES.highline,description:'An elevated railway garden with abundant benches, trees and planted beds, Hudson-side scenery and passing cyclists.'},kyoto:{...PLACES.kyoto,description:'A winding canal with curved banks, blossom-lined footbridges, kimono-clad walkers and a seated tea ceremony.'},hokkaido:{...PLACES.hokkaido,title:'Japan · Hakuba · Japan Alps',description:'A broad Japan Alps range mixing tall snowy summits and smaller rocky foothills, with skiers, a drag lift and glowing ski bars.'},rockefeller:{...PLACES.rockefeller,title:'NYC · Times Square & Broadway',description:'A lively Broadway walk, theatre marquees, colorful Times Square billboards and city lights at night.'}};
export const THREE_PATH_DEFAULT:SceneVariant={city:'tokyo',season:'autumn',light:'day',edition:'restored'};
export const THREE_PATH_STOPS:readonly SceneVariant[]=[...SCENE_STOPS.map(v=>({...v,edition:'restored' as const,light:'day' as const})),...PLACE_IDS.map(place=>({...REVIEW_PLACES[place],place,edition:'restored' as const,light:'day' as const}))];
export const THREE_PATH_VIEWS=THREE_PATH_STOPS.flatMap(v=>(['day','night'] as const).map(light=>({...v,light})));
export function threePathId(v:SceneVariant){return v.place?`place-${v.place==='hokkaido'?'hakuba':v.place==='nikko'?'karuizawa':v.place}`:`${v.city}-${v.season}`;}
export function threePathTitle(v:SceneVariant){return `${v.place?REVIEW_PLACES[v.place].title:v.city==='nyc'?'New York City':v.city==='tokyo'?'Tokyo':'Bangkok'} · ${seasonLabel(v.city,v.season)}`;}
export function threePathFromQuery(scene?:string,light?:string,season?:string):SceneVariant{
 const id=scene==='place-hokkaido'?'place-hakuba':scene==='place-nikko'?'place-karuizawa':scene;
 const v=THREE_PATH_STOPS.find(v=>threePathId(v)===id)??THREE_PATH_DEFAULT;
 return {...v,...(v.place==='nikko'&&season==='spring'?{season:'spring' as const}:{}),light:light==='night'?'night':'day'};
}
export function threePathArtworkId(v:SceneVariant){return threePathId(v)+(v.place==='nikko'&&v.season==='spring'?'-spring':'');}
export function threePathHref(v:SceneVariant){return `/quest-preview/concept-scene?scene=${threePathId(v)}&light=${v.light}${v.place==='nikko'&&v.season==='spring'?'&season=spring':''}`;}
export function stepThreePath(v:SceneVariant,direction=1):SceneVariant{
 const stops=THREE_PATH_STOPS.filter(stop=>!!stop.place===!!v.place),index=stops.findIndex(stop=>threePathId(stop)===threePathId(v));
 return {...stops[(Math.max(0,index)+direction%stops.length+stops.length)%stops.length],light:v.light as Light};
}

export type City = 'nyc' | 'tokyo' | 'bangkok';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'raining';
export type Light = 'day' | 'night';
export type SceneEdition='classic'|'heritage'|'original'|'new'|'restored';
export type SceneVariant = Readonly<{conceptLab?:boolean;place?:import('./restored/places.ts').Place;edition?:SceneEdition;city: City; season: Season; light: Light}>;

export const CITIES = {
  nyc: {
    label: 'New York City', subtitle: 'Brownstone, skyline & pocket park',
    portfolio: 'THE BROWNSTONE', adventure: 'THE SUBWAY GATE',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
  },
  tokyo: {
    label: 'Tokyo', subtitle: 'Lantern streets & a quiet courtyard',
    portfolio: 'THE CORNER STUDIO', adventure: 'THE LANTERN GATE',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
  },
  bangkok: {
    label: 'Bangkok', subtitle: 'Canals, market canopies & tropical gardens',
    portfolio: 'THE RIVER HOUSE', adventure: 'THE GARDEN GATE',
    seasons: ['raining', 'summer', 'winter'],
  },
} as const;
export const CITY_IDS = Object.keys(CITIES) as City[];
export const DEFAULT_VARIANT: SceneVariant = {city: 'nyc', season: 'spring', light: 'day'};
export const CLASSIC_VARIANT:SceneVariant={...DEFAULT_VARIANT,edition:'classic'};
export const SCENE_HOLD_MS = 16000;
export const SCENE_STOPS = CITY_IDS.flatMap(city=>CITIES[city].seasons.map(season=>({city,season})));
export const EARLIER_STOPS:readonly SceneVariant[]=[CLASSIC_VARIANT,...SCENE_STOPS.map(v=>({...v,light:'day' as const,edition:'heritage' as const}))];
export function isEarlierCollection(v:SceneVariant){return v.edition==='classic'||v.edition==='heritage';}
export function sceneIndex(variant:SceneVariant){if(isEarlierCollection(variant))return EARLIER_STOPS.findIndex(stop=>stop.edition===variant.edition&&(variant.edition==='classic'||stop.city===variant.city&&stop.season===variant.season));return SCENE_STOPS.findIndex(stop=>stop.city===variant.city&&stop.season===variant.season);}
export function stepScene(variant:SceneVariant,direction=1):SceneVariant{
  if(isEarlierCollection(variant)){const index=(Math.max(0,sceneIndex(variant))+direction%EARLIER_STOPS.length+EARLIER_STOPS.length)%EARLIER_STOPS.length;return {...EARLIER_STOPS[index],light:variant.light};}
  const index=(Math.max(0,sceneIndex(variant))+direction%SCENE_STOPS.length+SCENE_STOPS.length)%SCENE_STOPS.length;
  return {...SCENE_STOPS[index],light:variant.light,...(variant.edition?{edition:variant.edition}:{})};
}
export const VARIANTS: readonly SceneVariant[] = CITY_IDS.flatMap(city =>
  CITIES[city].seasons.flatMap(season => (['day', 'night'] as const).map(light => ({city, season, light}))),
);
export const NEW_VARIANTS:readonly SceneVariant[]=VARIANTS.map(v=>({...v,edition:'new'}));
export const HERITAGE_VARIANTS:readonly SceneVariant[]=VARIANTS.map(v=>({...v,edition:'heritage'}));
export function variantId(variant: SceneVariant) { if(variant.edition==='restored')return 'restored/'+(variant.place?`place-${variant.place}-${variant.light}`:`${variant.city}-${variant.season}-${variant.light}`);if(variant.edition==='classic')return `classic-${variant.light}`;return `${variant.edition==='new'?'new-':variant.edition==='heritage'?'heritage-':''}${variant.city}-${variant.season}-${variant.light}`; }
export function seasonLabel(city: City, season: Season) {
  if(city==='bangkok'&&season==='raining')return 'Monsoon';
  if (city === 'bangkok' && season === 'winter') return 'Winter · Northern Thai mood';
  return season[0].toUpperCase() + season.slice(1);
}
/** A city change keeps the current season when supported, otherwise uses summer. */
export function changeCity(variant: SceneVariant, city: City): SceneVariant {
  const supported: readonly string[] = CITIES[city].seasons;
  return {...variant, city, season: supported.includes(variant.season) ? variant.season : 'summer'};
}
export function isSnow(variant: SceneVariant) { return variant.season === 'winter' && variant.city !== 'bangkok'; }

export function tourStatus(automatic:boolean,reduced:boolean,held:boolean){return !automatic||reduced?'Off':held?'Paused':'On';}

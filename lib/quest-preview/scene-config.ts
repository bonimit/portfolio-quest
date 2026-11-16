import {PLACES} from './restored/places.ts';
import {sceneConfig as originalSceneConfig} from './scenes/original/scene-config.ts';
import {CITIES,type SceneVariant} from './variants.ts';
export const SCENE_CONFIGS={
 'nyc-spring':{title:'Manhattan in bloom',description:'Brownstone stoops, blossom pocket park and a subway entrance on a spring city block.',portfolio:'THE BROWNSTONE',adventure:'THE SUBWAY',roofs:[5.7, 3]},
 'nyc-summer':{title:'Manhattan summer streets',description:'Urban park fountain, leafy sidewalk, yellow taxi and layered skyline.',portfolio:'THE BROWNSTONE',adventure:'THE SUBWAY',roofs:[5.7, 3]},
 'nyc-autumn':{title:'Manhattan harvest block',description:'Maple leaves, neighborhood stoops, taller corner rowhouses and a harvest pocket park.',portfolio:'THE BROWNSTONE',adventure:'THE SUBWAY',roofs:[5.7, 3]},
 'nyc-winter':{title:'Snow on the city block',description:'Snow-capped roofs, bare street trees, a frozen park pool and cleared pavements.',portfolio:'THE BROWNSTONE',adventure:'THE SUBWAY',roofs:[5.8, 3]},
 'tokyo-spring':{title:'Sakura rail neighborhood',description:'A traditional atelier, contemporary studio, rail crossing and cherry blossoms.',portfolio:'THE ATELIER',adventure:'THE STUDIO',roofs:[5.1, 6.3]},
 'tokyo-summer':{title:'Tokyo matsuri streets',description:'Lanterns hang across narrow summer streets beside the neighborhood train.',portfolio:'THE ATELIER',adventure:'THE STUDIO',roofs:[5.1, 6.3]},
 'tokyo-autumn':{title:'Tokyo maple backstreets',description:'Persimmon stand, maple leaves, layered shopfronts and a local train.',portfolio:'THE ATELIER',adventure:'THE STUDIO',roofs:[5.1, 6.3]},
 'tokyo-winter':{title:'Snow at the rail crossing',description:'Snow rests on roofs, train and shelters while Fuji rises behind the neighborhood.',portfolio:'THE ATELIER',adventure:'THE STUDIO',roofs:[5.1, 6.3]},
 'bangkok-raining':{title:'Monsoon canal district',description:'Rain shutters, sandbags, puddles, long-tail boats and a covered ferry pier.',portfolio:'THE SHOPHOUSE',adventure:'THE FERRY PIER',roofs:[6.9, 5.4]},
 'bangkok-summer':{title:'Bangkok riverside streets',description:'Sun umbrellas, tropical greenery, temple spires and colonnaded shophouses.',portfolio:'THE SHOPHOUSE',adventure:'THE FERRY PIER',roofs:[6.9, 5.4]},
 'bangkok-winter':{title:'Northern winter river festival',description:'Northern-inspired lanterns and flowers on the Thai riverside district; no snow.',portfolio:'THE SHOPHOUSE',adventure:'THE FERRY PIER',roofs:[6.9, 5.4]},
} as const;
export type SceneId=keyof typeof SCENE_CONFIGS;
export function sceneId(v:SceneVariant):SceneId{const key=`${v.city}-${v.season}`;return key in SCENE_CONFIGS?key as SceneId:`${v.city}-summer`;}
export function sceneConfig(v:SceneVariant){if(v.edition==='restored')return {...(v.place?PLACES[v.place]:{title:CITIES[v.city].label,description:CITIES[v.city].subtitle,portfolio:CITIES[v.city].portfolio,adventure:CITIES[v.city].adventure}),roofs:[10.6,6.3] as const};if(v.edition==='heritage')return {title:CITIES[v.city].label+' island',description:'Recovered earlier city island with its original seasonal scenery.',portfolio:CITIES[v.city].portfolio,adventure:CITIES[v.city].adventure,roofs:[10.6,6.3] as const};if(v.edition==='classic')return {title:'The original floating island',description:'An orange-roof observatory, old stone gate, quiet paths and a floating rock island.',portfolio:'THE OBSERVATORY',adventure:'THE OLD GATE',roofs:[10.6,6.3] as const};return v.edition==='new'?SCENE_CONFIGS[sceneId(v)]:originalSceneConfig(v);}

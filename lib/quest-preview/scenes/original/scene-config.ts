import type {SceneVariant} from '../../variants.ts';
export const SCENE_CONFIGS={
 'nyc-spring':{title:'Conservatory garden',description:'A glasshouse and a flowering garden pavilion on a clipped lawn terrace.',portfolio:'THE CONSERVATORY',adventure:'THE GARDEN PAVILION',roofs:[5.8,4.5]},
 'nyc-summer':{title:'Hudson summer pier',description:'A waterfront boardwalk, white boathouse and sail pavilion over open water.',portfolio:'THE BOATHOUSE',adventure:'THE SAIL PAVILION',roofs:[4.8,5.3]},
 'nyc-autumn':{title:'Museum harvest square',description:'A brick museum, market clockhouse and paved civic square.',portfolio:'THE MUSEUM',adventure:'THE CLOCKHOUSE',roofs:[6.7,5.8]},
 'nyc-winter':{title:'Snowbound station plaza',description:'An Art Deco station and a crystalline winter hall beside an ice courtyard.',portfolio:'THE STATION',adventure:'THE WINTER HALL',roofs:[8,5.4]},
 'tokyo-spring':{title:'Sakura tea garden',description:'A lakeside tea house and a blossom pergola in a spring garden.',portfolio:'THE TEA HOUSE',adventure:'THE BLOSSOM PERGOLA',roofs:[4.6,4.5]},
 'tokyo-summer':{title:'Matsuri lantern street',description:'An urban lantern shop and festival theater on a tiled summer street.',portfolio:'THE LANTERN SHOP',adventure:'THE FESTIVAL THEATER',roofs:[5.2,5.4]},
 'tokyo-autumn':{title:'Maple river ryokan',description:'A timber ryokan and persimmon farm shop above a winding stream.',portfolio:'THE RYOKAN',adventure:'THE ORCHARD SHOP',roofs:[5.5,4.8]},
 'tokyo-winter':{title:'Fuji alpine retreat',description:'A steep-roof chalet, gondola station and broad snowy mountain valley.',portfolio:'THE CHALET',adventure:'THE GONDOLA STATION',roofs:[6.1,5.4]},
 'bangkok-raining':{title:'Monsoon canal village',description:'A stilt house and covered ferry pier linked by timber walkways.',portfolio:'THE STILT HOUSE',adventure:'THE FERRY PIER',roofs:[5.5,5.2]},
 'bangkok-summer':{title:'Golden temple courtyard',description:'An ornate sala and temple portal around an octagonal fountain court.',portfolio:'THE GOLDEN SALA',adventure:'THE TEMPLE PORTAL',roofs:[6.4,6.8]},
 'bangkok-winter':{title:'Northern lantern retreat',description:'A layered-roof lodge and lantern pavilion on a warm mountain terrace.',portfolio:'THE LODGE',adventure:'THE LANTERN PAVILION',roofs:[6.2,5.2]},
} as const;
export type SceneId=keyof typeof SCENE_CONFIGS;
export function sceneId(v:SceneVariant):SceneId{const key=`${v.city}-${v.season}`;return key in SCENE_CONFIGS?key as SceneId:`${v.city}-summer`;}
export function sceneConfig(v:SceneVariant){return SCENE_CONFIGS[sceneId(v)];}

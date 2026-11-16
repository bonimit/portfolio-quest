import {addPlacePolish} from './place-scenes/polish.ts';
import {newYorkDestination} from './place-scenes/new-york.ts';
import {japanDestination} from './place-scenes/japan.ts';
import {thailandDestination} from './place-scenes/thailand.ts';
import type {Sculpture} from './world.ts';
export type Place='okinawa'|'inthanon'|'highline'|'rockefeller'|'centralpark'|'coney'|'kyoto'|'nikko'|'hokkaido'|'canalmarket'|'krabi';
export const PLACES={
 centralpark:{city:'nyc',season:'spring',title:'NYC · Central Park',description:'Belvedere-inspired castle, a broad Bow Bridge-like lake crossing, rowing boats and a quieter distant Manhattan skyline.',portfolio:'THE CASTLE STUDIO',adventure:'THE PARK GATE'},
 coney:{city:'nyc',season:'summer',title:'NYC · Movies in Central Park',description:'A large outdoor cinema screen over a green lawn, small projection booth, picnic seating and a subdued city skyline.',portfolio:'THE PROJECTION HOUSE',adventure:'THE CINEMA GATE'},
 kyoto:{city:'tokyo',season:'spring',title:'Japan · Kyoto canal walk',description:'Philosopher’s Path-inspired canal, cherry canopy, timber machiya and a layered temple gate.',portfolio:'THE CANAL ATELIER',adventure:'THE TEMPLE GATE'},
 nikko:{city:'tokyo',season:'autumn',title:'Japan · Nikko mountain walk',description:'A condensed Nikko landscape: Nantai-inspired ridge, Chuzenji-like lake, Kegon-inspired waterfall and shrine gateway.',portfolio:'THE MOUNTAIN ATELIER',adventure:'THE SHRINE GATE'},
 hokkaido:{city:'tokyo',season:'winter',title:'Japan · Niseko, Hokkaido',description:'Mount Yotei-inspired backdrop, Japanese ski lodges, a diagonal ski run and chairlift.',portfolio:'THE ALPINE STUDIO',adventure:'THE LODGE GATE'},
 canalmarket:{city:'bangkok',season:'raining',title:'Bangkok · Taling Chan-inspired market',description:'A working canal, stilted timber houses, covered produce stalls, long-tail boats and a tuk-tuk.',portfolio:'THE CANAL HOUSE',adventure:'THE MARKET GATE'},
 krabi:{city:'bangkok',season:'summer',title:'Krabi · Railay-inspired coast',description:'A dominant weathered limestone sea stack, lower jungle cliffs, turquoise bay, cave entrance and small long-tail boats.',portfolio:'THE COASTAL STUDIO',adventure:'THE BEACH GATE'},
 okinawa:{city:'tokyo',season:'summer',title:'Okinawa · Surf coast',description:'A turquoise surf break and small surfer, surrounded by greenery-covered islets, sandy rims, reefs, surfboards and low beach huts.',portfolio:'THE SURF STUDIO',adventure:'THE BEACH CLUB'},
 inthanon:{city:'bangkok',season:'winter',title:'Chiang Mai · Doi Inthanon',description:'A prominent tiered royal pagoda, smaller companion chedi, terraced flower gardens and a curved garden pool; no snow.',portfolio:'THE MOUNTAIN LODGE',adventure:'THE SUMMIT GATE'},
 highline:{city:'nyc',season:'autumn',title:'NYC · High Line & Hudson',description:'An elevated planted railway promenade, Hudson River pier, autumn planting and warehouse architecture.',portfolio:'THE RIVER STUDIO',adventure:'THE HIGH LINE GATE'},
 rockefeller:{city:'nyc',season:'winter',title:'NYC · Rockefeller & Broadway',description:'Stepped 30 Rock-inspired skyline, holiday tree, skating rink, channel gardens and a Broadway-inspired marquee.',portfolio:'THE DESIGN HOUSE',adventure:'THE THEATRE GATE'},
} as const;
export const PLACE_IDS:Place[]=['centralpark','coney','highline','rockefeller','kyoto','okinawa','nikko','hokkaido','canalmarket','krabi','inthanon'];
/** Independent landmark compositions, sharing only the protected rocky base and paths. */
export function addPlaceScene(g:Sculpture,place:Place){
 if(place==='centralpark'||place==='coney'||place==='highline'||place==='rockefeller')newYorkDestination(g,place);
 else if(place==='kyoto'||place==='okinawa'||place==='nikko'||place==='hokkaido')japanDestination(g,place);
 else thailandDestination(g,place);
 addPlacePolish(g,place);
}

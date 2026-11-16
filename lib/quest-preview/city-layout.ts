import type {City,SceneEdition} from './variants.ts';
import type {Point,Destination} from './actors.ts';
type District={
  camera:{targetY:number;yaw:number;pitch:number;fit:number;arrivalYaw:number;arrivalPitch:number;duration:number};
  homes:Record<'guide'|'capybara'|'cat',Point>;wander:Record<'guide'|'capybara'|'cat',readonly Point[]>;
  entries:Record<Exclude<Destination,'concepts'>,{center:Point;door:Point;via:readonly Point[];width:number;depth:number}>;
  walkable:readonly (readonly [number,number,number,number])[];
};
/** Explicit pedestrian surfaces; water, rails and building footprints are excluded. */
export const CITY_LAYOUTS:Record<City,District>={
 nyc:{
  camera:{targetY:.6,yaw:0,pitch:0,fit:1.12,arrivalYaw:0,arrivalPitch:0,duration:1450},
  homes:{guide:[0,7.8],capybara:[-7,7],cat:[6.4,8]},
  wander:{guide:[[0,7],[1.1,8.5],[-.8,6.7],[.6,9]],capybara:[[-8,7],[-6.3,8.8],[-7.8,9]],cat:[[5,8.6],[7.5,7],[7,9]]},
  entries:{portfolio:{center:[-6,-2.4],door:[-6,.1],via:[[0,5],[0,2],[-6,2]],width:4.6,depth:4.4},world:{center:[5.6,1],door:[5.6,3],via:[[0,5],[2.5,5],[5.6,5]],width:3.7,depth:3.6}},
  walkable:[[-9,9,5,10],[-1.2,1.2,1,5],[-8,2,0,2.8],[2,8,2.8,5.4]],
 },
 tokyo:{
  camera:{targetY:.6,yaw:0,pitch:0,fit:1.12,arrivalYaw:0,arrivalPitch:0,duration:1700},
  homes:{guide:[-.3,7.2],capybara:[-7,7.4],cat:[6.5,6.7]},
  wander:{guide:[[-1,6],[.8,8.5],[-.8,9],[.2,7]],capybara:[[-8.5,8.5],[-6,8],[-7.7,6.8]],cat:[[5.5,7.5],[8,8.5],[7,6]]},
  entries:{portfolio:{center:[-5.8,-3.8],door:[-5.8,-1.4],via:[[0,5],[-2.2,3],[-2.2,-.5],[-5.8,-.5]],width:4.2,depth:4},world:{center:[6,-1.8],door:[6,.5],via:[[0,5],[3,3],[6,3]],width:4,depth:4}},
  walkable:[[-10,10,5,10],[-3.3,3.3,-.8,5.5],[-8,-2,-1.4,1.5],[2,8,.4,5.5]],
 },
 bangkok:{
  camera:{targetY:.6,yaw:0,pitch:0,fit:1.12,arrivalYaw:0,arrivalPitch:0,duration:1850},
  homes:{guide:[0,6.8],capybara:[-7,7.5],cat:[6.6,7.6]},
  wander:{guide:[[0,8],[1.5,7],[-1.5,6.5],[.5,9]],capybara:[[-8,8.8],[-5.8,8],[-7.5,6.6]],cat:[[5,8.4],[8,8.6],[6,6.8]]},
  entries:{portfolio:{center:[-6,-4],door:[-6,-1.6],via:[[0,5],[-2,3],[-2,-.5],[-6,-.5]],width:4.4,depth:4},world:{center:[6,-2.3],door:[6,.1],via:[[0,5],[2,3],[6,3]],width:4.4,depth:4.2}},
  walkable:[[-10,10,5,10],[-3,3,-1,5.5],[-8,-2,-1.6,1],[2,8,0,5.5]],
 },
};
export function onCityWalkway(city:City,[x,z]:Point,edition:SceneEdition='original'){return cityLayout(city,edition).walkable.some(([a,b,c,d])=>x>=a&&x<=b&&z>=c&&z<=d);}

/** Original island staging is retained independently from the added city districts. */
export const ORIGINAL_LAYOUT:District={
 camera:{targetY:.6,yaw:0,pitch:0,fit:1,arrivalYaw:0,arrivalPitch:0,duration:1450},
 homes:{guide:[0,8.6],capybara:[-5.5,8],cat:[5.2,8.4]},
 wander:{guide:[[1.4,8.7],[-1.5,9.4],[.6,7.3],[-.9,8.1]],capybara:[[-6.5,7.3],[-4.3,8.5],[-5.6,9.2],[-7,7.4]],cat:[[4.2,9],[6.5,7.5],[3.5,7.4],[5.6,8.8]]},
 entries:{portfolio:{center:[-5.3,-2.8],door:[-5.3,-.6],via:[[0,6.4],[0,2.6],[-2.7,.5]],width:5,depth:3.2},world:{center:[5.1,-2.8],door:[5.1,-.82],via:[[0,6.4],[0,2.6],[2.7,.5]],width:5,depth:3.2}},
 walkable:[[-8.5,8.5,6.3,10],[ -1.7,1.7,1.8,6.5],[-6,0,-.7,3.4],[0,6,-.9,3.4]],
};
export function cityLayout(city:City,edition:SceneEdition='original'){return edition==='restored'?RESTORED_LAYOUT:edition==='classic'?CLASSIC_LAYOUT:edition==='new'?CITY_LAYOUTS[city]:ORIGINAL_LAYOUT;}

/** Footpaths and clearings of the recovered tower-and-ruins scene. */
export const CLASSIC_LAYOUT:District={
 ...ORIGINAL_LAYOUT,
 homes:{guide:[0,6.8],capybara:[-4.5,6.2],cat:[4.5,6.3]},
 wander:{guide:[[.8,6.9],[-1,7.1],[.5,6.1],[-.8,6.5]],capybara:[[-4.8,6.4],[-3.5,6.8],[-4.2,5.9]],cat:[[4.2,6.8],[5,5.8],[3.5,6.2]]},
 entries:{portfolio:{center:[-5.3,-2.8],door:[-5.3,-1.18],via:[[0,6.4],[0,2.6],[-2.7,.5]],width:4.8,depth:3.4},world:{center:[5.1,-2.7],door:[5.1,-1.3],via:[[0,6.4],[0,2.6],[2.6,.5]],width:5.2,depth:4}},
 walkable:[[-5.5,5.5,5.5,7.7],[-1.7,1.7,1.8,6.5],[-6,0,-1.3,3.4],[0,6,-1.4,3.4]],
};

/** Current seasonal islands and added place scenes share these unobstructed approach lanes. */
export const RESTORED_LAYOUT:District={...ORIGINAL_LAYOUT,entries:{...ORIGINAL_LAYOUT.entries,portfolio:{...ORIGINAL_LAYOUT.entries.portfolio,door:[-5.3,-.8]},world:{...ORIGINAL_LAYOUT.entries.world,door:[5.1,-2.4]}},walkable:[[-8.5,8.5,6.3,10],[-1.7,1.7,1.8,6.5],[-6,0,-.9,3.4],[0,6,-2.5,3.4]]};

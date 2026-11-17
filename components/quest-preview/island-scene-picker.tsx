'use client';

import {useId,useRef,type KeyboardEvent} from 'react';
import {CITIES,CITY_IDS,changeCity,seasonLabel,type SceneVariant} from '@/lib/quest-preview/restored/variants';
import {PLACE_IDS} from '@/lib/quest-preview/restored/places';
import {REVIEW_PLACES,THREE_PATH_DEFAULT} from '@/lib/quest-preview/three-path-catalog';

const REGIONS={nyc:'New York',tokyo:'Japan',bangkok:'Thailand'} as const;

/** Collection tabs establish the hierarchy; scene choices stay visible below. */
export function IslandScenePicker({variant,onChange}:{variant:SceneVariant;onChange:(variant:SceneVariant)=>void}){
 const id=useId();
 const destinations=!!variant.place;
 const collection=destinations?'destinations':'cities';
 const lastCity=useRef<SceneVariant>(variant.place?THREE_PATH_DEFAULT:variant);
 const lastDestination=useRef<SceneVariant>(variant.place?variant:{...REVIEW_PLACES.highline,place:'highline',edition:'restored',light:variant.light});
 function switchCollection(next:'cities'|'destinations'){
  if(next===collection)return;
  if(destinations)lastDestination.current=variant;
  else lastCity.current=variant;
  onChange({...next==='cities'?lastCity.current:lastDestination.current,light:variant.light});
 }
 function tabKeys(event:KeyboardEvent<HTMLDivElement>){
  const tabs=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const index=tabs.indexOf(event.target as HTMLButtonElement);
  if(index<0)return;
  const target=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index-1+tabs.length)%tabs.length:-1;
  if(target>=0){event.preventDefault();tabs[target]?.focus();}
 }
 return <div className="island-scene-picker">
  <div className="island-collection-switch" role="tablist" aria-label="Scene collection" onKeyDown={tabKeys}>
   <button type="button" role="tab" id={`${id}-cities`} aria-selected={!destinations} aria-controls={`${id}-panel`} tabIndex={destinations?-1:0} onClick={()=>switchCollection('cities')}>Cities &amp; seasons</button>
   <button type="button" role="tab" id={`${id}-destinations`} aria-selected={destinations} aria-controls={`${id}-panel`} tabIndex={destinations?0:-1} onClick={()=>switchCollection('destinations')}>Destinations</button>
  </div>
  <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${collection}`} className="island-collection-content">
   <p className="island-collection-help">{destinations?'Explore a landmark or getaway, grouped by region.':'Choose a city, then a season to see its different moods.'}</p>
   {destinations?CITY_IDS.map(city=><fieldset key={city} className="island-settings-field"><legend>{REGIONS[city]}</legend>
    <div className="island-place-choices">{PLACE_IDS.filter(place=>REVIEW_PLACES[place].city===city).map(place=>{
     const title=REVIEW_PLACES[place].title,shortTitle=title.includes(' · ')?title.split(' · ').slice(1).join(' · '):title;
     return <button type="button" key={place} aria-label={title} aria-pressed={variant.place===place} onClick={()=>onChange({...REVIEW_PLACES[place],place,edition:'restored',light:variant.light})}>{shortTitle}</button>;
    })}</div>
    {variant.place==='nikko'&&city==='tokyo'?<fieldset className="island-settings-field island-destination-seasons"><legend>Karuizawa season</legend><div className="island-season-choices">{(['spring','autumn'] as const).map(season=><button type="button" key={season} aria-pressed={variant.season===season} onClick={()=>onChange({...variant,season})}>{season==='spring'?'Spring flowers':'Autumn foliage'}</button>)}</div></fieldset>:null}
   </fieldset>):<>
    <fieldset className="island-settings-field"><legend>City</legend><div className="island-choice-row">{CITY_IDS.map(city=><button type="button" key={city} aria-pressed={variant.city===city} onClick={()=>onChange(changeCity(variant,city))}>{CITIES[city].label}</button>)}</div></fieldset>
    <fieldset className="island-settings-field"><legend>Season</legend><div className="island-season-choices">{CITIES[variant.city].seasons.map(season=><button type="button" key={season} aria-pressed={variant.season===season} onClick={()=>onChange({...variant,season})}>{seasonLabel(variant.city,season)}</button>)}</div></fieldset>
   </>}
  </div>
 </div>;
}

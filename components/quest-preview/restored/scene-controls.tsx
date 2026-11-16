'use client';
import {PLACES,PLACE_IDS} from '@/lib/quest-preview/restored/places';
import {CITIES,SCENE_STOPS,sceneIndex,seasonLabel,type SceneVariant,type Light} from '@/lib/quest-preview/restored/variants';
export function QuestTimeToggle({light,onChange}:{light:Light;onChange:(light:Light)=>void}){
  return <button className="quest-time-toggle" role="switch" aria-label="Night mode" aria-checked={light==='night'} onClick={()=>onChange(light==='day'?'night':'day')} data-light={light}>
    <span className="quest-time-thumb" aria-hidden="true"/>
    <span aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg>Day</span>
    <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/></svg>Night</span>
  </button>;
}
export function QuestSceneTour({variant,automatic,reduced,holdReason,onStep,title}:{title?:string;variant:SceneVariant;automatic:boolean;reduced:boolean;holdReason:string|null;onStep:(direction:number)=>void}){
  return <div className="quest-scene-tour">
    <p className="quest-tour-location"><strong>{title??(variant.place?PLACES[variant.place].title:CITIES[variant.city].label)}</strong><span>{seasonLabel(variant.city,variant.season)} <small>{variant.place?PLACE_IDS.indexOf(variant.place)+1:sceneIndex(variant)+1} / {variant.place?PLACE_IDS.length:SCENE_STOPS.length}</small></span></p>
    <div className="quest-tour-buttons" role="group" aria-label="City and season tour">
      <button type="button" aria-label="Previous scene" title="Previous scene" onClick={()=>onStep(-1)}>Previous</button>
      <button type="button" aria-label="Next scene" title="Next scene" onClick={()=>onStep(1)}>Next</button>
    </div>
    {holdReason&&automatic&&!reduced?<span className="sr-only">Scene tour paused: {holdReason}.</span>:null}
    {reduced?<span className="sr-only">Use Previous scene or Next scene; automatic scene changes are off with reduced motion.</span>:null}
  </div>;
}

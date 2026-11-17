import type {Metadata} from "next";
import {SceneStudyExperience} from "@/components/quest-preview/scene-study-experience";
import {threePathFromQuery} from "@/lib/quest-preview/three-path-catalog";
import "./quest-preview/quest-preview.css";
import "./quest-preview/concept-scene/study.css";

const description="Explore lively miniature islands across cities, seasons and destinations. Choose Portfolio, Concept Lab or Adventure, with day/night, walking companions and a local scripted guide.";
export const metadata:Metadata={title:"Pick Your Path",description,openGraph:{title:"Pick Your Path | Portfolio Quest",description}};
export default async function EntrancePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams,one=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]:value;
 return <SceneStudyExperience key={`${one(query.scene)}-${one(query.light)}-${one(query.season)}-home`} initialVariant={threePathFromQuery(one(query.scene),one(query.light),one(query.season))}/>;
}

import type {Metadata} from 'next';
import {SceneStudyExperience} from '@/components/quest-preview/scene-study-experience';
import {threePathFromQuery} from '@/lib/quest-preview/three-path-catalog';
import '../quest-preview.css';
import './study.css';

export const metadata:Metadata={
 title:'Pick Your Path',
 description:'The current three-path island homepage, with scene review and local screenshot tools.',
 robots:{index:false,follow:false},
};
export default async function ConceptSceneStudy({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams,one=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]:value;
 const variant=threePathFromQuery(one(query.scene),one(query.light),one(query.season));
 return <SceneStudyExperience key={`${one(query.scene)}-${one(query.light)}-${one(query.season)}-${one(query.capture)}-review-2`} initialVariant={variant} screenshot={one(query.capture)==='1'}/>;
}

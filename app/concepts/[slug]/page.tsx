import {notFound} from 'next/navigation';
import CaseStudyPage,{generateMetadata as projectMetadata} from '../../work/[slug]/page';
import {getProject} from '@/lib/work/source';
import {labProjects} from '@/lib/concepts';

type Props={params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
async function requireConcept(params:Props['params']){const project=getProject((await params).slug);if(!project||!labProjects([project]).length)notFound();return project;}
export async function generateMetadata(props:Props){await requireConcept(props.params);return projectMetadata(props);}
/** A concept has its own address while sharing the unchanged case-study templates. */
export default async function ConceptDetailPage(props:Props){await requireConcept(props.params);return CaseStudyPage({...props,searchParams:props.searchParams.then(query=>({...query,view:'visual',section:'concept'}))});}

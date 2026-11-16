import type {Project} from './work/projects';
import type {CaseStudy} from './work/case-study';
export const CONCEPT_VIEWS=['All','Concepts & pitches','Art & graphic work'] as const;
export type ConceptView=typeof CONCEPT_VIEWS[number];
export function isConcept(project:Project){return project.tags.type.includes('Concept/Pitch');}
export function isArt(project:Project){return project.tags.discipline.some(tag=>['Branding','Graphic Design'].includes(tag));}
export function labProjects(projects:readonly Project[],view:ConceptView='All'){
 return projects.filter(project=>view==='Concepts & pitches'?isConcept(project):view==='Art & graphic work'?isArt(project):isConcept(project)||isArt(project));
}
export function visualStudy(study:CaseStudy):CaseStudy {
 const illustrated=study.chapters.filter(chapter=>chapter.figure);
 return {...study,summary:study.summary.slice(0,1),chapters:(illustrated.length?illustrated:study.chapters).map(chapter=>({...chapter,body:chapter.body.slice(0,1)}))};
}

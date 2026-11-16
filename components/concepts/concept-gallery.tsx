'use client';
import Link from 'next/link';
import {useMemo,useState,type CSSProperties} from 'react';
import {CardArt,assignArt} from '@/components/work/work-art';
import type {Project} from '@/lib/work/projects';
import {CONCEPT_VIEWS,labProjects,type ConceptView} from '@/lib/concepts';

export function ConceptGallery({projects,sample}:{projects:Project[];sample:boolean}){
 const [view,setView]=useState<ConceptView>('All');
 const available=useMemo(()=>labProjects(projects),[projects]);
 const visible=useMemo(()=>labProjects(available,view),[available,view]);
 const art=useMemo(()=>assignArt(projects),[projects]);
 return <>
  {sample&&<p className="lab-sample" role="note">Design preview · Sample projects and placeholder illustrations. These are not the owner’s real concepts or drawings.</p>}
  <div className="lab-toolbar"><div role="group" aria-label="Explore Concept Lab" className="lab-filters">{CONCEPT_VIEWS.map(value=><button type="button" key={value} aria-pressed={view===value} onClick={()=>setView(value)}>{value}<span>{labProjects(available,value).length}</span></button>)}</div><p role="status" aria-live="polite">{visible.length} {visible.length===1?'piece':'pieces'}</p></div>
  {visible.length?<ul className="lab-grid">{visible.map((project,i)=><li className={`lab-piece lab-piece--${i%4}`} key={project.slug} style={{'--lab-tint':`var(--landing-${project.tint})`} as CSSProperties}>
   <Link href={`/concepts/${project.slug}`} className="lab-piece-link" aria-labelledby={`lab-title-${project.slug}`}><div className="lab-piece-art" aria-hidden="true"><CardArt type={project.tags.type[0]} art={art.get(project.slug)}/><span className="lab-art-caption">{sample?'Placeholder illustration':'Visual study'}</span></div><div className="lab-piece-meta"><span>{project.tags.type[0]} · {project.year}</span>{sample&&<span>Sample</span>}</div><h2 id={`lab-title-${project.slug}`}>{project.title}</h2><p>{project.summary}</p></Link>
  </li>)}</ul>:<section className="lab-empty"><h2>{available.length?'A little more room to explore.':'The studio is being assembled.'}</h2><p>{available.length?'There are no pieces in this view yet.':'Concepts, drawings and graphic studies will appear here when their public materials are approved.'}</p>{available.length?<button type="button" onClick={()=>setView('All')}>Show all pieces</button>:<Link href="/work">Explore Selected Work</Link>}</section>}
 </>;
}

import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {AdventureHub} from '@/components/adventure/adventure-hub';
import {adventureProjects,publishedCaseStudy} from '@/lib/adventure/projects';
import {getProjects} from '@/lib/work/source';
import './adventure.css';

// Existing self-hosted OFL font assets; no build-time or visitor font service.
const display=localFont({src:'../../public/fonts/anton/Anton-Regular.ttf',variable:'--adventure-display',display:'swap',weight:'400'});
const body=localFont({src:'../../public/fonts/figtree/Figtree[wght].ttf',variable:'--adventure-sans',display:'swap',weight:'300 900'});
const pixel=localFont({src:'../../public/fonts/pressstart2p/PressStart2P-Regular.ttf',variable:'--adventure-pixel',display:'swap',weight:'400',preload:false});
const mono=localFont({src:[{path:'../../public/fonts/ibmplexmono/IBMPlexMono-Regular.ttf',weight:'400'},{path:'../../public/fonts/ibmplexmono/IBMPlexMono-Medium.ttf',weight:'500'},{path:'../../public/fonts/ibmplexmono/IBMPlexMono-SemiBold.ttf',weight:'600'}],variable:'--adventure-mono',display:'swap',preload:false});
const serif=localFont({src:'../../public/fonts/newsreader/latin.woff2',variable:'--adventure-serif',display:'swap'});
export const metadata:Metadata={title:'Adventure',description:'Choose a playable prototype, explore its demo, or return directly to the portfolio.',openGraph:{title:'Adventure | Portfolio Quest',description:'Interactive prototypes in Island, Arcade and Neon themes.'}};
export default async function WorldPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const query=await searchParams;
  const one=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]:value;
  const projects=adventureProjects(process.env.NODE_ENV!=='production');
  const published=process.env.NODE_ENV==='production'?getProjects():[];
  const caseStudies:Record<string,string>={};
  for(const project of projects){const href=publishedCaseStudy(project.caseStudySlug,published);if(href)caseStudies[project.id]=href;}
  return <div className={`adventure-route ${display.variable} ${body.variable} ${serif.variable} ${pixel.variable} ${mono.variable}`}><AdventureHub projects={projects} caseStudies={caseStudies} initialTheme={one(query.theme)} initialView={one(query.view)}/></div>;
}

import type {Metadata} from 'next';
import Link from 'next/link';
import {ConceptGallery} from '@/components/concepts/concept-gallery';
import {getProjects,IS_SAMPLE} from '@/lib/work/source';
import './concepts.css';
const description='A visual notebook for concepts, pitches, art and graphic experiments. Explore the images, then follow the thinking.';
export const metadata:Metadata={title:'Concept Lab',description,openGraph:{title:'Concept Lab | Portfolio Quest',description}};
export default function ConceptsPage(){
 return <div className="concept-lab"><header className="lab-heading"><p className="lab-eyebrow">Ideas · Art · Graphic studies</p><h1>Concept Lab<span>.</span></h1><div className="lab-introduction"><p>A place for the<br/>what ifs.</p><span>Concepts and pitches alongside drawings, visual experiments and graphic work. Images first. A little context when you want it.</span></div></header><ConceptGallery projects={getProjects()} sample={IS_SAMPLE}/><nav className="lab-bottom" aria-label="Continue exploring"><Link href="/work">Selected Work</Link><Link href="/contact">Start a conversation</Link></nav></div>;
}

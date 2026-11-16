import type {Metadata} from 'next';
import {QuestPreviewExperience} from '@/components/quest-preview/restored/experience';
import './quest-preview.css';
export const metadata: Metadata={
  title:'Quest — Entrance Design Preview',
  description:'An isolated preview of the city islands and new destination scenes, with direct paths to the Portfolio and playable Adventure prototypes.',
  robots:{index:false,follow:false},
};
export default function QuestPreviewPage(){return <QuestPreviewExperience/>;}

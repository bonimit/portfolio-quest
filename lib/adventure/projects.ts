/** Approved playable prototypes. No biography, client claims or unpublished case studies. */
export type AdventureProject = {
  id: string; name: string; kind: string; color: string; preview: string;
  machine?: string; sample: boolean; hook: string; tech: readonly string[];
  caseStudySlug?: string;
};
export const PLAYABLE_PROJECTS: readonly AdventureProject[] = [
  { id: 'seat', name: 'Seat Optimizer', kind: 'Tool', color: 'var(--orange)', preview: 'seat', machine: 'P1-seat-optimizer.html', sample: false, hook: 'Try a dinner-service seating simulation and explore the trade-offs.', tech: ['Interactive simulation'] },
  { id: 'concierge', name: 'AI Concierge', kind: 'Agent', color: 'var(--tint)', preview: 'chat', machine: 'P2-ai-concierge.html', sample: false, hook: 'Try a scripted table-booking conversation. No live AI service is connected.', tech: ['Scripted conversation', 'Local demo'] },
  { id: 'bot', name: 'Break the Bot', kind: 'Game', color: 'var(--pink)', preview: 'cards', machine: 'P3-break-the-bot.html', sample: false, hook: 'Explore the weak spots of a scripted chatbot through a playable experiment.', tech: ['Classifier', 'State machine'] },
];
const EXAMPLES: readonly AdventureProject[] = [
  {id:'budget',name:'Budget Run',kind:'Game',color:'var(--lime)',preview:'budget',sample:true,hook:'Sample tile · This machine is not built.',tech:[]},
  {id:'poster',name:'Poster Machine',kind:'Tool',color:'var(--lilac)',preview:'poster',sample:true,hook:'Sample tile · This machine is not built.',tech:[]},
  {id:'radar',name:'Vacancy Radar',kind:'Dashboard',color:'var(--teal)',preview:'dash',sample:true,hook:'Sample tile · This machine is not built.',tech:[]},
  {id:'api',name:'API Playground',kind:'Tool',color:'var(--lilac)',preview:'api',sample:true,hook:'Sample tile · This machine is not built.',tech:[]},
  {id:'festival',name:'Festival Sound Logo',kind:'Toy',color:'var(--orange)',preview:'fest',sample:true,hook:'Sample tile · This machine is not built.',tech:[]},
];
export function adventureProjects(development: boolean): readonly AdventureProject[] {
  return development ? [...PLAYABLE_PROJECTS,...EXAMPLES] : PLAYABLE_PROJECTS;
}
/** Only link records actually present in the published project source. */
export function publishedCaseStudy(slug: string | undefined, published: readonly {slug:string}[]): string | undefined {
  return slug && published.some(project=>project.slug===slug) ? `/work/${encodeURIComponent(slug)}` : undefined;
}

import { ADVENTURE_PREVIEW_LABEL } from "../shared/navigation.ts";

export const GUIDE_INPUT_LIMIT = 500;
export const guideDestinations = {
  portfolio: { href: "/work", label: "Portfolio" },
  work: { href: "/work", label: "Selected Work" },
  concepts: { href: "/concepts", label: "Concept Lab" },
  arcade: { href: "/arcade", label: "Prototype Arcade" },
  about: { href: "/about", label: "About" },
  contact: { href: "/contact", label: "Contact" },
  world: { href: "/world", label: ADVENTURE_PREVIEW_LABEL },
} as const;
export type GuideActionId = keyof typeof guideDestinations;
export type GuideAnswer = { id: string; text: string; actions: readonly GuideActionId[]; avatarCue: "idle-front" | "happy" };
/** Future server providers must return only approved action IDs, never generated URLs. */
export interface GuideProvider { respond(question: string): Promise<GuideAnswer> }
export const guidePrompts = ["Which way should I go?", "What can you do?", "Where is the work?"] as const;
export const guideAnswers = {
  greeting: { id: "greeting", text: "Hello! I’m Wayfinder, the local scripted guide. Choose Portfolio for the editorial homepage, Concept Lab for ideas and art, or Adventure for playable prototype demos.", avatarCue: "idle-front", actions: ["portfolio", "concepts", "world"] },
  portfolio: { id: "portfolio", text: "Here’s the Portfolio homepage. Use the Portfolio link below to open the orange editorial experience.", avatarCue: "happy", actions: ["portfolio"] },
  site: { id: "site", text: "Portfolio Quest has three paths: the editorial Portfolio, Concept Lab for ideas and art, and an Adventure lineup with three playable prototype demos. Published professional case studies are not available yet.", avatarCue: "idle-front", actions: ["portfolio", "concepts", "world"] },
  transparency: { id: "transparency", text: "I’m a scripted site guide, not ChatGPT or an AI model. I can point you to existing pages and explain which are placeholders. Your questions stay in this tab.", avatarCue: "idle-front", actions: ["portfolio", "world"] },
  work: { id: "work", text: "Selected Work is at /work. Its project content is still being prepared; published case studies are not available yet. Portfolio opens the orange editorial homepage.", avatarCue: "idle-front", actions: ["work", "portfolio"] },
  adventure: { id: "adventure", text: "Adventure at /world offers three playable prototype demos, including a scripted conversation demo. It is a project lineup, not a roaming RPG. Choose Portfolio for the editorial website.", avatarCue: "idle-front", actions: ["world", "portfolio"] },
  concepts: { id: "concepts", text: "Concept Lab collects concepts, art and graphic studies. Sample pieces appear in development; approved public work is not published yet. Prototype Arcade still contains placeholders.", avatarCue: "idle-front", actions: ["concepts", "arcade"] },
  about: { id: "about", text: "The About page is awaiting approved background and experience details. I don’t have a published biography or résumé to share.", avatarCue: "idle-front", actions: ["about"] },
  contact: { id: "contact", text: "Contact is awaiting approved public contact details. There is currently no published email address or working contact form.", avatarCue: "idle-front", actions: ["contact"] },
  choose: { id: "choose", text: "Choose Portfolio for the orange editorial homepage, Concept Lab for visual ideas and graphic work, or Adventure for three playable prototype demos. Selected Work currently contains placeholders, with no published case studies.", avatarCue: "idle-front", actions: ["portfolio", "concepts", "world"] },
  unmatched: { id: "unmatched", text: "I only recognize a few questions about this website. Choose Portfolio for the editorial homepage, Concept Lab for ideas and art, or Adventure for playable prototype demos.", avatarCue: "idle-front", actions: ["portfolio", "world"] },
  empty: { id: "empty", text: "Please enter a question or choose an example.", avatarCue: "idle-front", actions: [] },
} as const satisfies Record<string, GuideAnswer>;
export function resolveGuideAction(id: string) {
  return Object.hasOwn(guideDestinations, id) ? guideDestinations[id as GuideActionId] : undefined;
}
export function getLocalGuideAnswer(question: string): GuideAnswer {
  const q = question.slice(0, GUIDE_INPUT_LIMIT).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  if (!q) return guideAnswers.empty;
  // Questions about this guide/site outrank generic project/game words.
  if (/\b(are you|are u|you are|is (this|the) guide|is this)\b.*\b(ai|real|human|bot|scripted|chatgpt)\b/.test(q)
    || /\b(chatgpt|who are you|what are you|what can you do|do you (use|run on) ai|what (ai |language )?model|real ai|live ai|ai connected|language model|scripted|how (do you|does (this |the )?guide) work)\b/.test(q)) return guideAnswers.transparency;
  if (/^how does this work$/.test(q)) return guideAnswers.site;
  if (/\b(skip (the )?(game|adventure)|without (the )?game|don t want to play)\b/.test(q)) return guideAnswers.portfolio;
  if (/\b(about (this|the|your) (site|website|portfolio)|what is (this|portfolio quest)|how does (this|the) (site|website|portfolio) work)\b/.test(q)) return guideAnswers.site;
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)( there| wayfinder)?$/.test(q)) return guideAnswers.greeting;
  // Destination requests outrank generic “work”, “about”, “AI” and “help”.
  if (/\b(contact|email|hire|connect with)\b/.test(q)) return guideAnswers.contact;
  if (/\b(concepts?|lab|arcade|prototypes?|experiments?|ideas)\b/.test(q)) return guideAnswers.concepts;
  if (/\b(projects?|case studies|selected work|recruiter|two minutes|quick)\b/.test(q)) return guideAnswers.work;
  if (/\b(can i play|playable|adventure|rpg|game|world)\b/.test(q)) return guideAnswers.adventure;
  if (/\b(background|experience|resume|résumé|skills|about (you|yourself|the (designer|owner)))\b/.test(q) || q === "about") return guideAnswers.about;
  if (/^(portfolio|home|homepage|go home)$/.test(q) || /\b(open|show|view|visit|take me to|go to|enter) (the |your )?(portfolio|homepage)\b/.test(q)) return guideAnswers.portfolio;
  if (/\b(portfolio|choose|which path|which way|lost|directions?|where should|difference|help|start)\b/.test(q)) return guideAnswers.choose;
  if (/\bwork\b/.test(q)) return guideAnswers.work;
  return guideAnswers.unmatched;
}
export const localGuideProvider: GuideProvider = { respond: async (question) => getLocalGuideAnswer(question) };

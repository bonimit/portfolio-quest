import type { GuideAnswer } from './local-guide.ts';
/** Only handle Escape owned by this panel, never unrelated focused controls. */
export function dismissesCompanion(event: { key: string; defaultPrevented: boolean; isComposing: boolean }, withinPanel = true) {
  return withinPanel && event.key === 'Escape' && !event.defaultPrevented && !event.isComposing;
}
export function companionExitDelay(reducedMotion: boolean, paused: boolean) {
  return reducedMotion || paused ? 0 : 180;
}
export function suggestedPath(answer: GuideAnswer): 'portfolio' | 'world' | null {
  return answer.id === 'portfolio' ? 'portfolio' : answer.id === 'adventure' ? 'world' : null;
}
/** A delayed exit must not steal focus if the visitor has moved elsewhere. */
export function shouldRestoreCompanionFocus(panel: { contains: (node: Node | null) => boolean } | null, active: Node | null) {
  return !!panel && panel.contains(active);
}

import type { AvatarActivity } from './assistant-motion.ts';
import type { GuideAnswer } from './local-guide.ts';

type Clock = { set: (callback: () => void, delay: number) => number; clear: (id: number) => void };
/** Presentation only: never invent a waiting/thinking phase for the local provider. */
export class ConversationActivity {
  private timer = 0;
  private disposed = false;
  private emit: (activity: AvatarActivity) => void;
  private clock: Clock;
  constructor(emit: (activity: AvatarActivity) => void, clock: Clock = {
    set: (callback, delay) => window.setTimeout(callback, delay),
    clear: (id) => window.clearTimeout(id),
  }) { this.emit = emit; this.clock = clock; }
  private clear() { this.clock.clear(this.timer); this.timer = 0; }
  private show(activity: AvatarActivity) { if (!this.disposed) this.emit(activity); }
  private later(delay: number, callback: () => void) {
    this.timer = this.clock.set(() => { this.timer = 0; if (!this.disposed) callback(); }, delay);
  }
  idle() { this.clear(); this.show('idle-front'); }
  greet() { this.clear(); this.show('wave'); this.later(1100, () => this.idle()); }
  answer(cue: GuideAnswer['avatarCue']) {
    this.clear();
    if (cue === 'idle-front') { this.show('idle-front'); return; }
    this.show('talking');
    this.later(2200, () => {
      this.show('happy');
      this.later(900, () => this.idle());
    });
  }
  destroy() { this.disposed = true; this.clear(); }
}

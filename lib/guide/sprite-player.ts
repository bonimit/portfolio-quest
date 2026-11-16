import { ASSISTANT_ATLAS } from './assistant-atlas.ts';
import { avatarClips, sampleClip, walkFrame, type AvatarPose, type FrameCue } from './assistant-motion.ts';

/** Paints atlas frames without React rerenders. One decoded image, no per-frame downloads. */
export class SpritePlayer {
  private root: HTMLElement;
  private sheet: HTMLImageElement;
  private timer = 0;
  private disposed = false;
  private loaded = false;
  private frame = -1;
  private pose: AvatarPose = 'idle-front';
  private desired: () => void = () => this.play('idle-front');
  private onReady?: () => void;
  private load = () => {
    void this.sheet.decode().catch(() => undefined).then(() => {
      if (this.disposed || !this.sheet.naturalWidth) return;
      this.loaded = true;
      this.root.dataset.loaded = 'true';
      this.desired();
      this.onReady?.();
    });
  };
  private error = () => { this.root.dataset.failed = 'true'; this.stop(); };

  constructor(root: HTMLElement, onReady?: () => void) {
    this.root = root;
    const sheet = root.querySelector<HTMLImageElement>('.assistant-sheet');
    if (!sheet) throw new Error('Sprite sheet element is missing');
    this.sheet = sheet;
    this.onReady = onReady;
    sheet.addEventListener('load',this.load);
    sheet.addEventListener('error',this.error);
    if (sheet.complete && sheet.naturalWidth) this.load();
  }
  get ready() { return this.loaded; }
  private paint(frame: number, pose: AvatarPose) {
    if (this.disposed) return;
    if (this.root.dataset.pose !== pose) this.root.dataset.pose = pose;
    if (this.frame === frame) return;
    this.frame = frame;
    this.root.dataset.frame = String(frame);
    const column = frame % ASSISTANT_ATLAS.columns;
    const row = Math.floor(frame / ASSISTANT_ATLAS.columns);
    this.sheet.style.transform = `translate3d(${-column*100/ASSISTANT_ATLAS.columns}%,${-row*100/ASSISTANT_ATLAS.rows}%,0)`;
  }
  stop() { window.clearTimeout(this.timer); this.timer = 0; }
  staticFront() {
    this.stop();
    this.desired = () => this.staticFront();
    this.pose = 'idle-front';
    this.paint(ASSISTANT_ATLAS.groups['idle-front'][0],'idle-front');
  }
  play(pose: Exclude<AvatarPose,'walk-left'|'walk-right'|'turn'>, onComplete?: () => void) {
    if (this.pose === pose && this.timer && !onComplete) return;
    const clip = avatarClips[pose];
    this.sequence(pose,clip.cues,clip.loop,onComplete);
  }
  sequence(pose: AvatarPose, frames: readonly FrameCue[], loop = false, onComplete?: () => void) {
    this.stop();
    this.pose = pose;
    this.desired = () => this.sequence(pose,frames,loop,onComplete);
    if (!this.loaded || this.disposed) return;
    const start = performance.now();
    const tick = () => {
      if (this.disposed) return;
      const sample = sampleClip(frames,performance.now()-start,loop);
      this.paint(sample.frame,pose);
      if (sample.done) { this.timer = 0; onComplete?.(); }
      else this.timer = window.setTimeout(tick,Math.max(16,sample.remaining));
    };
    tick();
  }
  walk(facing: 'left'|'right', distance: number) {
    if (this.pose !== `walk-${facing}`) this.stop();
    this.pose = `walk-${facing}`;
    this.paint(walkFrame(facing,distance),this.pose);
  }
  destroy() {
    this.disposed = true; this.stop();
    this.sheet.removeEventListener('load',this.load);
    this.sheet.removeEventListener('error',this.error);
  }
}

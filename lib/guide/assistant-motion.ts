import { ASSISTANT_ATLAS } from './assistant-atlas.ts';

export type AvatarPose = 'idle-front' | 'idle-back' | 'walk-left' | 'walk-right' | 'turn' | 'thinking' | 'talking' | 'happy' | 'wave';
export type AvatarActivity = 'idle-front' | 'thinking' | 'talking' | 'happy' | 'wave';
export type Facing = 'front' | 'back' | 'left' | 'right';
export type FrameCue = { frame: number; duration: number };
const g = ASSISTANT_ATLAS.groups;
const cues = (frames: readonly number[], durations: readonly number[]): readonly FrameCue[] => frames.map((frame, i) => ({ frame, duration: durations[i % durations.length] }));

/** Select frontal conversation poses; the atlas's back-view calling pose is not a speech frame. */
export const avatarClips: Record<Exclude<AvatarPose, 'walk-left' | 'walk-right' | 'turn'>, { cues: readonly FrameCue[]; loop: boolean }> = {
  'idle-front': { cues: cues([g['idle-front'][0],g['idle-front'][1],g['idle-front'][2],g['idle-front'][3],g['idle-front'][4],g['idle-front'][3]], [1600,180,180,180,140,240]), loop: true },
  'idle-back': { cues: cues(g['idle-back'], [1200,240,240,240,240]), loop: true },
  thinking: { cues: cues([g.thinking[0],g.thinking[1],g.thinking[2],g.thinking[1]], [500,350,500,350]), loop: true },
  talking: { cues: cues([g.talking[3],g['idle-front'][3],g.talking[3],g['idle-front'][4],g.talking[3]], [300,150,350,150,350]), loop: true },
  happy: { cues: cues([g.happy[0],g.happy[1],g.happy[2],g.happy[1]], [180,260,260,200]), loop: false },
  wave: { cues: cues([g['turn'][4],g.wave[2],g.happy[0],g.wave[2],g['idle-front'][3]], [140,260,180,320,180]), loop: false },
};

export function sampleClip(sequence: readonly FrameCue[], elapsed: number, loop: boolean) {
  if (!sequence.length) throw new Error('An animation needs at least one frame');
  const total = sequence.reduce((sum, cue) => sum + cue.duration, 0);
  const bounded = Math.max(0, elapsed);
  if (!loop && bounded >= total) return { frame: sequence[sequence.length - 1].frame, remaining: 0, done: true };
  let position = bounded % total;
  for (const cue of sequence) {
    if (position < cue.duration) return { frame: cue.frame, remaining: cue.duration - position, done: false };
    position -= cue.duration;
  }
  return { frame: sequence[0].frame, remaining: sequence[0].duration, done: false };
}

const walkOrder = [1,2,3,4,5,6,5,4,3,2] as const;
/** One gait cycle per 36 CSS pixels, including acceleration/deceleration. No idle foot cycling. */
export function walkFrame(facing: 'left' | 'right', distance: number) {
  const sequence = g[facing === 'left' ? 'walk-left' : 'walk-right'];
  const index = Math.floor(Math.max(0, distance) / 36 * walkOrder.length) % walkOrder.length;
  return sequence[walkOrder[index]];
}

export function turnFrames(from: Facing, to: Facing): readonly FrameCue[] {
  if (from === to) return [];
  const ring: Facing[] = ['front','right','back','left'];
  const start = ring.indexOf(from), end = ring.indexOf(to);
  const forward = (end - start + 4) % 4;
  const direction = forward <= 2 ? 1 : -1;
  const count = Math.min(forward,4-forward);
  return Array.from({ length: count + 1 }, (_, index) => ({ frame: g.turn[(start + direction*index + 4) % 4], duration: 110 }));
}

/** Constant cruise speed with 160ms quadratic acceleration/braking ramps. */
export function travelProgress(elapsed: number, duration: number) {
  if (duration <= 0) return 1;
  const t = Math.max(0,Math.min(1,elapsed/duration));
  const a = Math.min(.15,160/duration);
  if (t < a) return t*t/(2*a*(1-a));
  if (t > 1-a) return 1-(1-t)*(1-t)/(2*a*(1-a));
  return (t-a/2)/(1-a);
}

export function travelKeyframes(from: number, to: number, duration: number) {
  const ramp = Math.min(.15,160/duration);
  return [0,ramp/2,ramp,.25,.5,.75,1-ramp,1-ramp/2,1].map((offset) => ({
    offset, transform: `translateX(${from+(to-from)*travelProgress(offset*duration,duration)}px)`,
  }));
}

/** Match the native animation's linear interpolation between sampled ramp keyframes. */
export function travelClockProgress(elapsed: number, duration: number) {
  if (duration <= 0) return 1;
  const t = Math.max(0, Math.min(1, elapsed / duration));
  const ramp = Math.min(.15,160/duration);
  const offsets = [0,ramp/2,ramp,.25,.5,.75,1-ramp,1-ramp/2,1];
  for (let i=1;i<offsets.length;i++) {
    if (t <= offsets[i]) {
      const from=offsets[i-1], to=offsets[i];
      const a=travelProgress(from*duration,duration), b=travelProgress(to*duration,duration);
      return a+(b-a)*(t-from)/(to-from);
    }
  }
  return 1;
}

/** Pointer-restored focus must not freeze wandering; keyboard focus must. */
export function holdsGuideFocus(keyboardModality: boolean, focusVisible: boolean) {
  return keyboardModality && focusVisible;
}

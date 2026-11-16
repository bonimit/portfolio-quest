/** Bounds belong to the reserved avatar stage, never to the button area. */
export function wanderTarget(stageWidth: number, avatarWidth: number, step: number) {
  const available = Math.max(0, stageWidth - avatarWidth - 32);
  return Math.min(Math.max(0, stageWidth - avatarWidth), 16 + available * (step % 2 ? .85 : .15));
}
export function walkDuration(distance: number) { return Math.min(6500, Math.max(1200, Math.abs(distance) / 35 * 1000)); }

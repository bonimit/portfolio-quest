// The reference's alternating wide/narrow rhythm and 60Hz spring coefficients.
export const LETTER_WEIGHTS = [2.1, .55, 1.7, .6, 2.4, .5, 1.15, 1.9, .65, 2.2, .9, 1.45, .55, 2, .7, 1.3];

export function springStep(velocity: number, stretch: number) {
  const target = 1 + Math.min(1.1, Math.abs(velocity) * .55);
  return {
    stretch: stretch + (target - stretch) * .12,
    velocity: velocity * .86,
  };
}

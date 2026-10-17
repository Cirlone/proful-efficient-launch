import { BEAT } from "../config/timing";

/** Index of the beat that `frame` falls in, relative to `offset`. Negative before the offset. */
export const beatIndex = (frame: number, offset = 0) => Math.floor((frame - offset) / BEAT);

/**
 * Sharp-attack / exponential-decay pulse that fires on every beat.
 * 1 on the beat, falling toward 0 by the next one. `decay` is in frames.
 */
export const beatPulse = (frame: number, offset = 0, decay = 5) => {
  if (frame < offset) return 0;
  const p = (frame - offset) % BEAT;
  return Math.exp(-p / decay);
};

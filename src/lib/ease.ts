import { Easing, interpolate } from "remotion";

export type EaseFn = (t: number) => number;

export const easeOutExpo: EaseFn = Easing.bezier(0.16, 1, 0.3, 1);
export const easeOutQuart: EaseFn = Easing.bezier(0.25, 1, 0.5, 1);
export const easeInOutCubic: EaseFn = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOutBack: EaseFn = Easing.bezier(0.34, 1.56, 0.64, 1);
export const easeInExpo: EaseFn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeInCubic: EaseFn = Easing.bezier(0.32, 0, 0.67, 0);
export const linear: EaseFn = (t) => t;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * 0 → 1 progress of `frame` across [start, start + duration], eased and clamped.
 * The workhorse of every animation in this project.
 */
export const prog = (
  frame: number,
  start: number,
  duration: number,
  easing: EaseFn = easeOutExpo,
) =>
  interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** 0 → 1 → 0 pulse: rises over `up` frames at `at`, falls over `down` frames. */
export const bump = (frame: number, at: number, up: number, down: number) =>
  // interpolate() needs strictly increasing inputs, so a 0-frame attack/decay is nudged to 0.001
  interpolate(frame, [at - Math.max(0.001, up), at, at + Math.max(0.001, down)], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

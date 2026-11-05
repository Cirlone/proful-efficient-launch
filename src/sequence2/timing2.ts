/**
 * SEQUENCE 2 — "Secretul Profului Cool" product demonstration.
 * Independent timeline (does NOT touch src/config/timing.ts, so Sequence 1 is unchanged).
 * 1920×1080 · 30 fps · 12 s.
 */
import { FPS, HEIGHT, WIDTH } from "../config/timing";

export { FPS, HEIGHT, WIDTH };

export const S2 = {
  /** 1 · teacher puts the phone down and starts working   0–2 s */
  teacher: { from: 0, to: 60 },
  /** 2 · push into the laptop → full-frame app            2–4 s (continues the teacher component) */
  push: { from: 60, to: 120 },
  /** 3 · PDF workflow                                      4–8 s  → segments below */
  /** 4 · equations + similar exercises + finished sheet    8–12 s → segments below */
} as const;

export type SegId = "dash" | "model" | "gen" | "nl" | "eq" | "genEx" | "result";

/** App segments (global frames of Sequence 2). Contiguous from the end of the push. */
export const SEGMENTS: { id: SegId; from: number; to: number }[] = [
  { id: "dash", from: 120, to: 156 },
  { id: "model", from: 156, to: 204 },
  { id: "gen", from: 204, to: 240 },
  { id: "nl", from: 240, to: 278 },
  { id: "eq", from: 278, to: 304 },
  { id: "genEx", from: 304, to: 330 },
  { id: "result", from: 330, to: 360 },
];

export const TOTAL_FRAMES_S2 = 360;

/** Hard cuts between app screens (they get the cyan light-bar FX). */
export const CUTS_S2 = SEGMENTS.slice(1).map((s) => s.from);

/** Frames a segment keeps rendering under the next one so a cut never shows empty background. */
export const SEG_OVERLAP = 4;

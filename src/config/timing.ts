/**
 * TIMING — the single source of truth for the whole edit.
 *
 * To re-time the ad, edit SCENE_SECONDS (seconds) and/or BPM below.
 * Scenes must be contiguous (each `from` equals the previous `to`);
 * `assertTimeline()` runs at startup and throws a clear error if not.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Tempo of the licensed music track you will drop in. Drives all beat-synced hits. */
export const BPM = 120;
/** Frames per beat (15 at 120 BPM / 30 fps). */
export const BEAT = (FPS * 60) / BPM;

export const toFrames = (seconds: number) => Math.round(seconds * FPS);

export type SceneKey = "chaos" | "order" | "reveal" | "beats" | "resolve" | "outro";

export const SCENE_KEYS: SceneKey[] = [
  "chaos",
  "order",
  "reveal",
  "beats",
  "resolve",
  "outro",
];

/* ───────────────────────── EDIT SCENE BOUNDARIES HERE ───────────────────────── */
const SCENE_SECONDS: Record<SceneKey, { from: number; to: number; label: string }> = {
  chaos: { from: 0, to: 4, label: "1 · Chaos — PREA MULTĂ MUNCĂ REPETITIVĂ" },
  order: { from: 4, to: 8, label: "2 · Order — COMPLEXITATEA, SIMPLIFICATĂ" },
  reveal: { from: 8, to: 12, label: "3 · Reveal — BAC generator" },
  beats: { from: 12, to: 18, label: "4 · Beat sequence — screenshots on the beat" },
  resolve: { from: 18, to: 22, label: "5 · Resolve — MAI PUȚIN TIMP PIERDUT" },
  outro: { from: 22, to: 28, label: "6 · Outro — brand + CTA" },
};
/* ────────────────────────────────────────────────────────────────────────────── */

export type SceneTiming = {
  key: SceneKey;
  label: string;
  /** start, in frames of the main composition */
  from: number;
  /** end (exclusive), in frames */
  to: number;
  duration: number;
};

export const SCENES = SCENE_KEYS.reduce((acc, key) => {
  const s = SCENE_SECONDS[key];
  acc[key] = {
    key,
    label: s.label,
    from: toFrames(s.from),
    to: toFrames(s.to),
    duration: toFrames(s.to) - toFrames(s.from),
  };
  return acc;
}, {} as Record<SceneKey, SceneTiming>);

export const TOTAL_FRAMES = toFrames(SCENE_SECONDS.outro.to);

/** Frames at which one scene hands over to the next (used by the cut effects). */
export const CUT_FRAMES = SCENE_KEYS.slice(1).map((k) => SCENES[k].from);

export const assertTimeline = () => {
  let cursor = 0;
  for (const key of SCENE_KEYS) {
    const s = SCENE_SECONDS[key];
    if (s.from !== cursor) {
      throw new Error(
        `Timeline gap/overlap: scene "${key}" starts at ${s.from}s but previous scene ended at ${cursor}s.`,
      );
    }
    if (s.to <= s.from) {
      throw new Error(`Scene "${key}" must end after it starts.`);
    }
    cursor = s.to;
  }
};

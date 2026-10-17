import { BEAT, FPS, SCENES, toFrames } from "./timing";

/**
 * AUDIO PLACEHOLDERS
 * ──────────────────
 * No audio ships with this project (music and SFX must be licensed).
 *
 * To add sound:
 *   1. Put your licensed files in public/audio/ (see public/audio/README.md).
 *   2. Set `enabled: true` below.
 *   3. Re-render.
 *
 * The music is assumed to be at BPM (src/config/timing.ts). If your track has a
 * different tempo, change BPM there and every beat-synced visual follows.
 */
export const AUDIO = {
  enabled: false,

  music: {
    /** public/audio/music.mp3 — licensed track, ~28 s or longer, at the BPM in timing.ts */
    file: "audio/music.mp3",
    volume: 0.85,
    /** start playback this many seconds into the track (to land a drop on the reveal) */
    startFromSeconds: 0,
    fadeInSeconds: 0.4,
    fadeOutSeconds: 2.0,
  },

  sfxVolume: 0.9,
} as const;

export type SfxKind = "riser" | "slam" | "whoosh" | "impact" | "tick" | "click";

/** Placeholder file for each sound-effect kind — drop licensed files at these paths. */
export const SFX_FILES: Record<SfxKind, string> = {
  riser: "audio/sfx/riser.wav",
  slam: "audio/sfx/slam.wav",
  whoosh: "audio/sfx/whoosh.wav",
  impact: "audio/sfx/impact.wav",
  tick: "audio/sfx/tick.wav",
  click: "audio/sfx/click.wav",
};

export type SfxCue = { kind: SfxKind; frame: number; volume?: number; note: string };

const at = (sceneKey: keyof typeof SCENES, offsetFrames: number) =>
  SCENES[sceneKey].from + offsetFrames;

/** Where each sound effect should land. Frames are on the main timeline. */
export const SFX_CUES: SfxCue[] = [
  // 1 · chaos — word slams
  { kind: "riser", frame: 0, volume: 0.5, note: "chaos build" },
  { kind: "slam", frame: at("chaos", 6), note: "PREA" },
  { kind: "slam", frame: at("chaos", 22), note: "MULTĂ" },
  { kind: "slam", frame: at("chaos", 38), note: "MUNCĂ" },
  { kind: "slam", frame: at("chaos", 54), note: "REPETITIVĂ." },
  // 2 · order
  { kind: "whoosh", frame: at("order", 0), note: "cut into order" },
  { kind: "click", frame: at("order", 46), volume: 0.7, note: "grid locks" },
  { kind: "slam", frame: at("order", 54), note: "SIMPLIFICATĂ." },
  // 3 · reveal
  { kind: "whoosh", frame: at("reveal", 6), note: "panel flies in" },
  { kind: "impact", frame: at("reveal", 40), volume: 1, note: "panel lands" },
  // 4 · beat sequence — a tick on every beat; panels LAND on beats 2–9 (see showcase.ts)
  ...Array.from({ length: 11 }, (_, i) => ({
    kind: "tick" as const,
    frame: at("beats", Math.round((i + 1) * BEAT)),
    note: `beat ${i + 2}`,
  })),
  // 5 · resolve
  { kind: "whoosh", frame: at("resolve", 0), note: "panels resolve" },
  { kind: "slam", frame: at("resolve", 34), note: "MAI PUȚIN TIMP PIERDUT." },
  { kind: "slam", frame: at("resolve", 66), note: "MAI MULT TIMP…" },
  // 6 · outro
  { kind: "impact", frame: at("outro", 12), volume: 1, note: "logo hit" },
  { kind: "slam", frame: at("outro", 30), note: "PROFUL EFICIENT" },
  { kind: "whoosh", frame: at("outro", 58), note: "tagline wipe" },
  { kind: "click", frame: at("outro", 104), note: "CTA pops" },
];

export const framesToSeconds = (frames: number) => frames / FPS;
export const secondsToFrames = toFrames;

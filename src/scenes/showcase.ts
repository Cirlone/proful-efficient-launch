import type { ShotId } from "../config/assets";
import { BEAT } from "../config/timing";
import { pose, type Pose } from "../lib/pose";

/** Frames a panel takes to fly in. */
export const FLY = 12;
/**
 * Frames after take-off at which a panel visually lands (the ease is front-loaded, so it is
 * "there" well before FLY is over). Every landing is locked to a beat: see `impactFrame`.
 */
export const IMPACT = 7;
/** Frame (scene 4) a panel starts flying so that it LANDS exactly on beat k + 1. */
export const arrivalFrame = (k: number) => k * BEAT + (BEAT - IMPACT);
/** Frame (scene 4) panel k lands — always a beat boundary (15, 30, 45 … at 120 BPM). */
export const impactFrame = (k: number) => arrivalFrame(k) + IMPACT;

/**
 * Shared choreography for scene 4 (beat sequence) and scene 5 (resolve).
 * Scene 5 starts exactly where scene 4 ends, so both read from this one file.
 *
 * Eight real screenshots. Each flies in on its own beat (k = 0..7), slides aside into
 * its `dock` slot, and in scene 5 the docks resolve into `resolve` poses.
 * The last one (the BAC generator, index 7) is the "anchor": it stays centre-stage.
 */

export const SHOWCASE_PANEL_W = 1100;
/** Index of the panel that stays centred through scenes 4 and 5. */
export const ANCHOR = 7;
/** How far the anchor has pushed toward camera by the end of scene 4. */
export const ANCHOR_END_Z = 150;

export type ShowcasePanel = {
  shot: ShotId;
  /** Real UI wording from the screenshot, shown as the beat caption */
  caption: string;
  /** where it parks after sliding aside (end of scene 4) */
  dock: Pose;
  /** where it settles in scene 5; null = it recedes and disappears */
  resolve: Pose | null;
  /** opacity at rest in scene 5 */
  resolveOpacity: number;
};

export const PANELS: ShowcasePanel[] = [
  {
    shot: "landingHero",
    caption: "Creezi teste în minute",
    dock: pose({ x: -780, y: -250, z: -420, rx: 6, ry: 30, rz: -5, s: 0.6 }),
    resolve: null,
    resolveOpacity: 0,
  },
  {
    shot: "dashboard",
    caption: "Acțiuni rapide",
    dock: pose({ x: 790, y: -240, z: -380, rx: 6, ry: -30, rz: 5, s: 0.6 }),
    resolve: null,
    resolveOpacity: 0,
  },
  {
    shot: "createContent",
    caption: "Creează conținut",
    dock: pose({ x: -860, y: 200, z: -560, rx: -5, ry: 34, rz: 4, s: 0.58 }),
    resolve: pose({ x: -700, y: -170, z: -280, ry: 26, s: 0.62 }),
    resolveOpacity: 1,
  },
  {
    shot: "generateModes",
    caption: "Teste și fișe de lucru",
    dock: pose({ x: 850, y: 210, z: -520, rx: -5, ry: -34, rz: -4, s: 0.58 }),
    resolve: pose({ x: 700, y: -170, z: -280, ry: -26, s: 0.62 }),
    resolveOpacity: 1,
  },
  {
    shot: "translateLatex",
    caption: "Text în LaTeX",
    dock: pose({ x: -430, y: -420, z: -820, rx: 12, ry: 20, rz: -2, s: 0.54 }),
    resolve: null,
    resolveOpacity: 0,
  },
  {
    shot: "exerciseGenerator",
    caption: "Capitole și dificultate",
    dock: pose({ x: 440, y: -430, z: -860, rx: 12, ry: -20, rz: 2, s: 0.54 }),
    resolve: null,
    resolveOpacity: 0,
  },
  {
    shot: "myStudents",
    caption: "Elevii mei",
    dock: pose({ x: -380, y: 430, z: -820, rx: -12, ry: 20, rz: 2, s: 0.54 }),
    resolve: null,
    resolveOpacity: 0,
  },
  {
    shot: "bacAlt",
    caption: "Generator BAC AI",
    // anchor: stays centred
    dock: pose({ x: 0, y: -40, z: 0, rx: 3, ry: 0, s: 1 }),
    resolve: pose({ x: 0, y: -190, z: 0, rx: 0, ry: 0, s: 0.82 }),
    resolveOpacity: 1,
  },
];

/** The closing words, one per beat, over beats 10–12 of scene 4 (the site's own phrase). */
export const CLOSING_WORDS = ["Teste", "Exerciții", "Variante BAC"] as const;

/** Where panel k starts its fly-in (deep behind the camera plane, tilted, off to one side). */
export const flyStart = (k: number): Pose => {
  const dir = k % 2 === 0 ? 1 : -1;
  return pose({
    x: dir * 720,
    y: ((k * 37) % 5 - 2) * 150,
    z: -2900,
    rx: ((k % 3) - 1) * 28,
    ry: dir * 60,
    rz: dir * 17,
    s: 0.8,
  });
};

/** Where panel k lands when it hits centre-stage (a different slight tilt each beat). */
export const heroPose = (k: number): Pose =>
  pose({ x: 0, y: -40, z: 0, rx: 3, ry: k % 2 === 0 ? -6 : 6, rz: 0, s: 1 });

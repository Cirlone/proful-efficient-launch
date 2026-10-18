import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { shotMeta, type ShotId } from "../config/assets";
import { COLORS, cyanA, FONT_FAMILY } from "../config/theme";
import { easeInOutCubic, easeOutExpo, lerp, prog } from "../lib/ease";
import { Screen, type CamKey, type ScreenProps } from "../sequence2/camera";
import type { SegId } from "../sequence2/timing2";
import { DASH_REST_V, VW } from "./TeacherScenesV";

/**
 * 9:16 version of the app segments. Same real screenshots, same real UI wording and highlight
 * rectangles as the 16:9 cut — only the camera changes: instead of fitting the wide capture, it
 * crops/zooms onto the element that matters. `zr(shot, s)` converts a RAW pixel scale
 * (1 = one screenshot pixel per video pixel) into the camera's fit-width zoom.
 */
const zr = (shot: ShotId, s: number) => s / (VW / shotMeta(shot).w);
const key = (f: number, shot: ShotId, cx: number, cy: number, s: number): CamKey => ({
  f,
  cx,
  cy,
  z: zr(shot, s),
});
/** fit-width view of a whole capture (whole UI visible) */
const fit = (f: number, shot: ShotId, cx: number, cy: number): CamKey => ({ f, cx, cy, z: 1 });

/** Callout pill position in the free band above / below the capture. */
const TOP = 250;

/* ── 3 · PDF workflow ─────────────────────────────────────────────────────────── */

const DASH_CARD: [number, number, number, number] = [962, 502, 431, 276];
const dash: ScreenProps = {
  shot: "dashboard",
  enter: false,
  cam: [
    { f: 0, ...DASH_REST_V },
    { f: 6, ...DASH_REST_V },
    key(26, "dashboard", 1177, 600, 1.8),
  ],
  spot: { rect: DASH_CARD, r: 26, keys: [8, 20, 33, 36], amount: 0.62 },
  rings: [{ rect: DASH_CARD, r: 26, from: 10 }],
  cursor: {
    pts: [
      { f: 2, x: 1560, y: 300 },
      { f: 24, x: 1040, y: 585 },
    ],
    clicks: [26],
  },
  callouts: [{ text: "Încarcă document", anchor: [1177, 502], offset: [0, 0], at: [-1, TOP], from: 14 }],
};

const MODEL_CARD: [number, number, number, number] = [488, 395, 452, 668];
const MODEL_TEXT: [number, number, number, number] = [526, 572, 372, 200];
const DROPZONE: [number, number, number, number] = [532, 868, 366, 172];
const DROP_C = { x: 715, y: 954 };

const PdfChip: React.FC<{ x: number; y: number; scale: number; opacity: number; rot: number }> = ({
  x,
  y,
  scale,
  opacity,
  rot,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 60,
      top: y - 76,
      width: 120,
      height: 152,
      opacity,
      transform: `scale(${scale}) rotate(${rot}deg)`,
      borderRadius: 14,
      background: "linear-gradient(160deg, #FFFFFF, #DDE8F8)",
      boxShadow: `0 0 50px ${cyanA(0.7)}, 0 24px 50px rgba(0,0,0,0.55)`,
      border: `3px solid ${COLORS.cyan}`,
      fontFamily: FONT_FAMILY,
      fontWeight: 800,
      color: COLORS.cyanDeep,
      fontSize: 34,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      paddingBottom: 18,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 22,
        right: 22,
        top: 26,
        height: 54,
        background: "repeating-linear-gradient(180deg, rgba(14,143,163,0.35) 0 5px, transparent 5px 14px)",
        borderRadius: 4,
      }}
    />
    PDF
  </div>
);

const model: ScreenProps = {
  shot: "generateModes",
  cam: [fit(0, "generateModes", 959, 531), key(14, "generateModes", 714, 720, 1.7), key(48, "generateModes", 714, 790, 1.8)],
  spot: { rect: MODEL_CARD, r: 34, keys: [3, 14, 44, 48], amount: 0.64 },
  rings: [
    { rect: MODEL_TEXT, r: 16, from: 10, to: 24 },
    { rect: DROPZONE, r: 26, from: 22 },
  ],
  callouts: [
    { text: "AI-ul extrage exercițiile", anchor: [712, 572], offset: [0, 0], at: [-1, TOP], from: 10, to: 26 },
    { text: "Încarcă modelul", anchor: [715, 1040], offset: [0, 0], at: [-1, 1620], side: "below", from: 28 },
  ],
  cursor: {
    pts: [
      { f: 12, x: 1010, y: 430 },
      { f: 30, x: DROP_C.x + 40, y: DROP_C.y - 6 },
    ],
    clicks: [34],
  },
  extras: (map, frame) => {
    const t = prog(frame, 12, 18, easeInOutCubic);
    if (frame < 12 || frame > 40) return null;
    const sx = lerp(1010, DROP_C.x, t);
    const sy = lerp(430, DROP_C.y, t) - Math.sin(t * Math.PI) * 60;
    const [px, py] = map(sx, sy);
    const drop = prog(frame, 30, 8, easeOutExpo);
    return (
      <PdfChip
        x={px}
        y={py}
        scale={(1 - 0.75 * drop) * (1.15 - 0.15 * t)}
        opacity={1 - drop}
        rot={-10 * (1 - t)}
      />
    );
  },
};

const GEN_BTN: [number, number, number, number] = [97, 933, 237, 78];
const gen: ScreenProps = {
  shot: "exerciseGenerator",
  cam: [
    fit(0, "exerciseGenerator", 958, 519),
    key(10, "exerciseGenerator", 790, 440, 1.05),
    key(18, "exerciseGenerator", 790, 440, 1.05),
    key(32, "exerciseGenerator", 300, 900, 1.8),
  ],
  spot: { rect: GEN_BTN, r: 22, keys: [18, 26, 33, 36], amount: 0.45 },
  rings: [
    { rect: [465, 353, 154, 58], r: 29, from: 4, to: 22 },
    { rect: [1207, 353, 111, 58], r: 29, from: 7, to: 22 },
    { rect: GEN_BTN, r: 22, from: 22 },
  ],
  cursor: {
    pts: [
      { f: 2, x: 900, y: 200 },
      { f: 12, x: 560, y: 392 },
      { f: 28, x: 215, y: 975 },
    ],
    clicks: [30],
  },
  callouts: [
    { text: "Profil · Capitole · Dificultate", anchor: [790, 330], offset: [0, 0], at: [-1, TOP], from: 6, to: 24 },
  ],
};

/* ── 4 · equations + similar exercises + finished sheet ───────────────────────── */

const NL_INPUT: [number, number, number, number] = [589, 809, 1178, 110];
const nl: ScreenProps = {
  shot: "translateLatex",
  cam: [
    fit(0, "translateLatex", 957, 522),
    key(12, "translateLatex", 1120, 790, 0.95),
    key(20, "translateLatex", 1120, 790, 0.95),
    key(34, "translateLatex", 1540, 830, 1.5),
  ],
  spot: { rect: NL_INPUT, r: 22, keys: [6, 14, 35, 38], amount: 0.5 },
  rings: [
    { rect: [589, 810, 993, 108], r: 18, from: 8 },
    { rect: [1607, 809, 160, 110], r: 22, from: 20 },
  ],
  cursor: {
    pts: [
      { f: 2, x: 980, y: 380 },
      { f: 12, x: 900, y: 866 },
      { f: 28, x: 1690, y: 864 },
    ],
    clicks: [30],
  },
  callouts: [
    { text: "Limbaj Natural → Matematic", anchor: [900, 809], offset: [0, 0], at: [-1, 700], from: 10, to: 30 },
  ],
};

const EQ_CARD: [number, number, number, number] = [1140, 602, 605, 225];
const eq: ScreenProps = {
  shot: "landingHero",
  cam: [fit(0, "landingHero", 950, 528), key(14, "landingHero", 1442, 730, 1.6)],
  spot: { rect: EQ_CARD, r: 26, keys: [4, 14, 22, 26], amount: 0.6 },
  rings: [{ rect: EQ_CARD, r: 26, from: 8 }],
  callouts: [{ text: "Formulări exacte", anchor: [1442, 602], offset: [0, 0], at: [-1, 520], from: 10 }],
};

const GENEX_BTN: [number, number, number, number] = [1430, 731, 337, 54];
const genEx: ScreenProps = {
  shot: "translateLatex",
  cam: [key(0, "translateLatex", 1400, 820, 1.2), key(14, "translateLatex", 1590, 770, 1.9)],
  spot: { rect: GENEX_BTN, r: 26, keys: [3, 12, 22, 26], amount: 0.5 },
  rings: [{ rect: GENEX_BTN, r: 26, from: 6 }],
  cursor: {
    pts: [
      { f: 0, x: 1690, y: 864 },
      { f: 14, x: 1600, y: 760 },
    ],
    clicks: [16],
  },
  callouts: [{ text: "Generează 5 exerciții", anchor: [1598, 731], offset: [0, 0], at: [-1, 420], from: 6 }],
};

const RESULT_CARD: [number, number, number, number] = [548, 360, 749, 618];
const DL_BTN: [number, number, number, number] = [658, 572, 242, 41];
const result: ScreenProps = {
  shot: "bacHero",
  cam: [fit(0, "bacHero", 945, 522), key(16, "bacHero", 922, 650, 1.35)],
  spot: { rect: RESULT_CARD, r: 40, keys: [3, 13, 20, 28], amount: 0.5 },
  rings: [{ rect: DL_BTN, r: 14, from: 12 }],
  callouts: [
    { text: "Descarcă Subiect (PDF)", anchor: [779, 572], offset: [0, 0], at: [-1, 330], from: 10, to: 21 },
  ],
};

export const SEGMENT_PROPS_V: Record<SegId, ScreenProps> = {
  dash,
  model,
  gen,
  nl,
  eq,
  genEx,
  result,
};

/** Real capture over the animated brand backdrop (the wide capture does not fill a 9:16 frame). */
export const DemoSegmentV: React.FC<{ id: SegId; energy?: number }> = ({ id, energy = 0.6 }) => (
  <AbsoluteFill>
    <Background energy={energy} />
    <Screen {...SEGMENT_PROPS_V[id]} />
  </AbsoluteFill>
);

import React from "react";
import { COLORS, cyanA, FONT_FAMILY } from "../config/theme";
import { easeInOutCubic, easeOutExpo, lerp, prog } from "../lib/ease";
import { Screen, type ScreenProps } from "./camera";
import { DASH_REST } from "./TeacherScenes";
import type { SegId } from "./timing2";

/**
 * Every highlight below sits on a REAL element of a REAL screenshot; coordinates are in the
 * screenshot's own pixels. Callout wording is copied from the app's UI text — nothing invented.
 */

/* ── 3 · PDF workflow ─────────────────────────────────────────────────────────── */

/** "Încarcă document" quick action on the dashboard. */
const DASH_CARD: [number, number, number, number] = [962, 502, 431, 276];

const dash: ScreenProps = {
  shot: "dashboard",
  enter: false, // continues straight out of the laptop push
  cam: [
    { f: 0, ...DASH_REST },
    { f: 6, ...DASH_REST },
    { f: 24, cx: 1177, cy: 610, z: 1.5 },
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
  callouts: [{ text: "Încarcă document", anchor: [1177, 502], offset: [-290, -190], from: 14 }],
};

/** The "Creează după Model" card, its description and the PDF drop-zone. */
const MODEL_CARD: [number, number, number, number] = [488, 395, 452, 668];
const MODEL_TEXT: [number, number, number, number] = [526, 572, 372, 200];
const DROPZONE: [number, number, number, number] = [532, 868, 366, 172];
const DROP_C = { x: 715, y: 954 };

/** A generic PDF file glyph (not part of the app) travelling into the real drop-zone. */
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
        background:
          "repeating-linear-gradient(180deg, rgba(14,143,163,0.35) 0 5px, transparent 5px 14px)",
        borderRadius: 4,
      }}
    />
    PDF
  </div>
);

const model: ScreenProps = {
  shot: "generateModes",
  cam: [
    { f: 0, cx: 959, cy: 531, z: 1 },
    { f: 14, cx: 720, cy: 690, z: 1.4 },
    { f: 48, cx: 720, cy: 740, z: 1.5 },
  ],
  spot: { rect: MODEL_CARD, r: 34, keys: [3, 14, 44, 48], amount: 0.64 },
  // the real sentence: "AI-ul extrage exercițiile, le afișează pentru verificare, apoi generează un test nou similar."
  rings: [
    { rect: MODEL_TEXT, r: 16, from: 10, to: 24 },
    { rect: DROPZONE, r: 26, from: 22 },
  ],
  callouts: [
    { text: "AI-ul extrage exercițiile", anchor: [712, 572], offset: [-330, -170], from: 10, to: 26 },
    { text: "Încarcă modelul", anchor: [898, 905], offset: [90, -210], from: 28 },
  ],
  cursor: {
    pts: [
      { f: 12, x: 1200, y: 520 },
      { f: 30, x: DROP_C.x + 40, y: DROP_C.y - 6 },
    ],
    clicks: [34],
  },
  extras: (map, frame) => {
    const t = prog(frame, 12, 18, easeInOutCubic);
    if (frame < 12 || frame > 40) return null;
    const sx = lerp(1200, DROP_C.x, t);
    const sy = lerp(520, DROP_C.y, t) - Math.sin(t * Math.PI) * 70;
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

/** Generator screen: profile / difficulty chips and the "Generează" button. */
const GEN_BTN: [number, number, number, number] = [97, 933, 237, 78];
const gen: ScreenProps = {
  shot: "exerciseGenerator",
  cam: [
    { f: 0, cx: 958, cy: 519, z: 1 },
    { f: 16, cx: 711, cy: 640, z: 1.35 },
  ],
  spot: { rect: GEN_BTN, r: 22, keys: [14, 22, 33, 36], amount: 0.45 },
  rings: [
    { rect: [465, 353, 154, 58], r: 29, from: 4, to: 20 },
    { rect: [1207, 353, 111, 58], r: 29, from: 7, to: 20 },
    { rect: GEN_BTN, r: 22, from: 18 },
  ],
  cursor: {
    pts: [
      { f: 2, x: 900, y: 200 },
      { f: 12, x: 560, y: 392 },
      { f: 26, x: 215, y: 975 },
    ],
    clicks: [28],
  },
  callouts: [{ text: "Profil · Capitole · Dificultate", anchor: [330, 330], offset: [260, -150], from: 6, to: 24 }],
};

/* ── 4 · equations + similar exercises + finished sheet ───────────────────────── */

const NL_INPUT: [number, number, number, number] = [589, 809, 1178, 110];
const nl: ScreenProps = {
  shot: "translateLatex",
  cam: [
    { f: 0, cx: 957, cy: 522, z: 1 },
    { f: 16, cx: 1050, cy: 650, z: 1.3 },
  ],
  spot: { rect: NL_INPUT, r: 22, keys: [6, 16, 34, 38], amount: 0.5 },
  rings: [{ rect: [589, 810, 993, 108], r: 18, from: 8 }, { rect: [1607, 809, 160, 110], r: 22, from: 18 }],
  cursor: {
    pts: [
      { f: 2, x: 980, y: 380 },
      { f: 12, x: 900, y: 866 },
      { f: 26, x: 1690, y: 864 },
    ],
    clicks: [28],
  },
  callouts: [{ text: "Limbaj Natural → Matematic", anchor: [900, 809], offset: [-440, -330], from: 10 }],
};

/** The product's own rendered equation card (landing page "Exemplu live"). */
const EQ_CARD: [number, number, number, number] = [1140, 602, 605, 225];
const eq: ScreenProps = {
  shot: "landingHero",
  cam: [
    { f: 0, cx: 950, cy: 528, z: 1 },
    { f: 14, cx: 1267, cy: 650, z: 1.5 },
  ],
  spot: { rect: EQ_CARD, r: 26, keys: [4, 14, 22, 26], amount: 0.6 },
  rings: [{ rect: EQ_CARD, r: 26, from: 8 }],
  callouts: [{ text: "Formulări exacte", anchor: [1442, 602], offset: [60, -215], from: 10 }],
};

const GENEX_BTN: [number, number, number, number] = [1430, 731, 337, 54];
const genEx: ScreenProps = {
  shot: "translateLatex",
  cam: [
    { f: 0, cx: 1050, cy: 650, z: 1.3 },
    { f: 14, cx: 1150, cy: 690, z: 1.45 },
  ],
  spot: { rect: GENEX_BTN, r: 26, keys: [3, 12, 22, 26], amount: 0.5 },
  rings: [{ rect: GENEX_BTN, r: 26, from: 6 }],
  cursor: {
    pts: [
      { f: 0, x: 1690, y: 864 },
      { f: 14, x: 1600, y: 760 },
    ],
    clicks: [16],
  },
  callouts: [{ text: "Generează 5 exerciții", anchor: [1598, 731], offset: [-760, -400], from: 6 }],
};

/** Finished BAC variant: real rendered maths + the real download buttons. */
const RESULT_CARD: [number, number, number, number] = [548, 360, 749, 618];
const DL_BTN: [number, number, number, number] = [658, 572, 242, 41];
const result: ScreenProps = {
  shot: "bacHero",
  cam: [
    { f: 0, cx: 945, cy: 522, z: 1 },
    { f: 16, cx: 922, cy: 629, z: 1.3 },
  ],
  spot: { rect: RESULT_CARD, r: 40, keys: [3, 13, 20, 28], amount: 0.5 },
  rings: [{ rect: DL_BTN, r: 14, from: 12 }],
  callouts: [{ text: "Descarcă Subiect (PDF)", anchor: [779, 572], offset: [-290, -230], from: 10, to: 21 }],
};

export const SEGMENT_PROPS: Record<SegId, ScreenProps> = {
  dash,
  model,
  gen,
  nl,
  eq,
  genEx,
  result,
};

export const DemoSegment: React.FC<{ id: SegId }> = ({ id }) => <Screen {...SEGMENT_PROPS[id]} />;

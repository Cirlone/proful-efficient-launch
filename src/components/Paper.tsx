import React from "react";
import { random } from "remotion";
import { COLORS, FONT_FAMILY, cyanA } from "../config/theme";
import { HEIGHT, WIDTH } from "../config/timing";
import { EQUATIONS, Tex } from "../lib/Tex";
import { lerp } from "../lib/ease";

export const PAPER_W = 440;
export const PAPER_H = 580;

const TITLES = ["SUBIECTUL I", "SUBIECTUL II", "VARIANTA 17", "BAREM", "TEST NR. 4", "FIȘĂ DE LUCRU", "SUBIECTUL III", "CORECTARE"];
const STAMPS = ["−2p", "CORECTAT?", "(5p)", "7,50", "REFĂ!", "(10p)", "?!"];

export type SheetData = {
  id: number;
  spawn: number;
  life: number;
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  rz0: number;
  rzv: number;
  rx: number;
  ry: number;
  dark: boolean;
  title: string;
  eqs: string[];
  bars: number[];
  scribble: string;
  stamp: string | null;
  stampRot: number;
};

/** Deterministic description of one piece of "paperwork" flying at the camera. */
export const makeSheet = (i: number, count: number): SheetData => {
  const r = (k: string) => random(`sheet-${i}-${k}`);
  const early = i < 9; // already mid-flight at frame 0 so the very first frame is already chaotic
  const spawn = early ? -Math.floor(r("pre") * 34) : Math.floor((i - 9) * (66 / (count - 9)) + r("s") * 3);
  const ang = r("ang") * Math.PI * 2;
  const radius = 1100 + r("rad") * 600;
  const eqStart = Math.floor(r("eq") * EQUATIONS.length);
  return {
    id: i,
    spawn,
    life: 50 + Math.floor(r("life") * 34),
    from: { x: Math.cos(ang) * radius, y: Math.sin(ang) * radius * 0.75, z: -1900 + r("z0") * 700 },
    to: { x: (r("x1") - 0.5) * 1700, y: (r("y1") - 0.5) * 1000, z: 260 + r("z1") * 300 },
    rz0: (r("rz") - 0.5) * 120,
    rzv: (r("rzv") - 0.5) * 5.6,
    rx: (r("rx") - 0.5) * 50,
    ry: (r("ry") - 0.5) * 60,
    dark: r("dark") < 0.38,
    title: TITLES[Math.floor(r("t") * TITLES.length)],
    eqs: [0, 1, 2].map((k) => EQUATIONS[(eqStart + k * 5) % EQUATIONS.length]),
    bars: Array.from({ length: 6 }, (_, k) => 38 + r(`bar${k}`) * 56),
    scribble: `M ${14 + r("a") * 40} ${300 + r("b") * 120} Q ${120 + r("c") * 80} ${210 + r("d") * 160} ${230 + r("e") * 40} ${320 + r("f") * 90} T ${420 - r("g") * 20} ${250 + r("h") * 140}`,
    stamp: r("st") < 0.6 ? STAMPS[Math.floor(r("sti") * STAMPS.length)] : null,
    stampRot: (r("sr") - 0.5) * 36,
  };
};

export const Paper: React.FC<{ sheet: SheetData; frame: number }> = ({ sheet, frame }) => {
  const u = (frame - sheet.spawn) / sheet.life;
  if (u < 0 || u > 1) return null;

  const e = Math.pow(u, 1.55);
  const wob = Math.sin(frame * 0.17 + sheet.id) * 26;
  const x = lerp(sheet.from.x, sheet.to.x, e) + wob;
  const y = lerp(sheet.from.y, sheet.to.y, e) + Math.cos(frame * 0.13 + sheet.id * 2) * 18;
  const z = lerp(sheet.from.z, sheet.to.z, e);
  const rz = sheet.rz0 + sheet.rzv * (frame - sheet.spawn);
  const opacity = Math.min(1, u * 9);

  const ink = sheet.dark ? COLORS.paleBlue : COLORS.ink;
  const faint = sheet.dark ? "rgba(195, 208, 228, 0.22)" : "rgba(11, 27, 58, 0.16)";

  return (
    <div
      style={{
        position: "absolute",
        left: WIDTH / 2 - PAPER_W / 2,
        top: HEIGHT / 2 - PAPER_H / 2,
        width: PAPER_W,
        height: PAPER_H,
        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${sheet.rx + u * 40}deg) rotateY(${sheet.ry - u * 50}deg) rotateZ(${rz}deg)`,
        opacity,
        borderRadius: 12,
        padding: 30,
        boxSizing: "border-box",
        overflow: "hidden",
        background: sheet.dark
          ? `linear-gradient(160deg, ${COLORS.panel}, #07102a)`
          : `linear-gradient(160deg, ${COLORS.paper}, #D6E0F0)`,
        border: sheet.dark ? `2px solid ${cyanA(0.55)}` : "2px solid rgba(255,255,255,0.7)",
        boxShadow: sheet.dark
          ? `0 0 50px ${cyanA(0.25)}, 0 30px 70px rgba(0,0,0,0.55)`
          : "0 30px 70px rgba(0,0,0,0.5)",
        color: ink,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 800, fontSize: 27, letterSpacing: 2, color: sheet.dark ? COLORS.cyan : COLORS.ink }}>
          {sheet.title}
        </div>
        <div style={{ fontWeight: 600, fontSize: 22, opacity: 0.7 }}>(5p)</div>
      </div>

      <div style={{ height: 3, margin: "14px 0 18px", background: faint }} />

      {sheet.eqs.map((tex, k) => (
        <div key={k} style={{ marginBottom: 22, fontSize: 31, color: ink }}>
          <span style={{ fontWeight: 700, fontSize: 24, marginRight: 14, color: sheet.dark ? COLORS.cyan : "#0E8FA3" }}>
            {String.fromCharCode(97 + k)})
          </span>
          <Tex tex={tex} />
        </div>
      ))}

      {sheet.bars.map((w, k) => (
        <div key={k} style={{ height: 9, width: `${w}%`, borderRadius: 5, background: faint, marginBottom: 14 }} />
      ))}

      <svg width={PAPER_W - 60} height={PAPER_H - 60} style={{ position: "absolute", left: 30, top: 30 }}>
        <path d={sheet.scribble} fill="none" stroke={COLORS.cyan} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
      </svg>

      {sheet.stamp && (
        <div
          style={{
            position: "absolute",
            right: 26,
            bottom: 34,
            transform: `rotate(${sheet.stampRot}deg)`,
            border: `4px solid ${COLORS.cyan}`,
            color: COLORS.cyan,
            borderRadius: 10,
            padding: "2px 14px",
            fontWeight: 900,
            fontSize: 38,
            letterSpacing: 2,
            opacity: 0.9,
          }}
        >
          {sheet.stamp}
        </div>
      )}
    </div>
  );
};

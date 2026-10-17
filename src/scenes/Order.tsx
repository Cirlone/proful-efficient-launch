import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { LetterRise, SlamText } from "../components/Kinetic";
import { COLORS, cyanA } from "../config/theme";
import { HEIGHT, SCENES, WIDTH } from "../config/timing";
import { EQUATIONS, Tex } from "../lib/Tex";
import { easeInCubic, easeInOutCubic, easeOutExpo, lerp, prog } from "../lib/ease";

/**
 * SCENE 2 · ORDER (4–8 s)
 * The scattered equations from the chaos scene fly into a rigid grid, connectors
 * draw between them and a scan bar "powers up" the system.
 * "COMPLEXITATEA," builds while it happens; "SIMPLIFICATĂ." slams the instant the grid locks.
 *
 * Cues (scene-relative frames) — mirror in src/config/audio.ts if changed.
 */
const CUE = { line1: 8, gridLock: 46, scanStart: 46, line2: 54 } as const;

const COLS = 6;
const ROWS = 4;
const CHIP_W = 250;
const CHIP_H = 120;
const GAP_X = 44;
const GAP_Y = 40;
const GRID_W = COLS * CHIP_W + (COLS - 1) * GAP_X;
const GRID_H = ROWS * CHIP_H + (ROWS - 1) * GAP_Y;
const ORIGIN_X = (WIDTH - GRID_W) / 2;
const ORIGIN_Y = (HEIGHT - GRID_H) / 2;

const cx = (col: number) => ORIGIN_X + col * (CHIP_W + GAP_X) + CHIP_W / 2;
const cy = (row: number) => ORIGIN_Y + row * (CHIP_H + GAP_Y) + CHIP_H / 2;

type Chip = {
  i: number;
  col: number;
  row: number;
  tex: string;
  sx: number;
  sy: number;
  rot: number;
  scale: number;
  delay: number;
};

const buildChips = (): Chip[] =>
  Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const r = (k: string) => random(`chip-${i}-${k}`);
    return {
      i,
      col,
      row,
      tex: EQUATIONS[(i * 3) % EQUATIONS.length],
      sx: -380 + r("x") * (WIDTH + 760),
      sy: -300 + r("y") * (HEIGHT + 600),
      rot: (r("r") - 0.5) * 120,
      scale: 0.7 + r("s") * 1.5,
      delay: 1 + col * 1.6 + row * 1.2 + r("d") * 3,
    };
  });

export const OrderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const D = SCENES.order.duration;
  const chips = useMemo(buildChips, []);

  const exit = prog(frame, D - 18, 16, easeInCubic);
  const dim = prog(frame, CUE.line2 - 2, 14, easeInOutCubic); // chips recede so the headline reads
  const scrim = prog(frame, 4, 24) * 0.6 + dim * 0.25;

  const scanX = interpolate(frame, [CUE.scanStart, CUE.scanStart + 28], [-220, WIDTH + 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // push-in on the whole grid
  const push = 1 + prog(frame, 0, D, (t) => t) * 0.12 + exit * 0.35;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, opacity: 1 - exit }}>
        {/* connectors */}
        <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
          {chips.map((c) => {
            const t = prog(frame, CUE.gridLock - 4 + c.col * 1.6 + c.row * 1.6, 14);
            if (t <= 0) return null;
            const x1 = cx(c.col);
            const y1 = cy(c.row);
            const segs: React.ReactNode[] = [];
            if (c.col < COLS - 1) {
              segs.push(
                <line
                  key="h"
                  x1={x1 + CHIP_W / 2}
                  y1={y1}
                  x2={lerp(x1 + CHIP_W / 2, cx(c.col + 1) - CHIP_W / 2, t)}
                  y2={y1}
                  stroke={COLORS.cyan}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={0.85}
                />,
              );
            }
            if (c.row < ROWS - 1) {
              segs.push(
                <line
                  key="v"
                  x1={x1}
                  y1={y1 + CHIP_H / 2}
                  x2={x1}
                  y2={lerp(y1 + CHIP_H / 2, cy(c.row + 1) - CHIP_H / 2, t)}
                  stroke={COLORS.cyan}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={0.85}
                />,
              );
            }
            return <g key={c.i}>{segs}</g>;
          })}
        </svg>

        {/* equation chips: scattered → grid */}
        {chips.map((c) => {
          const t = prog(frame, c.delay, 30, easeOutExpo);
          const tx = cx(c.col);
          const ty = cy(c.row);
          const lit = prog(frame, CUE.scanStart + (c.col / COLS) * 26, 6);
          const glow = lit * (1 - dim * 0.65);
          return (
            <div
              key={c.i}
              style={{
                position: "absolute",
                left: tx - CHIP_W / 2,
                top: ty - CHIP_H / 2,
                width: CHIP_W,
                height: CHIP_H,
                transform: `translate(${(1 - t) * (c.sx - tx)}px, ${(1 - t) * (c.sy - ty)}px) rotate(${(1 - t) * c.rot}deg) scale(${lerp(c.scale, 1, t)})`,
                opacity: lerp(1, 0.34, dim) * Math.min(1, 0.25 + t * 1.2),
                borderRadius: 22,
                background: `linear-gradient(160deg, rgba(14, 30, 64, 0.96), rgba(7, 16, 38, 0.96))`,
                border: `2.5px solid ${cyanA(0.22 + 0.7 * glow)}`,
                boxShadow: `0 0 ${10 + 60 * glow}px ${cyanA(0.12 + 0.55 * glow)}, 0 24px 50px rgba(0,0,0,0.45)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: lit > 0.5 ? COLORS.white : COLORS.paleBlue,
                fontSize: 36,
              }}
            >
              <Tex tex={c.tex} />
            </div>
          );
        })}

        {/* scan bar */}
        {frame >= CUE.scanStart && frame <= CUE.scanStart + 32 && (
          <div
            style={{
              position: "absolute",
              top: ORIGIN_Y - 90,
              height: GRID_H + 180,
              width: 170,
              left: scanX - 85,
              background: `linear-gradient(90deg, transparent, ${cyanA(0.55)}, ${COLORS.white}, ${cyanA(0.55)}, transparent)`,
              opacity: 0.9,
              mixBlendMode: "screen",
            }}
          />
        )}
      </AbsoluteFill>

      {/* scrim for legibility */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 58% 42% at 50% 50%, rgba(3, 8, 23, ${scrim}) 0%, rgba(3, 8, 23, ${scrim * 0.55}) 60%, transparent 100%)`,
        }}
      />

      {/* kinetic headline */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: 1 - prog(frame, D - 14, 12, easeInCubic),
          transform: `scale(${1 + exit * 0.5})`,
          textShadow: "0 10px 60px rgba(3, 8, 23, 0.95), 0 0 30px rgba(3, 8, 23, 0.85)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <LetterRise
            segments={[{ text: "COMPLEXITATEA," }]}
            start={CUE.line1}
            frame={frame}
            size={150}
            stagger={1.1}
            riseFrames={16}
          />
          <div style={{ position: "relative" }}>
            <SlamText
              text="SIMPLIFICATĂ."
              start={CUE.line2}
              frame={frame}
              size={196}
              color={COLORS.cyan}
              slamScale={1.9}
            />
            <div
              style={{
                position: "absolute",
                left: 6,
                right: 6,
                bottom: -6,
                height: 10,
                borderRadius: 6,
                background: COLORS.cyan,
                boxShadow: `0 0 36px ${cyanA(0.8)}`,
                transformOrigin: "0% 50%",
                transform: `scaleX(${prog(frame, CUE.line2 + 8, 16, easeOutExpo)})`,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

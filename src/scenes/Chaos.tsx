import { noise2D } from "@remotion/noise";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Paper, makeSheet } from "../components/Paper";
import { SlamText } from "../components/Kinetic";
import { COLORS, FONT_FAMILY, cyanA } from "../config/theme";
import { HEIGHT, SCENES, WIDTH } from "../config/timing";
import { EQUATIONS, Tex } from "../lib/Tex";
import { bump, easeInCubic, easeOutExpo, lerp, prog } from "../lib/ease";

/**
 * SCENE 1 · CHAOS (0–4 s)
 * Math paperwork flies at the camera from every direction while the headline slams in,
 * word by word. The last word echoes like a copy machine — the pain of repetition.
 *
 * Word cues (scene-relative frames). If you change these, mirror them in src/config/audio.ts.
 */
const CUE = { prea: 6, multa: 22, munca: 38, repetitiva: 54 } as const;
const HEADLINE_SIZE = 196;

const SHEET_COUNT = 32;
const STICKERS = Array.from({ length: 26 }, (_, i) => {
  const r = (k: string) => random(`stk-${i}-${k}`);
  return {
    spawn: Math.floor(r("s") * 84) - 10,
    life: 26 + Math.floor(r("l") * 30),
    x: 120 + r("x") * (WIDTH - 240),
    y: 90 + r("y") * (HEIGHT - 180),
    size: 70 + r("z") * 110,
    rot: (r("r") - 0.5) * 70,
    rotV: (r("rv") - 0.5) * 3,
    tex: r("t") < 0.5 ? EQUATIONS[Math.floor(r("ti") * EQUATIONS.length)] : ["\\int", "\\sum", "\\sqrt{x}", "\\pi", "x^2", "\\infty", "\\frac{?}{?}", "(5p)", "-2p", "7{,}50"][Math.floor(r("tj") * 10)],
    cyan: r("c") < 0.45,
  };
});

export const ChaosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const D = SCENES.chaos.duration;
  const sheets = useMemo(() => Array.from({ length: SHEET_COUNT }, (_, i) => makeSheet(i, SHEET_COUNT)), []);

  // camera shake builds through the scene and spikes on each word slam
  const slamKick = [CUE.prea, CUE.multa, CUE.munca, CUE.repetitiva].reduce(
    (m, c) => Math.max(m, bump(frame, c + 1, 0.5, 10)),
    0,
  );
  const amp = lerp(6, 22, prog(frame, 0, 70, (t) => t)) + slamKick * 30;
  const shakeX = noise2D("chaos-x", frame * 0.5, 0) * amp;
  const shakeY = noise2D("chaos-y", 0, frame * 0.5) * amp;
  const shakeR = noise2D("chaos-r", frame * 0.4, 9) * (0.5 + slamKick * 1.6);

  // exit: everything blasts toward the camera
  const exit = prog(frame, D - 20, 18, easeInCubic);
  const worldScale = 1 + exit * 0.9;

  const textExitScale = 1 + exit * 1.7;
  const textExitOpacity = 1 - prog(frame, D - 16, 14, easeInCubic);

  // "copy machine" echoes of the last word
  const echoes = [1, 2, 3, 4, 5];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* the flying paperwork */}
      <AbsoluteFill
        style={{
          perspective: 1100,
          perspectiveOrigin: "50% 50%",
          transform: `translate(${shakeX}px, ${shakeY}px) rotate(${shakeR}deg) scale(${worldScale})`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          {sheets.map((s) => (
            <Paper key={s.id} sheet={s} frame={frame} />
          ))}
        </div>
      </AbsoluteFill>

      {/* floating symbols and grading marks */}
      <AbsoluteFill style={{ transform: `translate(${shakeX * 1.4}px, ${shakeY * 1.4}px)`, opacity: 1 - exit }}>
        {STICKERS.map((s, i) => {
          const u = (frame - s.spawn) / s.life;
          if (u < 0 || u > 1) return null;
          const pop = prog(frame, s.spawn, 6);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.x,
                top: s.y - u * 90,
                transform: `translate(-50%, -50%) rotate(${s.rot + s.rotV * (frame - s.spawn)}deg) scale(${0.6 + pop * 0.4})`,
                opacity: Math.sin(u * Math.PI) * 0.8,
                fontSize: s.size,
                fontFamily: FONT_FAMILY,
                color: s.cyan ? COLORS.cyan : COLORS.paleBlue,
                textShadow: s.cyan ? `0 0 40px ${cyanA(0.5)}` : "none",
              }}
            >
              <Tex tex={s.tex} />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* readability scrim behind the headline */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 62% 50% at 50% 50%, rgba(3, 8, 23, 0.86) 0%, rgba(3, 8, 23, 0.55) 55%, transparent 100%)",
          opacity: prog(frame, 0, 8),
        }}
      />

      {/* kinetic headline */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            transform: `scale(${textExitScale}) rotate(${noise2D("hl", frame * 0.3, 2) * (0.6 + slamKick * 2)}deg)`,
            opacity: textExitOpacity,
            textShadow: "0 10px 60px rgba(3, 8, 23, 0.95), 0 0 30px rgba(3, 8, 23, 0.8)",
          }}
        >
          <div style={{ display: "flex", gap: HEADLINE_SIZE * 0.26 }}>
            <SlamText text="PREA" start={CUE.prea} frame={frame} size={HEADLINE_SIZE} />
            <SlamText text="MULTĂ" start={CUE.multa} frame={frame} size={HEADLINE_SIZE} color={COLORS.cyan} />
          </div>
          <SlamText text="MUNCĂ" start={CUE.munca} frame={frame} size={HEADLINE_SIZE} />
          <div style={{ position: "relative" }}>
            <SlamText text="REPETITIVĂ." start={CUE.repetitiva} frame={frame} size={HEADLINE_SIZE} color={COLORS.cyan} />
            {echoes.map((k) => {
              const at = CUE.repetitiva + 8 + k * 4;
              const t = prog(frame, at, 8, easeOutExpo);
              if (frame < at) return null;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    transform: `translateY(${t * k * 74}px)`,
                    opacity: (1 - k / (echoes.length + 1)) * 0.55 * t,
                    fontFamily: FONT_FAMILY,
                    fontWeight: 900,
                    fontSize: HEADLINE_SIZE,
                    lineHeight: 0.98,
                    letterSpacing: -2,
                    whiteSpace: "nowrap",
                    color: "transparent",
                    WebkitTextStroke: `3px ${COLORS.cyan}`,
                    textTransform: "uppercase",
                    zIndex: -k,
                  }}
                >
                  REPETITIVĂ.
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      {/* hard flicker at frame 0 so the opening beat hits */}
      <AbsoluteFill
        style={{
          background: COLORS.white,
          opacity: interpolate(frame, [0, 3], [0.7, 0], { extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  );
};

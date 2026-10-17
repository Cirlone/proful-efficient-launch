import React from "react";
import { AbsoluteFill, Img, interpolate, random, useCurrentFrame } from "remotion";
import { BRAND } from "../config/assets";
import { COLORS, cyanA } from "../config/theme";
import { HEIGHT, WIDTH } from "../config/timing";

const PARTICLES = Array.from({ length: 46 }, (_, i) => ({
  x: random(`px-${i}`) * WIDTH,
  y: random(`py-${i}`) * HEIGHT,
  size: 2 + random(`ps-${i}`) * 5,
  speed: 0.15 + random(`pv-${i}`) * 0.7,
  phase: random(`pp-${i}`) * 1000,
  depth: 0.3 + random(`pd-${i}`) * 0.7,
}));

/**
 * Persistent navy backdrop: brand math-glyph texture, drifting cyan light,
 * a perspective floor grid and floating particles. Driven by the *global*
 * frame so it flows continuously across scene cuts.
 *
 * `energy` (0–1) lifts glow and particle speed; scenes can pass it for emphasis.
 */
export const Background: React.FC<{ frameOffset?: number; energy?: number }> = ({
  frameOffset = 0,
  energy = 0.5,
}) => {
  const localFrame = useCurrentFrame();
  const frame = localFrame + frameOffset;

  const glowX = 28 + Math.sin(frame / 90) * 14;
  const glowY = 30 + Math.cos(frame / 70) * 12;
  const glow2X = 78 + Math.cos(frame / 110) * 10;
  const glow2Y = 74 + Math.sin(frame / 95) * 10;
  const gridScroll = (frame * (1.2 + energy * 2.4)) % 120;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      {/* real brand texture (faint Σ ∫ glyphs + teal wash) */}
      <Img
        src={BRAND.background}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.42,
          transform: `scale(${1.04 + Math.sin(frame / 140) * 0.02})`,
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${cyanA(0.2 + energy * 0.12)} 0%, transparent 46%),
                       radial-gradient(circle at ${glow2X}% ${glow2Y}%, rgba(40, 92, 190, ${0.22 + energy * 0.08}) 0%, transparent 52%)`,
        }}
      />

      {/* perspective floor grid */}
      <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: "50% 38%" }}>
        <div
          style={{
            position: "absolute",
            left: "-40%",
            width: "180%",
            top: "52%",
            height: "120%",
            transformOrigin: "50% 0%",
            transform: "rotateX(72deg)",
            backgroundImage: `linear-gradient(${cyanA(0.5)} 2px, transparent 2px), linear-gradient(90deg, ${cyanA(0.5)} 2px, transparent 2px)`,
            backgroundSize: "120px 120px",
            backgroundPosition: `0px ${gridScroll}px`,
            opacity: 0.16 + energy * 0.12,
            maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
          }}
        />
      </AbsoluteFill>

      {/* particles */}
      {PARTICLES.map((p, i) => {
        const drift = frame * p.speed * (0.6 + energy);
        const x = (p.x + Math.sin((frame + p.phase) / 60) * 24 * p.depth) % WIDTH;
        const y = (((p.y - drift * 1.4) % HEIGHT) + HEIGHT) % HEIGHT;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin((frame + p.phase) / 24));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: i % 5 === 0 ? COLORS.white : COLORS.cyan,
              opacity: tw * 0.55 * p.depth,
            }}
          />
        );
      })}

      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(2, 5, 18, 0.78) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Slow-moving light shaft used to add depth behind hero moments. */
export const LightShaft: React.FC<{ progress: number; opacity?: number }> = ({
  progress,
  opacity = 1,
}) => (
  <AbsoluteFill
    style={{
      opacity: opacity * interpolate(progress, [0, 0.2, 1], [0, 1, 0.6]),
      background: `conic-gradient(from 200deg at 50% 120%, transparent 0deg, ${cyanA(0.22)} 14deg, transparent 30deg, ${cyanA(0.12)} 46deg, transparent 62deg)`,
      transform: `rotate(${interpolate(progress, [0, 1], [-6, 6])}deg) scale(1.3)`,
    }}
  />
);

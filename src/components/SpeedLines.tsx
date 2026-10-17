import React from "react";
import { AbsoluteFill, random } from "remotion";
import { COLORS } from "../config/theme";

/**
 * Radial streaks that shoot outward from the centre — sells "flying toward the camera".
 * `intensity` 0–1 controls length and opacity; `phase` moves them outward (pass frame).
 */
export const SpeedLines: React.FC<{
  intensity: number;
  phase: number;
  count?: number;
  seed?: string;
  color?: string;
}> = ({ intensity, phase, count = 30, seed = "sl", color = COLORS.cyan }) => {
  if (intensity <= 0.01) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360 + random(`${seed}-a-${i}`) * 9;
        const r0 = 260 + random(`${seed}-r-${i}`) * 260 + ((phase * (22 + (i % 5) * 7)) % 700);
        const len = (120 + random(`${seed}-l-${i}`) * 520) * intensity;
        const thick = 2 + random(`${seed}-t-${i}`) * 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: len,
              height: thick,
              transformOrigin: "0% 50%",
              transform: `rotate(${angle}deg) translateX(${r0}px)`,
              opacity: intensity * (0.25 + random(`${seed}-o-${i}`) * 0.55),
              background: `linear-gradient(90deg, transparent, ${i % 4 === 0 ? COLORS.white : color})`,
              borderRadius: thick,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

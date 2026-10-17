import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, cyanA } from "../config/theme";
import { CUT_FRAMES } from "../config/timing";
import { bump, prog, easeInOutCubic } from "../lib/ease";

/**
 * Energy layer that sits on top of every scene cut: a fast cyan/white light bar
 * sweeps across the frame and a short flash hides the hard edit.
 * Cut frames come from src/config/timing.ts, so re-timing a scene moves its cut FX too.
 */
export const CutFX: React.FC<{ cuts?: number[]; frameOffset?: number }> = ({
  cuts = CUT_FRAMES,
  frameOffset = 0,
}) => {
  const frame = useCurrentFrame() + frameOffset;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {cuts.map((cut) => {
        const barStart = cut - 5;
        const t = prog(frame, barStart, 14, easeInOutCubic);
        const flash = bump(frame, cut, 3, 9);
        if (frame < cut - 6 || frame > cut + 12) return null;
        return (
          <React.Fragment key={cut}>
            <AbsoluteFill
              style={{
                opacity: flash * 0.5,
                background: `radial-gradient(circle at 50% 50%, ${COLORS.white} 0%, ${cyanA(0.55)} 38%, transparent 72%)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -200,
                bottom: -200,
                width: 520,
                left: -700 + t * 3300,
                transform: "skewX(-18deg)",
                opacity: 0.95 * (1 - Math.abs(t - 0.5) * 0.9),
                background: `linear-gradient(90deg, transparent 0%, ${cyanA(0.0)} 8%, ${cyanA(0.85)} 38%, ${COLORS.white} 50%, ${cyanA(0.85)} 62%, ${cyanA(0)} 92%, transparent 100%)`,
              }}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

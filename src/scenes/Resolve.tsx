import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LetterRise, WipeLine } from "../components/Kinetic";
import { SpeedLines } from "../components/SpeedLines";
import { Stage3D, UiPanel } from "../components/UiPanel";
import { COLORS } from "../config/theme";
import { HEIGHT, SCENES } from "../config/timing";
import { beatPulse } from "../lib/beat";
import { bump, easeInCubic, easeInOutCubic, easeOutExpo, lerp, linear, prog } from "../lib/ease";
import { lerpPose, pose, type Pose } from "../lib/pose";
import { showcasePoseAt } from "./Beats";
import { ANCHOR, PANELS, SHOWCASE_PANEL_W } from "./showcase";

/** How much the docked panels were dimmed at the end of scene 4 (matches Beats.tsx). */
const DOCK_DIM = 0.42;

/**
 * SCENE 5 · RESOLVE (18–22 s)
 * Starts exactly where scene 4 ends (same panels, same poses), then the cluster
 * resolves into a clean, symmetrical composition. Two lines of copy land underneath.
 *
 * Cues (scene-relative frames) — mirror in src/config/audio.ts if changed.
 */
const CUE = { line1: 34, line2: 66, exit: 100 } as const;

export const ResolveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const D = SCENES.resolve.duration;
  const S4_END = SCENES.beats.duration;

  // beat pulses carry over from scene 4 and die away
  const carry = beatPulse(frame, 0, 4) * (1 - prog(frame, 0, 36, linear));

  const exit = prog(frame, CUE.exit, D - CUE.exit, easeInCubic);

  const camera = [
    // starts where scene 4's dolly ended (220px), then settles back so the trio sits fully in frame
    `translateZ(${lerp(220, -40, prog(frame, 0, 44, easeOutExpo)) + exit * 1500}px)`,
    `rotateY(${Math.sin(frame / 38) * 2.2}deg)`,
    `rotateX(${Math.cos(frame / 47) * 1.2}deg)`,
  ].join(" ");

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <SpeedLines intensity={bump(frame, 4, 2, 16) * 0.6} phase={frame} seed="rs" />

      <AbsoluteFill style={{ opacity: 1 - prog(frame, D - 10, 10, easeInCubic) }}>
        <Stage3D perspective={1600} cameraTransform={camera}>
          {PANELS.map((p, k) => {
            const order = k === ANCHOR ? 0 : [2, 3, 0, 1, 4, 5, 6][k] ?? k;
            const startDim = k === ANCHOR ? 0 : DOCK_DIM;
            const targetDim = k === ANCHOR ? 0 : p.resolve ? 0.16 : DOCK_DIM;
            const t = prog(frame, 2 + order * 2, 26, easeOutExpo);

            // start pose = end of scene 4 (including its closing-beat scale pulse)
            const s4 = showcasePoseAt(k, S4_END);
            const start: Pose = { ...s4, s: s4.s * (1 + 0.025 * carry + (k === ANCHOR ? 0.03 * carry : 0)) };

            const target: Pose = p.resolve ?? pose({ ...s4, z: -2000, s: s4.s * 0.6 });
            const float = Math.sin((frame + k * 13) / 22) * 9;
            const now = lerpPose(start, target, t);
            const posed: Pose = { ...now, y: now.y + float * t };

            const opacity = lerp(1, p.resolveOpacity, t);
            const hero = k === ANCHOR;

            return (
              <UiPanel
                key={k}
                shot={p.shot}
                width={SHOWCASE_PANEL_W}
                pose={posed}
                opacity={opacity}
                edge={hero ? 0.65 + 0.2 * Math.sin(frame / 14) : 0.38}
                edgeAngle={frame * 3 + k * 50}
                dim={lerp(startDim, targetDim, t)}
                radius={26}
              />
            );
          })}
        </Stage3D>
      </AbsoluteFill>

      {/* readability gradient for the copy */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(3, 8, 23, 0.92) 0%, rgba(3, 8, 23, 0.6) 26%, transparent 46%)",
          opacity: prog(frame, CUE.line1 - 8, 12),
        }}
      />

      {/* the copy */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: HEIGHT * 0.1,
          opacity: 1 - prog(frame, D - 12, 10, easeInCubic),
          transform: `scale(${1 + exit * 0.18})`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <LetterRise
            segments={[
              { text: "MAI" },
              { text: "PUȚIN", color: COLORS.cyan },
              { text: "TIMP" },
              { text: "PIERDUT." },
            ]}
            start={CUE.line1}
            frame={frame}
            size={122}
            stagger={1.3}
            riseFrames={15}
          />
          <WipeLine
            segments={[{ text: "MAI MULT TIMP PENTRU CE " }, { text: "CONTEAZĂ.", color: COLORS.cyan }]}
            start={CUE.line2}
            frame={frame}
            size={84}
            color={COLORS.paleBlue}
            weight={800}
            wipeFrames={20}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

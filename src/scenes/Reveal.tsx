import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LightShaft } from "../components/Background";
import { PopLabel } from "../components/Kinetic";
import { SpeedLines } from "../components/SpeedLines";
import { Stage3D, UiPanel } from "../components/UiPanel";
import { COLORS, cyanA } from "../config/theme";
import { HEIGHT, SCENES, WIDTH } from "../config/timing";
import { bump, easeInCubic, easeInOutCubic, easeOutExpo, lerp, linear, prog } from "../lib/ease";
import { lerpPose, pose } from "../lib/pose";
import { noise2D } from "@remotion/noise";

/**
 * SCENE 3 · REVEAL (8–12 s)
 * Black → a slit of light → the real BAC generator flies out of the dark in 3D,
 * lands with an impact, edge-light sweeping round it, then the camera pushes into the
 * actual exam content and whips out.
 *
 * Cues (scene-relative frames) — mirror in src/config/audio.ts if changed.
 */
const CUE = { slit: 0, flyIn: 10, impact: 40, zoomStart: 74, whip: 108 } as const;
const PANEL_W = 1360;

const START = pose({ x: 160, y: 560, z: -2100, rx: 64, ry: -40, rz: 11, s: 0.85 });
const REST = pose({ x: 0, y: -45, z: 0, rx: 3, ry: -6, rz: 0, s: 1 });

export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const D = SCENES.reveal.duration;

  // fly-in
  const fly = prog(frame, CUE.flyIn, 32, easeOutExpo);
  const base = lerpPose(START, REST, fly);

  // slow orbit after landing
  const orbit = prog(frame, CUE.impact, CUE.whip - CUE.impact, easeInOutCubic);
  const current = {
    ...base,
    ry: base.ry + orbit * 12,
    rx: base.rx - orbit * 3,
    rz: base.rz + Math.sin(orbit * Math.PI) * 1.2,
  };

  // impact: shake + edge spike + ring
  const impact = bump(frame, CUE.impact, 0.5, 16);
  const shake = impact * 16;
  const shakeX = noise2D("rv-x", frame * 0.9, 0) * shake;
  const shakeY = noise2D("rv-y", 0, frame * 0.9) * shake;
  const edge = 0.32 + 0.68 * impact + 0.25 * prog(frame, CUE.impact, 60, linear);
  const sheen = frame >= CUE.impact + 2 ? prog(frame, CUE.impact + 2, 28, linear) : null;
  const edgeAngle = frame * 4.5;

  // camera push into the real content
  const zoom = lerp(1, 1.62, prog(frame, CUE.zoomStart, 32, easeInOutCubic));
  const whip = prog(frame, CUE.whip, D - CUE.whip, easeInCubic);
  const camScale = zoom + whip * 1.1;
  const focusY = 52; // exam content sits slightly below the panel centre
  const camY = -focusY * zoom;

  // light slit
  const slitT = prog(frame, CUE.slit, 12, easeOutExpo);
  const slitFade = 1 - prog(frame, 14, 16);
  const slitPulse = bump(frame, CUE.flyIn + 4, 4, 14);

  const ringT = prog(frame, CUE.impact, 22, easeOutExpo);

  const captionOut = 1 - prog(frame, CUE.zoomStart - 4, 8);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <LightShaft progress={frame / D} opacity={0.5 + impact * 0.5} />

      {/* the slit of light that "opens" the reveal */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: WIDTH * 1.1,
            height: 5 + slitPulse * 180,
            transform: `scaleX(${slitT})`,
            opacity: slitFade * (0.9 + slitPulse),
            background: `radial-gradient(ellipse at center, ${COLORS.white} 0%, ${cyanA(0.85)} 35%, transparent 75%)`,
            borderRadius: 100,
            boxShadow: `0 0 120px ${cyanA(0.9)}`,
          }}
        />
      </AbsoluteFill>

      <SpeedLines intensity={bump(frame, CUE.flyIn + 14, 12, 14) * 0.9} phase={frame} seed="rv" />

      {/* camera */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY + camY}px) scale(${camScale}) rotate(${whip * 5}deg)`,
          opacity: 1 - prog(frame, D - 8, 8, easeInCubic),
        }}
      >
        <Stage3D perspective={1500}>
          <UiPanel
            shot="bacHero"
            width={PANEL_W}
            pose={current}
            opacity={prog(frame, CUE.flyIn, 6)}
            edge={Math.min(1, edge)}
            edgeAngle={edgeAngle}
            sheen={sheen}
            radius={30}
          />
        </Stage3D>

        {/* impact ring */}
        {frame >= CUE.impact && (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                width: 900,
                height: 900,
                borderRadius: "50%",
                border: `6px solid ${COLORS.cyan}`,
                boxShadow: `0 0 60px ${cyanA(0.8)}, inset 0 0 60px ${cyanA(0.5)}`,
                transform: `translateY(${REST.y}px) scale(${0.4 + ringT * 2.6})`,
                opacity: (1 - ringT) * 0.9,
              }}
            />
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* caption — real product copy */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: HEIGHT * 0.07 }}>
        <div style={{ opacity: captionOut }}>
          <PopLabel
            text="Variante BAC personalizate, instant"
            start={CUE.impact + 8}
            frame={frame}
            size={76}
            color={COLORS.paleBlue}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

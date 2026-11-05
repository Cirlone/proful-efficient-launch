import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { COLORS, cyanA } from "../config/theme";
import { easeInCubic, easeInOutCubic, easeOutExpo, prog } from "../lib/ease";
import { camAt, makeMap, Screen, type CamKey } from "../sequence2/camera";
import { TEACHER } from "../sequence2/TeacherScenes";

/** 9:16 canvas */
export const VW = 1080;
export const VH = 1920;

/** The teacher stills are 941×1672 (≈ 9:16): in the vertical cut they fill the whole frame. */
const PHOTO_W = 941;
const PHOTO_H = 1672;
const K = VW / PHOTO_W;

/** Source-pixel centre of the laptop lid. */
const LAPTOP = { x: 235, y: 935 };

const PHOTO_CAM: CamKey[] = [
  { f: 0, cx: PHOTO_W / 2, cy: 836, z: 1.0 },
  { f: 56, cx: 462, cy: 870, z: 1.07 },
  // push toward the laptop
  { f: 100, cx: LAPTOP.x + 30, cy: LAPTOP.y - 15, z: 2.25 },
];

/** App cam at the end of the push — equals the first key of the vertical "dash" segment. */
export const DASH_REST_V = { cx: 954.5, cy: 504.5, z: 1 };
const DASH_PUSH: CamKey[] = [
  { f: 86, ...DASH_REST_V, z: 0.82 },
  { f: 119, ...DASH_REST_V },
];

const Photo: React.FC<{ src: string; opacity: number; frame: number }> = ({ src, opacity, frame }) => {
  const cam = camAt(frame, PHOTO_CAM);
  const scale = K * cam.z;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: PHOTO_W,
        height: PHOTO_H,
        opacity,
        transformOrigin: "0 0",
        transform: `translate(${VW / 2}px, ${VH / 2}px) scale(${scale}) translate(${-cam.cx}px, ${-cam.cy}px)`,
      }}
    >
      <Img src={src} style={{ width: PHOTO_W, height: PHOTO_H, display: "block" }} />
    </div>
  );
};

/**
 * Storyboard 1 + 2, vertical (0–4 s): phone down → teacher back at the laptop → push into the
 * laptop → cyan light-bloom circle opens onto the real dashboard.
 */
export const TeacherScenesV: React.FC = () => {
  const frame = useCurrentFrame();

  const toWork = prog(frame, 12, 18, easeInOutCubic);
  const blur = prog(frame, 76, 24, easeInCubic) * 7;
  const dim = prog(frame, 70, 30, easeInCubic) * 0.35;

  const cam = camAt(frame, PHOTO_CAM);
  const lap = makeMap(cam, K, VW, VH)(LAPTOP.x, LAPTOP.y);

  const glow = prog(frame, 70, 30, easeInOutCubic);
  const reveal = prog(frame, 88, 26, easeInOutCubic);
  const radius = reveal * 1400;
  const cx = VW / 2;
  const cy = VH * 0.52;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: `blur(${blur}px)` }}>
        <Photo src={TEACHER.phone} opacity={1 - toWork} frame={frame} />
        <Photo src={TEACHER.working} opacity={toWork} frame={frame} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(2,5,18,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, opacity: dim, pointerEvents: "none" }} />

      {glow > 0.001 && (
        <AbsoluteFill
          style={{
            opacity: glow,
            mixBlendMode: "screen",
            background: `radial-gradient(circle at ${lap[0]}px ${lap[1]}px, ${cyanA(0.85)} 0%, ${cyanA(0.35)} 14%, transparent 42%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {reveal > 0.001 && (
        <>
          <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${cx}px ${cy}px)` }}>
            <Background energy={0.6} />
            <Screen shot="dashboard" cam={DASH_PUSH} enter={false} />
          </AbsoluteFill>
          {reveal < 0.995 && (
            <div
              style={{
                position: "absolute",
                left: cx - radius,
                top: cy - radius,
                width: radius * 2,
                height: radius * 2,
                borderRadius: "50%",
                border: `${6 - 4 * reveal}px solid ${COLORS.cyanSoft}`,
                boxShadow: `0 0 90px ${cyanA(0.9)}, inset 0 0 90px ${cyanA(0.5)}`,
                opacity: 1 - prog(frame, 104, 14, easeOutExpo) * 0.9,
                pointerEvents: "none",
              }}
            />
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

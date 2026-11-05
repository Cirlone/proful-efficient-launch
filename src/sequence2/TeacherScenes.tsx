import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COLORS, cyanA } from "../config/theme";
import { easeInOutCubic, easeInCubic, easeOutExpo, prog } from "../lib/ease";
import { camAt, makeMap, Screen, type CamKey } from "./camera";

/**
 * TEACHER STILLS — Sequence 1 references (same teacher, outfit, room, desk, laptop, warm light).
 * To use the new reference images from public/teacher/, change ONLY the two paths below
 * (and PHOTO_W/H if they are not 941×1672).
 */
export const TEACHER = {
  /** phone in hand, WhatsApp notification on screen (end of Sequence 1) */
  phone: staticFile("screenshots/Work or Beer_ A Professor’s Dilemma.png"),
  /** phone gone, back at the laptop, thinking — the "starts working" frame */
  working: staticFile("screenshots/Pensive Scholar Amidst Papers.png"),
};
const PHOTO_W = 941;
const PHOTO_H = 1672;

/** The portrait frames are shown 1280 px wide on the 1920 canvas; the sides melt into a blurred copy. */
const FG_W = 1280;
const K = FG_W / PHOTO_W;

/** Source-pixel centre of the laptop lid (bottom-left of the reference frames). */
const LAPTOP = { x: 235, y: 935 };

const PHOTO_CAM: CamKey[] = [
  { f: 0, cx: 520, cy: 610, z: 0.92 },
  { f: 56, cx: 485, cy: 660, z: 1.02 },
  // push toward the laptop
  { f: 100, cx: LAPTOP.x + 20, cy: LAPTOP.y - 10, z: 2.25 },
];

/** App cam at the end of the push — MUST equal the first key of the "dash" segment. */
export const DASH_REST = { cx: 954.5, cy: 504.5, z: 1 };
const DASH_PUSH: CamKey[] = [
  { f: 86, cx: DASH_REST.cx, cy: DASH_REST.cy, z: 0.86 },
  { f: 119, cx: DASH_REST.cx, cy: DASH_REST.cy, z: DASH_REST.z },
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
        transform: `translate(960px, 540px) scale(${scale}) translate(${-cam.cx}px, ${-cam.cy}px)`,
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, #000 17%, #000 83%, transparent 100%)",
        maskImage: "linear-gradient(90deg, transparent 0%, #000 17%, #000 83%, transparent 100%)",
      }}
    >
      <Img src={src} style={{ width: PHOTO_W, height: PHOTO_H, display: "block" }} />
    </div>
  );
};

/**
 * Storyboard 1 + 2 (0–4 s of Sequence 2):
 *  0–2 s   phone down → teacher back at the laptop, slow cinematic drift
 *  2–4 s   camera pushes into the laptop; a cyan light-bloom opens a circle onto the real app
 */
export const TeacherScenes: React.FC = () => {
  const frame = useCurrentFrame();

  // phone → working: soft dissolve with a tiny push so the change reads as motion
  const toWork = prog(frame, 12, 18, easeInOutCubic);

  // blur / darken as we get very close to the lid (hides raster softness at 2.2× zoom)
  const blur = prog(frame, 76, 24, easeInCubic) * 7;
  const dim = prog(frame, 70, 30, easeInCubic) * 0.35;

  const cam = camAt(frame, PHOTO_CAM);
  const lap = makeMap(cam, K)(LAPTOP.x, LAPTOP.y);
  const lapScreen: [number, number] = [lap[0], lap[1]];

  // cyan screen-light leaking round the lid
  const glow = prog(frame, 70, 30, easeInOutCubic);
  // circular reveal onto the real app
  const reveal = prog(frame, 88, 26, easeInOutCubic);
  const radius = reveal * 1300;
  const cx = 960;
  const cy = 560;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      {/* blurred extension of the frame so the 16:9 canvas is filled with the same room */}
      <AbsoluteFill style={{ opacity: 0.9 }}>
        <Img
          src={TEACHER.working}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 1920,
            height: (1920 * PHOTO_H) / PHOTO_W,
            marginLeft: -960,
            marginTop: -((1920 * PHOTO_H) / PHOTO_W) * 0.17,
            filter: "blur(34px) brightness(0.78) saturate(1.15)",
            transform: `scale(${1.04 + 0.02 * (frame / 120)})`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ filter: `blur(${blur}px)` }}>
        <Photo src={TEACHER.phone} opacity={1 - toWork} frame={frame} />
        <Photo src={TEACHER.working} opacity={toWork} frame={frame} />
      </AbsoluteFill>

      {/* warm cinematic grade + vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(2,5,18,0.62) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, opacity: dim, pointerEvents: "none" }} />

      {/* cyan light leaking from the laptop */}
      {glow > 0.001 && (
        <AbsoluteFill
          style={{
            opacity: glow,
            mixBlendMode: "screen",
            background: `radial-gradient(circle at ${lapScreen[0]}px ${lapScreen[1]}px, ${cyanA(0.85)} 0%, ${cyanA(0.35)} 14%, transparent 42%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* the real dashboard, revealed through an expanding circle */}
      {reveal > 0.001 && (
        <>
          <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${cx}px ${cy}px)` }}>
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

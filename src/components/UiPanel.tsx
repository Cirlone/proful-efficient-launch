import React from "react";
import { Img } from "remotion";
import { shotMeta, shotSrc, type ShotId } from "../config/assets";
import { COLORS, cyanA } from "../config/theme";
import { poseTransform, type Pose } from "../lib/pose";

/** Height of a panel for a given width — always the screenshot's native aspect (minus any crop). */
export const panelHeight = (shot: ShotId, width: number) => {
  const m = shotMeta(shot);
  const crop = m.cropBottom ?? 0;
  return (width * m.h * (1 - crop)) / m.w;
};

/**
 * A real website screenshot as a floating 3D panel with cyan edge-lighting.
 *
 * The image is NEVER stretched: width is set, height follows the native aspect
 * ratio, and `cropBottom` only clips (to hide a browser tooltip), it does not rescale.
 *
 * Place inside a parent with `perspective` + `transform-style: preserve-3d`
 * (see <Stage3D>). Position is the frame centre; `pose` offsets from there.
 */
export const UiPanel: React.FC<{
  shot: ShotId;
  width: number;
  pose: Pose;
  opacity?: number;
  /** 0–1 intensity of the cyan edge light and glow (spike it on impact) */
  edge?: number;
  /** angle of the travelling highlight around the border, degrees */
  edgeAngle?: number;
  /** 0–1 progress of a diagonal sheen sweeping across the screenshot; null = off */
  sheen?: number | null;
  radius?: number;
  zIndex?: number;
  /** 0–1: darkens the screenshot so a hero panel can pop against the others */
  dim?: number;
}> = ({
  shot,
  width,
  pose,
  opacity = 1,
  edge = 0.3,
  edgeAngle = 0,
  sheen = null,
  radius = 28,
  zIndex,
  dim = 0,
}) => {
  const meta = shotMeta(shot);
  const height = panelHeight(shot, width);
  const imgHeight = (width * meta.h) / meta.w;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        transform: poseTransform(pose),
        transformStyle: "preserve-3d",
        opacity,
        zIndex,
        willChange: "transform",
      }}
    >
      {/* edge light + glow + ground shadow */}
      <div
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: radius + 4,
          background: `conic-gradient(from ${edgeAngle}deg, ${cyanA(0)} 0deg, ${COLORS.cyan} 55deg, ${COLORS.white} 85deg, ${cyanA(0)} 150deg, ${cyanA(0.35)} 230deg, ${cyanA(0)} 300deg, ${COLORS.cyan} 345deg, ${cyanA(0)} 360deg)`,
          opacity: 0.4 + 0.6 * edge,
          boxShadow: `0 0 ${50 + 90 * edge}px ${cyanA(0.16 + 0.5 * edge)}, 0 60px 120px rgba(0, 0, 0, 0.6)`,
        }}
      />
      {/* screenshot */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: COLORS.bg,
        }}
      >
        <Img
          src={shotSrc(shot)}
          style={{ position: "absolute", left: 0, top: 0, width, height: imgHeight, display: "block" }}
        />
        {dim > 0.001 && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: COLORS.bgDeep, opacity: dim }} />
        )}
        {sheen !== null && sheen > 0 && sheen < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.0) 42%, rgba(160, 244, 255, 0.5) 50%, rgba(255,255,255,0.0) 58%, transparent 62%)",
              transform: `translateX(${(sheen - 0.5) * 240}%)`,
              mixBlendMode: "screen",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            boxShadow: `inset 0 0 0 2px ${cyanA(0.28 + 0.4 * edge)}`,
          }}
        />
      </div>
    </div>
  );
};

/** Perspective container: put <UiPanel>s inside; add a camera transform for orbit/dolly. */
export const Stage3D: React.FC<{
  perspective?: number;
  cameraTransform?: string;
  children: React.ReactNode;
}> = ({ perspective = 1600, cameraTransform, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      perspective,
      perspectiveOrigin: "50% 50%",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformStyle: "preserve-3d",
        transform: cameraTransform,
      }}
    >
      {children}
    </div>
  </div>
);

import React from "react";
import { Img, useCurrentFrame } from "remotion";
import { shotMeta, shotSrc, type ShotId } from "../config/assets";
import { COLORS, cyanA, FONT_FAMILY } from "../config/theme";
import { easeInOutCubic, easeOutBack, easeOutExpo, lerp, prog } from "../lib/ease";

const W = 1920;
const H = 1080;

/* ───────────────────────────── camera ───────────────────────────── */

/** Camera over a source image: (cx, cy) = source pixel at frame centre, z = zoom (1 = fit width). */
export type Cam = { cx: number; cy: number; z: number };
export type CamKey = Cam & { f: number };

export const camAt = (frame: number, keys: CamKey[]): Cam => {
  if (frame <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.f) {
      const t = easeInOutCubic((frame - a.f) / Math.max(1, b.f - a.f));
      return { cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), z: lerp(a.z, b.z, t) };
    }
  }
  return keys[keys.length - 1];
};

export type MapFn = (x: number, y: number) => [number, number];

/** source px → screen px for a given camera and base fit scale `k`. */
export const makeMap =
  (cam: Cam, k: number): MapFn =>
  (x, y) => [W / 2 + (x - cam.cx) * k * cam.z, H / 2 + (y - cam.cy) * k * cam.z];

/* ───────────────────────────── helpers ───────────────────────────── */

export type Rect = [x: number, y: number, w: number, h: number];
export type SpotKeys = { rect: Rect; r?: number; keys: [number, number, number, number]; amount: number };
export type RingDef = { rect: Rect; r?: number; from: number; to?: number };
export type CursorPt = { f: number; x: number; y: number };
export type CalloutDef = {
  text: string;
  /** anchor in SOURCE px; offset in SCREEN px */
  anchor: [number, number];
  offset: [number, number];
  from: number;
  to?: number;
};

const lerpPts = (frame: number, pts: CursorPt[]) => {
  if (frame <= pts[0].f) return pts[0];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (frame <= b.f) {
      const t = easeInOutCubic((frame - a.f) / Math.max(1, b.f - a.f));
      return { f: frame, x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }
  }
  return pts[pts.length - 1];
};

/* ───────────────────────────── overlay pieces ───────────────────────────── */

export const Cursor: React.FC<{ x: number; y: number; opacity: number; clicks: number[] }> = ({
  x,
  y,
  opacity,
  clicks,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {clicks.map((c) => {
        const t = (frame - c) / 16;
        if (t < 0 || t > 1) return null;
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: x - 70,
              top: y - 70,
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: `5px solid ${COLORS.cyan}`,
              boxShadow: `0 0 40px ${cyanA(0.8)}`,
              transform: `scale(${0.25 + t * 0.85})`,
              opacity: 1 - t,
            }}
          />
        );
      })}
      <svg
        width={64}
        height={64}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x - 5,
          top: y - 3,
          opacity,
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))",
        }}
      >
        <path
          d="M3 2 L3 19.5 L7.8 15 L11.2 22.4 L14.3 21 L11 13.7 L17.6 13.4 Z"
          fill="#FFFFFF"
          stroke={COLORS.bg}
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

export const Callout: React.FC<{ def: CalloutDef; map: MapFn }> = ({ def, map }) => {
  const frame = useCurrentFrame();
  const t = prog(frame, def.from, 10, easeOutBack);
  const out = def.to ? 1 - prog(frame, def.to, 6, easeOutExpo) : 1;
  if (t <= 0 || out <= 0) return null;
  const [ax, ay] = map(def.anchor[0], def.anchor[1]);
  const estW = def.text.length * 25 + 96;
  const left = Math.min(W - 48 - estW, Math.max(48, ax + def.offset[0]));
  const top = Math.min(H - 150, Math.max(40, ay + def.offset[1]));
  const pillH = 92;
  const lx1 = left + 70;
  const ly1 = top + pillH;
  return (
    <>
      {/* connector: makes it unmistakable that the pill is an annotation, not part of the app UI */}
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0, opacity: Math.min(1, t) * out, pointerEvents: "none" }}
      >
        <line
          x1={lx1}
          y1={ly1}
          x2={lx1 + (ax - lx1) * t}
          y2={ly1 + (ay - ly1) * t}
          stroke={COLORS.cyan}
          strokeWidth={4}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${cyanA(0.9)})` }}
        />
        <circle cx={ax} cy={ay} r={9 * t} fill={COLORS.cyan} style={{ filter: `drop-shadow(0 0 10px ${cyanA(1)})` }} />
      </svg>
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform: `scale(${0.7 + 0.3 * t})`,
        transformOrigin: "0% 100%",
        opacity: Math.min(1, t) * out,
        padding: "16px 34px 18px",
        borderRadius: 999,
        background: `linear-gradient(135deg, rgba(10,22,48,0.96), rgba(6,18,38,0.96))`,
        border: `3px solid ${COLORS.cyan}`,
        boxShadow: `0 0 46px ${cyanA(0.55)}, 0 18px 50px rgba(0,0,0,0.55)`,
        color: COLORS.white,
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: 46,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: COLORS.cyan, marginRight: 14 }}>●</span>
      {def.text}
    </div>
    </>
  );
};

/* ───────────────────────────── a real screenshot, camera + highlights ───────────────────────────── */

export type ScreenProps = {
  shot: ShotId;
  cam: CamKey[];
  spot?: SpotKeys;
  rings?: RingDef[];
  cursor?: { pts: CursorPt[]; clicks: number[] };
  callouts?: CalloutDef[];
  /** extra overlays drawn in SCREEN space, given the live source→screen map */
  extras?: (map: MapFn, frame: number, scale: number) => React.ReactNode;
  /** entry: scale-in + fade over the first frames */
  enter?: boolean;
};

export const Screen: React.FC<ScreenProps> = ({
  shot,
  cam: camKeys,
  spot,
  rings = [],
  cursor,
  callouts = [],
  extras,
  enter = true,
}) => {
  const frame = useCurrentFrame();
  const meta = shotMeta(shot);
  const k = W / meta.w;
  const cam = camAt(frame, camKeys);
  const scale = k * cam.z;
  const map = makeMap(cam, k);
  const clipH = meta.h * (1 - (("cropBottom" in meta ? meta.cropBottom : 0) ?? 0));

  const enterT = enter ? prog(frame, 0, 8, easeOutExpo) : 1;
  const enterOpacity = enter ? prog(frame, 0, 3, (t) => t) : 1;

  let spotAmount = 0;
  if (spot) {
    const [a, b, c, d] = spot.keys;
    spotAmount =
      Math.min(prog(frame, a, b - a, easeOutExpo), 1) * spot.amount * (1 - prog(frame, c, Math.max(1, d - c), easeInOutCubic));
  }

  const cur = cursor ? lerpPts(frame, cursor.pts) : null;
  const curScreen = cur ? map(cur.x, cur.y) : null;
  const curOpacity = cursor ? prog(frame, cursor.pts[0].f, 5, easeOutExpo) : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLORS.bg,
        overflow: "hidden",
        opacity: enterOpacity,
        transform: `scale(${1 + 0.045 * (1 - enterT)})`,
      }}
    >
      {/* source-space layer: screenshot (crop only — never stretched) + highlights */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: meta.w,
          height: meta.h,
          transformOrigin: "0 0",
          transform: `translate(${W / 2}px, ${H / 2}px) scale(${scale}) translate(${-cam.cx}px, ${-cam.cy}px)`,
          willChange: "transform",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, width: meta.w, height: clipH, overflow: "hidden" }}>
          <Img src={shotSrc(shot)} style={{ width: meta.w, height: meta.h, display: "block" }} />
        </div>

        {spot && spotAmount > 0.001 && (
          <div
            style={{
              position: "absolute",
              left: spot.rect[0],
              top: spot.rect[1],
              width: spot.rect[2],
              height: spot.rect[3],
              borderRadius: spot.r ?? 24,
              boxShadow: `0 0 0 6000px rgba(3, 8, 23, ${spotAmount})`,
            }}
          />
        )}

        {rings.map((r, i) => {
          const t = prog(frame, r.from, 8, easeOutExpo);
          const out = r.to ? 1 - prog(frame, r.to, 6, easeOutExpo) : 1;
          if (t <= 0 || out <= 0) return null;
          const pulse = 0.6 + 0.4 * Math.sin((frame - r.from) / 3.2);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: r.rect[0] - 6,
                top: r.rect[1] - 6,
                width: r.rect[2] + 12,
                height: r.rect[3] + 12,
                borderRadius: (r.r ?? 24) + 6,
                border: `${3.4 / Math.max(0.8, cam.z)}px solid ${COLORS.cyan}`,
                boxShadow: `0 0 ${34 * pulse + 10}px ${cyanA(0.55 + 0.35 * pulse)}, inset 0 0 ${24 * pulse}px ${cyanA(0.22)}`,
                opacity: t * out,
                transform: `scale(${1 + (1 - t) * 0.06})`,
              }}
            />
          );
        })}
      </div>

      {/* screen-space overlays */}
      {extras?.(map, frame, scale)}
      {callouts.map((c, i) => (
        <Callout key={i} def={c} map={map} />
      ))}
      {cursor && curScreen && (
        <Cursor x={curScreen[0]} y={curScreen[1]} opacity={curOpacity} clicks={cursor.clicks} />
      )}
    </div>
  );
};

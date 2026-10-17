import { noise2D } from "@remotion/noise";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PopLabel } from "../components/Kinetic";
import { SpeedLines } from "../components/SpeedLines";
import { Stage3D, UiPanel } from "../components/UiPanel";
import { COLORS, cyanA } from "../config/theme";
import { BEAT, HEIGHT, SCENES } from "../config/timing";
import { beatPulse } from "../lib/beat";
import { bump, easeInOutCubic, easeInCubic, easeOutExpo, linear, prog } from "../lib/ease";
import { lerpPose, type Pose } from "../lib/pose";
import {
  ANCHOR,
  ANCHOR_END_Z,
  CLOSING_WORDS,
  FLY,
  IMPACT,
  PANELS,
  SHOWCASE_PANEL_W,
  arrivalFrame,
  flyStart,
  heroPose,
  impactFrame,
} from "./showcase";

/**
 * SCENE 4 · BEAT SEQUENCE (12–18 s = 12 beats @ 120 BPM)
 * Beats 1–8: a real screenshot flies out of the depth and LANDS exactly on the beat with a
 * punch (its caption slams on the same frame), then slides aside into the cluster as the
 * next one lands.
 * Beats 9–12: the cluster snaps/pulses on the beat while three closing words hit
 * (beats 10–12), and the camera drives in.
 */
const SLIDE_DELAY = 3; // frames centre-stage (after landing) before sliding aside
const SLIDE = 11; // the slide finishes just as the next panel lands
const SNAP_START = 8 * BEAT; // cluster starts snapping on the beat once the anchor has landed
const WORDS_START = 9 * BEAT; // closing words land on beats 10, 11, 12

/** Pose of panel k at scene-frame f (before any beat pulses). */
export const showcasePoseAt = (k: number, f: number): Pose => {
  const a = arrivalFrame(k);
  const fly = prog(f, a, FLY, easeOutExpo);
  const landed = lerpPose(flyStart(k), heroPose(k), fly);
  if (k === ANCHOR) {
    const drive = prog(f, impactFrame(k), 60, easeInOutCubic);
    return { ...landed, z: landed.z + drive * ANCHOR_END_Z };
  }
  const slide = prog(f, a + IMPACT + SLIDE_DELAY, SLIDE, easeInOutCubic);
  return lerpPose(landed, PANELS[k].dock, slide);
};

/** 0 while a panel is centre-stage, 1 once it has slid aside (drives its dimming). */
export const dockedAmount = (k: number, f: number) =>
  k === ANCHOR ? 0 : prog(f, arrivalFrame(k) + IMPACT + SLIDE_DELAY, SLIDE, easeInOutCubic);

export const BeatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const D = SCENES.beats.duration;
  const f = frame;

  const bp = beatPulse(f, 0, 4);
  const beatNo = Math.floor(f / BEAT);
  const dir = beatNo % 2 === 0 ? 1 : -1;
  const closing = f >= SNAP_START;

  // camera: orbit + dolly + beat-kick, whipping harder in the closing beats
  const jitter = closing ? noise2D("bt-z", f * 0.7, 3) * 1.6 * bp : 0;
  const camera = [
    `translateZ(${interpolate(f, [0, D], [-60, 220])}px)`,
    `rotateY(${Math.sin(f / 16) * 3.4 + dir * bp * 1.4}deg)`,
    `rotateX(${Math.cos(f / 21) * 1.6}deg)`,
    `rotateZ(${jitter}deg)`,
    `scale(${1 + 0.02 * bp})`,
  ].join(" ");

  // streaks while a panel is flying in; softer pulses in the closing beats
  const arrivals = PANELS.reduce((m, _, k) => Math.max(m, bump(f, arrivalFrame(k) + 3, 6, 8)), 0);
  const speed = Math.max(arrivals * 0.85, closing ? bp * 0.45 : 0);
  const impactGlow = PANELS.reduce((m, _, k) => Math.max(m, bump(f, impactFrame(k), 1, 8)), 0);

  // caption
  // caption k slams on the very frame panel k lands (a beat boundary) and holds one beat
  const capIndex = f < impactFrame(0) ? -1 : f < WORDS_START ? Math.min(ANCHOR, Math.floor(f / BEAT) - 1) : -2;
  const wordIndex = Math.floor((f - WORDS_START) / BEAT);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* impact glow behind the panels */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 52% 46% at 50% 46%, ${cyanA(0.3 * impactGlow + 0.08 * bp)}, transparent 70%)`,
        }}
      />

      <SpeedLines intensity={speed} phase={f} seed="bt" />

      <Stage3D perspective={1600} cameraTransform={camera}>
        {PANELS.map((p, k) => {
          const a = arrivalFrame(k);
          if (f < a) return null;

          let ps = showcasePoseAt(k, f);

          // closing beats: each panel gets its own "snap" on a beat
          const snapBeat = SNAP_START + (k % 4) * BEAT;
          const snap = k === ANCHOR ? 0 : bump(f, snapBeat, 0, 12);
          const breathe = f >= SNAP_START ? 0.025 * bp : 0;
          const impact = bump(f, impactFrame(k), 1, 12);
          ps = { ...ps, s: ps.s * (1 + snap * 0.09 + breathe + (k === ANCHOR ? 0.03 * bp * (f > impactFrame(k) ? 1 : 0) : 0) + impact * 0.035) };

          const edge = Math.min(1, 0.3 + 0.7 * impact + 0.8 * snap);
          const sheenT = f >= impactFrame(k) ? prog(f, impactFrame(k), 16, linear) : null;
          const snapSheen = f >= snapBeat && f < snapBeat + 16 ? prog(f, snapBeat, 16, linear) : null;

          return (
            <UiPanel
              key={k}
              shot={p.shot}
              width={SHOWCASE_PANEL_W}
              pose={ps}
              opacity={prog(f, a, 4)}
              edge={edge}
              edgeAngle={f * 4 + k * 40}
              sheen={snapSheen ?? sheenT}
              dim={0.42 * dockedAmount(k, f) * (1 - snap)}
              radius={26}
            />
          );
        })}
      </Stage3D>

      {/* bottom gradient so captions always read */}
      <AbsoluteFill
        style={{ background: "linear-gradient(to top, rgba(3, 8, 23, 0.82) 0%, transparent 30%)" }}
      />

      {/* beat captions — wording lifted from the real UI */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: HEIGHT * 0.065 }}>
        {capIndex >= 0 && (
          <PopLabel
            key={`cap-${capIndex}`}
            text={PANELS[capIndex].caption}
            start={impactFrame(capIndex)}
            frame={f}
            size={84}
            color={COLORS.white}
          />
        )}
        {capIndex === -2 && wordIndex >= 0 && wordIndex < CLOSING_WORDS.length && (
          <PopLabel
            key={`word-${wordIndex}`}
            text={CLOSING_WORDS[wordIndex]}
            start={WORDS_START + wordIndex * BEAT}
            frame={f}
            size={110}
            color={wordIndex === CLOSING_WORDS.length - 1 ? COLORS.cyan : COLORS.white}
          />
        )}
      </AbsoluteFill>

      {/* last-frames flash into the next scene */}
      <AbsoluteFill
        style={{
          background: COLORS.white,
          opacity: 0.35 * prog(f, D - 6, 6, easeInCubic),
        }}
      />
    </AbsoluteFill>
  );
};

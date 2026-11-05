import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CutFX } from "../components/CutFX";
import { COLORS } from "../config/theme";
import { CanvasContext } from "../sequence2/camera";
import { CUTS_S2, SEGMENTS, SEG_OVERLAP } from "../sequence2/timing2";
import { DemoSegmentV } from "./DemoSegmentsV";
import { TeacherScenesV, VH, VW } from "./TeacherScenesV";

export const V_WIDTH = VW;
export const V_HEIGHT = VH;

/**
 * SEQUENCE 2 — vertical 9:16 cut (1080×1920 · 30 fps · 12 s). Same storyboard and timing as the
 * 16:9 cut (src/sequence2/timing2.ts); only camera framing and annotation placement differ.
 */
export const Sequence2Vertical: React.FC = () => (
  <CanvasContext.Provider value={{ W: VW, H: VH, ui: 0.84, transparent: true, frameGlow: true }}>
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence name="1-2 · Teacher → push into laptop" from={0} durationInFrames={120 + SEG_OVERLAP}>
        <TeacherScenesV />
      </Sequence>

      {SEGMENTS.map((s, i) => (
        <Sequence
          key={s.id}
          name={`App · ${s.id}`}
          from={s.from}
          durationInFrames={s.to - s.from + (i < SEGMENTS.length - 1 ? SEG_OVERLAP : 0)}
        >
          <DemoSegmentV id={s.id} />
        </Sequence>
      ))}

      <CutFX cuts={CUTS_S2} />
    </AbsoluteFill>
  </CanvasContext.Provider>
);

import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CutFX } from "../components/CutFX";
import { COLORS } from "../config/theme";
import { DemoSegment } from "./DemoSegments";
import { TeacherScenes } from "./TeacherScenes";
import { CUTS_S2, SEGMENTS, SEG_OVERLAP } from "./timing2";

/**
 * SEQUENCE 2 — product demonstration, 12 s · 1920×1080 · 30 fps.
 *  0–4 s    teacher starts working → push into the laptop → real app, full frame
 *  4–8 s    PDF workflow       (dashboard → "Creează după Model" drop-zone → Generează)
 *  8–12 s   natural language → equation → "Generează 5 exerciții" → finished BAC variant
 * Timing: src/sequence2/timing2.ts. Highlights/cursor/callouts: src/sequence2/DemoSegments.tsx.
 */
export const Sequence2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
    <Sequence name="1-2 · Teacher → push into laptop" from={0} durationInFrames={120 + SEG_OVERLAP}>
      <TeacherScenes />
    </Sequence>

    {SEGMENTS.map((s, i) => (
      <Sequence
        key={s.id}
        name={`App · ${s.id}`}
        from={s.from}
        durationInFrames={s.to - s.from + (i < SEGMENTS.length - 1 ? SEG_OVERLAP : 0)}
      >
        <DemoSegment id={s.id} />
      </Sequence>
    ))}

    <CutFX cuts={CUTS_S2} />
  </AbsoluteFill>
);

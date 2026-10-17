import React from "react";
import { random } from "remotion";
import { COLORS, FONT_FAMILY } from "../config/theme";
import { easeOutBack, easeOutExpo, prog } from "../lib/ease";

type BaseText = {
  /** frame (scene-relative) at which the animation begins */
  start: number;
  frame: number;
  size: number;
  color?: string;
  weight?: number;
  letterSpacing?: number;
  style?: React.CSSProperties;
};

const baseStyle = (size: number, weight: number, letterSpacing: number): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 0.98,
  letterSpacing,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

/**
 * SlamText — a word that punches in from a big scale with a short RGB-split glitch,
 * then settles. Use for the aggressive kinetic moments.
 */
export const SlamText: React.FC<
  BaseText & { text: string; glitchFrames?: number; slamScale?: number; seed?: string }
> = ({
  text,
  start,
  frame,
  size,
  color = COLORS.white,
  weight = 900,
  letterSpacing = -2,
  glitchFrames = 9,
  slamScale = 2.3,
  seed = text,
  style,
}) => {
  const local = frame - start;
  // Before its cue the word is invisible but still takes up its layout space,
  // so neighbouring words don't jump when it arrives.
  if (local < 0) {
    return (
      <span style={{ ...baseStyle(size, weight, letterSpacing), visibility: "hidden", display: "inline-block" }}>
        {text}
      </span>
    );
  }

  const t = prog(frame, start, 9, easeOutExpo);
  const scale = slamScale + (1 - slamScale) * t;
  const opacity = prog(frame, start, 3);
  const glitch = Math.max(0, 1 - local / glitchFrames);
  const jx = (random(`${seed}-jx-${local}`) - 0.5) * 2 * 26 * glitch;
  const jy = (random(`${seed}-jy-${local}`) - 0.5) * 2 * 10 * glitch;

  const common = baseStyle(size, weight, letterSpacing);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        transform: `scale(${scale}) translate(${jx}px, ${jy}px)`,
        opacity,
        ...style,
      }}
    >
      {glitch > 0 && (
        <>
          <span
            style={{
              ...common,
              position: "absolute",
              left: -14 * glitch,
              top: 0,
              color: COLORS.cyan,
              opacity: 0.85,
              mixBlendMode: "screen",
            }}
          >
            {text}
          </span>
          <span
            style={{
              ...common,
              position: "absolute",
              left: 14 * glitch,
              top: 0,
              color: "#7aa8ff",
              opacity: 0.6,
              mixBlendMode: "screen",
            }}
          >
            {text}
          </span>
        </>
      )}
      <span style={{ ...common, position: "relative", color }}>{text}</span>
    </div>
  );
};

export type Segment = { text: string; color?: string };

/**
 * LetterRise — letters rise out of a mask, one after another. `segments` lets one line
 * mix colours (e.g. white + cyan) without breaking the stagger.
 */
export const LetterRise: React.FC<
  BaseText & { segments: Segment[]; stagger?: number; riseFrames?: number; align?: "left" | "center" | "right" }
> = ({
  segments,
  start,
  frame,
  size,
  color = COLORS.white,
  weight = 900,
  letterSpacing = -2,
  stagger = 1.6,
  riseFrames = 14,
  align = "center",
  style,
}) => {
  let letterIndex = 0;
  const common = baseStyle(size, weight, letterSpacing);

  const justify = align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end";

  return (
    <div style={{ display: "flex", justifyContent: justify, flexWrap: "nowrap", ...style }}>
      {segments.map((seg, si) => {
        const words = seg.text.split(" ");
        return (
          <React.Fragment key={si}>
            {words.map((word, wi) => {
              const isSpaceAfter = !(si === segments.length - 1 && wi === words.length - 1);
              return (
                <span
                  key={`${si}-${wi}`}
                  style={{
                    display: "inline-flex",
                    whiteSpace: "pre",
                    // headroom for diacritics (Ă Ț Ș Î) so the mask never clips them
                    paddingTop: size * 0.22,
                    marginTop: -size * 0.22,
                    paddingBottom: size * 0.05,
                    marginBottom: -size * 0.05,
                    overflow: "hidden",
                  }}
                >
                  {Array.from(word).map((ch, ci) => {
                    const idx = letterIndex++;
                    const t = prog(frame, start + idx * stagger, riseFrames, easeOutExpo);
                    return (
                      <span
                        key={ci}
                        style={{
                          ...common,
                          display: "inline-block",
                          color: seg.color ?? color,
                          transform: `translateY(${(1 - t) * 118}%) rotate(${(1 - t) * 6}deg)`,
                          opacity: Math.min(1, t * 3),
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                  {isSpaceAfter ? <span style={{ ...common, display: "inline-block" }}>{" "}</span> : null}
                </span>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * WipeLine — a whole line revealed with a left-to-right clip wipe and a short rise.
 */
export const WipeLine: React.FC<
  BaseText & { segments: Segment[]; wipeFrames?: number; align?: "left" | "center" | "right" }
> = ({
  segments,
  start,
  frame,
  size,
  color = COLORS.white,
  weight = 800,
  letterSpacing = 0,
  wipeFrames = 16,
  align = "center",
  style,
}) => {
  const t = prog(frame, start, wipeFrames, easeOutExpo);
  // Before its cue the line stays in the layout (hidden) so nothing around it shifts when it arrives.
  const common = baseStyle(size, weight, letterSpacing);
  const justify = align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: justify,
        clipPath: `inset(-20% ${(1 - t) * 100}% -20% 0%)`,
        transform: `translateY(${(1 - t) * 26}px)`,
        opacity: Math.min(1, t * 4),
        visibility: frame < start ? "hidden" : "visible",
        ...style,
      }}
    >
      <span style={{ ...common, whiteSpace: "pre" }}>
        {segments.map((seg, i) => (
          <span key={i} style={{ color: seg.color ?? color }}>
            {seg.text}
          </span>
        ))}
      </span>
    </div>
  );
};

/** A chunky label chip that pops in with overshoot (used for beat captions). */
export const PopLabel: React.FC<{
  text: string;
  start: number;
  frame: number;
  size: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, start, frame, size, color = COLORS.white, style }) => {
  if (frame < start) return null;
  const t = prog(frame, start, 8, easeOutBack);
  const o = prog(frame, start, 3);
  return (
    <div
      style={{
        ...baseStyle(size, 800, 1),
        color,
        opacity: o,
        transform: `translateY(${(1 - t) * 40}px) scale(${0.7 + t * 0.3})`,
        textShadow: "0 6px 40px rgba(3, 8, 23, 0.9)",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

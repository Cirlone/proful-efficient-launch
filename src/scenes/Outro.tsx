import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { LightShaft } from "../components/Background";
import { LetterRise, WipeLine } from "../components/Kinetic";
import { BRAND } from "../config/assets";
import { COLORS, FONT_FAMILY, cyanA } from "../config/theme";
import { SCENES } from "../config/timing";
import { bump, easeOutBack, easeOutExpo, lerp, linear, prog } from "../lib/ease";

/**
 * SCENE 6 · OUTRO (22–28 s)
 * Brand moment: shockwave → the real logo mark flips in → PROFUL EFICIENT →
 * tagline wipe → pulsing call to action.
 *
 * Cues (scene-relative frames) — mirror in src/config/audio.ts if changed.
 */
const CUE = { shock: 0, mark: 6, title: 30, tagline: 58, cta: 102 } as const;

const MARK_SIZE = 250;

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const D = SCENES.outro.duration;

  const shock = prog(frame, CUE.shock, 26, easeOutExpo);
  const bloom = bump(frame, CUE.mark + 6, 4, 26);

  // mark: edge-on → face-on (never mirrored), scale with overshoot. Rest state is undistorted.
  const markFlip = prog(frame, CUE.mark, 26, easeOutExpo);
  const markScale = lerp(0.2, 1, prog(frame, CUE.mark, 30, easeOutBack));
  const halo = 1 + Math.sin(frame / 12) * 0.035;

  // CTA
  const ctaIn = prog(frame, CUE.cta, 18, easeOutBack);
  const ctaPulse = frame > CUE.cta + 18 ? 0.5 + 0.5 * Math.sin((frame - CUE.cta) / 7) : 0;
  const shineT = frame > CUE.cta + 18 ? ((frame - CUE.cta - 18) % 48) / 48 : -1;

  const push = 1 + prog(frame, 0, D, linear) * 0.045;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <LightShaft progress={frame / D} opacity={0.35} />

      {/* shockwave */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 700,
            height: 700,
            borderRadius: "50%",
            border: `8px solid ${COLORS.cyan}`,
            boxShadow: `0 0 90px ${cyanA(0.8)}, inset 0 0 90px ${cyanA(0.45)}`,
            transform: `translateY(-250px) scale(${0.2 + shock * 3.2})`,
            opacity: (1 - shock) * 0.9,
          }}
        />
      </AbsoluteFill>

      {/* bloom behind the mark */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 30%, ${cyanA(0.55 * bloom + 0.12)} 0%, transparent 42%)`,
        }}
      />

      <AbsoluteFill style={{ transform: `scale(${push})`, justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          {/* real logo mark */}
          <div style={{ position: "relative", width: MARK_SIZE, height: MARK_SIZE, perspective: 900 }}>
            <div
              style={{
                position: "absolute",
                inset: -34,
                borderRadius: "50%",
                border: `3px solid ${cyanA(0.5)}`,
                transform: `scale(${halo * (0.6 + 0.4 * markFlip)})`,
                opacity: markFlip * 0.8,
                boxShadow: `0 0 80px ${cyanA(0.35)}`,
              }}
            />
            <Img
              src={BRAND.markDark}
              style={{
                width: MARK_SIZE,
                height: MARK_SIZE,
                display: "block",
                opacity: Math.min(1, markFlip * 3),
                transform: `rotateY(${(1 - markFlip) * 90}deg) scale(${markScale})`,
                filter: `drop-shadow(0 0 ${30 + 50 * bloom}px ${cyanA(0.6)})`,
              }}
            />
          </div>

          {/* brand name */}
          <LetterRise
            segments={[{ text: "PROFUL" }, { text: "EFICIENT", color: COLORS.cyan }]}
            start={CUE.title}
            frame={frame}
            size={158}
            stagger={1.8}
            riseFrames={16}
          />

          {/* tagline */}
          <WipeLine
            segments={[{ text: "RECLAMĂ-ȚI TIMPUL ÎNAPOI." }]}
            start={CUE.tagline}
            frame={frame}
            size={84}
            color={COLORS.paleBlue}
            weight={700}
            letterSpacing={2}
            wipeFrames={22}
          />

          {/* call to action */}
          <div style={{ marginTop: 34, height: 140, display: "flex", alignItems: "center" }}>
            {frame >= CUE.cta && (
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  padding: "0 78px",
                  height: 128,
                  borderRadius: 100,
                  background: `linear-gradient(180deg, #4BE3F4 0%, ${COLORS.cyan} 100%)`,
                  color: COLORS.bg,
                  fontFamily: FONT_FAMILY,
                  fontWeight: 800,
                  fontSize: 62,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  transform: `scale(${lerp(0.4, 1, ctaIn) * (1 + ctaPulse * 0.018)})`,
                  opacity: Math.min(1, ctaIn * 3),
                  boxShadow: `0 0 ${50 + 80 * ctaPulse}px ${cyanA(0.45 + 0.4 * ctaPulse)}, 0 24px 60px rgba(0,0,0,0.5)`,
                }}
              >
                <span>Descoperă platforma</span>
                <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke={COLORS.bg} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                {shineT >= 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      width: 140,
                      left: `${lerp(-20, 120, shineT)}%`,
                      transform: "skewX(-20deg)",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

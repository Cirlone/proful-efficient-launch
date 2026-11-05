import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { COLORS, FONT_FAMILY, cyanA } from "../config/theme";
import { easeInOutCubic } from "../lib/ease";

export const PROMO_FPS = 30;
export const PROMO_SECONDS = 38;
export const PROMO_FRAMES = PROMO_FPS * PROMO_SECONDS;
const F = (s: number) => Math.round(s * PROMO_FPS);

type Clip = { src: string; h: number; from: number; to: number; title?: string };
const CLIPS: Clip[] = [
  { src: "form", h: 1016, from: 4, to: 11, title: "Creează un test după un model" },
  { src: "gen", h: 768, from: 11, to: 13.6, title: "Creează un test după un model" },
  { src: "pdf", h: 1036, from: 13.6, to: 17, title: "Creează un test după un model" },
  { src: "paint", h: 756, from: 17, to: 21.2, title: "Creează un test din scris de mână" },
  { src: "up", h: 1016, from: 21.2, to: 25.6, title: "Creează un test din scris de mână" },
  { src: "proc", h: 650, from: 25.6, to: 29.2, title: "Creează un test din scris de mână" },
  { src: "pdf", h: 1036, from: 29.2, to: 33.2, title: "Teste gata de descărcat" },
  { src: "menu", h: 572, from: 33.2, to: 34.8, title: "Teste gata de descărcat" },
];

/** Captions: [start, end, text]; words in *stars* are highlighted. */
const CAPS: [number, number, string][] = [
  [0.5, 3.2, "Pregătirea testelor ocupă *mult timp.*"],
  [4.3, 6.4, "Ai deja un *model de test?*"],
  [6.4, 10.9, "Folosește-l pentru a genera rapid un *test nou,* adaptat nevoilor tale."],
  [11.2, 13.8, "Încarci *fișierul* și scrii ce vrei să schimbi,"],
  [13.8, 16.6, "iar aplicația pregătește *testul nou.*"],
  [17.3, 19.4, "Ai exerciții *scrise de mână?*"],
  [19.4, 22.8, "Transformă-le într-un *test digital,* simplu și rapid."],
  [23.3, 25.8, "Încarci *poza* cu exercițiile,"],
  [25.8, 28.3, "iar aplicația citește *scrisul de mână.*"],
  [29.4, 33.7, "Testele pot fi descărcate în *PDF* sau în *Word.*"],
];

const fade = (frame: number, a: number, b: number, d = 0.4) =>
  interpolate(frame, [F(a), F(a + d), F(b - d), F(b)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Logo: React.FC<{ file: string; w: number }> = ({ file, w }) => (
  <Img src={staticFile(`brand/${file}`)} style={{ width: w, display: "block" }} />
);

const Caption: React.FC<{ text: string; a: number; b: number }> = ({ text, a, b }) => {
  const frame = useCurrentFrame();
  const o = fade(frame, a, b, 0.3);
  const y = interpolate(frame, [F(a), F(a + 0.4)], [14, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const parts = text.split("*");
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1420, height: 330, display: "flex", alignItems: "center", justifyContent: "center", opacity: o, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 70, lineHeight: 1.18, textAlign: "center", color: COLORS.white, textShadow: "0 4px 24px rgba(0,0,0,0.65)" }}>
        {parts.map((p, i) => (
          <span key={i} style={i % 2 ? { color: COLORS.cyan, fontWeight: 800 } : undefined}>{p}</span>
        ))}
      </div>
    </div>
  );
};

const Card: React.FC<{ c: Clip }> = ({ c }) => {
  const frame = useCurrentFrame();
  const o = fade(frame, c.from, c.to, 0.35);
  const t = (frame - F(c.from)) / Math.max(1, F(c.to - c.from));
  const z = 1 + 0.045 * easeInOutCubic(Math.min(1, Math.max(0, t)));
  const W = 1000;
  const H = (c.h / 1080) * W;
  return (
    <div style={{ position: "absolute", left: 40, top: 880 - H / 2 + 40, width: W, height: H, opacity: o, borderRadius: 30, overflow: "hidden", boxShadow: `0 0 80px ${cyanA(0.25)}, 0 30px 70px rgba(0,0,0,0.55)`, border: `2px solid ${cyanA(0.45)}` }}>
      <div style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: "50% 50%" }}>
        <Sequence from={F(c.from)} layout="none">
          <OffthreadVideo src={staticFile(`promo/${c.src}.mp4`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
        </Sequence>
      </div>
    </div>
  );
};

const Title: React.FC<{ text: string; a: number; b: number }> = ({ text, a, b }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 250, left: 40, right: 40, textAlign: "center", opacity: fade(frame, a, b, 0.4), fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 58, color: COLORS.cyanSoft, letterSpacing: 0.3 }}>
      {text}
    </div>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const z = 1 + 0.08 * (frame / F(4.4));
  const o = interpolate(frame, [0, 12, F(3.6), F(4.4)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 40%" }}>
        <Img src={staticFile("screenshots/Pensive Scholar Amidst Papers.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,8,23,0.15) 0%, rgba(3,8,23,0.1) 45%, rgba(3,8,23,0.88) 100%)" }} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = 34.5;
  const o = interpolate(frame, [F(a), F(a + 0.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = 0.96 + 0.04 * easeInOutCubic(Math.min(1, Math.max(0, (frame - F(a)) / F(1.2))));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <Background energy={0.4} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 70, transform: `scale(${s})` }}>
        <Logo file="profa-eficienta-stacked-white.png" w={720} />
        <div style={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 82, color: COLORS.white, textAlign: "center", lineHeight: 1.15 }}>
          Reclamă-ți <span style={{ color: COLORS.cyan }}>timpul</span> înapoi
        </div>
        <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 48, color: COLORS.bg, background: COLORS.cyan, padding: "26px 56px", borderRadius: 999 }}>
          profa-eficienta.onrender.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const logoO = interpolate(frame, [F(3.8), F(4.4), F(34), F(34.6)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background energy={0.35} />
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logoO }}>
        <Logo file="profa-eficienta-horizontal-white.png" w={470} />
      </div>
      {CLIPS.map((c, i) => (
        <React.Fragment key={i}>
          <Card c={c} />
        </React.Fragment>
      ))}
      <Title text="Creează un test după un model" a={4} b={17} />
      <Title text="Creează un test din scris de mână" a={17} b={29.2} />
      <Title text="Teste gata de descărcat" a={29.2} b={33.2} />
      <Title text="Totul într-un singur loc" a={33.2} b={34.8} />
      <Intro />
      {CAPS.map(([a, b, t], i) => (
        <Caption key={i} text={t} a={a} b={b} />
      ))}
      <EndCard />
      <Audio src={staticFile("promo/mix.wav")} />
    </AbsoluteFill>
  );
};

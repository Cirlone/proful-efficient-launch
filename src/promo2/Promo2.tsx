import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { COLORS, FONT_FAMILY, cyanA } from "../config/theme";
import { easeInOutCubic } from "../lib/ease";
import TIMING from "./timing.json";

export const P2_FPS = 30;
export const P2_SECONDS = 38.6;
export const P2_FRAMES = Math.round(P2_FPS * P2_SECONDS);
const F = (s: number) => Math.round(s * P2_FPS);

/** Screen clips: the whole app window (1920×955) is always shown, contained. Zoom is a slow, intentional push. */
type Clip = { src: string; from: number; to: number; ox: number; oy: number; z: number; title: string };
const T1 = "Creează un test pe baza unui model";
const CLIPS: Clip[] = [
  { src: "s1", from: 4.0, to: 11.1, ox: 42, oy: 60, z: 1.22, title: T1 },
  { src: "s2", from: 11.1, to: 19.1, ox: 45, oy: 50, z: 1.15, title: T1 },
  { src: "s3", from: 19.1, to: 26.8, ox: 45, oy: 50, z: 1.2, title: T1 },
  { src: "s4", from: 26.8, to: 32.4, ox: 50, oy: 50, z: 1.0, title: "Verifică testul înainte de imprimare" },
  { src: "s5", from: 32.4, to: 38.6, ox: 50, oy: 50, z: 1.0, title: "" },
];

/** Captions: line key, then chunk texts (words in *stars* are highlighted). Text is the exact voiceover. */
const CHUNKS: Record<string, string[]> = {
  l1: ["Pregătirea testelor ți-a mâncat *toată seara?*"],
  l2: ["Ai deja un *test pregătit?*", "Folosește-l ca *model* și creează rapid o *variantă nouă,*", "fără să o iei de la zero."],
  l3: ["*Încarci* testul, precizezi ce vrei să modifici,", "iar aplicația generează o *nouă variantă* pentru tine."],
  l4: ["*Verifici* exercițiile, faci ultimele ajustări", "și pregătești testul pentru clasă."],
  l6: ["Profa Eficientă.", "Mai puțin timp cu *pregătirea testelor.*", "Mai mult timp pentru *ceea ce contează.*"],
};
type Cap = { a: number; b: number; text: string; end?: boolean };
const CAPS: Cap[] = [];
(Object.keys(CHUNKS) as string[]).forEach((k) => {
  const t = (TIMING as any)[k];
  const chunks = CHUNKS[k];
  const w = chunks.map((c) => c.replace(/\*/g, "").length);
  const tot = w.reduce((x, y) => x + y, 0);
  let acc = 0;
  chunks.forEach((c, i) => {
    const a = t.start + (acc / tot) * t.dur;
    acc += w[i];
    const b = i === chunks.length - 1 ? t.start + t.dur + 0.5 : t.start + (acc / tot) * t.dur;
    CAPS.push({ a, b, text: c, end: k === "l6" });
  });
});

const fade = (frame: number, a: number, b: number, d = 0.35) =>
  interpolate(frame, [F(a), F(a + d), F(b - d), F(b)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Rich: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split("*").map((p, i) => (
      <span key={i} style={i % 2 ? { color: COLORS.cyan, fontWeight: 800 } : undefined}>{p}</span>
    ))}
  </>
);

const Caption: React.FC<{ c: Cap }> = ({ c }) => {
  const frame = useCurrentFrame();
  const o = c.end
    ? interpolate(frame, [F(c.a), F(c.a + 0.3)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : fade(frame, c.a, c.b, 0.25);
  const y = interpolate(frame, [F(c.a), F(c.a + 0.4)], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: c.end ? "relative" : "absolute", ...(c.end ? {} : { left: 60, right: 60, top: 1180, height: 400 }), display: "flex", alignItems: "center", justifyContent: "center", opacity: o, transform: `translateY(${y}px)`, fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 70, lineHeight: 1.18, textAlign: "center", color: COLORS.white, textShadow: "0 4px 24px rgba(0,0,0,0.65)" }}>
      <div><Rich text={c.text} /></div>
    </div>
  );
};

const Card: React.FC<{ c: Clip }> = ({ c }) => {
  const frame = useCurrentFrame();
  const o = fade(frame, c.from, c.to, 0.4);
  const t = (frame - F(c.from)) / Math.max(1, F(c.to - c.from));
  const k = interpolate(t, [0.22, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const z = 1 + (c.z - 1) * easeInOutCubic(k);
  const W = 1000;
  const H = (955 / 1920) * W;
  return (
    <div style={{ position: "absolute", left: 40, top: 400, width: W, height: H, opacity: o, borderRadius: 26, overflow: "hidden", boxShadow: `0 0 80px ${cyanA(0.25)}, 0 30px 70px rgba(0,0,0,0.55)`, border: `2px solid ${cyanA(0.45)}`, background: "#000" }}>
      <div style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: `${c.ox}% ${c.oy}%` }}>
        <Sequence from={F(c.from)} layout="none">
          <OffthreadVideo src={staticFile(`promo2/${c.src}.mp4`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} muted />
        </Sequence>
      </div>
    </div>
  );
};

const Title: React.FC<{ text: string; a: number; b: number }> = ({ text, a, b }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 250, left: 40, right: 40, textAlign: "center", opacity: fade(frame, a, b, 0.4), fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 58, color: COLORS.cyanSoft }}>
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

const Reminder: React.FC = () => {
  const frame = useCurrentFrame();
  const a = 26.9, b = 32.5;
  const o = fade(frame, a, b, 0.5);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1010, opacity: o, display: "flex", gap: 36, alignItems: "center", padding: "44px 46px", borderRadius: 34, background: "rgba(10,22,48,0.92)", border: `3px solid ${COLORS.cyan}`, boxShadow: `0 0 70px ${cyanA(0.35)}` }}>
      <div style={{ flex: "0 0 auto", width: 96, height: 96, borderRadius: 48, background: COLORS.cyan, color: COLORS.bg, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
      <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 56, lineHeight: 1.22, color: COLORS.white }}>
        Înainte de imprimare, asigură-te că testul este <span style={{ color: COLORS.cyan, fontWeight: 800 }}>complet</span> și că nu ai omis <span style={{ color: COLORS.cyan, fontWeight: 800 }}>nicio informație.</span>
      </div>
    </div>
  );
};

const EndBlock: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [F(32.5), F(33.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const end = CAPS.filter((c) => c.end);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 960, opacity: o, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <Img src={staticFile("brand/profa-eficienta-horizontal-white.png")} style={{ width: 640, display: "block" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 300 }}>
        {end.map((c, i) => (
          <Caption key={i} c={c} />
        ))}
      </div>
    </div>
  );
};

export const Promo2: React.FC = () => {
  const frame = useCurrentFrame();
  const logoO = interpolate(frame, [F(3.8), F(4.4), F(32.3), F(32.6)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background energy={0.35} />
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logoO }}>
        <Img src={staticFile("brand/profa-eficienta-horizontal-white.png")} style={{ width: 470 }} />
      </div>
      {CLIPS.map((c, i) => (
        <Card key={i} c={c} />
      ))}
      <Title text={T1} a={4} b={26.8} />
      <Title text="Verifică testul înainte de imprimare" a={26.8} b={32.4} />
      <Intro />
      {CAPS.filter((c) => !c.end).map((c, i) => (
        <Caption key={i} c={c} />
      ))}
      <Reminder />
      <EndBlock />
      <Audio src={staticFile("promo2/mix.wav")} />
    </AbsoluteFill>
  );
};

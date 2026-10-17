import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { AudioLayer } from "./components/AudioLayer";
import { Background } from "./components/Background";
import { CutFX } from "./components/CutFX";
import { COLORS } from "./config/theme";
import { SCENES, SCENE_KEYS, type SceneKey } from "./config/timing";
import { BeatsScene } from "./scenes/Beats";
import { ChaosScene } from "./scenes/Chaos";
import { OrderScene } from "./scenes/Order";
import { OutroScene } from "./scenes/Outro";
import { ResolveScene } from "./scenes/Resolve";
import { RevealScene } from "./scenes/Reveal";

export const SCENE_COMPONENTS: Record<SceneKey, React.FC> = {
  chaos: ChaosScene,
  order: OrderScene,
  reveal: RevealScene,
  beats: BeatsScene,
  resolve: ResolveScene,
  outro: OutroScene,
};

/** How hard the persistent background glows / scrolls during each scene (0–1). */
const ENERGY: Record<SceneKey, number> = {
  chaos: 0.95,
  order: 0.45,
  reveal: 0.7,
  beats: 1,
  resolve: 0.6,
  outro: 0.5,
};

const useEnergy = () => {
  const frame = useCurrentFrame();
  const mids = SCENE_KEYS.map((k) => SCENES[k].from + SCENES[k].duration / 2);
  return interpolate(
    frame,
    mids,
    SCENE_KEYS.map((k) => ENERGY[k]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

/**
 * THE MAIN COMPOSITION — 28 s · 1920×1080 · 30 fps.
 * Scene timing lives in src/config/timing.ts; this file only stacks the layers:
 * background → scenes (one <Sequence> each) → cut effects → audio.
 */
export const LaunchAd: React.FC = () => {
  const energy = useEnergy();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background energy={energy} />

      {SCENE_KEYS.map((key) => {
        const Scene = SCENE_COMPONENTS[key];
        return (
          <Sequence
            key={key}
            name={SCENES[key].label}
            from={SCENES[key].from}
            durationInFrames={SCENES[key].duration}
          >
            <Scene />
          </Sequence>
        );
      })}

      <CutFX />
      <AudioLayer />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Composition, Folder } from "remotion";
import { Background } from "./components/Background";
import { CutFX } from "./components/CutFX";
import { COLORS } from "./config/theme";
import {
  FPS,
  HEIGHT,
  SCENES,
  SCENE_KEYS,
  TOTAL_FRAMES,
  WIDTH,
  assertTimeline,
  type SceneKey,
} from "./config/timing";
import { LaunchAd, SCENE_COMPONENTS } from "./LaunchAd";
import { loadAllFonts } from "./lib/fonts";
import { Sequence2 } from "./sequence2/Sequence2";
import { TOTAL_FRAMES_S2 } from "./sequence2/timing2";

assertTimeline();
loadAllFonts();

/** Wraps a single scene with the background so it previews on its own in Studio. */
const makePreview = (key: SceneKey): React.FC => {
  const Scene = SCENE_COMPONENTS[key];
  const Preview: React.FC = () => (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background frameOffset={SCENES[key].from} />
      <Scene />
      {/* cut FX that fire at the *start* of this scene, as in the full edit */}
      <CutFX cuts={[0]} />
    </AbsoluteFill>
  );
  Preview.displayName = `Preview_${key}`;
  return Preview;
};

const PREVIEWS = SCENE_KEYS.reduce(
  (acc, key) => {
    acc[key] = makePreview(key);
    return acc;
  },
  {} as Record<SceneKey, React.FC>,
);

export const RemotionRoot: React.FC = () => (
  <>
    {/* ▶ The finished ad — this is the one to preview and render */}
    <Composition
      id="ProfulEficientLaunch"
      component={LaunchAd}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={TOTAL_FRAMES}
    />

    {/* ▶ Sequence 2 — product demonstration (12 s). Separate composition; Sequence 1 is untouched. */}
    <Composition
      id="Sequence2-ProductDemo"
      component={Sequence2}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={TOTAL_FRAMES_S2}
    />

    {/* Each scene on its own, for fast iteration */}
    <Folder name="Scenes">
      {SCENE_KEYS.map((key) => (
        <Composition
          key={key}
          id={`Scene-${SCENES[key].label.split(" ")[0]}-${key}`}
          component={PREVIEWS[key]}
          width={WIDTH}
          height={HEIGHT}
          fps={FPS}
          durationInFrames={SCENES[key].duration}
        />
      ))}
    </Folder>
  </>
);

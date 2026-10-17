import { Audio } from "@remotion/media";
import React from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { AUDIO, SFX_CUES, SFX_FILES } from "../config/audio";
import { FPS, TOTAL_FRAMES } from "../config/timing";

/**
 * Plays the licensed music + sound effects — but only once you enable it in
 * src/config/audio.ts (so the project renders cleanly with no audio files present).
 */
export const AudioLayer: React.FC = () => {
  if (!AUDIO.enabled) return null;

  const { music } = AUDIO;
  const fadeIn = music.fadeInSeconds * FPS;
  const fadeOut = music.fadeOutSeconds * FPS;

  return (
    <>
      <Audio
        src={staticFile(music.file)}
        trimBefore={Math.round(music.startFromSeconds * FPS)}
        volume={(f) =>
          interpolate(f, [0, fadeIn, TOTAL_FRAMES - fadeOut, TOTAL_FRAMES], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * music.volume
        }
      />
      {SFX_CUES.map((cue, i) => (
        <Sequence key={`${cue.kind}-${i}`} from={cue.frame} layout="none">
          <Audio
            src={staticFile(SFX_FILES[cue.kind])}
            volume={(cue.volume ?? 1) * AUDIO.sfxVolume}
          />
        </Sequence>
      ))}
    </>
  );
};

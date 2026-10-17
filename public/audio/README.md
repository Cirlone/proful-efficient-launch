# Audio placeholders

No audio ships with this project (music and SFX must be licensed).

1. Put a licensed track at `public/audio/music.mp3` (~28 s or longer, 120 BPM — or change `BPM` in `src/config/timing.ts`).
2. Put licensed effects at `public/audio/sfx/{riser,slam,whoosh,impact,tick,click}.wav`.
3. Set `AUDIO.enabled = true` in `src/config/audio.ts`.
4. Re-render. Cue frames are listed in `SFX_CUES` in the same file.

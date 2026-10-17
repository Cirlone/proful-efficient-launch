# Proful Eficient — Launch Ad (Remotion)

28 s · 1920×1080 · 30 fps · React + Remotion 4.

## Preview
    npm install
    npm run dev        # opens Remotion Studio
Compositions: `ProfulEficientLaunch` (full ad) and a `Scenes` folder with one preview per scene.

## Render
    npm run render:test   # first 3 s, low quality
    npm run render        # out/proful-eficient-launch.mp4

In a restricted cloud sandbox where Remotion cannot download Chrome, point it at any Chromium:
    npx remotion render src/index.ts ProfulEficientLaunch out/ad.mp4 --browser-executable=/path/to/chromium --chrome-mode=chrome-for-testing --gl=swangle

## Editing
- Scene boundaries / BPM: `src/config/timing.ts`
- Colours / font: `src/config/theme.ts`
- Screenshots & logo: `src/config/assets.ts`
- Audio: `public/audio/README.md`, `src/config/audio.ts`
- Screenshots are never stretched: `UiPanel` keeps native aspect ratio.

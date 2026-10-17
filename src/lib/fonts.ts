import { loadFont } from "@remotion/fonts";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

/**
 * Fonts are bundled locally (no network at render time):
 *  - Outfit (the logo's typeface), merged latin + latin-ext so ă â î ș ț render.
 *  - KaTeX math fonts, declared by katex.min.css (imported in src/index.ts).
 * Rendering is held (delayRender) until every face is ready.
 */
const OUTFIT_WEIGHTS = ["400", "600", "700", "800", "900"] as const;

const KATEX_FACES = [
  "1em KaTeX_Main",
  "bold 1em KaTeX_Main",
  "italic 1em KaTeX_Main",
  "italic 1em KaTeX_Math",
  "1em KaTeX_Size1",
  "1em KaTeX_Size2",
  "1em KaTeX_Size3",
  "1em KaTeX_Size4",
  "1em KaTeX_AMS",
  "1em KaTeX_SansSerif",
];

let started = false;

export const loadAllFonts = () => {
  if (started) return;
  started = true;

  const handle = delayRender("Loading Outfit + KaTeX fonts");

  const outfit = OUTFIT_WEIGHTS.map((weight) =>
    loadFont({
      family: "Outfit",
      url: staticFile(`fonts/Outfit-${weight}.woff2`),
      weight,
      format: "woff2",
      display: "block",
    }),
  );

  Promise.all(outfit)
    .then(() => Promise.all(KATEX_FACES.map((face) => document.fonts.load(face))))
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch((err) => cancelRender(err));
};

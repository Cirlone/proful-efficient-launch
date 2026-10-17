import { staticFile } from "remotion";

/**
 * Real website screenshots (public/screenshots/). They are only ever shown at
 * their native aspect ratio — never stretched — and only cropped, never redrawn.
 * `w`/`h` are the native pixel sizes, used to size panels without distortion.
 */
export const SHOTS = {
  /** "Generator BAC AI" — the hero of the reveal scene */
  bacHero: { file: "screenshots/bac-generator-hero.png", w: 1891, h: 1044 },
  /** "Generator BAC AI" — second capture, used on the beat sequence */
  bacAlt: { file: "screenshots/bac-generator-alt.png", w: 1918, h: 1048 },
  landingHero: { file: "screenshots/landing-hero.png", w: 1900, h: 1057 },
  /** has a browser status tooltip at the bottom-left, so it is cropped slightly */
  dashboard: { file: "screenshots/dashboard.png", w: 1909, h: 1051, cropBottom: 0.04 },
  dashboardAlt: { file: "screenshots/dashboard-alt.png", w: 1912, h: 1039, cropBottom: 0.04 },
  createContent: { file: "screenshots/create-content.png", w: 1884, h: 921 },
  generateModes: { file: "screenshots/generate-modes.png", w: 1918, h: 1063 },
  translateLatex: { file: "screenshots/translate-latex.png", w: 1915, h: 1045 },
  exerciseGenerator: { file: "screenshots/exercise-generator.png", w: 1917, h: 1039 },
  myStudents: { file: "screenshots/my-students.png", w: 1905, h: 1048 },
  /** the site's own "Reclamă-ți timpul înapoi" call-to-action block */
  ctaSnippet: { file: "screenshots/cta-snippet.png", w: 1090, h: 417 },
} as const;

export type ShotId = keyof typeof SHOTS;

type ShotMeta = { file: string; w: number; h: number; cropBottom?: number };

export const shotMeta = (id: ShotId): ShotMeta => SHOTS[id];
export const shotSrc = (id: ShotId) => staticFile(SHOTS[id].file);

/** Real logo files (vector). "-dark" variants are the ones designed for dark backgrounds. */
export const BRAND = {
  markDark: staticFile("brand/pe-mark-dark.svg"),
  logoHorizontalDark: staticFile("brand/proful-eficient-horizontal-dark.svg"),
  logoStackedDark: staticFile("brand/proful-eficient-stacked-dark.svg"),
  /** Subtle math-glyph backdrop supplied with the brand kit */
  background: staticFile("brand/background-1920x1080.png"),
} as const;

/** Native aspect ratios of the logo SVG viewBoxes (so they are never distorted). */
export const LOGO_RATIO = {
  horizontal: 815.43 / 130.61,
  stacked: 637.8 / 332.77,
  mark: 1,
} as const;

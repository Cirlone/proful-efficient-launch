export const COLORS = {
  /** page background — required brand navy */
  bg: "#030817",
  bgDeep: "#020512",
  bgLift: "#061226",
  panel: "#0A1630",
  panelEdge: "#16305C",
  /** brand cyan */
  cyan: "#20CFE5",
  cyanSoft: "#8FEAF5",
  cyanDeep: "#0E8FA3",
  white: "#FFFFFF",
  /** pale blue-gray used for secondary text */
  paleBlue: "#C3D0E4",
  slate: "#7C8DA8",
  /** dark ink used on light "paper" in the chaos scene */
  ink: "#0B1B3A",
  paper: "#E9EFF9",
} as const;

export const cyanA = (alpha: number) => `rgba(32, 207, 229, ${alpha})`;
export const whiteA = (alpha: number) => `rgba(255, 255, 255, ${alpha})`;
export const navyA = (alpha: number) => `rgba(3, 8, 23, ${alpha})`;

/** Outfit is bundled in public/fonts (see src/lib/fonts.ts) — it is the logo's typeface. */
export const FONT_FAMILY = "Outfit, 'Segoe UI', system-ui, sans-serif";

/** Headline / supporting text minimums for a 1920px-wide frame (1080p video layout rule). */
export const TYPE = {
  headline: 150,
  supporting: 78,
} as const;

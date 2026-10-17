import katex from "katex";
import React from "react";

const cache = new Map<string, string>();

const toHtml = (tex: string, display: boolean) => {
  const key = `${display ? "D" : "I"}|${tex}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: display,
    output: "html",
    strict: "ignore",
  });
  cache.set(key, html);
  return html;
};

/** Typeset LaTeX with KaTeX — the same engine style the product uses for its math. */
export const Tex: React.FC<{
  tex: string;
  display?: boolean;
  style?: React.CSSProperties;
}> = ({ tex, display = false, style }) => (
  <span
    style={{ display: "inline-block", whiteSpace: "nowrap", ...style }}
    dangerouslySetInnerHTML={{ __html: toHtml(tex, display) }}
  />
);

/** A varied pool of curriculum-style equations (derivatives, integrals, logs, progressions, …). */
export const EQUATIONS = [
  "\\int_0^1 x\\,f(x)\\,dx",
  "\\sum_{k=1}^{n} k=\\frac{n(n+1)}{2}",
  "\\sqrt{x^2+1}",
  "\\lim_{x\\to 0}\\frac{\\sin x}{x}=1",
  "\\log_2 8 = 3",
  "f'(x)=2x",
  "a^2+b^2=c^2",
  "\\frac{x^3}{3}+C",
  "\\sin^2 x+\\cos^2 x=1",
  "\\det A\\neq 0",
  "e^{i\\pi}+1=0",
  "x^2-5x+6=0",
  "\\binom{n}{k}",
  "\\pi r^2",
  "\\Delta=b^2-4ac",
  "\\vec u\\cdot\\vec v",
  "P(A)=\\frac{m}{n}",
  "u_n=u_1 q^{\\,n-1}",
  "\\int x^2\\,dx=\\frac{x^3}{3}+C",
  "(x+1)^n",
  "\\frac{a}{b}+\\frac{c}{d}",
  "\\log_a xy",
] as const;

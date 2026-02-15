/**
 * Category color system.
 *
 * Each top-level category has a single main hex color.
 * Sub-category colors are derived: lighten 6% + desaturate 8% per child index.
 * Gradient start is derived: darken(main, 45%).
 * Fallback palettes are derived from a neutral base via hue rotation.
 */

/* -----------------------------------------------------------------------
   Main colors — one per top-level category (7 categories)
   ----------------------------------------------------------------------- */

export const categoryColors: Record<string, string> = {
  architecture: "#9E9D24",
  azure: "#0078D4",
  csharp: "#9B4DCA",
  "machine-learning": "#2E7D32",
  "microsoft-365": "#D32F2F",
  powershell: "#283593",
  windows: "#0097A7",
};

/* -----------------------------------------------------------------------
   Fallback base — derived via hue rotation for uncategorized posts
   ----------------------------------------------------------------------- */

export const fallbackBase = "#607D8B";

export const fallbackRotations = [0, 60, 120, 240] as const;

/* -----------------------------------------------------------------------
   Color derivation helpers (HSL-based)
   ----------------------------------------------------------------------- */

/** Parse a hex color string (#RRGGBB) into [r, g, b] (0-255). */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Convert [r, g, b] (0-255) back to a #RRGGBB string. */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** Convert RGB (0-255) to HSL (h: 0-360, s: 0-100, l: 0-100). */
function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

/** Convert HSL (h: 0-360, s: 0-100, l: 0-100) to RGB (0-255). */
function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = h / 360;
  return [
    Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, hn) * 255),
    Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  ];
}

/**
 * Darken a hex color by mixing with black.
 * `amount` is 0-1 where 0.45 means 45% toward black.
 */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const factor = 1 - amount;
  return rgbToHex(r * factor, g * factor, b * factor);
}

/**
 * Derive a child color from its parent using Option D:
 * lighten by 6% per child index + desaturate by 8% per child index.
 * `childIndex` is 1-based.
 */
export function deriveChildColor(parentHex: string, childIndex: number): string {
  const [r, g, b] = hexToRgb(parentHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newS = Math.max(0, s - 8 * childIndex);
  const newL = Math.min(100, l + 6 * childIndex);
  const [nr, ng, nb] = hslToRgb(h, newS, newL);
  return rgbToHex(nr, ng, nb);
}

/**
 * Rotate the hue of a hex color by `degrees`.
 */
export function hueRotate(hex: string, degrees: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newH = ((h + degrees) % 360 + 360) % 360;
  const [nr, ng, nb] = hslToRgb(newH, s, l);
  return rgbToHex(nr, ng, nb);
}

/**
 * Compute gradient endpoints for a category color.
 * `start` = darken(main, 45%), `end` = main.
 */
export function gradient(mainColor: string): { start: string; end: string } {
  return { start: darken(mainColor, 0.45), end: mainColor };
}

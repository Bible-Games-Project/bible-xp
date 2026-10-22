import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const mascot = readFileSync(new URL("../components/Mascot.tsx", import.meta.url), "utf8");

/** The `:root` custom properties, with var() references resolved. */
function tokens(): Record<string, string> {
  const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
  const raw: Record<string, string> = {};
  for (const m of root.matchAll(/--([\w-]+):\s*([^;]+);/g)) raw[m[1]] = m[2].trim();
  const resolve = (v: string): string => {
    const ref = v.match(/^var\(--([\w-]+)\)$/);
    return ref ? resolve(raw[ref[1]]) : v.toLowerCase();
  };
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, resolve(v)]));
}

const t = tokens();
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hue = (hex: string) => {
  const [r, g, b] = rgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};
const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const saturation = (hex: string) => {
  const [r, g, b] = rgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  return max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
};
const hueDistance = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/** Colours sampled from src/assets/home-background.webp. */
const IMAGE = { sky: "#6abbfb", path: "#fed79e", sun: "#fef9d1", rock: "#cf9977" };

describe("palette", () => {
  it("is anchored on the Home picture", () => {
    expect(t.sky).toBe(IMAGE.sky);
  });

  it("every blue has the sky's hue (monochromatic with the picture)", () => {
    for (const key of ["sky-1", "sky-2", "sky-3", "sky-5", "sky-6", "sky-7", "text-2", "text-3"]) {
      expect(hueDistance(hue(t[key]), hue(IMAGE.sky)), key).toBeLessThan(2);
    }
    expect(t.brand).toBe(t["sky-3"]);
    expect(t.text).toBe(t["sky-1"]);
  });

  it("the heart of the flame is the exact complement of the sky", () => {
    expect(hueDistance(hue(t["flame-4"]), hue(IMAGE.sky))).toBeGreaterThan(178.5);
  });

  it("warm colours follow the picture's light: sun, sand, stone", () => {
    expect(hueDistance(hue(t["flame-1"]), hue(IMAGE.sun))).toBeLessThan(3);
    expect(hueDistance(hue(t["flame-3"]), hue(IMAGE.path))).toBeLessThan(3);
    expect(hueDistance(hue(t["flame-6"]), hue(IMAGE.rock))).toBeLessThan(13);
    expect(t.gold).toBe(t["flame-3"]);
    for (let i = 1; i <= 6; i++) expect(saturation(t[`flame-${i}`])).toBeGreaterThan(0.85);
  });

  it("Lumi is drawn with the same flame colours", () => {
    for (let i = 1; i <= 7; i++) expect(mascot.toLowerCase()).toContain(t[`flame-${i}`]);
  });

  it("text stays readable", () => {
    for (const bg of [t.bg, t.surface]) {
      expect(contrast(t.text, bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(t["text-2"], bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t["text-3"], bg)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(t["on-brand"], t.brand)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.brand, t["brand-soft"])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["on-gold"], t.gold)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["gold-text"], t["gold-soft"])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["warm-icon"], t["gold-soft"])).toBeGreaterThanOrEqual(3);
  });

  it("each tier badge is readable on its own colour", () => {
    for (let i = 1; i <= 5; i++) {
      const rule = css.match(new RegExp(`\\.tier-${i} \\{[^}]*--on-tier: ([^;]+);`))![1].trim();
      const onTier = rule.startsWith("var(") ? t[rule.slice(6, -1)] : rule.toLowerCase();
      expect(contrast(onTier, t[`tier-${i}`]), `tier ${i}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

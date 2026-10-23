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
const IMAGE = {
  sky: "#6abbf8",
  path: "#fcd194",
  cypress: "#3b7455",
  rock: "#cb8258",
  stone: "#d7996a",
  meadow: "#f2d987",
  sun: "#fdf8d5",
};
const avatar = readFileSync(new URL("../components/Avatar.tsx", import.meta.url), "utf8");

/** Every interface colour and the picture hue it must share. */
const FAMILIES: Record<string, string[]> = {
  [IMAGE.sky]: ["sky-1", "sky-2", "sky-3", "sky-5", "sky-6", "sky-7", "text", "text-2", "text-3", "brand", "brand-dark", "brand-soft", "brand-tint", "brand-line"],
  [IMAGE.path]: ["bg", "bg-2", "surface-2", "surface-3", "line", "line-strong", "gold", "gold-dark", "gold-soft", "gold-text", "on-gold", "warm-icon"],
  [IMAGE.cypress]: ["success", "success-dark", "success-soft"],
  [IMAGE.rock]: ["danger", "danger-dark", "danger-soft"],
};

describe("palette", () => {
  it("is anchored on the Home picture", () => {
    expect(t.sky).toBe(IMAGE.sky);
  });

  it("every interface colour is monochromatic with a hue of the picture", () => {
    for (const [source, keys] of Object.entries(FAMILIES)) {
      for (const key of keys) expect(hueDistance(hue(t[key]), hue(source)), key).toBeLessThan(3);
    }
  });

  it("avatars use single hues from the picture or Lumi's flame", () => {
    const allowed = [...Object.keys(FAMILIES), t["flame-3"]].map(hue);
    const colours = [...avatar.matchAll(/(?:from|to): "(#[0-9a-f]{6})"/gi)].map((m) => m[1].toLowerCase());
    expect(colours.length).toBe(12);
    for (const c of colours) {
      const nearest = Math.min(...allowed.map((h) => hueDistance(hue(c), h)));
      const flame = Object.keys(t).filter((k) => k.startsWith("flame-")).some((k) => t[k] === c);
      expect(flame || nearest < 3, c).toBe(true);
    }
  });

  it("every colour of Lumi's flame is a warm hue of the picture", () => {
    const warm = [IMAGE.sun, IMAGE.meadow, IMAGE.path, IMAGE.stone, IMAGE.rock].map(hue);
    for (let i = 1; i <= 7; i++) {
      const nearest = Math.min(...warm.map((h) => hueDistance(hue(t[`flame-${i}`]), h)));
      expect(nearest, `flame-${i}`).toBeLessThan(3);
    }
  });

  it("the heart of Lumi's flame is the exact complement of the sky", () => {
    expect(hueDistance(hue(t["flame-4"]), hue(IMAGE.sky))).toBeGreaterThan(178.5);
    for (let i = 1; i <= 6; i++) expect(saturation(t[`flame-${i}`])).toBeGreaterThan(0.85);
  });

  it("Lumi is drawn with the flame colours", () => {
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
    expect(contrast(t["gold-text"], t.gold)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["gold-text"], t["gold-soft"])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["warm-icon"], t["gold-soft"])).toBeGreaterThanOrEqual(3);
    expect(contrast("#ffffff", t.success)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#ffffff", t.danger)).toBeGreaterThanOrEqual(4.5);
  });

  it("each tier badge is readable on its own colour", () => {
    for (let i = 1; i <= 5; i++) {
      const rule = css.match(new RegExp(`\\.tier-${i} \\{[^}]*--on-tier: ([^;]+);`))![1].trim();
      const onTier = rule.startsWith("var(") ? t[rule.slice(6, -1)] : rule.toLowerCase();
      expect(contrast(onTier, t[`tier-${i}`]), `tier ${i}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

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
const inverse = (hex: string) => "#" + rgb(hex).map((c) => (255 - c).toString(16).padStart(2, "0")).join("");
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

describe("palette", () => {
  it("every flame colour is one of the mascot's own colours", () => {
    for (let i = 1; i <= 7; i++) expect(mascot.toLowerCase()).toContain(t[`flame-${i}`]);
  });

  it("every blue is the exact complement of a flame colour", () => {
    for (let i = 1; i <= 3; i++) {
      expect(t[`sky-${i}`]).toBe(inverse(t[`flame-${i}`]));
      expect(Math.abs(((hue(t[`sky-${i}`]) - hue(t[`flame-${i}`]) + 360) % 360) - 180)).toBeLessThan(1);
    }
    expect(t.brand).toBe(inverse(t.gold));
  });

  it("the main colours come from the flame and its complements", () => {
    expect(t.gold).toBe(t["flame-3"]);
    expect(t.text).toBe(t["sky-1"]);
    expect(t.brand).toBe(t["sky-3"]);
    expect(t["brand-dark"]).toBe(t["sky-2"]);
  });

  it("text stays readable", () => {
    for (const bg of [t.bg, t.surface]) {
      expect(contrast(t.text, bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(t["text-2"], bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t["text-3"], bg)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(t["on-brand"], t.brand)).toBeGreaterThanOrEqual(4.5);
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

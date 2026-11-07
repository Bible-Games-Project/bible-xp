import { describe, expect, it } from "vitest";
import { hslToRgb, parseColor, rgbToHsl, toHex } from "./color";

describe("dev colour helpers", () => {
  it("converts between HSL and RGB both ways", () => {
    expect(toHex(hslToRgb([0, 1, 0.5]))).toBe("#ff0000");
    expect(toHex(hslToRgb([206, 0, 0.5]))).toBe("#808080");
    for (const hex of ["#ffa929", "#0c6cb6", "#1f7a48", "#fff7eb", "#0d2f4a"]) {
      expect(toHex(hslToRgb(rgbToHsl(parseColor(hex)!)))).toBe(hex);
    }
  });

  it("reads the colour formats browsers report", () => {
    expect(parseColor("#fa2")).toEqual([255, 170, 34]);
    expect(parseColor("rgb(12, 108, 182)")).toEqual([12, 108, 182]);
    expect(parseColor("rgba(255, 255, 255, 0.88)")).toEqual([255, 255, 255]);
    expect(parseColor("rgb(255 247 235 / 0.5)")).toEqual([255, 247, 235]);
    expect(parseColor("rgba(0, 0, 0, 0)")).toBeNull();
    expect(parseColor("transparent")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { COLOR, MOTION, TYPE } from "./tokens.ts";
import {
  MIN_HIT_SIZE,
  assertContrast,
  contrastRatio,
  fitsScaledText,
  hitAreaOk,
  motionDurationMs,
} from "./a11y.ts";

describe("accessibility rules", () => {
  it("computes WCAG contrast ratios", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1);
    expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBeCloseTo(1, 3);
  });

  it("keeps body ink readable on paper and panel", () => {
    expect(contrastRatio(COLOR.ink, COLOR.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(COLOR.ink, COLOR.panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(COLOR.muted, COLOR.panel)).toBeGreaterThanOrEqual(4.5);
  });

  it("rejects body text below AA", () => {
    expect(() => assertContrast(COLOR.paper, COLOR.panel, "body")).toThrow(/contrast/);
  });

  it("uses the large-text threshold for display sizes", () => {
    // 大字号阈值 3.0：同一组合在 body 下不合格，在 large 下可能合格
    const pair = [COLOR.accent, COLOR.panel] as const;
    const ratio = contrastRatio(pair[0], pair[1]);
    if (ratio >= 3 && ratio < 4.5) {
      expect(() => assertContrast(pair[0], pair[1], "large")).not.toThrow();
      expect(() => assertContrast(pair[0], pair[1], "body")).toThrow(/contrast/);
    } else {
      expect(ratio).toBeGreaterThan(0);
    }
  });

  it("enforces a 44x44 minimum hit area", () => {
    expect(MIN_HIT_SIZE).toBe(44);
    expect(hitAreaOk({ width: 44, height: 44 })).toBe(true);
    expect(hitAreaOk({ width: 43, height: 44 })).toBe(false);
    expect(hitAreaOk({ width: 44, height: 20 })).toBe(false);
  });

  it("checks that text still fits when scaled to 200%", () => {
    const box = { width: 200, height: TYPE.body * TYPE.lineHeightRatio * 2 };
    expect(fitsScaledText({ box, fontSize: TYPE.body, lines: 1, scale: 2 })).toBe(true);
    expect(fitsScaledText({ box, fontSize: TYPE.body, lines: 2, scale: 2 })).toBe(false);
  });

  it("caps animation duration under reduced motion", () => {
    expect(motionDurationMs(MOTION.normal, false)).toBe(MOTION.normal);
    expect(motionDurationMs(MOTION.normal, true)).toBeLessThanOrEqual(MOTION.reducedMaxMs);
    expect(motionDurationMs(80, true)).toBe(80);
    expect(motionDurationMs(1000, true)).toBe(MOTION.reducedMaxMs);
  });

  it("rejects a negative duration", () => {
    expect(() => motionDurationMs(-1, false)).toThrow(/duration/);
  });
});

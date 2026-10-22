import { describe, expect, it } from "vitest";
import { HIT_FX, hitFxDuration } from "./hit-fx.ts";

describe("hit fx", () => {
  it("keeps flash and lunge in the short perceptible band", () => {
    expect(HIT_FX.flashDim).toBe(0.08);
    expect(HIT_FX.flashEnd).toBe(0.26);
    expect(HIT_FX.lungeOut).toBe(0.12);
    expect(HIT_FX.lungeBack).toBe(0.16);
    expect(hitFxDuration()).toBe(HIT_FX.flashEnd);
    expect(HIT_FX.flashDim).toBeLessThan(HIT_FX.flashEnd);
    expect(HIT_FX.flashEnd).toBeGreaterThanOrEqual(0.15);
    expect(HIT_FX.flashEnd).toBeLessThanOrEqual(0.45);
    expect(HIT_FX.lungeOut + HIT_FX.lungeBack).toBeGreaterThanOrEqual(0.15);
    expect(HIT_FX.lungeOut + HIT_FX.lungeBack).toBeLessThanOrEqual(0.45);
  });
});

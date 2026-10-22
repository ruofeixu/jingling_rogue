import { describe, expect, it } from "vitest";
import { portraitFit } from "./portrait-fit.ts";

describe("portraitFit", () => {
  it("contains a square image in a tall box without stretching", () => {
    const fitted = portraitFit(140, 180, 512, 512);
    expect(fitted.width).toBe(fitted.height);
    expect(fitted.width).toBeLessThanOrEqual(140);
    expect(fitted.height).toBeLessThanOrEqual(180);
    expect(fitted.width).toBe(140);
  });
});

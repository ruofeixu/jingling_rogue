import { describe, expect, it } from "vitest";
import { HP_COLOR } from "../tokens.ts";
import { inside, overlaps } from "./box.ts";
import { hpRatio, hpTone } from "./hp.ts";

describe("hp", () => {
  it("clamps the ratio to 0..1 and survives a zero max", () => {
    expect(hpRatio(12, 32)).toBeCloseTo(0.375);
    expect(hpRatio(-3, 32)).toBe(0);
    expect(hpRatio(40, 32)).toBe(1);
    expect(hpRatio(5, 0)).toBe(0);
  });

  it("keeps side colors until a quarter, then warns", () => {
    expect(hpTone("ally", 0.5)).toBe("ally");
    expect(hpTone("foe", 0.5)).toBe("foe");
    expect(hpTone("ally", 0.25)).toBe("low");
    expect(hpTone("foe", 0)).toBe("low");
  });

  it("pins the bar colors used by the battle plates", () => {
    expect(HP_COLOR.ally).toEqual([86, 124, 92]);
    expect(HP_COLOR.foe).toEqual([176, 84, 60]);
    expect(HP_COLOR.low).toEqual([140, 32, 26]);
    expect(HP_COLOR.track).toEqual([222, 214, 196]);
  });
});

describe("box", () => {
  it("treats touching edges as not overlapping", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    expect(overlaps(a, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
    expect(overlaps(a, { x: 9, y: 0, width: 10, height: 10 })).toBe(true);
  });

  it("checks a box against a centered content frame", () => {
    expect(inside({ x: 0, y: 0, width: 100, height: 100 }, 100, 100)).toBe(true);
    expect(inside({ x: 1, y: 0, width: 100, height: 100 }, 100, 100)).toBe(false);
  });
});

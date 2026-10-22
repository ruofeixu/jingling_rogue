import { describe, expect, it } from "vitest";
import { catchChance, trySeal, SEAL_TIERS, speciesCatchRate } from "./seal.ts";
import { RngStream } from "../rng/rng-stream.ts";

describe("seal catch", () => {
  it("uses public ball multipliers 1 / 1.5 / 2 / 3 / guaranteed", () => {
    expect(SEAL_TIERS.map((row) => row.mul)).toEqual([1, 1.5, 2, 3, 255]);
    expect(SEAL_TIERS.map((row) => row.name)).toEqual(["凡镇", "上镇", "特镇", "奇镇", "劫镇"]);
  });

  it("is about one third at full hp with a common rate and 凡镇", () => {
    expect(
      catchChance({ hpRatio: 1, sealMul: 1, catchRate: 255, catchBoon: 0 }),
    ).toBeCloseTo(1 / 3, 5);
  });

  it("is nearly certain at 1 hp with a common rate", () => {
    expect(
      catchChance({ hpRatio: 1 / 100, sealMul: 1, catchRate: 255, catchBoon: 0 }),
    ).toBeGreaterThan(0.95);
  });

  it("is more likely when the foe has low hp", () => {
    const low = catchChance({ hpRatio: 0.1, sealMul: 1.5, catchRate: 255, catchBoon: 0 });
    const high = catchChance({ hpRatio: 0.95, sealMul: 1.5, catchRate: 255, catchBoon: 0 });
    expect(low).toBeGreaterThan(high);
  });

  it("lets 劫镇 catch even a rare foe at full hp", () => {
    expect(catchChance({ hpRatio: 1, sealMul: 255, catchRate: 3, catchBoon: 0 })).toBe(1);
  });

  it("gives first-stage spirits a common rate", () => {
    expect(speciesCatchRate({ starter: false, evolveTo: "dan_li" })).toBe(255);
    expect(speciesCatchRate({ starter: true })).toBe(45);
  });

  it("succeeds with a known seed when chance is high", () => {
    const result = trySeal({
      hpRatio: 0.05,
      sealMul: 3,
      catchRate: 255,
      catchBoon: 0,
      rng: new RngStream("catch-sure"),
    });
    expect(result.chance).toBeGreaterThan(0.9);
    expect(result.caught).toBe(true);
  });
});

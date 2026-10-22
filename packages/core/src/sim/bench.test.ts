import { describe, expect, it } from "vitest";
import { benchSims } from "./bench.ts";

describe("PR sim bench gate", () => {
  it("keeps low-tier mean wave in the 40-seed PR band", () => {
    const rows = benchSims({ tier: "all", seeds: 40, prefix: "pr-gate", maxWaves: 200 });
    expect(rows.map((row) => row.tier)).toEqual(["low", "mid", "high"]);
    for (const row of rows) {
      expect(row.seeds).toBe(40);
    }
    const low = rows.find((row) => row.tier === "low");
    const mid = rows.find((row) => row.tier === "mid");
    expect(low?.meanWave).toBeGreaterThanOrEqual(10);
    expect(low?.meanWave).toBeLessThanOrEqual(30);
    expect(mid?.meanWave).toBeGreaterThanOrEqual(30);
    expect(mid?.meanWave).toBeLessThanOrEqual(95);
  }, 60_000);
});

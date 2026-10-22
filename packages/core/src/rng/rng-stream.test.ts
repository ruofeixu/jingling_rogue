import { describe, expect, it } from "vitest";
import { RngStream } from "./rng-stream.ts";

describe("RngStream", () => {
  it("replays the same integer sequence for the same seed", () => {
    const a = new RngStream("run-seed");
    const b = new RngStream("run-seed");
    const seqA = Array.from({ length: 8 }, () => a.int(100));
    const seqB = Array.from({ length: 8 }, () => b.int(100));
    expect(seqA).toEqual(seqB);
    expect(new Set(seqA).size).toBeGreaterThan(1);
  });

  it("keeps child streams deterministic and independent of the parent call count", () => {
    const parent = new RngStream("run-seed");
    parent.int(10);
    parent.int(10);
    const child = parent.child(7);
    const first = child.int(1000);
    const again = new RngStream("run-seed").child(7).int(1000);
    expect(first).toBe(again);
    expect(first).not.toBe(new RngStream("run-seed").int(1000));
  });

  it("draws floats in [0, 1)", () => {
    const rng = new RngStream("floats");
    for (let i = 0; i < 20; i++) {
      const value = rng.float();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

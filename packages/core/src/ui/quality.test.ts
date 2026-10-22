import { describe, expect, it } from "vitest";
import { probeWaitingUi } from "./quality.ts";

const WAITS = ["command", "switch", "target", "catch", "shop", "map", "omen"] as const;

describe("waiting-state controls", () => {
  it("gives every wait a tappable control that changes state", () => {
    const probes = probeWaitingUi("q0-wait");
    expect(probes.map((row) => row.wait).sort()).toEqual([...WAITS].sort());
    for (const wait of WAITS) {
      const row = probes.find((item) => item.wait === wait);
      expect(row?.labels.length, wait).toBeGreaterThan(0);
      expect(row?.changed, wait).toBe(true);
    }
  });

  it("keeps catch, target, and map probes on those screens before the tap", () => {
    const probes = probeWaitingUi("q1-path");
    for (const wait of ["catch", "target", "map"] as const) {
      const row = probes.find((item) => item.wait === wait);
      expect(row?.labels.length, wait).toBeGreaterThan(0);
      expect(row?.changed, wait).toBe(true);
    }
  });
});

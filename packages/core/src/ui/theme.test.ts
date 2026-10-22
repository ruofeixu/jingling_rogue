import { describe, expect, it } from "vitest";
import { THEME } from "./theme.ts";

describe("cartoon theme", () => {
  it("keeps a bright paper and dark ink", () => {
    expect(THEME.paper).toEqual([232, 244, 252]);
    expect(THEME.panel).toEqual([255, 253, 248]);
    expect(THEME.ink).toEqual([61, 50, 40]);
    expect(THEME.accent).toEqual([255, 138, 74]);
    expect(THEME.edge).toEqual([91, 184, 232]);
    expect(THEME.field).toEqual([123, 198, 122]);
    expect(THEME.slip).toEqual([255, 236, 214]);
    expect(THEME.muted).toEqual([80, 70, 62]);
    expect([THEME.hpBack, THEME.hpHigh, THEME.hpMid, THEME.hpLow]).toEqual([
      [208, 192, 180],
      [88, 196, 92],
      [220, 148, 28],
      [220, 72, 64],
    ]);
    expect(THEME.slip.reduce((sum, n) => sum + n, 0)).toBeGreaterThan(
      THEME.accent.reduce((sum, n) => sum + n, 0),
    );
    expect(THEME.paper.reduce((sum, n) => sum + n, 0)).toBeGreaterThanOrEqual(600);
    expect(THEME.ink.reduce((sum, n) => sum + n, 0)).toBeLessThanOrEqual(200);
  });
});

import { describe, expect, it } from "vitest";
import { THEME, THEME_NAME } from "./theme.ts";

const sum = (rgb: readonly number[]) => rgb.reduce((total, n) => total + n, 0);

describe("ink-wash theme (xuan)", () => {
  it("locks the approved palette from the ink spec 3.1", () => {
    expect(THEME_NAME).toBe("xuan");
    expect(THEME.paper).toEqual([242, 236, 222]);
    expect(THEME.panel).toEqual([250, 246, 236]);
    expect(THEME.ink).toEqual([38, 34, 30]);
    expect(THEME.muted).toEqual([88, 82, 74]);
    expect(THEME.accent).toEqual([168, 44, 34]);
    expect(THEME.edge).toEqual([110, 102, 90]);
    expect(THEME.field).toEqual([214, 218, 204]);
    expect(THEME.slip).toEqual([230, 222, 204]);
  });

  it("keeps a bright paper, dark ink, and a secondary fill lighter than the accent", () => {
    expect(sum(THEME.paper)).toBeGreaterThanOrEqual(600);
    expect(sum(THEME.ink)).toBeLessThanOrEqual(200);
    expect(sum(THEME.slip)).toBeGreaterThan(sum(THEME.accent));
  });

  it("gives money its own ochre instead of borrowing the vermilion accent", () => {
    expect(THEME.gold).not.toEqual(THEME.accent);
    expect(sum(THEME.gold)).toBeLessThan(sum(THEME.paper));
  });

  it("orders hp fills from healthy to critical and keeps the track near paper", () => {
    expect(sum(THEME.hpBack)).toBeGreaterThan(sum(THEME.hpHigh));
    expect(THEME.hpHigh).not.toEqual(THEME.hpLow);
    expect(THEME.hpMid).not.toEqual(THEME.hpLow);
  });
});

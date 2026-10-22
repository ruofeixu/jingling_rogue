import { describe, expect, it } from "vitest";
import { THEME } from "@jingling/core";
import { COLOR, MOTION, RADIUS, SPACE, TYPE, toHex, toRgba } from "./tokens.ts";

describe("design tokens", () => {
  it("keeps colors in sync with the shipped cartoon theme", () => {
    expect(COLOR.paper).toEqual(THEME.paper);
    expect(COLOR.panel).toEqual(THEME.panel);
    expect(COLOR.ink).toEqual(THEME.ink);
    expect(COLOR.accent).toEqual(THEME.accent);
    expect(COLOR.edge).toEqual(THEME.edge);
    expect(COLOR.muted).toEqual(THEME.muted);
  });

  it("exposes every color as an rgb triple", () => {
    for (const [name, value] of Object.entries(COLOR)) {
      expect(value, name).toHaveLength(3);
      for (const channel of value) {
        expect(channel, `${name} channel`).toBeGreaterThanOrEqual(0);
        expect(channel, `${name} channel`).toBeLessThanOrEqual(255);
      }
    }
  });

  it("renders hex and rgba strings", () => {
    expect(toHex([255, 138, 74])).toBe("#ff8a4a");
    expect(toRgba([255, 138, 74], 0.5)).toBe("rgba(255,138,74,0.5)");
  });

  it("has a monotonic type scale with a body size", () => {
    const sizes = [TYPE.caption, TYPE.body, TYPE.title, TYPE.display];
    for (let i = 1; i < sizes.length; i += 1) {
      expect(sizes[i], `step ${i}`).toBeGreaterThan(sizes[i - 1]);
    }
    expect(TYPE.body).toBeGreaterThanOrEqual(16);
    expect(TYPE.lineHeightRatio).toBeGreaterThanOrEqual(1.2);
  });

  it("has a monotonic spacing scale starting at a positive step", () => {
    const steps = [SPACE.xs, SPACE.sm, SPACE.md, SPACE.lg, SPACE.xl];
    expect(steps[0]).toBeGreaterThan(0);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i], `space ${i}`).toBeGreaterThan(steps[i - 1]);
    }
  });

  it("has radius and motion tokens with a reduced-motion cap", () => {
    expect(RADIUS.panel).toBeGreaterThan(0);
    expect(RADIUS.control).toBeGreaterThan(0);
    expect(MOTION.fast).toBeLessThan(MOTION.normal);
    expect(MOTION.reducedMaxMs).toBe(150);
    expect(MOTION.normal).toBeLessThanOrEqual(400);
  });

  it("freezes token groups so renderers cannot mutate them", () => {
    expect(Object.isFrozen(COLOR)).toBe(true);
    expect(Object.isFrozen(TYPE)).toBe(true);
    expect(Object.isFrozen(SPACE)).toBe(true);
    expect(Object.isFrozen(MOTION)).toBe(true);
  });
});

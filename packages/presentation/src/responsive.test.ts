import { describe, expect, it } from "vitest";
import { buildResponsiveFrame, truncationFor } from "./responsive.ts";
import { buildViewport } from "./viewport.ts";

describe("responsive frame", () => {
  it("uses one column in portrait and two in landscape", () => {
    const portrait = buildResponsiveFrame(buildViewport({ width: 750, height: 1334 }));
    const landscape = buildResponsiveFrame(buildViewport({ width: 1334, height: 750 }));

    expect(portrait.mode).toBe("portrait");
    expect(portrait.columns).toBe(1);
    expect(landscape.mode).toBe("landscape");
    expect(landscape.columns).toBe(2);
  });

  it("insets content by the safe area and never exceeds the design box", () => {
    const frame = buildResponsiveFrame(
      buildViewport({
        width: 750,
        height: 1334,
        safeArea: { top: 47, bottom: 34, left: 0, right: 0 },
      }),
    );

    expect(frame.content.y).toBe(34);
    expect(frame.content.height).toBe(1334 - 47 - 34);
    expect(frame.content.x).toBe(0);
    expect(frame.content.width).toBe(750);
    expect(frame.content.width).toBeLessThanOrEqual(750);
    expect(frame.content.height).toBeLessThanOrEqual(1334);
  });

  it("splits the content box into gutter-separated columns", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 1334, height: 750 }));
    const total = frame.columnWidth * frame.columns + frame.gutter * (frame.columns - 1);

    expect(total).toBeLessThanOrEqual(frame.content.width);
    expect(frame.columnWidth).toBeGreaterThan(0);
    expect(frame.gutter).toBeGreaterThan(0);
  });

  it("is frozen and carries no screen state", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 750, height: 1334 }));

    expect(Object.isFrozen(frame)).toBe(true);
    expect("state" in frame).toBe(false);
    expect("screenId" in frame).toBe(false);
  });

  it("chooses a truncation strategy for long labels", () => {
    expect(truncationFor({ text: "短", maxChars: 8 })).toEqual({ strategy: "none", text: "短" });
    expect(truncationFor({ text: "一二三四五六七八九十", maxChars: 8 })).toEqual({
      strategy: "ellipsis",
      text: "一二三四五六七…",
    });
    expect(truncationFor({ text: "一二三四五六七八九十", maxChars: 8, wrap: true })).toEqual({
      strategy: "wrap",
      text: "一二三四五六七八九十",
    });
  });

  it("rejects a non-positive maxChars", () => {
    expect(() => truncationFor({ text: "x", maxChars: 0 })).toThrow(/maxChars/);
  });
});

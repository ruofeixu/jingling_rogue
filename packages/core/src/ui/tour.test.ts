import { describe, expect, it } from "vitest";
import { TOUR } from "./tour.ts";
import type { PreviewScreen } from "./preview-app.ts";

const ALL_SCREENS: PreviewScreen[] = [
  "title",
  "mode",
  "starter",
  "settings",
  "codex",
  "eggs",
  "achievements",
  "stats",
  "slots",
  "glossary",
  "battle",
  "arts",
  "switch",
  "bag",
  "catch",
  "shop",
  "map",
  "omen",
  "summary",
  "hatch",
  "target",
  "defeat",
  "victory",
];

describe("screen tour", () => {
  it("lands on the screen each stop promises", () => {
    for (const stop of TOUR) {
      expect([stop.name, stop.open("tour").screen]).toEqual([stop.name, stop.screen]);
    }
  });

  it("reaches every screen the app can show", () => {
    const seen = new Set(TOUR.map((stop) => stop.screen));
    expect([...ALL_SCREENS].filter((screen) => !seen.has(screen))).toEqual([]);
  });

  it("names each stop once", () => {
    expect(new Set(TOUR.map((stop) => stop.name)).size).toBe(TOUR.length);
  });
});

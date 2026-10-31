import { describe, expect, it } from "vitest";
import { MIN_HIT_SIZE } from "../a11y.ts";
import { buildResponsiveFrame } from "../responsive.ts";
import { buildViewport } from "../viewport.ts";
import { inside, overlaps, type LayoutBox } from "./box.ts";
import { titleLayout } from "./title-layout.ts";

const SIZES = [
  { width: 750, height: 1334 },
  { width: 640, height: 1136 },
  { width: 1334, height: 750 },
];

function boxes(layout: ReturnType<typeof titleLayout>): LayoutBox[] {
  return [layout.title, layout.subtitle, layout.mascot, layout.primary, layout.hint, ...layout.grid];
}

describe("title layout", () => {
  for (const size of SIZES) {
    const frame = buildResponsiveFrame(buildViewport(size));
    const layout = titleLayout(frame, 7);

    it(`keeps every box inside the content at ${size.width}x${size.height}`, () => {
      for (const box of boxes(layout)) {
        expect(inside(box, frame.content.width, frame.content.height)).toBe(true);
      }
    });

    it(`never overlaps two boxes at ${size.width}x${size.height}`, () => {
      const all = boxes(layout);
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          expect(overlaps(all[i]!, all[j]!), `${i}-${j}`).toBe(false);
        }
      }
    });

    it(`makes the primary action larger than a grid cell at ${size.width}x${size.height}`, () => {
      const cell = layout.grid[0]!;
      expect(layout.primary.width).toBeGreaterThanOrEqual(cell.width * 1.8);
      expect(layout.primary.height).toBeGreaterThan(cell.height);
      expect(layout.primary.width).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
      expect(cell.height).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
    });
  }

  it("gives the portrait mascot at least a fifth of the screen", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 750, height: 1334 }));
    const layout = titleLayout(frame, 7);

    expect(layout.mascot.height).toBeGreaterThanOrEqual(frame.content.height * 0.2);
    expect(layout.mascot.y).toBeGreaterThan(layout.primary.y);
    expect(layout.title.y).toBeGreaterThan(layout.mascot.y);
  });

  it("puts the mascot on the left and the menu on the right in landscape", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 1334, height: 750 }));
    const layout = titleLayout(frame, 7);

    expect(layout.mascot.x).toBeLessThan(0);
    expect(layout.primary.x).toBeGreaterThan(0);
    expect(layout.grid[0]!.x).toBeGreaterThan(0);
  });
});

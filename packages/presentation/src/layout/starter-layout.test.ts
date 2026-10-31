import { describe, expect, it } from "vitest";
import { buildResponsiveFrame } from "../responsive.ts";
import { buildViewport } from "../viewport.ts";
import { inside, overlaps, type LayoutBox } from "./box.ts";
import { starterLayout } from "./starter-layout.ts";

const SIZES = [
  { width: 750, height: 1334 },
  { width: 640, height: 1136 },
  { width: 1334, height: 750 },
];

function boxes(layout: ReturnType<typeof starterLayout>): LayoutBox[] {
  return [layout.title, ...layout.cards, layout.detail, layout.confirm, layout.back];
}

describe("starter layout", () => {
  for (const size of SIZES) {
    const frame = buildResponsiveFrame(buildViewport(size));
    const layout = starterLayout(frame, 3);

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

    it(`keeps the confirm control in the bottom quarter at ${size.width}x${size.height}`, () => {
      const floor = -frame.content.height / 2;
      const bottom = layout.confirm.y - layout.confirm.height / 2;
      expect(bottom).toBeGreaterThanOrEqual(floor);
      expect(bottom).toBeLessThanOrEqual(floor + frame.content.height * 0.25);
      expect(layout.confirm.width).toBeGreaterThan(layout.back.width);
    });
  }

  it("gives portrait cards at least 30% of the screen height", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 750, height: 1334 }));
    const layout = starterLayout(frame, 3);

    for (const card of layout.cards) {
      expect(card.height).toBeGreaterThanOrEqual(frame.content.height * 0.3);
    }
    expect(layout.cards[0]!.y).toBeGreaterThan(layout.detail.y);
    expect(layout.detail.y).toBeGreaterThan(layout.confirm.y);
  });
});

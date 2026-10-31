import { describe, expect, it } from "vitest";
import { MIN_HIT_SIZE } from "../a11y.ts";
import { buildResponsiveFrame } from "../responsive.ts";
import { buildViewport } from "../viewport.ts";
import { battleLayout } from "./battle-layout.ts";
import { inside, overlaps, type LayoutBox } from "./box.ts";

const SIZES = [
  { width: 750, height: 1334 },
  { width: 640, height: 1136 },
  { width: 1334, height: 750 },
];

function boxes(l: ReturnType<typeof battleLayout>): LayoutBox[] {
  return [l.topBar, l.foePlate, l.foeArt, l.allyArt, l.allyPlate, l.log, ...l.commands];
}

describe("battle layout", () => {
  for (const size of SIZES) {
    const frame = buildResponsiveFrame(buildViewport(size));
    const l = battleLayout(frame);

    it(`keeps every box inside the content at ${size.width}x${size.height}`, () => {
      for (const b of boxes(l)) expect(inside(b, frame.content.width, frame.content.height)).toBe(true);
    });

    it(`never overlaps two boxes at ${size.width}x${size.height}`, () => {
      const all = boxes(l);
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          expect(overlaps(all[i]!, all[j]!), `${i}-${j}`).toBe(false);
        }
      }
    });

    it(`puts the foe up-right and the ally down-left at ${size.width}x${size.height}`, () => {
      expect(l.foeArt.y).toBeGreaterThan(l.allyArt.y);
      expect(l.foeArt.x).toBeGreaterThan(l.allyArt.x);
    });

    it(`keeps commands tappable at ${size.width}x${size.height}`, () => {
      for (const c of l.commands) {
        expect(c.width).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
        expect(c.height).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
      }
    });
  }

  it("puts commands in the bottom 35% of a portrait screen (thumb zone)", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 750, height: 1334 }));
    const layout = battleLayout(frame);
    const limit = -frame.content.height / 2 + frame.content.height * 0.35;
    for (const command of layout.commands) {
      expect(command.y + command.height / 2).toBeLessThanOrEqual(limit);
    }
  });
});

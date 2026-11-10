import { describe, expect, it } from "vitest";
import { buildResponsiveFrame } from "../responsive.ts";
import { buildViewport } from "../viewport.ts";
import { inside, overlaps, type LayoutBox } from "./box.ts";
import { starterLayout } from "./starter-layout.ts";
import { SPACE, TYPE } from "../tokens.ts";

const SIZES = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 },
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

  it("makes the detail panel tall enough for two lines of body text plus padding (B5b)", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 390, height: 844 }));
    const layout = starterLayout(frame, 3);
    expect(layout.detail.height).toBeGreaterThanOrEqual(TYPE.body * TYPE.lineHeightRatio * 2 + SPACE.md * 2);
  });

  it("stacks portrait cards as wide horizontal cards with a large portrait on the left (B5c)", () => {
    for (const size of [{ width: 390, height: 844 }, { width: 750, height: 1334 }, { width: 768, height: 1024 }]) {
      const frame = buildResponsiveFrame(buildViewport(size));
      const layout = starterLayout(frame, 3);

      expect(layout.cards).toHaveLength(3);
      expect(layout.arts).toHaveLength(3);
      layout.cards.forEach((card, index) => {
        const art = layout.arts[index]!;
        // 竖屏：三张卡上下排，同宽，比高度更宽
        expect(card.width).toBe(layout.cards[0]!.width);
        expect(card.width).toBeGreaterThan(card.height);
        if (index > 0) {
          expect(card.y).toBeLessThan(layout.cards[index - 1]!.y);
        }
        // 立绘边长 ≥ 卡片短边的 80%，在卡片左侧，且完全在卡片内。
        expect(art.width).toBeGreaterThanOrEqual(Math.min(card.width, card.height) * 0.8);
        expect(art.width).toBe(art.height);
        expect(art.x).toBeLessThan(card.x);
        const rel = { x: art.x - card.x, y: art.y - card.y, width: art.width, height: art.height };
        expect(inside(rel, card.width, card.height)).toBe(true);
      });
      expect(layout.cards[0]!.y).toBeGreaterThan(layout.detail.y);
      expect(layout.detail.y).toBeGreaterThan(layout.confirm.y);
    }
  });

  it("keeps three columns in landscape with a portrait filling most of the card width (B5c)", () => {
    const frame = buildResponsiveFrame(buildViewport({ width: 1280, height: 720 }));
    const layout = starterLayout(frame, 3);

    expect(new Set(layout.cards.map((card) => card.y)).size).toBe(1);
    layout.cards.forEach((card, index) => {
      expect(layout.arts[index]!.width).toBeGreaterThanOrEqual(card.width * 0.6);
    });
  });
});

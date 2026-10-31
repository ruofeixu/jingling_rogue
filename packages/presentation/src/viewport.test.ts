import { describe, expect, it } from "vitest";
import { DESIGN_HEIGHT, DESIGN_WIDTH, buildViewport } from "./viewport.ts";

describe("viewport model", () => {
  it("keeps the 750x1334 design resolution as the single source", () => {
    expect(DESIGN_WIDTH).toBe(750);
    expect(DESIGN_HEIGHT).toBe(1334);
  });

  it("reports portrait for a tall viewport", () => {
    const vp = buildViewport({ width: 750, height: 1334 });

    expect(vp.orientation).toBe("portrait");
    expect(vp.design).toEqual({ width: 750, height: 1334 });
  });

  it("reports landscape for a wide viewport", () => {
    const vp = buildViewport({ width: 1334, height: 750 });

    expect(vp.orientation).toBe("landscape");
    expect(vp.design).toEqual({ width: 1334, height: 750 });
  });

  it("grows the long side to the window ratio so the page fills the window without bars (B5b)", () => {
    // 390×844 手机：宽固定 750，高按比例 = 750 × 844 / 390 ≈ 1623。
    expect(buildViewport({ width: 390, height: 844 }).design).toEqual({ width: 750, height: 1623 });
    // 比 750:1334 还宽的竖屏不压扁：高最少 1334，宽按比例放大。
    expect(buildViewport({ width: 768, height: 1024 }).design).toEqual({ width: 1001, height: 1334 });
    // 横屏同理：高固定 750，宽按比例，最少 1334。
    expect(buildViewport({ width: 2000, height: 750 }).design).toEqual({ width: 2000, height: 750 });
    expect(buildViewport({ width: 1024, height: 768 }).design).toEqual({ width: 1334, height: 1001 });
    // 设计分辨率的宽高比始终等于窗口宽高比（四舍五入后误差 <1%），所以 EXACT_FIT 不会拉伸。
    for (const [w, h] of [[390, 844], [375, 667], [768, 1024], [1280, 720], [844, 390], [320, 700]]) {
      const d = buildViewport({ width: w, height: h }).design;
      expect(Math.abs(d.width / d.height - w / h) / (w / h), `${w}x${h}`).toBeLessThan(0.01);
    }
  });

  it("insets the safe area without changing the design resolution", () => {
    const vp = buildViewport({
      width: 750,
      height: 1334,
      safeArea: { top: 47, bottom: 34, left: 0, right: 0 },
    });

    expect(vp.design).toEqual({ width: 750, height: 1334 });
    expect(vp.safe.top).toBe(47);
    expect(vp.safe.bottom).toBe(34);
    expect(vp.content.height).toBe(1334 - 47 - 34);
    expect(vp.content.width).toBe(750);
  });

  it("defaults the safe area to zero and clamps negative input", () => {
    const vp = buildViewport({
      width: 750,
      height: 1334,
      safeArea: { top: -10, bottom: 0, left: 0, right: 0 },
    });

    expect(vp.safe).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
  });

  it("rejects a non-positive viewport", () => {
    expect(() => buildViewport({ width: 0, height: 1334 })).toThrow(/viewport/);
  });

  it("is a pure model: rotating does not carry any screen state", () => {
    const portrait = buildViewport({ width: 750, height: 1334 });
    const landscape = buildViewport({ width: 1334, height: 750 });

    expect(Object.keys(portrait).sort()).toEqual(Object.keys(landscape).sort());
    expect(Object.isFrozen(portrait)).toBe(true);
    expect("state" in portrait).toBe(false);
    expect("screenId" in portrait).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { DIAGNOSTICS_SCREEN_ID, buildDiagnosticsModel } from "./diagnostics.ts";
import { buildViewport } from "./viewport.ts";

// 诊断路由必须完全不含产品内容，否则 U1 就等于偷偷迁移了产品页。
const PRODUCT_WORDS = [
  "契灵志怪",
  "精怪",
  "灶狸",
  "井蛛",
  "桃梗",
  "新的旅途",
  "短征",
  "经典",
  "术",
  "囊",
  "契录",
  "卵房",
  "灵糖",
];

describe("diagnostics route", () => {
  it("uses a reserved screen id outside the product matrix", () => {
    expect(DIAGNOSTICS_SCREEN_ID).toBe("diagnostics");
  });

  it("renders shell facts only, never product copy", () => {
    const model = buildDiagnosticsModel({
      viewport: buildViewport({ width: 750, height: 1334 }),
      renderer: "legacy",
      globalLegacyFallback: false,
    });
    const text = JSON.stringify(model);

    for (const word of PRODUCT_WORDS) {
      expect(text.includes(word), word).toBe(false);
    }
  });

  it("exposes orientation and renderer choice for the shell demo", () => {
    const portrait = buildDiagnosticsModel({
      viewport: buildViewport({ width: 750, height: 1334 }),
      renderer: "legacy",
      globalLegacyFallback: false,
    });
    const landscape = buildDiagnosticsModel({
      viewport: buildViewport({ width: 1334, height: 750 }),
      renderer: "presentation",
      globalLegacyFallback: true,
    });

    expect(portrait.lines.some((line) => line.includes("portrait"))).toBe(true);
    expect(landscape.lines.some((line) => line.includes("landscape"))).toBe(true);
    expect(landscape.lines.some((line) => line.includes("presentation"))).toBe(true);
    expect(landscape.lines.some((line) => line.includes("fallback"))).toBe(true);
  });

  it("is a normal-state model with an accessible name and no primary action", () => {
    const model = buildDiagnosticsModel({
      viewport: buildViewport({ width: 750, height: 1334 }),
      renderer: "legacy",
      globalLegacyFallback: false,
    });

    expect(model.state).toBe("normal");
    expect(model.accessibleName.length).toBeGreaterThan(0);
    expect(model.primaryAction).toBeNull();
  });
});

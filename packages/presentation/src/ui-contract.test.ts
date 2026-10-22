import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const FILES = {
  button: resolve(REPO, "assets/scripts/app/ui/Button.ts"),
  panel: resolve(REPO, "assets/scripts/app/ui/Panel.ts"),
  stateView: resolve(REPO, "assets/scripts/app/ui/StateView.ts"),
  gallery: resolve(REPO, "assets/scripts/app/GalleryView.ts"),
};

function read(path: string): string {
  expect(existsSync(path), `${path} must exist`).toBe(true);
  return readFileSync(path, "utf8");
}

/** U2 基础组件必须无玩法判断、无产品文案，颜色与尺寸只能来自 presentation token。 */
describe("U2 Cocos component contract", () => {
  it("takes every color and metric from presentation tokens", () => {
    for (const [name, path] of Object.entries(FILES)) {
      const src = read(path);
      expect(src, name).toContain('from "');
      expect(src.includes("jinglingPresentation"), `${name} imports tokens`).toBe(true);
      // 禁止硬编码颜色字面量（三元组或 hex）
      expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(src), `${name} hardcodes rgb`).toBe(false);
      expect(/#[0-9a-fA-F]{6}/.test(src), `${name} hardcodes hex`).toBe(false);
    }
  });

  it("has no gameplay dependency", () => {
    for (const [name, path] of Object.entries(FILES)) {
      const src = read(path);
      for (const forbidden of ["jinglingCore", "getSpirit", "beginUiRun", "ClassicSlice"]) {
        expect(src.includes(forbidden), `${name} -> ${forbidden}`).toBe(false);
      }
    }
  });

  it("carries no product copy", () => {
    for (const [name, path] of Object.entries(FILES)) {
      const src = read(path);
      for (const word of ["契灵", "精怪", "新的旅途", "短征", "契录", "卵房", "灵糖", "灶狸"]) {
        expect(src.includes(word), `${name} -> ${word}`).toBe(false);
      }
    }
  });

  it("enforces the minimum hit area in the button", () => {
    const src = read(FILES.button);

    expect(src).toContain("MIN_HIT_SIZE");
    expect(src).toContain("assertHitArea");
    expect(src).toContain("disabledReason");
  });

  it("renders all five states from a ScreenModel", () => {
    const src = read(FILES.stateView);

    expect(src).toContain("ScreenModel");
    for (const state of ["normal", "loading", "empty", "error", "locked"]) {
      expect(src.includes(state), state).toBe(true);
    }
    expect(src).toContain("model.reason");
    expect(src).toContain("model.accessibleName");
  });

  it("respects reduced motion through the shared helper", () => {
    const gallery = read(FILES.gallery);

    expect(gallery).toContain("motionDurationMs");
    expect(gallery).toContain("reduceMotion");
  });

  it("drives the gallery from the responsive frame and text scale", () => {
    const gallery = read(FILES.gallery);

    expect(gallery).toContain("buildResponsiveFrame");
    expect(gallery).toContain("textScale");
    expect(gallery).toContain("destroy");
  });

  it("keeps the product renderer untouched", () => {
    const boot = readFileSync(resolve(REPO, "assets/scripts/Boot.ts"), "utf8");

    expect(boot.includes("GalleryView")).toBe(false);
    expect(boot.includes("jinglingPresentation")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const UI = resolve(REPO, "assets/scripts/app/ui");

function read(name: string): string {
  const p = resolve(UI, name);
  expect(existsSync(p), p).toBe(true);
  return readFileSync(p, "utf8");
}

describe("U16 skin skeleton: graceful fallback contract", () => {
  it("UiSkin exists and returns null (fallback) when a frame is missing", () => {
    const src = read("UiSkin.ts");
    expect(src).toContain("getFrame");
    expect(src).toContain("UI_ART_BUNDLE");
    // getFrame 必须能返回 null 供回退
    expect(src).toMatch(/return null|=> null|null;/);
    // 9-slice 边距登记表存在
    expect(src).toContain("SLICE_TABLE");
    expect(src).toContain("applySlice");
  });

  it("Panel uses a sprite when a frame exists, else falls back to Graphics", () => {
    const src = read("Panel.ts");
    expect(src).toContain("UiSkin");
    expect(src).toContain("getFrame");
    // 两条路径都在：Sprite（有贴图）与 Graphics（回退）
    expect(src).toContain("addComponent(Sprite)");
    expect(src).toContain("addComponent(Graphics)");
    // 回退仍用 token，不写死颜色
    expect(src).toContain("COLOR.panel");
    expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(src)).toBe(false);
  });

  it("Button supports three skin states + optional icon, else Graphics", () => {
    const src = read("Button.ts");
    expect(src).toContain("btn_primary");
    expect(src).toContain("btn_normal");
    expect(src).toContain("btn_disabled");
    expect(src).toContain("opts.icon");
    expect(src).toContain("addComponent(Sprite)");
    expect(src).toContain("addComponent(Graphics)");
    // 无写死颜色
    expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(src)).toBe(false);
  });

  it("does not reference UiSkin directly inside AppShell.start (avoid import-cycle TDZ)", () => {
    const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");
    // 允许注释提及，但不得有 import UiSkin
    expect(shell.includes('import { UiSkin }')).toBe(false);
  });
});


describe("U16 skin skeleton: first-frame loading contract", () => {
  it("does not permanently cache null before the ui-art bundle is ready", () => {
    const src = read("UiSkin.ts");
    const noBundleBranch = src.match(/if \(!this\.bundle\) \{([\s\S]*?)\n    \}/)?.[1] ?? "";

    expect(noBundleBranch).toContain("return null");
    expect(noBundleBranch).not.toContain("this.frames.set(name, null)");
  });
});

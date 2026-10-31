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

  it("sizes sprites after assigning the frame, so CUSTOM size is not reset to the texture size", () => {
    // Cocos 在赋 spriteFrame 时按贴图原尺寸重设 UITransform（256×256 图标）；
    // 必须先赋 spriteFrame、再设 CUSTOM、最后设尺寸。
    for (const file of ["Button.ts", "Panel.ts", "Backdrop.ts"]) {
      const src = read(file);
      const frameAt = src.indexOf(".spriteFrame = ");
      const customAt = src.indexOf("Sprite.SizeMode.CUSTOM", frameAt);
      expect(frameAt, file).toBeGreaterThan(-1);
      expect(customAt, file).toBeGreaterThan(frameAt);
    }
    const button = read("Button.ts");
    const iconFrame = button.indexOf("iconSprite.spriteFrame = iconFrame");
    const iconSize = button.indexOf("setContentSize(iconSize, iconSize)");
    expect(iconSize, "icon size must be set after the frame").toBeGreaterThan(iconFrame);
  });

  it("headings use the calligraphy title font from the skin bundle, body text stays system (I2b)", () => {
    const skin = read("UiSkin.ts");
    expect(skin).toContain("getTitleFont");
    expect(skin).toContain("fonts/title");
    const text = read("Text.ts");
    expect(text).toContain("heading");
    expect(text).toContain("getTitleFont");
    // 没有字体时回退系统字体，不能空白。
    expect(text).toContain("useSystemFont");
    // 页面大标题都标成 heading。
    for (const screen of ["TitleScreen.ts", "ModeScreen.ts", "StarterScreen.ts"]) {
      const src = readFileSync(resolve(REPO, "assets/scripts/app/screens", screen), "utf8");
      expect(src, screen).toContain("heading: true");
    }
    expect(read("ListView.ts")).toContain("heading: true");
  });

  it("ships the OFL license next to the subset title font", () => {
    expect(existsSync(resolve(REPO, "assets/ui-art/fonts/title.ttf"))).toBe(true);
    const license = readFileSync(resolve(REPO, "assets/ui-art/fonts/OFL.txt"), "utf8");
    expect(license).toContain("SIL Open Font License, Version 1.1");
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

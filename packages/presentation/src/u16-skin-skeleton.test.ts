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

  it("Panel fallback is translucent paper with ink corner marks, no grey border (B5c)", () => {
    const src = read("Panel.ts");
    // 85% 不透明度的宣纸底，让背景墨色淡淡透出。
    expect(src).toMatch(/PANEL_ALPHA\s*=\s*217/);
    expect(src).toContain("COLOR.ink");
    // 不再用均匀灰描边
    expect(src).not.toContain("COLOR.edge");
    expect(src).not.toContain("roundRect");
    expect(src).toContain("drawCornerMarks");
  });

  it("list rows stay readable: veiled panel, merged count line, no repeated reasons (B5c)", () => {
    const list = readFileSync(resolve(REPO, "assets/scripts/app/ui/ListView.ts"), "utf8");
    const button = read("Button.ts");
    const panel = read("Panel.ts");

    expect(panel).toContain("alpha?: number");
    expect(list).toMatch(/alpha:\s*LIST_PANEL_ALPHA/);
    expect(list).toContain('.join(" • ")');
    expect(button).toContain("showReason");
    expect(list).toContain("showReason");
  });

  it("slots page keeps all five slots in one ordered list via primaryInList (B5c)", () => {
    const list = readFileSync(resolve(REPO, "assets/scripts/app/ui/ListView.ts"), "utf8");
    const lobby = readFileSync(resolve(REPO, "assets/scripts/app/screens/LobbyScreen.ts"), "utf8");
    const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");

    expect(list).toContain("primaryInList");
    expect(lobby).toContain("primaryInList");
    expect(shell).toMatch(/primaryInList:\s*this\.routeId === "slots"/);
  });

  it("Button supports primary and normal skins + optional icon, else Graphics", () => {
    const src = read("Button.ts");
    expect(src).toContain("btn_primary");
    expect(src).toContain("btn_normal");
    // B5c：禁用不再是第三套皮，而是普通态降不透明度。
    expect(src).not.toContain("btn_disabled");
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

  it("every label in the product UI uses the one brush font through applyUiFont (B5c)", () => {
    const skin = read("UiSkin.ts");
    expect(skin).toContain("getTitleFont");
    expect(skin).toContain("fonts/title");
    expect(skin).toContain("export function applyUiFont");
    // 没有字体时回退系统字体，不能空白。
    expect(skin).toContain("useSystemFont");
    // 文字组件、按钮（含禁用原因）、状态页都走同一个入口，不再标题一种字、正文另一种字。
    for (const file of ["Text.ts", "Button.ts", "StateView.ts"]) {
      const src = read(file);
      const labels = (src.match(/addComponent\(Label\)/g) ?? []).length;
      const applied = (src.match(/applyUiFont\(/g) ?? []).length;
      expect(applied, file).toBeGreaterThanOrEqual(labels);
    }
  });

  it("has exactly two button looks: primary (vermilion) and normal (paper) (B5c)", () => {
    const src = read("Button.ts");
    // 列表行、弹层行、模式按钮都用 normal；禁用是 normal 降低不透明度，不是第三种灰条。
    expect(src).toContain("UIOpacity");
    expect(src).not.toContain("COLOR.slip");
    expect(src).toContain("COLOR.panel");
    expect(src).toContain("COLOR.accent");
  });

  it("keeps the disabled reason out of the button label (B5b)", () => {
    // "队伍（没有可换的伙伴）" 挤成一行；原因放到按钮下方一行小字。
    const src = read("Button.ts");
    expect(src).not.toMatch(/\$\{opts\.action\.label\}（\$\{opts\.action\.disabledReason\}）/);
    expect(src).toContain("reason");
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

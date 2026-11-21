import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { INK_FX } from "./tokens.ts";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel: string): string {
  const path = resolve(REPO, rel);
  expect(existsSync(path), path).toBe(true);
  return readFileSync(path, "utf8");
}

describe("ink splash on hit (B5d)", () => {
  it("keeps the splash short enough to read as hit feedback", () => {
    expect(INK_FX.splashSeconds).toBeGreaterThanOrEqual(0.6);
    expect(INK_FX.splashSeconds).toBeLessThanOrEqual(1.0);
    expect(INK_FX.splashAlpha).toBeGreaterThan(0);
    expect(INK_FX.splashAlpha).toBeLessThanOrEqual(1);
  });

  it("ships a splash effect driven by progress and seed uniforms", () => {
    const effect = read("assets/ui-art/effects/ink-splash.effect");

    expect(effect).toContain("CCEffect");
    expect(effect).toContain("inkParams");
    expect(effect).toContain("inkColor");
    expect(effect).toContain("blendSrc: src_alpha");
    // 噪声层数有上限，给以后调性能留余地。
    expect(effect).toMatch(/i\s*<\s*[1-4]\s*;/);
  });

  it("loads the splash effect from ui-art and preloads it with the bundle", () => {
    const skin = read("assets/scripts/app/ui/UiSkin.ts");

    expect(skin).toContain("effects/ink-splash");
    expect(skin).toContain("getInkSplashMaterial");
    expect(skin).toMatch(/this\.bundle = bundle;[\s\S]{0,400}this\.requestSplashEffect\(\)/);
  });

  it("plays only when hp drops, tinted from tokens, with a missing-asset fallback", () => {
    const fx = read("assets/scripts/app/ui/InkSplash.ts");
    const battle = read("assets/scripts/app/screens/BattleScreen.ts");

    expect(fx).toContain("getInkSplashMaterial");
    expect(fx).toMatch(/if \(!material\)/);
    expect(fx).toContain("INK_FX");
    expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(fx)).toBe(false);
    // 只在掉血分支里播，且「减少动效」下不播。
    expect(battle).toContain("playInkSplash");
    expect(battle).toMatch(/ratio < from[\s\S]{0,1200}playInkSplash/);
    expect(battle).toMatch(/!reduceMotion[\s\S]{0,200}playInkSplash|playInkSplash[\s\S]{0,200}reduceMotion/);
  });
});

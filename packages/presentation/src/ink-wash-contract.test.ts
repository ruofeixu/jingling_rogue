import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { INK_FX, MOTION } from "./tokens.ts";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel: string): string {
  const path = resolve(REPO, rel);
  expect(existsSync(path), path).toBe(true);
  return readFileSync(path, "utf8");
}

describe("ink wash transition (B5d)", () => {
  it("keeps the wash short enough not to slow the game down", () => {
    // 过短（0.6 秒）试玩反馈“一闪就过”，过长会拖慢节奏。
    expect(INK_FX.washSeconds).toBeGreaterThanOrEqual(1.0);
    expect(INK_FX.washSeconds).toBeLessThanOrEqual(2.0);
    // 减少动效下不播洗墨：上限仍以 MOTION.reducedMaxMs 为准。
    expect(MOTION.reducedMaxMs).toBeLessThanOrEqual(150);
  });

  it("ships a sprite effect driven by progress and seed uniforms", () => {
    const effect = read("assets/ui-art/effects/ink-wash.effect");

    expect(effect).toContain("CCEffect");
    expect(effect).toContain("inkParams");
    expect(effect).toContain("inkColor");
    expect(effect).toContain("blendSrc: src_alpha");
    // 噪声层数要有上限，给以后调性能留余地。
    expect(effect).toMatch(/i\s*<\s*[1-4]\s*;/);
  });

  it("loads the effect from ui-art and falls back to no wash when missing", () => {
    const skin = read("assets/scripts/app/ui/UiSkin.ts");
    const wash = read("assets/scripts/app/ui/InkWash.ts");

    expect(skin).toContain("effects/ink-wash");
    expect(skin).toContain("getInkMaterial");
    expect(wash).toContain("getInkMaterial");
    expect(wash).toMatch(/if \(!material\)/);
    expect(wash).toContain("INK_FX");
    // 转场渲染层不写死颜色
    expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(wash)).toBe(false);
  });

  it("plays on page changes only, never on same-page refreshes or reduced motion", () => {
    const shell = read("assets/scripts/app/AppShell.ts");

    expect(shell).toContain("playInkWash");
    // afterCommand 会先改 routeId 再调 route，所以不能拿 routeId 对比；用上一次挂载的页。
    expect(shell).toContain("lastMountedRoute");
    expect(shell).not.toMatch(/screenId !== this\.routeId/);
    // 旧的洗墨节点要先清掉，不能叠出两层。
    expect(shell).toMatch(/this\.inkWash\?\.isValid/);
    expect(shell).toMatch(/this\.inkWash\.removeFromParent\(\)/);
    // 同页重挂不能把正在播的洗墨一起销毁：摘下来、重挂完再挂到新宿主。
    expect(shell).toMatch(/this\.host\.addChild\(running\)/);
    expect(shell).toMatch(/!this\.reduceMotion/);
  });
});

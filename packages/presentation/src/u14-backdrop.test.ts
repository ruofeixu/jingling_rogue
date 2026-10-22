import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SHELL = resolve(REPO, "assets/scripts/app/AppShell.ts");
const BACKDROP = resolve(REPO, "assets/scripts/app/ui/Backdrop.ts");

describe("U14 self-contained screen contract", () => {
  it("ships a Backdrop helper", () => {
    expect(existsSync(BACKDROP)).toBe(true);
    const src = readFileSync(BACKDROP, "utf8");
    expect(src).toContain("makeBackdrop");
    // 用 token 底色，不写死颜色
    expect(src).toContain("COLOR.paper");
    expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(src)).toBe(false);
  });

  it("paints a full-bleed backdrop for every presentation page", () => {
    const src = readFileSync(SHELL, "utf8");
    expect(src).toContain("makeBackdrop");
    // 仅在 presentation renderer 下铺背景（legacy 回退交回旧呈现）
    expect(src).toMatch(/renderer === "presentation"[\s\S]{0,120}makeBackdrop/);
  });

  it("backdrop covers at least the full design resolution", () => {
    const src = readFileSync(BACKDROP, "utf8");
    // 用设计分辨率的倍数，避免横竖切换露边
    expect(src).toMatch(/width \* 2|opts\.width/);
  });
});

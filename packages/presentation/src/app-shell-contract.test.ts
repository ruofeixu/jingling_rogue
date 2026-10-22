import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SHELL = resolve(REPO, "assets/scripts/app/AppShell.ts");
const VENDOR = resolve(REPO, "assets/scripts/vendor/jinglingPresentation.ts");

function shellSource(): string {
  expect(existsSync(SHELL), `${SHELL} must exist`).toBe(true);
  return readFileSync(SHELL, "utf8");
}

describe("AppShell contract", () => {
  it("ships a generated presentation vendor bundle", () => {
    expect(existsSync(VENDOR), "run pnpm sync:presentation").toBe(true);
    expect(readFileSync(VENDOR, "utf8")).toContain("generated from packages/presentation");
  });

  it("imports the shell model from presentation", () => {
    const src = shellSource();

    expect(src).toContain('from "../vendor/jinglingPresentation"');
    expect(src).toContain("buildViewport");
    expect(src).toContain("selectRenderer");
  });

  /**
   * U4 起壳层需要读 core 只读投影（ADR 的事件流：renderer → AppShell → core command → snapshot）。
   * 允许的只有 select* 投影、emptyAccount、utcDateStamp 与类型；玩法函数一律禁止。
   */
  it("touches core only through read-only selectors", () => {
    const src = shellSource();
    const block = src.match(/import\s*\{([^}]*?)\}\s*from\s*"\.\.\/vendor\/jinglingCore"/);
    if (!block) {
      return;
    }
    const names = block[1]
      .split(",")
      .map((raw) => raw.replace(/^\s*type\s+/, "").trim())
      .filter(Boolean);
    const allowed = /^(select[A-Z]\w*|emptyAccount|utcDateStamp|AccountProgress|SlotSummary|BattleView|NameplateView|BattleCommandView|StarterView|BattleOverlaysView|OverlayItemView|RunProgressView|ProgressRowView|OutcomeView|OutcomeLineView)$/;
    const offenders = names.filter((name) => !allowed.test(name));

    expect(offenders, `disallowed core imports: ${offenders.join(",")}`).toEqual([]);
  });

  it("never makes gameplay decisions", () => {
    const src = shellSource();

    for (const forbidden of ["getSpirit", "beginUiRun", "ClassicSlice", "openBattle", "recordCatch"]) {
      expect(src.includes(forbidden), forbidden).toBe(false);
    }
  });

  it("carries no page layout coordinates", () => {
    const code = shellSource()
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    // 页面坐标属于 renderer；设计分辨率必须来自 presentation 常量而不是字面量。
    const numbers = (code.match(/-?\b\d{2,}\b/g) ?? []).filter((n) => n !== "0");
    expect(numbers, `unexpected layout numbers: ${numbers.join(",")}`).toEqual([]);
    expect(code).toContain("DESIGN_WIDTH");
    expect(code).toContain("DESIGN_HEIGHT");
  });

  it("destroys the previous renderer before mounting the next one", () => {
    const src = shellSource();

    expect(src).toContain("destroy()");
    // 隐藏不等于销毁：禁止用 active=false 来切换 renderer
    expect(src.includes("active = false")).toBe(false);
    expect(src).toMatch(/mountedRenderer|currentRenderer/);
  });

  it("supports both per-page and global fallback", () => {
    const src = shellSource();

    expect(src).toContain("globalLegacyFallback");
    expect(src).toContain("legacy");
    expect(src).toContain("presentation");
  });

  it("keeps the legacy Boot as the product renderer in U1", () => {
    const boot = readFileSync(resolve(REPO, "assets/scripts/Boot.ts"), "utf8");

    // U1 不得让 Boot 依赖壳层，否则产品页行为会被牵动
    expect(boot.includes("AppShell")).toBe(false);
  });
});

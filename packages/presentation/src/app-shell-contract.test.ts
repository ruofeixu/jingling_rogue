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

  it("re-lays out the current page when the window size or orientation changes (B5b)", () => {
    const src = shellSource();
    const body = src.slice(src.indexOf("private onResize("), src.indexOf("private refreshViewport("));
    // 只对诊断页重挂会让产品页停在旧布局上（改窗口后内容缩成一小块或跑出屏幕）。
    expect(body).not.toMatch(/if \(this\.routeId === DIAGNOSTICS_SCREEN_ID \|\| this\.routeId === GALLERY_ROUTE_ID\)/);
    expect(body).toContain("this.route(this.routeId)");
    // 设计尺寸没变就不重挂，避免拖动窗口时每帧重建。
    expect(body).toMatch(/design\.width|sameDesign/);
  });

  it("re-aligns the Canvas and its camera right after changing the design resolution (B5b)", () => {
    // 引擎的 Canvas Widget 不会立刻跟着新设计分辨率走：横屏时 Canvas 仍是 750×1334，画面缩在中间两侧灰边。
    const src = shellSource();
    const body = src.slice(src.indexOf("private refreshViewport("), src.indexOf("private readSafeArea("));
    expect(body).toContain("setDesignResolutionSize");
    expect(body).toContain("updateAlignment");
    expect(body).toContain("_onResizeCamera");
  });

  it("puts the shell on the UI_2D layer instead of inheriting the Boot node's layer", () => {
    // boot.scene 里 Boot 节点在 DEFAULT 层；UI 相机只看 UI_2D / UI_3D。
    // 继承 Boot 的层，整套界面都不会被 UI 相机画出来（预览一片空白）。
    const src = shellSource();

    expect(src).toContain("Layers.Enum.UI_2D");
    expect(src).not.toContain("host.layer = this.node.layer");
  });

  it("keeps the shell on the canvas plane even when Boot hangs under the UI camera", () => {
    // boot.scene 里 Boot 是 UI 相机（z=1000）的子节点；宿主不归零世界 z，整套界面会贴在相机平面上被裁掉。
    const src = shellSource();

    expect(src).toMatch(/setWorldPosition\([^)]*0\)/);
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

  it("launches AppShell from Boot and keeps the legacy draw path behind a flag", () => {
    const boot = readFileSync(resolve(REPO, "assets/scripts/Boot.ts"), "utf8");
    const shell = shellSource();

    expect(boot).toContain("launchProductShell");
    expect(boot).toContain("LEGACY_BOOT = false");
    expect(boot).toContain("AppShell");
    expect(boot).toContain("flashNode(");
    expect(shell).toContain("adoptProductEntry");
    expect(shell).toContain("routeAfterCommand");
  });
});

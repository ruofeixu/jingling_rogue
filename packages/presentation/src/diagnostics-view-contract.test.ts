import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const VIEW = resolve(REPO, "assets/scripts/app/DiagnosticsView.ts");

function viewSource(): string {
  expect(existsSync(VIEW), `${VIEW} must exist`).toBe(true);
  return readFileSync(VIEW, "utf8");
}

/**
 * 诊断视图是 U1 唯一的新 renderer：只把 diagnostics ScreenModel 的行渲染成文本，
 * 用于在实际 Cocos 里看见壳层。它不得含产品文案、玩法依赖或产品页布局。
 */
describe("DiagnosticsView contract", () => {
  it("renders a ScreenModel, not raw shell fields", () => {
    const src = viewSource();

    expect(src).toContain("ScreenModel");
    expect(src).toContain("model.lines");
    expect(src).toContain("model.accessibleName");
  });

  it("has no gameplay dependency", () => {
    const src = viewSource();

    for (const forbidden of ["jinglingCore", "getSpirit", "beginUiRun", "Boot"]) {
      expect(src.includes(forbidden), forbidden).toBe(false);
    }
  });

  it("carries no product copy", () => {
    const src = viewSource();

    for (const word of ["契灵", "精怪", "新的旅途", "短征", "契录", "卵房", "灵糖"]) {
      expect(src.includes(word), word).toBe(false);
    }
  });

  it("cleans up its own nodes", () => {
    const src = viewSource();

    expect(src).toContain("destroy");
  });

  it("is mounted by AppShell for the diagnostics route only", () => {
    const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");

    expect(shell).toContain("DiagnosticsView");
    expect(shell).toContain("DIAGNOSTICS_SCREEN_ID");
  });
});

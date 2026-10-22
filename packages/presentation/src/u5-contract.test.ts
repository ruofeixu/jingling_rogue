import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SCREEN = resolve(REPO, "assets/scripts/app/screens/StarterScreen.ts");

function read(): string {
  expect(existsSync(SCREEN), `${SCREEN} must exist`).toBe(true);
  return readFileSync(SCREEN, "utf8");
}

describe("U5 starter renderer contract", () => {
  it("renders a ScreenModel and reports action ids only", () => {
    const src = read();

    expect(src).toContain("ScreenModel");
    expect(src).toContain("onAction");
    expect(src.includes("resolveAction")).toBe(false);
  });

  it("has no gameplay dependency", () => {
    const src = read();

    for (const forbidden of ["getSpirit", "beginUiRun", "ClassicSlice", "currentCost", "offerRelics"]) {
      expect(src.includes(forbidden), forbidden).toBe(false);
    }
  });

  it("keeps portraits undistorted via portraitFit", () => {
    const src = read();

    expect(src).toContain("portraitFit");
    // 有立绘时不画烘焙垫底：禁止在本文件里画椭圆
    expect(src.includes("ellipse")).toBe(false);
  });

  it("takes visuals from tokens only", () => {
    const src = read();

    expect(src.includes("jinglingPresentation")).toBe(true);
    expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(src)).toBe(false);
    expect(/#[0-9a-fA-F]{6}/.test(src)).toBe(false);
  });

  it("cleans up on unmount", () => {
    const src = read();

    expect(src).toContain("unmount");
    expect(src).toContain("destroy");
  });

  it("is wired into the shell", () => {
    const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");

    expect(shell).toContain("StarterScreen");
    expect(shell).toContain("buildStarterModel");
    expect(shell).toContain("selectStarter");
  });
});

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SCREEN = resolve(REPO, "assets/scripts/app/screens/BattleScreen.ts");

function read(): string {
  expect(existsSync(SCREEN), `${SCREEN} must exist`).toBe(true);
  return readFileSync(SCREEN, "utf8");
}

describe("U6 battle renderer contract", () => {
  it("renders a ScreenModel and reports action ids only", () => {
    const src = read();

    expect(src).toContain("ScreenModel");
    expect(src).toContain("onAction");
    expect(src.includes("resolveAction")).toBe(false);
  });

  it("never computes damage or mutates battle state", () => {
    const src = read();

    for (const forbidden of [
      "applyArt",
      "speciesCatchRate",
      "openBattle",
      "startPartyBattle",
      "choose(",
      ".hp =",
      ".hp -",
      ".hp +",
      "maxHp -",
    ]) {
      expect(src.includes(forbidden), forbidden).toBe(false);
    }
  });

  it("takes visuals from tokens only", () => {
    const src = read();

    expect(src.includes("jinglingPresentation")).toBe(true);
    expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(src)).toBe(false);
    expect(/#[0-9a-fA-F]{6}/.test(src)).toBe(false);
  });

  it("respects reduced motion for hit feedback", () => {
    const src = read();

    expect(src).toContain("motionDurationMs");
    expect(src).toContain("reduceMotion");
  });

  it("cleans up on unmount", () => {
    const src = read();

    expect(src).toContain("unmount");
    expect(src).toContain("destroy");
  });

  it("is wired into the shell", () => {
    const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");

    expect(shell).toContain("BattleScreen");
    expect(shell).toContain("buildBattleModel");
    expect(shell).toContain("selectBattle");
  });
});

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const FILES = {
  title: resolve(REPO, "assets/scripts/app/screens/TitleScreen.ts"),
  mode: resolve(REPO, "assets/scripts/app/screens/ModeScreen.ts"),
};

function read(path: string): string {
  expect(existsSync(path), `${path} must exist`).toBe(true);
  return readFileSync(path, "utf8");
}

describe("U3 screen renderer contract", () => {
  it("renders a ScreenModel and reports action ids only", () => {
    for (const [name, path] of Object.entries(FILES)) {
      const src = read(path);
      expect(src, name).toContain("ScreenModel");
      expect(src, name).toContain("onAction");
      // renderer 不得自己解析意图，只回传 id
      expect(src.includes("resolveAction"), `${name} must not resolve intents`).toBe(false);
    }
  });

  it("has no gameplay dependency and no product state mutation", () => {
    for (const [name, path] of Object.entries(FILES)) {
      const src = read(path);
      for (const forbidden of ["jinglingCore", "getSpirit", "beginUiRun", "emptyAccount", "ClassicSlice"]) {
        expect(src.includes(forbidden), `${name} -> ${forbidden}`).toBe(false);
      }
    }
  });

  it("takes visuals from U2 components and tokens", () => {
    for (const [name, path] of Object.entries(FILES)) {
      const src = read(path);
      expect(src.includes("jinglingPresentation"), `${name} tokens`).toBe(true);
      expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(src), `${name} hardcodes rgb`).toBe(false);
      expect(/#[0-9a-fA-F]{6}/.test(src), `${name} hardcodes hex`).toBe(false);
    }
  });

  it("cleans up on unmount", () => {
    for (const [name, path] of Object.entries(FILES)) {
      const src = read(path);
      expect(src, name).toContain("unmount");
      expect(src, name).toContain("destroy");
    }
  });

  it("is wired into the shell with per-page manifest selection", () => {
    const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");

    expect(shell).toContain("TitleScreen");
    expect(shell).toContain("ModeScreen");
    expect(shell).toContain("resolveAction");
    expect(shell).toContain("selectRenderer");
  });

  it("keeps Boot from drawing presentation pages itself", () => {
    const boot = readFileSync(resolve(REPO, "assets/scripts/Boot.ts"), "utf8");

    expect(boot).toContain("LEGACY_BOOT = false");
    expect(boot.includes("jinglingPresentation")).toBe(false);
  });
});

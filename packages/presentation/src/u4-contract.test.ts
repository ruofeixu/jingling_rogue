import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const LIST = resolve(REPO, "assets/scripts/app/ui/ListView.ts");
const LOBBY = resolve(REPO, "assets/scripts/app/screens/LobbyScreen.ts");

function read(path: string): string {
  expect(existsSync(path), `${path} must exist`).toBe(true);
  return readFileSync(path, "utf8");
}

describe("U4 shared shell contract", () => {
  it("keeps the list shell free of per-page business logic", () => {
    const src = read(LIST);

    expect(src).toContain("ScreenModel");
    // 共享壳不得出现单页业务判断
    for (const forbidden of ["codex", "eggs", "slots", "achievements", "glossary", "settings"]) {
      expect(src.includes(forbidden), `ListView mentions ${forbidden}`).toBe(false);
    }
  });

  it("renders every lobby page through the shared shell", () => {
    const src = read(LOBBY);

    expect(src).toContain("ListView");
    expect(src).toContain("ScreenModel");
    expect(src).toContain("onAction");
  });

  it("has no gameplay dependency in either file", () => {
    for (const path of [LIST, LOBBY]) {
      const src = read(path);
      for (const forbidden of ["jinglingCore", "getSpirit", "beginUiRun", "emptyAccount", "selectCodexList"]) {
        expect(src.includes(forbidden), `${path} -> ${forbidden}`).toBe(false);
      }
    }
  });

  it("takes visuals from tokens only", () => {
    for (const path of [LIST, LOBBY]) {
      const src = read(path);
      expect(src.includes("jinglingPresentation"), path).toBe(true);
      expect(/new Color\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(src), `${path} hardcodes rgb`).toBe(false);
      expect(/#[0-9a-fA-F]{6}/.test(src), `${path} hardcodes hex`).toBe(false);
    }
  });

  it("cleans up on unmount", () => {
    for (const path of [LIST, LOBBY]) {
      const src = read(path);
      expect(src, path).toContain("unmount");
      // 自己销毁节点，或者把销毁委托给子视图，两者其一即可
      const cleans = src.includes("destroy") || /\.\s*unmount\(\)/.test(src);
      expect(cleans, `${path} must destroy its nodes or delegate unmount`).toBe(true);
    }
  });

  it("is wired into the shell for the eight lobby routes", () => {
    const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");

    expect(shell).toContain("LobbyScreen");
    for (const id of [
      "settings",
      "codex-list",
      "codex-entry",
      "eggs",
      "achievements",
      "stats",
      "slots",
      "glossary",
    ]) {
      expect(shell.includes(id), `shell route ${id}`).toBe(true);
    }
  });
});

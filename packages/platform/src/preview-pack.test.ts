import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assemblePreviewPacks } from "./preview-pack.ts";

const SUBPACKAGES = ["bundle-battle", "bundle-realm-wilds", "bundle-realm-woods"];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...walk(path));
    } else {
      out.push(path);
    }
  }
  return out;
}

describe("minigame preview packs", () => {
  it("wx and tt preview packs are portrait with the three subpackages and no portraits", () => {
    const root = mkdtempSync(join(tmpdir(), "jingling-pack-"));
    const packs = assemblePreviewPacks(root);
    for (const kind of ["wechatgame", "bytedance-mini-game"] as const) {
      const dest = packs[kind];
      const game = JSON.parse(readFileSync(join(dest, "game.json"), "utf8")) as {
        deviceOrientation: string;
        subpackages: { name: string }[];
      };
      expect(game.deviceOrientation).toBe("portrait");
      expect(game.subpackages.map((row) => row.name).sort()).toEqual([...SUBPACKAGES].sort());
      expect(readFileSync(join(dest, "game.js"), "utf8").length).toBeGreaterThan(20);
      expect(walk(dest).some((path) => path.endsWith(".png"))).toBe(false);
    }
  });

  it("ships a canvas lobby with 契灵志怪 and 新的旅途, not only a ready log", () => {
    const root = mkdtempSync(join(tmpdir(), "jingling-lobby-"));
    const packs = assemblePreviewPacks(root);
    for (const kind of ["wechatgame", "bytedance-mini-game"] as const) {
      const js = readFileSync(join(packs[kind], "game.js"), "utf8");
      expect(js).toContain("契灵志怪");
      expect(js).toContain("新的旅途");
      expect(js).toContain("createCanvas");
      expect(js).toContain("fillText");
      expect(js).not.toContain("#1a1410");
      expect(js).toContain("rgb(232,244,252)");
    }
  });
});

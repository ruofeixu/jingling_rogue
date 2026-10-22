import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SCREEN_MANIFEST,
  isPresentationOwned,
  selectRenderer,
  withRenderer,
} from "./manifest.ts";

const matrixPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../docs/ui/screen-matrix.json",
);

function matrixIds(): string[] {
  const raw = JSON.parse(readFileSync(matrixPath, "utf8")) as { id: string }[];
  return raw.map((row) => row.id);
}

describe("screen manifest", () => {
  it("covers exactly the ids in docs/ui/screen-matrix.json", () => {
    const ids = matrixIds().sort();
    const manifestIds = Object.keys(SCREEN_MANIFEST).sort();

    expect(manifestIds).toEqual(ids);
  });

  it("owns migrated pages with presentation, everything else legacy", () => {
    const migrated = new Set([
      "title",
      "mode",
      "settings",
      "codex-list",
      "codex-entry",
      "eggs",
      "achievements",
      "stats",
      "slots",
      "glossary",
      "starter",
      "battle",
      "arts",
      "switch",
      "party",
      "bag",
      "target",
      "catch",
      "summary",
      "shop",
      "omen",
      "map",
      "defeat",
      "victory",
      "hatch",
    ]);
    for (const [id, entry] of Object.entries(SCREEN_MANIFEST)) {
      const expected = migrated.has(id) ? "presentation" : "legacy";
      expect(entry.renderer, id).toBe(expected);
      expect(isPresentationOwned(id), id).toBe(migrated.has(id));
    }
  });

  it("resolves a renderer per screen", () => {
    // U9 起 25 个产品面全部迁移；legacy 只能通过逐页回退或全局回退得到。
    expect(selectRenderer("title")).toBe("presentation");
    expect(selectRenderer("victory")).toBe("presentation");
    expect(selectRenderer("victory", withRenderer("victory", "legacy"))).toBe("legacy");
  });

  it("rejects unknown screen ids", () => {
    expect(() => selectRenderer("not-a-screen")).toThrow(/unknown screen/);
    expect(() => withRenderer("not-a-screen", "presentation")).toThrow(/unknown screen/);
  });

  it("keeps a single renderer owner when a page is switched", () => {
    const switched = withRenderer("victory", "legacy");

    expect(switched.victory.renderer).toBe("legacy");
    expect(isPresentationOwned("victory", switched)).toBe(false);
    expect(selectRenderer("victory", switched)).toBe("legacy");
    // 其他页不受影响，且原 manifest 不被就地修改
    expect(switched.defeat.renderer).toBe("presentation");
    expect(SCREEN_MANIFEST.victory.renderer).toBe("presentation");
  });

  it("can roll a migrated page back to legacy per page", () => {
    const rolledBack = withRenderer("title", "legacy");

    expect(rolledBack.title.renderer).toBe("legacy");
    expect(isPresentationOwned("title", rolledBack)).toBe(false);
    // 原 manifest 仍是 presentation，回退不就地污染默认值
    expect(SCREEN_MANIFEST.title.renderer).toBe("presentation");
  });

  it("supports a global legacy fallback that wins over per-page choices", () => {
    const switched = withRenderer("title", "presentation");

    expect(selectRenderer("title", switched, { globalLegacyFallback: true })).toBe("legacy");
  });

  it("rejects an invalid renderer value", () => {
    // @ts-expect-error 运行时守卫必须存在
    expect(() => withRenderer("title", "canvas")).toThrow(/renderer/);
  });
});

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAction } from "./dispatch.ts";
import { NAV_BACK_PREFIX, backActionFor, backButtonLayout } from "./nav-back.ts";
import { buildResponsiveFrame } from "./responsive.ts";
import { buildViewport } from "./viewport.ts";
import { inside } from "./layout/box.ts";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel: string): string {
  const path = resolve(REPO, rel);
  expect(existsSync(path), path).toBe(true);
  return readFileSync(path, "utf8");
}

describe("back navigation (B5c fix)", () => {
  it("gives every dead-end page a way back", () => {
    for (const route of ["mode", "settings", "codex-list", "eggs", "achievements", "stats", "slots", "glossary"]) {
      const action = backActionFor(route);
      expect(action, route).not.toBeNull();
      expect(action?.id, route).toBe(`${NAV_BACK_PREFIX}title`);
      expect(action?.label, route).toBe("返回");
    }
    // 详情页回到列表，而不是直接回标题。
    expect(backActionFor("codex-entry")?.id).toBe(`${NAV_BACK_PREFIX}codex-list`);
  });

  it("does not add a back button where a page already owns navigation", () => {
    for (const route of ["title", "starter", "battle", "shop", "map", "omen", "summary", "victory", "defeat", "arts"]) {
      expect(backActionFor(route), route).toBeNull();
    }
  });

  it("resolves a back action to a pure route intent", () => {
    expect(resolveAction(`${NAV_BACK_PREFIX}title`)).toEqual({ kind: "route", to: "title" });
    expect(resolveAction(`${NAV_BACK_PREFIX}codex-list`)).toEqual({ kind: "route", to: "codex-list" });
  });

  it("places the back button inside the screen, at the bottom, at every size", () => {
    for (const size of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
      { width: 320, height: 568 },
    ]) {
      const frame = buildResponsiveFrame(buildViewport(size));
      const box = backButtonLayout(frame);

      expect(inside(box, frame.content.width, frame.content.height), `${size.width}x${size.height}`).toBe(true);
      expect(box.y, `${size.width}x${size.height}`).toBeLessThan(0);
      expect(box.height).toBeGreaterThanOrEqual(88);
    }
  });

  it("mounts the back button from the shell for those pages", () => {
    const shell = read("assets/scripts/app/AppShell.ts");

    expect(shell).toContain("mountBack");
    expect(shell).toContain("backActionFor");
    expect(shell).toContain("backButtonLayout");
  });
});

describe("ink wash is ready on the first page change (B5d fix)", () => {
  it("preloads the effect as soon as the ui-art bundle is up", () => {
    const skin = read("assets/scripts/app/ui/UiSkin.ts");

    expect(skin).toContain("requestInkEffect");
    // load() 成功后立刻预取，而不是等到第一次转场才开始加载。
    expect(skin).toMatch(/this\.bundle = bundle;[\s\S]{0,200}this\.requestInkEffect\(\)/);
  });
});

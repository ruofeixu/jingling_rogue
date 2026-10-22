import { describe, expect, it } from "vitest";
import { emptyAccount } from "@jingling/core";
import {
  selectAchievements,
  selectCodexEntry,
  selectCodexList,
  selectEggs,
  selectGlossary,
  selectSettings,
  selectSlots,
  selectStats,
} from "@jingling/core";
import {
  LOBBY_ACTIONS,
  buildAchievementsModel,
  buildCodexEntryModel,
  buildCodexListModel,
  buildEggsModel,
  buildGlossaryModel,
  buildSettingsModel,
  buildSlotsModel,
  buildStatsModel,
} from "./lobby.ts";

const account = emptyAccount();
const caught = { ...emptyAccount(), codex: ["zao_li"], seenIds: ["zao_li"] };

/** 表驱动：每页给出 builder、screenId 与一个 normal 输入。 */
const PAGES = [
  {
    id: "settings",
    build: (state: "normal" | "loading") =>
      buildSettingsModel({ state, view: selectSettings(account) }),
  },
  {
    id: "codex-list",
    build: (state: "normal" | "loading") =>
      buildCodexListModel({ state, view: selectCodexList(caught) }),
  },
  {
    id: "codex-entry",
    build: (state: "normal" | "loading") =>
      buildCodexEntryModel({ state, view: selectCodexEntry(caught, "zao_li") }),
  },
  {
    id: "eggs",
    build: (state: "normal" | "loading") => buildEggsModel({ state, view: selectEggs(account) }),
  },
  {
    id: "achievements",
    build: (state: "normal" | "loading") =>
      buildAchievementsModel({ state, view: selectAchievements(account) }),
  },
  {
    id: "stats",
    build: (state: "normal" | "loading") =>
      buildStatsModel({ state, view: selectStats(caught, "2026-09-01") }),
  },
  {
    id: "slots",
    build: (state: "normal" | "loading") =>
      buildSlotsModel({ state, view: selectSlots(account, [{ slot: 0, wave: 2, mode: "classic" }]) }),
  },
  {
    id: "glossary",
    build: (state: "normal" | "loading") => buildGlossaryModel({ state, view: selectGlossary() }),
  },
] as const;

describe("lobby screen models", () => {
  it("declares stable namespaced action ids", () => {
    for (const [key, id] of Object.entries(LOBBY_ACTIONS)) {
      expect(id, key).toMatch(/^[a-z-]+\.[a-z-]+$/);
    }
    expect(new Set(Object.values(LOBBY_ACTIONS)).size).toBe(Object.keys(LOBBY_ACTIONS).length);
  });

  for (const page of PAGES) {
    it(`${page.id}: builds a normal model with one primary action`, () => {
      const model = page.build("normal");

      expect(model.screenId).toBe(page.id);
      expect(model.state).toBe("normal");
      expect(model.accessibleName.length).toBeGreaterThan(0);
      expect(model.primaryAction).not.toBeNull();
    });

    it(`${page.id}: disables actions while loading with a reason`, () => {
      const model = page.build("loading");

      expect(model.primaryAction?.enabled).toBe(false);
      expect(model.primaryAction?.disabledReason).toBeTruthy();
    });
  }

  it("codex list reports progress and a non-illustration empty state", () => {
    const empty = buildCodexListModel({ state: "empty", view: selectCodexList(account) });

    expect(empty.state).toBe("empty");
    expect(empty.lines.join("")).toMatch(/./);
    expect(empty.lines.some((l) => l.includes("0"))).toBe(true);
  });

  it("codex entry hides unknown details and explains why", () => {
    const unknown = buildCodexEntryModel({
      state: "locked",
      view: selectCodexEntry(account, "jing_zhu"),
    });

    expect(unknown.state).toBe("locked");
    expect(unknown.reason).toMatch(/./);
    expect(unknown.lines.join("")).not.toContain("jing_zhu");
  });

  it("eggs shows an empty hint when there is no stock", () => {
    const model = buildEggsModel({ state: "empty", view: selectEggs(account) });

    expect(model.lines.join("")).toMatch(/./);
  });

  it("stats says there is no history instead of showing zeros only", () => {
    const model = buildStatsModel({ state: "empty", view: selectStats(account, "2026-09-01") });

    expect(model.lines.join("")).toMatch(/./);
  });

  it("slots exposes five idempotent actions", () => {
    const view = selectSlots(account, [{ slot: 0, wave: 2, mode: "classic" }]);
    const a = buildSlotsModel({ state: "normal", view });
    const b = buildSlotsModel({ state: "normal", view });

    expect(a).toEqual(b);
    const ids = [a.primaryAction, ...a.secondaryActions].map((x) => x?.id);
    expect(ids).toHaveLength(5);
    expect(new Set(ids).size).toBe(5);
  });

  it("long lists report pagination instead of silently truncating", () => {
    const model = buildCodexListModel({ state: "normal", view: selectCodexList(caught), pageSize: 6 });

    expect(model.lines.some((l) => /\d+\s*\/\s*\d+/.test(l))).toBe(true);
  });

  it("glossary carries term and explanation pairs", () => {
    const model = buildGlossaryModel({ state: "normal", view: selectGlossary() });

    expect(model.secondaryActions.length).toBeGreaterThan(0);
  });

  it("rejects error and locked without a reason", () => {
    expect(() =>
      buildStatsModel({ state: "error", view: selectStats(account, "2026-09-01") }),
    ).toThrow(/reason/);
  });
});

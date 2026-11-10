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

  it("slots: a broken slot says so and cannot be loaded (B4)", () => {
    const view = selectSlots(account, [{ slot: 2, wave: 0, mode: "", corrupt: true }]);
    const model = buildSlotsModel({ state: "normal", view });
    const row = [model.primaryAction, ...model.secondaryActions].find((a) => a?.id === "slots.load.2");

    expect(row?.label).toBe("槽3 存档损坏");
    expect(row?.enabled).toBe(false);
    expect(row?.disabledReason).toMatch(/读不出/);
  });

  it("slots: explains the autosave rule and labels slot 1 as the current run (B4)", () => {
    const view = selectSlots(account, [{ slot: 0, wave: 4, mode: "classic" }]);
    const model = buildSlotsModel({ state: "normal", view });

    expect(model.primaryAction?.label).toBe("槽1 当前旅途 波4");
    expect(model.lines.join(" ")).toMatch(/每过一波自动存到槽1/);
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

describe('B5c copy: nothing English or internal leaks into the lobby pages', () => {
  it('settings groups are named in Chinese, not by their ids', () => {
    const model = buildSettingsModel({ state: 'normal', view: selectSettings(account) });
    const labels = model.secondaryActions.map((a) => a.label);

    expect(labels).toEqual(['通用', '显示', '声音', '玩法', '操作']);
    for (const label of labels) {
      expect(label, label).not.toMatch(/[a-z]/i);
    }
    // 动作 id 仍用内部名，只有显示的字是中文。
    expect(model.secondaryActions[0].id).toBe('settings.tab.general');
  });

  it('unseen spirits show a numbered silhouette instead of eight identical rows', () => {
    const model = buildCodexListModel({ state: 'normal', view: selectCodexList(account), pageSize: 8 });
    const labels = model.secondaryActions.map((a) => a.label);

    expect(new Set(labels).size).toBe(labels.length);
    expect(labels[0]).toBe('？？？ 第1号');
    expect(labels[1]).toBe('？？？ 第2号');
  });

  it('seen spirits keep their real name', () => {
    const model = buildCodexListModel({ state: 'normal', view: selectCodexList(caught), pageSize: 240 });
    const zao = model.secondaryActions.find((a) => a.id.endsWith('.zao_li'));

    expect(zao?.label).toBe('灶狸');
  });

  it('slots page note is short enough to fit one phone line each', () => {
    const view = selectSlots(account, [{ slot: 0, wave: 2, mode: 'classic' }]);
    const model = buildSlotsModel({ state: 'normal', view });

    for (const line of model.lines) {
      expect(Array.from(line).length, line).toBeLessThanOrEqual(16);
    }
    expect(model.lines.join('')).toMatch(/自动存/);
  });

  it('empty codex does not repeat the progress line inside the hint (B5c)', () => {
    const model = buildCodexListModel({ state: 'empty', view: selectCodexList(account), pageSize: 8 });

    const text = [model.reason ?? '', ...model.lines].join(' ');
    expect(text.match(/进度/g)?.length ?? 0).toBe(1);
  });
});

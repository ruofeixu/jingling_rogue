import { describe, expect, it } from "vitest";
import { emptyAccount } from "../run/run-session.ts";
import {
  selectAchievements,
  selectCodexEntry,
  selectCodexList,
  selectEggs,
  selectGlossary,
  selectSettings,
  selectSlots,
  selectStats,
} from "./selectors.ts";

function frozenDeep(value: unknown, path = "root"): void {
  if (value === null || typeof value !== "object") {
    return;
  }
  expect(Object.isFrozen(value), path).toBe(true);
  if (Array.isArray(value)) {
    value.forEach((item, i) => frozenDeep(item, `${path}[${i}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    expect(typeof child, `${path}.${key}`).not.toBe("function");
    frozenDeep(child, `${path}.${key}`);
  }
}

describe("ui selectors", () => {
  const account = emptyAccount();

  it("returns deep-frozen read-only view data", () => {
    frozenDeep(selectSettings(account), "settings");
    frozenDeep(selectCodexList(account), "codex");
    frozenDeep(selectEggs(account), "eggs");
    frozenDeep(selectAchievements(account), "achievements");
    frozenDeep(selectStats(account, "2026-09-01"), "stats");
    frozenDeep(selectSlots(account, []), "slots");
    frozenDeep(selectGlossary(), "glossary");
  });

  it("is deterministic for the same snapshot", () => {
    expect(selectCodexList(account)).toEqual(selectCodexList(account));
    expect(selectStats(account, "2026-09-01")).toEqual(selectStats(account, "2026-09-01"));
  });

  it("marks an untouched account as empty where it matters", () => {
    expect(selectCodexList(account).caught).toBe(0);
    expect(selectCodexList(account).isEmpty).toBe(true);
    expect(selectEggs(account).slots).toHaveLength(0);
    expect(selectEggs(account).isEmpty).toBe(true);
    expect(selectStats(account, "2026-09-01").hasHistory).toBe(false);
    expect(selectAchievements(account).earned).toBe(0);
  });

  it("exposes settings tabs and current values without leaking the mutable object", () => {
    const view = selectSettings(account);

    expect(view.tabs.length).toBeGreaterThan(0);
    expect(view.values).not.toBe(account.settings);
    expect(Object.isFrozen(view.values)).toBe(true);
  });

  it("keeps every codex row's status from core, never guessed", () => {
    const view = selectCodexList(account);

    expect(view.rows.length).toBeGreaterThan(0);
    for (const row of view.rows) {
      expect(["unknown", "seen", "caught"]).toContain(row.status);
    }
  });

  it("hides unknown codex details instead of leaking data", () => {
    const rows = selectCodexList(account).rows;
    const unknownId = rows.find((r) => r.status === "unknown")?.id as string;
    const entry = selectCodexEntry(account, unknownId);

    expect(entry.status).toBe("unknown");
    expect(entry.name).toBe("未知");
    expect(entry.affinities).toEqual([]);
    expect(entry.lockedReason).toMatch(/./);
  });

  it("reveals a caught codex entry", () => {
    const caught = { ...emptyAccount(), codex: ["zao_li"], seenIds: ["zao_li"] };
    const entry = selectCodexEntry(caught, "zao_li");

    expect(entry.status).toBe("caught");
    expect(entry.name).not.toBe("未知");
    expect(entry.affinities.length).toBeGreaterThan(0);
    expect(entry.lockedReason).toBeNull();
  });

  it("rejects an unknown spirit id", () => {
    expect(() => selectCodexEntry(account, "not-a-spirit")).toThrow(/unknown spirit/);
  });

  it("reports five save slots with occupancy", () => {
    const view = selectSlots(account, [{ slot: 1, wave: 3, mode: "classic" }]);

    expect(view.slots).toHaveLength(5);
    expect(view.slots[1].occupied).toBe(true);
    expect(view.slots[1].wave).toBe(3);
    expect(view.slots[0].occupied).toBe(false);
    expect(view.isEmpty).toBe(false);
  });

  it("lists glossary terms with explanations", () => {
    const view = selectGlossary();

    expect(view.terms.length).toBeGreaterThan(0);
    for (const term of view.terms) {
      expect(term.term.length).toBeGreaterThan(0);
      expect(term.explain.length).toBeGreaterThan(0);
    }
  });

  it("does not mutate the account it reads", () => {
    const before = JSON.stringify(account);
    selectCodexList(account);
    selectStats(account, "2026-09-01");
    selectAchievements(account);
    expect(JSON.stringify(account)).toBe(before);
  });
});

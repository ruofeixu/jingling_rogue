import { describe, expect, it } from "vitest";
import { dailySeed, utcDateStamp } from "./daily.ts";
import { invertMul, blankParty } from "./challenge.ts";
import { affinityMod } from "../../combat/damage.ts";
import { loadTables } from "../../tables/load-tables.ts";
import { createRun, nextEncounter, emptyAccount, recordDailyScore, bestDailyScore, statsLog } from "../run-session.ts";
import { ClassicSlice } from "../classic-slice.ts";
import { isUnlocked, UNLOCK_IDS } from "./unlocks.ts";
import { costCap, modeRules } from "./types.ts";

describe("modes", () => {
  it("keeps the same daily seed sequence for the same UTC date", () => {
    const a = dailySeed("2026-08-18", "salt");
    const b = dailySeed("2026-08-18", "salt");
    const c = dailySeed("2026-08-19", "salt");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    const foes = (seed: string) => {
      const run = createRun({ seed, starterId: "zao_li", mode: "daily" });
      return [1, 2, 3].map((wave) => {
        run.wave = wave;
        return nextEncounter(run).foeId;
      });
    };
    expect(foes(a)).toEqual(foes(b));
  });

  it("makes flame hit tide 2x under invert", () => {
    const chart = loadTables().typeChart;
    expect(affinityMod("flame", ["tide"], chart)).toBe(0.5);
    expect(invertMul(affinityMod("flame", ["tide"], chart))).toBe(2);
    expect(affinityMod("flame", ["tide"], chart, true)).toBe(2);
  });

  it("shifts realm at endless wave 6 without a full heal", () => {
    const slice = new ClassicSlice({ seed: "end-6", starterId: "zao_li", mode: "endless" });
    expect(costCap("endless")).toBe(15);
    expect(slice.run.costCap).toBe(15);
    slice.run.wave = 5;
    slice.run.partyHpRatios = [0.4];
    const from = slice.run.realmId;
    slice.beginWave();
    slice.noteWin();
    slice.takeBoon(slice.boonChoices[0].id);
    expect(slice.run.wave).toBe(6);
    expect(slice.run.realmId).not.toBe(from);
    expect(slice.run.partyHpRatios[0]).toBe(0.4);
  });

  it("grants one night mark when endless clears wave 50", () => {
    const slice = new ClassicSlice({ seed: "end-50", starterId: "zao_li", mode: "endless" });
    slice.run.wave = 50;
    slice.beginWave();
    slice.noteWin();
    slice.takeBoon(slice.boonChoices[0].id);
    expect(slice.run.nightMarks).toHaveLength(1);
  });

  it("starts 白纸 with only the three starters", () => {
    const run = createRun({
      seed: "blank-1",
      starterId: "zao_li",
      mode: "challenge",
      challenges: ["blank"],
    });
    expect(run.partyIds).toEqual(blankParty());
    expect(run.partyIds).toHaveLength(3);
  });

  it("lists seven unlocks gated on classic clear", () => {
    expect(UNLOCK_IDS).toHaveLength(7);
    expect(isUnlocked("endless", { classicCleared: false, fusedClear: false, carryBaby: false, legendCatchReady: false })).toBe(false);
    expect(isUnlocked("endless", { classicCleared: true, fusedClear: false, carryBaby: false, legendCatchReady: false })).toBe(true);
  });

  it("requires a relic and ends a sprint at wave 20", () => {
    expect(() => createRun({ seed: "sprint-0", starterId: "zao_li", sprint: true })).toThrow(/relic/);
    const slice = new ClassicSlice({
      seed: "sprint-20",
      starterId: "zao_li",
      sprint: true,
      relicId: "kiln_purse",
    });
    expect(slice.run.sprint).toBe(true);
    expect(slice.run.relicIds).toContain("kiln_purse");
    slice.run.wave = 20;
    expect(slice.beginWave().finale).toBe(true);
    slice.noteWin();
    expect(slice.phase).toBe("victory");
  });

  it("gives each of the five modes a distinct public rule fingerprint", () => {
    const modes = ["classic", "daily", "endless", "spliced", "challenge"] as const;
    const keys = modes.map((mode) => JSON.stringify(modeRules(mode)));
    expect(new Set(keys).size).toBe(5);
  });

  it("forbids shop buys in daily and fuses the spliced starter", () => {
    const daily = new ClassicSlice({ seed: "daily-buy", starterId: "zao_li", mode: "daily" });
    daily.beginWave();
    expect(daily.run.partyIds).toHaveLength(3);
    expect(daily.run.partyLevels[0]).toBe(20);
    expect(() => daily.buyStock("small_draught")).toThrow(/shop/);
    const spliced = createRun({ seed: "fuse-1", starterId: "zao_li", mode: "spliced" });
    const endless = createRun({ seed: "fuse-1", starterId: "zao_li", mode: "endless" });
    expect(spliced.fusedIds.length).toBeGreaterThan(0);
    expect(endless.fusedIds).toEqual([]);
  });

  it("keeps the best daily wave for a UTC date and isolates the next day", () => {
    const account = emptyAccount();
    recordDailyScore(account, "2026-08-18", 12);
    recordDailyScore(account, "2026-08-18", 30);
    recordDailyScore(account, "2026-08-18", 20);
    recordDailyScore(account, "2026-08-19", 8);
    expect(bestDailyScore(account, "2026-08-18")).toBe(30);
    expect(bestDailyScore(account, "2026-08-19")).toBe(8);
    expect(bestDailyScore(account, "2026-08-20")).toBe(0);
    expect(statsLog(account, "2026-08-18")).toContain("今日试炼最高波 30");
    const today = utcDateStamp();
    const slice = new ClassicSlice({ seed: dailySeed(today), starterId: "zao_li", mode: "daily", account });
    slice.run.wave = 14;
    slice.noteLoss();
    expect(bestDailyScore(slice.account, today)).toBeGreaterThanOrEqual(14);
    slice.run.wave = 40;
    slice.noteLoss();
    expect(bestDailyScore(slice.account, today)).toBe(40);
  });
});

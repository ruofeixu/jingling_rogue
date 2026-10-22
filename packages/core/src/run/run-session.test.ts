import { describe, expect, it } from "vitest";
import { applyBoon, codexStatus, createRun, nextEncounter, pickBoon, recordCatch, recordSeen, sumBoonStats, waveGoldReward } from "./run-session.ts";
import { decodeAccount, decodeRun, encodeAccount, encodeRun } from "../save/codec.ts";
import { loadTables } from "../tables/load-tables.ts";

describe("classic 200-wave run", () => {
  it("starts in 镇墟, trains on wave 5, and ends at 200", () => {
    const run = createRun({ seed: "classic-1", starterId: "zao_li" });
    expect(run.wave).toBe(1);
    expect(run.realmId).toBe("town_ruins");
    run.wave = 10;
    const boss = nextEncounter(run);
    expect(boss.boss).toBe(true);
    expect(boss.shields).toBe(0);
    run.wave = 5;
    const disciple = nextEncounter(run);
    expect(disciple.kind).toBe("trainer");
    run.wave = 6;
    expect(nextEncounter(run).kind).toBe("wild");
    run.wave = 200;
    const finale = nextEncounter(run);
    expect(finale.kind).toBe("legend");
    expect(finale.finale).toBe(true);
    expect(run.realmId).toBe("void");
  });

  it("offers three boons from the table", () => {
    const run = createRun({ seed: "boons-1", starterId: "jing_zhu" });
    const choices = pickBoon(run);
    expect(choices).toHaveLength(3);
    expect(new Set(choices.map((c) => c.id)).size).toBe(3);
    const tables = loadTables();
    for (const choice of choices) {
      expect(tables.boons.some((b) => b.id === choice.id)).toBe(true);
    }
  });

  it("writes caught spirits into the account codex", () => {
    const run = createRun({ seed: "codex-1", starterId: "tao_geng" });
    const account = recordCatch(run, "luan_shi");
    expect(account.codex).toContain("tao_geng");
    expect(account.codex).toContain("luan_shi");
  });

  it("marks a wild foe seen without catching it", () => {
    const run = createRun({ seed: "seen-1", starterId: "zao_li" });
    const account = recordSeen(run, "luan_shi");
    expect(account.seenIds).toContain("luan_shi");
    expect(account.codex).not.toContain("luan_shi");
    expect(codexStatus(account, "luan_shi")).toBe("seen");
    expect(codexStatus(account, "zao_li")).toBe("caught");
  });

  it("keeps early wild waves on first-stage spirits", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const run = createRun({ seed: `stage-${seed}`, starterId: "zao_li" });
      for (const wave of [1, 8, 10]) {
        run.wave = wave;
        const encounter = nextEncounter(run);
        expect(loadTables().spirits.some((row) => row.evolveTo === encounter.foeId)).toBe(false);
      }
    }
  });

  it("sums attack boons for the party", () => {
    expect(sumBoonStats(["iron_claw", "gourd_life"])).toEqual({ atk: 4, def: 0, spd: 0, hp: 12 });
  });

  it("turns exp boons into luck and pays gold after a win", () => {
    const run = createRun({ seed: "exp-1", starterId: "zao_li" });
    applyBoon(run, "lesson_scroll");
    expect(run.luck).toBe(1);
    expect(run.boonIds).toContain("lesson_scroll");
    expect(waveGoldReward(1, false)).toBe(12);
    expect(waveGoldReward(1, true)).toBe(24);
  });

  it("keeps the first ten waves as singles", () => {
    const run = createRun({ seed: "dual-1", starterId: "zao_li" });
    run.lures = [{ id: "lure_gold", remaining: 10, rate: 1 }];
    run.forceDual = true;
    expect(nextEncounter(run).dual).toBe(false);
    expect(run.forceDual).toBe(true);
    run.wave = 11;
    run.realmId = "wilds";
    expect(nextEncounter(run).dual).toBe(true);
    expect(run.forceDual).toBe(false);
  });

  it("round-trips account and run saves", () => {
    const run = createRun({ seed: "save-1", starterId: "zao_li" });
    run.wave = 12;
    run.gold = 40;
    const account = recordCatch(run, "jing_zhu");
    const runAgain = decodeRun(encodeRun(run));
    const accountAgain = decodeAccount(encodeAccount(account));
    expect(runAgain.wave).toBe(12);
    expect(runAgain.gold).toBe(40);
    expect(accountAgain.codex).toEqual(account.codex);
    expect(accountAgain.dailyScores).toEqual(account.dailyScores);
  });
});

import { describe, expect, it } from "vitest";
import { observeBattle } from "./observe.ts";
import { runSim } from "./run-sim.ts";
import { startPartyBattle } from "../combat/party-battle.ts";
import { ClassicSlice } from "../run/classic-slice.ts";
import { encounterLevel, partyBattleKind } from "../run/classic-schedule.ts";
import { catchModifier, sumBoonStats } from "../run/run-session.ts";

function enter(slice: ClassicSlice) {
  const encounter = slice.encounter ?? slice.beginWave();
  return startPartyBattle({
    partyIds: slice.run.partyIds,
    foeId: encounter.foeId,
    foeIds: encounter.foeIds,
    level: encounterLevel(slice.run.wave),
    seed: `${slice.run.seed}-w${slice.run.wave}`,
    kind: partyBattleKind(encounter.kind),
    potions: slice.run.potions,
    seals: slice.run.seals,
    catchable: encounter.catchable,
    catchBoon: catchModifier(slice.run),
    statBonus: sumBoonStats(slice.run.boonIds),
    shields: encounter.shields,
  });
}

describe("headless sim observe", () => {
  it("shows gold, hp, and remaining focus, not hidden base atk", () => {
    const slice = new ClassicSlice({ seed: "obs-1", starterId: "zao_li" });
    slice.beginWave();
    const view = observeBattle(slice, enter(slice));
    expect(view.wave).toBe(1);
    expect(view.gold).toBe(1000);
    expect(view.party[0]?.hp).toBeGreaterThan(0);
    expect(view.party[0]?.arts[0]?.focus).toBeGreaterThan(0);
    expect(JSON.stringify(view)).not.toMatch(/baseAtk/);
  });
});

describe("headless sim run", () => {
  it("replays the same seed with the low policy", () => {
    const a = runSim({ seed: "sim-low-1", tier: "low", maxWaves: 8, maxActions: 400 });
    const b = runSim({ seed: "sim-low-1", tier: "low", maxWaves: 8, maxActions: 400 });
    expect(a.wave).toBe(b.wave);
    expect(a.reason).toBe(b.reason);
    expect(a.gold).toBe(b.gold);
  });

  it("lets mid reach at least as far as low on a shared seed batch", () => {
    const seeds = ["a", "b", "c", "d", "e", "f"];
    const mean = (tier: "low" | "mid") =>
      seeds.reduce((sum, seed) => sum + runSim({ seed: `batch-${seed}`, tier, maxWaves: 30, maxActions: 800 }).wave, 0) /
      seeds.length;
    expect(mean("mid")).toBeGreaterThanOrEqual(mean("low"));
  });
});

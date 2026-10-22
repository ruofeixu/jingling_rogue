import { describe, expect, it } from "vitest";
import { applyBoon, commitParty, createRun, grantWaveExp } from "./run-session.ts";
import { startPartyBattle } from "../combat/party-battle.ts";
import { stockForWave } from "../shop/shop.ts";

describe("run growth", () => {
  it("raises living party levels up to the wave cap", () => {
    const run = createRun({ seed: "exp-cap", starterId: "zao_li" });
    run.wave = 1;
    run.partyLevels = [9];
    grantWaveExp(run, [true]);
    expect(run.partyLevels[0]).toBe(10);
    grantWaveExp(run, [true]);
    expect(run.partyLevels[0]).toBe(10);
  });

  it("evolves 灶狸 at level 8", () => {
    const run = createRun({ seed: "evo-1", starterId: "zao_li" });
    run.partyLevels = [7];
    grantWaveExp(run, [true]);
    expect(run.partyIds[0]).toBe("dan_li");
    expect(run.partyLevels[0]).toBe(8);
  });

  it("keeps fainted spirits from gaining levels", () => {
    const run = createRun({ seed: "exp-faint", starterId: "zao_li" });
    run.partyLevels = [5];
    grantWaveExp(run, [false]);
    expect(run.partyLevels[0]).toBe(5);
  });

  it("restores living hp after wins in the first ten waves", () => {
    const run = createRun({ seed: "hp-early", starterId: "zao_li" });
    commitParty(run, [{ hp: 10, maxHp: 40 }], true);
    expect(run.partyHpRatios[0]).toBe(1);
  });

  it("stores hp ratios and opens the next fight wounded", () => {
    const run = createRun({ seed: "hp-1", starterId: "zao_li" });
    run.wave = 12;
    commitParty(run, [{ hp: 10, maxHp: 40 }], true);
    expect(run.partyHpRatios[0]).toBeCloseTo(0.55);
    const battle = startPartyBattle({
      partyIds: run.partyIds,
      foeId: "jing_zhu",
      level: 5,
      seed: "hp-battle",
      kind: "wild",
      hpRatios: run.partyHpRatios,
      foeAtkOverride: 1,
    });
    expect(battle.active.hp).toBeLessThan(battle.active.maxHp);
    expect(battle.active.hp).toBeGreaterThan(0);
  });

  it("heals leftover hp after wave 20", () => {
    const run = createRun({ seed: "hp-late", starterId: "zao_li" });
    run.wave = 21;
    commitParty(run, [{ hp: 10, maxHp: 40 }], true);
    expect(run.partyHpRatios[0]).toBeCloseTo(0.55);
  });

  it("restores living hp after wins past wave 180", () => {
    const run = createRun({ seed: "hp-void", starterId: "zao_li" });
    run.wave = 181;
    commitParty(run, [{ hp: 10, maxHp: 40 }], true);
    expect(run.partyHpRatios[0]).toBe(1);
  });

  it("revives fainted spirits and stocks 还魂 on wave 1", () => {
    const run = createRun({ seed: "revive-1", starterId: "zao_li" });
    run.partyHpRatios = [0];
    applyBoon(run, "soul_return");
    expect(run.partyHpRatios[0]).toBe(1);
    const stock = stockForWave(1);
    expect(stock.map((row) => row.id)).toEqual(expect.arrayContaining(["small_draught", "soul_return"]));
  });
});

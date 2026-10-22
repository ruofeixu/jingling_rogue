import { describe, expect, it } from "vitest";
import { makeSpirit } from "./spirit-entity.ts";
import { pickTrainerArt } from "./trainer-ai.ts";
import { absorbFaint, createBoss, overcapCannonPower } from "./boss.ts";
import { startPartyBattle } from "./party-battle.ts";

describe("trainer AI", () => {
  it("prefers an art that hits the target for super-effective damage", () => {
    const user = makeSpirit({ id: "zao_li", side: "foe", level: 20 });
    user.artIds = ["cinder_claw", "well_thread"];
    user.focusLeft.well_thread = 10;
    const wood = makeSpirit({ id: "tao_geng", side: "player", level: 20 });
    const flame = makeSpirit({ id: "zao_li", side: "player", level: 20, instanceId: "p-flame" });
    expect(pickTrainerArt(user, wood)).toBe("cinder_claw");
    expect(pickTrainerArt(user, flame)).toBe("well_thread");
  });
});

describe("legend boss", () => {
  it("restores shields plus one and fields two targets in the second stage", () => {
    const state = createBoss(2);
    const foe = makeSpirit({ id: "huo_de_li", side: "foe", level: 50 });
    foe.hp = 0;
    expect(absorbFaint(state, foe)).toBe("shield");
    expect(state.shields).toBe(1);
    foe.hp = 0;
    expect(absorbFaint(state, foe)).toBe("shield");
    expect(state.shields).toBe(0);
    foe.hp = 0;
    expect(absorbFaint(state, foe)).toBe("phase2");
    expect(state.shields).toBe(3);
    expect(state.dual).toBe(true);
    expect(foe.charms).toContain("lost_swallow");
    expect(foe.ailment).toBeNull();
  });

  it("raises the exclusive cannon in 10-level bands over the cap", () => {
    expect(overcapCannonPower(80, 200, 200)).toBe(80);
    expect(overcapCannonPower(80, 210, 200)).toBe(95);
    expect(overcapCannonPower(80, 220, 200)).toBe(110);
  });

  it("keeps two foes on the field after the legend breaks its last bar", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "huo_de_li",
      level: 20,
      seed: "legend-dual",
      kind: "trainer",
      shields: 0,
      legend: true,
      foeHpOverride: 1,
      foeAtkOverride: 1,
      playerDefOverride: 80,
    });
    battle.choose({ type: "art", artId: "cinder_claw" });
    expect(battle.boss?.dual).toBe(true);
    expect(battle.foes).toHaveLength(2);
    expect(battle.result).toBeNull();
  });
});

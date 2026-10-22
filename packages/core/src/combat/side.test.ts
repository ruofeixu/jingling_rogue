import { describe, expect, it } from "vitest";
import { makeSpirit } from "./spirit-entity.ts";
import { addLure, canDual, dualChance, pickTarget, speedOrder } from "./side.ts";
import { enterForm, formKeysFrom, revertForm, tickForm } from "./form-change.ts";
import { startPartyBattle } from "./party-battle.ts";
import { ClassicSlice } from "../run/classic-slice.ts";

describe("double battle targeting", () => {
  it("lets the player pick which foe an art hits", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li", "jing_zhu"],
      foeId: "tao_geng",
      foeIds: ["tao_geng", "luan_shi"],
      level: 8,
      seed: "double-aim",
      kind: "wild",
      foeAtkOverride: 1,
    });
    expect(battle.foes).toHaveLength(2);
    const right = battle.foes[1].hp;
    battle.choose({ type: "art", artId: "cinder_claw", targetId: battle.foes[1].instanceId });
    expect(battle.foes[1].hp).toBeLessThan(right);
  });
});

describe("combat forms", () => {
  it("reverts 显圣 after three turns", () => {
    const unit = makeSpirit({ id: "zao_li", side: "player", level: 20 });
    const atk = unit.atk;
    enterForm(unit, "sanctify");
    expect(unit.atk).toBeGreaterThan(atk);
    tickForm(unit);
    tickForm(unit);
    expect(unit.form).toBe("sanctify");
    tickForm(unit);
    expect(unit.form).toBe("none");
    expect(unit.atk).toBe(atk);
  });

  it("doubles HP for 巨灵 and changes affinity for 灵极", () => {
    const unit = makeSpirit({ id: "zao_li", side: "player", level: 20 });
    const hp = unit.hp;
    enterForm(unit, "colossus");
    expect(unit.form).toBe("colossus");
    expect(unit.hp).toBe(hp * 2);
    expect(unit.maxHp).toBe(hp * 2);
    revertForm(unit);
    enterForm(unit, "apex", "tide");
    expect(unit.form).toBe("apex");
    expect(unit.affinities).toEqual(["tide"]);
  });

  it("unlocks form keys from 显圣镯, 巨灵带, and 灵极器", () => {
    expect(formKeysFrom({ boonIds: ["sanctify_cuff"], hasApexBand: false })).toEqual(["sanctify"]);
    expect(formKeysFrom({ boonIds: ["colossus_band"], hasApexBand: true })).toEqual(["colossus", "apex"]);
  });
});

describe("lures and dual lock", () => {
  it("raises dual chance when different lures stack", () => {
    const one = addLure([], "lure_fan");
    const two = addLure(one, "lure_shang");
    expect(dualChance([])).toBe(0.03);
    expect(dualChance([], 21)).toBe(0.2);
    expect(dualChance([], 181)).toBe(0.03);
    expect(dualChance(two)).toBeGreaterThan(dualChance(one));
    expect(addLure(one, "lure_fan")).toHaveLength(1);
  });

  it("forbids dual on endless wave-50 bosses", () => {
    expect(canDual({ mode: "endless", wave: 50, boss: true })).toBe(false);
    expect(canDual({ mode: "endless", wave: 51, boss: false })).toBe(true);
    expect(canDual({ mode: "classic", wave: 50, boss: true })).toBe(true);
    expect(canDual({ mode: "classic", wave: 1, boss: false })).toBe(false);
  });
});

describe("speed bar", () => {
  it("orders living units by speed", () => {
    const slow = makeSpirit({ id: "luan_shi", side: "player", level: 10, instanceId: "a" });
    const fast = makeSpirit({ id: "dian_zhu", side: "foe", level: 10, instanceId: "b" });
    expect(speedOrder([slow, fast])[0].id).toBe("dian_zhu");
    expect(pickTarget([slow, fast], fast.instanceId).id).toBe("dian_zhu");
    const player = makeSpirit({ id: "zao_li", side: "player", level: 5, instanceId: "player-0-zao_li" });
    const foe = makeSpirit({ id: "zao_li", side: "foe", level: 5, instanceId: "foe-0-zao_li" });
    expect(speedOrder([foe, player])[0].side).toBe("player");
  });
});

describe("apex band", () => {
  it("grants 灵极器 after the fourth rival fight", () => {
    const slice = new ClassicSlice({ seed: "rival-4", starterId: "zao_li" });
    slice.skipToWave(95);
    expect(slice.encounter?.kind).toBe("rival");
    slice.noteWin();
    expect(slice.run.hasApexBand).toBe(true);
  });
});

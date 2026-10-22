import { describe, expect, it } from "vitest";
import { startPartyBattle } from "./party-battle.ts";

const SIX = ["zao_li", "jing_zhu", "tao_geng", "luan_shi", "dian_zhu", "mo_mao"] as const;

describe("party battle", () => {
  it("fields the first of six spirits and keeps the rest on the bench", () => {
    const battle = startPartyBattle({
      partyIds: [...SIX],
      foeId: "nuo_mian",
      level: 5,
      seed: "party-six",
      kind: "wild",
    });
    expect(battle.party).toHaveLength(6);
    expect(battle.active.id).toBe("zao_li");
    expect(battle.waitingFor).toBe("command");
    expect(battle.kind).toBe("wild");
  });

  it("rejects a seventh party member", () => {
    expect(() =>
      startPartyBattle({
        partyIds: [...SIX, "deng_e"],
        foeId: "nuo_mian",
        level: 5,
        seed: "party-seven",
        kind: "wild",
      }),
    ).toThrow(/party/);
  });

  it("switches a bench spirit onto the field as a new active entity", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li", "jing_zhu"],
      foeId: "luan_shi",
      level: 5,
      seed: "party-switch",
      kind: "wild",
    });
    const firstId = battle.active.instanceId;
    battle.choose({ type: "switch", partyIndex: 1 });
    expect(battle.active.id).toBe("jing_zhu");
    expect(battle.active.instanceId).not.toBe(firstId);
    expect(battle.activeIndex).toBe(1);
  });

  it("lets the player run from a wild encounter", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 5,
      seed: "party-run-wild",
      kind: "wild",
    });
    battle.choose({ type: "run" });
    expect(battle.result).toBe("fled");
    expect(battle.waitingFor).toBe("over");
  });

  it("forbids running from a trainer", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 5,
      seed: "party-run-trainer",
      kind: "trainer",
    });
    expect(() => battle.choose({ type: "run" })).toThrow(/trainer/);
    expect(battle.waitingFor).toBe("command");
    expect(battle.result).toBeNull();
  });

  it("forces a switch when the active spirit faints and a bench mate remains", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li", "jing_zhu"],
      foeId: "tao_geng",
      level: 20,
      seed: "party-faint-switch",
      kind: "wild",
      playerHpOverride: 1,
      foeAtkOverride: 80,
      playerDefOverride: 1,
    });
    battle.choose({ type: "art", artId: "ash_veil" });
    expect(battle.party[0].hp).toBe(0);
    expect(battle.waitingFor).toBe("switch");
    expect(battle.result).toBeNull();
    battle.choose({ type: "switch", partyIndex: 1 });
    expect(battle.active.id).toBe("jing_zhu");
    expect(battle.waitingFor).toBe("command");
  });

  it("heals with a bag draught and still spends the turn", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 5,
      seed: "party-bag",
      kind: "wild",
      potions: 1,
      playerDefOverride: 80,
      foeAtkOverride: 1,
    });
    battle.active.hp = 1;
    const foeArt = battle.foe.artIds[0];
    const focusBefore = { ...battle.foe.focusLeft };
    battle.choose({ type: "bag" });
    expect(battle.active.hp).toBeGreaterThan(1);
    expect(battle.potions).toBe(0);
    expect(Object.keys(focusBefore).some((id) => battle.foe.focusLeft[id] < focusBefore[id])).toBe(true);
    expect(battle.waitingFor).toBe("command");
  });

  it("struggles when all arts are out of focus", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 20,
      seed: "party-struggle",
      kind: "wild",
      foeHpOverride: 80,
    });
    for (const artId of battle.active.artIds) {
      battle.active.focusLeft[artId] = 0;
    }
    const foeHp = battle.foe.hp;
    const selfHp = battle.active.hp;
    battle.choose({ type: "art", artId: "cinder_claw" });
    expect(battle.foe.hp).toBeLessThan(foeHp);
    expect(battle.active.hp).toBeLessThan(selfHp);
  });

  it("throws a seal in a wild fight and can catch", () => {
    const seals = [3, 0, 0, 0, 0];
    const events: string[] = [];
    const battle = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 5,
      seed: "party-seal-catch",
      kind: "wild",
      catchable: true,
      seals,
      foeHpOverride: 4,
      onEvent: (event) => events.push(event.type),
    });
    battle.choose({ type: "seal", tier: 0 });
    expect(seals[0]).toBe(2);
    expect(events).toContain("sealTried");
    expect(battle.result === "win" || battle.waitingFor === "command").toBe(true);
    if (battle.result === "win") {
      expect(battle.caught).toBe(true);
    }
  });

  it("forbids sealing a trainer", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 5,
      seed: "party-seal-trainer",
      kind: "trainer",
      catchable: false,
      seals: [3, 0, 0, 0, 0],
    });
    expect(() => battle.choose({ type: "seal", tier: 0 })).toThrow(/seal/);
  });

  it("lets a higher party level outscale the foe", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "zao_li",
      level: 5,
      partyLevel: 10,
      seed: "party-level",
      kind: "wild",
    });
    expect(battle.active.level).toBe(10);
    expect(battle.foe.level).toBe(5);
    expect(battle.active.maxHp).toBeGreaterThan(battle.foe.maxHp);
  });

  it("enters 巨灵 and 灵极 in battle when the matching key is held", () => {
    const locked = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 8,
      seed: "form-locked",
      kind: "wild",
      foeAtkOverride: 1,
    });
    expect(() => locked.choose({ type: "form", form: "colossus" })).toThrow(/form/);

    const colossus = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 8,
      seed: "form-colossus",
      kind: "wild",
      foeAtkOverride: 1,
      formKeys: ["colossus"],
    });
    const maxHp = colossus.active.maxHp;
    colossus.choose({ type: "form", form: "colossus" });
    expect(colossus.active.form).toBe("colossus");
    expect(colossus.active.maxHp).toBe(maxHp * 2);
    expect(colossus.active.hp).toBeGreaterThan(maxHp);

    const apex = startPartyBattle({
      partyIds: ["zao_li"],
      foeId: "jing_zhu",
      level: 8,
      seed: "form-apex",
      kind: "wild",
      foeAtkOverride: 1,
      formKeys: ["apex"],
    });
    apex.choose({ type: "form", form: "apex", affinity: "tide" });
    expect(apex.active.form).toBe("apex");
    expect(apex.active.affinities).toEqual(["tide"]);
  });
});

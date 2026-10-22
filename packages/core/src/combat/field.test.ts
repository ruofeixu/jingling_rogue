import { describe, expect, it } from "vitest";
import { applyArt } from "./effects/apply-art.ts";
import { makeSpirit } from "./spirit-entity.ts";
import { RngStream } from "../rng/rng-stream.ts";
import { emptyField, applyHazards, omenMul } from "./field.ts";
import { pactDealMul, pactTakeMul } from "./pact.ts";
import { tickCharms } from "./charm.ts";
import { startPartyBattle } from "./party-battle.ts";

function unit(id: string, extra?: { hp?: number; atk?: number; def?: number }) {
  return makeSpirit({
    id,
    side: "player",
    level: 20,
    hpOverride: extra?.hp,
    atkOverride: extra?.atk,
    defOverride: extra?.def,
  });
}

describe("field omen and hazards", () => {
  it("boosts tide arts in rain", () => {
    expect(omenMul("rain", "tide")).toBe(1.5);
    expect(omenMul("rain", "flame")).toBe(0.5);
    const wet = unit("jing_zhu", { atk: 80 });
    const dry = unit("jing_zhu", { atk: 80 });
    const targetA = unit("zao_li", { hp: 400, def: 10 });
    const targetB = unit("zao_li", { hp: 400, def: 10 });
    const field = emptyField();
    field.omen = "rain";
    applyArt(wet, targetA, "well_thread", new RngStream("rain-tide"), undefined, { field });
    applyArt(dry, targetB, "well_thread", new RngStream("rain-tide"));
    expect(targetA.hp).toBeLessThan(targetB.hp);
  });

  it("hurts a spirit that switches onto spikes", () => {
    const incoming = unit("jing_zhu", { hp: 80 });
    incoming.maxHp = 80;
    incoming.hp = 80;
    const field = emptyField();
    field.hazards.player.push("spikes");
    applyHazards(incoming, "player", field);
    expect(incoming.hp).toBe(70);
  });
});

describe("pacts", () => {
  it("boosts matching outbound damage and can cut inbound damage", () => {
    expect(pactDealMul("hearth_watch", "flame")).toBeGreaterThan(1);
    expect(pactDealMul("hearth_watch", "tide")).toBe(1);
    expect(pactTakeMul("city_ward")).toBeLessThan(1);
  });
});

describe("charms", () => {
  it("heals leftover meal at end of turn", () => {
    const holder = unit("zao_li", { hp: 80 });
    holder.maxHp = 80;
    holder.hp = 40;
    holder.charms = ["meal"];
    tickCharms(holder);
    expect(holder.hp).toBe(45);
  });
});

describe("party battle field", () => {
  it("applies spikes when switching in", () => {
    const battle = startPartyBattle({
      partyIds: ["zao_li", "jing_zhu"],
      foeId: "luan_shi",
      level: 5,
      seed: "spikes-switch",
      kind: "wild",
    });
    battle.field.hazards.player.push("spikes");
    battle.foe.hp = 0;
    const max = battle.party[1].maxHp;
    battle.choose({ type: "switch", partyIndex: 1 });
    expect(battle.active.id).toBe("jing_zhu");
    expect(battle.active.hp).toBe(max - Math.max(1, Math.floor(max / 8)));
  });
});

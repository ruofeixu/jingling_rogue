import { describe, expect, it } from "vitest";
import { applyArt, tickAilments } from "./apply-art.ts";
import { makeSpirit } from "../spirit-entity.ts";
import { RngStream } from "../../rng/rng-stream.ts";
import { getArt } from "../../tables/load-tables.ts";

function fighter(id: string, extra?: { hp?: number; atk?: number; def?: number }) {
  return makeSpirit({
    id,
    side: "player",
    level: 20,
    hpOverride: extra?.hp,
    atkOverride: extra?.atk,
    defOverride: extra?.def,
  });
}

function grant(unit: ReturnType<typeof fighter>, artId: string): void {
  unit.focusLeft[artId] = getArt(artId).focus;
}

describe("art effect blocks", () => {
  it("cuts attack damage when the user is burned", () => {
    const burned = fighter("zao_li", { atk: 80 });
    const healthy = fighter("zao_li", { atk: 80 });
    burned.ailment = { kind: "burn" };
    const targetA = fighter("tao_geng", { hp: 400, def: 10 });
    const targetB = fighter("tao_geng", { hp: 400, def: 10 });
    applyArt(burned, targetA, "cinder_claw", new RngStream("burn-atk"));
    applyArt(healthy, targetB, "cinder_claw", new RngStream("burn-atk"));
    expect(targetA.hp).toBeGreaterThan(targetB.hp);
  });

  it("stacks toxic layers each tick", () => {
    const unit = fighter("jing_zhu", { hp: 160 });
    unit.maxHp = 160;
    unit.hp = 160;
    unit.ailment = { kind: "toxic", layers: 1 };
    tickAilments(unit);
    expect(unit.hp).toBe(160 - 10);
    expect(unit.ailment).toEqual({ kind: "toxic", layers: 2 });
    tickAilments(unit);
    expect(unit.hp).toBe(160 - 10 - 20);
    expect(unit.ailment).toEqual({ kind: "toxic", layers: 3 });
  });

  it("deals one minimum hit per multi-hit strike", () => {
    const user = fighter("zao_li", { atk: 40 });
    grant(user, "twin_peck");
    const target = fighter("tao_geng", { hp: 200, def: 10 });
    applyArt(user, target, "twin_peck", new RngStream("multi-hit"));
    expect(200 - target.hp).toBeGreaterThanOrEqual(3);
  });

  it("makes incoming damage fail on the turn the user guards", () => {
    const user = fighter("zao_li", { hp: 80 });
    const foe = fighter("tao_geng", { atk: 80 });
    grant(user, "veil_guard");
    grant(foe, "peach_strike");
    applyArt(user, foe, "veil_guard", new RngStream("guard"));
    expect(user.guarding).toBe(true);
    const hp = user.hp;
    applyArt(foe, user, "peach_strike", new RngStream("guard-hit"));
    expect(user.hp).toBe(hp);
  });

  it("heals the user by a ratio of damage dealt when draining", () => {
    const user = fighter("zao_li", { hp: 20, atk: 80 });
    user.maxHp = 80;
    user.hp = 20;
    grant(user, "life_sip");
    const target = fighter("tao_geng", { hp: 200, def: 10 });
    applyArt(user, target, "life_sip", new RngStream("drain"));
    expect(user.hp).toBeGreaterThan(20);
    expect(target.hp).toBeLessThan(200);
  });

  it("puts leftover hits onto a substitute first", () => {
    const user = fighter("zao_li", { hp: 80 });
    const foe = fighter("tao_geng", { atk: 80 });
    grant(user, "decoy_paper");
    grant(foe, "peach_strike");
    applyArt(user, foe, "decoy_paper", new RngStream("sub"));
    expect(user.substituteHp).toBeGreaterThan(0);
    const body = user.hp;
    applyArt(foe, user, "peach_strike", new RngStream("sub-hit"));
    expect(user.hp).toBe(body);
    expect(user.substituteHp).toBeLessThan(Math.floor(user.maxHp * 0.25));
  });

  it("clamps super-effective damage in early waves", () => {
    const user = fighter("jing_zhu", { atk: 80 });
    const raw = fighter("zao_li", { hp: 400, def: 10 });
    const capped = fighter("zao_li", { hp: 400, def: 10 });
    applyArt(user, raw, "well_thread", new RngStream("clamp-se"));
    applyArt(user, capped, "well_thread", new RngStream("clamp-se"), undefined, {
      affinityClamp: { min: 0.8, max: 1.25 },
    });
    expect(capped.hp).toBeGreaterThan(raw.hp);
  });
});

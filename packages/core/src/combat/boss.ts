import { getArt } from "../tables/load-tables.ts";
import { makeSpirit, type SpiritEntity } from "./spirit-entity.ts";

export type BossAbsorb = "shield" | "phase2" | "down";

export interface BossState {
  shields: number;
  maxShields: number;
  stage: 1 | 2;
  dual: boolean;
  lostSwallow: boolean;
}

export function createBoss(shields: number): BossState {
  return {
    shields,
    maxShields: shields,
    stage: 1,
    dual: false,
    lostSwallow: false,
  };
}

export function absorbFaint(state: BossState, foe: SpiritEntity): BossAbsorb {
  if (state.shields > 0) {
    state.shields -= 1;
    foe.hp = foe.maxHp;
    return "shield";
  }
  if (state.stage === 1) {
    enterSecondStage(state, foe);
    return "phase2";
  }
  return "down";
}

export function secondTarget(foe: SpiritEntity): SpiritEntity {
  return makeSpirit({
    id: foe.id,
    side: "foe",
    level: foe.level,
    instanceId: `${foe.instanceId}-b`,
  });
}

export function overcapCannonPower(base: number, level: number, cap: number): number {
  const bands = Math.max(0, Math.floor((level - cap) / 10));
  return base + bands * 15;
}

function enterSecondStage(state: BossState, foe: SpiritEntity): void {
  state.stage = 2;
  state.shields = state.maxShields + 1;
  state.dual = true;
  state.lostSwallow = true;
  foe.hp = foe.maxHp;
  foe.ailment = null;
  foe.stages = { atk: 2, def: 0, spd: 0 };
  foe.charms = ["lost_swallow"];
  if (!foe.artIds.includes("void_cannon")) {
    foe.artIds = [...foe.artIds, "void_cannon"];
    foe.focusLeft.void_cannon = getArt("void_cannon").focus;
  }
}

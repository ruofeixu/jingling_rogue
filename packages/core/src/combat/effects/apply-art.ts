import { affinityMod, calcDamage, clampAffinity } from "../damage.ts";
import { isFainted, type SpiritEntity } from "../spirit-entity.ts";
import { RngStream } from "../../rng/rng-stream.ts";
import { getArt, loadTables } from "../../tables/load-tables.ts";
import type { ArtEffect } from "../../tables/types.ts";
import type { BattleEvent } from "../../view/battle-view.ts";
import { leyMul, omenMul, type FieldState } from "../field.ts";
import { pactDealMul, pactTakeMul } from "../pact.ts";

export const STRUGGLE_ID = "struggle";

export interface ArtContext {
  field?: FieldState;
  affinityClamp?: { min: number; max: number };
  powerMul?: number;
}

export function artToUse(user: SpiritEntity, requested: string): string {
  const hasFocus = user.artIds.some((id) => (user.focusLeft[id] ?? 0) > 0);
  return hasFocus ? requested : STRUGGLE_ID;
}

export function stageMul(stage: number): number {
  const clamped = Math.max(-6, Math.min(6, stage));
  return clamped >= 0 ? (2 + clamped) / 2 : 2 / (2 - clamped);
}

export function tickAilments(unit: SpiritEntity): void {
  if (!unit.ailment || isFainted(unit)) {
    return;
  }
  if (unit.ailment.kind === "burn" || unit.ailment.kind === "poison") {
    const lost = Math.max(1, Math.floor(unit.maxHp / 16));
    unit.hp = Math.max(0, unit.hp - lost);
    return;
  }
  if (unit.ailment.kind === "toxic") {
    const lost = Math.max(1, Math.floor((unit.maxHp * unit.ailment.layers) / 16));
    unit.hp = Math.max(0, unit.hp - lost);
    unit.ailment.layers = Math.min(15, unit.ailment.layers + 1);
  }
}

export function clearGuard(unit: SpiritEntity): void {
  unit.guarding = false;
}

export function applyArt(
  user: SpiritEntity,
  target: SpiritEntity,
  artId: string,
  rng: RngStream,
  emit: (event: BattleEvent) => void = () => undefined,
  ctx: ArtContext = {},
): void {
  if (artId === STRUGGLE_ID) {
    applyStruggle(user, target, rng, emit, ctx);
    return;
  }
  const art = getArt(artId);
  const left = user.focusLeft[artId] ?? 0;
  if (left <= 0) {
    return;
  }
  user.focusLeft[artId] = left - 1;
  emit({
    type: "artPlayed",
    userId: user.instanceId,
    artId,
    targetId: target.instanceId,
  });
  for (const effect of art.effects) {
    runBlock(user, target, art.power, art.affinity, effect, rng, emit, ctx);
  }
}

function applyStruggle(
  user: SpiritEntity,
  target: SpiritEntity,
  rng: RngStream,
  emit: (event: BattleEvent) => void,
  ctx: ArtContext,
): void {
  emit({
    type: "artPlayed",
    userId: user.instanceId,
    artId: STRUGGLE_ID,
    targetId: target.instanceId,
  });
  const dealt = dealHits(user, target, 50, "flame", 1, rng, emit, ctx);
  const recoil = Math.max(1, Math.floor(dealt / 4));
  user.hp = Math.max(0, user.hp - recoil);
  emit({ type: "hpChange", targetId: user.instanceId, hp: user.hp, maxHp: user.maxHp });
}

function runBlock(
  user: SpiritEntity,
  target: SpiritEntity,
  power: number,
  affinity: Parameters<typeof affinityMod>[0],
  effect: ArtEffect,
  rng: RngStream,
  emit: (event: BattleEvent) => void,
  ctx: ArtContext,
): void {
  if (effect.kind === "heal") {
    user.hp = Math.min(user.maxHp, user.hp + Math.floor(user.maxHp * effect.ratio));
    emit({ type: "hpChange", targetId: user.instanceId, hp: user.hp, maxHp: user.maxHp });
    return;
  }
  if (effect.kind === "guard") {
    user.guarding = true;
    return;
  }
  if (effect.kind === "substitute") {
    if (user.substituteHp > 0 || user.hp <= 1) {
      return;
    }
    const cost = Math.max(1, Math.floor(user.maxHp * 0.25));
    if (user.hp <= cost) {
      return;
    }
    user.hp -= cost;
    user.substituteHp = cost;
    emit({ type: "hpChange", targetId: user.instanceId, hp: user.hp, maxHp: user.maxHp });
    return;
  }
  if (effect.kind === "stage") {
    const who = effect.on === "user" ? user : target;
    if (effect.on === "target" && target.guarding) {
      return;
    }
    who.stages[effect.stat] = Math.max(-6, Math.min(6, who.stages[effect.stat] + effect.delta));
    return;
  }
  if (target.guarding) {
    return;
  }
  if (effect.kind === "status") {
    const chance = effect.chance ?? 1;
    if (rng.float() >= chance || target.ailment) {
      return;
    }
    target.ailment =
      effect.status === "toxic" ? { kind: "toxic", layers: 1 } : { kind: effect.status };
    return;
  }
  if (effect.kind === "damage" || effect.kind === "drain") {
    const hits = effect.kind === "damage" ? (effect.hits ?? 1) : 1;
    const dealt = dealHits(user, target, power, affinity, hits, rng, emit, ctx);
    if (effect.kind === "drain") {
      user.hp = Math.min(user.maxHp, user.hp + Math.floor(dealt * effect.ratio));
      emit({ type: "hpChange", targetId: user.instanceId, hp: user.hp, maxHp: user.maxHp });
    }
  }
}

function dealHits(
  user: SpiritEntity,
  target: SpiritEntity,
  power: number,
  affinity: Parameters<typeof affinityMod>[0],
  hits: number,
  rng: RngStream,
  emit: (event: BattleEvent) => void,
  ctx: ArtContext,
): number {
  if (power <= 0 || target.guarding) {
    return 0;
  }
  const tables = loadTables();
  let dealt = 0;
  const atk = user.atk * stageMul(user.stages.atk) * (user.ailment?.kind === "burn" ? 0.5 : 1);
  const def = Math.max(1, target.def * stageMul(target.stages.def));
  const field = ctx.field;
  const extra =
    omenMul(field?.omen ?? "clear", affinity) *
    leyMul(field?.ley ?? "none", affinity) *
    pactDealMul(user.pactId, affinity, user.hiddenPact) *
    pactTakeMul(target.pactId, target.hiddenPact) *
    (ctx.powerMul ?? 1);
  for (let i = 0; i < hits; i++) {
    if (isFainted(target) && target.substituteHp <= 0) {
      break;
    }
    const dmg = calcDamage({
      power,
      atk,
      def,
      level: user.level,
      affinityMod:
        clampAffinity(affinityMod(affinity, target.affinities, tables.typeChart), ctx.affinityClamp) * extra,
      boneMod: 1,
      rng,
    });
    dealt += absorbDamage(target, dmg, emit);
  }
  return dealt;
}

function absorbDamage(
  target: SpiritEntity,
  dmg: number,
  emit: (event: BattleEvent) => void,
): number {
  if (target.substituteHp > 0) {
    const taken = Math.min(target.substituteHp, dmg);
    target.substituteHp -= taken;
    return taken;
  }
  const taken = Math.min(target.hp, dmg);
  target.hp = Math.max(0, target.hp - dmg);
  emit({ type: "hpChange", targetId: target.instanceId, hp: target.hp, maxHp: target.maxHp });
  return taken;
}

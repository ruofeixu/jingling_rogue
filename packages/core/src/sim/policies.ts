import type { BattleCommand } from "../combat/party-battle.ts";
import { affinityMod } from "../combat/damage.ts";
import { loadTables } from "../tables/load-tables.ts";
import type { SimObserve, SimTier } from "./observe.ts";

export type SimAction =
  | { type: "battle"; command: BattleCommand }
  | { type: "catch"; attempt: boolean }
  | { type: "boon"; id: string; reroll?: boolean }
  | { type: "map"; realmId: string }
  | { type: "omen"; optionIndex: number };

const BOON_SCORE: Record<string, number> = {
  atk: 5,
  hp: 4,
  potion: 4,
  def: 3,
  spd: 3,
  exp: 6,
  map: 5,
  catch: 3,
  gold: 2,
  lure: 1,
};

function bestArt(obs: SimObserve, partyIndex: number, foeIndex = 0): string {
  const unit = obs.party[partyIndex];
  const foe = obs.foes[foeIndex] ?? obs.foes[0];
  const fallback = unit?.arts[0]?.id;
  if (!unit || !fallback) {
    return "cinder_claw";
  }
  const chart = loadTables().typeChart;
  let best = fallback;
  let score = -Infinity;
  for (const art of unit.arts) {
    if (art.focus <= 0) {
      continue;
    }
    const mul = foe ? affinityMod(art.affinity, foe.affinities, chart) : 1;
    const value = art.power * mul;
    if (value > score) {
      score = value;
      best = art.id;
    }
  }
  return best;
}

function firstLivingBench(obs: SimObserve): number {
  return obs.party.findIndex((row, index) => index !== obs.activeIndex && !row.fainted);
}

function pickBoon(obs: SimObserve, preferExp: boolean): string {
  const ranked = [...obs.offers].sort((a, b) => {
    const extra = (kind: string) => (preferExp && (kind === "exp" || kind === "map") ? 4 : 0);
    return (BOON_SCORE[b.kind] ?? 0) + extra(b.kind) - ((BOON_SCORE[a.kind] ?? 0) + extra(a.kind));
  });
  return ranked[0]?.id ?? obs.offers[0]?.id ?? "";
}

function low(obs: SimObserve): SimAction {
  if (obs.phase === "catch") {
    return { type: "catch", attempt: false };
  }
  if (obs.phase === "boon") {
    return { type: "boon", id: obs.offers[0]?.id ?? "" };
  }
  if (obs.phase === "map") {
    return { type: "map", realmId: obs.realmChoices[0] ?? "" };
  }
  if (obs.phase === "omen") {
    return { type: "omen", optionIndex: 0 };
  }
  if (obs.waitingFor === "switch") {
    const bench = firstLivingBench(obs);
    if (bench < 0) {
      return { type: "battle", command: { type: "art", artId: obs.party[obs.activeIndex]?.arts[0]?.id ?? "cinder_claw" } };
    }
    return { type: "battle", command: { type: "switch", partyIndex: bench } };
  }
  if (obs.waitingFor === "target") {
    return { type: "battle", command: { type: "target", targetId: obs.foes[0]?.instanceId ?? "" } };
  }
  const artId = obs.party[obs.activeIndex]?.arts[0]?.id;
  return { type: "battle", command: { type: "art", artId: artId ?? "cinder_claw" } };
}

function mid(obs: SimObserve, high: boolean): SimAction {
  if (obs.phase === "catch") {
    const common = obs.seals[0] > 0 || obs.seals[1] > 0;
    return { type: "catch", attempt: common };
  }
  if (obs.phase === "boon") {
    if (high && obs.gold >= obs.rerollCost && obs.rerollCost > 0) {
      const best = Math.max(...obs.offers.map((row) => BOON_SCORE[row.kind] ?? 0));
      if (best < 4) {
        return { type: "boon", id: obs.offers[0]?.id ?? "", reroll: true };
      }
    }
    return { type: "boon", id: pickBoon(obs, high) };
  }
  if (obs.phase === "map") {
    return { type: "map", realmId: obs.realmChoices[0] ?? "" };
  }
  if (obs.phase === "omen") {
    return { type: "omen", optionIndex: 0 };
  }
  const active = obs.party[obs.activeIndex];
  const foe = obs.foes[0];
  if (obs.waitingFor === "switch") {
    const bench = firstLivingBench(obs);
    if (bench < 0) {
      return { type: "battle", command: { type: "art", artId: active?.arts[0]?.id ?? "cinder_claw" } };
    }
    return { type: "battle", command: { type: "switch", partyIndex: bench } };
  }
  if (obs.waitingFor === "target") {
    const weakest = [...obs.foes].sort((a, b) => a.hp - b.hp)[0];
    return { type: "battle", command: { type: "target", targetId: weakest?.instanceId ?? foe?.instanceId ?? "" } };
  }
  if (active && active.hp / Math.max(1, active.maxHp) <= 0.4 && obs.potions > 0) {
    return { type: "battle", command: { type: "bag" } };
  }
  if (high && obs.kind === "wild" && obs.catchable && foe && foe.hp / Math.max(1, foe.maxHp) <= 0.35 && obs.seals[0] > 0) {
    return { type: "battle", command: { type: "seal", tier: 0 } };
  }
  const bench = firstLivingBench(obs);
  if (bench >= 0 && foe && active) {
    const chart = loadTables().typeChart;
    const mine = Math.max(...active.arts.map((art) => affinityMod(art.affinity, foe.affinities, chart)));
    const theirs = Math.max(
      ...obs.party[bench].arts.map((art) => affinityMod(art.affinity, foe.affinities, chart)),
    );
    if (theirs > mine && mine < 1) {
      return { type: "battle", command: { type: "switch", partyIndex: bench } };
    }
  }
  const artId = bestArt(obs, obs.activeIndex);
  if (obs.foes.length > 1) {
    const weakest = [...obs.foes].sort((a, b) => a.hp - b.hp)[0];
    return {
      type: "battle",
      command: { type: "art", artId, targetId: weakest?.instanceId },
    };
  }
  return { type: "battle", command: { type: "art", artId } };
}

export function decide(obs: SimObserve, tier: SimTier): SimAction {
  if (tier === "low") {
    return low(obs);
  }
  if (tier === "guide") {
    return guide(obs);
  }
  return mid(obs, tier === "high");
}

function guide(obs: SimObserve): SimAction {
  if (obs.phase === "catch") {
    return { type: "catch", attempt: false };
  }
  if (obs.phase === "boon") {
    return { type: "boon", id: obs.offers[0]?.id ?? "" };
  }
  if (obs.phase === "map") {
    return { type: "map", realmId: obs.realmChoices[0] ?? "" };
  }
  if (obs.phase === "omen") {
    return { type: "omen", optionIndex: 0 };
  }
  if (obs.waitingFor === "switch") {
    const bench = firstLivingBench(obs);
    if (bench < 0) {
      return { type: "battle", command: { type: "art", artId: obs.party[obs.activeIndex]?.arts[0]?.id ?? "cinder_claw" } };
    }
    return { type: "battle", command: { type: "switch", partyIndex: bench } };
  }
  if (obs.waitingFor === "target") {
    return { type: "battle", command: { type: "target", targetId: obs.foes[0]?.instanceId ?? "" } };
  }
  const active = obs.party[obs.activeIndex];
  if (active && active.hp / Math.max(1, active.maxHp) <= 0.5 && obs.potions > 0) {
    return { type: "battle", command: { type: "bag" } };
  }
  const artId = active?.arts[0]?.id;
  return { type: "battle", command: { type: "art", artId: artId ?? "cinder_claw" } };
}

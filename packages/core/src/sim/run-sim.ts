import { startPartyBattle, type PartyBattle } from "../combat/party-battle.ts";
import { ClassicSlice } from "../run/classic-slice.ts";
import { earlyAffinityClamp, encounterLevel, foeEncounterLevel, levelCap, partyBattleKind } from "../run/classic-schedule.ts";
import { catchModifier, sumRunStats, commitParty, artPowerMul } from "../run/run-session.ts";
import { starterRelicIds } from "../meta/relics.ts";
import { enterForm, formKeysFrom } from "../combat/form-change.ts";
import { hiddenPactOn } from "../combat/pact.ts";
import { observeBattle, type SimObserve, type SimTier } from "./observe.ts";
import { decide } from "./policies.ts";

export interface SimResult {
  seed: string;
  tier: SimTier;
  wave: number;
  gold: number;
  caught: number;
  reason: "defeat" | "victory" | "cap" | "stall";
}

export function openBattle(slice: ClassicSlice): PartyBattle {
  const encounter = slice.encounter ?? slice.beginWave();
  if (!slice.run.seals || slice.run.seals.length < 5) {
    slice.run.seals = [5, 0, 0, 0, 0];
  }
  const level = foeEncounterLevel(slice.run.wave);
  const battle = startPartyBattle({
    partyIds: slice.run.partyIds,
    foeId: encounter.foeId,
    foeIds: encounter.kind === "rival" ? [encounter.foeId] : encounter.foeIds,
    level,
    partyLevel: Math.min(levelCap(slice.run.wave), (slice.run.partyLevels[0] ?? encounterLevel(slice.run.wave)) + slice.run.luck),
    partyLevels: slice.run.partyLevels.map((value) => Math.min(levelCap(slice.run.wave), value + slice.run.luck)),
    hpRatios: slice.run.partyHpRatios,
    seed: `${slice.run.seed}-w${slice.run.wave}`,
    kind: partyBattleKind(encounter.kind),
    potions: slice.run.potions,
    seals: slice.run.seals,
    catchable: encounter.catchable,
    catchBoon: catchModifier(slice.run),
    statBonus: sumRunStats(slice.run),
    shields: encounter.shields,
    legend: encounter.kind === "legend",
    affinityClamp: earlyAffinityClamp(slice.run.wave),
    formKeys: formKeysFrom(slice.run),
    hiddenPact: hiddenPactOn({ boonIds: slice.run.boonIds }),
    secondPact: slice.account.secondPact,
    artMul: (user, affinity) => artPowerMul(slice.run, user, affinity),
  });
  if (encounter.sanctify) {
    enterForm(battle.foe, "sanctify");
  }
  return battle;
}

function syncBag(slice: ClassicSlice, battle: PartyBattle): void {
  slice.run.potions = battle.potions;
  slice.run.seals = [...battle.seals];
}

export function applyBattleEnd(slice: ClassicSlice, battle: PartyBattle): void {
  syncBag(slice, battle);
  commitParty(
    slice.run,
    battle.party.map((unit) => ({ hp: unit.hp, maxHp: unit.maxHp })),
    battle.result === "win",
  );
  if (battle.result === "win") {
    if (battle.caught) {
      slice.resolveCatch(true);
    } else {
      slice.noteWin();
    }
    return;
  }
  if (battle.result === "fled") {
    slice.skipCatch();
    return;
  }
  slice.noteLoss();
}

function finish(
  opts: { seed: string; tier: SimTier },
  slice: ClassicSlice,
  reason: SimResult["reason"],
  maxWaves: number,
): SimResult {
  return {
    seed: opts.seed,
    tier: opts.tier,
    wave: reason === "cap" ? maxWaves : slice.run.wave,
    gold: slice.run.gold,
    caught: Math.max(0, slice.run.caughtIds.length - 1),
    reason,
  };
}

export function runSim(opts: {
  seed: string;
  tier: SimTier;
  starterId?: string;
  maxWaves?: number;
  maxActions?: number;
}): SimResult {
  const maxWaves = opts.maxWaves ?? 200;
  const maxActions = opts.maxActions ?? 4000;
  const slice = new ClassicSlice({
    seed: opts.seed,
    starterId: opts.starterId ?? "zao_li",
    relicId: opts.tier === "guide" ? starterRelicIds()[0] : undefined,
  });
  slice.beginWave();
  let battle: PartyBattle | null = openBattle(slice);
  let actions = 0;
  let lastKey = "";
  let stall = 0;

  while (actions < maxActions) {
    if (slice.phase === "victory") {
      return finish(opts, slice, "victory", maxWaves);
    }
    if (slice.phase === "defeat") {
      return finish(opts, slice, "defeat", maxWaves);
    }
    if (slice.phase === "battle" && !battle) {
      if (slice.run.wave > maxWaves) {
        return finish(opts, slice, "cap", maxWaves);
      }
      slice.beginWave();
      battle = openBattle(slice);
    }
    const obs: SimObserve = observeBattle(slice, battle);
    const key = `${slice.phase}|${slice.run.wave}|${battle?.waitingFor}|${obs.party.map((row) => row.hp).join(",")}|${obs.foes.map((row) => row.hp).join(",")}|${obs.offers.map((row) => row.id).join(",")}`;
    if (key === lastKey) {
      stall += 1;
      if (stall > 8) {
        return finish(opts, slice, "stall", maxWaves);
      }
    } else {
      stall = 0;
      lastKey = key;
    }
    const action = decide(obs, opts.tier);
    actions += 1;
    try {
      if (action.type === "battle" && battle) {
        battle.choose(action.command);
        if (battle.result) {
          applyBattleEnd(slice, battle);
          battle = null;
        }
      } else if (action.type === "catch") {
        if (action.attempt) {
          slice.attemptCatch(0);
        } else {
          slice.skipCatch();
        }
      } else if (action.type === "boon") {
        if (action.reroll) {
          slice.rerollShop();
        } else if (action.id) {
          slice.takeBoon(action.id);
          battle = null;
        } else {
          return finish(opts, slice, "stall", maxWaves);
        }
      } else if (action.type === "map" && action.realmId) {
        slice.pickRealm(action.realmId);
        battle = null;
      } else if (action.type === "omen") {
        slice.pickOmen(action.optionIndex);
      }
    } catch {
      if (battle?.waitingFor === "command") {
        const artId = obs.party[obs.activeIndex]?.arts[0]?.id;
        if (artId) {
          battle.choose({ type: "art", artId });
          if (battle.result) {
            applyBattleEnd(slice, battle);
            battle = null;
          }
        }
      } else if (slice.phase === "boon" && slice.boonChoices[0]) {
        slice.takeBoon(slice.boonChoices[0].id);
        battle = null;
      } else if (slice.phase === "catch") {
        slice.skipCatch();
      } else {
        return finish(opts, slice, "stall", maxWaves);
      }
    }
  }
  return finish(opts, slice, "stall", maxWaves);
}

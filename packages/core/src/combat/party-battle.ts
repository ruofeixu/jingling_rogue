import { applyArt as sharedApply, artToUse, clearGuard, tickAilments, STRUGGLE_ID } from "./effects/apply-art.ts";
import { isFainted, makeSpirit, type SpiritEntity } from "./spirit-entity.ts";
import { FlowDirector } from "../flow/flow-director.ts";
import { RngStream } from "../rng/rng-stream.ts";
import type { BattleEvent } from "../view/battle-view.ts";
import { applyHazards, emptyField, type FieldState } from "./field.ts";
import { applyPactSwitch, hiddenPactOn, HIDDEN_PACT_BOON } from "./pact.ts";
import { tickCharms } from "./charm.ts";
import { pickTrainerArt } from "./trainer-ai.ts";
import { absorbFaint, createBoss, secondTarget, type BossState } from "./boss.ts";
import { pickTarget, speedOrder } from "./side.ts";
import { enterForm, tickForm, type CombatForm } from "./form-change.ts";
import { trySeal, SEAL_TIERS, speciesCatchRate } from "../catch/seal.ts";
import { getArt, getSpirit } from "../tables/load-tables.ts";
import type { Affinity } from "../tables/types.ts";

export type BattleKind = "wild" | "trainer";
export type PartyWaitingFor = "command" | "switch" | "target" | "over" | null;
export type PartyResult = "win" | "lose" | "fled" | null;

export type BattleCommand =
  | { type: "art"; artId: string; targetId?: string }
  | { type: "target"; targetId: string }
  | { type: "form"; form: Exclude<CombatForm, "none">; affinity?: Affinity }
  | { type: "switch"; partyIndex: number }
  | { type: "bag" }
  | { type: "run" }
  | { type: "seal"; tier: number };

export interface PartyBattle {
  kind: BattleKind;
  party: SpiritEntity[];
  foe: SpiritEntity;
  foes: SpiritEntity[];
  boss: BossState | null;
  activeIndex: number;
  potions: number;
  seals: number[];
  formKeys: Exclude<CombatForm, "none">[];
  field: FieldState;
  waitingFor: PartyWaitingFor;
  result: PartyResult;
  caught: boolean;
  readonly active: SpiritEntity;
  choose(command: BattleCommand): void;
}

export function startPartyBattle(opts: {
  partyIds: string[];
  foeId: string;
  foeIds?: string[];
  level: number;
  seed: string;
  kind: BattleKind;
  onEvent?: (event: BattleEvent) => void;
  playerHpOverride?: number;
  playerDefOverride?: number;
  foeAtkOverride?: number;
    foeHpOverride?: number;
  potions?: number;
  seals?: number[];
  catchable?: boolean;
  catchBoon?: number;
  shields?: number;
  legend?: boolean;
  statBonus?: { atk: number; def: number; spd: number; hp: number };
  partyLevel?: number;
  partyLevels?: number[];
  hpRatios?: number[];
  affinityClamp?: { min: number; max: number };
  formKeys?: Exclude<CombatForm, "none">[];
  hiddenPact?: boolean;
  secondPact?: string[];
  artMul?: (user: SpiritEntity, affinity: Affinity) => number;
}): PartyBattle {
  if (opts.partyIds.length === 0 || opts.partyIds.length > 6) {
    throw new Error("party must have 1 to 6 spirits");
  }
  const rng = new RngStream(opts.seed);
  const director = new FlowDirector();
  const emit = opts.onEvent ?? (() => undefined);
  const partyLevel = opts.partyLevel ?? opts.level;
  const party = opts.partyIds.map((id, index) =>
    makeSpirit({
      id,
      side: "player",
      level: opts.partyLevels?.[index] ?? partyLevel,
      instanceId: `player-${index}-${id}`,
      hpOverride: index === 0 ? opts.playerHpOverride : undefined,
      defOverride: index === 0 ? opts.playerDefOverride : undefined,
      hiddenPact: hiddenPactOn({
        boonIds: opts.hiddenPact ? [HIDDEN_PACT_BOON] : [],
        secondPact: opts.secondPact,
        spiritId: id,
      }),
    }),
  );
  const bonus = opts.statBonus ?? { atk: 0, def: 0, spd: 0, hp: 0 };
  for (const [index, unit] of party.entries()) {
    unit.atk += bonus.atk;
    unit.def += bonus.def;
    unit.spd += bonus.spd;
    unit.maxHp += bonus.hp;
    unit.hp += bonus.hp;
    if (opts.hpRatios) {
      const ratio = Math.min(1, Math.max(0, opts.hpRatios[index] ?? 1));
      unit.hp = Math.round(unit.maxHp * ratio);
    }
  }
  const startIndex = Math.max(0, party.findIndex((unit) => !isFainted(unit)));
  const foeIds = opts.foeIds ?? [opts.foeId];
  const foes = foeIds.map((id, index) =>
    makeSpirit({
      id,
      side: "foe",
      level: opts.level,
      instanceId: `foe-${index}-${id}`,
      atkOverride: opts.foeAtkOverride,
      hpOverride: index === 0 ? opts.foeHpOverride : undefined,
    }),
  );
  const foe = foes[0];
  let pendingArt: string | null = null;

  const battle: PartyBattle = {
    kind: opts.kind,
    party,
    foe,
    foes,
    boss: opts.legend || (opts.shields ?? 0) > 0 ? createBoss(opts.shields ?? 0) : null,
    activeIndex: startIndex,
    potions: opts.potions ?? 0,
    seals: opts.seals ?? [0, 0, 0, 0, 0],
    formKeys: opts.formKeys ?? [],
    field: emptyField(),
    waitingFor: null,
    result: null,
    caught: false,
    get active() {
      return battle.party[battle.activeIndex];
    },
    choose(command: BattleCommand) {
      if (battle.waitingFor === "over") {
        throw new Error("battle is over");
      }
      if (battle.waitingFor === "switch") {
        if (command.type !== "switch") {
          throw new Error("must switch");
        }
        assertSwitch(command.partyIndex);
        battle.waitingFor = null;
        director.push({
          name: "ForcedSwitch",
          run: () => applySwitch(command.partyIndex, false),
        });
        director.drain();
        faintCheck();
        if (!battle.result && battle.waitingFor !== "switch") {
          director.push({
            name: "CommandPick",
            run: commandPick,
          });
          director.drain();
        }
        return;
      }
      if (battle.waitingFor === "target") {
        if (command.type !== "target" || !pendingArt) {
          throw new Error("must pick a target");
        }
        const artId = pendingArt;
        pendingArt = null;
        battle.waitingFor = null;
        finishTurn({ type: "art", artId, targetId: command.targetId });
        return;
      }
      if (battle.waitingFor !== "command") {
        throw new Error("not waiting for command");
      }
      if (command.type === "run" && battle.kind === "trainer") {
        throw new Error("cannot run from a trainer");
      }
      if (command.type === "seal") {
        if (battle.kind !== "wild" || !opts.catchable) {
          throw new Error("cannot seal this encounter");
        }
        const count = battle.seals[command.tier] ?? 0;
        if (count <= 0) {
          throw new Error("no seal");
        }
      }
      if (command.type === "bag" && battle.potions <= 0) {
        throw new Error("bag empty");
      }
      if (command.type === "form" && !battle.formKeys.includes(command.form)) {
        throw new Error("form locked");
      }
      if (command.type === "switch") {
        assertSwitch(command.partyIndex);
      }
      if (
        command.type === "art" &&
        livingFoes().length > 1 &&
        !command.targetId
      ) {
        pendingArt = command.artId;
        battle.waitingFor = "target";
        emit({ type: "awaitTarget" });
        return;
      }
      battle.waitingFor = null;
      finishTurn(command);
    },
  };

  function finishTurn(command: BattleCommand): void {
    director.push({
      name: "CommandResolve",
      run: () => resolveCommand(command),
    });
    director.push({
      name: "FaintCheck",
      run: faintCheck,
    });
    director.drain();
    if (!battle.result && battle.waitingFor !== "switch") {
      for (const unit of fielded()) {
        tickAilments(unit);
        tickCharms(unit);
        tickForm(unit);
        clearGuard(unit);
      }
      faintCheck();
    }
    if (!battle.result && battle.waitingFor !== "switch") {
      director.push({
        name: "CommandPick",
        run: commandPick,
      });
      director.drain();
    }
  }

  function commandPick(): void {
    battle.waitingFor = "command";
    emit({ type: "awaitCommand", actorId: battle.active.instanceId });
  }

  function applyArt(user: SpiritEntity, target: SpiritEntity, artId: string): void {
    const affinity = artId === STRUGGLE_ID ? user.affinities[0] : getArt(artId).affinity;
    sharedApply(user, target, artId, rng, emit, {
      field: battle.field,
      affinityClamp: opts.affinityClamp,
      powerMul: affinity ? opts.artMul?.(user, affinity) ?? 1 : 1,
    });
  }

  function assertSwitch(partyIndex: number): void {
    if (partyIndex === battle.activeIndex) {
      throw new Error("already active");
    }
    const next = battle.party[partyIndex];
    if (!next || isFainted(next)) {
      throw new Error("cannot switch to that spirit");
    }
  }

  function applySwitch(partyIndex: number, foeActs: boolean): void {
    const next = battle.party[partyIndex];
    battle.activeIndex = partyIndex;
    emit({ type: "switchIn", actorId: next.instanceId });
    applyHazards(next, next.side, battle.field);
    applyPactSwitch(next);
    if (foeActs) {
      foeTurn();
    }
  }

  function livingFoes(): SpiritEntity[] {
    return battle.foes.filter((unit) => !isFainted(unit));
  }

  function fielded(): SpiritEntity[] {
    const ally = battle.foes.length > 1 ? battle.party[1] : undefined;
    const units = [battle.active];
    if (ally && ally !== battle.active) {
      units.push(ally);
    }
    units.push(...battle.foes);
    return units;
  }

  function foeTurn(): void {
    for (const unit of livingFoes()) {
      if (!isFainted(battle.active)) {
        applyArt(unit, battle.active, pickTrainerArt(unit, battle.active));
      }
    }
  }

  function resolveCommand(command: BattleCommand): void {
    if (command.type === "run") {
      battle.result = "fled";
      battle.waitingFor = "over";
      emit({ type: "fled" });
      emit({ type: "runOver", result: "fled" });
      return;
    }
    if (command.type === "seal") {
      battle.seals[command.tier] -= 1;
      const mul = SEAL_TIERS[command.tier]?.mul ?? SEAL_TIERS[0].mul;
      const hpRatio = battle.foe.maxHp <= 0 ? 1 : battle.foe.hp / battle.foe.maxHp;
      const result = trySeal({
        hpRatio,
        sealMul: mul,
        catchRate: speciesCatchRate(getSpirit(battle.foe.id)),
        catchBoon: opts.catchBoon ?? 0,
        rng,
      });
      emit({
        type: "sealTried",
        name: battle.foe.name,
        caught: result.caught,
        chance: result.chance,
      });
      if (result.caught) {
        battle.caught = true;
        battle.result = "win";
        battle.waitingFor = "over";
        emit({ type: "runOver", result: "win" });
        return;
      }
      foeTurn();
      return;
    }
    if (command.type === "switch") {
      applySwitch(command.partyIndex, true);
      return;
    }
    if (command.type === "bag") {
      battle.potions -= 1;
      const heal = Math.max(20, Math.floor(battle.active.maxHp * 0.1));
      battle.active.hp = Math.min(battle.active.maxHp, battle.active.hp + heal);
      emit({
        type: "hpChange",
        targetId: battle.active.instanceId,
        hp: battle.active.hp,
        maxHp: battle.active.maxHp,
      });
      foeTurn();
      return;
    }
    if (command.type === "form") {
      enterForm(battle.active, command.form, command.affinity);
      foeTurn();
      return;
    }
    if (command.type === "target") {
      return;
    }
    const player = battle.active;
    const artId = artToUse(player, command.artId);
    const target = pickTarget(battle.foes, command.targetId);
    for (const unit of speedOrder(fielded())) {
      if (isFainted(player) || livingFoes().length === 0) {
        return;
      }
      if (unit === player) {
        applyArt(player, target, artId);
        continue;
      }
      if (unit.side === "player") {
        const foe = pickTarget(battle.foes);
        applyArt(unit, foe, pickTrainerArt(unit, foe));
        continue;
      }
      if (!isFainted(unit) && !isFainted(player)) {
        applyArt(unit, player, pickTrainerArt(unit, player));
      }
    }
  }

  function hasBench(): boolean {
    return battle.party.some((spirit, index) => index !== battle.activeIndex && !isFainted(spirit));
  }

  function faintCheck(): void {
    if (battle.result) {
      return;
    }
    const down = battle.foes.filter((unit) => isFainted(unit));
    for (const unit of down) {
      if (unit === battle.foe && battle.boss) {
        emit({ type: "faint", targetId: unit.instanceId });
        const absorbed = absorbFaint(battle.boss, battle.foe);
        if (absorbed !== "down") {
          if (battle.boss.dual && battle.foes.length < 2) {
            battle.foes.push(secondTarget(battle.foe));
          }
          return;
        }
      }
    }
    if (livingFoes().length === 0) {
      emit({ type: "faint", targetId: battle.foe.instanceId });
      battle.result = "win";
      battle.waitingFor = "over";
      emit({ type: "runOver", result: "win" });
      return;
    }
    if (isFainted(battle.active)) {
      emit({ type: "faint", targetId: battle.active.instanceId });
      if (hasBench()) {
        battle.waitingFor = "switch";
        emit({ type: "awaitSwitch" });
        return;
      }
      battle.result = "lose";
      battle.waitingFor = "over";
      emit({ type: "runOver", result: "lose" });
    }
  }

  director.push({
    name: "EncounterStart",
    run: () => {
      emit({ type: "encounterStart", playerId: battle.active.id, foeId: battle.foe.id });
    },
  });
  director.push({
    name: "CommandPick",
    run: commandPick,
  });
  director.drain();
  return battle;
}

function battleSnap(battle: PartyBattle): string {
  return [
    battle.waitingFor,
    battle.result,
    battle.activeIndex,
    battle.potions,
    battle.party.map((unit) => unit.hp).join(","),
    battle.foes.map((unit) => unit.hp).join(","),
  ].join("|");
}

export function applySafeCommand(battle: PartyBattle, command: BattleCommand): boolean {
  if (battle.waitingFor === "over" || battle.result) {
    return false;
  }
  const before = battleSnap(battle);
  try {
    battle.choose(command);
  } catch {
    return false;
  }
  return battleSnap(battle) !== before;
}

import { applyArt } from "./effects/apply-art.ts";
import { isFainted, makeSpirit, type SpiritEntity } from "./spirit-entity.ts";
import { FlowDirector } from "../flow/flow-director.ts";
import { RngStream } from "../rng/rng-stream.ts";
import type { BattleEvent } from "../view/battle-view.ts";

export type WaitingFor = "command" | "over" | null;

export interface Duel {
  player: SpiritEntity;
  foe: SpiritEntity;
  waitingFor: WaitingFor;
  result: "win" | "lose" | null;
  chooseArt(artId: string): void;
}

export function startDuel(opts: {
  playerId: string;
  foeId: string;
  level: number;
  seed: string;
  onEvent?: (event: BattleEvent) => void;
  playerAtkOverride?: number;
  foeDefOverride?: number;
  foeHpOverride?: number;
}): Duel {
  const rng = new RngStream(opts.seed);
  const director = new FlowDirector();
  const emit = opts.onEvent ?? (() => undefined);
  const player = makeSpirit({
    id: opts.playerId,
    side: "player",
    level: opts.level,
    atkOverride: opts.playerAtkOverride,
  });
  const foe = makeSpirit({
    id: opts.foeId,
    side: "foe",
    level: opts.level,
    defOverride: opts.foeDefOverride,
    hpOverride: opts.foeHpOverride,
  });

  const duel: Duel = {
    player,
    foe,
    waitingFor: null,
    result: null,
    chooseArt(artId: string) {
      if (duel.waitingFor !== "command") {
        throw new Error("not waiting for command");
      }
      duel.waitingFor = null;
      director.push({
        name: "ArtResolve",
        run: () => resolveTurn(artId),
      });
      director.push({
        name: "FaintCheck",
        run: faintCheck,
      });
      director.drain();
      if (!duel.result) {
        director.push({
          name: "CommandPick",
          run: commandPick,
        });
        director.drain();
      }
    },
  };

  function commandPick(): void {
    duel.waitingFor = "command";
    emit({ type: "awaitCommand", actorId: player.instanceId });
  }

  function playArt(user: SpiritEntity, target: SpiritEntity, artId: string): void {
    applyArt(user, target, artId, rng, emit);
  }

  function resolveTurn(playerArtId: string): void {
    const foeArtId = foe.artIds[0];
    const order =
      player.spd >= foe.spd
        ? ([
            () => playArt(player, foe, playerArtId),
            () => playArt(foe, player, foeArtId),
          ] as const)
        : ([
            () => playArt(foe, player, foeArtId),
            () => playArt(player, foe, playerArtId),
          ] as const);
    for (const act of order) {
      act();
      if (isFainted(player) || isFainted(foe)) {
        return;
      }
    }
  }

  function faintCheck(): void {
    if (isFainted(foe)) {
      emit({ type: "faint", targetId: foe.instanceId });
      duel.result = "win";
      duel.waitingFor = "over";
      emit({ type: "runOver", result: "win" });
      return;
    }
    if (isFainted(player)) {
      emit({ type: "faint", targetId: player.instanceId });
      duel.result = "lose";
      duel.waitingFor = "over";
      emit({ type: "runOver", result: "lose" });
    }
  }

  director.push({
    name: "EncounterStart",
    run: () => {
      emit({ type: "encounterStart", playerId: player.id, foeId: foe.id });
    },
  });
  director.push({
    name: "CommandPick",
    run: commandPick,
  });
  director.drain();
  return duel;
}

import { applySafeCommand } from "../combat/party-battle.ts";
import { ClassicSlice } from "../run/classic-slice.ts";
import { starterRelicIds } from "../meta/relics.ts";
import { observeBattle } from "./observe.ts";
import { decide } from "./policies.ts";
import { applyBattleEnd, openBattle } from "./run-sim.ts";

export function measureGuideTaps(opts: { seed: string; maxWaves?: number; maxActions?: number }): {
  taps: number;
  dead: number;
} {
  const maxWaves = opts.maxWaves ?? 10;
  const maxActions = opts.maxActions ?? 800;
  const slice = new ClassicSlice({ seed: opts.seed, starterId: "zao_li", relicId: starterRelicIds()[0] });
  slice.beginWave();
  let battle = openBattle(slice) as ReturnType<typeof openBattle> | null;
  let taps = 0;
  let dead = 0;
  let actions = 0;
  while (actions < maxActions && slice.phase !== "defeat" && slice.phase !== "victory") {
    if (slice.phase === "battle" && !battle) {
      if (slice.run.wave > maxWaves) {
        break;
      }
      slice.beginWave();
      battle = openBattle(slice);
    }
    const obs = observeBattle(slice, battle);
    const action = decide(obs, "guide");
    actions += 1;
    if (action.type === "battle" && battle) {
      taps += 1;
      if (!applySafeCommand(battle, action.command)) {
        dead += 1;
      }
      if (battle.result) {
        applyBattleEnd(slice, battle);
        battle = null;
        continue;
      }
      continue;
    }
    if (action.type === "catch") {
      taps += 1;
      if (action.attempt) {
        slice.attemptCatch(0);
      } else {
        slice.skipCatch();
      }
      continue;
    }
    if (action.type === "boon") {
      taps += 1;
      if (action.id) {
        slice.takeBoon(action.id);
        battle = null;
      }
      continue;
    }
    if (action.type === "map" && action.realmId) {
      taps += 1;
      slice.pickRealm(action.realmId);
      battle = null;
    }
  }
  return { taps, dead };
}

import { pickNextRealm } from "../classic-schedule.ts";
import { grantMarkForWave } from "../night-marks.ts";
import type { RunSession } from "../run-session.ts";
import { healOnShift, shiftEvery } from "./types.ts";

export function advanceAfterWin(run: RunSession): { shifted: boolean; healed: boolean } {
  const cleared = run.wave;
  run.wave += 1;
  if (run.mode === "endless" || run.mode === "spliced") {
    run.nightMarks = grantMarkForWave(run.nightMarks, cleared, run.seed);
  }
  const every = shiftEvery(run.mode);
  if (cleared % every !== 0) {
    return { shifted: false, healed: false };
  }
  const healed = healOnShift(run.mode);
  if (healed) {
    run.partyHpRatios = run.partyHpRatios.map(() => 1);
  }
  if (run.mode === "endless" || run.mode === "spliced" || !run.hasMap) {
    run.realmId = pickNextRealm({
      realmId: run.realmId,
      seed: run.seed,
      wave: cleared,
      hasMap: false,
    });
  }
  return { shifted: true, healed };
}

import type { RunSession } from "./run-session.ts";

export function moveCharm(run: RunSession, from: number, to: number, charmId: string): void {
  if (charmId === "bone_dose" || charmId.startsWith("bone_dose")) {
    throw new Error("bone dose cannot move");
  }
  const source = run.partyCharms[from];
  const target = run.partyCharms[to];
  if (!source || !target) {
    throw new Error("invalid party index");
  }
  const index = source.indexOf(charmId);
  if (index < 0) {
    throw new Error("charm not on source");
  }
  source.splice(index, 1);
  target.push(charmId);
}

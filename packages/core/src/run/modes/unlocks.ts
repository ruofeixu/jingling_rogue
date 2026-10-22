export type UnlockId =
  | "endless"
  | "challenge"
  | "spliced"
  | "lost_swallow_pool"
  | "baby_te_pool"
  | "legend_catch"
  | "jie_shop";

export interface UnlockFlags {
  classicCleared: boolean;
  fusedClear: boolean;
  carryBaby: boolean;
  legendCatchReady: boolean;
}

export const UNLOCK_IDS: UnlockId[] = [
  "endless",
  "challenge",
  "spliced",
  "lost_swallow_pool",
  "baby_te_pool",
  "legend_catch",
  "jie_shop",
];

export function isUnlocked(id: UnlockId, flags: UnlockFlags): boolean {
  if (id === "spliced") {
    return flags.fusedClear;
  }
  if (id === "baby_te_pool") {
    return flags.carryBaby;
  }
  if (id === "legend_catch") {
    return flags.legendCatchReady;
  }
  return flags.classicCleared;
}

export function unlockedIds(flags: UnlockFlags): UnlockId[] {
  return UNLOCK_IDS.filter((id) => isUnlocked(id, flags));
}

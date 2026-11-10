export type UnlockId =
  | "endless"
  | "challenge"
  | "lost_swallow_pool"
  | "baby_te_pool"
  | "legend_catch"
  | "jie_shop";

export interface UnlockFlags {
  classicCleared: boolean;
  carryBaby: boolean;
  legendCatchReady: boolean;
}

export const UNLOCK_IDS: UnlockId[] = [
  "endless",
  "challenge",
  "lost_swallow_pool",
  "baby_te_pool",
  "legend_catch",
  "jie_shop",
];

export function isUnlocked(id: UnlockId, flags: UnlockFlags): boolean {
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

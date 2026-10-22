export type RunMode = "classic" | "daily" | "endless" | "spliced" | "challenge";

export type ChallengeId = "lineage" | "affinity" | "blank" | "invert" | "boneswap";

export const BLANK_PARTY = ["zao_li", "jing_zhu", "tao_geng"] as const;

export function costCap(mode: RunMode): 10 | 15 {
  return mode === "endless" || mode === "spliced" ? 15 : 10;
}

export function shiftEvery(mode: RunMode): number {
  return mode === "endless" || mode === "spliced" ? 5 : 10;
}

export function healOnShift(mode: RunMode): boolean {
  return mode !== "endless" && mode !== "spliced";
}

export function finaleWave(mode: RunMode, sprint = false): number | null {
  if (sprint) {
    return 20;
  }
  if (mode === "classic" || mode === "challenge") {
    return 200;
  }
  if (mode === "daily") {
    return 50;
  }
  return null;
}

export function allowsShopBuy(mode: RunMode): boolean {
  return mode === "classic" || mode === "challenge";
}

export function hasTrainers(mode: RunMode): boolean {
  return mode === "classic" || mode === "daily" || mode === "challenge";
}

export function modeRules(mode: RunMode): {
  costCap: 10 | 15;
  finaleWave: number | null;
  shiftEvery: number;
  healOnShift: boolean;
  shopBuy: boolean;
  trainers: boolean;
  fuseFoes: boolean;
  stackedChallenges: boolean;
} {
  return {
    costCap: costCap(mode),
    finaleWave: finaleWave(mode),
    shiftEvery: shiftEvery(mode),
    healOnShift: healOnShift(mode),
    shopBuy: allowsShopBuy(mode),
    trainers: hasTrainers(mode),
    fuseFoes: mode === "spliced",
    stackedChallenges: mode === "challenge",
  };
}

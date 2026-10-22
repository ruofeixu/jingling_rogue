import type { RngStream } from "../rng/rng-stream.ts";

export const SEAL_TIERS = [
  { id: "fan", name: "凡镇", mul: 1 },
  { id: "shang", name: "上镇", mul: 1.5 },
  { id: "te", name: "特镇", mul: 2 },
  { id: "qi", name: "奇镇", mul: 3 },
  { id: "jie", name: "劫镇", mul: 255 },
] as const;

export function speciesCatchRate(row: { starter: boolean; evolveTo?: string }): number {
  return row.evolveTo ? 255 : 45;
}

export function catchChance(opts: {
  hpRatio: number;
  sealMul: number;
  catchRate: number;
  catchBoon: number;
}): number {
  const hpRatio = Math.min(1, Math.max(0, opts.hpRatio));
  const hpTerm = (3 - 2 * hpRatio) / 3;
  const a = hpTerm * opts.catchRate * opts.sealMul * (1 + opts.catchBoon);
  return Math.min(1, Math.max(0, a / 255));
}

export function trySeal(opts: {
  hpRatio: number;
  sealMul: number;
  catchRate: number;
  catchBoon: number;
  rng: RngStream;
}): { chance: number; caught: boolean } {
  const chance = catchChance(opts);
  return { chance, caught: opts.rng.float() < chance };
}

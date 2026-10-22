import type { Affinity, TypeChart } from "../tables/types.ts";
import type { RngStream } from "../rng/rng-stream.ts";

export function affinityMod(
  artAffinity: Affinity,
  defender: Affinity[],
  chart: TypeChart,
  invert = false,
): number {
  const raw = defender.reduce((acc, d) => acc * chart[artAffinity][d], 1);
  if (!invert) {
    return raw;
  }
  if (raw === 0 || raw === 0.5) {
    return 2;
  }
  if (raw === 2) {
    return 0.5;
  }
  return raw;
}

export function clampAffinity(mod: number, range?: { min: number; max: number }): number {
  if (!range || mod === 0) {
    return mod;
  }
  return Math.min(range.max, Math.max(range.min, mod));
}

export function calcDamage(opts: {
  power: number;
  atk: number;
  def: number;
  level: number;
  affinityMod: number;
  boneMod: number;
  rng: RngStream;
}): number {
  if (opts.power <= 0) {
    return 0;
  }
  const levelScale = opts.level / 50;
  const base = (opts.power * opts.atk) / Math.max(opts.def, 1) * levelScale + 2;
  const roll = 0.85 + opts.rng.float() * 0.15;
  return Math.max(1, Math.floor(base * opts.affinityMod * roll * opts.boneMod));
}

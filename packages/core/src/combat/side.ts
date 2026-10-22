import { isFainted, type SpiritEntity } from "./spirit-entity.ts";

export interface Lure {
  id: string;
  remaining: number;
  rate: number;
}

const LURE_RATE: Record<string, number> = {
  lure_fan: 0.1,
  lure_shang: 0.25,
  lure_te: 0.5,
  lure_gold: 1,
};

export function lureRate(id: string): number {
  return LURE_RATE[id] ?? 0;
}

export function addLure(lures: Lure[], id: string): Lure[] {
  const next = lures.filter((row) => row.id !== id);
  next.push({ id, remaining: 10, rate: lureRate(id) });
  return next;
}

export function tickLures(lures: Lure[]): Lure[] {
  return lures
    .map((row) => ({ ...row, remaining: row.remaining - 1 }))
    .filter((row) => row.remaining > 0);
}

export function dualChance(lures: Lure[], wave = 1): number {
  const base = wave <= 20 ? 0.03 : wave <= 180 ? 0.2 : 0.03;
  return Math.min(1, base + lures.reduce((sum, row) => sum + row.rate, 0));
}

export function canDual(opts: { mode?: string; wave: number; boss: boolean }): boolean {
  if (opts.mode === "endless" && opts.boss && opts.wave % 50 === 0) {
    return false;
  }
  if (opts.wave <= 10 && !opts.boss) {
    return false;
  }
  return true;
}

export function speedOrder(units: SpiritEntity[]): SpiritEntity[] {
  return [...units]
    .filter((unit) => !isFainted(unit))
    .sort(
      (a, b) =>
        b.spd - a.spd ||
        (a.side === "player" && b.side !== "player" ? -1 : b.side === "player" && a.side !== "player" ? 1 : 0) ||
        a.instanceId.localeCompare(b.instanceId),
    );
}

export function pickTarget(foes: SpiritEntity[], targetId?: string): SpiritEntity {
  const living = foes.filter((unit) => !isFainted(unit));
  if (living.length === 0) {
    throw new Error("no target");
  }
  return living.find((unit) => unit.instanceId === targetId) ?? living[0];
}

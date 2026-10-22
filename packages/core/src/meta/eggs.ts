import { RngStream } from "../rng/rng-stream.ts";
import pools from "../tables/eggs.json";
import type { AccountProgress } from "../run/run-session.ts";
import { evaluateAchievements } from "../run/achievements.ts";
import { getSpirit } from "../tables/load-tables.ts";

export type VoucherTier = "fan" | "shang" | "te" | "jin";
export type EggTier = "fan" | "shang" | "te" | "epic";

export interface Egg {
  id: string;
  spiritId: string;
  tier: EggTier;
  steps: number;
}

const VOUCHER_EGGS: Record<VoucherTier, number> = {
  fan: 1,
  shang: 5,
  te: 10,
  jin: 25,
};

const HATCH_STEPS: Record<EggTier, number> = {
  fan: 1000,
  shang: 2000,
  te: 4000,
  epic: 6000,
};

type PoolFile = Record<EggTier, string[]>;
const POOLS = pools as PoolFile;

export type EggMachineKind = "lineage" | "eggArt" | "form";

const MACHINE_ENTRIES: { spiritId: string; tier: EggTier }[] = (["fan", "shang", "te", "epic"] as EggTier[]).flatMap(
  (tier) => POOLS[tier].map((spiritId) => ({ spiritId, tier })),
);

export function voucherEggCount(tier: VoucherTier): number {
  return VOUCHER_EGGS[tier];
}

export function redeemVoucher(account: AccountProgress, tier: VoucherTier, seed: string): Egg[] {
  if ((account.vouchers[tier] ?? 0) <= 0) {
    throw new Error("no voucher");
  }
  account.vouchers[tier] -= 1;
  const count = VOUCHER_EGGS[tier];
  const rng = new RngStream(seed);
  const eggs: Egg[] = [];
  for (let i = 0; i < count; i++) {
    eggs.push(rollEgg(rng, `${seed}-${i}`));
  }
  if (tier === "te" && !eggs.some((egg) => egg.tier === "shang" || egg.tier === "te" || egg.tier === "epic")) {
    eggs[eggs.length - 1] = makeEgg(pickFrom("shang", rng), "shang", `${seed}-pity`);
  }
  if (tier === "jin" && !eggs.some((egg) => egg.tier === "epic")) {
    eggs[eggs.length - 1] = makeEgg(pickFrom("epic", rng), "epic", `${seed}-pity`);
  }
  account.eggs.push(...eggs);
  return eggs;
}

export function tickEggs(account: AccountProgress, steps: number): void {
  for (const egg of account.eggs) {
    egg.steps = Math.max(0, egg.steps - steps);
  }
}

export function skipEggSteps(account: AccountProgress): void {
  for (const egg of account.eggs) {
    egg.steps = 0;
  }
}

export function hatchReady(account: AccountProgress): Egg[] {
  return account.eggs.filter((egg) => egg.steps <= 0);
}

export function grantSpeciesEgg(account: AccountProgress, spiritId: string, seed: string): Egg {
  const egg = makeEgg(spiritId, "fan", seed);
  account.eggs.push(egg);
  return egg;
}

export function hatchEgg(account: AccountProgress, eggId: string): string {
  const index = account.eggs.findIndex((egg) => egg.id === eggId);
  if (index < 0) {
    throw new Error("no egg");
  }
  const egg = account.eggs[index];
  if (egg.steps > 0) {
    throw new Error("not ready");
  }
  account.eggs.splice(index, 1);
  if (!account.codex.includes(egg.spiritId)) {
    account.codex.push(egg.spiritId);
  }
  const bone = account.boneCap[egg.spiritId] ?? 10;
  account.boneCap[egg.spiritId] = Math.min(31, bone + 1);
  evaluateAchievements(account, { type: "hatch" });
  return egg.spiritId;
}

function rollEgg(rng: RngStream, key: string): Egg {
  const roll = rng.float();
  const tier: EggTier = roll < 0.02 ? "epic" : roll < 0.12 ? "te" : roll < 0.4 ? "shang" : "fan";
  return makeEgg(pickFrom(tier, rng), tier, key);
}

function pickFrom(tier: EggTier, rng: RngStream): string {
  const pool = POOLS[tier];
  return pool[rng.int(pool.length)];
}

function makeEgg(spiritId: string, tier: EggTier, key: string): Egg {
  return {
    id: `egg-${key}-${spiritId}`,
    spiritId,
    tier,
    steps: HATCH_STEPS[tier],
  };
}

export function dailyLegendPool(utcDate: string): string[] {
  const rng = new RngStream(`${utcDate}|legend-eggs`);
  const epic = [...POOLS.epic];
  for (let i = epic.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const swap = epic[i];
    epic[i] = epic[j];
    epic[j] = swap;
  }
  return epic.slice(0, Math.min(2, epic.length));
}

function machineWeight(kind: EggMachineKind, spiritId: string, tier: EggTier, legends: string[]): number {
  if (kind === "lineage" && getSpirit(spiritId).affinities.includes("flame")) {
    return 6;
  }
  if (kind === "eggArt" && tier === "te") {
    return 7;
  }
  if (kind === "form" && (tier === "epic" || legends.includes(spiritId))) {
    return 9;
  }
  return 1;
}

export function rollMachine(kind: EggMachineKind, seed: string, utcDate: string): Egg {
  const rng = new RngStream(`${seed}|${kind}|${utcDate}`);
  const legends = dailyLegendPool(utcDate);
  const weights = MACHINE_ENTRIES.map((row) => machineWeight(kind, row.spiritId, row.tier, legends));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let ticket = rng.float() * total;
  let picked = MACHINE_ENTRIES[MACHINE_ENTRIES.length - 1];
  for (let i = 0; i < MACHINE_ENTRIES.length; i++) {
    ticket -= weights[i];
    if (ticket <= 0) {
      picked = MACHINE_ENTRIES[i];
      break;
    }
  }
  return makeEgg(picked.spiritId, picked.tier, `${seed}-${kind}`);
}

export function useEggMachine(
  account: AccountProgress,
  kind: EggMachineKind,
  seed: string,
  utcDate: string,
): Egg {
  if ((account.vouchers.fan ?? 0) <= 0) {
    throw new Error("no voucher");
  }
  account.vouchers.fan -= 1;
  const egg = rollMachine(kind, seed, utcDate);
  account.eggs.push(egg);
  return egg;
}

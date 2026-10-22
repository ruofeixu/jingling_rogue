import { RngStream } from "../rng/rng-stream.ts";
import { getSpirit, loadTables } from "../tables/load-tables.ts";
import type { BoonRow, ShopTier } from "../tables/types.ts";

export type ShopOffer = BoonRow & { tier: ShopTier };

export interface ShopFilter {
  partyIds?: string[];
  mode?: string;
  seenCount?: number;
  challenges?: string[];
  boonIds?: string[];
  hasApexBand?: boolean;
  fusedIds?: string[];
}

export interface ShopState extends ShopFilter {
  wave: number;
  gold: number;
  rerolls: number;
  goldenSlots: number;
  lock: boolean;
  seed: string;
  hpRatios: number[];
  offers: ShopOffer[];
}

const LOCK_BASE: Record<ShopTier, number> = {
  fan: 50,
  shang: 125,
  te: 300,
  qi: 750,
  jie: 2000,
};

const TIER_ROLL: { tier: ShopTier; chance: number }[] = [
  { tier: "fan", chance: 0.75 },
  { tier: "shang", chance: 0.1904 },
  { tier: "te", chance: 0.0469 },
  { tier: "qi", chance: 0.0117 },
  { tier: "jie", chance: 0.001 },
];

export function potionWeight(hpRatios: number[]): number {
  let weight = 0;
  for (const ratio of hpRatios) {
    if (ratio <= 0.875) {
      weight += 3;
    }
  }
  return Math.min(9, weight);
}

export function forcedTiers(wave: number): ShopTier[] | null {
  if (wave === 25) {
    return ["te", "shang", "shang"];
  }
  if (wave === 55) {
    return ["te", "te", "shang", "shang"];
  }
  if (wave === 95) {
    return ["te", "te", "te", "te"];
  }
  if (wave === 115) {
    return ["qi", "qi", "te", "te", "te"];
  }
  if (wave === 145) {
    return ["qi", "qi", "qi", "te", "te"];
  }
  if (wave === 165) {
    return ["qi", "qi", "te", "te", "te", "te"];
  }
  if (wave === 195) {
    return ["qi", "qi", "te", "te", "shang", "shang"];
  }
  return null;
}

export function rerollCost(wave: number, rerolls: number, locked?: ShopTier[]): number {
  const band = Math.ceil(wave / 10);
  const growth = 2 ** rerolls;
  if (locked && locked.length > 0) {
    const base = locked.reduce((sum, tier) => sum + LOCK_BASE[tier], 0);
    return base * band * growth;
  }
  return 250 * band * growth;
}

export function eligibleShopBoons(opts: {
  wave: number;
  partyIds?: string[];
  mode?: string;
  rerolls?: number;
  boonIds?: string[];
  seenCount?: number;
  challenges?: string[];
  hasApexBand?: boolean;
  fusedIds?: string[];
  hpRatios?: number[];
}): ShopOffer[] {
  const draughtWeight = potionWeight(opts.hpRatios ?? [1]);
  const rerolls = opts.rerolls ?? 0;
  const partyIds = opts.partyIds;
  const keys = opts.boonIds ?? [];
  return loadTables().boons.flatMap((row) => {
    if (row.kind === "map" && opts.wave > 180) {
      return [];
    }
    if ((row.kind === "gold" || row.kind === "exp") && opts.wave === 199) {
      return [];
    }
    if (row.kind === "evolve" && partyIds) {
      const canEvolve = partyIds.some((id) => Boolean(getSpirit(id).evolveTo));
      if (!canEvolve) {
        return [];
      }
    }
    if (row.kind === "formItem") {
      if (row.id === "sanctify_stone" && !keys.includes("sanctify_cuff")) {
        return [];
      }
      if (row.id === "colossus_shroom" && !keys.includes("colossus_band")) {
        return [];
      }
      if (row.id === "apex_crystal" && !opts.hasApexBand && !keys.includes("apex_vessel")) {
        return [];
      }
    }
    if (row.kind === "splicer" && partyIds && partyIds.length < 2) {
      return [];
    }
    if (row.kind === "voucher" && opts.mode === "daily") {
      return [];
    }
    if (row.id === "voucher_te" && opts.mode === "endless") {
      return [];
    }
    if (row.id === "catch_charm") {
      if ((opts.seenCount ?? 0) < 100 || (opts.challenges ?? []).includes("blank")) {
        return [];
      }
    }
    const tier = row.tier ?? "fan";
    let weight = row.weight;
    if (row.kind === "potion") {
      weight = draughtWeight;
    }
    if (row.kind === "evolve") {
      weight = row.weight * Math.max(1, Math.ceil(opts.wave / 25));
    }
    if (row.kind === "voucher") {
      weight = row.weight / 2 ** rerolls;
    }
    return [{ ...row, tier, weight }];
  });
}

export function openShop(opts: {
  wave: number;
  seed: string;
  gold: number;
  goldenSlots?: number;
  hpRatios?: number[];
  lock?: boolean;
  rerolls?: number;
} & ShopFilter): ShopState {
  const goldenSlots = opts.goldenSlots ?? 0;
  const forced = forcedTiers(opts.wave) ?? [];
  const slots = Math.min(6, Math.max(3 + goldenSlots, forced.length));
  const hpRatios = opts.hpRatios ?? [1];
  const rerolls = opts.rerolls ?? 0;
  const rng = new RngStream(opts.seed).child(1000 + opts.wave + rerolls * 97);
  const offers = rollOffers(rng, slots, {
    wave: opts.wave,
    hpRatios,
    rerolls,
    partyIds: opts.partyIds,
    mode: opts.mode,
    seenCount: opts.seenCount,
    challenges: opts.challenges,
    boonIds: opts.boonIds,
    hasApexBand: opts.hasApexBand,
    fusedIds: opts.fusedIds,
  });
  return {
    wave: opts.wave,
    gold: opts.gold,
    rerolls,
    goldenSlots,
    lock: opts.lock ?? opts.wave === 165,
    seed: opts.seed,
    hpRatios,
    offers,
    partyIds: opts.partyIds,
    mode: opts.mode,
    seenCount: opts.seenCount,
    challenges: opts.challenges,
    boonIds: opts.boonIds,
    hasApexBand: opts.hasApexBand,
    fusedIds: opts.fusedIds,
  };
}

export function rerollShop(shop: ShopState, seed = shop.seed): ShopState {
  const locked = shop.lock ? shop.offers.map((row) => row.tier) : undefined;
  const cost = rerollCost(shop.wave, shop.rerolls, locked);
  if (shop.gold < cost) {
    throw new Error("not enough gold");
  }
  return openShop({
    wave: shop.wave,
    seed,
    gold: shop.gold - cost,
    goldenSlots: shop.goldenSlots,
    hpRatios: shop.hpRatios,
    lock: shop.lock,
    rerolls: shop.rerolls + 1,
    partyIds: shop.partyIds,
    mode: shop.mode,
    seenCount: shop.seenCount,
    challenges: shop.challenges,
    boonIds: shop.boonIds,
    hasApexBand: shop.hasApexBand,
    fusedIds: shop.fusedIds,
  });
}

function rollOffers(rng: RngStream, slots: number, filter: Parameters<typeof eligibleShopBoons>[0]): ShopOffer[] {
  const forced = forcedTiers(filter.wave) ?? [];
  const pool = eligibleShopBoons(filter);
  const offers: ShopOffer[] = [];
  for (let i = 0; i < slots; i++) {
    const tier = forced[i] ?? rollTier(rng);
    const picked = takeFromTier(rng, pool, tier);
    offers.push(picked);
  }
  return offers;
}

function rollTier(rng: RngStream): ShopTier {
  let ticket = rng.float();
  for (const row of TIER_ROLL) {
    ticket -= row.chance;
    if (ticket <= 0) {
      return row.tier;
    }
  }
  return "fan";
}

function takeFromTier(rng: RngStream, pool: ShopOffer[], want: ShopTier): ShopOffer {
  const candidates = pool.filter((row) => row.tier === want && row.weight > 0);
  const fallback = candidates.length > 0 ? candidates : pool.filter((row) => row.weight > 0);
  const source = fallback.length > 0 ? fallback : pool;
  const total = source.reduce((sum, row) => sum + Math.max(row.weight, 1), 0);
  let ticket = rng.float() * total;
  let picked = source[source.length - 1];
  for (const row of source) {
    ticket -= Math.max(row.weight, 1);
    if (ticket <= 0) {
      picked = row;
      break;
    }
  }
  const index = pool.findIndex((row) => row.id === picked.id);
  if (index >= 0) {
    pool.splice(index, 1);
  }
  return picked;
}

export function stockForWave(wave: number): { id: string; name: string; cost: number }[] {
  const stock: { id: string; name: string; cost: number }[] = [
    { id: "small_draught", name: "小药", cost: 100 * Math.ceil(wave / 10) },
    { id: "soul_return", name: "还魂", cost: 150 * Math.ceil(wave / 10) },
    { id: "ether_dew", name: "灵露", cost: 120 * Math.ceil(wave / 10) },
  ];
  if (wave >= 21) {
    stock.push({ id: "cleanse_talisman", name: "净体", cost: 200 * Math.ceil(wave / 10) });
  }
  return stock;
}

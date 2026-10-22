import type { AccountProgress, RunSession } from "../run/run-session.ts";
import { emptyAccount } from "../run/run-session.ts";

interface RunSave {
  v: 1;
  seed: string;
  wave: number;
  realmId: string;
  starterId: string;
  partyIds: string[];
  gold: number;
  potions?: number;
  seals?: number[];
  goldenSlots?: number;
  hasMap?: boolean;
  hasLock?: boolean;
  hasApexBand?: boolean;
  lures?: { id: string; remaining: number; rate: number }[];
  boonIds: string[];
  caughtIds: string[];
  mode?: RunSession["mode"];
  costCap?: 10 | 15;
  challenges?: RunSession["challenges"];
  nightMarks?: RunSession["nightMarks"];
  partyHpRatios?: number[];
  partyLevels?: number[];
  luck?: number;
  forceDual?: boolean;
  partyCharms?: string[][];
  relicIds?: string[];
  sprint?: boolean;
  fusedIds?: string[];
  bag?: Record<string, number>;
  warTokens?: { id: string; remaining: number; tag: string }[];
  spliceCharges?: number;
  unspliceCharges?: number;
  partyExtraArts?: string[][];
  partyTempers?: string[];
}

interface AccountSave {
  v: 1;
  revision: number;
  codex: string[];
  seenIds?: string[];
  settings?: AccountProgress["settings"];
  unlockedStarters: string[];
  classicCleared?: boolean;
  fusedClear?: boolean;
  candy?: Record<string, number>;
  costDown?: Record<string, number>;
  boneCap?: Record<string, number>;
  secondPact?: string[];
  vouchers?: AccountProgress["vouchers"];
  eggs?: AccountProgress["eggs"];
  achievements?: string[];
  ribbons?: string[];
  carryBaby?: boolean;
  unlockedRelics?: string[];
  dailyScores?: Record<string, number>;
  tempers?: string[];
}

export function encodeRun(run: RunSession): string {
  const save: RunSave = { v: 1, ...run };
  return JSON.stringify(save);
}

export function decodeRun(raw: string): RunSession {
  const save = JSON.parse(raw) as RunSave;
  if (save.v !== 1) {
    throw new Error("unsupported run save");
  }
  return {
    seed: save.seed,
    wave: save.wave,
    realmId: save.realmId,
    starterId: save.starterId,
    partyIds: save.partyIds,
    gold: save.gold,
    potions: save.potions ?? 0,
    seals: save.seals ?? [0, 0, 0, 0, 0],
    goldenSlots: save.goldenSlots ?? 0,
    hasMap: save.hasMap ?? false,
    hasLock: save.hasLock ?? false,
    hasApexBand: save.hasApexBand ?? false,
    lures: save.lures ?? [],
    boonIds: save.boonIds,
    caughtIds: save.caughtIds,
    mode: save.mode ?? "classic",
    costCap: save.costCap ?? 10,
    challenges: save.challenges ?? [],
    nightMarks: save.nightMarks ?? [],
    partyHpRatios: save.partyHpRatios ?? save.partyIds.map(() => 1),
    partyLevels: save.partyLevels ?? save.partyIds.map(() => 5),
    luck: save.luck ?? 0,
    forceDual: save.forceDual ?? false,
    partyCharms: save.partyCharms ?? save.partyIds.map(() => []),
    relicIds: save.relicIds ?? [],
    sprint: save.sprint ?? false,
    fusedIds: save.fusedIds ?? [],
    bag: save.bag ?? {},
    warTokens: save.warTokens ?? [],
    spliceCharges: save.spliceCharges ?? 0,
    unspliceCharges: save.unspliceCharges ?? 0,
    partyExtraArts: save.partyExtraArts ?? save.partyIds.map(() => []),
    partyTempers: save.partyTempers ?? save.partyIds.map(() => "plain"),
  };
}

export function encodeAccount(account: AccountProgress): string {
  const save: AccountSave = { v: 1, ...account };
  return JSON.stringify(save);
}

export function decodeAccount(raw: string): AccountProgress {
  const save = JSON.parse(raw) as AccountSave;
  if (save.v !== 1) {
    throw new Error("unsupported account save");
  }
  return {
    revision: save.revision,
    codex: save.codex,
    seenIds: save.seenIds ?? [...save.codex],
    settings: save.settings ?? emptyAccount().settings,
    unlockedStarters: save.unlockedStarters,
    classicCleared: save.classicCleared ?? false,
    fusedClear: save.fusedClear ?? false,
    candy: save.candy ?? {},
    costDown: save.costDown ?? {},
    boneCap: save.boneCap ?? {},
    secondPact: save.secondPact ?? [],
    vouchers: save.vouchers ?? { fan: 0, shang: 0, te: 0, jin: 0 },
    eggs: save.eggs ?? [],
    achievements: save.achievements ?? [],
    ribbons: save.ribbons ?? [],
    carryBaby: save.carryBaby ?? false,
    unlockedRelics: save.unlockedRelics ?? emptyAccount().unlockedRelics,
    dailyScores: save.dailyScores ?? {},
    tempers: save.tempers ?? [],
  };
}

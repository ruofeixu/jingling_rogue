import { RngStream } from "../rng/rng-stream.ts";
import type { Affinity, BoonRow } from "../tables/types.ts";
import { getArt, getSpirit, loadTables } from "../tables/load-tables.ts";
import {
  defaultRealmForWave,
  describeWave,
  encounterLevel,
  levelCap,
  rivalFightIndex,
  rivalRoster,
  type EncounterKind,
} from "./classic-schedule.ts";
import type { Egg } from "../meta/eggs.ts";
import { defaultSettings, type GameSettings } from "../meta/settings.ts";
import { addLure, canDual, dualChance, type Lure } from "../combat/side.ts";
import { blankParty, costCap, finaleWave, hasTrainers, utcDateStamp, type ChallengeId, type RunMode } from "./modes/index.ts";
import type { NightMark } from "./night-marks.ts";
import { getRelic, relicCatchValue, starterRelicIds, sumRelicStats } from "../meta/relics.ts";
import { pickFusePartner } from "./fusion.ts";

export interface RunSession {
  seed: string;
  wave: number;
  realmId: string;
  starterId: string;
  partyIds: string[];
  gold: number;
  potions: number;
  seals: number[];
  goldenSlots: number;
  hasMap: boolean;
  hasLock: boolean;
  hasApexBand: boolean;
  lures: Lure[];
  boonIds: string[];
  caughtIds: string[];
  mode: RunMode;
  costCap: 10 | 15;
  challenges: ChallengeId[];
  nightMarks: NightMark[];
  partyHpRatios: number[];
  partyLevels: number[];
  luck: number;
  forceDual: boolean;
  partyCharms: string[][];
  relicIds: string[];
  sprint: boolean;
  fusedIds: string[];
  bag: Record<string, number>;
  warTokens: { id: string; remaining: number; tag: string }[];
  spliceCharges: number;
  unspliceCharges: number;
  partyExtraArts: string[][];
  partyTempers: string[];
}

export interface AccountProgress {
  revision: number;
  codex: string[];
  seenIds: string[];
  settings: GameSettings;
  unlockedStarters: string[];
  classicCleared: boolean;
  fusedClear: boolean;
  candy: Record<string, number>;
  costDown: Record<string, number>;
  boneCap: Record<string, number>;
  secondPact: string[];
  vouchers: { fan: number; shang: number; te: number; jin: number };
  eggs: Egg[];
  achievements: string[];
  ribbons: string[];
  carryBaby: boolean;
  unlockedRelics: string[];
  dailyScores: Record<string, number>;
  tempers: string[];
}

export function emptyAccount(): AccountProgress {
  return {
    revision: 0,
    codex: [],
    seenIds: [],
    settings: defaultSettings(),
    unlockedStarters: [],
    classicCleared: false,
    fusedClear: false,
    candy: {},
    costDown: {},
    boneCap: {},
    secondPact: [],
    vouchers: { fan: 1, shang: 0, te: 0, jin: 0 },
    eggs: [],
    achievements: [],
    ribbons: [],
    carryBaby: false,
    unlockedRelics: starterRelicIds(),
    dailyScores: {},
    tempers: [],
  };
}

export function realmForWave(wave: number): string {
  return defaultRealmForWave(wave);
}

export function createRun(opts: {
  seed: string;
  starterId: string;
  mode?: RunMode;
  challenges?: ChallengeId[];
  relicId?: string;
  sprint?: boolean;
}): RunSession {
  if (opts.sprint && !opts.relicId) {
    throw new Error("sprint needs relic");
  }
  const mode = opts.mode ?? "classic";
  const challenges = opts.challenges ?? [];
  const partyIds =
    mode === "daily" ? blankParty() : challenges.includes("blank") ? blankParty() : [opts.starterId];
  const run: RunSession = {
    seed: opts.seed,
    wave: 1,
    realmId: realmForWave(1),
    starterId: opts.starterId,
    partyIds,
    gold: 1000,
    potions: 3,
    seals: [5, 0, 0, 0, 0],
    goldenSlots: 0,
    hasMap: mode === "daily",
    hasLock: false,
    hasApexBand: false,
    lures: [],
    boonIds: [],
    caughtIds: [],
    mode,
    costCap: costCap(mode),
    challenges,
    nightMarks: [],
    partyHpRatios: partyIds.map(() => 1),
    partyLevels: partyIds.map(() => (mode === "daily" ? 20 : encounterLevel(1))),
    luck: 0,
    forceDual: false,
    partyCharms: partyIds.map(() => []),
    relicIds: [],
    sprint: Boolean(opts.sprint),
    fusedIds: mode === "spliced" ? [pickFusePartner(opts.starterId, opts.seed)] : [],
    bag: {},
    warTokens: [],
    spliceCharges: 0,
    unspliceCharges: 0,
    partyExtraArts: partyIds.map(() => []),
    partyTempers: partyIds.map(() => "plain"),
  };
  if (opts.relicId) {
    applyRelic(run, opts.relicId);
  }
  return run;
}

export function applyRelic(run: RunSession, relicId: string): void {
  const relic = getRelic(relicId);
  run.relicIds.push(relic.id);
  if (relic.kind === "gold") {
    run.gold += relic.value;
  }
  if (relic.kind === "potion") {
    run.potions += relic.value;
  }
  if (relic.kind === "map") {
    run.hasMap = true;
  }
  if (relic.kind === "lure") {
    run.lures = addLure(run.lures, "lure_fan");
  }
  if (relic.kind === "exp") {
    run.luck += relic.value;
  }
  if (relic.kind === "sealPack") {
    run.seals[0] = (run.seals[0] ?? 0) + relic.value;
  }
}

export function nextEncounter(run: RunSession): {
  foeId: string;
  foeIds: string[];
  realmId: string;
  boss: boolean;
  finale: boolean;
  kind: EncounterKind;
  shields: number;
  catchable: boolean;
  dual: boolean;
  trainerId?: string;
  sanctify: boolean;
} {
  if (run.wave >= 191) {
    run.realmId = "void";
  } else if (run.wave <= 10) {
    run.realmId = "town_ruins";
  }
  const tables = loadTables();
  const realm = tables.realms.find((row) => row.id === run.realmId);
  if (!realm) {
    throw new Error(`unknown realm ${run.realmId}`);
  }
  const spec = describeWave(run.wave, run.seed);
  const cap = finaleWave(run.mode, run.sprint);
  const finale = spec.finale || (cap !== null && run.wave === cap);
  let kind = spec.kind;
  let trainerId = spec.trainerId;
  let catchable = finale ? false : spec.catchable;
  if (!hasTrainers(run.mode) && kind !== "wild" && kind !== "legend" && kind !== "void") {
    kind = "wild";
    trainerId = undefined;
    catchable = false;
  }
  const raw = spec.boss || spec.kind !== "wild" ? realm.spiritIds.slice(-3) : realm.spiritIds;
  const pool = run.wave <= 20 ? firstStagePool(realm.spiritIds) : raw;
  const rng = new RngStream(run.seed).child(run.wave);
  const foeId = pool[rng.int(pool.length)];
  const allowed = canDual({ mode: run.mode, wave: run.wave, boss: spec.boss });
  const dual =
    kind === "wild" &&
    !spec.boss &&
    allowed &&
    (run.forceDual || rng.float() < dualChance(run.lures, run.wave));
  if (dual) {
    run.forceDual = false;
  }
  const foeIds = [foeId];
  if (dual) {
    const other = pool.filter((id) => id !== foeId);
    foeIds.push(other.length > 0 ? other[rng.int(other.length)] : foeId);
  }
  let sanctify = false;
  if (kind === "rival") {
    const fight = rivalFightIndex(run.wave);
    if (fight >= 0) {
      const roster = rivalRoster(fight, run.seed);
      foeIds.length = 0;
      foeIds.push(...roster.partyIds);
      sanctify = roster.sanctify;
    }
  }
  return {
    foeId: foeIds[0] ?? foeId,
    foeIds,
    dual,
    realmId: run.realmId,
    ...spec,
    kind,
    trainerId,
    catchable,
    finale,
    sanctify,
  };
}

function firstStagePool(ids: string[]): string[] {
  const evolved = new Set(loadTables().spirits.map((row) => row.evolveTo).filter((id): id is string => Boolean(id)));
  const babies = ids.filter((id) => !evolved.has(id));
  return babies.length > 0 ? babies : ids;
}

function takeWeighted(rng: RngStream, pool: BoonRow[]): BoonRow {
  const total = pool.reduce((sum, row) => sum + row.weight, 0);
  let ticket = rng.float() * total;
  for (const row of pool) {
    ticket -= row.weight;
    if (ticket <= 0) {
      return row;
    }
  }
  return pool[pool.length - 1];
}

export function pickBoon(run: RunSession): BoonRow[] {
  const rng = new RngStream(run.seed).child(1000 + run.wave);
  const pool = [...loadTables().boons];
  const picked: BoonRow[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const row = takeWeighted(rng, pool);
    picked.push(row);
    const index = pool.findIndex((item) => item.id === row.id);
    pool.splice(index, 1);
  }
  return picked;
}

export function applyBoon(run: RunSession, boonId: string, account?: AccountProgress): void {
  const boon = loadTables().boons.find((row) => row.id === boonId);
  if (!boon) {
    throw new Error(`unknown boon: ${boonId}`);
  }
  run.boonIds.push(boon.id);
  ensureParty(run);
  if (boon.kind === "gold") {
    run.gold += boon.value;
  }
  if (boon.kind === "potion") {
    run.potions += 1;
  }
  if (boon.kind === "map") {
    run.hasMap = true;
  }
  if (boon.kind === "lure") {
    run.lures = addLure(run.lures, boon.id);
  }
  if (boon.kind === "exp") {
    run.luck += 1;
  }
  if (boon.kind === "revive") {
    run.partyHpRatios = run.partyHpRatios.map((ratio) => (ratio <= 0 ? 1 : ratio));
  }
  if (boon.kind === "sealPack") {
    const slot = boon.slot ?? 0;
    run.seals[slot] = (run.seals[slot] ?? 0) + boon.value;
  }
  if (boon.kind === "cleanse" || boon.kind === "ether" || boon.kind === "ppUp" || boon.kind === "ppMax" || boon.kind === "formItem") {
    run.bag[boon.id] = (run.bag[boon.id] ?? 0) + 1;
  }
  if (boon.kind === "candy") {
    if (boon.tag === "party") {
      run.partyLevels = run.partyLevels.map((level) => level + 1);
    } else if (boon.tag === "jar" && account) {
      for (const id of run.partyIds) {
        account.candy[id] = (account.candy[id] ?? 0) + 10;
      }
    } else {
      run.partyLevels[0] = (run.partyLevels[0] ?? 1) + 1;
    }
  }
  if (boon.kind === "vitamin") {
    const charms = run.partyCharms[0] ?? (run.partyCharms[0] = []);
    const cap = account?.boneCap[run.partyIds[0] ?? ""] ?? 10;
    if (charms.filter((id) => id === boon.id).length < cap) {
      charms.push(boon.id);
    }
  }
  if (boon.kind === "mint") {
    const next = boon.tag ?? "fierce";
    run.partyTempers[0] = next;
    if (account && !account.tempers.includes(next)) {
      account.tempers.push(next);
    }
  }
  if (boon.kind === "warToken") {
    run.warTokens.push({ id: boon.id, remaining: 5, tag: boon.tag ?? "atk" });
  }
  if (boon.kind === "tm") {
    const known = new Set([
      ...getSpirit(run.partyIds[0] ?? run.starterId).artIds,
      ...(run.partyExtraArts[0] ?? []),
    ]);
    const pick = loadTables().arts.find((row) => !known.has(row.id));
    if (pick) {
      run.partyExtraArts[0] = [...(run.partyExtraArts[0] ?? []), pick.id];
    }
  }
  if (boon.kind === "evolve") {
    const current = run.partyIds[0];
    const next = current ? getSpirit(current).evolveTo : undefined;
    if (next) {
      run.partyIds[0] = next;
    }
  }
  if (boon.kind === "splicer") {
    run.spliceCharges += 1;
  }
  if (boon.kind === "unsplice") {
    run.unspliceCharges += 1;
  }
  if (boon.kind === "voucher" && account && boon.tag) {
    const tier = boon.tag as keyof AccountProgress["vouchers"];
    account.vouchers[tier] = (account.vouchers[tier] ?? 0) + 1;
  }
  if (boon.kind === "fruit") {
    const charms = run.partyCharms[0] ?? (run.partyCharms[0] = []);
    const cap = boon.value || 2;
    if (charms.filter((id) => id === boon.id).length < cap) {
      charms.push(boon.id);
    }
  }
  if (boon.kind === "charm") {
    const charms = run.partyCharms[0] ?? (run.partyCharms[0] = []);
    charms.push(boon.tag ?? boon.id);
  }
  if (boon.kind === "passive") {
    if (boon.tag === "lock") {
      run.hasLock = true;
    }
    if (boon.tag === "apex") {
      run.hasApexBand = true;
    }
    if (boon.tag === "slot") {
      run.goldenSlots += 1;
    }
    if (boon.tag === "heal") {
      run.potions += 1;
    }
    if (boon.tag === "shiny" || boon.tag === "exp") {
      run.luck += boon.value || 1;
    }
  }
}

function ensureParty(run: RunSession): void {
  while (run.partyCharms.length < run.partyIds.length) {
    run.partyCharms.push([]);
  }
  while (run.partyExtraArts.length < run.partyIds.length) {
    run.partyExtraArts.push([]);
  }
  while (run.partyTempers.length < run.partyIds.length) {
    run.partyTempers.push("plain");
  }
  while (run.partyLevels.length < run.partyIds.length) {
    run.partyLevels.push(5);
  }
  if (!run.bag) {
    run.bag = {};
  }
  if (!run.warTokens) {
    run.warTokens = [];
  }
}

export function tickWarTokens(run: RunSession): void {
  run.warTokens = (run.warTokens ?? [])
    .map((row) => ({ ...row, remaining: row.remaining - 1 }))
    .filter((row) => row.remaining > 0);
}

export function warMul(run: RunSession, tag: string): number {
  if (!(run.warTokens ?? []).some((row) => row.tag === tag)) {
    return 1;
  }
  return tag === "hit" ? 1.5 : 1.3;
}

export function artPowerMul(
  run: RunSession,
  user: { id: string; affinities: Affinity[] },
  affinity: Affinity,
): number {
  let mul = 1;
  for (const id of run.boonIds) {
    const row = loadTables().boons.find((boon) => boon.id === id);
    if (row?.kind === "typeBoost" && row.tag === affinity) {
      mul *= 1.2;
    }
    if (row?.kind === "speciesBoost" && row.tag === user.id) {
      mul *= 1.2;
    }
  }
  return mul;
}

export function canUseFormItem(run: RunSession, itemId: string): boolean {
  if ((run.bag[itemId] ?? 0) <= 0) {
    return false;
  }
  if (itemId === "sanctify_stone") {
    return run.boonIds.includes("sanctify_cuff");
  }
  if (itemId === "colossus_shroom") {
    return run.boonIds.includes("colossus_band");
  }
  if (itemId === "apex_crystal") {
    return run.hasApexBand || run.boonIds.includes("apex_vessel");
  }
  return false;
}

export function useBagItem(
  run: RunSession,
  unit: { ailment: { kind: string } | null; focusLeft: Record<string, number>; artIds: string[] },
  itemId: string,
): void {
  if ((run.bag[itemId] ?? 0) <= 0) {
    throw new Error("bag empty");
  }
  run.bag[itemId] -= 1;
  if (itemId === "cleanse_talisman") {
    unit.ailment = null;
    return;
  }
  for (const artId of unit.artIds) {
    const max = getArt(artId).focus;
    const have = unit.focusLeft[artId] ?? 0;
    if (itemId === "ether_dew") {
      unit.focusLeft[artId] = Math.min(max, have + 10);
    }
    if (itemId === "focus_up") {
      unit.focusLeft[artId] = Math.min(max, have + 5);
    }
    if (itemId === "focus_full") {
      unit.focusLeft[artId] = max;
    }
  }
}

export function evolveNeed(id: string): number {
  const row = getSpirit(id);
  if (!row.evolveTo) {
    return Number.POSITIVE_INFINITY;
  }
  const next = getSpirit(row.evolveTo);
  return next.evolveTo ? 8 : 16;
}

export function grantWaveExp(run: RunSession, living: boolean[]): void {
  const cap = levelCap(run.wave);
  while (run.partyLevels.length < run.partyIds.length) {
    run.partyLevels.push(encounterLevel(run.wave));
  }
  for (let i = 0; i < run.partyIds.length; i++) {
    if (!living[i]) {
      continue;
    }
    run.partyLevels[i] = Math.min(cap, (run.partyLevels[i] ?? encounterLevel(run.wave)) + 1);
    const id = run.partyIds[i];
    const row = getSpirit(id);
    if (row.evolveTo && run.partyLevels[i] >= evolveNeed(id)) {
      run.partyIds[i] = row.evolveTo;
    }
  }
}

export function commitParty(
  run: RunSession,
  party: { hp: number; maxHp: number }[],
  won: boolean,
): void {
  run.partyHpRatios = party.map((unit) => {
    if (unit.maxHp <= 0) {
      return 0;
    }
    const ratio = unit.hp / unit.maxHp;
    if (won && unit.hp > 0) {
      if (run.wave <= 10 || run.wave > 180) {
        return 1;
      }
      return Math.min(1, ratio + 0.3);
    }
    return ratio;
  });
  while (run.partyHpRatios.length < run.partyIds.length) {
    run.partyHpRatios.push(1);
  }
  if (won) {
    grantWaveExp(
      run,
      party.map((unit) => unit.hp > 0),
    );
  }
}

export function waveGoldReward(wave: number, trainer: boolean): number {
  return (8 + wave * 4) * (trainer ? 2 : 1);
}

export function catchModifier(run: RunSession): number {
  return catchBoonValue(run) + run.luck * 0.05;
}

export function partyLevelBonus(run: RunSession): number {
  return run.luck;
}

export function catchBoonValue(run: RunSession): number {
  const tables = loadTables();
  const fromBoons = run.boonIds.reduce((sum, id) => {
    const boon = tables.boons.find((row) => row.id === id);
    return boon?.kind === "catch" ? sum + boon.value : sum;
  }, 0);
  return fromBoons + relicCatchValue(run.relicIds);
}

export function sumBoonStats(boonIds: string[]): { atk: number; def: number; spd: number; hp: number } {
  const tables = loadTables();
  const bonus = { atk: 0, def: 0, spd: 0, hp: 0 };
  for (const id of boonIds) {
    const boon = tables.boons.find((row) => row.id === id);
    if (boon?.kind === "atk") {
      bonus.atk += boon.value;
    }
    if (boon?.kind === "def") {
      bonus.def += boon.value;
    }
    if (boon?.kind === "spd") {
      bonus.spd += boon.value;
    }
    if (boon?.kind === "hp") {
      bonus.hp += boon.value;
    }
  }
  return bonus;
}

export function sumRunStats(run: RunSession): { atk: number; def: number; spd: number; hp: number } {
  const boons = sumBoonStats(run.boonIds);
  const relics = sumRelicStats(run.relicIds);
  return {
    atk: boons.atk + relics.atk,
    def: boons.def + relics.def,
    spd: boons.spd + relics.spd,
    hp: boons.hp + relics.hp,
  };
}

export function recordSeen(run: RunSession, spiritId: string, prev?: AccountProgress): AccountProgress {
  getSpirit(spiritId);
  const base = prev ?? emptyAccount();
  const seenIds = Array.from(new Set([...base.seenIds, run.starterId, spiritId, ...run.caughtIds]));
  const codex = Array.from(new Set([...base.codex, run.starterId, ...run.caughtIds]));
  return { ...base, seenIds, codex };
}

export function codexStatus(account: AccountProgress, spiritId: string): "unknown" | "seen" | "caught" {
  if (account.codex.includes(spiritId)) {
    return "caught";
  }
  if (account.seenIds.includes(spiritId)) {
    return "seen";
  }
  return "unknown";
}

export function recordDailyScore(account: AccountProgress, utcDate: string, wave: number): void {
  const scores = account.dailyScores ?? (account.dailyScores = {});
  const prev = scores[utcDate] ?? 0;
  if (wave > prev) {
    scores[utcDate] = wave;
  }
}

export function bestDailyScore(account: AccountProgress, utcDate: string): number {
  return account.dailyScores?.[utcDate] ?? 0;
}

export function maybeRecordDaily(account: AccountProgress, run: RunSession, utcDate = utcDateStamp()): void {
  if (run.mode === "daily") {
    recordDailyScore(account, utcDate, run.wave);
  }
}

export function statsLog(account: AccountProgress, utcDate = utcDateStamp()): string {
  return `见 ${account.seenIds.length}  收 ${account.codex.length}  缎 ${account.ribbons.length}  今日试炼最高波 ${bestDailyScore(account, utcDate)}`;
}

export function recordCatch(run: RunSession, spiritId: string, prev?: AccountProgress): AccountProgress {
  getSpirit(spiritId);
  if (!run.caughtIds.includes(spiritId)) {
    run.caughtIds.push(spiritId);
  }
  const base = recordSeen(run, spiritId, prev);
  const codex = Array.from(new Set([...base.codex, run.starterId, ...run.caughtIds]));
  const seenIds = Array.from(new Set([...base.seenIds, ...codex]));
  const unlockedStarters = Array.from(
    new Set([...base.unlockedStarters, ...codex.filter((id) => getSpirit(id).starter)]),
  );
  if (!unlockedStarters.includes(run.starterId)) {
    unlockedStarters.unshift(run.starterId);
  }
  return { ...base, revision: base.revision, codex, seenIds, unlockedStarters };
}

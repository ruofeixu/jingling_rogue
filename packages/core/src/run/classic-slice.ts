import { RngStream } from "../rng/rng-stream.ts";
import { trySeal, SEAL_TIERS, speciesCatchRate } from "../catch/seal.ts";
import { getSpirit } from "../tables/load-tables.ts";
import {
  applyBoon,
  catchModifier,
  createRun,
  maybeRecordDaily,
  nextEncounter,
  recordCatch,
  recordSeen,
  tickWarTokens,
  waveGoldReward,
  type AccountProgress,
  type RunSession,
} from "./run-session.ts";
import { pickNextRealm, realmChoices, isApexRivalWave, encounterLevel } from "./classic-schedule.ts";
import { tickLures } from "../combat/side.ts";
import { tickEggs } from "../meta/eggs.ts";
import { openShop, rerollShop, stockForWave, type ShopState } from "../shop/shop.ts";
import type { BoonRow } from "../tables/types.ts";
import { advanceAfterWin, finaleWave, healOnShift, allowsShopBuy, type ChallengeId, type RunMode } from "./modes/index.ts";
import { applyOmenOption, getOmen, type OmenRow } from "./omen-event.ts";
import { fuse, type Fusion } from "./fusion.ts";
import { onRunVictory, evaluateAchievements } from "./achievements.ts";

export type SlicePhase = "battle" | "catch" | "boon" | "map" | "omen" | "victory" | "defeat";

export class ClassicSlice {
  run: RunSession;
  account: AccountProgress;
  phase: SlicePhase = "battle";
  encounter: ReturnType<typeof nextEncounter> | null = null;
  boonChoices: BoonRow[] = [];
  realmChoices: string[] = [];
  shop: ShopState | null = null;
  omen: OmenRow | null = null;
  fusion: Fusion | null = null;

  constructor(opts: {
    seed: string;
    starterId: string;
    mode?: RunMode;
    challenges?: ChallengeId[];
    account?: AccountProgress;
    relicId?: string;
    sprint?: boolean;
  }) {
    this.run = createRun(opts);
    this.account = recordCatch(this.run, opts.starterId, opts.account);
  }

  /** 从已解码的存档状态重建（不重新掷种、不重复记录初始收契）。 */
  static fromState(run: RunSession, account: AccountProgress): ClassicSlice {
    const slice = new ClassicSlice({
      seed: run.seed,
      starterId: run.starterId,
      mode: run.mode,
      account,
    });
    slice.run = run;
    slice.account = account;
    slice.phase = "battle";
    slice.encounter = null;
    slice.boonChoices = [];
    slice.realmChoices = [];
    slice.shop = null;
    slice.omen = null;
    slice.fusion = null;
    return slice;
  }

  beginWave(): NonNullable<ClassicSlice["encounter"]> {
    this.run.lures = tickLures(this.run.lures);
    tickWarTokens(this.run);
    tickEggs(this.account, 1);
    this.encounter = nextEncounter(this.run);
    for (const id of this.encounter.foeIds) {
      this.account = recordSeen(this.run, id, this.account);
    }
    this.phase = "battle";
    this.boonChoices = [];
    this.realmChoices = [];
    this.shop = null;
    this.omen = null;
    return this.encounter;
  }

  skipToWave(wave: number): NonNullable<ClassicSlice["encounter"]> {
    const cap = finaleWave(this.run.mode, this.run.sprint) ?? 9999;
    this.run.wave = Math.min(cap, Math.max(1, wave));
    if (this.run.wave >= 191) {
      this.run.realmId = "void";
    } else if (this.run.wave > 10 && this.run.realmId === "town_ruins") {
      this.run.realmId = pickNextRealm({
        realmId: "town_ruins",
        seed: this.run.seed,
        wave: 10,
        hasMap: false,
      });
    }
    return this.beginWave();
  }

  noteWin(): void {
    if (!this.encounter) {
      throw new Error("no encounter");
    }
    if (this.encounter.finale) {
      maybeRecordDaily(this.account, this.run);
      if (this.run.mode === "daily") {
        evaluateAchievements(this.account, { type: "daily", wave: this.run.wave });
      }
      onRunVictory(this.account, this.run.partyIds, this.run.mode);
      this.phase = "victory";
      return;
    }
    if (isApexRivalWave(this.run.wave)) {
      this.run.hasApexBand = true;
    }
    this.run.gold += waveGoldReward(this.run.wave, this.encounter.kind !== "wild");
    this.phase = this.encounter.catchable ? "catch" : "boon";
    if (this.phase === "boon") {
      this.openBoon();
    }
  }

  noteLoss(): void {
    maybeRecordDaily(this.account, this.run);
    if (this.run.mode === "daily") {
      evaluateAchievements(this.account, { type: "daily", wave: this.run.wave });
    }
    this.phase = "defeat";
  }

  skipCatch(): void {
    this.openBoon();
  }

  resolveCatch(caught: boolean): void {
    const foeId = this.encounter?.foeId;
    if (caught && foeId) {
      this.account = recordCatch(this.run, foeId, this.account);
      evaluateAchievements(this.account, { type: "catch" });
      if (this.run.partyIds.length < 6 && !this.run.partyIds.includes(foeId)) {
        this.run.partyIds.push(foeId);
        this.run.partyHpRatios.push(1);
        this.run.partyLevels.push(encounterLevel(this.run.wave));
        this.run.partyCharms.push([]);
      }
    }
    this.openBoon();
  }

  attemptCatch(hpRatio = 0): { chance: number; caught: boolean } {
    const rng = new RngStream(this.run.seed).child(2000 + this.run.wave);
    const foeId = this.encounter?.foeId;
    const result = trySeal({
      hpRatio,
      sealMul: SEAL_TIERS[1].mul,
      catchRate: foeId ? speciesCatchRate(getSpirit(foeId)) : 255,
      catchBoon: catchModifier(this.run),
      rng,
    });
    this.resolveCatch(result.caught);
    return result;
  }

  takeBoon(boonId: string): void {
    applyBoon(this.run, boonId, this.account);
    const cleared = this.run.wave;
    this.boonChoices = [];
    this.shop = null;
    const result = advanceAfterWin(this.run);
    if ((this.run.mode === "classic" || this.run.mode === "challenge") && this.run.wave >= 191) {
      this.run.realmId = "void";
      this.phase = "battle";
      return;
    }
    if (result.shifted && this.run.hasMap && healOnShift(this.run.mode)) {
      this.phase = "map";
      this.realmChoices = realmChoices(this.run.realmId, this.run.seed, cleared);
      return;
    }
    this.phase = "battle";
  }

  pickRealm(realmId: string): void {
    this.run.realmId = realmId;
    this.realmChoices = [];
    this.phase = "battle";
  }

  rerollShop(): void {
    if (!this.shop) {
      throw new Error("no shop");
    }
    this.shop = rerollShop(this.shop, this.run.seed);
    this.run.gold = this.shop.gold;
    this.boonChoices = this.shop.offers;
  }

  buyStock(id: string): void {
    if (!allowsShopBuy(this.run.mode)) {
      throw new Error("no shop buy");
    }
    const item = stockForWave(this.run.wave).find((row) => row.id === id);
    if (!item) {
      throw new Error("not in stock");
    }
    if (this.run.gold < item.cost) {
      throw new Error("not enough gold");
    }
    this.run.gold -= item.cost;
    applyBoon(this.run, id, this.account);
    if (this.shop) {
      this.shop.gold = this.run.gold;
    }
  }

  private advanceRealm(cleared: number): void {
    if (this.run.hasMap) {
      this.phase = "map";
      this.realmChoices = realmChoices(this.run.realmId, this.run.seed, cleared);
      return;
    }
    this.run.realmId = pickNextRealm({
      realmId: this.run.realmId,
      seed: this.run.seed,
      wave: cleared,
      hasMap: false,
    });
    this.phase = "battle";
  }

  private openBoon(): void {
    this.phase = "boon";
    if (this.run.wave === 165) {
      this.run.hasLock = true;
    }
    this.shop = openShop({
      wave: this.run.wave,
      seed: this.run.seed,
      gold: this.run.gold,
      goldenSlots: this.run.goldenSlots,
      lock: this.run.hasLock,
      hpRatios: this.run.partyHpRatios,
      partyIds: this.run.partyIds,
      mode: this.run.mode,
      seenCount: this.account.seenIds.length,
      challenges: this.run.challenges,
      boonIds: this.run.boonIds,
      hasApexBand: this.run.hasApexBand,
      fusedIds: this.run.fusedIds,
    });
    this.boonChoices = this.shop.offers;
  }

  openOmen(id: string): void {
    this.omen = getOmen(id);
    this.phase = "omen";
  }

  pickOmen(optionIndex: number): void {
    if (!this.omen) {
      throw new Error("no omen");
    }
    applyOmenOption(this.run, this.account, this.omen.id, optionIndex);
    this.omen = null;
    this.openBoon();
  }

  fuseParty(primaryIndex: number, sacrificeIndex: number): Fusion {
    const primaryId = this.run.partyIds[primaryIndex];
    const sacrificeId = this.run.partyIds[sacrificeIndex];
    if (!primaryId || !sacrificeId) {
      throw new Error("need two spirits");
    }
    this.fusion = fuse(primaryId, sacrificeId);
    this.run.partyIds.splice(sacrificeIndex, 1);
    this.account.fusedClear = true;
    evaluateAchievements(this.account, { type: "fuse" });
    return this.fusion;
  }
}

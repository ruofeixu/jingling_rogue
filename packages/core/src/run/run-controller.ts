/**
 * RunController —— presentation 侧真实回合驱动的编排层（U12）。
 *
 * 设计要点：
 * - 它是**唯一**改真实 run / account 状态的地方；壳层只把 action id 解析成命令名 + payload
 *   后调用 `execute()`，不碰玩法。
 * - 内部包住既有 `ClassicSlice`（状态机：battle/catch/boon/map/omen/victory/defeat）
 *   与一个活动的 `PartyBattle`，不重造循环。
 * - 只读投影全部复用既有 selector（selectBattle / selectBattleOverlays /
 *   selectRunProgress / selectOutcome），保证与 U6–U9 的 ScreenModel 形状一致。
 * - 不 import "cc"，纯 TS，可无头测试。
 *
 * UI 页 ↔ slice phase 的映射（已在 U12 计划记录）：
 *   battle → battle；summary/shop → boon（战后奖励与货摊同属 boon 相位）；
 *   map → map（境域选择）；omen → omen；victory/defeat → 同名相位。
 */
import { ClassicSlice } from "./classic-slice.ts";
import { openBattle, applyBattleEnd } from "../sim/run-sim.ts";
import type { PartyBattle, BattleCommand } from "../combat/party-battle.ts";
import { emptyAccount, type AccountProgress, type RunSession } from "./run-session.ts";
import type { RunMode } from "./modes/types.ts";
import { encodeRun, decodeRun, encodeAccount, decodeAccount } from "../save/codec.ts";
import {
  saveRunLocal,
  loadRunLocal,
  saveAccountLocal,
  loadAccountLocal,
  type KvStore,
} from "../save/local-store.ts";
import { stockForWave } from "../shop/shop.ts";
import {
  selectBattle,
  selectBattleOverlays,
  selectRunProgress,
  selectOutcome,
  type BattleView,
  type BattleOverlaysView,
  type RunProgressView,
  type OutcomeView,
} from "../ui/selectors.ts";

export interface StartRunOpts {
  seed: string;
  starterId: string;
  mode?: RunMode;
  account?: AccountProgress;
  relicId?: string;
  sprint?: boolean;
}

export interface SlotInfo {
  readonly slot: number;
  readonly isEmpty: boolean;
  readonly wave: number;
  readonly mode: string;
}

interface Snapshot {
  run: RunSession;
  account: AccountProgress;
}

export class RunController {
  private slice: ClassicSlice | null = null;
  private battle: PartyBattle | null = null;
  private log = "";
  private committed = false;
  private commits = 0;
  private forcedWin: boolean | null = null;
  private readonly store: KvStore | null;

  constructor(store?: KvStore) {
    this.store = store ?? null;
  }

  // --- 生命周期 ---

  startRun(opts: StartRunOpts): void {
    this.slice = new ClassicSlice({
      seed: opts.seed,
      starterId: opts.starterId,
      mode: opts.mode ?? "classic",
      account: opts.account ?? emptyAccount(),
      relicId: opts.relicId,
      sprint: opts.sprint,
    });
    this.slice.beginWave();
    this.battle = openBattle(this.slice);
    this.log = "遭遇开始。";
    this.committed = false;
    this.commits = 0;
    this.forcedWin = null;
  }

  phase(): string {
    return this.forcedWin !== null ? (this.forcedWin ? "victory" : "defeat") : this.slice?.phase ?? "none";
  }

  account(): AccountProgress {
    return this.requireSlice().account;
  }

  commitCount(): number {
    return this.commits;
  }

  // --- 壳层唯一入口 ---

  /** 把命令名 + payload 落到真实状态。未知命令忽略（不崩）。 */
  execute(command: string, payload: Readonly<Record<string, string>> = {}): void {
    switch (command) {
      case "battle.art":
      case "arts.confirm":
        this.useArt(payload.id ?? this.firstArtId());
        return;
      case "arts.pick":
        // 选术仅记录选择；真正出术由 arts.confirm 或带 id 的 battle.art 完成
        this.pendingArtId = payload.id ?? null;
        return;
      case "battle.flee":
        this.flee();
        return;
      case "switch.pick":
      case "switch.confirm":
        this.switchTo(payload.id ?? this.pendingSwitchId ?? "");
        return;
      case "bag.use":
      case "bag.confirm":
        this.useItem();
        return;
      case "target.pick":
        this.pendingTargetId = payload.id ?? null;
        return;
      case "target.confirm":
        if (this.pendingArtId) {
          this.useArt(this.pendingArtId, this.pendingTargetId ?? undefined);
        }
        return;
      case "catch.throw":
      case "catch.confirm":
        this.attemptCatch();
        return;
      case "summary.continue":
      case "shop.leave":
        this.continueAfterReward();
        return;
      case "shop.buy":
        this.buy(payload.id ?? "");
        return;
      case "omen.pick":
        this.pickOmen(payload.id ?? "");
        return;
      case "omen.skip":
        this.skipOmen();
        return;
      case "map.enter":
        this.enterNode(payload.id ?? "");
        return;
      case "map.rest":
        return; // 原地歇脚：不推进，保持安全继续路径
      case "outcome.commit":
        this.commitOutcome();
        return;
      case "outcome.lobby":
        this.toLobby();
        return;
      default:
        return;
    }
  }

  // --- 战斗命令 ---

  private pendingArtId: string | null = null;
  private pendingTargetId: string | null = null;
  private pendingSwitchId: string | null = null;

  private firstArtId(): string {
    return this.battle?.active.artIds[0] ?? "";
  }

  useArt(artId: string, targetId?: string): void {
    const battle = this.battle;
    if (!battle || battle.waitingFor === "over") {
      return;
    }
    if (!battle.active.artIds.includes(artId)) {
      throw new Error(`unknown art: ${artId}`);
    }
    this.applyBattle({ type: "art", artId, ...(targetId ? { targetId } : {}) });
    this.log = "出术。";
  }

  switchTo(id: string): void {
    const battle = this.battle;
    if (!battle) {
      return;
    }
    const index = battle.party.findIndex((m, i) => (m.instanceId ?? `${m.id}-${i}`) === id);
    if (index < 0) {
      throw new Error(`unknown party member: ${id}`);
    }
    this.applyBattle({ type: "switch", partyIndex: index });
    this.log = "换位。";
  }

  useItem(): void {
    const battle = this.battle;
    if (!battle || battle.potions <= 0) {
      return;
    }
    this.applyBattle({ type: "bag" });
    this.log = "用了灵露。";
  }

  flee(): void {
    if (!this.battle) {
      return;
    }
    this.applyBattle({ type: "run" });
    this.log = "试图离开。";
  }

  attemptCatch(): void {
    const slice = this.slice;
    if (!slice || slice.phase !== "catch") {
      return;
    }
    slice.attemptCatch(0);
    this.syncPhase();
  }

  private applyBattle(command: BattleCommand): void {
    const slice = this.requireSlice();
    const battle = this.battle;
    if (!battle) {
      return;
    }
    battle.choose(command);
    if (battle.result) {
      applyBattleEnd(slice, battle);
      this.battle = null;
      this.syncPhase();
    }
  }

  // --- 推进 ---

  private continueAfterReward(): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    if (slice.phase === "boon" && slice.boonChoices[0]) {
      slice.takeBoon(slice.boonChoices[0].id);
    }
    this.afterAdvance();
  }

  buy(id: string): void {
    const slice = this.slice;
    if (!slice || slice.phase !== "boon" || !id) {
      return;
    }
    slice.buyStock(id);
  }

  pickOmen(id: string): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    // omen 选项以序号驱动；payload.id 允许是数字字符串
    const index = Number.parseInt(id, 10);
    if (Number.isFinite(index)) {
      slice.pickOmen(index);
      this.afterAdvance();
    }
  }

  skipOmen(): void {
    const slice = this.slice;
    if (slice && slice.phase === "omen") {
      slice.pickOmen(0);
      this.afterAdvance();
    }
  }

  enterNode(id: string): void {
    const slice = this.slice;
    if (!slice || slice.phase !== "map" || !id) {
      return;
    }
    slice.pickRealm(id);
    this.afterAdvance();
  }

  /** 奖励/机缘结束后，若回到 battle 相位就开下一场。 */
  private afterAdvance(): void {
    const slice = this.requireSlice();
    if (slice.phase === "battle") {
      slice.beginWave();
      this.battle = openBattle(slice);
      this.log = "新的一波。";
    }
    this.syncPhase();
  }

  private syncPhase(): void {
    // 战斗结束进入 catch 时，UI 可先走 catch 弹层；这里只维护 log。
    const slice = this.slice;
    if (!slice) {
      return;
    }
    if (slice.phase === "victory") {
      this.log = "赢下了这一局。";
    } else if (slice.phase === "defeat") {
      this.log = "这一局到此为止。";
    }
  }

  // --- 结局与存档 ---

  commitOutcome(): number {
    const slice = this.requireSlice();
    if (this.committed) {
      return slice.account.revision;
    }
    // 结算写账号：ClassicSlice 在 noteWin/noteLoss 时已更新 account；
    // 这里只负责"只记一次"的幂等标记，并把 revision 推进一次以示已落库。
    slice.account.revision += 1;
    this.committed = true;
    this.commits += 1;
    return slice.account.revision;
  }

  toLobby(): void {
    // 回厅：丢弃当前 run，保留账号（真实存档写入由宿主在 save() 时落地）。
    this.battle = null;
    this.forcedWin = null;
  }

  /** 纯字符串序列化（无 IO），供测试与内存快照。 */
  serialize(): string {
    const slice = this.requireSlice();
    return JSON.stringify({ run: encodeRun(slice.run), account: encodeAccount(slice.account) });
  }

  deserialize(blob: string): void {
    const parsed = JSON.parse(blob) as { run: string; account: string };
    this.slice = ClassicSlice.fromState(decodeRun(parsed.run), decodeAccount(parsed.account));
    this.battle = this.slice.phase === "battle" ? openBattle(this.slice) : null;
    this.committed = false;
    this.commits = 0;
    this.forcedWin = null;
  }

  /** 真实存档：run 写入指定槽，account 单独落库（走 core 的 local-store）。 */
  async save(slot: number): Promise<void> {
    const store = this.requireStore();
    const slice = this.requireSlice();
    await saveRunLocal(store, slot, slice.run);
    await saveAccountLocal(store, slice.account);
  }

  async load(slot: number): Promise<void> {
    const store = this.requireStore();
    const run = await loadRunLocal(store, slot);
    if (!run) {
      throw new Error(`no save in slot ${slot}`);
    }
    const account = (await loadAccountLocal(store)) ?? emptyAccount();
    this.slice = ClassicSlice.fromState(run, account);
    this.battle = this.slice.phase === "battle" ? openBattle(this.slice) : null;
    this.committed = false;
    this.commits = 0;
    this.forcedWin = null;
  }

  /** 读取 5 个槽，供 slots 页真实数据（替代宿主注入）。 */
  async listSlots(): Promise<SlotInfo[]> {
    const store = this.requireStore();
    const out: SlotInfo[] = [];
    for (let slot = 0; slot < 5; slot += 1) {
      const run = await loadRunLocal(store, slot);
      out.push({
        slot,
        isEmpty: run === null,
        wave: run?.wave ?? 0,
        mode: run?.mode ?? "",
      });
    }
    return out;
  }

  private requireStore(): KvStore {
    if (!this.store) {
      throw new Error("no KvStore injected: construct RunController(store) to use save/load");
    }
    return this.store;
  }

  snapshot(): Snapshot {
    const slice = this.requireSlice();
    return { run: slice.run, account: slice.account };
  }

  // --- 只读投影（复用既有 selector） ---

  battleView(): BattleView | null {
    if (!this.battle) {
      return null;
    }
    return selectBattle(
      {
        active: this.battle.active,
        foe: this.battle.foe,
        party: this.battle.party,
        potions: this.battle.potions,
      } as never,
      this.requireSlice().run as never,
      this.log,
    );
  }

  overlaysView(): BattleOverlaysView {
    const battle = this.battle;
    if (!battle) {
      return selectBattleOverlays({
        active: { id: "", name: "", level: 0, hp: 0, maxHp: 0, artIds: [], focusLeft: {} },
        party: [],
        foes: [],
        potions: 0,
        seals: [],
        activeIndex: 0,
      } as never);
    }
    return selectBattleOverlays({
      active: battle.active,
      party: battle.party,
      foes: battle.foes,
      potions: battle.potions,
      seals: battle.seals,
      activeIndex: battle.activeIndex,
    } as never);
  }

  progressView(kind: "summary" | "shop" | "omen" | "map"): RunProgressView {
    const slice = this.slice;
    if (!slice) {
      return selectRunProgress({ gold: 0, wave: 0 });
    }
    // 商店定价来自真实 stock 表；只列当前波次实际在售的条目。
    const stock = kind === "shop" ? stockForWave(slice.run.wave) : [];
    const shop = stock.map((item) => ({ id: item.id, name: item.name, cost: item.cost }));
    const nodes = slice.realmChoices.map((realmId) => ({ id: realmId, name: realmId, reachable: true }));
    return selectRunProgress({
      gold: slice.run.gold,
      wave: slice.run.wave,
      shop,
      nodes,
    });
  }

  outcomeView(kind: "defeat" | "victory" | "hatch"): OutcomeView {
    const slice = this.slice;
    const won = this.forcedWin ?? (slice ? slice.phase === "victory" : false);
    return selectOutcome({
      won: kind === "victory" ? true : kind === "defeat" ? false : won,
      wave: slice?.run.wave ?? 0,
      gold: slice?.run.gold ?? 0,
      details: slice ? [{ label: "波", value: String(slice.run.wave) }] : [],
      committed: this.committed,
      hatched: kind === "hatch" ? [{ label: "孵出", value: slice?.run.starterId ?? "" }] : [],
      art: "ready",
    });
  }

  private requireSlice(): ClassicSlice {
    if (!this.slice) {
      throw new Error("run not started");
    }
    return this.slice;
  }
}

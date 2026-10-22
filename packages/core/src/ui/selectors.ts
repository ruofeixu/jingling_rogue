/**
 * UI 只读投影层。把 core 快照投影成扁平、深冻结的视图数据，供 presentation 使用。
 * 规则（见 docs/adr/0001-ui-presentation-shell.md）：
 * - 只读纯函数，不修改传入的账号，也不产生新的玩法结论；
 * - 不含颜色、坐标、组件语义；
 * - 派生值一律复用已有 core 函数，不在这里重算规则。
 */
import { listAchievements } from "../run/achievements.ts";
import {
  bestDailyScore,
  codexStatus,
  type AccountProgress,
} from "../run/run-session.ts";
import { SETTINGS_TABS, type SettingsTab } from "../meta/settings.ts";
import { GLOSSARY } from "./copy.ts";
import { getSpirit, loadTables } from "../tables/load-tables.ts";
import { currentCost } from "../meta/candy.ts";
import { offerRelics, pickStartRelic } from "../meta/relics.ts";

function freeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => freeze(item));
    return Object.freeze(value) as T;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    freeze(child);
  }
  return Object.freeze(value);
}

export interface SettingsView {
  readonly tabs: readonly SettingsTab[];
  readonly values: Readonly<Record<string, unknown>>;
}

export function selectSettings(account: AccountProgress): SettingsView {
  return freeze({
    tabs: Array.from(SETTINGS_TABS),
    values: { ...(account.settings as unknown as Record<string, unknown>) },
  });
}

export type CodexStatus = "unknown" | "seen" | "caught";

export interface CodexRow {
  readonly id: string;
  readonly name: string;
  readonly status: CodexStatus;
}

export interface CodexListView {
  readonly total: number;
  readonly caught: number;
  readonly seen: number;
  readonly isEmpty: boolean;
  readonly rows: readonly CodexRow[];
}

export function selectCodexList(account: AccountProgress): CodexListView {
  const spirits = loadTables().spirits;
  const rows = spirits.map((row) => {
    const status = codexStatus(account, row.id);
    return { id: row.id, name: status === "unknown" ? "未知" : row.name, status };
  });
  const caught = rows.filter((row) => row.status === "caught").length;
  const seen = rows.filter((row) => row.status !== "unknown").length;
  return freeze({ total: rows.length, caught, seen, isEmpty: caught === 0, rows });
}

export interface CodexEntryView {
  readonly id: string;
  readonly name: string;
  readonly status: CodexStatus;
  readonly affinities: readonly string[];
  readonly evolveTo: string | null;
  readonly lockedReason: string | null;
}

export function selectCodexEntry(account: AccountProgress, spiritId: string): CodexEntryView {
  const row = getSpirit(spiritId);
  const status = codexStatus(account, spiritId);
  if (status === "unknown") {
    return freeze({
      id: spiritId,
      name: "未知",
      status,
      affinities: [] as string[],
      evolveTo: null,
      lockedReason: "尚未见过这只精怪",
    });
  }
  return freeze({
    id: spiritId,
    name: row.name,
    status,
    affinities: Array.from(row.affinities),
    evolveTo: row.evolveTo ?? null,
    lockedReason: null,
  });
}

export interface EggSlotView {
  readonly id: string;
  readonly spiritId: string;
  readonly tier: string;
  readonly steps: number;
}

export interface EggsView {
  readonly slots: readonly EggSlotView[];
  readonly vouchers: Readonly<Record<string, number>>;
  readonly isEmpty: boolean;
}

export function selectEggs(account: AccountProgress): EggsView {
  const slots = account.eggs.map((egg) => ({
    id: egg.id,
    spiritId: egg.spiritId,
    tier: String(egg.tier),
    steps: egg.steps,
  }));
  return freeze({
    slots,
    vouchers: { ...account.vouchers },
    isEmpty: slots.length === 0,
  });
}

export interface AchievementRowView {
  readonly id: string;
  readonly name: string;
  readonly hidden: boolean;
  readonly earned: boolean;
}

export interface AchievementsView {
  readonly total: number;
  readonly earned: number;
  readonly rows: readonly AchievementRowView[];
  readonly isEmpty: boolean;
}

export function selectAchievements(account: AccountProgress): AchievementsView {
  const got = new Set(account.achievements);
  const pub = listAchievements({ hidden: false }).map((row) => ({
    id: row.id,
    name: row.name,
    hidden: false,
    earned: got.has(row.id),
  }));
  const hidden = listAchievements({ hidden: true }).map((row) => ({
    id: row.id,
    name: got.has(row.id) ? row.name : "未公开",
    hidden: true,
    earned: got.has(row.id),
  }));
  const rows = [...pub, ...hidden];
  const earned = rows.filter((row) => row.earned).length;
  return freeze({ total: pub.length, earned, rows, isEmpty: earned === 0 });
}

export interface StatsView {
  readonly seen: number;
  readonly caught: number;
  readonly ribbons: number;
  readonly bestDaily: number;
  readonly hasHistory: boolean;
}

export function selectStats(account: AccountProgress, utcDate: string): StatsView {
  const bestDaily = bestDailyScore(account, utcDate);
  return freeze({
    seen: account.seenIds.length,
    caught: account.codex.length,
    ribbons: account.ribbons.length,
    bestDaily,
    hasHistory: account.seenIds.length > 0 || account.codex.length > 0 || bestDaily > 0,
  });
}

export interface SlotSummary {
  readonly slot: number;
  readonly wave: number;
  readonly mode: string;
}

export interface SlotView {
  readonly slot: number;
  readonly occupied: boolean;
  readonly wave: number | null;
  readonly mode: string | null;
}

export interface SlotsView {
  readonly slots: readonly SlotView[];
  readonly isEmpty: boolean;
}

export const SLOT_COUNT = 5;

export function selectSlots(
  _account: AccountProgress,
  saved: readonly SlotSummary[],
): SlotsView {
  const bySlot = new Map(saved.map((row) => [row.slot, row]));
  const slots = Array.from({ length: SLOT_COUNT }, (_, index) => {
    const row = bySlot.get(index);
    return {
      slot: index,
      occupied: Boolean(row),
      wave: row ? row.wave : null,
      mode: row ? row.mode : null,
    };
  });
  return freeze({ slots, isEmpty: saved.length === 0 });
}

export interface GlossaryTermView {
  readonly term: string;
  readonly explain: string;
}

export interface GlossaryView {
  readonly terms: readonly GlossaryTermView[];
}

export function selectGlossary(): GlossaryView {
  return freeze({
    terms: GLOSSARY.map((row) => ({ term: row.term, explain: row.body })),
  });
}

/** U5 起始选择：候选、费用、契印。顺序稳定，不产生新的玩法结论。 */
export const DEFAULT_STARTERS = ["zao_li", "jing_zhu", "tao_geng"] as const;

export interface StarterCandidateView {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
  readonly affinities: readonly string[];
  readonly lockedReason: string | null;
}

export interface StarterRelicView {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
}

export interface StarterView {
  readonly candidates: readonly StarterCandidateView[];
  readonly relics: readonly StarterRelicView[];
  readonly chosenRelicId: string;
}

export function selectStarter(account: AccountProgress, seed: string): StarterView {
  const ids =
    account.unlockedStarters.length > 0
      ? Array.from(account.unlockedStarters)
      : Array.from(DEFAULT_STARTERS);
  const candidates = ids.map((id) => {
    const row = getSpirit(id);
    return {
      id,
      name: row.name,
      cost: currentCost(id, account),
      affinities: Array.from(row.affinities),
      lockedReason: null as string | null,
    };
  });
  const relics = offerRelics(account, seed).map((row) => ({
    id: row.id,
    name: row.name,
    kind: String(row.kind),
  }));
  return freeze({
    candidates,
    relics,
    chosenRelicId: pickStartRelic(account, "", seed),
  });
}

/** U6 战斗主界面投影。命令顺序固定，禁用原因由调用方结合 core 状态给出。 */
export interface NameplateView {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly down: boolean;
  readonly ailment: string | null;
}

export interface BattleCommandView {
  readonly id: "art" | "party" | "bag" | "flee";
  readonly label: string;
  readonly lockedReason: string | null;
}

export interface BattleView {
  readonly wave: number;
  readonly gold: number;
  readonly realmId: string;
  readonly ally: NameplateView;
  readonly foe: NameplateView;
  readonly partySize: number;
  readonly commands: readonly BattleCommandView[];
  readonly log: string;
}

interface BattleLike {
  readonly active: { id: string; name: string; level: number; hp: number; maxHp: number; ailment: unknown; artIds: string[] };
  readonly foe: { id: string; name: string; level: number; hp: number; maxHp: number; ailment: unknown };
  readonly party: readonly { hp: number }[];
  readonly potions: number;
}

interface RunLike {
  readonly wave: number;
  readonly gold: number;
  readonly realmId: string;
}

function nameplate(entity: BattleLike["active"] | BattleLike["foe"]): NameplateView {
  return {
    id: entity.id,
    name: entity.name,
    level: entity.level,
    hp: entity.hp,
    maxHp: entity.maxHp,
    down: entity.hp <= 0,
    ailment: entity.ailment ? String(entity.ailment) : null,
  };
}

export function selectBattle(battle: BattleLike, run: RunLike, log = ""): BattleView {
  const aliveParty = battle.party.filter((member) => member.hp > 0).length;
  const commands: BattleCommandView[] = [
    {
      id: "art",
      label: "术",
      lockedReason: battle.active.artIds.length > 0 ? null : "没有可用的术",
    },
    {
      id: "party",
      label: "队伍",
      lockedReason: aliveParty > 1 ? null : "没有可换的伙伴",
    },
    {
      id: "bag",
      label: "囊",
      lockedReason: battle.potions > 0 ? null : "囊里没有东西",
    },
    { id: "flee", label: "走", lockedReason: null },
  ];

  return freeze({
    wave: run.wave,
    gold: run.gold,
    realmId: run.realmId,
    ally: nameplate(battle.active),
    foe: nameplate(battle.foe),
    partySize: aliveParty,
    commands,
    log,
  });
}

/** U7 战斗子界面投影。六类列表与锁定原因一次性给出，renderer 不判合法性。 */
export interface OverlayItemView {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly lockedReason: string | null;
}

export interface BattleOverlaysView {
  readonly arts: readonly OverlayItemView[];
  readonly switchTargets: readonly OverlayItemView[];
  readonly party: readonly OverlayItemView[];
  readonly bag: readonly OverlayItemView[];
  readonly targets: readonly OverlayItemView[];
  readonly seals: readonly OverlayItemView[];
}

interface OverlaySourceEntity {
  readonly instanceId?: string;
  readonly id: string;
  readonly name: string;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly artIds?: readonly string[];
  readonly focusLeft?: Readonly<Record<string, number>>;
}

interface OverlaySource {
  readonly active: OverlaySourceEntity;
  readonly party: readonly OverlaySourceEntity[];
  readonly foes: readonly OverlaySourceEntity[];
  readonly potions: number;
  readonly seals: readonly number[];
  readonly activeIndex: number;
}

const SEAL_NAMES = ["凡印", "上印", "特印", "金印", "玄印"] as const;

export function selectBattleOverlays(source: OverlaySource): BattleOverlaysView {
  const arts = (source.active.artIds ?? []).map((artId) => {
    const left = source.active.focusLeft?.[artId];
    const exhausted = typeof left === "number" && left <= 0;
    return {
      id: artId,
      label: artId,
      detail: typeof left === "number" ? `余 ${left}` : "",
      lockedReason: exhausted ? "这一式已经用尽" : null,
    };
  });

  const switchTargets = source.party
    .map((member, index) => ({ member, index }))
    .filter(({ index }) => index !== source.activeIndex)
    .map(({ member, index }) => ({
      id: member.instanceId ?? `${member.id}-${index}`,
      label: member.name,
      detail: `Lv ${member.level} ${member.hp}/${member.maxHp}`,
      lockedReason: member.hp <= 0 ? "已经倒下" : null,
    }));

  const party = source.party.map((member, index) => ({
    id: member.instanceId ?? `${member.id}-${index}`,
    label: member.name,
    detail: `Lv ${member.level} ${member.hp}/${member.maxHp}`,
    lockedReason: member.hp <= 0 ? "已经倒下" : null,
  }));

  const bag: OverlayItemView[] = [
    {
      id: "potion",
      label: "灵露",
      detail: `x${source.potions}`,
      lockedReason: source.potions > 0 ? null : "囊里没有灵露",
    },
  ];

  const targets = source.foes.map((foe, index) => ({
    id: foe.instanceId ?? `${foe.id}-${index}`,
    label: foe.name,
    detail: `Lv ${foe.level} ${foe.hp}/${foe.maxHp}`,
    lockedReason: foe.hp <= 0 ? "已经倒下，不是合法目标" : null,
  }));

  const seals = source.seals.map((count, tier) => ({
    id: `seal-${tier}`,
    label: SEAL_NAMES[tier] ?? `印${tier}`,
    detail: `x${count}`,
    lockedReason: count > 0 ? null : "没有这种镇物",
  }));

  return freeze({ arts, switchTargets, party, bag, targets, seals });
}

/** U8 局内推进投影：结算、商店、机缘、地图。 */
export interface ProgressRowView {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly lockedReason: string | null;
}

export interface RewardDeltaView {
  readonly label: string;
  readonly before: number;
  readonly after: number;
}

export interface RunProgressView {
  readonly gold: number;
  readonly wave: number;
  readonly deltas: readonly RewardDeltaView[];
  readonly shop: readonly ProgressRowView[];
  readonly omens: readonly ProgressRowView[];
  readonly nodes: readonly ProgressRowView[];
}

interface ShopEntrySource {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
  readonly soldOut?: boolean;
}

interface OmenSource {
  readonly id: string;
  readonly name: string;
  readonly requirement?: string | null;
  readonly available?: boolean;
}

interface MapNodeSource {
  readonly id: string;
  readonly name: string;
  readonly reachable: boolean;
  readonly cleared?: boolean;
}

interface RunProgressSource {
  readonly gold: number;
  readonly wave: number;
  readonly deltas?: readonly RewardDeltaView[];
  readonly shop?: readonly ShopEntrySource[];
  readonly omens?: readonly OmenSource[];
  readonly nodes?: readonly MapNodeSource[];
}

export function selectRunProgress(source: RunProgressSource): RunProgressView {
  const shop = (source.shop ?? []).map((entry) => {
    const short = entry.cost - source.gold;
    const reason = entry.soldOut
      ? "已经卖光"
      : short > 0
        ? `还差 ${short} 钱`
        : null;
    return {
      id: entry.id,
      label: entry.name,
      detail: `${entry.cost} 钱`,
      lockedReason: reason,
    };
  });

  const omens = (source.omens ?? []).map((omen) => ({
    id: omen.id,
    label: omen.name,
    detail: omen.requirement ?? "",
    lockedReason: omen.available === false ? (omen.requirement ?? "现在选不了") : null,
  }));

  const nodes = (source.nodes ?? []).map((node) => ({
    id: node.id,
    label: node.name,
    detail: node.cleared ? "已过" : "",
    lockedReason: node.reachable ? null : "从这里走不过去",
  }));

  return freeze({
    gold: source.gold,
    wave: source.wave,
    deltas: source.deltas ?? [],
    shop,
    omens,
    nodes,
  });
}

/** U9 结局与孵化投影。幂等的关键是 committed 由 core 给出，UI 只读。 */
export type OutcomeArtState = "ready" | "loading" | "error";

export interface OutcomeLineView {
  readonly label: string;
  readonly value: string;
}

export interface OutcomeView {
  readonly won: boolean;
  readonly wave: number;
  readonly gold: number;
  /** 本局明细；为空时 UI 走 empty 但仍可理解。 */
  readonly details: readonly OutcomeLineView[];
  /** 结果是否已经记入账号。已提交后提交动作必须禁用。 */
  readonly committed: boolean;
  /** 孵化揭晓内容；与是否跳过动画无关。 */
  readonly hatched: readonly OutcomeLineView[];
  readonly art: OutcomeArtState;
}

interface OutcomeSource {
  readonly won: boolean;
  readonly wave: number;
  readonly gold: number;
  readonly details?: readonly OutcomeLineView[];
  readonly committed?: boolean;
  readonly hatched?: readonly OutcomeLineView[];
  readonly art?: OutcomeArtState;
}

export function selectOutcome(source: OutcomeSource): OutcomeView {
  return freeze({
    won: source.won,
    wave: source.wave,
    gold: source.gold,
    details: source.details ?? [],
    committed: source.committed === true,
    hatched: source.hatched ?? [],
    art: source.art ?? "ready",
  });
}

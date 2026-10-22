/**
 * 大厅资料与管理页（U4）的 ScreenModel builder。
 * 输入是 core selector 的只读视图，输出只读模型；不判断玩法条件，不读设备。
 */
import type {
  AchievementsView,
  CodexEntryView,
  CodexListView,
  EggsView,
  GlossaryView,
  SettingsView,
  SlotsView,
  StatsView,
} from "@jingling/core";
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

/** 稳定 action id：命名空间为 <screenId>.<verb>。 */
export const LOBBY_ACTIONS = Object.freeze({
  saveSettings: "settings.save",
  openCodexEntry: "codex-list.open-entry",
  backToList: "codex-entry.back",
  hatchEgg: "eggs.hatch",
  claimAchievement: "achievements.claim",
  refreshStats: "stats.refresh",
  loadSlot: "slots.load",
  openTerm: "glossary.open-term",
});

interface BaseInput {
  readonly state: StateId;
  readonly reason?: string;
}

function progressLine(done: number, total: number): string {
  return `进度 ${done} / ${total}`;
}

export interface SettingsModelInput extends BaseInput {
  readonly view: SettingsView;
}

export function buildSettingsModel(input: SettingsModelInput): ScreenModel {
  const tabs: ScreenActionInput[] = input.view.tabs.map((tab) => ({
    id: `settings.tab.${tab}`,
    label: String(tab),
  }));
  return buildStateModel({
    screenId: "settings",
    state: input.state,
    accessibleName: "设置",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "没有可调整的项目" : undefined,
    primaryAction: { id: LOBBY_ACTIONS.saveSettings, label: "保存" },
    secondaryActions: tabs,
    lines: [`共 ${input.view.tabs.length} 组设置`],
  });
}

export interface CodexListModelInput extends BaseInput {
  readonly view: CodexListView;
  readonly pageSize?: number;
  readonly page?: number;
}

export function buildCodexListModel(input: CodexListModelInput): ScreenModel {
  const pageSize = input.pageSize ?? input.view.rows.length;
  const page = input.page ?? 0;
  const pages = Math.max(1, Math.ceil(input.view.rows.length / Math.max(1, pageSize)));
  const slice = input.view.rows.slice(page * pageSize, page * pageSize + pageSize);

  return buildStateModel({
    screenId: "codex-list",
    state: input.state,
    accessibleName: "契录",
    reason: input.reason,
    emptyHint: input.state === "empty" ? `还没有收契。${progressLine(0, input.view.total)}` : undefined,
    primaryAction: { id: LOBBY_ACTIONS.openCodexEntry, label: "查看详情" },
    secondaryActions: slice.map((row) => ({
      id: `${LOBBY_ACTIONS.openCodexEntry}.${row.id}`,
      label: row.name,
      ...(row.status === "unknown"
        ? { enabled: false, disabledReason: "尚未见过这只精怪" }
        : {}),
    })),
    lines: [
      progressLine(input.view.caught, input.view.total),
      `已见 ${input.view.seen} / ${input.view.total}`,
      `第 ${page + 1} / ${pages} 页`,
    ],
  });
}

export interface CodexEntryModelInput extends BaseInput {
  readonly view: CodexEntryView;
}

export function buildCodexEntryModel(input: CodexEntryModelInput): ScreenModel {
  const locked = input.view.status === "unknown";
  return buildStateModel({
    screenId: "codex-entry",
    state: input.state,
    accessibleName: `契录详情 ${input.view.name}`,
    reason: input.reason ?? (locked ? input.view.lockedReason ?? undefined : undefined),
    emptyHint: input.state === "empty" ? "这一页还没有内容" : undefined,
    primaryAction: { id: LOBBY_ACTIONS.backToList, label: "返回列表" },
    lines: locked
      ? ["未知条目", "收契后显示属性与蜕变线"]
      : [
          `名 ${input.view.name}`,
          `属 ${input.view.affinities.join("、")}`,
          input.view.evolveTo ? "可蜕变" : "无蜕变",
        ],
  });
}

export interface EggsModelInput extends BaseInput {
  readonly view: EggsView;
}

export function buildEggsModel(input: EggsModelInput): ScreenModel {
  const voucherTotal = Object.values(input.view.vouchers).reduce((sum, n) => sum + n, 0);
  return buildStateModel({
    screenId: "eggs",
    state: input.state,
    accessibleName: "卵房",
    reason: input.reason,
    emptyHint:
      input.state === "empty" ? `卵槽是空的。孵券 ${voucherTotal} 张，可先换一颗卵。` : undefined,
    primaryAction: {
      id: LOBBY_ACTIONS.hatchEgg,
      label: "孵化",
      ...(input.view.isEmpty ? { enabled: false, disabledReason: "卵槽里没有卵" } : {}),
    },
    secondaryActions: input.view.slots.map((slot) => ({
      id: `${LOBBY_ACTIONS.hatchEgg}.${slot.id}`,
      label: `${slot.tier} · ${slot.steps} 步`,
    })),
    lines: [`卵槽 ${input.view.slots.length}`, `孵券 ${voucherTotal}`],
  });
}

export interface AchievementsModelInput extends BaseInput {
  readonly view: AchievementsView;
}

export function buildAchievementsModel(input: AchievementsModelInput): ScreenModel {
  return buildStateModel({
    screenId: "achievements",
    state: input.state,
    accessibleName: "成就",
    reason: input.reason,
    emptyHint:
      input.state === "empty"
        ? `还没有成就。${progressLine(0, input.view.total)}，通关与收契后会出现。`
        : undefined,
    primaryAction: { id: LOBBY_ACTIONS.claimAchievement, label: "领取" },
    secondaryActions: input.view.rows.map((row) => ({
      id: `${LOBBY_ACTIONS.claimAchievement}.${row.id}`,
      label: row.name,
      ...(row.earned ? {} : { enabled: false, disabledReason: row.hidden ? "隐藏成就" : "尚未达成" }),
    })),
    lines: [progressLine(input.view.earned, input.view.total)],
  });
}

export interface StatsModelInput extends BaseInput {
  readonly view: StatsView;
}

export function buildStatsModel(input: StatsModelInput): ScreenModel {
  return buildStateModel({
    screenId: "stats",
    state: input.state,
    accessibleName: "统计",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "还没有旅途记录，开局后这里会有数字。" : undefined,
    primaryAction: { id: LOBBY_ACTIONS.refreshStats, label: "刷新" },
    lines: [
      `见 ${input.view.seen}`,
      `收 ${input.view.caught}`,
      `缎 ${input.view.ribbons}`,
      `今日最高波 ${input.view.bestDaily}`,
      input.view.hasHistory ? "有历史记录" : "无历史记录",
    ],
  });
}

export interface SlotsModelInput extends BaseInput {
  readonly view: SlotsView;
}

export function buildSlotsModel(input: SlotsModelInput): ScreenModel {
  const actions: ScreenActionInput[] = input.view.slots.map((slot) => ({
    id: `${LOBBY_ACTIONS.loadSlot}.${slot.slot}`,
    label: slot.occupied ? `槽${slot.slot + 1} 波${slot.wave}` : `槽${slot.slot + 1} 空`,
    ...(slot.occupied ? {} : { enabled: false, disabledReason: "这个槽还没有存档" }),
  }));
  const [first, ...rest] = actions;

  return buildStateModel({
    screenId: "slots",
    state: input.state,
    accessibleName: "存档",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "五个槽都是空的，开局后会自动存档。" : undefined,
    primaryAction: first,
    secondaryActions: rest,
    lines: [`占用 ${input.view.slots.filter((s) => s.occupied).length} / ${input.view.slots.length}`],
  });
}

export interface GlossaryModelInput extends BaseInput {
  readonly view: GlossaryView;
  readonly pageSize?: number;
}

export function buildGlossaryModel(input: GlossaryModelInput): ScreenModel {
  const pageSize = input.pageSize ?? input.view.terms.length;
  const slice = input.view.terms.slice(0, pageSize);
  return buildStateModel({
    screenId: "glossary",
    state: input.state,
    accessibleName: "名词",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "名词表是空的" : undefined,
    primaryAction: { id: LOBBY_ACTIONS.openTerm, label: "查看" },
    secondaryActions: slice.map((term) => ({
      id: `${LOBBY_ACTIONS.openTerm}.${term.term}`,
      label: term.term,
    })),
    lines: [`共 ${input.view.terms.length} 条`],
  });
}

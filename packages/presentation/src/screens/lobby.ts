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
  toggleSetting: "settings.toggle",
  openCodexEntry: "codex-list.open-entry",
  pageCodex: "codex-list.page",
  backToList: "codex-entry.back",
  hatchEgg: "eggs.hatch",
  redeemVoucher: "eggs.redeem",
  useMachine: "eggs.machine",
  claimAchievement: "achievements.claim",
  pageAchievements: "achievements.page",
  refreshStats: "stats.refresh",
  loadSlot: "slots.load",
  openTerm: "glossary.open-term",
  pageGlossary: "glossary.page",
});

interface BaseInput {
  readonly state: StateId;
  readonly reason?: string;
}

function progressLine(done: number, total: number): string {
  return `进度 ${done} / ${total}`;
}

function pageSlice<T>(
  rows: readonly T[],
  page: number,
  pageSize: number,
): { readonly slice: readonly T[]; readonly page: number; readonly pages: number; readonly size: number } {
  const size = Math.max(1, pageSize);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const safe = Math.min(Math.max(0, page), pages - 1);
  return {
    slice: rows.slice(safe * size, safe * size + size),
    page: safe,
    pages,
    size,
  };
}

function pagerRows(prefix: string, page: number, pages: number): ScreenActionInput[] {
  if (pages <= 1) {
    return [];
  }
  return [
    {
      id: `${prefix}.prev`,
      label: "上一页",
      ...(page <= 0 ? { enabled: false, disabledReason: "已经是第一页" } : {}),
    },
    {
      id: `${prefix}.next`,
      label: "下一页",
      ...(page + 1 >= pages ? { enabled: false, disabledReason: "已经是最后一页" } : {}),
    },
  ];
}

const SETTINGS_TAB_NAMES: Readonly<Record<string, string>> = {
  general: "通用",
  display: "显示",
  audio: "声音",
  play: "玩法",
  controls: "操作",
};

export interface SettingsModelInput extends BaseInput {
  readonly view: SettingsView;
  /** 当前分组。缺省通用。 */
  readonly tab?: string;
}

function onOff(on: boolean): string {
  return on ? "开" : "关";
}

function settingsOptionRows(tab: string, values: Readonly<Record<string, unknown>>): ScreenActionInput[] {
  const general = (values.general ?? {}) as { skipSeenDialog?: boolean };
  const display = (values.display ?? {}) as {
    showGold?: boolean;
    showDamage?: boolean;
    reduceMotion?: boolean;
  };
  const audio = (values.audio ?? {}) as { music?: number; sfx?: number };
  const play = (values.play ?? {}) as { battleSpeed?: number };
  const controls = (values.controls ?? {}) as { layout?: string };
  if (tab === "general") {
    return [
      {
        id: "settings.toggle.skipSeenDialog",
        label: `跳过已见 ${onOff(Boolean(general.skipSeenDialog))}`,
        enabled: false,
        disabledReason: "现在跳不到",
      },
    ];
  }
  if (tab === "display") {
    return [
      { id: "settings.toggle.showGold", label: `金钱 ${onOff(display.showGold !== false)}` },
      { id: "settings.toggle.showDamage", label: `伤害数字 ${onOff(display.showDamage !== false)}` },
      { id: "settings.toggle.reduceMotion", label: `少动效 ${onOff(display.reduceMotion === true)}` },
    ];
  }
  if (tab === "audio") {
    return [
      {
        id: "settings.toggle.music",
        label: `音 ${audio.music ?? 1}`,
        enabled: false,
        disabledReason: "现在没有音",
      },
      {
        id: "settings.toggle.sfx",
        label: `效 ${audio.sfx ?? 1}`,
        enabled: false,
        disabledReason: "现在没有音",
      },
    ];
  }
  if (tab === "play") {
    return [{ id: "settings.toggle.battleSpeed", label: `倍速 ${play.battleSpeed ?? 1}` }];
  }
  if (tab === "controls") {
    return [
      {
        id: "settings.toggle.layout",
        label: controls.layout === "keys" ? "布局 键位" : "布局 触控",
        enabled: false,
        disabledReason: "只用触控",
      },
    ];
  }
  return [];
}

export function buildSettingsModel(input: SettingsModelInput): ScreenModel {
  const tab = input.tab && input.view.tabs.includes(input.tab as never) ? input.tab : "general";
  const tabs: ScreenActionInput[] = input.view.tabs.map((name) => ({
    id: `settings.tab.${name}`,
    label: SETTINGS_TAB_NAMES[String(name)] ?? String(name),
    ...(name === tab ? { enabled: false, disabledReason: "当前项" } : {}),
  }));
  const options = settingsOptionRows(tab, input.view.values);
  return buildStateModel({
    screenId: "settings",
    state: input.state,
    accessibleName: "设置",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "没有可调整的项目" : undefined,
    primaryAction: { id: LOBBY_ACTIONS.saveSettings, label: "保存" },
    secondaryActions: [...tabs, ...options],
    lines: [`${SETTINGS_TAB_NAMES[tab] ?? tab} ${options.length} 项`],
  });
}

export interface CodexListModelInput extends BaseInput {
  readonly view: CodexListView;
  readonly pageSize?: number;
  readonly page?: number;
}

export function buildCodexListModel(input: CodexListModelInput): ScreenModel {
  const paged = pageSlice(input.view.rows, input.page ?? 0, input.pageSize ?? input.view.rows.length);
  const openable = paged.slice.find((row) => row.status !== "unknown");

  return buildStateModel({
    screenId: "codex-list",
    state: input.state,
    accessibleName: "契录",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "还没有收契" : undefined,
    primaryAction: openable
      ? { id: `${LOBBY_ACTIONS.openCodexEntry}.${openable.id}`, label: "查看详情" }
      : {
          id: LOBBY_ACTIONS.openCodexEntry,
          label: "查看详情",
          enabled: false,
          disabledReason: "还没有见过的精怪",
        },
    secondaryActions: [
      ...paged.slice.map((row, index) => ({
        id: `${LOBBY_ACTIONS.openCodexEntry}.${row.id}`,
        label: row.status === "unknown" ? `？？？ 第${paged.page * paged.size + index + 1}号` : row.name,
        ...(row.status === "unknown"
          ? { enabled: false, disabledReason: "尚未见过这只精怪" }
          : {}),
      })),
      ...pagerRows(LOBBY_ACTIONS.pageCodex, paged.page, paged.pages),
    ],
    lines: [
      progressLine(input.view.caught, input.view.total),
      `已见 ${input.view.seen} / ${input.view.total}`,
      `第 ${paged.page + 1} / ${paged.pages} 页`,
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

const VOUCHER_CN: Readonly<Record<string, string>> = {
  fan: "凡",
  shang: "上",
  te: "特",
  jin: "金",
};

const EGG_MACHINES: readonly { kind: string; label: string }[] = [
  { kind: "lineage", label: "种族机" },
  { kind: "eggArt", label: "卵术机" },
  { kind: "form", label: "异相机" },
];

export function buildEggsModel(input: EggsModelInput): ScreenModel {
  const voucherTotal = Object.values(input.view.vouchers).reduce((sum, n) => sum + n, 0);
  const ready = input.view.slots.some((slot) => slot.steps <= 0);
  const redeemRows: ScreenActionInput[] = Object.entries(input.view.vouchers)
    .filter(([, count]) => (count ?? 0) > 0)
    .map(([tier, count]) => ({
      id: `${LOBBY_ACTIONS.redeemVoucher}.${tier}`,
      label: `兑${VOUCHER_CN[tier] ?? tier}券 ${count}`,
    }));
  const fan = input.view.vouchers.fan ?? 0;
  const machineRows: ScreenActionInput[] = EGG_MACHINES.map((machine) => ({
    id: `${LOBBY_ACTIONS.useMachine}.${machine.kind}`,
    label: machine.label,
    ...(fan > 0 ? {} : { enabled: false, disabledReason: "没有凡券" }),
  }));
  return buildStateModel({
    screenId: "eggs",
    state: input.state,
    accessibleName: "卵房",
    reason: input.reason,
    emptyHint:
      input.state === "empty" ? `卵槽是空的。孵券 ${voucherTotal} 张，可先兑一颗卵。` : undefined,
    primaryAction: {
      id: LOBBY_ACTIONS.hatchEgg,
      label: "孵化",
      ...(input.view.isEmpty
        ? { enabled: false, disabledReason: "卵槽里没有卵" }
        : ready
          ? {}
          : { enabled: false, disabledReason: "还没有孵好的卵" }),
    },
    secondaryActions: [
      ...input.view.slots.map((slot) => ({
        id: `${LOBBY_ACTIONS.hatchEgg}.${slot.id}`,
        label: slot.steps <= 0 ? `${slot.tier}卵 可孵` : `${slot.tier}卵 还要 ${slot.steps} 步`,
        ...(slot.steps > 0 ? { enabled: false, disabledReason: `还要走 ${slot.steps} 步` } : {}),
      })),
      ...redeemRows,
      ...machineRows,
    ],
    lines: [`卵槽 ${input.view.slots.length}`, `孵券 ${voucherTotal}`],
  });
}

export interface AchievementsModelInput extends BaseInput {
  readonly view: AchievementsView;
  readonly selectedId?: string | null;
  readonly pageSize?: number;
  readonly page?: number;
}

export function buildAchievementsModel(input: AchievementsModelInput): ScreenModel {
  const paged = pageSlice(input.view.rows, input.page ?? 0, input.pageSize ?? input.view.rows.length);
  const selected = input.view.rows.find((row) => row.id === input.selectedId);
  const selectedLine = selected
    ? selected.earned
      ? `${selected.name}。已经记下。`
      : `${selected.name}。尚未达成。`
    : null;
  return buildStateModel({
    screenId: "achievements",
    state: input.state,
    accessibleName: "成就",
    reason: input.reason ?? selectedLine ?? undefined,
    emptyHint:
      input.state === "empty"
        ? `还没有成就。${progressLine(0, input.view.total)}，通关与收契后会出现。`
        : undefined,
    primaryAction: {
      id: LOBBY_ACTIONS.claimAchievement,
      label: "领取",
      enabled: false,
      disabledReason: "达成后会自动出现在这里",
    },
    secondaryActions: [
      ...paged.slice.map((row) => ({
        id: `${LOBBY_ACTIONS.claimAchievement}.${row.id}`,
        label: row.name,
        ...(row.id === input.selectedId
          ? { enabled: false, disabledReason: "当前条目" }
          : row.earned
            ? {}
            : { enabled: false, disabledReason: row.hidden ? "隐藏成就" : "尚未达成" }),
      })),
      ...pagerRows(LOBBY_ACTIONS.pageAchievements, paged.page, paged.pages),
    ],
    lines: [
      progressLine(input.view.earned, input.view.total),
      `第 ${paged.page + 1} / ${paged.pages} 页`,
    ],
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
    primaryAction: {
      id: LOBBY_ACTIONS.refreshStats,
      label: "刷新",
      enabled: false,
      disabledReason: "仅展示",
    },
    // 数字作为面板里的行展示（不可点），而不是标题下的一串小字。
    secondaryActions: [
      { id: "stats.row.seen", label: `见 ${input.view.seen}` },
      { id: "stats.row.caught", label: `收 ${input.view.caught}` },
      { id: "stats.row.ribbons", label: `缎 ${input.view.ribbons}` },
      { id: "stats.row.daily", label: `今日最高波 ${input.view.bestDaily}` },
    ].map((row) => ({ ...row, enabled: false, disabledReason: "仅展示" })),
    lines: [input.view.hasHistory ? "有历史记录" : "无历史记录"],
  });
}

export interface SlotsModelInput extends BaseInput {
  readonly view: SlotsView;
}

export function buildSlotsModel(input: SlotsModelInput): ScreenModel {
  const actions: ScreenActionInput[] = input.view.slots.map((slot) => {
    // 槽1（内部 0）是自动存档的当前旅途。
    const name = slot.slot === 0 ? "槽1 当前旅途" : `槽${slot.slot + 1}`;
    if (slot.corrupt) {
      return {
        id: `${LOBBY_ACTIONS.loadSlot}.${slot.slot}`,
        label: `槽${slot.slot + 1} 存档损坏`,
        enabled: false,
        disabledReason: "这个槽的存档读不出来，已忽略",
      };
    }
    return {
      id: `${LOBBY_ACTIONS.loadSlot}.${slot.slot}`,
      label: slot.occupied ? `${name} 波${slot.wave}` : `${name} 空`,
      ...(slot.occupied ? {} : { enabled: false, disabledReason: "这个槽还没有存档" }),
    };
  });
  const [first, ...rest] = actions;

  return buildStateModel({
    screenId: "slots",
    state: input.state,
    accessibleName: "存档",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "五个槽都是空的，开局后会自动存档。" : undefined,
    primaryAction: first,
    secondaryActions: rest,
    lines: [
      `占用 ${input.view.slots.filter((s) => s.occupied).length} / ${input.view.slots.length}`,
      "每过一波自动存到槽1",
      "开新局会覆盖槽1",
      "战中退出则重打这一波",
    ],
  });
}

export interface GlossaryModelInput extends BaseInput {
  readonly view: GlossaryView;
  readonly pageSize?: number;
  readonly page?: number;
  readonly selectedTerm?: string | null;
}

export function buildGlossaryModel(input: GlossaryModelInput): ScreenModel {
  const paged = pageSlice(input.view.terms, input.page ?? 0, input.pageSize ?? input.view.terms.length);
  const selected = input.view.terms.find((term) => term.term === input.selectedTerm);
  return buildStateModel({
    screenId: "glossary",
    state: input.state,
    accessibleName: "名词",
    reason: input.reason ?? selected?.explain,
    emptyHint: input.state === "empty" ? "名词表是空的" : undefined,
    primaryAction: {
      id: LOBBY_ACTIONS.openTerm,
      label: "查看",
      ...(selected
        ? { enabled: false, disabledReason: "说明在上方" }
        : { enabled: false, disabledReason: "先点一条名词" }),
    },
    secondaryActions: [
      ...paged.slice.map((term) => ({
        id: `${LOBBY_ACTIONS.openTerm}.${term.term}`,
        label: term.term,
        ...(term.term === input.selectedTerm ? { enabled: false, disabledReason: "当前词条" } : {}),
      })),
      ...pagerRows(LOBBY_ACTIONS.pageGlossary, paged.page, paged.pages),
    ],
    lines: [`共 ${input.view.terms.length} 条`, `第 ${paged.page + 1} / ${paged.pages} 页`],
  });
}

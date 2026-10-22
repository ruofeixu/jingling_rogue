/**
 * 局内推进四页模型：summary / shop / omen / map。
 * 每页都必须有安全继续路径——除 loading（U2 约定为瞬时全禁用）外，
 * 任何状态下"继续 / 离开"动作恒可用，玩家不会被卡住。
 */
import type { ProgressRowView, RunProgressView } from "@jingling/core";
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

export const PROGRESS_ACTIONS = Object.freeze({
  summaryContinue: "summary.continue",
  shopBuy: "shop.buy",
  shopLeave: "shop.leave",
  omenPick: "omen.pick",
  omenSkip: "omen.skip",
  mapEnter: "map.enter",
  mapRest: "map.rest",
});

export type ProgressKind = "summary" | "shop" | "omen" | "map";

interface ProgressSpec {
  readonly accessibleName: string;
  /** 安全继续路径的动作 id 与文案；恒可用。 */
  readonly continueAction: string;
  readonly continueLabel: string;
  readonly rowAction: string | null;
  readonly emptyHint: string;
  readonly select: (view: RunProgressView) => readonly ProgressRowView[];
}

const SPECS: Readonly<Record<ProgressKind, ProgressSpec>> = Object.freeze({
  summary: {
    accessibleName: "结算",
    continueAction: PROGRESS_ACTIONS.summaryContinue,
    continueLabel: "继续",
    rowAction: null,
    emptyHint: "这一轮没有变化，可以直接继续",
    select: () => [],
  },
  shop: {
    accessibleName: "货摊",
    continueAction: PROGRESS_ACTIONS.shopLeave,
    continueLabel: "离开货摊",
    rowAction: PROGRESS_ACTIONS.shopBuy,
    emptyHint: "摊子上空了，离开继续赶路",
    select: (v) => v.shop,
  },
  omen: {
    accessibleName: "机缘",
    continueAction: PROGRESS_ACTIONS.omenSkip,
    continueLabel: "不理它",
    rowAction: PROGRESS_ACTIONS.omenPick,
    emptyHint: "这里没有机缘，继续赶路",
    select: (v) => v.omens,
  },
  map: {
    accessibleName: "境域图",
    continueAction: PROGRESS_ACTIONS.mapRest,
    continueLabel: "原地歇脚",
    rowAction: PROGRESS_ACTIONS.mapEnter,
    emptyHint: "没有能走的去处，先原地歇脚",
    select: (v) => v.nodes,
  },
});

export interface ProgressModelInput {
  readonly kind: ProgressKind;
  readonly state: StateId;
  readonly view: RunProgressView;
  readonly reason?: string;
}

export function buildProgressModel(input: ProgressModelInput): ScreenModel {
  const spec = SPECS[input.kind];
  if (!spec) {
    throw new Error(`unknown progress kind: ${String(input.kind)}`);
  }
  const rows = spec.select(input.view);
  const rowActions: ScreenActionInput[] = spec.rowAction
    ? rows.map((row) => ({
        id: `${spec.rowAction}.${row.id}`,
        label: row.detail ? `${row.label} ${row.detail}` : row.label,
        ...(row.lockedReason ? { enabled: false, disabledReason: row.lockedReason } : {}),
      }))
    : [];

  const lines = [
    `波 ${input.view.wave}`,
    `钱 ${input.view.gold}`,
    ...input.view.deltas.map((d) => `${d.label} ${d.before} → ${d.after}`),
  ];

  return buildStateModel({
    screenId: input.kind,
    state: input.state,
    accessibleName: spec.accessibleName,
    reason: input.reason,
    emptyHint: input.state === "empty" ? spec.emptyHint : undefined,
    // 主行动就是安全继续路径，永不禁用（loading 由状态层统一压禁）。
    primaryAction: { id: spec.continueAction, label: spec.continueLabel },
    secondaryActions: rowActions,
    lines,
  });
}

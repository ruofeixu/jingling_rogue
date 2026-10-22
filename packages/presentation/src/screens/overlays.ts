/**
 * 战斗子界面（弹层）模型。六个页面共用同一构造路径：
 * 列表 + 单一主行动 + 永远可用的取消。合法性由 selector 给出，presentation 不判断。
 */
import type { BattleOverlaysView, OverlayItemView } from "@jingling/core";
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

export const OVERLAY_ACTIONS = Object.freeze({
  artsPick: "arts.pick",
  switchPick: "switch.pick",
  partyInspect: "party.inspect",
  bagUse: "bag.use",
  targetPick: "target.pick",
  catchThrow: "catch.throw",
  cancel: "overlay.cancel",
});

export type OverlayKind = "arts" | "switch" | "party" | "bag" | "target" | "catch";

interface OverlaySpec {
  readonly screenId: OverlayKind;
  readonly accessibleName: string;
  readonly pickAction: string;
  readonly primaryLabel: string;
  readonly emptyHint: string;
  readonly select: (view: BattleOverlaysView) => readonly OverlayItemView[];
}

const SPECS: Readonly<Record<OverlayKind, OverlaySpec>> = Object.freeze({
  arts: {
    screenId: "arts",
    accessibleName: "术",
    pickAction: OVERLAY_ACTIONS.artsPick,
    primaryLabel: "出术",
    emptyHint: "没有可用的术，先返回换个命令",
    select: (v) => v.arts,
  },
  switch: {
    screenId: "switch",
    accessibleName: "换位",
    pickAction: OVERLAY_ACTIONS.switchPick,
    primaryLabel: "换上",
    emptyHint: "没有可换的伙伴",
    select: (v) => v.switchTargets,
  },
  party: {
    screenId: "party",
    accessibleName: "队伍",
    pickAction: OVERLAY_ACTIONS.partyInspect,
    primaryLabel: "查看",
    emptyHint: "队伍里还没有伙伴",
    select: (v) => v.party,
  },
  bag: {
    screenId: "bag",
    accessibleName: "囊",
    pickAction: OVERLAY_ACTIONS.bagUse,
    primaryLabel: "使用",
    emptyHint: "囊是空的",
    select: (v) => v.bag,
  },
  target: {
    screenId: "target",
    accessibleName: "选目标",
    pickAction: OVERLAY_ACTIONS.targetPick,
    primaryLabel: "确定目标",
    emptyHint: "没有合法目标",
    select: (v) => v.targets,
  },
  catch: {
    screenId: "catch",
    accessibleName: "镇物",
    pickAction: OVERLAY_ACTIONS.catchThrow,
    primaryLabel: "投出",
    emptyHint: "没有可用的镇物",
    select: (v) => v.seals,
  },
});

export interface OverlayModelInput {
  readonly kind: OverlayKind;
  readonly state: StateId;
  readonly view: BattleOverlaysView;
  /** 当前选中项 id；未选中时主行动不可用。 */
  readonly selectedId?: string | null;
  readonly reason?: string;
}

export function buildOverlayModel(input: OverlayModelInput): ScreenModel {
  const spec = SPECS[input.kind];
  if (!spec) {
    throw new Error(`unknown overlay kind: ${String(input.kind)}`);
  }
  const items = spec.select(input.view);
  const selected = items.find((item) => item.id === input.selectedId) ?? null;

  const rows: ScreenActionInput[] = items.map((item) => ({
    id: `${spec.pickAction}.${item.id}`,
    label: item.detail ? `${item.label} ${item.detail}` : item.label,
    ...(item.lockedReason ? { enabled: false, disabledReason: item.lockedReason } : {}),
  }));

  const block =
    items.length === 0
      ? "现在没有可选项"
      : !selected
        ? "先选一项"
        : selected.lockedReason
          ? selected.lockedReason
          : null;

  return buildStateModel({
    screenId: spec.screenId,
    state: input.state,
    accessibleName: spec.accessibleName,
    reason: input.reason,
    emptyHint: input.state === "empty" ? spec.emptyHint : undefined,
    primaryAction: {
      id: `${spec.pickAction}.confirm`,
      label: spec.primaryLabel,
      ...(block ? { enabled: false, disabledReason: block } : {}),
    },
    // 取消永远可用：即使列表为空也能退出弹层。
    secondaryActions: [...rows, { id: OVERLAY_ACTIONS.cancel, label: "返回" }],
    lines: [`共 ${items.length} 项`, selected ? `选中 ${selected.label}` : "未选中"],
  });
}

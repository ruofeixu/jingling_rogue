/**
 * starter 页模型。三卡比较 + 选中详情 + 单一确认。
 * 资源状态（立绘 ready/loading/error）由壳层注入；presentation 不读资源。
 */
import type { StarterView } from "@jingling/core";
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

export const STARTER_ACTIONS = Object.freeze({
  confirm: "starter.confirm",
  back: "starter.back",
  pick: "starter.pick",
  retryArt: "starter.retry-art",
});

export type ArtState = "ready" | "loading" | "error";

export interface StarterModelInput {
  readonly state: StateId;
  readonly view: StarterView;
  /** 当前选中的候选 id；未选中为 null，此时不能确认。 */
  readonly selectedId: string | null;
  readonly art: ArtState;
  readonly reason?: string;
}

export function buildStarterModel(input: StarterModelInput): ScreenModel {
  if (input.view.candidates.length === 0) {
    throw new Error("starter screen requires at least one candidate");
  }

  const selected = input.view.candidates.find((c) => c.id === input.selectedId) ?? null;
  const relic = input.view.relics.find((r) => r.id === input.view.chosenRelicId) ?? null;

  const confirmBlock =
    input.art === "loading"
      ? "立绘还在载入"
      : input.art === "error"
        ? "立绘载入失败，先重试"
        : !selected
          ? "先点选一只初始精怪"
          : selected.lockedReason
            ? selected.lockedReason
            : null;

  const cards: ScreenActionInput[] = input.view.candidates.map((candidate) => ({
    id: `${STARTER_ACTIONS.pick}.${candidate.id}`,
    label: `${candidate.name} 费${candidate.cost}`,
    ...(candidate.lockedReason
      ? { enabled: false, disabledReason: candidate.lockedReason }
      : {}),
  }));

  const extras: ScreenActionInput[] = [
    ...cards,
    ...(input.art === "error" ? [{ id: STARTER_ACTIONS.retryArt, label: "重试载入立绘" }] : []),
    { id: STARTER_ACTIONS.back, label: "返回" },
  ];

  const lines = [
    selected ? `选中 ${selected.name}` : "未选中",
    selected ? `费用 ${selected.cost}` : "费用 —",
    selected ? `属 ${selected.affinities.join("、")}` : "属 —",
    relic ? `契印 ${relic.name}` : "契印 —",
  ];

  return buildStateModel({
    screenId: "starter",
    state: input.state,
    accessibleName: "择一契灵",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "没有可选的初始精怪" : undefined,
    primaryAction: {
      id: STARTER_ACTIONS.confirm,
      label: "入世历劫",
      ...(confirmBlock ? { enabled: false, disabledReason: confirmBlock } : {}),
    },
    secondaryActions: extras,
    lines,
  });
}

/**
 * 结局与孵化三页模型：defeat / victory / hatch。
 * 幂等由 view.committed 决定——已提交后提交动作禁用，回厅永远可用。
 * 跳过动画只影响时长，不影响揭晓内容。
 */
import type { OutcomeView } from "@jingling/core";
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

export const OUTCOME_ACTIONS = Object.freeze({
  commit: "outcome.commit",
  lobby: "outcome.lobby",
  skip: "outcome.skip",
  retryArt: "outcome.retry-art",
});

export type OutcomeKind = "defeat" | "victory" | "hatch";

interface OutcomeSpec {
  readonly accessibleName: string;
  readonly commitLabel: string;
  readonly emptyHint: string;
  readonly reveals: boolean;
}

const SPECS: Readonly<Record<OutcomeKind, OutcomeSpec>> = Object.freeze({
  defeat: {
    accessibleName: "败局",
    commitLabel: "记下这一局",
    emptyHint: "这一局没有留下明细，仍可记下并回厅",
    reveals: false,
  },
  victory: {
    accessibleName: "胜局",
    commitLabel: "收下这一局",
    emptyHint: "这一局没有留下明细，仍可收下并回厅",
    reveals: false,
  },
  hatch: {
    accessibleName: "孵化",
    commitLabel: "收下这一只",
    emptyHint: "蛋还没有动静，稍后再来",
    reveals: true,
  },
});

export interface OutcomeModelInput {
  readonly kind: OutcomeKind;
  readonly state: StateId;
  readonly view: OutcomeView;
  /** 是否跳过揭晓动画。只影响动效，不影响内容。 */
  readonly skipped?: boolean;
  readonly reason?: string;
}

export function buildOutcomeModel(input: OutcomeModelInput): ScreenModel {
  const spec = SPECS[input.kind];
  if (!spec) {
    throw new Error(`unknown outcome kind: ${String(input.kind)}`);
  }
  const view = input.view;

  const commit: ScreenActionInput = {
    id: OUTCOME_ACTIONS.commit,
    label: spec.commitLabel,
    ...(view.committed
      ? { enabled: false, disabledReason: "已经记下了，不会重复计入" }
      : view.art === "loading"
        ? { enabled: false, disabledReason: "正在载入，稍等一下" }
        : {}),
  };

  const secondary: ScreenActionInput[] = [{ id: OUTCOME_ACTIONS.lobby, label: "回厅" }];
  if (spec.reveals && !input.skipped) {
    secondary.push({ id: OUTCOME_ACTIONS.skip, label: "跳过" });
  }
  if (view.art === "error") {
    secondary.push({ id: OUTCOME_ACTIONS.retryArt, label: "重试立绘" });
  }

  // 揭晓内容与是否跳过无关：同一 view 下 lines 必须一致。
  const reveal = spec.reveals ? view.hatched : view.details;
  const lines = [
    view.won ? "赢了这一局" : "这一局到此为止",
    `波 ${view.wave}`,
    `钱 ${view.gold}`,
    ...reveal.map((line) => `${line.label} ${line.value}`),
  ];

  return buildStateModel({
    screenId: input.kind,
    state: input.state,
    accessibleName: spec.accessibleName,
    reason: input.reason,
    emptyHint: input.state === "empty" ? spec.emptyHint : undefined,
    primaryAction: commit,
    secondaryActions: secondary,
    lines,
  });
}

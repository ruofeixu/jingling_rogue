/**
 * 五态组件模型。约束来自规格第 3 节：任何状态都要能自动定位 screenId/state、
 * 有可访问名称，error/locked 必须给原因，empty 必须给下一步，loading 不可交互。
 * 这里只做规范化，不含玩法判断。
 */
import { buildScreenModel, type ScreenActionInput, type ScreenModel } from "./screen-model.ts";

export const STATE_IDS = ["normal", "loading", "empty", "error", "locked"] as const;

export type StateId = (typeof STATE_IDS)[number];

export interface StateModelInput {
  readonly screenId: string;
  readonly state: StateId;
  readonly accessibleName: string;
  readonly primaryAction?: ScreenActionInput | null;
  readonly secondaryActions?: readonly ScreenActionInput[];
  readonly reason?: string;
  /** empty 状态必须说明"为什么空"或"下一步做什么"。 */
  readonly emptyHint?: string;
  readonly lines?: readonly string[];
}

const STATE_SET: ReadonlySet<string> = new Set<string>(STATE_IDS);
const LOADING_DISABLED_REASON = "正在载入";

export function buildStateModel(input: StateModelInput): ScreenModel {
  if (!STATE_SET.has(input.state)) {
    throw new Error(`unknown state: ${String(input.state)}`);
  }
  if (!input.accessibleName) {
    throw new Error(`screen ${input.screenId} must have an accessibleName`);
  }
  if (input.state === "empty" && !input.emptyHint) {
    throw new Error(`screen ${input.screenId} in empty must provide an emptyHint`);
  }

  const lines = input.state === "empty" ? [input.emptyHint as string, ...(input.lines ?? [])] : input.lines;

  // loading 期间禁止交互，且必须给出禁用原因，避免出现无解释的灰按钮。
  const primaryAction =
    input.state === "loading" && input.primaryAction
      ? { ...input.primaryAction, enabled: false, disabledReason: LOADING_DISABLED_REASON }
      : input.primaryAction;

  const secondaryActions =
    input.state === "loading"
      ? (input.secondaryActions ?? []).map((action) => ({
          ...action,
          enabled: false,
          disabledReason: LOADING_DISABLED_REASON,
        }))
      : input.secondaryActions;

  return buildScreenModel({
    screenId: input.screenId,
    state: input.state,
    accessibleName: input.accessibleName,
    primaryAction: primaryAction ?? null,
    secondaryActions,
    reason: input.reason,
    lines,
  });
}

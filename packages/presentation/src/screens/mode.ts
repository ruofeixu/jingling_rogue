/**
 * mode 页模型。模式列表与解锁原因由调用方给出；presentation 不猜解锁条件。
 */
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

export const MODE_ACTION_PREFIX = "mode.select.";

export interface ModeEntryInput {
  readonly id: string;
  readonly label: string;
  /** 有值即为锁定，且这就是展示给玩家的文字原因。 */
  readonly lockedReason?: string;
  /** 兼容只给 locked 布尔的调用方：必须同时给 lockedReason，否则报错。 */
  readonly locked?: boolean;
}

export interface ModeModelInput {
  readonly state: StateId;
  readonly modes: readonly ModeEntryInput[];
  readonly reason?: string;
  readonly emptyHint?: string;
  readonly hint?: string;
}

function toAction(entry: ModeEntryInput): ScreenActionInput {
  if (entry.locked && !entry.lockedReason) {
    throw new Error(`mode ${entry.id} is locked without a reason`);
  }
  const id = `${MODE_ACTION_PREFIX}${entry.id}`;
  if (entry.lockedReason) {
    return { id, label: entry.label, enabled: false, disabledReason: entry.lockedReason };
  }
  return { id, label: entry.label };
}

export function buildModeModel(input: ModeModelInput): ScreenModel {
  if (input.modes.length === 0) {
    throw new Error("mode screen requires at least one entry in modes");
  }
  const [first, ...rest] = input.modes;

  return buildStateModel({
    screenId: "mode",
    state: input.state,
    accessibleName: "选模式",
    reason: input.reason,
    emptyHint: input.emptyHint,
    primaryAction: toAction(first),
    secondaryActions: rest.map(toAction),
    lines: input.hint ? [input.hint] : [],
  });
}

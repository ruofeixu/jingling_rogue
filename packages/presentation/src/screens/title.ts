/**
 * title 页模型。只做确定映射：输入标题文案、状态与锁定原因，输出只读 ScreenModel。
 * 不读设备、不建节点、不判断玩法条件——锁定原因必须由调用方（core selector）给出。
 */
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

/** 稳定 action id：renderer 只回传这些字符串，改文案不影响命令。 */
export const TITLE_ACTIONS = Object.freeze({
  startRun: "title.start-run",
  openSettings: "title.open-settings",
  openCodex: "title.open-codex",
  openEggs: "title.open-eggs",
  openAchievements: "title.open-achievements",
  openStats: "title.open-stats",
  openSlots: "title.open-slots",
  openGlossary: "title.open-glossary",
});

export type TitleActionId = (typeof TITLE_ACTIONS)[keyof typeof TITLE_ACTIONS];

/** 次级入口顺序与现有大厅一致，避免迁移后用户重新学习位置。 */
const SECONDARY: readonly { id: TitleActionId; label: string }[] = Object.freeze([
  { id: TITLE_ACTIONS.openSettings, label: "设置" },
  { id: TITLE_ACTIONS.openCodex, label: "契录" },
  { id: TITLE_ACTIONS.openEggs, label: "卵房" },
  { id: TITLE_ACTIONS.openAchievements, label: "成就" },
  { id: TITLE_ACTIONS.openStats, label: "统计" },
  { id: TITLE_ACTIONS.openSlots, label: "存档" },
  { id: TITLE_ACTIONS.openGlossary, label: "名词" },
]);

export interface TitleModelInput {
  readonly title: string;
  readonly subtitle: string;
  readonly hint: string;
  readonly state: StateId;
  readonly reason?: string;
  readonly emptyHint?: string;
  /** action id → 文字原因。锁定必须有原因，避免无解释灰按钮。 */
  readonly lockedEntries?: Readonly<Record<string, string>>;
  readonly primaryLabel?: string;
}

function entry(
  id: string,
  label: string,
  locked: Readonly<Record<string, string>> | undefined,
): ScreenActionInput {
  const reason = locked?.[id];
  if (reason) {
    return { id, label, enabled: false, disabledReason: reason };
  }
  return { id, label };
}

export function buildTitleModel(input: TitleModelInput): ScreenModel {
  return buildStateModel({
    screenId: "title",
    state: input.state,
    accessibleName: input.title,
    reason: input.reason,
    emptyHint: input.emptyHint,
    primaryAction: entry(
      TITLE_ACTIONS.startRun,
      input.primaryLabel ?? "新的旅途",
      input.lockedEntries,
    ),
    secondaryActions: SECONDARY.map((item) => entry(item.id, item.label, input.lockedEntries)),
    lines: [input.subtitle, input.hint],
  });
}

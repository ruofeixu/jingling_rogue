/**
 * 产品面模型。纯 TypeScript，不创建节点、不读设备 API、不做玩法判断。
 * 契约来自 docs/adr/0001-ui-presentation-shell.md 与 docs/ui/screen-matrix.json。
 */

/** 25 个产品面，顺序与 docs/ui/screen-matrix.json 一致。 */
export const SCREEN_IDS = [
  "title",
  "mode",
  "starter",
  "settings",
  "codex-list",
  "codex-entry",
  "eggs",
  "achievements",
  "stats",
  "slots",
  "glossary",
  "hatch",
  "battle",
  "arts",
  "switch",
  "party",
  "bag",
  "catch",
  "shop",
  "summary",
  "omen",
  "map",
  "target",
  "defeat",
  "victory",
] as const;

export type ScreenId = (typeof SCREEN_IDS)[number];

/** 规格第 3 节的五个规范状态。 */
export type ScreenState = "normal" | "loading" | "empty" | "error" | "locked";

/** 事件只回传稳定 action id 与参数，renderer 不得从标签文本反推命令。 */
export interface ScreenAction {
  readonly id: string;
  readonly label: string;
  readonly enabled: boolean;
  /** 不可用时必须给出可读原因，避免出现无解释的灰按钮。 */
  readonly disabledReason: string | null;
}

export interface ScreenModel {
  readonly screenId: string;
  readonly state: ScreenState;
  readonly accessibleName: string;
  /** 没有主行动时必须显式为 null，不允许 undefined。 */
  readonly primaryAction: ScreenAction | null;
  readonly secondaryActions: readonly ScreenAction[];
  /** error / locked 必须有原因；其余状态为 null。 */
  readonly reason: string | null;
  readonly lines: readonly string[];
}

export interface ScreenActionInput {
  readonly id: string;
  readonly label: string;
  readonly enabled?: boolean;
  readonly disabledReason?: string;
}

export interface ScreenModelInput {
  readonly screenId: string;
  readonly state: ScreenState;
  readonly accessibleName: string;
  readonly primaryAction?: ScreenActionInput | null;
  readonly secondaryActions?: readonly ScreenActionInput[];
  readonly reason?: string;
  readonly lines?: readonly string[];
}

const SCREEN_ID_SET: ReadonlySet<string> = new Set<string>(Array.from(SCREEN_IDS));
const REASON_STATES: ReadonlySet<ScreenState> = new Set<ScreenState>(["error", "locked"]);

export function isScreenId(value: string): value is ScreenId {
  return SCREEN_ID_SET.has(value);
}

/** 允许 diagnostics 这类壳层保留 id 绕过产品矩阵，但必须显式登记。 */
const RESERVED_SCREEN_IDS: ReadonlySet<string> = new Set<string>(["diagnostics"]);

function assertKnownScreen(screenId: string): void {
  if (!SCREEN_ID_SET.has(screenId) && !RESERVED_SCREEN_IDS.has(screenId)) {
    throw new Error(`unknown screen: ${screenId}`);
  }
}

function buildAction(input: ScreenActionInput): ScreenAction {
  if (!input.id) {
    throw new Error("action id must be a non-empty stable id");
  }
  if (!input.label) {
    throw new Error(`action ${input.id} must have a label`);
  }
  const enabled = input.enabled ?? true;
  if (!enabled && !input.disabledReason) {
    throw new Error(`action ${input.id} is disabled and must carry a disabledReason`);
  }
  return Object.freeze({
    id: input.id,
    label: input.label,
    enabled,
    disabledReason: enabled ? null : (input.disabledReason ?? null),
  });
}

export function buildScreenModel(input: ScreenModelInput): ScreenModel {
  assertKnownScreen(input.screenId);
  if (!input.accessibleName) {
    throw new Error(`screen ${input.screenId} must have an accessibleName`);
  }
  if (REASON_STATES.has(input.state) && !input.reason) {
    throw new Error(`screen ${input.screenId} in ${input.state} must carry a reason`);
  }

  return Object.freeze({
    screenId: input.screenId,
    state: input.state,
    accessibleName: input.accessibleName,
    primaryAction: input.primaryAction ? buildAction(input.primaryAction) : null,
    secondaryActions: Object.freeze((input.secondaryActions ?? []).map(buildAction)),
    reason: input.reason ?? null,
    lines: Object.freeze(Array.from(input.lines ?? [])),
  });
}

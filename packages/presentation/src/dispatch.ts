/**
 * action id → 意图 的纯数据映射。renderer 只回传 id，壳层拿到意图后才去执行。
 * 这里不执行任何命令，也不引用 core，保证可无头测试。
 */
import { MODE_ACTION_PREFIX } from "./screens/mode.ts";
import { TITLE_ACTIONS } from "./screens/title.ts";
import { LOBBY_ACTIONS } from "./screens/lobby.ts";

export interface RouteIntent {
  readonly kind: "route";
  readonly to: string;
}

export interface CommandIntent {
  readonly kind: "command";
  readonly command: string;
  readonly payload: Readonly<Record<string, string>>;
}

export type ActionIntent = RouteIntent | CommandIntent;

const ROUTES: Readonly<Record<string, string>> = Object.freeze({
  [TITLE_ACTIONS.startRun]: "mode",
  [TITLE_ACTIONS.openSettings]: "settings",
  [TITLE_ACTIONS.openCodex]: "codex-list",
  [TITLE_ACTIONS.openEggs]: "eggs",
  [TITLE_ACTIONS.openAchievements]: "achievements",
  [TITLE_ACTIONS.openStats]: "stats",
  [TITLE_ACTIONS.openSlots]: "slots",
  [TITLE_ACTIONS.openGlossary]: "glossary",
});

export function resolveAction(actionId: string): ActionIntent {
  const route = ROUTES[actionId];
  if (route) {
    return Object.freeze({ kind: "route" as const, to: route });
  }
  if (actionId.startsWith(MODE_ACTION_PREFIX)) {
    const mode = actionId.slice(MODE_ACTION_PREFIX.length);
    if (mode) {
      return Object.freeze({
        kind: "command" as const,
        command: "select-mode",
        payload: Object.freeze({ mode }),
      });
    }
  }
  const lobby = resolveLobbyAction(actionId);
  if (lobby) {
    return lobby;
  }
  const live = resolveLiveRunAction(actionId);
  if (live) {
    return live;
  }
  throw new Error(`unknown action: ${actionId || "(empty)"}`);
}

function command(name: string, payload: Record<string, string> = {}): CommandIntent {
  return Object.freeze({
    kind: "command" as const,
    command: name,
    payload: Object.freeze(payload),
  });
}

/**
 * 战斗/弹层/推进/结局/初始 的 action id → CommandIntent。
 * 约定：
 * - `battle.art|party|bag|flee`、`summary.continue`、`shop.leave`、`omen.skip`、
 *   `map.rest`、`outcome.commit|lobby|skip|retry-art`、`starter.confirm|back|retry-art`、
 *   `overlay.cancel` 是无参命令，原样带出。
 * - `<ns>.pick.<id>`、`shop.buy.<id>`、`map.enter.<id>` 是带 id 的命令。
 * - 弹层的 `<ns>.pick.confirm` 特例：确认当前选择，命令名为 `<ns>.confirm`。
 * 仍不 import core、不执行。
 */
function resolveLiveRunAction(actionId: string): CommandIntent | null {
  // 无参命令白名单（直接等值匹配）
  const NULLARY = new Set<string>([
    "battle.art",
    "battle.party",
    "battle.bag",
    "battle.flee",
    "summary.continue",
    "shop.leave",
    "omen.skip",
    "map.rest",
    "outcome.commit",
    "outcome.lobby",
    "outcome.skip",
    "outcome.retry-art",
    "starter.confirm",
    "starter.back",
    "starter.retry-art",
    "overlay.cancel",
  ]);
  if (NULLARY.has(actionId)) {
    return command(actionId);
  }

  // 弹层选择/确认：`<ns>.pick.confirm` → `<ns>.confirm`；`<ns>.pick.<id>` → `<ns>.pick`(id)
  const OVERLAY_NS = ["arts", "switch", "party", "bag", "target", "catch"];
  for (const ns of OVERLAY_NS) {
    const pickPrefix = `${ns}.pick.`;
    const inspectPrefix = `${ns}.inspect.`;
    const usePrefix = `${ns}.use.`;
    const throwPrefix = `${ns}.throw.`;
    for (const [prefix, verb] of [
      [pickPrefix, "pick"],
      [inspectPrefix, "inspect"],
      [usePrefix, "use"],
      [throwPrefix, "throw"],
    ] as const) {
      if (actionId.startsWith(prefix)) {
        const arg = actionId.slice(prefix.length);
        if (arg === "confirm") {
          return command(`${ns}.confirm`);
        }
        if (arg) {
          return command(`${ns}.${verb}`, { id: arg });
        }
      }
    }
  }

  // 带 id 的推进命令
  for (const [prefix, name] of [
    ["shop.buy.", "shop.buy"],
    ["map.enter.", "map.enter"],
    ["starter.pick.", "starter.pick"],
    ["omen.pick.", "omen.pick"],
  ] as const) {
    if (actionId.startsWith(prefix)) {
      const id = actionId.slice(prefix.length);
      if (id) {
        return command(name, { id });
      }
    }
  }

  return null;
}

/**
 * 大厅页 action：形如 `<screenId>.<verb>` 或 `<screenId>.<verb>.<arg>`。
 * 这里只做纯映射，参数原样带出，不做任何玩法判断。
 */
function resolveLobbyAction(actionId: string): ActionIntent | null {
  const known = new Set<string>(Object.values(LOBBY_ACTIONS));
  for (const base of known) {
    if (actionId === base) {
      return Object.freeze({
        kind: "command" as const,
        command: base,
        payload: Object.freeze({}),
      });
    }
    if (actionId.startsWith(`${base}.`)) {
      const arg = actionId.slice(base.length + 1);
      if (arg) {
        return Object.freeze({
          kind: "command" as const,
          command: base,
          payload: Object.freeze({ arg }),
        });
      }
    }
  }
  // settings 的分组切换是纯 UI 路由内的选择，不产生 core 命令
  if (actionId.startsWith("settings.tab.")) {
    const tab = actionId.slice("settings.tab.".length);
    if (tab) {
      return Object.freeze({
        kind: "command" as const,
        command: "settings.select-tab",
        payload: Object.freeze({ tab }),
      });
    }
  }
  return null;
}

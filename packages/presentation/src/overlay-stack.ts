/**
 * 弹层栈模型。纯数据：记录每层的 screenId 与打开它的控件 id，
 * 关闭时把焦点目标交还给壳层，避免关闭弹层后焦点丢失。
 */

/** 允许作为弹层的产品面（战斗子界面）。 */
export const OVERLAY_SCREENS = ["arts", "switch", "party", "bag", "target", "catch"] as const;

export type OverlayScreenId = (typeof OVERLAY_SCREENS)[number];

export interface OverlayLayer {
  readonly screenId: OverlayScreenId;
  /** 打开这一层的控件 action id；关闭后焦点回到它。 */
  readonly triggerActionId: string;
}

export interface OverlayStack {
  readonly layers: readonly OverlayLayer[];
}

export interface CloseResult {
  readonly stack: OverlayStack;
  readonly focusActionId: string | null;
}

const OVERLAY_SET: ReadonlySet<string> = new Set<string>(OVERLAY_SCREENS);

export function emptyOverlayStack(): OverlayStack {
  return Object.freeze({ layers: Object.freeze([]) });
}

export function topOverlay(stack: OverlayStack): OverlayLayer | null {
  return stack.layers.length === 0 ? null : stack.layers[stack.layers.length - 1];
}

export function openOverlay(stack: OverlayStack, layer: OverlayLayer): OverlayStack {
  if (!OVERLAY_SET.has(layer.screenId)) {
    throw new Error(`not an overlay screen: ${layer.screenId}`);
  }
  const top = topOverlay(stack);
  if (top && top.screenId === layer.screenId) {
    throw new Error(`overlay ${layer.screenId} is already open`);
  }
  return Object.freeze({
    layers: Object.freeze([...stack.layers, Object.freeze({ ...layer })]),
  });
}

export function closeOverlay(stack: OverlayStack): CloseResult {
  const top = topOverlay(stack);
  if (!top) {
    return Object.freeze({ stack: emptyOverlayStack(), focusActionId: null });
  }
  return Object.freeze({
    stack: Object.freeze({ layers: Object.freeze(stack.layers.slice(0, -1)) }),
    focusActionId: top.triggerActionId,
  });
}

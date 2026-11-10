/**
 * 返回键。模式页和大厅资料页原来只有主按钮，进去之后退不出来。
 * 这里只给出「哪些页需要返回、回到哪里、按钮放哪」，纯数据，不引用 core。
 * 有自己导航的页面（选宠的「返回」、弹层的「返回」、局内页）不在这里。
 */
import type { LayoutBox } from "./layout/box.ts";
import type { ResponsiveFrame } from "./responsive.ts";
import type { ScreenActionInput } from "./screen-model.ts";
import { SPACE } from "./tokens.ts";

/** 返回动作 id 前缀：`nav.back.<目标页>`。目标页写在 id 里，调度器不用知道当前页。 */
export const NAV_BACK_PREFIX = "nav.back.";

const BACK_TARGETS: Readonly<Record<string, string>> = Object.freeze({
  mode: "title",
  settings: "title",
  "codex-list": "title",
  "codex-entry": "codex-list",
  eggs: "title",
  achievements: "title",
  stats: "title",
  slots: "title",
  glossary: "title",
});

export function backActionFor(routeId: string): ScreenActionInput | null {
  const target = BACK_TARGETS[routeId];
  return target ? { id: `${NAV_BACK_PREFIX}${target}`, label: "返回" } : null;
}

const BUTTON_H = 88;

/** 返回键几何：底部居中，宽度适中，高度和选宠页的底部按钮一致。 */
export function backButtonLayout(frame: ResponsiveFrame): LayoutBox {
  const width = Math.min(frame.content.width * 0.5, 420);
  return {
    x: 0,
    y: -frame.content.height / 2 + SPACE.lg + BUTTON_H / 2,
    width,
    height: BUTTON_H,
  };
}

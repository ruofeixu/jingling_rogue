/**
 * 响应式容器模型：由 viewport 推导内容框、列数与栏距，并给出超长文本策略。
 * 只做几何与策略计算，不含页面状态，也不知道任何产品页。
 */
import { SPACE } from "./tokens.ts";
import type { Orientation, Viewport } from "./viewport.ts";

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ResponsiveFrame {
  readonly mode: Orientation;
  readonly content: Rect;
  readonly columns: number;
  readonly columnWidth: number;
  readonly gutter: number;
}

/** 竖屏单列、横屏双列：规格要求同一信息在两个方向都完整可达。 */
export function buildResponsiveFrame(viewport: Viewport): ResponsiveFrame {
  const columns = viewport.orientation === "landscape" ? 2 : 1;
  const gutter = SPACE.lg;
  const content: Rect = Object.freeze({
    x: viewport.safe.left,
    y: viewport.safe.bottom,
    width: viewport.content.width,
    height: viewport.content.height,
  });
  const columnWidth = (content.width - gutter * (columns - 1)) / columns;

  return Object.freeze({
    mode: viewport.orientation,
    content,
    columns,
    columnWidth,
    gutter,
  });
}

export type TruncationStrategy = "none" | "ellipsis" | "wrap";

export interface TruncationInput {
  readonly text: string;
  readonly maxChars: number;
  /** 允许换行的容器传 true；单行控件（按钮、名牌）保持 false。 */
  readonly wrap?: boolean;
}

export interface Truncation {
  readonly strategy: TruncationStrategy;
  readonly text: string;
}

export function truncationFor(input: TruncationInput): Truncation {
  if (!(input.maxChars > 0)) {
    throw new Error(`maxChars must be positive, got ${input.maxChars}`);
  }
  const chars = Array.from(input.text);
  if (chars.length <= input.maxChars) {
    return { strategy: "none", text: input.text };
  }
  if (input.wrap) {
    return { strategy: "wrap", text: input.text };
  }
  return { strategy: "ellipsis", text: `${chars.slice(0, input.maxChars - 1).join("")}…` };
}

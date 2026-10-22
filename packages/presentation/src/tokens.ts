/**
 * 设计 token。纯数据，不含任何玩法判断。
 * 颜色沿用 A1 已落地的 packages/core/src/ui/theme.ts，U2 只是把它规范成可测的 token 层，
 * 不改数值，避免和已验收的卡通皮产生视觉分叉。
 */
import { THEME } from "@jingling/core";

export type Rgb = readonly [number, number, number];

function rgb(value: readonly number[]): Rgb {
  return [value[0] ?? 0, value[1] ?? 0, value[2] ?? 0] as const;
}

export const COLOR = Object.freeze({
  /** 页面底色 */
  paper: rgb(THEME.paper),
  /** 面板/卡片底色 */
  panel: rgb(THEME.panel),
  /** 正文墨色 */
  ink: rgb(THEME.ink),
  /** 唯一一级行动色 */
  accent: rgb(THEME.accent),
  /** 描边 */
  edge: rgb(THEME.edge),
  /** 次要文字 */
  muted: rgb(THEME.muted),
  /** 战场绿 */
  field: rgb(THEME.field),
  /** 次要按钮底 */
  slip: rgb(THEME.slip),
});

export type ColorToken = keyof typeof COLOR;

export const TYPE = Object.freeze({
  caption: 16,
  body: 22,
  title: 28,
  display: 44,
  lineHeightRatio: 1.35,
});

export const SPACE = Object.freeze({
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
});

export const RADIUS = Object.freeze({
  control: 12,
  panel: 16,
});

export const MOTION = Object.freeze({
  fast: 120,
  normal: 240,
  /** 减少动效下的硬上限，规格第 6 节。 */
  reducedMaxMs: 150,
});

function channel(value: number): string {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
}

export function toHex(color: Rgb): string {
  return `#${channel(color[0])}${channel(color[1])}${channel(color[2])}`;
}

export function toRgba(color: Rgb, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${Math.round(color[0])},${Math.round(color[1])},${Math.round(color[2])},${a})`;
}

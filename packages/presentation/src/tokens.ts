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

/**
 * 字号（设计像素）。B5b 调大：390 宽手机上缩放约 0.52，正文 28 → 约 15 px、说明 24 → 约 12.5 px。
 * display 只给游戏名（书法字），title 给页面大标题。
 */
export const TYPE = Object.freeze({
  caption: 24,
  body: 28,
  title: 40,
  display: 76,
  lineHeightRatio: 1.35,
});

export const SPACE = Object.freeze({
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
});

/** 小圆角：水墨界面像纸签和木牌，大圆角像网页表单（B5c）。 */
export const RADIUS = Object.freeze({
  control: 6,
  panel: 6,
});

export const MOTION = Object.freeze({
  fast: 120,
  normal: 240,
  /** 减少动效下的硬上限，规格第 6 节。 */
  reducedMaxMs: 150,
});

/** 水墨动效。shader 由 assets/ui-art/effects/ink-wash.effect 给出，这里只管时长和浓度。 */
export const INK_FX = Object.freeze({
  /** 整页洗墨转场全长（秒）。负责人试玩反馈 0.6 秒“一闪就过”，改为 1.4 秒：落墨洇开 + 慢慢洗掉。 */
  washSeconds: 1.4,
  /** 最浓时的墨色不透明度。 */
  washAlpha: 0.94,
});

/** 血条色。不进 COLOR：COLOR 与 core THEME 一一对应。水墨版：松烟绿 / 赭红 / 深朱，对血槽都 ≥3:1。 */
export const HP_COLOR = Object.freeze({
  track: rgb(THEME.hpBack),
  ally: rgb(THEME.hpHigh),
  foe: [176, 84, 60] as Rgb,
  low: rgb(THEME.hpLow),
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

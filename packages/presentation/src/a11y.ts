/**
 * 可访问性规则。纯函数，供 presentation 与 renderer 共用，也供自动测试直接断言。
 * 阈值来自 docs/superpowers/specs/2026-08-31-ui-productization.md。
 */
import { MOTION, TYPE, type Rgb } from "./tokens.ts";

export type { Rgb } from "./tokens.ts";

/** 最小可点区域，规格要求 44×44。 */
export const MIN_HIT_SIZE = 44;

/** WCAG AA：正文 4.5:1，大字号 3:1。 */
export const CONTRAST_BODY = 4.5;
export const CONTRAST_LARGE = 3;

export type TextRole = "body" | "large";

export interface Box {
  readonly width: number;
  readonly height: number;
}

function channelLuminance(value: number): number {
  const c = Math.max(0, Math.min(255, value)) / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(color: Rgb): number {
  const r = channelLuminance(color[0]);
  const g = channelLuminance(color[1]);
  const b = channelLuminance(color[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

export function thresholdFor(role: TextRole): number {
  return role === "large" ? CONTRAST_LARGE : CONTRAST_BODY;
}

export function assertContrast(fg: Rgb, bg: Rgb, role: TextRole = "body"): number {
  const ratio = contrastRatio(fg, bg);
  const min = thresholdFor(role);
  if (ratio < min) {
    throw new Error(
      `contrast ${ratio.toFixed(2)} is below the ${role} minimum ${min} for ${fg.join(",")} on ${bg.join(",")}`,
    );
  }
  return ratio;
}

export function hitAreaOk(box: Box): boolean {
  return box.width >= MIN_HIT_SIZE && box.height >= MIN_HIT_SIZE;
}

export function assertHitArea(box: Box, label: string): void {
  if (!hitAreaOk(box)) {
    throw new Error(
      `hit area ${box.width}x${box.height} for ${label} is below ${MIN_HIT_SIZE}x${MIN_HIT_SIZE}`,
    );
  }
}

export interface ScaledTextInput {
  readonly box: Box;
  readonly fontSize: number;
  readonly lines: number;
  /** 系统文本缩放倍率，规格要求支持到 2。 */
  readonly scale: number;
}

export function fitsScaledText(input: ScaledTextInput): boolean {
  if (input.lines <= 0) {
    throw new Error("lines must be positive");
  }
  const needed = input.fontSize * TYPE.lineHeightRatio * input.scale * input.lines;
  return needed <= input.box.height + 0.001;
}

/** 减少动效时把时长压到上限以内；正常模式原样返回。 */
export function motionDurationMs(durationMs: number, reduceMotion: boolean): number {
  if (!(durationMs >= 0)) {
    throw new Error(`duration must be >= 0, got ${durationMs}`);
  }
  if (!reduceMotion) {
    return durationMs;
  }
  return Math.min(durationMs, MOTION.reducedMaxMs);
}

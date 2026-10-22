/**
 * 可访问性批量审计。审计对象是**数据**（配色对、热区、焦点序列、文本盒），
 * 所以能在纯 TS 里对故意做坏的夹具跑出失败，不依赖截图肉眼比对。
 */
import {
  CONTRAST_BODY,
  MIN_HIT_SIZE,
  contrastRatio,
  fitsScaledText,
  hitAreaOk,
  motionDurationMs,
  thresholdFor,
  type Box,
  type Rgb,
  type TextRole,
} from "../a11y.ts";
import { MOTION } from "../tokens.ts";

export interface AuditFinding {
  readonly kind: "contrast" | "hit-area" | "focus" | "text-scale" | "motion";
  readonly label: string;
  readonly detail: string;
}

export interface AuditReport {
  readonly checked: number;
  readonly findings: readonly AuditFinding[];
  readonly ok: boolean;
}

export interface ContrastCase {
  readonly label: string;
  readonly fg: Rgb;
  readonly bg: Rgb;
  readonly role?: TextRole;
}

export interface HitAreaCase {
  readonly label: string;
  readonly box: Box;
}

export interface FocusCase {
  readonly label: string;
  /** 焦点顺序中的 action id 序列。 */
  readonly order: readonly string[];
  /** 当前被禁用的 action id。 */
  readonly disabled: readonly string[];
}

export interface TextScaleCase {
  readonly label: string;
  readonly box: Box;
  readonly fontSize: number;
  readonly lines: number;
  readonly scale: number;
}

export interface MotionCase {
  readonly label: string;
  readonly durationMs: number;
  readonly reduceMotion: boolean;
}

export interface A11yAuditInput {
  readonly contrast?: readonly ContrastCase[];
  readonly hitAreas?: readonly HitAreaCase[];
  readonly focus?: readonly FocusCase[];
  readonly textScale?: readonly TextScaleCase[];
  readonly motion?: readonly MotionCase[];
}

export function auditA11y(input: A11yAuditInput): AuditReport {
  const findings: AuditFinding[] = [];
  let checked = 0;

  for (const item of input.contrast ?? []) {
    checked += 1;
    const role: TextRole = item.role ?? "body";
    const ratio = contrastRatio(item.fg, item.bg);
    const need = thresholdFor(role);
    // 非有限值说明配色输入本身有问题，必须报错而不是静默通过。
    if (!Number.isFinite(ratio)) {
      findings.push({ kind: "contrast", label: item.label, detail: "配色无法计算对比度" });
      continue;
    }
    if (ratio < need) {
      findings.push({
        kind: "contrast",
        label: item.label,
        detail: `${ratio.toFixed(2)}:1 低于 ${need}:1`,
      });
    }
  }

  for (const item of input.hitAreas ?? []) {
    checked += 1;
    if (!hitAreaOk(item.box)) {
      findings.push({
        kind: "hit-area",
        label: item.label,
        detail: `${item.box.width}x${item.box.height} 小于 ${MIN_HIT_SIZE}`,
      });
    }
  }

  for (const item of input.focus ?? []) {
    checked += 1;
    const seen = new Set<string>();
    for (const id of item.order) {
      if (seen.has(id)) {
        findings.push({ kind: "focus", label: item.label, detail: `焦点顺序重复 ${id}` });
      }
      seen.add(id);
    }
    const disabled = new Set(item.disabled);
    for (const id of item.order) {
      if (disabled.has(id)) {
        findings.push({ kind: "focus", label: item.label, detail: `焦点停在禁用项 ${id}` });
      }
    }
    if (item.order.length === 0) {
      findings.push({ kind: "focus", label: item.label, detail: "焦点顺序为空" });
    }
  }

  for (const item of input.textScale ?? []) {
    checked += 1;
    if (
      !fitsScaledText({
        box: item.box,
        fontSize: item.fontSize,
        lines: item.lines,
        scale: item.scale,
      })
    ) {
      findings.push({
        kind: "text-scale",
        label: item.label,
        detail: `${item.scale * 100}% 文本溢出`,
      });
    }
  }

  for (const item of input.motion ?? []) {
    checked += 1;
    const capped = motionDurationMs(item.durationMs, item.reduceMotion);
    if (item.reduceMotion && capped > MOTION.reducedMaxMs) {
      findings.push({
        kind: "motion",
        label: item.label,
        detail: `${capped} ms 超过减少动效上限 ${MOTION.reducedMaxMs} ms`,
      });
    }
  }

  return Object.freeze({
    checked,
    findings: Object.freeze(findings),
    ok: findings.length === 0,
  });
}

export const CONTRAST_MIN_BODY = CONTRAST_BODY;

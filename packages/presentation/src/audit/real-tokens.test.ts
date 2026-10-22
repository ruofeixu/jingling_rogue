/**
 * 用**实际在用的** token 配色与实际控件尺寸跑审计。
 * 这一组测试的价值在于：它会因真实设计缺陷而失败，而不是因夹具失败。
 */
import { describe, expect, it } from "vitest";
import { COLOR, SPACE, TYPE } from "../tokens.ts";
import { MIN_HIT_SIZE } from "../a11y.ts";
import { auditA11y, type ContrastCase, type HitAreaCase } from "./a11y-audit.ts";

/**
 * 实际渲染中出现的前景/背景组合。
 * 取值以 `assets/scripts/app/ui/Button.ts` 等 renderer 的真实写法为准：
 * 一级按钮是 `ink` 文字压 `accent` 底（不是浅色文字）。
 */
const REAL_PAIRS: ContrastCase[] = [
  { label: "正文 ink / 纸底", fg: COLOR.ink, bg: COLOR.paper },
  { label: "正文 ink / 面板", fg: COLOR.ink, bg: COLOR.panel },
  { label: "次要 muted / 纸底", fg: COLOR.muted, bg: COLOR.paper },
  { label: "次要 muted / 面板", fg: COLOR.muted, bg: COLOR.panel },
  { label: "一级按钮文字 ink / accent", fg: COLOR.ink, bg: COLOR.accent },
  { label: "次级按钮文字 ink / slip", fg: COLOR.ink, bg: COLOR.slip },
  { label: "战场文字 ink / field", fg: COLOR.ink, bg: COLOR.field },
  { label: "标题 ink / 纸底（大字）", fg: COLOR.ink, bg: COLOR.paper, role: "large" },
];

/**
 * 禁用态文字（muted 压 accent = 3.93:1）不计入正文门槛。
 * 依据 WCAG 1.4.3 的 Incidental 例外：失效控件中的文字不受对比度要求约束。
 * 这里仍然把它审一遍，只是按大字号阈值（3.0:1）要求，确保不至于完全看不清。
 */
const DISABLED_PAIRS: ContrastCase[] = [
  { label: "禁用文字 muted / accent", fg: COLOR.muted, bg: COLOR.accent, role: "large" },
  { label: "禁用文字 muted / slip", fg: COLOR.muted, bg: COLOR.slip, role: "large" },
];

/** 实际按钮高度：SPACE.xl + SPACE.md = 56，最窄一栏宽度按 4 列横屏估。 */
const BUTTON_HEIGHT = SPACE.xl + SPACE.md;
const REAL_HIT_AREAS: HitAreaCase[] = [
  { label: "战斗命令按钮（横屏 4 列）", box: { width: 260, height: BUTTON_HEIGHT } },
  { label: "列表行按钮", box: { width: 480, height: BUTTON_HEIGHT } },
  { label: "一级行动按钮", box: { width: 514, height: BUTTON_HEIGHT } },
];

describe("real design tokens pass the a11y audit", () => {
  it("every colour pair actually used meets its contrast threshold", () => {
    const report = auditA11y({ contrast: REAL_PAIRS });

    expect(report.findings.map((f) => `${f.label}: ${f.detail}`)).toEqual([]);
    expect(report.checked).toBe(REAL_PAIRS.length);
  });

  it("disabled text stays legible under the incidental exemption", () => {
    const report = auditA11y({ contrast: DISABLED_PAIRS });

    expect(report.findings.map((f) => `${f.label}: ${f.detail}`)).toEqual([]);
  });

  it("would catch a regression that flips the primary label to a light colour", () => {
    // 反向验证：把一级按钮文字换成浅色（paper 压 accent = 2.09:1）必须被抓住。
    const report = auditA11y({
      contrast: [{ label: "错误改法", fg: COLOR.paper, bg: COLOR.accent }],
    });

    expect(report.ok).toBe(false);
    expect(report.findings[0].detail).toMatch(/低于 4.5/);
  });

  it("every real control meets the 44 px hit area", () => {
    const report = auditA11y({ hitAreas: REAL_HIT_AREAS });

    expect(report.findings).toEqual([]);
    expect(BUTTON_HEIGHT).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
  });

  it("body text at 200% still fits a two-line control", () => {
    const report = auditA11y({
      textScale: [
        {
          label: "正文 200% 两行",
          box: { width: 480, height: TYPE.body * TYPE.lineHeightRatio * 2 * 2 },
          fontSize: TYPE.body,
          lines: 2,
          scale: 2,
        },
      ],
    });

    expect(report.findings).toEqual([]);
  });

  it("reduced motion caps every motion token", () => {
    const report = auditA11y({
      motion: [
        { label: "fast", durationMs: 120, reduceMotion: true },
        { label: "normal", durationMs: 240, reduceMotion: true },
      ],
    });

    expect(report.findings).toEqual([]);
  });
});

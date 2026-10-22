import { describe, expect, it } from "vitest";
import { MOTION } from "../tokens.ts";
import { auditA11y } from "./a11y-audit.ts";

describe("a11y audit catches real defects", () => {
  it("fails a body text pair below 4.5:1", () => {
    // #777777 on #FFFFFF ≈ 4.48:1 —— 刚好不够
    const report = auditA11y({
      contrast: [{ label: "灰字白底", fg: [119, 119, 119], bg: [255, 255, 255] }],
    });

    expect(report.ok).toBe(false);
    expect(report.findings[0].kind).toBe("contrast");
    expect(report.findings[0].detail).toMatch(/低于 4.5/);
  });

  it("passes a body text pair at or above 4.5:1", () => {
    const report = auditA11y({
      contrast: [{ label: "深灰白底", fg: [90, 90, 90], bg: [255, 255, 255] }],
    });

    expect(report.ok).toBe(true);
  });

  it("uses the looser 3.0:1 threshold for large text", () => {
    const pair = { fg: [140, 140, 140] as const, bg: [255, 255, 255] as const };

    expect(auditA11y({ contrast: [{ label: "大字", ...pair, role: "large" }] }).ok).toBe(true);
    expect(auditA11y({ contrast: [{ label: "正文", ...pair, role: "body" }] }).ok).toBe(false);
  });

  it("fails a hit area that is one pixel short on either axis", () => {
    const narrow = auditA11y({ hitAreas: [{ label: "窄", box: { width: 43, height: 44 } }] });
    const short = auditA11y({ hitAreas: [{ label: "矮", box: { width: 44, height: 43 } }] });
    const okBox = auditA11y({ hitAreas: [{ label: "刚好", box: { width: 44, height: 44 } }] });

    expect(narrow.ok).toBe(false);
    expect(narrow.findings[0].detail).toMatch(/43x44/);
    expect(short.ok).toBe(false);
    expect(okBox.ok).toBe(true);
  });

  it("fails a focus order with a duplicate entry", () => {
    const report = auditA11y({
      focus: [{ label: "重复", order: ["a", "b", "a"], disabled: [] }],
    });

    expect(report.ok).toBe(false);
    expect(report.findings[0].detail).toMatch(/重复 a/);
  });

  it("fails a focus order that stops on a disabled control", () => {
    const report = auditA11y({
      focus: [{ label: "禁用", order: ["a", "b"], disabled: ["b"] }],
    });

    expect(report.ok).toBe(false);
    expect(report.findings[0].detail).toMatch(/禁用项 b/);
  });

  it("fails an empty focus order", () => {
    const report = auditA11y({ focus: [{ label: "空", order: [], disabled: [] }] });

    expect(report.ok).toBe(false);
    expect(report.findings[0].detail).toMatch(/为空/);
  });

  it("passes a clean focus order", () => {
    const report = auditA11y({
      focus: [{ label: "正常", order: ["a", "b", "c"], disabled: ["d"] }],
    });

    expect(report.ok).toBe(true);
  });

  it("fails text that overflows at 200%", () => {
    const overflow = {
      label: "200% 溢出",
      box: { width: 320, height: 40 },
      fontSize: 16,
      lines: 1,
      scale: 2,
    };

    expect(auditA11y({ textScale: [overflow] }).ok).toBe(false);
    expect(auditA11y({ textScale: [{ ...overflow, box: { width: 320, height: 120 } }] }).ok).toBe(
      true,
    );
  });

  it("never reports a motion violation because durations are capped", () => {
    const report = auditA11y({
      motion: [{ label: "长动效", durationMs: 900, reduceMotion: true }],
    });

    // motionDurationMs 会压回上限，因此这里应当通过；
    // 若哪天有人绕过 helper 直接写时长，动效违规就会在使用点被 U2 契约测试抓住。
    expect(report.ok).toBe(true);
    expect(MOTION.reducedMaxMs).toBe(150);
  });

  it("counts every case it checked and reports all findings at once", () => {
    const report = auditA11y({
      contrast: [{ label: "c", fg: [200, 200, 200], bg: [255, 255, 255] }],
      hitAreas: [{ label: "h", box: { width: 10, height: 10 } }],
      focus: [{ label: "f", order: [], disabled: [] }],
      textScale: [{ label: "t", box: { width: 100, height: 10 }, fontSize: 20, lines: 1, scale: 2 }],
      motion: [{ label: "m", durationMs: 200, reduceMotion: false }],
    });

    expect(report.checked).toBe(5);
    expect(report.findings).toHaveLength(4);
    expect(new Set(report.findings.map((f) => f.kind))).toEqual(
      new Set(["contrast", "hit-area", "focus", "text-scale"]),
    );
  });
});

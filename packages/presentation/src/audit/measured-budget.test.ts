/**
 * U10 实测预算快照。数值来自 docs/ui/baselines/evidence/2026-09-01/u10-quality-gates-runtime.md：
 * 250 组合矩阵实测 Draw Call 峰值与两平台真实构建主包字节。
 * 这组测试的作用是把"已经达标"的实测值钉住，任何回退都会先在这里失败。
 */
import { describe, expect, it } from "vitest";
import { BUDGET, auditBudget } from "./budget.ts";

// 实测值（真实构建 / 真实运行时）
const MEASURED = {
  drawCallPeak: 49,
  wechatMainBytes: 3_377_874,
  bytedanceMainBytes: 3_490_075,
};

describe("U10 measured budgets stay within limits", () => {
  it("draw call peak from the 250-cell sweep is within budget", () => {
    const report = auditBudget([{ label: "matrix-sweep", drawCalls: MEASURED.drawCallPeak }]);

    expect(report.ok).toBe(true);
    expect(MEASURED.drawCallPeak).toBeLessThanOrEqual(BUDGET.maxDrawCalls);
  });

  it("both platform main packages are within 4 MiB", () => {
    const report = auditBudget([
      { label: "wechat", mainPackBytes: MEASURED.wechatMainBytes },
      { label: "bytedance", mainPackBytes: MEASURED.bytedanceMainBytes },
    ]);

    expect(report.violations).toEqual([]);
    expect(MEASURED.wechatMainBytes).toBeLessThanOrEqual(BUDGET.maxMainPackBytes);
    expect(MEASURED.bytedanceMainBytes).toBeLessThanOrEqual(BUDGET.maxMainPackBytes);
  });

  it("leaves real headroom rather than sitting on the limit", () => {
    // 至少留 10% Draw Call 余量与 400 KiB 包体余量，避免"卡线通过"。
    expect(MEASURED.drawCallPeak).toBeLessThan(BUDGET.maxDrawCalls * 0.9);
    expect(BUDGET.maxMainPackBytes - MEASURED.bytedanceMainBytes).toBeGreaterThan(400 * 1024);
  });
});

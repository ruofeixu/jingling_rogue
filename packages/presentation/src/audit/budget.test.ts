import { describe, expect, it } from "vitest";
import { BUDGET, auditBudget } from "./budget.ts";

describe("performance and package budgets", () => {
  it("pins the budget numbers", () => {
    expect(BUDGET.maxDrawCalls).toBe(120);
    expect(BUDGET.maxMainPackBytes).toBe(4194304);
    expect(BUDGET.minFps).toBe(50);
  });

  it("fails one draw call over the limit", () => {
    const report = auditBudget([{ label: "battle", drawCalls: 121 }]);

    expect(report.ok).toBe(false);
    expect(report.violations[0]).toEqual({
      label: "battle",
      metric: "drawCalls",
      actual: 121,
      limit: 120,
    });
  });

  it("passes exactly at the draw call limit", () => {
    expect(auditBudget([{ label: "battle", drawCalls: 120 }]).ok).toBe(true);
  });

  it("fails a main package one byte over 4 MiB", () => {
    const report = auditBudget([{ label: "wechat", mainPackBytes: 4 * 1024 * 1024 + 1 }]);

    expect(report.ok).toBe(false);
    expect(report.violations[0].metric).toBe("mainPackBytes");
  });

  it("passes a main package exactly at 4 MiB", () => {
    expect(auditBudget([{ label: "wechat", mainPackBytes: 4 * 1024 * 1024 }]).ok).toBe(true);
  });

  it("fails frame rate below the floor", () => {
    const report = auditBudget([{ label: "run", fps: 49 }]);

    expect(report.ok).toBe(false);
    expect(report.violations[0].metric).toBe("fps");
  });

  it("fails memory over the ceiling", () => {
    const report = auditBudget([{ label: "run", memoryMiB: BUDGET.maxMemoryMiB + 1 }]);

    expect(report.ok).toBe(false);
    expect(report.violations[0].metric).toBe("memoryMiB");
  });

  it("reports every violation of a mixed sample", () => {
    const report = auditBudget([
      { label: "a", drawCalls: 200, fps: 10 },
      { label: "b", mainPackBytes: 9e6, memoryMiB: 9000 },
      { label: "c", drawCalls: 10, fps: 60, mainPackBytes: 1000, memoryMiB: 100 },
    ]);

    expect(report.checked).toBe(3);
    expect(report.violations).toHaveLength(4);
    expect(report.violations.filter((v) => v.label === "c")).toHaveLength(0);
  });

  it("passes an empty sample set but reports nothing checked", () => {
    const report = auditBudget([]);

    expect(report.ok).toBe(true);
    expect(report.checked).toBe(0);
  });
});

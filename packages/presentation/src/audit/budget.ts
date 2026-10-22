/**
 * 性能与包体预算。数值来自产品规格；判定纯数据，方便用超限夹具跑出失败。
 */

export const BUDGET = Object.freeze({
  /** 峰值 Draw Call 上限。 */
  maxDrawCalls: 120,
  /** 主包字节上限：4 MiB。 */
  maxMainPackBytes: 4 * 1024 * 1024,
  /** 帧率下限（95 分位）。 */
  minFps: 50,
  /** 运行内存上限：MiB。 */
  maxMemoryMiB: 350,
});

export interface BudgetSample {
  readonly label: string;
  readonly drawCalls?: number;
  readonly mainPackBytes?: number;
  readonly fps?: number;
  readonly memoryMiB?: number;
}

export interface BudgetViolation {
  readonly label: string;
  readonly metric: "drawCalls" | "mainPackBytes" | "fps" | "memoryMiB";
  readonly actual: number;
  readonly limit: number;
}

export interface BudgetReport {
  readonly checked: number;
  readonly violations: readonly BudgetViolation[];
  readonly ok: boolean;
}

export function auditBudget(samples: readonly BudgetSample[]): BudgetReport {
  const violations: BudgetViolation[] = [];

  for (const sample of samples) {
    if (sample.drawCalls !== undefined && sample.drawCalls > BUDGET.maxDrawCalls) {
      violations.push({
        label: sample.label,
        metric: "drawCalls",
        actual: sample.drawCalls,
        limit: BUDGET.maxDrawCalls,
      });
    }
    if (sample.mainPackBytes !== undefined && sample.mainPackBytes > BUDGET.maxMainPackBytes) {
      violations.push({
        label: sample.label,
        metric: "mainPackBytes",
        actual: sample.mainPackBytes,
        limit: BUDGET.maxMainPackBytes,
      });
    }
    if (sample.fps !== undefined && sample.fps < BUDGET.minFps) {
      violations.push({
        label: sample.label,
        metric: "fps",
        actual: sample.fps,
        limit: BUDGET.minFps,
      });
    }
    if (sample.memoryMiB !== undefined && sample.memoryMiB > BUDGET.maxMemoryMiB) {
      violations.push({
        label: sample.label,
        metric: "memoryMiB",
        actual: sample.memoryMiB,
        limit: BUDGET.maxMemoryMiB,
      });
    }
  }

  return Object.freeze({
    checked: samples.length,
    violations: Object.freeze(violations),
    ok: violations.length === 0,
  });
}

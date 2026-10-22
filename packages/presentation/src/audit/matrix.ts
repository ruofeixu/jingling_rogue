/**
 * 产品面矩阵审计：25 页 × 5 态 × 2 方向 = 250 组合。
 * 任一缺页、缺态、缺方向都必须被报出来，且要说清缺的是哪一项。
 */
import { SCREEN_IDS } from "../screen-model.ts";
import { STATE_IDS } from "../states.ts";

export const ORIENTATIONS = ["portrait", "landscape"] as const;

export type MatrixOrientation = (typeof ORIENTATIONS)[number];

export interface MatrixCell {
  readonly screenId: string;
  readonly state: string;
  readonly orientation: MatrixOrientation;
}

export interface MatrixGap {
  readonly kind: "screen" | "state" | "orientation" | "cell";
  readonly detail: string;
}

export interface MatrixAudit {
  readonly expected: number;
  readonly covered: number;
  readonly gaps: readonly MatrixGap[];
  readonly ok: boolean;
}

export function cellKey(cell: MatrixCell): string {
  return `${cell.screenId}|${cell.state}|${cell.orientation}`;
}

/** 完整矩阵：枚举全部 250 个组合。 */
export function expectedMatrix(): readonly MatrixCell[] {
  const cells: MatrixCell[] = [];
  for (const screenId of SCREEN_IDS) {
    for (const state of STATE_IDS) {
      for (const orientation of ORIENTATIONS) {
        cells.push(Object.freeze({ screenId, state, orientation }));
      }
    }
  }
  return Object.freeze(cells);
}

export const MATRIX_SIZE = SCREEN_IDS.length * STATE_IDS.length * ORIENTATIONS.length;

/**
 * 用实际覆盖到的组合去比对完整矩阵。
 * gaps 会同时给出粒度更粗的诊断（整页缺失 / 某页缺某态 / 某页缺某方向），
 * 这样报告能直接指出"哪一页的哪一项没做"。
 */
export function auditMatrix(covered: readonly MatrixCell[]): MatrixAudit {
  const have = new Set(covered.map(cellKey));
  const gaps: MatrixGap[] = [];

  for (const screenId of SCREEN_IDS) {
    const screenCells = expectedMatrix().filter((c) => c.screenId === screenId);
    const missing = screenCells.filter((c) => !have.has(cellKey(c)));
    if (missing.length === 0) {
      continue;
    }
    if (missing.length === screenCells.length) {
      gaps.push({ kind: "screen", detail: screenId });
      continue;
    }
    for (const state of STATE_IDS) {
      const stateCells = screenCells.filter((c) => c.state === state);
      const stateMissing = stateCells.filter((c) => !have.has(cellKey(c)));
      if (stateMissing.length === stateCells.length) {
        gaps.push({ kind: "state", detail: `${screenId}/${state}` });
      } else {
        for (const cell of stateMissing) {
          gaps.push({ kind: "orientation", detail: `${screenId}/${state}/${cell.orientation}` });
        }
      }
    }
  }

  const covered0 = expectedMatrix().filter((c) => have.has(cellKey(c))).length;
  return Object.freeze({
    expected: MATRIX_SIZE,
    covered: covered0,
    gaps: Object.freeze(gaps),
    ok: gaps.length === 0 && covered0 === MATRIX_SIZE,
  });
}

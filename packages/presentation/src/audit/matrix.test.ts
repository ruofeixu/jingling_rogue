import { describe, expect, it } from "vitest";
import { SCREEN_IDS } from "../screen-model.ts";
import { STATE_IDS } from "../states.ts";
import {
  MATRIX_SIZE,
  ORIENTATIONS,
  auditMatrix,
  cellKey,
  expectedMatrix,
  type MatrixCell,
} from "./matrix.ts";

const full = expectedMatrix();

describe("product surface matrix", () => {
  it("is 25 screens x 5 states x 2 orientations", () => {
    expect(SCREEN_IDS.length).toBe(25);
    expect(STATE_IDS.length).toBe(5);
    expect(ORIENTATIONS.length).toBe(2);
    expect(MATRIX_SIZE).toBe(250);
    expect(full).toHaveLength(250);
  });

  it("has no duplicate cells", () => {
    expect(new Set(full.map(cellKey)).size).toBe(250);
  });

  it("passes when every combination is covered", () => {
    const report = auditMatrix(full);

    expect(report.ok).toBe(true);
    expect(report.covered).toBe(250);
    expect(report.gaps).toEqual([]);
  });

  it("fails and names the page when a whole screen is missing", () => {
    const report = auditMatrix(full.filter((c) => c.screenId !== "battle"));

    expect(report.ok).toBe(false);
    expect(report.covered).toBe(240);
    expect(report.gaps).toEqual([{ kind: "screen", detail: "battle" }]);
  });

  it("fails and names the state when one state of a page is missing", () => {
    const report = auditMatrix(
      full.filter((c) => !(c.screenId === "shop" && c.state === "error")),
    );

    expect(report.ok).toBe(false);
    expect(report.gaps).toEqual([{ kind: "state", detail: "shop/error" }]);
  });

  it("fails and names the orientation when only landscape is missing", () => {
    const report = auditMatrix(
      full.filter((c) => !(c.screenId === "map" && c.state === "normal" && c.orientation === "landscape")),
    );

    expect(report.ok).toBe(false);
    expect(report.gaps).toEqual([
      { kind: "orientation", detail: "map/normal/landscape" },
    ]);
  });

  it("fails when landscape is missing everywhere", () => {
    const report = auditMatrix(full.filter((c) => c.orientation === "portrait"));

    expect(report.ok).toBe(false);
    expect(report.covered).toBe(125);
    expect(report.gaps).toHaveLength(125);
    expect(report.gaps.every((g) => g.kind === "orientation")).toBe(true);
  });

  it("ignores unknown extra cells instead of counting them as coverage", () => {
    const extra: MatrixCell[] = [
      ...full.filter((c) => c.screenId !== "eggs"),
      { screenId: "not-a-screen", state: "normal", orientation: "portrait" },
    ];
    const report = auditMatrix(extra);

    expect(report.ok).toBe(false);
    expect(report.covered).toBe(240);
  });

  it("reports an empty run as fully missing", () => {
    const report = auditMatrix([]);

    expect(report.covered).toBe(0);
    expect(report.gaps).toHaveLength(25);
    expect(report.gaps.every((g) => g.kind === "screen")).toBe(true);
  });
});

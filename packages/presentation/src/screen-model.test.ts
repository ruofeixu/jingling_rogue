import { describe, expect, it } from "vitest";
import { SCREEN_IDS, buildScreenModel, type ScreenState } from "./screen-model.ts";

const STATES: ScreenState[] = ["normal", "loading", "empty", "error", "locked"];

describe("ScreenModel", () => {
  it("covers the 25 product surfaces from the screen matrix", () => {
    expect(SCREEN_IDS).toHaveLength(25);
    expect(SCREEN_IDS).toContain("title");
    expect(SCREEN_IDS).toContain("battle");
    expect(new Set(SCREEN_IDS).size).toBe(SCREEN_IDS.length);
  });

  it("is deterministic for the same input", () => {
    const input = {
      screenId: "title",
      state: "normal" as const,
      accessibleName: "标题",
      primaryAction: { id: "start-run", label: "新的旅途" },
    };

    expect(buildScreenModel(input)).toEqual(buildScreenModel(input));
  });

  it("builds every canonical state", () => {
    for (const state of STATES) {
      const model = buildScreenModel({
        screenId: "title",
        state,
        accessibleName: "标题",
        reason: state === "error" || state === "locked" ? "占位原因" : undefined,
      });

      expect(model.state, state).toBe(state);
      expect(model.screenId).toBe("title");
      expect(model.accessibleName.length).toBeGreaterThan(0);
    }
  });

  it("requires a reason for error and locked", () => {
    for (const state of ["error", "locked"] as const) {
      expect(() =>
        buildScreenModel({ screenId: "title", state, accessibleName: "标题" }),
      ).toThrow(/reason/);
    }
  });

  it("keeps primaryAction explicit, never undefined", () => {
    const model = buildScreenModel({ screenId: "stats", state: "empty", accessibleName: "统计" });

    expect(model.primaryAction).toBeNull();
    expect(Object.isFrozen(model)).toBe(true);
  });

  it("rejects unknown screen ids", () => {
    expect(() =>
      buildScreenModel({ screenId: "not-a-screen", state: "normal", accessibleName: "x" }),
    ).toThrow(/unknown screen/);
  });

  it("rejects actions without a stable id", () => {
    expect(() =>
      buildScreenModel({
        screenId: "title",
        state: "normal",
        accessibleName: "标题",
        primaryAction: { id: "", label: "开始" },
      }),
    ).toThrow(/action id/);
  });
});

import { describe, expect, it } from "vitest";
import { STATE_IDS, buildStateModel, type StateId } from "./states.ts";

describe("five-state component model", () => {
  it("names the five canonical states", () => {
    expect(STATE_IDS).toEqual(["normal", "loading", "empty", "error", "locked"]);
  });

  it("builds a normal state with a primary action", () => {
    const model = buildStateModel({
      screenId: "stats",
      state: "normal",
      accessibleName: "统计",
      primaryAction: { id: "refresh", label: "刷新" },
    });

    expect(model.state).toBe("normal");
    expect(model.primaryAction?.id).toBe("refresh");
    expect(model.reason).toBeNull();
  });

  it("requires a reason for error and locked", () => {
    for (const state of ["error", "locked"] as StateId[]) {
      expect(() =>
        buildStateModel({ screenId: "stats", state, accessibleName: "统计" }),
      ).toThrow(/reason/);
    }
  });

  it("requires an explicit next step for empty", () => {
    expect(() =>
      buildStateModel({ screenId: "stats", state: "empty", accessibleName: "统计" }),
    ).toThrow(/empty/);

    const guided = buildStateModel({
      screenId: "stats",
      state: "empty",
      accessibleName: "统计",
      emptyHint: "还没有记录",
    });
    expect(guided.lines).toContain("还没有记录");
  });

  it("keeps loading non-interactive", () => {
    const model = buildStateModel({
      screenId: "stats",
      state: "loading",
      accessibleName: "统计",
      primaryAction: { id: "refresh", label: "刷新" },
    });

    expect(model.primaryAction?.enabled).toBe(false);
    expect(model.primaryAction?.disabledReason).toMatch(/./);
  });

  it("rejects a missing accessible name", () => {
    expect(() =>
      buildStateModel({ screenId: "stats", state: "normal", accessibleName: "" }),
    ).toThrow(/accessibleName/);
  });

  it("rejects an unknown state", () => {
    // @ts-expect-error 运行时守卫必须存在
    expect(() => buildStateModel({ screenId: "stats", state: "spinning", accessibleName: "统计" })).toThrow(
      /state/,
    );
  });
});

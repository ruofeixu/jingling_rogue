import { describe, expect, it } from "vitest";
import { MODE_ACTION_PREFIX, buildModeModel } from "./mode.ts";

const modes = [
  { id: "sprint", label: "短征" },
  { id: "classic", label: "经典" },
  { id: "daily", label: "今日试炼" },
  { id: "endless", label: "无尽长夜" },
  { id: "spliced", label: "长夜·合体" },
  { id: "challenge", label: "苛令" },
];

describe("mode screen model", () => {
  it("renders every mode as an action with a namespaced id", () => {
    const model = buildModeModel({ state: "normal", modes });

    expect(model.screenId).toBe("mode");
    const ids = [model.primaryAction, ...model.secondaryActions].map((a) => a?.id);
    expect(ids).toHaveLength(modes.length);
    for (const id of ids) {
      expect(id?.startsWith(MODE_ACTION_PREFIX)).toBe(true);
    }
  });

  it("keeps the first mode as the single primary action", () => {
    const model = buildModeModel({ state: "normal", modes });

    expect(model.primaryAction?.id).toBe(`${MODE_ACTION_PREFIX}sprint`);
    expect(model.secondaryActions).toHaveLength(modes.length - 1);
  });

  it("requires a written reason for a locked mode", () => {
    const model = buildModeModel({
      state: "normal",
      modes: modes.map((m) => (m.id === "spliced" ? { ...m, lockedReason: "先通关一次经典" } : m)),
    });
    const spliced = model.secondaryActions.find((a) => a.id === `${MODE_ACTION_PREFIX}spliced`);

    expect(spliced?.enabled).toBe(false);
    expect(spliced?.disabledReason).toBe("先通关一次经典");
  });

  it("rejects a locked mode without a reason", () => {
    expect(() =>
      buildModeModel({
        state: "normal",
        // @ts-expect-error 运行时守卫：locked 必须给原因
        modes: [{ id: "spliced", label: "长夜·合体", locked: true }],
      }),
    ).toThrow(/reason/);
  });

  it("supports the five canonical states", () => {
    for (const state of ["normal", "loading", "empty", "error", "locked"] as const) {
      const model = buildModeModel({
        state,
        modes,
        reason: state === "error" || state === "locked" ? "占位原因" : undefined,
        emptyHint: state === "empty" ? "没有可用模式" : undefined,
      });
      expect(model.state, state).toBe(state);
    }
  });

  it("rejects an empty mode list", () => {
    expect(() => buildModeModel({ state: "normal", modes: [] })).toThrow(/modes/);
  });
});

import { describe, expect, it } from "vitest";
import { TITLE_ACTIONS, buildTitleModel } from "./title.ts";

const base = {
  title: "契灵志怪",
  subtitle: "精怪肉鸽",
  hint: "点「名词」看专有词。择一契灵，入世历劫。",
};

describe("title screen model", () => {
  it("declares stable action ids independent of copy", () => {
    expect(TITLE_ACTIONS.startRun).toBe("title.start-run");
    expect(TITLE_ACTIONS.openSettings).toBe("title.open-settings");
    expect(new Set(Object.values(TITLE_ACTIONS)).size).toBe(Object.keys(TITLE_ACTIONS).length);
  });

  it("keeps exactly one primary action", () => {
    const model = buildTitleModel({ ...base, state: "normal" });

    expect(model.screenId).toBe("title");
    expect(model.primaryAction?.id).toBe(TITLE_ACTIONS.startRun);
    expect(model.secondaryActions.length).toBeGreaterThanOrEqual(6);
    for (const action of model.secondaryActions) {
      expect(action.id).not.toBe(TITLE_ACTIONS.startRun);
    }
  });

  it("carries the title, subtitle and hint as lines", () => {
    const model = buildTitleModel({ ...base, state: "normal" });

    expect(model.accessibleName).toContain(base.title);
    expect(model.lines).toContain(base.subtitle);
    expect(model.lines).toContain(base.hint);
  });

  it("supports every canonical state", () => {
    for (const state of ["normal", "loading", "empty", "error", "locked"] as const) {
      const model = buildTitleModel({
        ...base,
        state,
        reason: state === "error" || state === "locked" ? "占位原因" : undefined,
        emptyHint: state === "empty" ? "还没有存档" : undefined,
      });
      expect(model.state, state).toBe(state);
    }
  });

  it("disables the primary action while loading and says why", () => {
    const model = buildTitleModel({ ...base, state: "loading" });

    expect(model.primaryAction?.enabled).toBe(false);
    expect(model.primaryAction?.disabledReason).toBeTruthy();
  });

  it("is deterministic", () => {
    const input = { ...base, state: "normal" as const };
    expect(buildTitleModel(input)).toEqual(buildTitleModel(input));
  });

  it("can lock a secondary entry with a written reason", () => {
    const model = buildTitleModel({
      ...base,
      state: "normal",
      lockedEntries: { [TITLE_ACTIONS.openCodex]: "先完成一次旅途" },
    });
    const codex = model.secondaryActions.find((a) => a.id === TITLE_ACTIONS.openCodex);

    expect(codex?.enabled).toBe(false);
    expect(codex?.disabledReason).toBe("先完成一次旅途");
  });
});

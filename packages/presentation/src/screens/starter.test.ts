import { describe, expect, it } from "vitest";
import { emptyAccount, selectStarter } from "@jingling/core";
import { STARTER_ACTIONS, buildStarterModel } from "./starter.ts";

const account = emptyAccount();
const view = selectStarter(account, "seed-1");

describe("starter selector", () => {
  it("offers a stable candidate order", () => {
    const a = selectStarter(account, "seed-1");
    const b = selectStarter(account, "seed-1");

    expect(a.candidates.map((c) => c.id)).toEqual(b.candidates.map((c) => c.id));
    expect(a.candidates).toHaveLength(3);
  });

  it("exposes cost and affinity for each candidate", () => {
    for (const candidate of view.candidates) {
      expect(candidate.name.length).toBeGreaterThan(0);
      expect(candidate.cost).toBeGreaterThanOrEqual(0);
      expect(candidate.affinities.length).toBeGreaterThan(0);
    }
  });

  it("offers start relics with a chosen one", () => {
    expect(view.relics.length).toBeGreaterThan(0);
    expect(view.chosenRelicId.length).toBeGreaterThan(0);
    expect(view.relics.some((r) => r.id === view.chosenRelicId)).toBe(true);
  });
});

describe("starter screen model", () => {
  it("declares stable action ids", () => {
    expect(STARTER_ACTIONS.confirm).toBe("starter.confirm");
    expect(STARTER_ACTIONS.back).toBe("starter.back");
    expect(STARTER_ACTIONS.pick).toBe("starter.pick");
    expect(STARTER_ACTIONS.retryArt).toBe("starter.retry-art");
  });

  it("keeps a single primary confirm action", () => {
    const model = buildStarterModel({ state: "normal", view, selectedId: view.candidates[0].id, art: "ready" });

    expect(model.screenId).toBe("starter");
    expect(model.primaryAction?.id).toBe(STARTER_ACTIONS.confirm);
    const primaries = [model.primaryAction, ...model.secondaryActions].filter(
      (a) => a?.id === STARTER_ACTIONS.confirm,
    );
    expect(primaries).toHaveLength(1);
  });

  it("cannot confirm without a selection", () => {
    const model = buildStarterModel({ state: "normal", view, selectedId: null, art: "ready" });

    expect(model.primaryAction?.enabled).toBe(false);
    expect(model.primaryAction?.disabledReason).toMatch(/./);
  });

  it("cannot confirm while the portrait is loading, and says why", () => {
    const model = buildStarterModel({
      state: "loading",
      view,
      selectedId: view.candidates[0].id,
      art: "loading",
    });

    expect(model.primaryAction?.enabled).toBe(false);
    expect(model.primaryAction?.disabledReason).toMatch(/./);
  });

  it("offers a retry action when the portrait fails, without starting a run", () => {
    const model = buildStarterModel({
      state: "error",
      view,
      selectedId: view.candidates[0].id,
      art: "error",
      reason: "立绘载入失败",
    });

    expect(model.state).toBe("error");
    expect(model.secondaryActions.some((a) => a.id === STARTER_ACTIONS.retryArt)).toBe(true);
    expect(model.primaryAction?.enabled).toBe(false);
  });

  it("locks a candidate with a written reason", () => {
    const locked = {
      ...view,
      candidates: view.candidates.map((c, i) =>
        i === 1 ? { ...c, lockedReason: "先收契这只精怪" } : c,
      ),
    };
    const model = buildStarterModel({ state: "normal", view: locked, selectedId: null, art: "ready" });
    const card = model.secondaryActions.find((a) => a.id.endsWith(locked.candidates[1].id));

    expect(card?.enabled).toBe(false);
    expect(card?.disabledReason).toBe("先收契这只精怪");
  });

  it("carries the keyframe fields: cost, affinity, relic and confirm", () => {
    const model = buildStarterModel({ state: "normal", view, selectedId: view.candidates[0].id, art: "ready" });
    const text = model.lines.join(" ");

    expect(text).toMatch(/费/);
    expect(text).toMatch(/属/);
    expect(text).toMatch(/契印/);
    expect(model.primaryAction?.label).toMatch(/./);
  });

  it("is idempotent for the same input", () => {
    const input = { state: "normal" as const, view, selectedId: view.candidates[0].id, art: "ready" as const };
    expect(buildStarterModel(input)).toEqual(buildStarterModel(input));
  });

  it("supports the five canonical states", () => {
    for (const state of ["normal", "loading", "empty", "error", "locked"] as const) {
      const model = buildStarterModel({
        state,
        view,
        selectedId: null,
        art: "ready",
        reason: state === "error" || state === "locked" ? "占位原因" : undefined,
      });
      expect(model.state, state).toBe(state);
    }
  });

  it("rejects an empty candidate list", () => {
    expect(() =>
      buildStarterModel({ state: "normal", view: { ...view, candidates: [] }, selectedId: null, art: "ready" }),
    ).toThrow(/candidate/);
  });
});

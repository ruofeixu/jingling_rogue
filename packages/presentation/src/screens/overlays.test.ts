import { describe, expect, it } from "vitest";
import { selectBattleOverlays } from "@jingling/core";
import { OVERLAY_ACTIONS, buildOverlayModel, type OverlayKind } from "./overlays.ts";

const source = {
  active: {
    instanceId: "p0",
    id: "zao_li",
    name: "灶狸",
    level: 5,
    hp: 40,
    maxHp: 48,
    artIds: ["a1", "a2"],
    focusLeft: { a1: 2, a2: 0 },
  },
  party: [
    { instanceId: "p0", id: "zao_li", name: "灶狸", level: 5, hp: 40, maxHp: 48 },
    { instanceId: "p1", id: "jing_zhu", name: "井蛛", level: 4, hp: 0, maxHp: 30 },
    { instanceId: "p2", id: "tao_geng", name: "桃梗", level: 4, hp: 22, maxHp: 28 },
  ],
  foes: [
    { instanceId: "f0", id: "deng_e", name: "灯蛾", level: 1, hp: 12, maxHp: 32 },
    { instanceId: "f1", id: "she_mu", name: "蛇母", level: 2, hp: 0, maxHp: 40 },
  ],
  potions: 1,
  seals: [2, 0, 0, 0, 0],
  activeIndex: 0,
};
const view = selectBattleOverlays(source);
const KINDS: OverlayKind[] = ["arts", "switch", "party", "bag", "target", "catch"];

const empty = selectBattleOverlays({
  ...source,
  active: { ...source.active, artIds: [], focusLeft: {} },
  party: [source.party[0]],
  foes: [],
  potions: 0,
  seals: [],
});

describe("battle overlay selector", () => {
  it("marks an exhausted art as locked", () => {
    const a2 = view.arts.find((row) => row.id === "a2");

    expect(a2?.lockedReason).toMatch(/用尽/);
  });

  it("excludes the active fighter from switch targets and locks the fainted one", () => {
    expect(view.switchTargets.map((r) => r.id)).toEqual(["p1", "p2"]);
    expect(view.switchTargets.find((r) => r.id === "p1")?.lockedReason).toMatch(/倒下/);
  });

  it("locks a fainted foe as an illegal target", () => {
    expect(view.targets.find((r) => r.id === "f1")?.lockedReason).toMatch(/合法目标/);
  });

  it("locks seals with no stock", () => {
    expect(view.seals[0].lockedReason).toBeNull();
    expect(view.seals[1].lockedReason).toMatch(/没有/);
  });
});

describe("battle overlay models", () => {
  for (const kind of KINDS) {
    it(`${kind}: builds a normal model with a single primary and an always-available cancel`, () => {
      const model = buildOverlayModel({ kind, state: "normal", view, selectedId: null });

      expect(model.screenId).toBe(kind);
      expect(model.primaryAction).not.toBeNull();
      expect(model.primaryAction?.enabled).toBe(false);
      const cancel = model.secondaryActions.find((a) => a.id === OVERLAY_ACTIONS.cancel);
      expect(cancel?.enabled).toBe(true);
    });

    it(`${kind}: uses empty with a hint when nothing is available`, () => {
      const model = buildOverlayModel({ kind, state: "empty", view: empty, selectedId: null });

      expect(model.state).toBe("empty");
      expect(model.lines.join("")).toMatch(/./);
      const cancel = model.secondaryActions.find((a) => a.id === OVERLAY_ACTIONS.cancel);
      expect(cancel?.enabled).toBe(true);
    });
  }

  it("enables the primary action once a legal item is selected", () => {
    const model = buildOverlayModel({ kind: "arts", state: "normal", view, selectedId: "a1" });

    expect(model.primaryAction?.enabled).toBe(true);
  });

  it("keeps the primary action disabled for an illegal selection, with a reason", () => {
    const model = buildOverlayModel({ kind: "target", state: "normal", view, selectedId: "f1" });

    expect(model.primaryAction?.enabled).toBe(false);
    expect(model.primaryAction?.disabledReason).toMatch(/合法目标/);
  });

  it("does not filter illegal rows out of the list", () => {
    const model = buildOverlayModel({ kind: "target", state: "normal", view, selectedId: null });
    const rows = model.secondaryActions.filter((a) => a.id.startsWith(OVERLAY_ACTIONS.targetPick));

    expect(rows).toHaveLength(2);
    expect(rows.filter((r) => !r.enabled)).toHaveLength(1);
  });

  it("is deterministic", () => {
    const input = { kind: "bag" as const, state: "normal" as const, view, selectedId: "potion" };
    expect(buildOverlayModel(input)).toEqual(buildOverlayModel(input));
  });

  it("supports the five canonical states", () => {
    for (const state of ["normal", "loading", "empty", "error", "locked"] as const) {
      const model = buildOverlayModel({
        kind: "arts",
        state,
        view: state === "empty" ? empty : view,
        selectedId: null,
        reason: state === "error" || state === "locked" ? "占位原因" : undefined,
      });
      expect(model.state, state).toBe(state);
    }
  });

  it("rejects an unknown overlay kind", () => {
    // @ts-expect-error 运行时守卫必须存在
    expect(() => buildOverlayModel({ kind: "nope", state: "normal", view })).toThrow(/overlay/);
  });
});

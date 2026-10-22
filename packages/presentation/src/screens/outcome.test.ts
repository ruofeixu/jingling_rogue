import { describe, expect, it } from "vitest";
import { selectOutcome } from "@jingling/core";
import { OUTCOME_ACTIONS, buildOutcomeModel, type OutcomeKind } from "./outcome.ts";

const won = selectOutcome({
  won: true,
  wave: 12,
  gold: 240,
  details: [
    { label: "收服", value: "3 只" },
    { label: "最深", value: "第 12 波" },
  ],
  hatched: [{ label: "孵出", value: "灶狸" }],
});
const lost = selectOutcome({ won: false, wave: 5, gold: 40, details: [{ label: "收服", value: "1 只" }] });
const KINDS: OutcomeKind[] = ["defeat", "victory", "hatch"];

describe("outcome selector", () => {
  it("defaults committed to false and art to ready", () => {
    expect(won.committed).toBe(false);
    expect(won.art).toBe("ready");
  });

  it("reports committed once the result is recorded", () => {
    expect(selectOutcome({ won: true, wave: 1, gold: 0, committed: true }).committed).toBe(true);
  });

  it("returns an empty detail list rather than undefined", () => {
    const bare = selectOutcome({ won: false, wave: 1, gold: 0 });

    expect(bare.details).toEqual([]);
    expect(bare.hatched).toEqual([]);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(won)).toBe(true);
  });
});

describe("outcome models", () => {
  for (const kind of KINDS) {
    it(`${kind}: allows commit once and always allows returning to the lobby`, () => {
      const model = buildOutcomeModel({ kind, state: "normal", view: won });

      expect(model.primaryAction?.id).toBe(OUTCOME_ACTIONS.commit);
      expect(model.primaryAction?.enabled).toBe(true);
      const lobby = model.secondaryActions.find((a) => a.id === OUTCOME_ACTIONS.lobby);
      expect(lobby?.enabled).toBe(true);
    });

    it(`${kind}: disables commit after it is recorded, with a reason`, () => {
      const committed = selectOutcome({ won: true, wave: 12, gold: 240, committed: true });
      const model = buildOutcomeModel({ kind, state: "normal", view: committed });

      expect(model.primaryAction?.enabled).toBe(false);
      expect(model.primaryAction?.disabledReason).toMatch(/不会重复计入/);
      const lobby = model.secondaryActions.find((a) => a.id === OUTCOME_ACTIONS.lobby);
      expect(lobby?.enabled).toBe(true);
    });

    it(`${kind}: keeps a usable model when details are missing`, () => {
      const bare = selectOutcome({ won: false, wave: 1, gold: 0 });
      const model = buildOutcomeModel({ kind, state: "empty", view: bare });

      expect(model.state).toBe("empty");
      expect(model.lines.join("")).toMatch(/./);
      const lobby = model.secondaryActions.find((a) => a.id === OUTCOME_ACTIONS.lobby);
      expect(lobby?.enabled).toBe(true);
    });

    it(`${kind}: is deterministic so repeated taps cannot diverge`, () => {
      const input = { kind, state: "normal" as const, view: won };

      expect(buildOutcomeModel(input)).toEqual(buildOutcomeModel(input));
    });
  }

  it("survives an interruption: the same source resolves to the same two states", () => {
    const before = buildOutcomeModel({
      kind: "victory",
      state: "normal",
      view: selectOutcome({ won: true, wave: 12, gold: 240, committed: false }),
    });
    const after = buildOutcomeModel({
      kind: "victory",
      state: "normal",
      view: selectOutcome({ won: true, wave: 12, gold: 240, committed: true }),
    });

    expect(before.primaryAction?.enabled).toBe(true);
    expect(after.primaryAction?.enabled).toBe(false);
    expect(after.lines).toEqual(before.lines);
  });

  it("hatch reveals identical content whether or not the animation is skipped", () => {
    const played = buildOutcomeModel({ kind: "hatch", state: "normal", view: won, skipped: false });
    const skipped = buildOutcomeModel({ kind: "hatch", state: "normal", view: won, skipped: true });

    expect(skipped.lines).toEqual(played.lines);
    expect(played.secondaryActions.some((a) => a.id === OUTCOME_ACTIONS.skip)).toBe(true);
    expect(skipped.secondaryActions.some((a) => a.id === OUTCOME_ACTIONS.skip)).toBe(false);
  });

  it("offers a retry when the art failed, and still allows the lobby", () => {
    const broken = selectOutcome({ won: true, wave: 3, gold: 10, art: "error" });
    const model = buildOutcomeModel({ kind: "victory", state: "normal", view: broken });

    expect(model.secondaryActions.some((a) => a.id === OUTCOME_ACTIONS.retryArt)).toBe(true);
    expect(model.secondaryActions.find((a) => a.id === OUTCOME_ACTIONS.lobby)?.enabled).toBe(true);
  });

  it("blocks commit while art is still loading", () => {
    const loadingArt = selectOutcome({ won: true, wave: 3, gold: 10, art: "loading" });
    const model = buildOutcomeModel({ kind: "hatch", state: "normal", view: loadingArt });

    expect(model.primaryAction?.enabled).toBe(false);
    expect(model.primaryAction?.disabledReason).toMatch(/载入/);
  });

  it("says whether the run was won", () => {
    expect(buildOutcomeModel({ kind: "victory", state: "normal", view: won }).lines[0]).toMatch(/赢/);
    expect(
      buildOutcomeModel({ kind: "defeat", state: "normal", view: lost }).lines[0],
    ).toMatch(/到此为止/);
  });

  it("supports the five canonical states", () => {
    for (const state of ["normal", "loading", "empty", "error", "locked"] as const) {
      const model = buildOutcomeModel({
        kind: "hatch",
        state,
        view: won,
        reason: state === "error" || state === "locked" ? "占位原因" : undefined,
      });
      expect(model.state, state).toBe(state);
    }
  });

  it("rejects an unknown outcome kind", () => {
    // @ts-expect-error 运行时守卫必须存在
    expect(() => buildOutcomeModel({ kind: "nope", state: "normal", view: won })).toThrow(/outcome/);
  });
});

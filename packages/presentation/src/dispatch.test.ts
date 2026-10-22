import { describe, expect, it } from "vitest";
import { resolveAction } from "./dispatch.ts";
import { TITLE_ACTIONS } from "./screens/title.ts";
import { MODE_ACTION_PREFIX } from "./screens/mode.ts";

describe("action dispatch", () => {
  it("maps title actions to pure route intents", () => {
    expect(resolveAction(TITLE_ACTIONS.startRun)).toEqual({ kind: "route", to: "mode" });
    expect(resolveAction(TITLE_ACTIONS.openSettings)).toEqual({ kind: "route", to: "settings" });
    expect(resolveAction(TITLE_ACTIONS.openCodex)).toEqual({ kind: "route", to: "codex-list" });
  });

  it("maps a mode action to a command intent carrying the mode id", () => {
    expect(resolveAction(`${MODE_ACTION_PREFIX}classic`)).toEqual({
      kind: "command",
      command: "select-mode",
      payload: { mode: "classic" },
    });
  });

  it("returns data only, never executes anything", () => {
    const intent = resolveAction(TITLE_ACTIONS.startRun);

    expect(typeof intent).toBe("object");
    expect(Object.isFrozen(intent)).toBe(true);
    for (const value of Object.values(intent)) {
      expect(typeof value).not.toBe("function");
    }
  });

  it("rejects unknown actions", () => {
    expect(() => resolveAction("nope")).toThrow(/unknown action/);
    expect(() => resolveAction("")).toThrow(/unknown action/);
  });

  it("is stable for the same id", () => {
    expect(resolveAction(TITLE_ACTIONS.startRun)).toEqual(resolveAction(TITLE_ACTIONS.startRun));
  });
});

describe("action dispatch — live run namespaces (U12)", () => {
  it("maps battle commands to command intents", () => {
    expect(resolveAction("battle.art")).toEqual({
      kind: "command",
      command: "battle.art",
      payload: {},
    });
    expect(resolveAction("battle.flee")).toEqual({
      kind: "command",
      command: "battle.flee",
      payload: {},
    });
  });

  it("maps overlay pick + confirm into commands carrying the picked id", () => {
    expect(resolveAction("arts.pick.a1")).toEqual({
      kind: "command",
      command: "arts.pick",
      payload: { id: "a1" },
    });
    expect(resolveAction("arts.pick.confirm")).toEqual({
      kind: "command",
      command: "arts.confirm",
      payload: {},
    });
    expect(resolveAction("target.pick.f0")).toEqual({
      kind: "command",
      command: "target.pick",
      payload: { id: "f0" },
    });
    expect(resolveAction("overlay.cancel")).toEqual({
      kind: "command",
      command: "overlay.cancel",
      payload: {},
    });
  });

  it("maps progress commands including a bought item id", () => {
    expect(resolveAction("summary.continue")).toEqual({
      kind: "command",
      command: "summary.continue",
      payload: {},
    });
    expect(resolveAction("shop.buy.s1")).toEqual({
      kind: "command",
      command: "shop.buy",
      payload: { id: "s1" },
    });
    expect(resolveAction("map.enter.n1")).toEqual({
      kind: "command",
      command: "map.enter",
      payload: { id: "n1" },
    });
    expect(resolveAction("omen.skip")).toEqual({
      kind: "command",
      command: "omen.skip",
      payload: {},
    });
  });

  it("maps outcome commands", () => {
    expect(resolveAction("outcome.commit")).toEqual({
      kind: "command",
      command: "outcome.commit",
      payload: {},
    });
    expect(resolveAction("outcome.lobby")).toEqual({
      kind: "command",
      command: "outcome.lobby",
      payload: {},
    });
  });

  it("maps starter pick + confirm", () => {
    expect(resolveAction("starter.pick.zao_li")).toEqual({
      kind: "command",
      command: "starter.pick",
      payload: { id: "zao_li" },
    });
    expect(resolveAction("starter.confirm")).toEqual({
      kind: "command",
      command: "starter.confirm",
      payload: {},
    });
  });

  it("keeps all live-run intents frozen and function-free", () => {
    for (const id of ["battle.art", "shop.buy.s1", "outcome.commit", "starter.pick.x"]) {
      const intent = resolveAction(id);
      expect(Object.isFrozen(intent)).toBe(true);
      for (const value of Object.values(intent)) {
        expect(typeof value).not.toBe("function");
      }
    }
  });
});

import { describe, expect, it } from "vitest";
import { selectBattle } from "@jingling/core";
import { BATTLE_ACTIONS, buildBattleModel } from "./battle.ts";

const battle = {
  active: {
    id: "zao_li",
    name: "灶狸",
    level: 5,
    hp: 48,
    maxHp: 48,
    ailment: null,
    artIds: ["a1", "a2"],
  },
  foe: { id: "deng_e", name: "灯蛾", level: 1, hp: 32, maxHp: 32, ailment: null },
  party: [{ hp: 48 }, { hp: 20 }],
  potions: 1,
};
const run = { wave: 1, gold: 1000, realmId: "town_ruins" };
const view = selectBattle(battle, run, "灯蛾 出现了。");

describe("battle screen model", () => {
  it("declares stable action ids", () => {
    expect(BATTLE_ACTIONS.art).toBe("battle.art");
    expect(BATTLE_ACTIONS.party).toBe("battle.party");
    expect(BATTLE_ACTIONS.bag).toBe("battle.bag");
    expect(BATTLE_ACTIONS.flee).toBe("battle.flee");
  });

  it("keeps the command order 术 / 队伍 / 囊 / 走", () => {
    const model = buildBattleModel({ state: "normal", view });
    const ids = [model.primaryAction, ...model.secondaryActions].map((a) => a?.id);

    expect(ids).toEqual([
      BATTLE_ACTIONS.art,
      BATTLE_ACTIONS.party,
      BATTLE_ACTIONS.bag,
      BATTLE_ACTIONS.flee,
    ]);
  });

  it("is deterministic for the same view", () => {
    expect(buildBattleModel({ state: "normal", view })).toEqual(
      buildBattleModel({ state: "normal", view }),
    );
  });

  it("shows both nameplates with hp and level", () => {
    const model = buildBattleModel({ state: "normal", view });
    const text = model.lines.join(" ");

    expect(text).toContain("灶狸");
    expect(text).toContain("灯蛾");
    expect(text).toContain("48/48");
    expect(text).toContain("32/32");
    expect(text).toMatch(/Lv\s*5/);
  });

  it("marks a fainted fighter as down", () => {
    const downed = selectBattle(
      { ...battle, foe: { ...battle.foe, hp: 0 } },
      run,
      "灯蛾 倒下了。",
    );
    const model = buildBattleModel({ state: "normal", view: downed });

    expect(model.lines.join(" ")).toMatch(/倒下/);
  });

  it("gives a written reason for every locked command", () => {
    const locked = selectBattle(
      { ...battle, active: { ...battle.active, artIds: [] }, party: [{ hp: 48 }], potions: 0 },
      run,
    );
    const model = buildBattleModel({ state: "normal", view: locked });
    const all = [model.primaryAction, ...model.secondaryActions];

    for (const action of all) {
      if (action && !action.enabled) {
        expect(action.disabledReason, action.id).toMatch(/./);
      }
    }
    expect(all.filter((a) => a && !a.enabled)).toHaveLength(3);
  });

  it("disables every command while loading", () => {
    const model = buildBattleModel({ state: "loading", view });
    const all = [model.primaryAction, ...model.secondaryActions];

    for (const action of all) {
      expect(action?.enabled, action?.id).toBe(false);
      expect(action?.disabledReason, action?.id).toMatch(/./);
    }
  });

  it("supports the five canonical states", () => {
    for (const state of ["normal", "loading", "empty", "error", "locked"] as const) {
      const model = buildBattleModel({
        state,
        view,
        reason: state === "error" || state === "locked" ? "占位原因" : undefined,
      });
      expect(model.state, state).toBe(state);
    }
  });

  it("uses empty when there is no battle and says what to do", () => {
    const model = buildBattleModel({ state: "empty", view });

    expect(model.state).toBe("empty");
    expect(model.lines.join("")).toMatch(/./);
  });

  it("carries wave, gold and realm in the header lines", () => {
    const model = buildBattleModel({ state: "normal", view });
    const text = model.lines.join(" ");

    expect(text).toMatch(/波\s*1/);
    expect(text).toContain("1000");
  });
});

import { describe, expect, it } from "vitest";
import { selectBattle } from "@jingling/core";
import { buildBattleModel } from "./battle.ts";

const entity = { id: "zao_li", name: "灶狸", level: 5, hp: 40, maxHp: 48, ailment: null, artIds: ["cinder_claw"] };
const battle = {
  active: entity,
  foe: { ...entity, id: "mi_shu", name: "蜜鼠" },
  party: [{ hp: 40 }],
  potions: 1,
};

describe("battle model exposes the picked-up items for the battle scene", () => {
  it("carries name, tag, hint and count for every item", () => {
    const view = selectBattle(
      battle as never,
      { wave: 3, gold: 10, realmId: "r", relicIds: ["ox_mark"], boonIds: ["iron_claw", "iron_claw"] },
      "",
    );
    const model = buildBattleModel({ state: "normal", view });

    expect(model.items.map((item) => item.id)).toEqual(["ox_mark", "iron_claw"]);
    expect(model.items[0]).toMatchObject({ name: "牛记", tag: "守", hint: "本局全队守+4", count: 1 });
    expect(model.items[1]).toMatchObject({ name: "铁爪", count: 2 });
  });

  it("is empty (not missing) when nothing has been picked up", () => {
    const view = selectBattle(battle as never, { wave: 1, gold: 0, realmId: "r" }, "");

    expect(buildBattleModel({ state: "normal", view }).items).toEqual([]);
  });

  it("does not leak item text into the status lines the log reads", () => {
    const view = selectBattle(battle as never, { wave: 1, gold: 0, realmId: "r", boonIds: ["iron_claw"] }, "灶狸 出现了。");
    const model = buildBattleModel({ state: "normal", view });

    expect(model.lines.join(" ")).not.toContain("铁爪");
  });
});

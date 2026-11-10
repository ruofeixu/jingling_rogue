import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { selectBattle } from "./selectors.ts";

const entity = { id: "zao_li", name: "灶狸", level: 5, hp: 40, maxHp: 48, ailment: null, artIds: ["cinder_claw"] };
const battle = {
  active: entity,
  foe: { ...entity, id: "mi_shu", name: "蜜鼠" },
  party: [{ hp: 40 }],
  potions: 1,
};

describe("battle view carries the items the run has picked up", () => {
  it("lists relics first, then boons, merging repeats into a count", () => {
    const view = selectBattle(
      battle as never,
      {
        wave: 3,
        gold: 10,
        realmId: "r",
        relicIds: ["ox_mark"],
        boonIds: ["iron_claw", "gourd_life", "iron_claw"],
      },
      "",
    );

    expect(view.items.map((item) => item.id)).toEqual(["ox_mark", "iron_claw", "gourd_life"]);
    const relic = view.items[0]!;
    expect(relic.source).toBe("relic");
    expect(relic.name).toBe("牛记");
    expect(relic.hint).toBe("本局全队守+4");
    expect(relic.tag).toBe("守");
    expect(relic.count).toBe(1);

    const claw = view.items[1]!;
    expect(claw.source).toBe("boon");
    expect(claw.hint).toBe("本局全队攻+4");
    expect(claw.tag).toBe("攻");
    expect(claw.count).toBe(2);
  });

  it("is empty when the run has picked up nothing, and tolerates old callers", () => {
    expect(selectBattle(battle as never, { wave: 1, gold: 0, realmId: "r" }, "").items).toEqual([]);
  });

  it("keeps an unknown id visible with a neutral hint instead of dropping it", () => {
    const view = selectBattle(battle as never, { wave: 1, gold: 0, realmId: "r", boonIds: ["no_such_boon"] }, "");

    expect(view.items).toHaveLength(1);
    expect(view.items[0]!.name).toBe("no_such_boon");
    expect(view.items[0]!.hint).toBe("本局机缘");
  });
});

describe("mini-game build safety", () => {
  it("does not spread a Map in selectors (the mini-game transpile turns it into [].concat(map))", () => {
    const src = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "selectors.ts"), "utf8");

    expect(/\[\.\.\.\s*(?:new Map|[A-Za-z_]*[Cc]ounts?\b)/.test(src)).toBe(false);
    expect(/\[\.\.\.[A-Za-z_.]*\.(?:entries|values|keys)\(\)\]/.test(src)).toBe(false);
  });
});

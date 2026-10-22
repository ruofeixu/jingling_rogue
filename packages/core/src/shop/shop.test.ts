import { describe, expect, it } from "vitest";
import { forcedTiers, openShop, potionWeight, rerollCost, rerollShop } from "./shop.ts";
import { ClassicSlice } from "../run/classic-slice.ts";

describe("shop", () => {
  it("prices rerolls as 250 * ceil(wave/10) * 2^R", () => {
    expect(rerollCost(1, 0)).toBe(250);
    expect(rerollCost(10, 0)).toBe(250);
    expect(rerollCost(11, 0)).toBe(500);
    expect(rerollCost(11, 1)).toBe(1000);
  });

  it("prices locked rerolls from the offered tiers", () => {
    expect(rerollCost(1, 0, ["fan", "fan", "fan"])).toBe(150);
    expect(rerollCost(11, 1, ["te"])).toBe(1200);
  });

  it("forces 1 特 and 2 上 on wave 25", () => {
    expect(forcedTiers(25)).toEqual(["te", "shang", "shang"]);
    const shop = openShop({ wave: 25, seed: "wave-25", gold: 1000 });
    expect(shop.offers.map((row) => row.tier).sort()).toEqual(["shang", "shang", "te"]);
  });

  it("adds a shop slot per golden charm up to six", () => {
    expect(openShop({ wave: 1, seed: "gold-slot", gold: 1000, goldenSlots: 1 }).offers).toHaveLength(4);
    expect(openShop({ wave: 1, seed: "gold-slot", gold: 1000, goldenSlots: 5 }).offers).toHaveLength(6);
  });

  it("raises draught weight when a party member is hurt", () => {
    expect(potionWeight([1, 1])).toBe(0);
    expect(potionWeight([0.5])).toBeGreaterThan(0);
  });

  it("spends gold to reroll three new offers", () => {
    const shop = openShop({ wave: 1, seed: "reroll-1", gold: 1000 });
    const before = shop.offers.map((row) => row.id).join(",");
    const next = rerollShop(shop, "reroll-1");
    expect(next.gold).toBe(750);
    expect(next.rerolls).toBe(1);
    expect(next.offers).toHaveLength(3);
    expect(next.offers.map((row) => row.id).join(",")).not.toBe(before);
  });
});

describe("ClassicSlice shop", () => {
  it("opens a shop after a win and can reroll", () => {
    const slice = new ClassicSlice({ seed: "slice-shop", starterId: "zao_li" });
    slice.run.gold = 1000;
    slice.beginWave();
    slice.noteWin();
    slice.skipCatch();
    expect(slice.shop?.offers).toHaveLength(3);
    expect(slice.boonChoices).toHaveLength(3);
    const gold = slice.run.gold;
    expect(gold).toBeGreaterThan(1000);
    slice.rerollShop();
    expect(slice.run.gold).toBe(gold - 250);
    expect(slice.shop?.rerolls).toBe(1);
  });
});

import { describe, expect, it } from "vitest";
import { getArt, getSpirit, loadTables } from "../tables/load-tables.ts";
import { makeSpirit } from "../combat/spirit-entity.ts";
import { eligibleShopBoons, stockForWave } from "../shop/shop.ts";
import { moveCharm } from "./move-charm.ts";
import {
  applyBoon,
  artPowerMul,
  canUseFormItem,
  createRun,
  emptyAccount,
  tickWarTokens,
  useBagItem,
  warMul,
} from "./run-session.ts";

const REQUIRED_IDS = [
  "seal_pouch",
  "seal_pouch_shang",
  "seal_pouch_te",
  "seal_pouch_qi",
  "seal_pouch_jie",
  "small_draught",
  "cleanse_talisman",
  "soul_return",
  "ether_dew",
  "rare_sugar",
  "party_sugar",
  "sugar_jar",
  "bone_dose_atk",
  "temper_mint",
  "focus_up",
  "focus_full",
  "war_hit",
  "war_atk",
  "war_crit",
  "lure_fan",
  "lure_shang",
  "lure_te",
  "lure_gold",
  "tm_fan",
  "tm_shang",
  "evo_dust",
  "sanctify_stone",
  "colossus_shroom",
  "apex_crystal",
  "twin_pact",
  "unsplice_charm",
  "voucher_fan",
  "voucher_shang",
  "voucher_te",
  "fruit_heal",
  "fruit_cleanse",
  "fruit_focus",
  "fruit_pinch",
  "type_boost_flame",
  "species_boost_zao_li",
  "leftover_meal",
  "focus_knot",
  "momentum_band",
  "king_bead",
  "shell_chime",
  "soothe_chime",
  "temper_dew",
  "spirit_mirror",
  "wide_mirror",
  "revive_seed",
  "relay_rod",
  "grip_nail",
  "first_nail",
  "burn_bead",
  "toxic_bead",
  "young_bone",
  "lost_swallow",
  "multi_mirror",
  "ley_chart",
  "lock_casket",
  "coin_charm",
  "exp_share",
  "exp_balance",
  "exp_charm",
  "exp_charm_shang",
  "exp_charm_gold",
  "shiny_charm",
  "hidden_pact_charm",
  "bone_mirror",
  "sanctify_cuff",
  "colossus_band",
  "apex_vessel",
  "fruit_pouch",
  "heal_charm",
  "catch_charm",
  "golden_slot",
];

describe("spec 5.2 boon types", () => {
  it("lists every named kind and applies one effect each", () => {
    const ids = new Set(loadTables().boons.map((row) => row.id));
    for (const id of REQUIRED_IDS) {
      expect(ids.has(id), id).toBe(true);
    }

    const run = createRun({ seed: "boon-5-2", starterId: "zao_li" });
    const account = emptyAccount();
    account.vouchers.fan = 1;
    account.boneCap.zao_li = 2;

    applyBoon(run, "seal_pouch_shang");
    expect(run.seals[1]).toBeGreaterThan(0);
    applyBoon(run, "small_draught");
    expect(run.potions).toBeGreaterThan(3);
    applyBoon(run, "cleanse_talisman");
    applyBoon(run, "ether_dew");
    const unit = makeSpirit({ id: "zao_li", side: "player", level: 10 });
    unit.ailment = { kind: "burn" };
    unit.focusLeft.cinder_claw = 0;
    useBagItem(run, unit, "cleanse_talisman");
    expect(unit.ailment).toBeNull();
    useBagItem(run, unit, "ether_dew");
    expect(unit.focusLeft.cinder_claw).toBeGreaterThan(0);
    run.partyHpRatios = [0];
    applyBoon(run, "soul_return");
    expect(run.partyHpRatios[0]).toBeGreaterThan(0);

    run.partyLevels = [5];
    applyBoon(run, "rare_sugar");
    expect(run.partyLevels[0]).toBe(6);
    run.partyIds = ["zao_li", "jing_zhu"];
    run.partyLevels = [4, 4];
    applyBoon(run, "party_sugar");
    expect(run.partyLevels).toEqual([5, 5]);
    applyBoon(run, "sugar_jar", account);
    expect(account.candy.zao_li ?? 0).toBeGreaterThan(0);

    applyBoon(run, "bone_dose_atk", account);
    applyBoon(run, "bone_dose_atk", account);
    applyBoon(run, "bone_dose_atk", account);
    expect(run.partyCharms[0].filter((id) => id === "bone_dose_atk")).toHaveLength(2);
    run.partyIds = ["zao_li", "jing_zhu"];
    run.partyCharms = [["bone_dose_atk"], []];
    expect(() => moveCharm(run, 0, 1, "bone_dose_atk")).toThrow(/bone/);

    applyBoon(run, "temper_mint", account);
    expect(run.partyTempers[0]).not.toBe("plain");
    expect(account.tempers.length).toBeGreaterThan(0);

    applyBoon(run, "focus_up");
    applyBoon(run, "focus_full");
    const drained = makeSpirit({ id: "zao_li", side: "player", level: 10 });
    drained.focusLeft.cinder_claw = 1;
    useBagItem(run, drained, "focus_up");
    expect(drained.focusLeft.cinder_claw).toBeGreaterThan(1);
    drained.focusLeft.cinder_claw = 0;
    useBagItem(run, drained, "focus_full");
    expect(drained.focusLeft.cinder_claw).toBe(getArt("cinder_claw").focus);

    applyBoon(run, "war_hit");
    applyBoon(run, "war_atk");
    applyBoon(run, "war_crit");
    expect(warMul(run, "hit")).toBe(1.5);
    expect(warMul(run, "atk")).toBe(1.3);
    expect(run.warTokens.some((row) => row.tag === "crit")).toBe(true);
    for (let i = 0; i < 5; i++) {
      tickWarTokens(run);
    }
    expect(run.warTokens).toHaveLength(0);

    applyBoon(run, "lure_te");
    applyBoon(run, "lure_gold");
    expect(run.lures.map((row) => row.id).sort()).toEqual(["lure_gold", "lure_te"]);

    applyBoon(run, "tm_fan");
    expect(run.partyExtraArts[0].length).toBeGreaterThan(0);

    run.partyIds = ["zao_li"];
    run.partyLevels = [20];
    applyBoon(run, "evo_dust");
    expect(run.partyIds[0]).toBe(getSpirit("zao_li").evolveTo);

    applyBoon(run, "sanctify_stone");
    expect(canUseFormItem(run, "sanctify_stone")).toBe(false);
    applyBoon(run, "sanctify_cuff");
    expect(canUseFormItem(run, "sanctify_stone")).toBe(true);

    applyBoon(run, "twin_pact");
    applyBoon(run, "unsplice_charm");
    expect(run.spliceCharges).toBe(1);
    expect(run.unspliceCharges).toBe(1);

    applyBoon(run, "voucher_fan", account);
    expect(account.vouchers.fan).toBe(2);

    applyBoon(run, "fruit_heal");
    applyBoon(run, "fruit_heal");
    applyBoon(run, "fruit_heal");
    expect(run.partyCharms[0].filter((id) => id === "fruit_heal")).toHaveLength(2);

    applyBoon(run, "type_boost_flame");
    applyBoon(run, "species_boost_zao_li");
    expect(artPowerMul(run, { id: "zao_li", affinities: ["flame"] }, "flame")).toBeCloseTo(1.44);
    expect(artPowerMul(run, { id: "jing_zhu", affinities: ["wood"] }, "wood")).toBe(1);

    applyBoon(run, "leftover_meal");
    expect(run.partyCharms[0]).toContain("meal");
    applyBoon(run, "golden_slot");
    expect(run.goldenSlots).toBe(1);
    applyBoon(run, "lock_casket");
    expect(run.hasLock).toBe(true);
    applyBoon(run, "apex_vessel");
    expect(run.hasApexBand).toBe(true);
    applyBoon(run, "catch_charm");
    expect(run.boonIds).toContain("catch_charm");
  });

  it("filters shop pool by wave, party, mode, and reroll", () => {
    expect(stockForWave(1).some((row) => row.id === "ether_dew")).toBe(true);
    const grown = eligibleShopBoons({ wave: 40, partyIds: ["zao_li"] });
    expect(grown.some((row) => row.kind === "evolve")).toBe(true);
    expect(eligibleShopBoons({ wave: 40, partyIds: ["huo_de_li"] }).some((row) => row.kind === "evolve")).toBe(
      false,
    );
    expect(eligibleShopBoons({ wave: 181, partyIds: ["zao_li"] }).some((row) => row.kind === "map")).toBe(false);
    expect(eligibleShopBoons({ wave: 199, partyIds: ["zao_li"] }).some((row) => row.kind === "gold")).toBe(false);
    expect(eligibleShopBoons({ wave: 20, mode: "daily", partyIds: ["zao_li"] }).some((row) => row.kind === "voucher")).toBe(
      false,
    );
    expect(eligibleShopBoons({ wave: 20, mode: "endless", partyIds: ["zao_li"] }).some((row) => row.id === "voucher_te")).toBe(
      false,
    );
    const fresh = eligibleShopBoons({ wave: 20, rerolls: 0, partyIds: ["zao_li"] }).find((row) => row.id === "voucher_fan");
    const tired = eligibleShopBoons({ wave: 20, rerolls: 3, partyIds: ["zao_li"] }).find((row) => row.id === "voucher_fan");
    expect(fresh && tired && tired.weight < fresh.weight).toBe(true);
    expect(eligibleShopBoons({ wave: 20, partyIds: ["zao_li"], seenCount: 10 }).some((row) => row.id === "catch_charm")).toBe(
      false,
    );
    expect(eligibleShopBoons({ wave: 20, partyIds: ["zao_li"], seenCount: 100 }).some((row) => row.id === "catch_charm")).toBe(
      true,
    );
    expect(
      eligibleShopBoons({ wave: 20, partyIds: ["zao_li"], seenCount: 100, challenges: ["blank"] }).some(
        (row) => row.id === "catch_charm",
      ),
    ).toBe(false);
    expect(eligibleShopBoons({ wave: 20, partyIds: ["zao_li"] }).some((row) => row.kind === "formItem")).toBe(false);
    expect(
      eligibleShopBoons({ wave: 20, partyIds: ["zao_li"], boonIds: ["sanctify_cuff"] }).some((row) => row.id === "sanctify_stone"),
    ).toBe(true);
    expect(eligibleShopBoons({ wave: 20, partyIds: ["zao_li"] }).some((row) => row.kind === "splicer")).toBe(false);
    expect(eligibleShopBoons({ wave: 20, partyIds: ["zao_li", "jing_zhu"] }).some((row) => row.kind === "splicer")).toBe(
      true,
    );
  });
});

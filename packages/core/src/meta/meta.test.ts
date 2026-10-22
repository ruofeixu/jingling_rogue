import { describe, expect, it } from "vitest";
import { hatchEgg, hatchReady, redeemVoucher, skipEggSteps, voucherEggCount, rollMachine, dailyLegendPool, useEggMachine } from "./eggs.ts";
import { currentCost, spendCandy, addCandy } from "./candy.ts";
import { dailyMiasma, spreadMiasma, expMul } from "./miasma.ts";
import { emptyAccount } from "../run/run-session.ts";
import { costCap } from "../run/modes/types.ts";
import { getSpirit } from "../tables/load-tables.ts";
import pools from "../tables/eggs.json";

describe("eggs and candy", () => {
  it("lets a new account skip-hatch a fan voucher egg into the codex", () => {
    const account = emptyAccount();
    expect(account.vouchers.fan).toBe(1);
    const eggs = redeemVoucher(account, "fan", "fan-1");
    expect(eggs).toHaveLength(1);
    expect(hatchReady(account)).toHaveLength(0);
    skipEggSteps(account);
    expect(hatchReady(account)).toHaveLength(1);
    const id = hatchEgg(account, eggs[0].id);
    expect(account.codex).toContain(id);
    expect(account.eggs).toHaveLength(0);
  });

  it("turns a gold voucher into 25 eggs including an epic", () => {
    const account = emptyAccount();
    account.vouchers.jin = 1;
    const eggs = redeemVoucher(account, "jin", "gold-1");
    expect(voucherEggCount("jin")).toBe(25);
    expect(eggs).toHaveLength(25);
    expect(eggs.some((egg) => egg.tier === "epic")).toBe(true);
    expect(account.vouchers.jin).toBe(0);
    expect(account.eggs).toHaveLength(25);
  });

  it("spends candy to lower a starter cost", () => {
    const account = emptyAccount();
    addCandy(account, "zao_li", 40);
    expect(currentCost("zao_li", account)).toBe(3);
    spendCandy(account, "zao_li", "cost");
    expect(currentCost("zao_li", account)).toBe(2);
    expect(costCap("classic")).toBe(10);
    expect(costCap("endless")).toBe(15);
  });

  it("spends candy on a second pact, then a species egg, and stops cost at 1", () => {
    const account = emptyAccount();
    addCandy(account, "zao_li", 100);
    expect(() => spendCandy(account, "zao_li", "egg")).toThrow(/pact/);
    spendCandy(account, "zao_li", "pact");
    expect(account.secondPact).toContain("zao_li");
    const candyAfterPact = account.candy.zao_li;
    spendCandy(account, "zao_li", "egg");
    expect(account.candy.zao_li).toBe(candyAfterPact - 20);
    expect(account.eggs.some((egg) => egg.spiritId === "zao_li")).toBe(true);
    spendCandy(account, "zao_li", "cost");
    spendCandy(account, "zao_li", "cost");
    expect(currentCost("zao_li", account)).toBe(1);
    expect(() => spendCandy(account, "zao_li", "cost")).toThrow(/floor/);
  });

  it("lets three egg machines bias differently and rotates the gold legend pool by UTC day", () => {
    const te = new Set(pools.te);
    const epic = new Set(pools.epic);
    const ids = (kind: "lineage" | "eggArt" | "form") =>
      Array.from({ length: 48 }, (_, i) => rollMachine(kind, `m-${i}`, "2026-08-18").spiritId);
    const flameShare = (list: string[]) => list.filter((id) => getSpirit(id).affinities.includes("flame")).length;
    const teShare = (list: string[]) => list.filter((id) => te.has(id)).length;
    const epicShare = (list: string[]) => list.filter((id) => epic.has(id)).length;
    const lineage = ids("lineage");
    const eggArt = ids("eggArt");
    const form = ids("form");
    expect(flameShare(lineage)).toBeGreaterThan(flameShare(eggArt));
    expect(teShare(eggArt)).toBeGreaterThan(teShare(lineage));
    expect(epicShare(form)).toBeGreaterThan(epicShare(lineage));
    expect(new Set([lineage[0], eggArt[0], form[0]]).size).toBeGreaterThan(1);
    const a = dailyLegendPool("2026-08-18");
    const b = dailyLegendPool("2026-08-18");
    const c = dailyLegendPool("2026-08-19");
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    const account = emptyAccount();
    account.vouchers.fan = 1;
    const egg = useEggMachine(account, "lineage", "ui-machine", "2026-08-18");
    expect(account.vouchers.fan).toBe(0);
    expect(account.eggs).toContainEqual(egg);
  });
});

describe("miasma", () => {
  it("picks five stable hosts per UTC day", () => {
    const caught = ["zao_li", "jing_zhu", "tao_geng", "luan_shi", "dian_zhu", "mo_mao", "deng_e", "yao_shu"];
    const a = dailyMiasma("2026-08-18", caught);
    const b = dailyMiasma("2026-08-18", caught);
    const c = dailyMiasma("2026-08-19", caught);
    expect(a).toHaveLength(5);
    expect(a).toEqual(b);
    expect(c).not.toEqual(a);
  });

  it("spreads and grants 1.5x exp to teammates", () => {
    const party = [
      { id: "zao_li", miasma: true },
      { id: "jing_zhu", miasma: false },
    ];
    spreadMiasma(party);
    expect(party[1].miasma).toBe(true);
    expect(expMul(party[1])).toBe(1.5);
  });
});

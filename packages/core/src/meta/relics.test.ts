import { describe, expect, it } from "vitest";
import { createRun, emptyAccount, sumRunStats } from "../run/run-session.ts";
import { listRelics, offerRelics, starterRelicIds } from "./relics.ts";

describe("starting relics", () => {
  it("ships twelve named 契印 and unlocks three on a new account", () => {
    expect(listRelics()).toHaveLength(12);
    const account = emptyAccount();
    expect(account.unlockedRelics).toEqual(starterRelicIds());
    const offers = offerRelics(account, "relic-1");
    expect(offers).toHaveLength(3);
    expect(new Set(offers.map((row) => row.id)).size).toBe(3);
  });

  it("applies the chosen 契印 when a run starts", () => {
    const gold = createRun({ seed: "relic-gold", starterId: "zao_li", relicId: "kiln_purse" });
    expect(gold.relicIds).toEqual(["kiln_purse"]);
    expect(gold.gold).toBeGreaterThan(1000);
    const claw = createRun({ seed: "relic-atk", starterId: "zao_li", relicId: "iron_mark" });
    expect(sumRunStats(claw).atk).toBeGreaterThan(0);
  });
});

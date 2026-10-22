import { describe, expect, it } from "vitest";
import { hiddenPactOn, pactDealMul, pactTakeMul } from "./pact.ts";

describe("hidden pacts", () => {
  it("keeps hidden hooks off until the charm or second pact is on", () => {
    expect(pactDealMul("hearth_watch", "flame")).toBe(1.2);
    expect(pactDealMul("hearth_watch", "flame", false)).toBe(1.2);
    expect(pactTakeMul("hearth_watch")).toBe(1);
    expect(hiddenPactOn({})).toBe(false);
    expect(hiddenPactOn({ boonIds: ["hidden_pact_charm"] })).toBe(true);
    expect(hiddenPactOn({ secondPact: ["zao_li"], spiritId: "zao_li" })).toBe(true);
    expect(hiddenPactOn({ secondPact: ["jing_zhu"], spiritId: "zao_li" })).toBe(false);
  });

  it("stacks visible deal with hidden deal and take when unlocked", () => {
    expect(pactDealMul("hearth_watch", "flame", true)).toBeCloseTo(1.8);
    expect(pactDealMul("hearth_watch", "tide", true)).toBe(1);
    expect(pactTakeMul("hearth_watch", true)).toBeCloseTo(0.9);
  });
});

import { describe, expect, it } from "vitest";
import { applyOmenOption, listOmens } from "./omen-event.ts";
import { fuse } from "./fusion.ts";
import { grantAchievement, onRunVictory, ACH_CARRY_YOUNG } from "./achievements.ts";
import { createRun, emptyAccount } from "./run-session.ts";
import { isUnlocked } from "./modes/unlocks.ts";
import { ClassicSlice } from "./classic-slice.ts";

describe("omens", () => {
  it("has at least 40 events and can change gold", () => {
    expect(listOmens().length).toBeGreaterThanOrEqual(40);
    const run = createRun({ seed: "omen-gold", starterId: "zao_li" });
    const account = emptyAccount();
    const before = run.gold;
    applyOmenOption(run, account, "release_carp", 0);
    expect(run.gold).toBe(before + 80);
  });
});

describe("fusion", () => {
  it("takes one affinity from each body", () => {
    const fused = fuse("zao_li", "jing_zhu");
    expect(fused.affinities).toEqual(["flame", "tide"]);
    expect(fused.artIds).toHaveLength(4);
    expect(fused.pactId).toBe("hearth_watch");
  });
});

describe("achievements", () => {
  it("unlocks only once", () => {
    const account = emptyAccount();
    expect(grantAchievement(account, "clear_classic")).toBe(true);
    expect(grantAchievement(account, "clear_classic")).toBe(false);
    expect(account.achievements).toEqual(["clear_classic"]);
  });

  it("unlocks 未化骨 pool after a 携幼 clear", () => {
    const account = emptyAccount();
    onRunVictory(account, ["zao_li", "jing_zhu"]);
    expect(account.achievements).toContain(ACH_CARRY_YOUNG);
    expect(account.carryBaby).toBe(true);
    expect(
      isUnlocked("baby_te_pool", {
        classicCleared: account.classicCleared,
        fusedClear: false,
        carryBaby: account.carryBaby,
        legendCatchReady: false,
      }),
    ).toBe(true);
  });
});

describe("omen in slice", () => {
  it("can resolve an omen then continue", () => {
    const slice = new ClassicSlice({ seed: "omen-slice", starterId: "zao_li" });
    slice.openOmen("release_carp");
    expect(slice.phase).toBe("omen");
    const gold = slice.run.gold;
    slice.pickOmen(0);
    expect(slice.run.gold).toBe(gold + 80);
    expect(slice.phase).toBe("boon");
  });
});

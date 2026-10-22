import { describe, expect, it } from "vitest";
import {
  ACH_CARRY_YOUNG,
  evaluateAchievements,
  listAchievements,
  onRunVictory,
} from "./achievements.ts";
import { emptyAccount } from "./run-session.ts";
import { isUnlocked } from "./modes/unlocks.ts";

describe("achievements catalog", () => {
  it("splits public and hidden rows and grants four trigger kinds once", () => {
    const pub = listAchievements({ hidden: false });
    const hid = listAchievements({ hidden: true });
    expect(pub.length).toBeGreaterThanOrEqual(44);
    expect(hid.length).toBeGreaterThanOrEqual(27);
    expect(pub.every((row) => !row.hidden)).toBe(true);
    expect(hid.every((row) => row.hidden)).toBe(true);

    const account = emptyAccount();
    account.codex = Array.from({ length: 10 }, (_, i) => `s${i}`);
    evaluateAchievements(account, { type: "catch" });
    evaluateAchievements(account, { type: "hatch" });
    evaluateAchievements(account, { type: "candy", kind: "cost" });
    evaluateAchievements(account, { type: "daily", wave: 12 });
    const before = account.achievements.length;
    evaluateAchievements(account, { type: "catch" });
    expect(account.achievements.length).toBe(before);
    expect(account.achievements.length).toBeGreaterThan(0);

    onRunVictory(account, ["huo_de_li"]);
    expect(account.ribbons).toContain("zao_li");
    expect(account.achievements).toContain("clear_classic");
    onRunVictory(account, ["zao_li"]);
    expect(account.achievements.filter((id) => id === "clear_classic")).toHaveLength(1);
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

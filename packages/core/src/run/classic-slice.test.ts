import { describe, expect, it } from "vitest";
import { ClassicSlice } from "./classic-slice.ts";

describe("ClassicSlice", () => {
  it("opens wave 1 in 镇墟 as a wild battle", () => {
    const slice = new ClassicSlice({ seed: "slice-1", starterId: "zao_li" });
    const encounter = slice.beginWave();
    expect(slice.run.wave).toBe(1);
    expect(encounter.realmId).toBe("town_ruins");
    expect(encounter.boss).toBe(false);
    expect(slice.phase).toBe("battle");
  });

  it("offers catch then three boons then the next wave after a wild win", () => {
    const slice = new ClassicSlice({ seed: "slice-wild", starterId: "zao_li" });
    slice.beginWave();
    const gold = slice.run.gold;
    slice.noteWin();
    expect(slice.run.gold).toBeGreaterThan(gold);
    expect(slice.phase).toBe("catch");
    slice.skipCatch();
    expect(slice.phase).toBe("boon");
    expect(slice.boonChoices).toHaveLength(3);
    const picked = slice.boonChoices[0].id;
    slice.takeBoon(picked);
    expect(slice.run.boonIds).toContain(picked);
    expect(slice.run.wave).toBe(2);
    expect(slice.phase).toBe("battle");
  });

  it("skips catch after a boss win and leaves 镇墟 at wave 11", () => {
    const slice = new ClassicSlice({ seed: "slice-boss", starterId: "jing_zhu" });
    slice.run.wave = 10;
    const boss = slice.beginWave();
    expect(boss.boss).toBe(true);
    slice.noteWin();
    expect(slice.phase).toBe("boon");
    slice.takeBoon(slice.boonChoices[0].id);
    expect(slice.run.wave).toBe(11);
    expect(["wilds", "market", "marsh"]).toContain(slice.run.realmId);
    expect(slice.beginWave().realmId).not.toBe("town_ruins");
  });

  it("marks victory after clearing wave 200", () => {
    const slice = new ClassicSlice({ seed: "slice-end", starterId: "tao_geng" });
    slice.run.wave = 200;
    const finale = slice.beginWave();
    expect(finale.finale).toBe(true);
    slice.noteWin();
    expect(slice.phase).toBe("victory");
  });

  it("marks defeat on a loss and keeps the starter in the codex", () => {
    const slice = new ClassicSlice({ seed: "slice-lose", starterId: "zao_li" });
    slice.beginWave();
    slice.noteLoss();
    expect(slice.phase).toBe("defeat");
    expect(slice.account.codex).toContain("zao_li");
  });

  it("adds a caught spirit to the party until six", () => {
    const slice = new ClassicSlice({ seed: "slice-party-cap", starterId: "zao_li" });
    slice.run.partyIds = ["zao_li", "jing_zhu", "tao_geng", "luan_shi", "dian_zhu"];
    slice.beginWave();
    if (slice.encounter) {
      slice.encounter.foeId = "mo_mao";
    }
    slice.noteWin();
    slice.resolveCatch(true);
    expect(slice.run.partyIds).toEqual([
      "zao_li",
      "jing_zhu",
      "tao_geng",
      "luan_shi",
      "dian_zhu",
      "mo_mao",
    ]);
    slice.beginWave();
    if (slice.encounter) {
      slice.encounter.foeId = "deng_e";
    }
    slice.noteWin();
    slice.resolveCatch(true);
    expect(slice.run.partyIds).toHaveLength(6);
    expect(slice.run.partyIds).not.toContain("deng_e");
  });

  it("writes a catch into the codex", () => {
    const slice = new ClassicSlice({ seed: "slice-catch", starterId: "zao_li" });
    slice.beginWave();
    const foeId = slice.encounter?.foeId;
    expect(foeId).toBeTruthy();
    slice.noteWin();
    slice.resolveCatch(true);
    expect(slice.account.codex).toContain(foeId);
    expect(slice.phase).toBe("boon");
  });
});

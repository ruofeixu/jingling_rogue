import { describe, expect, it } from "vitest";
import { getArt } from "../tables/load-tables.ts";
import { boonKindLabel, formatArtHint, formatArtPlay, formatBattleNudge, formatBoonHint, formatBoonTaken, formatCodexEntry, formatCodexLog, formatCodexSheet, formatFooter, formatMiss, formatNextHint, formatRunHarvest, formatRunSummary, formatSealResult, formatSpentArt, GLOSSARY, CODEX_PAGE_SIZE, listCodexSpirits } from "./copy.ts";
import { PORTRAIT_IDS } from "../assets/manifest.ts";
import { loadTables } from "../tables/load-tables.ts";

describe("boon kind labels", () => {
  it("names every kind in the table without falling back to the raw id", () => {
    const kinds = [...new Set(loadTables().boons.map((row) => row.kind))];
    expect(kinds.length).toBeGreaterThan(20);
    for (const kind of kinds) {
      const label = boonKindLabel(kind);
      expect([kind, label]).not.toEqual([kind, kind]);
      expect([kind, label]).not.toEqual([kind, "增益"]);
      expect(label.length).toBeLessThanOrEqual(2);
    }
  });
});

describe("battle and glossary copy", () => {
  it("summarizes art effects for slips and play log", () => {
    const art = getArt("cinder_claw");
    expect(formatArtHint(art.effects, art.power)).toBe("伤40");
    expect(formatArtPlay("灶狸", art)).toBe("灶狸 使出 灶爪。炎 · 伤40");
    expect(formatArtPlay("灶狸", null)).toContain("竭力一击");
  });

  it("explains lobby terms", () => {
    const terms = GLOSSARY.map((row) => row.term);
    expect(terms).toEqual(expect.arrayContaining(["精怪", "契录", "术法", "灵力", "镇物", "机缘", "契印", "卵房"]));
    expect(GLOSSARY.find((row) => row.term === "契录")?.body).toMatch(/名册/);
  });

  it("explains shop boons", () => {
    expect(formatBoonHint("atk", 4)).toBe("本局全队攻+4");
    expect(formatBoonHint("catch", 0.08)).toBe("收契率+8%");
    expect(formatBoonTaken("铁爪", "本局全队攻+4")).toBe("带走铁爪。本局全队攻+4");
  });

  it("lists gold, party, and taken boons in the run summary", () => {
    expect(
      formatRunSummary({
        gold: 1000,
        potions: 2,
        seals: [5, 0, 0, 0, 0],
        partyIds: ["zao_li"],
        boonIds: ["iron_claw"],
      }),
    ).toContain("金 1000");
    expect(
      formatRunSummary({
        gold: 1000,
        potions: 2,
        seals: [5, 0, 0, 0, 0],
        partyIds: ["zao_li"],
        boonIds: ["iron_claw"],
      }),
    ).toMatch(/铁爪/);
  });

  it("formats seal throw feedback", () => {
    expect(formatSealResult("井蛛", true, 0.42)).toBe("井蛛 收契成功（42%）");
    expect(formatSealResult("井蛛", false, 0.08)).toBe("井蛛 挣脱了（8%）");
  });

  it("tells the next tap and names illegal taps", () => {
    expect(formatNextHint("command")).toMatch(/点「术」/);
    expect(formatNextHint("arts")).toMatch(/返回/);
    expect(formatNextHint("catch")).toMatch(/镇物/);
    expect(formatNextHint("target")).toMatch(/点/);
    expect(formatNextHint("map")).toMatch(/境/);
    expect(formatMiss()).toMatch(/空/);
    expect(formatMiss("command")).toMatch(/术/);
    expect(formatMiss("switch")).toMatch(/名字/);
    expect(formatMiss("arts")).toMatch(/术签/);
    expect(formatSpentArt("灶爪")).toMatch(/灵力已尽/);
    expect(formatFooter("eggs", "孵卵处。卵 0")).toBe("点机开卵，或兑孵券。");
    expect(formatFooter("glossary", "精怪：隙中的生灵。")).toMatch(/词条/);
    expect(formatFooter("battle", "井蛛 出现了。")).toBe("井蛛 出现了。");
  });

  it("nudges switch or bag from visible battle info", () => {
    expect(
      formatBattleNudge({
        foeAffinities: ["tide"],
        activeArts: ["flame"],
        benchArts: [["wood"]],
        hpRatio: 1,
        potions: 0,
      }),
    ).toMatch(/换人/);
    expect(
      formatBattleNudge({
        foeAffinities: ["wood"],
        activeArts: ["flame"],
        benchArts: [],
        hpRatio: 0.4,
        potions: 1,
      }),
    ).toMatch(/囊/);
    expect(
      formatBattleNudge({
        foeAffinities: ["wood"],
        activeArts: ["flame"],
        benchArts: [],
        hpRatio: 1,
        potions: 1,
      }),
    ).toBe("");
  });

  it("lists stats, pact, and realm on a codex card", () => {
    const sheet = formatCodexSheet("zao_li");
    expect(sheet.headline).toMatch(/灶狸/);
    expect(sheet.headline).toMatch(/炎/);
    expect(sheet.stats).toMatch(/体36/);
    expect(sheet.stats).toMatch(/攻20/);
    expect(sheet.stats).toMatch(/守14/);
    expect(sheet.stats).toMatch(/迅18/);
    expect(sheet.pact).toMatch(/守灶/);
    expect(sheet.pact).toMatch(/炎伤微增/);
    expect(sheet.evo).toMatch(/丹狸/);
    expect(formatCodexEntry("zao_li")).toMatch(/魂契/);
    expect(formatCodexLog("zao_li", "folk")).toMatch(/立绘·年画/);
    expect(formatCodexLog("zao_li", "cartoon")).toMatch(/立绘·卡通/);
    expect(formatCodexLog("zhen_yue")).toMatch(/魂契/);
    expect(formatCodexLog("zhen_yue")).not.toMatch(/立绘/);
    expect(formatCodexLog("zhen_yue", "folk")).not.toMatch(/立绘/);
  });

  it("pages the 契录 sixteen at a time with portraits first", () => {
    expect(CODEX_PAGE_SIZE).toBe(16);
    const rows = listCodexSpirits();
    expect(rows.length).toBeGreaterThan(16);
    expect(rows.slice(0, 27).every((row) => PORTRAIT_IDS.has(row.id))).toBe(true);
    expect(rows.slice(27).some((row) => PORTRAIT_IDS.has(row.id))).toBe(false);
  });

  it("names seen, caught, and candy on the harvest line", () => {
    expect(formatRunHarvest({ seen: 3, caught: 1, candy: 0 })).toMatch(/见/);
    expect(formatRunHarvest({ seen: 3, caught: 1, candy: 0 })).toMatch(/收/);
    expect(formatRunHarvest({ seen: 3, caught: 1, candy: 0 })).not.toMatch(/灵糖/);
    expect(formatRunHarvest({ seen: 3, caught: 1, candy: 10 })).toMatch(/灵糖/);
  });
});

import { describe, expect, it } from "vitest";
import { ClassicSlice } from "./classic-slice.ts";
import {
  encounterLevel,
  firstGymWave,
  gymWaves,
  levelCap,
  foeEncounterLevel,
  earlyAffinityClamp,
  neighborIds,
  pickNextRealm,
  describeWave,
  rivalRoster,
  rivalFightIndex,
  isApexRivalWave,
} from "./classic-schedule.ts";
import { forcedTiers, openShop } from "../shop/shop.ts";
import { nextEncounter, createRun } from "./run-session.ts";
import { getSpirit } from "../tables/load-tables.ts";

describe("classic schedule", () => {
  it("caps level at 10 on wave 10 and follows the full gate table", () => {
    expect(levelCap(1)).toBe(10);
    expect(levelCap(10)).toBe(10);
    expect(levelCap(11)).toBe(16);
    expect(levelCap(200)).toBe(200);
    expect(encounterLevel(10)).toBeLessThanOrEqual(10);
    expect(foeEncounterLevel(1)).toBe(1);
    expect(foeEncounterLevel(11)).toBe(encounterLevel(11) - 3);
    expect(foeEncounterLevel(21)).toBe(encounterLevel(21) + 9);
    expect(foeEncounterLevel(181)).toBe(Math.max(1, encounterLevel(181) - 12));
    expect(earlyAffinityClamp(1)).toEqual({ min: 0.9, max: 1.1 });
    expect(earlyAffinityClamp(11)).toEqual({ min: 0.8, max: 1.25 });
    expect(earlyAffinityClamp(21)).toBeUndefined();
    expect(describeWave(10, "any").shields).toBe(0);
    expect(describeWave(40, "any").shields).toBe(1);
    expect(describeWave(250, "any")).toMatchObject({ kind: "legend", boss: true });
    expect(describeWave(1000, "any")).toMatchObject({ kind: "legend", boss: true });
  });

  it("puts a rival on wave 8", () => {
    expect(describeWave(8, "any").kind).toBe("rival");
    const run = createRun({ seed: "rival-8", starterId: "zao_li" });
    run.wave = 8;
    expect(nextEncounter(run).kind).toBe("rival");
  });

  it("grows the rival party each fight and sanctifies the last", () => {
    const bst = (id: string) => {
      const row = getSpirit(id);
      return row.baseHp + row.baseAtk + row.baseDef + row.baseSpd;
    };
    for (let fight = 0; fight < 6; fight++) {
      const roster = rivalRoster(fight, "rival-line");
      expect(roster.partyIds).toHaveLength(fight + 1);
      expect(rivalFightIndex([8, 25, 55, 95, 145, 195][fight])).toBe(fight);
    }
    expect(getSpirit(rivalRoster(0, "rival-line").partyIds[0]).evolveTo).toBeTruthy();
    expect(rivalRoster(1, "rival-line").partyIds.some((id) => /yan|que|hui|lun/.test(id))).toBe(true);
    expect(getSpirit(rivalRoster(2, "rival-line").partyIds[2]).evolveTo).toBeUndefined();
    const fourth = rivalRoster(3, "rival-line").partyIds.filter((id) => bst(id) >= 160);
    expect(fourth.length).toBeGreaterThanOrEqual(2);
    expect(rivalRoster(5, "rival-line").sanctify).toBe(true);
    expect(rivalRoster(5, "rival-line").partyIds.some((id) => getSpirit(id).name.includes("蛟"))).toBe(true);
    expect(rivalRoster(3, "rival-line").sanctify).toBe(false);
    const late = createRun({ seed: "rival-195", starterId: "zao_li" });
    late.wave = 195;
    const encounter = nextEncounter(late);
    expect(encounter.foeIds).toHaveLength(6);
    expect(encounter.sanctify).toBe(true);
    expect(isApexRivalWave(95)).toBe(true);
  });

  it("splits the first gym 50/50 between wave 20 and 30", () => {
    const seen = new Set<20 | 30>();
    for (let i = 0; i < 40; i++) {
      seen.add(firstGymWave(`gym-${i}`));
    }
    expect(seen.has(20)).toBe(true);
    expect(seen.has(30)).toBe(true);
    expect(gymWaves("gym-0")[0]).toBe(firstGymWave("gym-0"));
    expect(gymWaves("gym-0").every((wave) => (wave - firstGymWave("gym-0")) % 30 === 0)).toBe(true);
  });

  it("gives a lock capsule with 2 奇 and 4 特 on wave 165", () => {
    expect(forcedTiers(165)).toEqual(["qi", "qi", "te", "te", "te", "te"]);
    const shop = openShop({ wave: 165, seed: "lock-165", gold: 8000 });
    expect(shop.lock).toBe(true);
    expect(shop.offers).toHaveLength(6);
    expect(shop.offers.filter((row) => row.tier === "qi")).toHaveLength(2);
    expect(shop.offers.filter((row) => row.tier === "te")).toHaveLength(4);
  });

  it("starts in 镇墟 and offers only 野原 / 坊市 / 河泽", () => {
    expect(neighborIds("town_ruins").sort()).toEqual(["market", "marsh", "wilds"]);
    const realm = pickNextRealm({
      realmId: "town_ruins",
      seed: "map-1",
      wave: 10,
      hasMap: false,
    });
    expect(["wilds", "market", "marsh"]).toContain(realm);
  });
});

describe("ClassicSlice 200", () => {
  it("marks victory after clearing wave 200 and can skip waves", () => {
    const slice = new ClassicSlice({ seed: "slice-end", starterId: "tao_geng" });
    slice.skipToWave(200);
    expect(slice.run.wave).toBe(200);
    expect(slice.encounter?.finale).toBe(true);
    expect(slice.encounter?.kind).toBe("legend");
    slice.noteWin();
    expect(slice.phase).toBe("victory");
  });

  it("picks a town neighbor after wave 10", () => {
    const slice = new ClassicSlice({ seed: "slice-boss", starterId: "jing_zhu" });
    slice.run.wave = 10;
    slice.beginWave();
    slice.noteWin();
    slice.takeBoon(slice.boonChoices[0].id);
    expect(slice.run.wave).toBe(11);
    expect(["wilds", "market", "marsh"]).toContain(slice.run.realmId);
    expect(slice.phase).toBe("battle");
  });
});

import { describe, expect, it } from "vitest";
import { moveCharm } from "./move-charm.ts";
import { createRun } from "./run-session.ts";

describe("move charm", () => {
  it("moves a meal charm between party members", () => {
    const run = createRun({ seed: "charm-1", starterId: "zao_li" });
    run.partyIds = ["zao_li", "jing_zhu"];
    run.partyCharms = [["meal"], []];
    moveCharm(run, 0, 1, "meal");
    expect(run.partyCharms).toEqual([[], ["meal"]]);
  });

  it("refuses to move bone dose", () => {
    const run = createRun({ seed: "charm-2", starterId: "zao_li" });
    run.partyIds = ["zao_li", "jing_zhu"];
    run.partyCharms = [["bone_dose"], []];
    expect(() => moveCharm(run, 0, 1, "bone_dose")).toThrow(/bone/);
    expect(run.partyCharms).toEqual([["bone_dose"], []]);
  });
});

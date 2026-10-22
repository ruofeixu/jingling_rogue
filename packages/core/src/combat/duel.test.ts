import { describe, expect, it } from "vitest";
import { startDuel } from "./duel.ts";
import { loadTables } from "../tables/load-tables.ts";

describe("1v1 duel", () => {
  it("starts an encounter and waits for a command", () => {
    const events: string[] = [];
    const duel = startDuel({
      playerId: "zao_li",
      foeId: "jing_zhu",
      level: 5,
      seed: "duel-start",
      onEvent: (event) => events.push(event.type),
    });
    expect(events).toContain("encounterStart");
    expect(duel.waitingFor).toBe("command");
    expect(duel.player.hp).toBe(duel.player.maxHp);
    expect(duel.foe.id).toBe("jing_zhu");
  });

  it("deals damage with a flame art against a wood-leaning foe and can faint", () => {
    const duel = startDuel({
      playerId: "zao_li",
      foeId: "tao_geng",
      level: 20,
      seed: "duel-damage",
      playerAtkOverride: 80,
      foeDefOverride: 10,
      foeHpOverride: 12,
    });
    const hpBefore = duel.foe.hp;
    duel.chooseArt("cinder_claw");
    expect(duel.foe.hp).toBeLessThan(hpBefore);
    expect(duel.waitingFor === "command" || duel.waitingFor === "over").toBe(true);
  });

  it("loads the three starter spirits from tables", () => {
    const tables = loadTables();
    expect(tables.spirits.map((s) => s.id)).toEqual(
      expect.arrayContaining(["jing_zhu", "tao_geng", "zao_li"]),
    );
    expect(tables.arts.length).toBeGreaterThanOrEqual(8);
  });
});

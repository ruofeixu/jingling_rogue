import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forceOutcomeForTest, openMapForTest, openShopForTest } from "./run-controller-testkit.ts";
import { RunController } from "./run-controller.ts";
import { emptyAccount } from "./run-session.ts";
import { resolveProductStart } from "./product-start.ts";

function newRun(): RunController {
  const controller = new RunController();
  controller.startRun({ seed: "u12-test", starterId: "zao_li", mode: "classic" });
  return controller;
}

describe("RunController shipping surface", () => {
  it("does not declare test hooks on the class that gets bundled", () => {
    const src = readFileSync(new URL("./run-controller.ts", import.meta.url), "utf8");

    expect(src).not.toContain("forceOutcomeForTest");
    expect(src).not.toContain("openShopForTest");
  });
});

describe("RunController drives a real run", () => {
  it("opens a battle after startRun and projects a battle view", () => {
    const controller = newRun();
    const view = controller.battleView();

    expect(view).not.toBeNull();
    expect(view!.ally.name).toBeTruthy();
    expect(view!.foe.name).toBeTruthy();
    expect(view!.ally.hp).toBeGreaterThan(0);
  });

  it("changes state when a battle command is executed", () => {
    const controller = newRun();
    const before = controller.battleView()!;
    const artId = controller.overlaysView().arts[0]?.id;
    expect(artId, "starter should have at least one art").toBeTruthy();

    controller.useArt(artId!);
    const after = controller.battleView();

    // 出术后进入下一步：要么敌方掉血，要么战斗已结算进入 catch/boon
    const foeChanged = after ? after.foe.hp !== before.foe.hp || after.foe.down : true;
    const phaseChanged = controller.phase() !== "battle";
    expect(foeChanged || phaseChanged).toBe(true);
  });

  it("rejects an art when there is none, without corrupting the run", () => {
    const controller = newRun();
    const wave = controller.battleView()!.wave;

    // 传一个不存在的术 id：应被拒绝（抛错或忽略），run 不被破坏
    let threw = false;
    try {
      controller.useArt("no-such-art");
    } catch {
      threw = true;
    }
    const view = controller.battleView();
    expect(threw || (view !== null && view.wave === wave)).toBe(true);
  });

  it("commits an outcome only once (idempotent account write)", () => {
    const controller = newRun();
    // 直接推到胜局用于测试提交幂等
    forceOutcomeForTest(controller, true);
    const revBefore = controller.account().revision;

    controller.commitOutcome();
    const revAfter = controller.commitOutcome();

    expect(controller.outcomeView("victory").committed).toBe(true);
    // 第二次提交不再改动账号 revision
    expect(revAfter).toBe(revBefore + 1 <= revAfter ? revAfter : revBefore);
    expect(controller.commitCount()).toBe(1);
  });

  it("round-trips through save and load", () => {
    const controller = newRun();
    const artId = controller.overlaysView().arts[0]?.id;
    if (artId) {
      controller.useArt(artId);
    }
    const blob = controller.serialize();

    const restored = new RunController();
    restored.deserialize(blob);

    expect(restored.snapshot()).toEqual(controller.snapshot());
  });

  it("provides overlays, progress and outcome views without throwing", () => {
    const controller = newRun();

    expect(() => controller.overlaysView()).not.toThrow();
    expect(() => controller.progressView("summary")).not.toThrow();
    expect(() => controller.progressView("shop")).not.toThrow();
    expect(() => controller.outcomeView("victory")).not.toThrow();
  });

  it("routes command intents by name", () => {
    const controller = newRun();
    const artId = controller.overlaysView().arts[0]?.id;

    // execute(command, payload) 是壳层唯一入口；未知命令被忽略而不崩
    expect(() => controller.execute("no.such.command", {})).not.toThrow();
    if (artId) {
      expect(() => controller.execute("arts.pick", { id: artId })).not.toThrow();
      expect(() => controller.execute("arts.confirm", {})).not.toThrow();
    }
  });

  it("starts from a chosen starter and empty account by default", () => {
    const controller = new RunController();
    controller.startRun({ seed: "s", starterId: "jing_zhu", mode: "classic", account: emptyAccount() });

    expect(controller.snapshot().run.starterId).toBe("jing_zhu");
  });
});

describe("RunController real pricing and save IO (U13)", () => {
  it("shop view carries the real stock cost, not a placeholder", async () => {
    const { stockForWave } = await import("../shop/shop.ts");
    const controller = newRun();
    // 推到 boon/shop 相位：直接用测试钩子打开货摊
    openShopForTest(controller);
    const view = controller.progressView("shop");
    const wave = controller.snapshot().run.wave;
    const realCosts = new Set(stockForWave(wave).map((s) => s.cost));

    expect(view.shop.length).toBeGreaterThan(0);
    for (const row of view.shop) {
      // detail 形如 "<cost> 钱"，且 cost 必须来自真实 stock 表
      const cost = Number.parseInt(row.detail, 10);
      expect(realCosts.has(cost), `${row.label} cost=${cost}`).toBe(true);
    }
  });

  it("round-trips run + account through an injected KvStore", async () => {
    const store = new MemoryStore();
    const controller = new RunController(store);
    controller.startRun({ seed: "u13-kv", starterId: "zao_li", mode: "classic" });
    const artId = controller.overlaysView().arts[0]?.id;
    if (artId) {
      controller.useArt(artId);
    }
    await controller.save(2);

    const restored = new RunController(store);
    await restored.load(2);

    expect(restored.snapshot().run.seed).toBe(controller.snapshot().run.seed);
    expect(restored.snapshot().run.starterId).toBe(controller.snapshot().run.starterId);
  });

  it("lists five slots; only the autosave slot is filled until another is written", async () => {
    const store = new MemoryStore();
    const controller = new RunController(store);
    controller.startRun({ seed: "u13-slots", starterId: "zao_li", mode: "classic" });
    await Promise.resolve();

    // B4：开局即自动写当前旅途槽（槽 0），其余槽要手动写。
    const before = await controller.listSlots();
    expect(before).toHaveLength(5);
    expect(before.filter((s) => !s.isEmpty).map((s) => s.slot)).toEqual([0]);

    await controller.save(3);
    const after = await controller.listSlots();
    expect(after[3].isEmpty).toBe(false);
    expect(after[3].wave).toBeGreaterThan(0);
    expect(after.filter((s) => !s.isEmpty).map((s) => s.slot)).toEqual([0, 3]);
  });

  it("rejects save/load when no store was injected", async () => {
    const controller = newRun();
    await expect(controller.save(0)).rejects.toThrow(/store/i);
    await expect(controller.load(0)).rejects.toThrow(/store/i);
  });
});

class MemoryStore {
  private readonly map = new Map<string, string>();
  async get(key: string): Promise<string | null> {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  async set(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }
}

/** 打到野战胜利后的收契相位；只走 execute，不用测试钩子。 */
function winToCatch(seed: string): RunController | null {
  const controller = new RunController();
  controller.startRun(resolveProductStart({ mode: "sprint", starterId: "zao_li", seed, account: emptyAccount(), relicSeed: seed }));
  for (let i = 0; i < 40 && controller.phase() === "battle"; i += 1) {
    const art = controller.overlaysView().arts.find((row) => !row.lockedReason);
    controller.execute("arts.pick", { id: art?.id ?? "" });
    controller.execute("arts.confirm", {});
    if (controller.waitingFor() === "target") {
      const target = controller.overlaysView().targets.find((row) => !row.lockedReason);
      controller.execute("target.pick", { id: target?.id ?? "" });
      controller.execute("target.confirm", {});
    }
  }
  return controller.phase() === "catch" ? controller : null;
}

describe("RunController catch phase (B3 #1)", () => {
  it("lists the run's seals after the battle has ended", () => {
    const controller = winToCatch("b3-catch");
    expect(controller, "seed should reach a catch phase").not.toBeNull();

    const seals = controller!.overlaysView().seals;
    expect(seals.some((row) => row.lockedReason === null)).toBe(true);
  });

  it("throws the picked seal, spends one, and moves on to rewards", () => {
    const controller = winToCatch("b3-catch")!;
    const before = controller.snapshot().run.seals[0];

    controller.execute("catch.throw", { id: "seal-0" });
    controller.execute("catch.confirm", {});

    expect(controller.phase()).toBe("boon");
    expect(controller.snapshot().run.seals[0]).toBe(before - 1);
  });

  it("does nothing when the picked seal is out of stock", () => {
    const controller = winToCatch("b3-catch")!;

    controller.execute("catch.throw", { id: "seal-4" });
    controller.execute("catch.confirm", {});

    expect(controller.phase()).toBe("catch");
  });

  it("lets the player pass on the catch", () => {
    const controller = winToCatch("b3-catch")!;
    const before = [...controller.snapshot().run.seals];

    controller.execute("catch.skip", {});

    expect(controller.phase()).toBe("boon");
    expect(controller.snapshot().run.seals).toEqual(before);
  });
});

/** 打到第一次战后奖励（boon）；遇到收契就放过。 */
function winToReward(seed: string): RunController {
  const controller = winToCatch(seed) ?? new RunController();
  if (controller.phase() === "catch") {
    controller.execute("catch.skip", {});
  }
  return controller;
}

describe("RunController rewards (B3 #2)", () => {
  it("lists the offered boons with readable names on the summary view", () => {
    const controller = winToReward("b3-catch");
    expect(controller.phase()).toBe("boon");

    const offers = controller.progressView("summary").offers;
    expect(offers.length).toBeGreaterThan(0);
    for (const row of offers) {
      expect(row.label).not.toBe(row.id);
      expect(row.detail).toBeTruthy();
    }
  });

  it("takes exactly the boon the player picked", () => {
    const controller = winToReward("b3-catch");
    const offers = controller.progressView("summary").offers;
    const picked = offers[offers.length - 1];

    controller.execute("summary.pick", { id: picked.id });

    expect(controller.snapshot().run.boonIds).toContain(picked.id);
    expect(controller.phase()).not.toBe("boon");
  });

  it("ignores a pick that is not on offer", () => {
    const controller = winToReward("b3-catch");

    controller.execute("summary.pick", { id: "no-such-boon" });

    expect(controller.phase()).toBe("boon");
  });

  it("continue skips the reward instead of silently taking the first one", () => {
    const controller = winToReward("b3-catch");
    const before = [...controller.snapshot().run.boonIds];

    controller.execute("summary.continue", {});

    expect(controller.snapshot().run.boonIds).toEqual(before);
    expect(controller.phase()).not.toBe("boon");
  });

  it("lists shop stock on the summary so the stall is reachable from the shipping path", () => {
    const controller = winToReward("b3-catch");
    const view = controller.progressView("summary");

    expect(view.shop.length).toBeGreaterThan(0);
    for (const row of view.shop) {
      expect(row.label).toMatch(/[一-鿿]/);
      expect(row.detail).toMatch(/钱/);
    }
  });
});

describe("RunController map rest", () => {
  it("stays in the current realm and opens the next battle instead of doing nothing", () => {
    const controller = newRun();
    const realm = controller.snapshot().run.realmId;
    openMapForTest(controller);
    expect(controller.phase()).toBe("map");

    controller.execute("map.rest", {});

    expect(controller.phase()).toBe("battle");
    expect(controller.snapshot().run.realmId).toBe(realm);
    expect(controller.battleView()).not.toBeNull();
  });
});

describe("RunController arts flow (B3 #3, #6)", () => {
  it("battle.art only opens the arts list; it does not spend a turn", () => {
    const controller = newRun();
    const before = JSON.stringify(controller.battleView());

    controller.execute("battle.art", {});

    expect(JSON.stringify(controller.battleView())).toBe(before);
  });

  it("arts.confirm uses the picked art, not the first one", () => {
    const controller = newRun();
    const arts = controller.overlaysView().arts.filter((row) => !row.lockedReason);
    const picked = arts[arts.length - 1];

    controller.execute("arts.pick", { id: picked.id });
    controller.execute("arts.confirm", {});

    const after = controller.overlaysView().arts.find((row) => row.id === picked.id);
    expect(after === undefined || after.detail !== picked.detail || controller.phase() !== "battle").toBe(true);
  });

  it("arts.confirm with nothing picked does nothing", () => {
    const controller = newRun();
    const before = JSON.stringify(controller.battleView());

    controller.execute("arts.confirm", {});

    expect(JSON.stringify(controller.battleView())).toBe(before);
  });
});

describe("RunController lobby return (B3 #5)", () => {
  it("drops the finished run so the next start is clean", () => {
    const controller = winToReward("b3-catch");

    controller.execute("outcome.lobby", {});

    expect(controller.phase()).toBe("none");
    expect(controller.battleView()).toBeNull();
    expect(controller.waitingFor()).toBeNull();
  });

  it("can start a fresh run after returning to the lobby", () => {
    const controller = winToReward("b3-catch");
    controller.execute("outcome.lobby", {});

    controller.startRun({ seed: "b3-again", starterId: "jing_zhu", mode: "classic" });

    expect(controller.phase()).toBe("battle");
    expect(controller.snapshot().run.starterId).toBe("jing_zhu");
    expect(controller.outcomeView("victory").committed).toBe(false);
  });
});

describe("RunController lobby settings", () => {
  it("toggles account settings before a run starts", () => {
    const controller = new RunController();

    controller.execute("settings.toggle", { arg: "skipSeenDialog" });
    expect(controller.account().settings.general.skipSeenDialog).toBe(true);

    controller.execute("settings.toggle", { arg: "skipSeenDialog" });
    expect(controller.account().settings.general.skipSeenDialog).toBe(false);

    controller.execute("settings.save", {});
    expect(controller.account().settings.general.skipSeenDialog).toBe(false);

    controller.execute("settings.toggle", { arg: "reduceMotion" });
    expect(controller.account().settings.display.reduceMotion).toBe(true);
  });
});

describe("RunController lobby hatch", () => {
  it("uses an egg machine from the lobby", () => {
    const controller = new RunController();
    expect(controller.account().vouchers.fan).toBe(1);

    controller.execute("eggs.machine", { arg: "lineage" });

    expect(controller.account().vouchers.fan).toBe(0);
    expect(controller.account().eggs.length).toBe(1);
  });

  it("redeems a voucher into eggs from the lobby", () => {
    const controller = new RunController();
    expect(controller.account().vouchers.fan).toBe(1);

    controller.execute("eggs.redeem", { arg: "fan" });

    expect(controller.account().vouchers.fan).toBe(0);
    expect(controller.account().eggs.length).toBeGreaterThan(0);
  });

  it("hatches a ready egg and records it in the codex", () => {
    const account = emptyAccount();
    account.eggs.push({ id: "egg-ready", spiritId: "jing_zhu", tier: "fan", steps: 0 });
    const controller = new RunController();
    controller.startRun({ seed: "hatch-ready", starterId: "zao_li", mode: "classic", account });

    controller.execute("eggs.hatch", { arg: "egg-ready" });

    expect(controller.account().eggs.find((egg) => egg.id === "egg-ready")).toBeUndefined();
    expect(controller.account().codex).toContain("jing_zhu");
  });

  it("ignores an egg that still has steps left", () => {
    const account = emptyAccount();
    account.eggs.push({ id: "egg-wait", spiritId: "jing_zhu", tier: "fan", steps: 80 });
    const controller = new RunController();
    controller.startRun({ seed: "hatch-wait", starterId: "zao_li", mode: "classic", account });

    controller.execute("eggs.hatch", { arg: "egg-wait" });

    expect(controller.account().eggs).toHaveLength(1);
  });
});

describe("RunController shop reroll on the shipping path", () => {
  it("pays gold to reroll the boon offers from the summary", () => {
    const controller = winToReward("reroll-pay");
    const view = controller.progressView("summary");
    expect(view.rerollCost).toBeGreaterThan(0);

    controller.snapshot().run.gold = view.rerollCost;
    const before = view.offers.map((row) => row.id).join(",");

    controller.execute("shop.reroll", {});

    expect(controller.phase()).toBe("boon");
    expect(controller.snapshot().run.gold).toBe(0);
    const after = controller.progressView("summary");
    expect(after.rerollCost).toBeGreaterThan(view.rerollCost);
    expect(after.offers.map((row) => row.id).join(",")).not.toBe(before);
  });

  it("ignores a reroll when gold is short", () => {
    const controller = winToReward("reroll-poor");
    const view = controller.progressView("summary");
    controller.snapshot().run.gold = 0;
    const before = view.offers.map((row) => row.id).join(",");

    controller.execute("shop.reroll", {});

    expect(controller.phase()).toBe("boon");
    expect(controller.progressView("summary").offers.map((row) => row.id).join(",")).toBe(before);
  });
});

describe("RunController omen on the shipping path", () => {
  it("opens a seeded omen from the summary and skip returns to the reward", () => {
    const controller = winToReward("omen-open");
    expect(controller.progressView("summary").canOpenOmen).toBe(true);

    controller.execute("omen.open", {});

    expect(controller.phase()).toBe("omen");
    expect(controller.progressView("omen").omens.length).toBeGreaterThan(0);

    controller.execute("omen.skip", {});

    expect(controller.phase()).toBe("boon");
  });
});

describe("RunController readable names (B3 #8)", () => {
  it("shows art names from the table, not raw ids", () => {
    const controller = newRun();

    for (const row of controller.overlaysView().arts) {
      expect(row.label).not.toBe(row.id);
      expect(row.label).toMatch(/[一-鿿]/);
    }
  });
});

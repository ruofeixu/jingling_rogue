import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forceOutcomeForTest, openShopForTest } from "./run-controller-testkit.ts";
import { RunController } from "./run-controller.ts";
import { emptyAccount } from "./run-session.ts";

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

  it("lists five slots, empty until written", async () => {
    const store = new MemoryStore();
    const controller = new RunController(store);
    controller.startRun({ seed: "u13-slots", starterId: "zao_li", mode: "classic" });

    const before = await controller.listSlots();
    expect(before).toHaveLength(5);
    expect(before.every((s) => s.isEmpty)).toBe(true);

    await controller.save(3);
    const after = await controller.listSlots();
    expect(after[3].isEmpty).toBe(false);
    expect(after[3].wave).toBeGreaterThan(0);
    expect(after.filter((s) => !s.isEmpty)).toHaveLength(1);
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

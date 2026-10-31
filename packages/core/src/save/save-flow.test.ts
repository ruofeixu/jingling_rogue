import { describe, expect, it } from "vitest";
import { createRun, emptyAccount } from "../run/run-session.ts";
import { RunController } from "../run/run-controller.ts";
import { resolveProductStart } from "../run/product-start.ts";
import { encodeRun } from "./codec.ts";
import {
  inspectRunLocal,
  loadAccountLocal,
  loadRunLocal,
  type KvStore,
} from "./local-store.ts";

function memStore(seed: Record<string, string> = {}): KvStore & { mem: Map<string, string> } {
  const mem = new Map(Object.entries(seed));
  return {
    mem,
    get: async (key) => mem.get(key) ?? null,
    set: async (key, value) => {
      mem.set(key, value);
    },
  };
}

describe("corrupt saves do not crash (B4 Task 1)", () => {
  it("treats an unreadable run slot as empty", async () => {
    const store = memStore({ "run:0": "{not json", "run:1": JSON.stringify({ v: 9 }) });

    expect(await loadRunLocal(store, 0)).toBeNull();
    expect(await loadRunLocal(store, 1)).toBeNull();
  });

  it("reports why a slot is unusable", async () => {
    const run = createRun({ seed: "ok", starterId: "zao_li" });
    const store = memStore({ "run:0": encodeRun(run), "run:1": "{not json" });

    expect((await inspectRunLocal(store, 0)).state).toBe("ok");
    expect((await inspectRunLocal(store, 1)).state).toBe("corrupt");
    expect((await inspectRunLocal(store, 2)).state).toBe("empty");
  });

  it("backs up an unreadable account before falling back, so nothing is lost", async () => {
    const store = memStore({ account: "{broken account" });

    expect(await loadAccountLocal(store)).toBeNull();
    expect(store.mem.get("account.corrupt")).toBe("{broken account");
  });
});

/** 只用玩家会点的命令推进：出第一招可用的术、遇目标选第一个、收契放过、机缘领第一项。 */
function step(controller: RunController): void {
  const phase = controller.phase();
  if (phase === "battle") {
    if (controller.waitingFor() === "target") {
      const target = controller.overlaysView().targets.find((row) => !row.lockedReason);
      controller.execute("target.confirm", { id: target?.id ?? "" });
      return;
    }
    if (controller.waitingFor() === "switch") {
      const next = controller.overlaysView().switchTargets.find((row) => !row.lockedReason);
      controller.execute("switch.confirm", { id: next?.id ?? "" });
      return;
    }
    const art = controller.overlaysView().arts.find((row) => !row.lockedReason);
    controller.execute("arts.confirm", { id: art?.id ?? "" });
    return;
  }
  if (phase === "catch") {
    controller.execute("catch.skip", {});
    return;
  }
  if (phase === "boon") {
    const offer = controller.progressView("summary").offers[0];
    controller.execute(offer ? "summary.pick" : "summary.continue", offer ? { id: offer.id } : {});
    return;
  }
  if (phase === "map") {
    const node = controller.progressView("map").nodes[0];
    controller.execute("map.enter", { id: node?.id ?? "" });
  }
}

/** 等后台存档写完（persist 是 fire-and-forget）。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
}

function startSprint(controller: RunController, seed: string): void {
  controller.startRun(
    resolveProductStart({ mode: "sprint", starterId: "zao_li", seed, account: controller.account(), relicSeed: seed }),
  );
}

function advanceWave(controller: RunController): void {
  const wave = controller.snapshot().run.wave;
  for (let i = 0; i < 80 && controller.snapshot().run.wave === wave && controller.phase() !== "defeat"; i += 1) {
    step(controller);
  }
  for (let i = 0; i < 80 && controller.phase() !== "battle" && controller.phase() !== "defeat" && controller.phase() !== "victory"; i += 1) {
    step(controller);
  }
}

function playToEnd(controller: RunController): void {
  for (let i = 0; i < 3000 && controller.phase() !== "victory" && controller.phase() !== "defeat"; i += 1) {
    step(controller);
  }
}

describe("the shipping controller saves on its own (B4 Task 2)", () => {
  it("writes slot 0 as soon as a run starts", async () => {
    const store = memStore();
    const controller = new RunController(store);

    startSprint(controller, "b4-save");
    await settle();

    expect((await inspectRunLocal(store, 0)).state).toBe("ok");
  });

  it("moves the saved wave forward after each cleared wave", async () => {
    const store = memStore();
    const controller = new RunController(store);
    startSprint(controller, "b4-save");
    await settle();
    const first = (await loadRunLocal(store, 0))!.wave;

    advanceWave(controller);
    await settle();

    expect((await loadRunLocal(store, 0))!.wave).toBeGreaterThan(first);
  });

  it("stores the account and clears the slot when the outcome is committed", async () => {
    const store = memStore();
    const controller = new RunController(store);
    startSprint(controller, "b4-save");
    playToEnd(controller);

    controller.execute("outcome.commit", {});
    await settle();

    expect(await loadAccountLocal(store)).not.toBeNull();
    expect((await inspectRunLocal(store, 0)).state).toBe("empty");
  });

  it("keeps working when the store throws", async () => {
    const broken: KvStore = {
      get: async () => null,
      set: async () => {
        throw new Error("storage full");
      },
    };
    const controller = new RunController(broken);

    startSprint(controller, "b4-save");
    advanceWave(controller);
    await settle();

    expect(controller.phase()).not.toBe("none");
  });
});

describe("boot, slot list and resume (B4 Task 3)", () => {
  it("boot() brings the stored account back", async () => {
    const store = memStore();
    const first = new RunController(store);
    startSprint(first, "b4-boot");
    playToEnd(first);
    first.execute("outcome.commit", {});
    await settle();
    const codex = first.account().codex;

    const second = new RunController(store);
    await second.boot();

    expect(second.account().codex).toEqual(codex);
    expect(second.account().codex.length).toBeGreaterThan(0);
  });

  it("boot() with a broken account starts clean and keeps the original text", async () => {
    const store = memStore({ account: "{broken" });
    const controller = new RunController(store);

    await controller.boot();

    expect(controller.account()).toEqual(emptyAccount());
    expect(store.mem.get("account.corrupt")).toBe("{broken");
  });

  it("marks a broken slot instead of hiding or crashing", async () => {
    const store = memStore({ "run:2": "{not json" });
    const controller = new RunController(store);

    const slots = await controller.listSlots();

    expect(slots[2]).toMatchObject({ slot: 2, isEmpty: true, corrupt: true });
    expect(slots[0]).toMatchObject({ isEmpty: true, corrupt: false });
  });

  it("slots.load resumes the saved run at the start of its wave", async () => {
    const store = memStore();
    const first = new RunController(store);
    startSprint(first, "b4-resume");
    advanceWave(first);
    advanceWave(first);
    await settle();
    const saved = (await loadRunLocal(store, 0))!;

    const second = new RunController(store);
    await second.boot();
    await second.execute("slots.load", { arg: "0" });

    expect(second.phase()).toBe("battle");
    expect(second.snapshot().run.wave).toBe(saved.wave);
    expect(second.battleView()).not.toBeNull();
  });

  it("slots.load on an empty slot leaves the controller idle", async () => {
    const controller = new RunController(memStore());

    await controller.execute("slots.load", { arg: "3" });

    expect(controller.phase()).toBe("none");
  });
});

describe("resume is repeatable (B4 Task 3)", () => {
  it("loading the same slot twice gives the same fight", async () => {
    const store = memStore();
    const first = new RunController(store);
    startSprint(first, "b4-twice");
    advanceWave(first);
    await settle();

    const a = new RunController(store);
    await a.execute("slots.load", { arg: "0" });
    const b = new RunController(store);
    await b.execute("slots.load", { arg: "0" });

    expect(b.battleView()).toEqual(a.battleView());
    expect(b.snapshot().run).toEqual(a.snapshot().run);
  });
});

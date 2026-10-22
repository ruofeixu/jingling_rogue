import { describe, expect, it } from "vitest";
import { createRun } from "../run/run-session.ts";
import { loadRunLocal, saveAccountLocal, saveRunLocal, loadAccountLocal } from "./local-store.ts";
import { recordCatch } from "../run/run-session.ts";

describe("local save", () => {
  it("stores a run in slot 0 and reads it back", async () => {
    const mem = new Map<string, string>();
    const store = {
      get: async (key: string) => mem.get(key) ?? null,
      set: async (key: string, value: string) => {
        mem.set(key, value);
      },
    };
    const run = createRun({ seed: "slot", starterId: "zao_li" });
    run.wave = 7;
    await saveRunLocal(store, 0, run);
    const loaded = await loadRunLocal(store, 0);
    expect(loaded?.wave).toBe(7);
  });

  it("accepts slot 4 and rejects slot 5", async () => {
    const mem = new Map<string, string>();
    const store = {
      get: async (key: string) => mem.get(key) ?? null,
      set: async (key: string, value: string) => {
        mem.set(key, value);
      },
    };
    const run = createRun({ seed: "slot4", starterId: "zao_li" });
    run.wave = 4;
    await saveRunLocal(store, 4, run);
    expect((await loadRunLocal(store, 4))?.wave).toBe(4);
    await expect(saveRunLocal(store, 5, run)).rejects.toThrow(/slot/);
  });

  it("stores account progress", async () => {
    const mem = new Map<string, string>();
    const store = {
      get: async (key: string) => mem.get(key) ?? null,
      set: async (key: string, value: string) => {
        mem.set(key, value);
      },
    };
    const run = createRun({ seed: "acc", starterId: "zao_li" });
    const account = recordCatch(run, "jing_zhu");
    await saveAccountLocal(store, account);
    const loaded = await loadAccountLocal(store);
    expect(loaded?.codex).toContain("jing_zhu");
  });
});

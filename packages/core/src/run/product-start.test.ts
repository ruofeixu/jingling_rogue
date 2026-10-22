import { describe, expect, it } from "vitest";
import { RunController } from "./run-controller.ts";
import { resolveProductStart } from "./product-start.ts";
import { emptyAccount } from "./run-session.ts";

describe("resolveProductStart", () => {
  it("maps a sprint selection onto a classic run that needs a relic", () => {
    const opts = resolveProductStart({
      mode: "sprint",
      starterId: "zao_li",
      seed: "sprint-seed",
      account: emptyAccount(),
      relicSeed: "relic-seed",
    });

    expect(opts.mode).toBe("classic");
    expect(opts.sprint).toBe(true);
    expect(opts.relicId).toBeTruthy();
    expect(opts.starterId).toBe("zao_li");

    const controller = new RunController();
    controller.startRun(opts);
    expect(controller.snapshot().run.sprint).toBe(true);
    expect(controller.phase()).toBe("battle");
  });

  it("keeps a named run mode and defaults a missing starter", () => {
    const opts = resolveProductStart({
      mode: "daily",
      starterId: "",
      seed: "daily-seed",
      account: emptyAccount(),
      relicSeed: "relic-seed",
    });

    expect(opts.mode).toBe("daily");
    expect(opts.sprint).toBe(false);
    expect(opts.starterId).toBe("zao_li");
    expect(opts.relicId).toBeUndefined();
  });
});

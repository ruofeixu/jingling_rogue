import {
  RunController,
  dailySeed,
  emptyAccount,
  resolveProductStart,
  utcDateStamp,
} from "../vendor/jinglingCore";
import type { RunControllerLike } from "./AppShell";

/** 壳层的玩法驱动。AppShell 只拿到这个句柄，不 import RunController。 */
export function createProductDriver(): RunControllerLike {
  const controller = new RunController();
  const account = emptyAccount();
  return {
    execute(command, payload) {
      if (command !== "starter.confirm") {
        controller.execute(command, payload);
        return;
      }
      const requested = payload.mode ?? "classic";
      const seed = requested === "daily" ? dailySeed(utcDateStamp()) : `run-${Date.now()}`;
      controller.startRun(
        resolveProductStart({
          mode: requested,
          starterId: payload.starterId ?? "",
          seed,
          account,
          relicSeed: seed,
        }),
      );
    },
    battleView: () => controller.battleView(),
    overlaysView: () => controller.overlaysView(),
    progressView: (kind) => controller.progressView(kind),
    outcomeView: (kind) => controller.outcomeView(kind),
    phase: () => controller.phase(),
  };
}

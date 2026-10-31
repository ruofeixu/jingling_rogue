import { sys } from "cc";
import {
  RunController,
  dailySeed,
  resolveProductStart,
  utcDateStamp,
  type KvStore,
} from "../vendor/jinglingCore";
import type { RunControllerLike } from "./AppShell";

/**
 * 存储后端：`sys.localStorage`。小游戏里 Cocos 适配层把它映射到 wx/tt 的同步存储 API，
 * 浏览器预览里是网页 localStorage。存储满或被禁用时降级为内存，本次运行仍可玩。
 */
function kvFromLocalStorage(): KvStore {
  const fallback = new Map<string, string>();
  let degraded = false;
  const degrade = (error: unknown) => {
    if (!degraded) {
      degraded = true;
      console.warn("[save] local storage unavailable, keeping saves in memory for this session", error);
    }
  };
  return {
    async get(key) {
      if (!degraded) {
        try {
          return sys.localStorage.getItem(key);
        } catch (error) {
          degrade(error);
        }
      }
      return fallback.get(key) ?? null;
    },
    async set(key, value) {
      fallback.set(key, value);
      if (!degraded) {
        try {
          sys.localStorage.setItem(key, value);
        } catch (error) {
          degrade(error);
        }
      }
    },
  };
}

/** 壳层的玩法驱动。AppShell 只拿到这个句柄，不 import RunController。 */
export function createProductDriver(): { driver: RunControllerLike; ready: Promise<void> } {
  const controller = new RunController(kvFromLocalStorage());
  const driver: RunControllerLike = {
    execute(command, payload) {
      if (command !== "starter.confirm") {
        return controller.execute(command, payload);
      }
      const requested = payload.mode ?? "classic";
      const seed = requested === "daily" ? dailySeed(utcDateStamp()) : `run-${Date.now()}`;
      controller.startRun(
        resolveProductStart({
          mode: requested,
          starterId: payload.starterId ?? "",
          seed,
          // 沿用当前账号（开机读回的，或上一局结束时的），不是空账号。
          account: controller.account(),
          relicSeed: seed,
        }),
      );
    },
    battleView: () => controller.battleView(),
    overlaysView: () => controller.overlaysView(),
    progressView: (kind) => controller.progressView(kind),
    outcomeView: (kind) => controller.outcomeView(kind),
    phase: () => controller.phase(),
    waitingFor: () => controller.waitingFor(),
    account: () => controller.account(),
    slots: async () =>
      (await controller.listSlots())
        .filter((row) => !row.isEmpty || row.corrupt)
        .map((row) => ({ slot: row.slot, wave: row.wave, mode: row.mode, corrupt: row.corrupt })),
  };
  // 开机读账号；失败也照常进标题（空账号）。
  const ready = controller.boot().catch((error) => console.warn("[save] boot failed", error));
  return { driver, ready };
}

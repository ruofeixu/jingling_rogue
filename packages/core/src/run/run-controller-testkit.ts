import type { RunController } from "./run-controller.ts";

/** 测试专用。creator-entry 不引用本文件，打包时不会进发货 bundle。 */
export function forceOutcomeForTest(controller: RunController, won: boolean): void {
  (controller as unknown as { forcedWin: boolean | null }).forcedWin = won;
}

/** 测试专用：把相位拨到货摊，用来核对真实定价。 */
export function openShopForTest(controller: RunController): void {
  const slice = (controller as unknown as { slice: { phase: string } | null }).slice;
  if (!slice) {
    throw new Error("run not started");
  }
  slice.phase = "boon";
}

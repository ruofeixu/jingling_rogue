/**
 * 诊断路由：U1 用来在实际 Cocos 里验证壳层，只显示壳层事实。
 * 不含任何产品文案、玩法数据或美术；U1 的退出门要求它可被机器断言为"无产品内容"。
 */
import { buildScreenModel, type ScreenModel } from "./screen-model.ts";
import type { RendererKind } from "./manifest.ts";
import type { Viewport } from "./viewport.ts";

export const DIAGNOSTICS_SCREEN_ID = "diagnostics";

export interface DiagnosticsInput {
  readonly viewport: Viewport;
  readonly renderer: RendererKind;
  readonly globalLegacyFallback: boolean;
}

export function buildDiagnosticsModel(input: DiagnosticsInput): ScreenModel {
  const { viewport: vp } = input;
  return buildScreenModel({
    screenId: DIAGNOSTICS_SCREEN_ID,
    state: "normal",
    accessibleName: "AppShell diagnostics",
    lines: [
      `orientation: ${vp.orientation}`,
      `design: ${vp.design.width}x${vp.design.height}`,
      `device: ${vp.device.width}x${vp.device.height}`,
      `safe: t${vp.safe.top} b${vp.safe.bottom} l${vp.safe.left} r${vp.safe.right}`,
      `content: ${vp.content.width}x${vp.content.height}`,
      `renderer: ${input.renderer}`,
      `global legacy fallback: ${input.globalLegacyFallback ? "on" : "off"}`,
    ],
  });
}

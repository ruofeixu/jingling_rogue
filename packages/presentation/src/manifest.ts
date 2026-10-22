/**
 * screen manifest：每个产品面在任意时刻只有一个 renderer 所有者。
 * U1 阶段全部为 legacy；逐页切换到 presentation 由 U3 起按页进行。
 */
import { SCREEN_IDS, type ScreenId } from "./screen-model.ts";

export type RendererKind = "legacy" | "presentation";

export interface ScreenEntry {
  readonly renderer: RendererKind;
}

export type ScreenManifest = Readonly<Record<ScreenId, ScreenEntry>>;

export interface SelectOptions {
  /** 全局回退开关：为真时忽略逐页选择，一律走旧呈现。 */
  readonly globalLegacyFallback?: boolean;
}

const RENDERERS: ReadonlySet<string> = new Set<string>(["legacy", "presentation"]);

/** 已迁移到 presentation 的页面。逐页推进：U3 = title/mode；U4 = 八个大厅页。 */
const MIGRATED: ReadonlySet<string> = new Set<string>([
  "title",
  "mode",
  "settings",
  "codex-list",
  "codex-entry",
  "eggs",
  "achievements",
  "stats",
  "slots",
  "glossary",
  "starter",
  "battle",
  "arts",
  "switch",
  "party",
  "bag",
  "target",
  "catch",
  "summary",
  "shop",
  "omen",
  "map",
  "defeat",
  "victory",
  "hatch",
]);

function baseManifest(): ScreenManifest {
  const entries = Array.from(SCREEN_IDS).map(
    (id) =>
      [
        id,
        Object.freeze({ renderer: (MIGRATED.has(id) ? "presentation" : "legacy") as RendererKind }),
      ] as const,
  );
  return Object.freeze(Object.fromEntries(entries)) as ScreenManifest;
}

/** 默认清单：已迁移页走 presentation，其余仍走旧呈现。 */
export const SCREEN_MANIFEST: ScreenManifest = baseManifest();

function assertKnown(screenId: string, manifest: ScreenManifest): asserts screenId is ScreenId {
  if (!Object.prototype.hasOwnProperty.call(manifest, screenId)) {
    throw new Error(`unknown screen: ${screenId}`);
  }
}

export function selectRenderer(
  screenId: string,
  manifest: ScreenManifest = SCREEN_MANIFEST,
  options: SelectOptions = {},
): RendererKind {
  assertKnown(screenId, manifest);
  if (options.globalLegacyFallback) {
    return "legacy";
  }
  return manifest[screenId].renderer;
}

export function isPresentationOwned(
  screenId: string,
  manifest: ScreenManifest = SCREEN_MANIFEST,
  options: SelectOptions = {},
): boolean {
  return selectRenderer(screenId, manifest, options) === "presentation";
}

/** 返回新的 manifest，不就地修改，避免出现两个所有者。 */
export function withRenderer(
  screenId: string,
  renderer: RendererKind,
  manifest: ScreenManifest = SCREEN_MANIFEST,
): ScreenManifest {
  assertKnown(screenId, manifest);
  if (!RENDERERS.has(renderer)) {
    throw new Error(`unsupported renderer: ${String(renderer)}`);
  }
  return Object.freeze({
    ...manifest,
    [screenId]: Object.freeze({ renderer }),
  }) as ScreenManifest;
}

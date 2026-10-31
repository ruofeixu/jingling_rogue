import { loadTables } from "../tables/load-tables.ts";

export function bundleForRealm(realmId: string): string {
  if (realmId === "wilds") {
    return "bundle-realm-wilds";
  }
  if (realmId === "woods") {
    return "bundle-realm-woods";
  }
  return "main";
}

export interface RemoteAsset {
  id: string;
  path: string;
  bundle: string;
}

export interface RemoteManifest {
  version: string;
  baseUrl: string;
  assets: RemoteAsset[];
}

export const FIRST_PORTRAITS = new Set([
  "zao_li",
  "dan_li",
  "jing_zhu",
  "quan_ji",
  "tao_geng",
  "nuo_mian",
  "mo_mao",
  "deng_e",
  "yao_shu",
]);

export const SECOND_PORTRAITS = new Set([
  "huo_de_li",
  "he_bo_cong",
  "she_mu",
  "luan_shi",
  "dian_zhu",
  "ye_ti",
  "tao_quan",
  "zhi_ren",
  "tong_ling",
]);

export const THIRD_PORTRAITS = new Set([
  "zhang_yan",
  "pi_li",
  "lei_ying",
  "shuang_ming",
  "bing_can",
  "jin_hui",
  "ping_yu",
  "he_hun",
  "ming_duo",
]);

export const PORTRAIT_IDS = new Set([
  ...Array.from(FIRST_PORTRAITS),
  ...Array.from(SECOND_PORTRAITS),
  ...Array.from(THIRD_PORTRAITS),
]);

/**
 * 水墨立绘里朝左的那些（其余朝右或正面）。2026-11-01 按头部所在半边自动估出，再看图确认。
 * 战斗里敌方在右上、我方在左下：敌方要朝左、我方要朝右，渲染器据此决定要不要水平翻转。
 */
export const PORTRAIT_FACES_LEFT: ReadonlySet<string> = new Set([
  "bing_can",
  "dan_li",
  "he_hun",
  "jin_hui",
  "mo_mao",
  "quan_ji",
  "shuang_ming",
  "zao_li",
]);

export function portraitFacesLeft(id: string): boolean {
  return PORTRAIT_FACES_LEFT.has(id);
}

/** 立绘走独立 Asset Bundle，构建成小游戏分包，避免 15 MB 图片留在 4 MiB 主包里。 */
export const PORTRAIT_BUNDLE = "portraits";

export function hasPortrait(id: string): boolean {
  return PORTRAIT_IDS.has(id);
}

/** 只有一套立绘（水墨）。年画版 2026-11-01 移出项目，见 docs/superpowers/plans/2026-11-01-I3-ink-portraits.md。 */
export function portraitPath(id: string): string {
  return `spirits/${id}.png`;
}

/** 路径相对于 PORTRAIT_BUNDLE 这个 Asset Bundle 的根目录。 */
export function portraitTexturePath(id: string): string {
  return `spirits/${id}/texture`;
}

export function remoteManifest(baseUrl: string): RemoteManifest {
  const tables = loadTables();
  return {
    version: "0.1.0",
    baseUrl,
    assets: tables.spirits.map((spirit) => ({
      id: spirit.id,
      path: portraitPath(spirit.id),
      bundle: bundleForRealm(spirit.realm),
    })),
  };
}

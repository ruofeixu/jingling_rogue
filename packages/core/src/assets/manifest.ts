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

export const CARTOON_PORTRAIT_IDS = new Set([
  "zao_li",
  "jing_zhu",
  "tao_geng",
  "dan_li",
  "quan_ji",
  "nuo_mian",
  "mo_mao",
  "deng_e",
  "yao_shu",
  "huo_de_li",
  "he_bo_cong",
  "she_mu",
  "luan_shi",
  "dian_zhu",
  "ye_ti",
  "tao_quan",
  "zhi_ren",
  "tong_ling",
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

export type PortraitStyle = "play" | "folk" | "cartoon";

/** 立绘走独立 Asset Bundle，构建成小游戏分包，避免 15 MB 图片留在 4 MiB 主包里。 */
export const PORTRAIT_BUNDLE = "portraits";

export function hasPortrait(id: string): boolean {
  return PORTRAIT_IDS.has(id);
}

export function hasCartoonPortrait(id: string): boolean {
  return CARTOON_PORTRAIT_IDS.has(id);
}

export function portraitPath(id: string, style: PortraitStyle = "play"): string {
  if (style === "folk" && CARTOON_PORTRAIT_IDS.has(id)) {
    return `spirits-folk/${id}.png`;
  }
  return `spirits/${id}.png`;
}

/** 路径相对于 PORTRAIT_BUNDLE 这个 Asset Bundle 的根目录。 */
export function portraitTexturePath(id: string, style: PortraitStyle = "play"): string {
  if (style === "folk" && CARTOON_PORTRAIT_IDS.has(id)) {
    return `spirits-folk/${id}/texture`;
  }
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

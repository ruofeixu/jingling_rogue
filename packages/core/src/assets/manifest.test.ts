import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTables } from "../tables/load-tables.ts";
import { bundleForRealm, CARTOON_PORTRAIT_IDS, FIRST_PORTRAITS, PORTRAIT_BUNDLE, PORTRAIT_IDS, SECOND_PORTRAITS, THIRD_PORTRAITS, portraitPath, portraitTexturePath, remoteManifest } from "./manifest.ts";
import { decodeRgbaPng } from "./png-rgba.ts";

describe("remote asset manifest", () => {
  it("lists every spirit once and maps later realms to subpackages", () => {
    const tables = loadTables();
    const manifest = remoteManifest("https://cdn.example/jingling/0.1.0/");
    expect(manifest.assets).toHaveLength(tables.spirits.length);
    expect(new Set(manifest.assets.map((a) => a.id)).size).toBe(tables.spirits.length);
    expect(bundleForRealm("town_ruins")).toBe("main");
    expect(bundleForRealm("wilds")).toBe("bundle-realm-wilds");
    expect(bundleForRealm("woods")).toBe("bundle-realm-woods");
    expect(manifest.assets.some((a) => a.bundle === "bundle-realm-wilds")).toBe(true);
  });

  it("names the first portrait batch and their remote paths", () => {
    expect([...FIRST_PORTRAITS]).toEqual([
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
    expect(portraitPath("zao_li")).toBe("spirits/zao_li.png");
    expect(portraitTexturePath("zao_li")).toBe("spirits/zao_li/texture");
    expect(FIRST_PORTRAITS.has("huo_de_li")).toBe(false);
  });

  it("names the second portrait batch and unions them into PORTRAIT_IDS", () => {
    expect([...SECOND_PORTRAITS]).toEqual([
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
    expect(PORTRAIT_IDS.has("huo_de_li")).toBe(true);
    expect(PORTRAIT_IDS.has("zao_li")).toBe(true);
    expect(SECOND_PORTRAITS.size).toBe(9);
  });

  it("names the third portrait batch and unions them into PORTRAIT_IDS", () => {
    expect([...THIRD_PORTRAITS]).toEqual([
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
    expect(PORTRAIT_IDS.size).toBe(27);
    expect(PORTRAIT_IDS.has("zhang_yan")).toBe(true);
    expect(SECOND_PORTRAITS.has("zhang_yan")).toBe(false);
  });

  it("ships portraits in their own bundle instead of the resources main bundle", () => {
    expect(PORTRAIT_BUNDLE).toBe("portraits");
    const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
    const assets = resolve(repo, "assets");
    expect(existsSync(resolve(assets, "portraits/spirits")), "portrait bundle folder").toBe(true);
    expect(existsSync(resolve(assets, "portraits.meta")), "portrait bundle meta").toBe(true);
    expect(existsSync(resolve(assets, "resources/remote")), "portraits must leave the resources bundle").toBe(false);
    const meta = JSON.parse(readFileSync(resolve(assets, "portraits.meta"), "utf8")) as {
      userData?: { isBundle?: boolean; bundleName?: string };
    };
    expect(meta.userData?.isBundle).toBe(true);
    expect(meta.userData?.bundleName).toBe(PORTRAIT_BUNDLE);
    // Creator 3.8.2 实测忽略 meta 里的 compressionType，分包由构建后步骤落地，见 tools/pack_subpackages.py
    expect(existsSync(resolve(repo, "tools/pack_subpackages.py")), "subpackage packer").toBe(true);
  });

  it("keeps portrait pngs as RGBA so they are not black boxes", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../game/remote/spirits");
    const preview = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../assets/portraits/spirits");
    for (const id of PORTRAIT_IDS) {
      for (const dir of [root, preview]) {
        const buf = readFileSync(resolve(dir, `${id}.png`));
        expect(buf[25], `${dir} ${id} color type`).toBe(6);
      }
    }
  });

  it("keeps starter portraits with transparent corners", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../game/remote/spirits");
    const preview = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../assets/portraits/spirits");
    for (const id of CARTOON_PORTRAIT_IDS) {
      expect(PORTRAIT_IDS.has(id), id).toBe(true);
      for (const dir of [root, preview]) {
        const png = decodeRgbaPng(readFileSync(resolve(dir, `${id}.png`)));
        const corners = [
          [0, 0],
          [png.width - 1, 0],
          [0, png.height - 1],
          [png.width - 1, png.height - 1],
        ];
        for (const [x, y] of corners) {
          const alpha = png.data[(y * png.width + x) * 4 + 3] ?? 255;
          expect(alpha, `${dir} ${id} ${x},${y}`).toBeLessThan(32);
        }
      }
    }
  }, 60_000);

  it("keeps portrait pngs in the remote folder", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../game/remote/spirits");
    for (const id of PORTRAIT_IDS) {
      expect(existsSync(resolve(root, `${id}.png`)), id).toBe(true);
    }
  });

  it("keeps folk copies of the cartoon starters and names cartoon ids", () => {
    expect([...CARTOON_PORTRAIT_IDS]).toEqual([
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
    expect(CARTOON_PORTRAIT_IDS.size).toBe(PORTRAIT_IDS.size);
    expect(portraitTexturePath("zao_li")).toBe("spirits/zao_li/texture");
    expect(portraitTexturePath("zao_li", "cartoon")).toBe("spirits/zao_li/texture");
    expect(portraitTexturePath("zao_li", "folk")).toBe("spirits-folk/zao_li/texture");
    expect(portraitPath("zao_li", "folk")).toBe("spirits-folk/zao_li.png");
    expect(portraitTexturePath("dan_li", "folk")).toBe("spirits-folk/dan_li/texture");
    expect(portraitTexturePath("mo_mao", "folk")).toBe("spirits-folk/mo_mao/texture");
    expect(portraitTexturePath("huo_de_li", "folk")).toBe("spirits-folk/huo_de_li/texture");
    expect(portraitTexturePath("luan_shi", "folk")).toBe("spirits-folk/luan_shi/texture");
    expect(portraitTexturePath("tao_quan", "folk")).toBe("spirits-folk/tao_quan/texture");
    expect(portraitTexturePath("zhang_yan", "folk")).toBe("spirits-folk/zhang_yan/texture");
    expect(portraitTexturePath("shuang_ming", "folk")).toBe("spirits-folk/shuang_ming/texture");
    expect(portraitTexturePath("ping_yu", "folk")).toBe("spirits-folk/ping_yu/texture");
    expect(portraitTexturePath("zhen_yue", "folk")).toBe("spirits/zhen_yue/texture");
    const folk = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../game/remote/spirits-folk");
    const preview = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../assets/portraits/spirits-folk");
    for (const id of CARTOON_PORTRAIT_IDS) {
      for (const dir of [folk, preview]) {
        expect(existsSync(resolve(dir, `${id}.png`)), `${dir} ${id}`).toBe(true);
        const png = decodeRgbaPng(readFileSync(resolve(dir, `${id}.png`)));
        expect(png.data[3]).toBeLessThan(32);
      }
    }
  }, 60_000);
});

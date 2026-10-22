import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const SUBPACKAGES = ["bundle-battle", "bundle-realm-wilds", "bundle-realm-woods"];
const LOBBY_BOOT = join(dirname(fileURLToPath(import.meta.url)), "lobby-boot.js");

function writePack(dest: string, gameRel: string, project: Record<string, unknown>): void {
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, "game.json"), readFileSync(join(REPO, gameRel)));
  writeFileSync(join(dest, "project.config.json"), JSON.stringify(project, null, 2) + "\n");
  writeFileSync(join(dest, "game.js"), readFileSync(LOBBY_BOOT));
  for (const name of SUBPACKAGES) {
    const dir = join(dest, "subpackages", name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "game.js"), `console.log("[jingling] ${name}");\n`);
  }
}

export function assemblePreviewPacks(outRoot: string): {
  wechatgame: string;
  "bytedance-mini-game": string;
} {
  const wechatgame = join(outRoot, "wechatgame");
  const bytedance = join(outRoot, "bytedance-mini-game");
  writePack(wechatgame, "game/templates/wx/game.json", {
    description: "精怪肉鸽微信预览包",
    miniprogramRoot: "./",
    compileType: "game",
    libVersion: "game",
    appid: "touristappid",
    projectname: "jingling-rogue",
    setting: { urlCheck: true, minified: true },
  });
  writePack(bytedance, "game/templates/bytedance/game.json", {
    appid: "testappId",
    projectname: "jingling-rogue",
    setting: { urlCheck: true, es6: false, minified: true },
  });
  return { wechatgame, "bytedance-mini-game": bytedance };
}

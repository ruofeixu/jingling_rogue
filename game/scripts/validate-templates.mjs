import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(cond, message) {
  if (!cond) {
    throw new Error(message);
  }
}

const expected = ["bundle-battle", "bundle-realm-wilds", "bundle-realm-woods"];
// 预览占位包由 packages/platform 生成，分包目录由它自己写出，所以这里仍然校验声明。
for (const rel of ["templates/wx/game.json", "templates/bytedance/game.json"]) {
  const cfg = readJson(join(root, rel));
  assert(cfg.deviceOrientation === "portrait", `${rel} must be portrait`);
  const names = cfg.subpackages.map((p) => p.name).sort();
  assert(names.join(",") === expected.join(","), `${rel} subpackages mismatch`);
}

// Creator 的真实构建按 Asset Bundle 配置自动写出 subpackages；模板里手写声明会指向不存在的目录，
// 开发者工具在运行代码前就会拒绝导入。参见 docs/ui/baselines/2026-08-31.md 第 4 节。
for (const rel of ["../build-templates/wechatgame/game.json", "../build-templates/bytedance-mini-game/game.json"]) {
  const cfg = readJson(join(root, rel));
  assert(cfg.deviceOrientation === "portrait", `${rel} must be portrait`);
  for (const key of ["subpackages", "subPackages"]) {
    assert(
      !(key in cfg),
      `${rel} must not hand-write ${key}; Creator emits it from Asset Bundle settings`,
    );
  }
}

// 微信开发者工具只接受 latest / trial / widelyUsed 或 x.y.z 版本号；Creator 默认写的 "game" 会被拒编译。
const libVersionAliases = new Set(["latest", "trial", "widelyUsed"]);
for (const rel of ["../build-templates/wechatgame/project.config.json", "../build-templates/bytedance-mini-game/project.config.json"]) {
  const cfg = readJson(join(root, rel));
  if (!("libVersion" in cfg)) {
    continue;
  }
  const value = cfg.libVersion;
  assert(typeof value === "string", `${rel} libVersion must be a string`);
  assert(
    libVersionAliases.has(value) || /^\d+\.\d+\.\d+$/.test(value),
    `${rel} libVersion ${JSON.stringify(value)} is rejected by the devtools; use latest/trial/widelyUsed or x.y.z`,
  );
}

const domains = readJson(join(root, "templates/legal-domains.json"));
assert(Array.isArray(domains.request) && domains.request.length >= 2, "request domains missing");
assert(Array.isArray(domains.download) && domains.download.length >= 1, "download domains missing");
assert(domains.request.every((url) => String(url).startsWith("https://")), "request domains must be https");

console.log("minigame templates ok");

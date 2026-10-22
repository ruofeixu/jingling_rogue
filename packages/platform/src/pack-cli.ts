import { assemblePreviewPacks } from "./preview-pack.ts";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dest = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "../../..", "build");
const packs = assemblePreviewPacks(dest);
console.log("preview packs", packs.wechatgame, packs["bytedance-mini-game"]);

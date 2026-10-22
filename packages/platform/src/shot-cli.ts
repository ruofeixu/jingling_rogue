import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TOUR, buildScene, screenLayout } from "@jingling/core";
import { renderScenePng } from "./scene-png.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const dest = process.argv[2] ?? join(root, ".shots");

const VIEWS = [
  { name: "portrait", width: 750, height: 1334 },
  { name: "landscape", width: 1334, height: 750 },
];

mkdirSync(dest, { recursive: true });
let count = 0;
for (const view of VIEWS) {
  const ui = screenLayout(view.width, view.height);
  for (const stop of TOUR) {
    const app = stop.open("shot");
    if (app.screen !== stop.screen) {
      throw new Error(`${stop.name} landed on ${app.screen}, expected ${stop.screen}`);
    }
    writeFileSync(join(dest, `${stop.name}-${view.name}.png`), renderScenePng(buildScene(app, ui), ui));
    count += 1;
  }
}
console.log(`${count} shots in ${dest}`);

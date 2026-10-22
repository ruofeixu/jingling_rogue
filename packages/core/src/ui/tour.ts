import { getSpirit } from "../tables/load-tables.ts";
import { GLOSSARY, listCodexSpirits } from "./copy.ts";
import { PreviewApp, type PreviewScreen } from "./preview-app.ts";

export interface TourStop {
  name: string;
  screen: PreviewScreen;
  open: (seed: string) => PreviewApp;
}

const STARTER = "zao_li";

function lobby(seed: string, ...taps: string[]): PreviewApp {
  const app = new PreviewApp({ seed });
  for (const label of taps) {
    app.tap(label);
  }
  return app;
}

function inRun(seed: string, starterId = STARTER): PreviewApp {
  const app = new PreviewApp({ seed });
  app.tap("新的旅途");
  app.tap("经典");
  app.tap(getSpirit(starterId).name);
  return app;
}

function tapUntil(app: PreviewApp, label: string, screen: PreviewScreen, tries = 12): PreviewApp {
  for (let i = 0; i < tries && app.screen !== screen; i += 1) {
    if (!app.labels().includes(label)) {
      break;
    }
    app.tap(label);
  }
  return app;
}

function toShop(seed: string): PreviewApp {
  const app = inRun(seed);
  app.tap("走");
  if (app.screen === "catch") {
    app.tap("放过");
  }
  return app;
}

export const TOUR: TourStop[] = [
  { name: "title", screen: "title", open: (seed) => lobby(seed) },
  { name: "mode", screen: "mode", open: (seed) => lobby(seed, "新的旅途") },
  { name: "starter", screen: "starter", open: (seed) => lobby(seed, "新的旅途", "经典") },
  { name: "settings", screen: "settings", open: (seed) => lobby(seed, "设置") },
  { name: "codex-list", screen: "codex", open: (seed) => lobby(seed, "契录") },
  {
    name: "codex-entry",
    screen: "codex",
    open: (seed) => lobby(seed, "契录", listCodexSpirits()[0]?.name ?? "灶狸"),
  },
  { name: "eggs", screen: "eggs", open: (seed) => lobby(seed, "卵房") },
  { name: "achievements", screen: "achievements", open: (seed) => lobby(seed, "成就") },
  { name: "stats", screen: "stats", open: (seed) => lobby(seed, "统计") },
  { name: "slots", screen: "slots", open: (seed) => lobby(seed, "存档") },
  {
    name: "glossary",
    screen: "glossary",
    open: (seed) => lobby(seed, "名词", GLOSSARY[0]?.term ?? "精怪"),
  },
  {
    name: "hatch",
    screen: "hatch",
    open: (seed) => lobby(seed, "卵房", "兑孵券", "跳过并开"),
  },
  { name: "battle", screen: "battle", open: (seed) => inRun(seed) },
  { name: "arts", screen: "arts", open: (seed) => lobbyTap(inRun(seed), "术签") },
  { name: "switch", screen: "switch", open: (seed) => lobbyTap(inRun(seed), "队伍") },
  { name: "bag", screen: "bag", open: (seed) => lobbyTap(inRun(seed), "囊") },
  {
    name: "catch",
    screen: "catch",
    open: (seed) => {
      const app = inRun(seed);
      for (const foe of app.battle?.foes ?? []) {
        foe.hp = 1;
      }
      return tapUntil(app, "术", "catch");
    },
  },
  { name: "shop", screen: "shop", open: (seed) => toShop(seed) },
  { name: "summary", screen: "summary", open: (seed) => lobbyTap(toShop(seed), "摘要") },
  { name: "omen", screen: "omen", open: (seed) => lobbyTap(toShop(seed), "奇遇") },
  {
    name: "map",
    screen: "map",
    open: (seed) => {
      const app = inRun(seed);
      if (app.slice) {
        app.slice.run.hasMap = true;
      }
      app.skipTo(10);
      for (let i = 0; i < 10 && app.screen !== "map"; i += 1) {
        if (app.screen === "battle") {
          app.tap("走");
          continue;
        }
        if (app.screen === "catch") {
          app.tap("放过");
          continue;
        }
        if (app.screen === "shop") {
          const boon = app.labels().find((label) => !SHOP_CHROME.includes(label));
          if (!boon) {
            break;
          }
          app.tap(boon);
        }
      }
      return app;
    },
  },
  {
    name: "target",
    screen: "target",
    open: (seed) => {
      const app = inRun(seed);
      for (let wave = 2; wave <= 40 && app.screen !== "target"; wave += 1) {
        if (!app.slice) {
          break;
        }
        app.slice.run.forceDual = true;
        app.skipTo(wave);
        if (app.screen !== "battle" || (app.battle?.foes.length ?? 0) < 2) {
          continue;
        }
        app.tap("术");
      }
      return app;
    },
  },
  {
    name: "defeat",
    screen: "defeat",
    open: (seed) => {
      const app = inRun(seed, "tao_geng");
      for (const unit of app.battle?.party ?? []) {
        unit.hp = 1;
        unit.atk = 1;
      }
      for (const foe of app.battle?.foes ?? []) {
        foe.hp = Math.max(foe.hp, 80);
      }
      for (let i = 0; i < 12 && app.screen !== "defeat"; i += 1) {
        const label = app.labels().find((row) => row === "术") ?? app.labels()[0];
        if (!label) {
          break;
        }
        app.tap(label);
      }
      if (app.screen !== "defeat" && app.slice) {
        app.slice.noteLoss();
        app.refresh();
      }
      return app;
    },
  },
  {
    name: "victory",
    screen: "victory",
    open: (seed) => {
      const app = new PreviewApp({ seed });
      app.tap("新的旅途");
      app.tap("短征");
      app.tap(getSpirit(STARTER).name);
      app.skipTo(20);
      if (app.slice) {
        app.slice.noteWin();
        app.refresh();
      }
      return app;
    },
  },
];

const SHOP_CHROME = ["再择", "小药", "摘要", "奇遇", "合体", "空地", "回厅"];

function lobbyTap(app: PreviewApp, label: string): PreviewApp {
  app.tap(label);
  return app;
}

import { describe, expect, it } from "vitest";
import { buildScene, tappableLabels, type DrawCmd } from "./scene.ts";
import { screenLayout, type ScreenLayout } from "./layout.ts";
import { PreviewApp } from "./preview-app.ts";
import { TOUR } from "./tour.ts";

const VIEWS: ScreenLayout[] = [screenLayout(750, 1334), screenLayout(1334, 750)];

function titleScene(): DrawCmd[] {
  return buildScene(new PreviewApp({ seed: "scene" }), VIEWS[0]!);
}

function named(cmds: DrawCmd[], name: string): DrawCmd {
  const hit = cmds.find((cmd) => cmd.name === name);
  if (!hit) {
    throw new Error(`no draw command named ${name}`);
  }
  return hit;
}

function edges(cmd: DrawCmd): { l: number; r: number; b: number; t: number } {
  if (cmd.kind === "backdrop") {
    throw new Error("backdrop has no box");
  }
  const w = cmd.kind === "icon" ? cmd.size : cmd.w;
  const h = cmd.kind === "icon" ? cmd.size : cmd.h;
  return { l: cmd.x - w / 2, r: cmd.x + w / 2, b: cmd.y - h / 2, t: cmd.y + h / 2 };
}

function contains(outer: DrawCmd, inner: DrawCmd): boolean {
  const a = edges(outer);
  const b = edges(inner);
  return b.l >= a.l && b.r <= a.r && b.b >= a.b && b.t <= a.t;
}

function slipNames(cmds: DrawCmd[]): string[] {
  return cmds
    .filter((cmd) => cmd.kind === "window" && cmd.name.startsWith("slip-"))
    .map((cmd) => cmd.name.slice(5));
}

const MENU_LABELS = ["新的旅途", "设置", "契录", "卵房", "成就", "统计", "存档", "名词"];

describe("draw-list scene", () => {
  it("opens on the splash title and the eight lobby slips", () => {
    const cmds = titleScene();
    expect(cmds[0]?.kind).toBe("backdrop");
    expect(named(cmds, "splash-title")).toMatchObject({ kind: "text", text: "契灵志怪", size: 58 });
    expect(named(cmds, "splash-sub")).toMatchObject({ kind: "text", text: "精怪肉鸽", size: 28 });
    expect(slipNames(cmds)).toEqual(MENU_LABELS);
  });

  it("marks only the primary slip with the accent tone", () => {
    const cmds = titleScene();
    expect(named(cmds, "slip-新的旅途")).toMatchObject({ tone: "accent" });
    for (const label of MENU_LABELS.slice(1)) {
      expect(named(cmds, `slip-${label}`)).toMatchObject({ tone: "slip" });
    }
  });

  it("keeps every slip inside the menu window", () => {
    const cmds = titleScene();
    const menu = named(cmds, "menu");
    for (const label of MENU_LABELS) {
      expect(contains(menu, named(cmds, `slip-${label}`))).toBe(true);
    }
  });

  it("draws the top bar and log from live app copy", () => {
    const app = new PreviewApp({ seed: "scene" });
    app.tap("新的旅途");
    const cmds = buildScene(app, VIEWS[0]!);
    expect(named(cmds, "top-bar").kind).toBe("window");
    expect(named(cmds, "wave")).toMatchObject({ text: app.title });
    expect(named(cmds, "log")).toMatchObject({ text: app.log, wrap: true });
  });

  it("shows account progress in the top bar instead of echoing the splash title", () => {
    const app = new PreviewApp({ seed: "scene" });
    const wave = named(buildScene(app, VIEWS[0]!), "wave");
    expect(wave).toMatchObject({ kind: "text" });
    expect((wave as { text: string }).text).not.toBe(app.title);
    expect((wave as { text: string }).text).toContain("契录");
  });

  it("keeps the egg-room footer from repeating the panel body", () => {
    const stop = TOUR.find((row) => row.name === "eggs");
    const app = stop!.open("scene");
    const cmds = buildScene(app, VIEWS[0]!);
    const log = named(cmds, "log") as { text: string };
    const body = named(cmds, "panel-copy") as { text: string };
    expect(body.text).toBe(app.log);
    expect(log.text).not.toBe(body.text);
    expect(log.text).not.toContain("孵卵处");
  });
});

describe("every screen on the tour", () => {
  it("draws a slip for every label the player can tap", () => {
    for (const ui of VIEWS) {
      for (const stop of TOUR) {
        const app = stop.open("scene");
        const drawn = slipNames(buildScene(app, ui));
        const missing = tappableLabels(app).filter((label) => !drawn.includes(label));
        expect([stop.name, ui.kind, missing]).toEqual([stop.name, ui.kind, []]);
      }
    }
  });

  it("never draws a slip the player cannot tap", () => {
    for (const ui of VIEWS) {
      for (const stop of TOUR) {
        const app = stop.open("scene");
        const tappable = tappableLabels(app);
        const extra = slipNames(buildScene(app, ui)).filter((label) => !tappable.includes(label));
        expect([stop.name, ui.kind, extra]).toEqual([stop.name, ui.kind, []]);
      }
    }
  });

  it("keeps every command on screen", () => {
    for (const ui of VIEWS) {
      const half = { w: ui.view.width / 2, h: ui.view.height / 2 };
      for (const stop of TOUR) {
        const off: string[] = [];
        for (const cmd of buildScene(stop.open("scene"), ui)) {
          if (cmd.kind === "backdrop") {
            continue;
          }
          const box = edges(cmd);
          if (box.l < -half.w || box.r > half.w || box.b < -half.h || box.t > half.h) {
            off.push(cmd.name);
          }
        }
        expect([stop.name, ui.kind, off]).toEqual([stop.name, ui.kind, []]);
      }
    }
  });

  it("keeps buttons clear of the HP plates and party tray", () => {
    for (const ui of VIEWS) {
      for (const stop of TOUR) {
        const cmds = buildScene(stop.open("scene"), ui);
        const plates = cmds.filter(
          (cmd) => cmd.name.startsWith("plate-") || cmd.name.startsWith("tray-"),
        );
        const slips = cmds.filter((cmd) => cmd.kind === "window" && cmd.name.startsWith("slip-"));
        const clashes: string[] = [];
        for (const plate of plates) {
          for (const slip of slips) {
            const a = edges(plate);
            const b = edges(slip);
            if (a.l < b.r && a.r > b.l && a.b < b.t && a.t > b.b) {
              clashes.push(`${plate.name} × ${slip.name}`);
            }
          }
        }
        expect([stop.name, ui.kind, clashes]).toEqual([stop.name, ui.kind, []]);
      }
    }
  });

  it("keeps slips from overlapping each other", () => {
    for (const ui of VIEWS) {
      for (const stop of TOUR) {
        const slips = buildScene(stop.open("scene"), ui).filter(
          (cmd) => cmd.kind === "window" && cmd.name.startsWith("slip-"),
        );
        const clashes: string[] = [];
        for (let i = 0; i < slips.length; i += 1) {
          for (let j = i + 1; j < slips.length; j += 1) {
            const a = edges(slips[i]!);
            const b = edges(slips[j]!);
            if (a.l < b.r && a.r > b.l && a.b < b.t && a.t > b.b) {
              clashes.push(`${slips[i]!.name} × ${slips[j]!.name}`);
            }
          }
        }
        expect([stop.name, ui.kind, clashes]).toEqual([stop.name, ui.kind, []]);
      }
    }
  });

  it("keeps slip labels and icons inside their own slip", () => {
    for (const ui of VIEWS) {
      for (const stop of TOUR) {
        const cmds = buildScene(stop.open("scene"), ui);
        const spills: string[] = [];
        for (const label of slipNames(cmds)) {
          const slip = named(cmds, `slip-${label}`);
          for (const part of cmds.filter(
            (cmd) => cmd.name.startsWith(`slip-${label}-`) && cmd.kind !== "backdrop",
          )) {
            if (!contains(slip, part)) {
              spills.push(part.name);
            }
          }
        }
        expect([stop.name, ui.kind, spills]).toEqual([stop.name, ui.kind, []]);
      }
    }
  });
});

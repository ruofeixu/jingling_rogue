import { describe, expect, it } from "vitest";
import {
  BATTLE,
  HUD,
  VIEW,
  affinityInk,
  cardCaptionSlots,
  formatArtSlip,
  formatHpText,
  formatTopBar,
  nameplateSlots,
  screenLayout,
  HIT_MIN,
  codexCell,
  codexThumbCaption,
} from "./layout.ts";
import { THEME } from "./theme.ts";

function box(x: number, y: number, w: number, h: number) {
  return { l: x - w / 2, r: x + w / 2, b: y - h / 2, t: y + h / 2 };
}

function overlap(
  a: { l: number; r: number; b: number; t: number },
  b: { l: number; r: number; b: number; t: number },
): boolean {
  return a.l < b.r && a.r > b.l && a.b < b.t && a.t > b.b;
}

describe("internal preview layout", () => {
  it("is portrait 750 by 1334", () => {
    expect(VIEW).toEqual({ width: 750, height: 1334 });
  });

  it("puts foe right, player left, and the log under the field", () => {
    expect(BATTLE.foe.y).toBeGreaterThan(0);
    expect(BATTLE.player.y).toBeLessThan(0);
    expect(BATTLE.foe.x).toBeGreaterThan(BATTLE.player.x);
    expect(HUD.message.y).toBeLessThan(-400);
    expect(HUD.partyTray.y).toBeLessThan(HUD.playerPlate.y);
  });

  it("formats nameplate, top bar, and art-slip copy", () => {
    expect(formatHpText(42, 100)).toBe("42/100");
    expect(formatTopBar(3, "密林", "野遇")).toBe("第3波  密林  野遇");
    expect(formatTopBar(3, "密林", "野遇", 1000)).toBe("第3波  密林  野遇  金1000");
    expect(formatArtSlip("灶火", "flame", 3, 8)).toEqual({
      title: "灶火",
      meta: "炎  3/8",
    });
  });

  it("maps eight affinities to ink colors", () => {
    expect(affinityInk("flame").r).toBeGreaterThan(affinityInk("tide").r);
    expect(affinityInk("shade").r).toBeLessThan(40);
  });

  it("keeps command cells, log, and lobby buttons from overlapping", () => {
    for (const [w, h] of [
      [750, 1334],
      [1334, 750],
    ] as const) {
      const ui = screenLayout(w, h);
      const cells = [0, 1, 2, 3].map((index) => {
        const pos = ui.commandPos(index);
        return box(pos.x, pos.y, ui.battle.commandW, ui.battle.commandH);
      });
      for (let i = 0; i < cells.length; i += 1) {
        for (let j = i + 1; j < cells.length; j += 1) {
          expect(overlap(cells[i], cells[j])).toBe(false);
        }
      }
      const log = box(ui.hud.log.x, ui.hud.log.y, ui.hud.log.width, ui.hud.log.height);
      const message = box(0, ui.hud.message.y, ui.hud.message.width, ui.hud.message.height);
      for (const cell of cells) {
        expect(overlap(log, cell)).toBe(false);
        expect(overlap(message, cell)).toBe(false);
      }
      expect(ui.lobby.itemGap).toBeGreaterThanOrEqual(ui.lobby.buttonH);
      expect(ui.lobby.glossaryGap).toBeGreaterThanOrEqual(ui.lobby.buttonH);
      expect(ui.battle.help.y).toBe(ui.hud.topBar.y);
      const glossary = box(ui.lobby.glossary.x, ui.lobby.glossary.y, ui.lobby.glossary.width, ui.lobby.glossary.height);
      expect(overlap(glossary, message)).toBe(false);
      const glossaryBody = box(0, ui.lobby.glossaryBodyY, ui.lobby.glossary.width - 60, 140);
      expect(glossaryBody.b >= glossary.b - 1 && glossaryBody.t <= glossary.t + 1, `${ui.kind} glossary body in panel`).toBe(
        true,
      );
      const relic = box(0, ui.lobby.starterRelicY, ui.lobby.buttonW, ui.lobby.buttonH);
      const card = box(0, ui.lobby.starterCard.y, ui.lobby.starterCard.width, ui.lobby.starterCard.height);
      expect(overlap(relic, card)).toBe(false);
      const candy = box(0, ui.lobby.starterCandyY, ui.lobby.buttonW, ui.lobby.buttonH);
      const back = box(0, ui.lobby.starterBackY, ui.lobby.buttonW, ui.lobby.buttonH);
      expect(overlap(candy, card)).toBe(false);
      expect(overlap(back, card)).toBe(false);
      expect(overlap(back, message)).toBe(false);
      expect(ui.lobby.itemDx).toBeGreaterThanOrEqual(ui.lobby.buttonW + 8);
      expect(ui.lobby.slotDx).toBeGreaterThanOrEqual(ui.lobby.slotW + 8);
      expect(ui.lobby.shopDx).toBeGreaterThanOrEqual(ui.lobby.buttonW + 8);
      const slots = [0, 1, 2, 3, 4].map((slot) =>
        box((slot - 2) * ui.lobby.slotDx, ui.lobby.itemY0, ui.lobby.slotW, ui.lobby.buttonH),
      );
      for (let i = 0; i < slots.length; i += 1) {
        for (let j = i + 1; j < slots.length; j += 1) {
          expect(overlap(slots[i], slots[j]), `slot ${i}/${j} ${ui.kind}`).toBe(false);
        }
        expect(Math.abs(slots[i].l) <= ui.view.width / 2 + 1 && Math.abs(slots[i].r) <= ui.view.width / 2 + 1).toBe(true);
      }
      const shop = [-1, 0, 1].map((col) =>
        box(col * ui.lobby.shopDx, ui.lobby.backY, ui.lobby.buttonW, ui.lobby.buttonH),
      );
      expect(overlap(shop[0], shop[1]), ui.kind).toBe(false);
      expect(overlap(shop[1], shop[2]), ui.kind).toBe(false);
      const cards = [-1, 0, 1].map((col) =>
        box(col * ui.lobby.shopDx, ui.lobby.starterCard.y, ui.lobby.starterCard.width, ui.lobby.starterCard.height),
      );
      const relics = [-1, 0, 1].map((col) =>
        box(col * ui.lobby.shopDx, ui.lobby.starterRelicY, ui.lobby.buttonW, ui.lobby.buttonH),
      );
      const candies = [-1, 0, 1].map((col) =>
        box(col * ui.lobby.shopDx, ui.lobby.starterCandyY, ui.lobby.buttonW, ui.lobby.buttonH),
      );
      for (let i = 0; i < cards.length; i += 1) {
        expect(cards[i].l >= -ui.view.width / 2 - 1 && cards[i].r <= ui.view.width / 2 + 1, `${ui.kind} card ${i} x`).toBe(
          true,
        );
        expect(overlap(cards[i], message), `${ui.kind} card ${i} vs log`).toBe(false);
        expect(overlap(cards[i], log), `${ui.kind} card ${i} vs log box`).toBe(false);
        for (let j = i + 1; j < cards.length; j += 1) {
          expect(overlap(cards[i], cards[j]), `${ui.kind} card ${i}/${j}`).toBe(false);
        }
        expect(overlap(cards[i], relics[i]), `${ui.kind} card/relic ${i}`).toBe(false);
        expect(overlap(cards[i], candies[i]), `${ui.kind} card/candy ${i}`).toBe(false);
        expect(overlap(cards[i], back), `${ui.kind} card ${i} vs back`).toBe(false);
      }
      const termRow = Math.ceil(15 / ui.lobby.glossaryCols) - 1;
      const glossaryTerm = box(0, ui.lobby.glossaryItemY0 - termRow * ui.lobby.glossaryGap, 190, ui.lobby.buttonH);
      expect(overlap(glossaryTerm, glossaryBody), ui.kind).toBe(false);
      const bagBack = box(
        ui.battle.commandsX[1],
        ui.battle.menuY0 - ui.battle.menuGap * 3,
        ui.battle.commandW,
        ui.battle.commandH,
      );
      expect(overlap(bagBack, message), ui.kind).toBe(false);
      const skip = box(ui.battle.skip.x, ui.battle.skip.y, 110, ui.lobby.buttonH);
      const help = box(ui.battle.help.x, ui.battle.help.y, 56, 56);
      const quit = box(ui.battle.quit.x, ui.battle.quit.y, 80, ui.lobby.buttonH);
      const title = box(0, ui.hud.topBar.y, ui.hud.topBar.width - 280, ui.hud.topBar.height);
      const halfW = ui.view.width / 2;
      for (const [name, slot] of [
        ["skip", skip],
        ["help", help],
        ["quit", quit],
      ] as const) {
        expect(slot.l >= -halfW - 1 && slot.r <= halfW + 1, `${ui.kind} ${name} on screen`).toBe(true);
      }
      expect(overlap(skip, help)).toBe(false);
      expect(overlap(skip, title), ui.kind).toBe(false);
      expect(overlap(help, title), ui.kind).toBe(false);
      expect(overlap(quit, help), ui.kind).toBe(false);
      expect(overlap(quit, skip), ui.kind).toBe(false);
      expect(overlap(quit, title), ui.kind).toBe(false);
      const artMenu = box(
        cells[1].l + ui.battle.commandW / 2,
        cells[1].t + 28 + ui.battle.commandH / 2,
        ui.battle.commandW,
        ui.battle.commandH,
      );
      const playerPlate = box(ui.hud.playerPlate.x, ui.hud.playerPlate.y, ui.hud.playerPlate.width, ui.hud.playerPlate.height);
      expect(overlap(artMenu, cells[0]), `${ui.kind} 术签/术`).toBe(false);
      expect(overlap(artMenu, playerPlate), `${ui.kind} 术签/名牌`).toBe(false);
      expect(overlap(artMenu, message), `${ui.kind} 术签/日志`).toBe(false);
    }
  });

  it("fits six mode buttons and back inside the panel", () => {
    for (const [w, h] of [
      [750, 1334],
      [1334, 750],
    ] as const) {
      const ui = screenLayout(w, h);
      const cols = ui.lobby.modeCols;
      expect(cols).toBeGreaterThanOrEqual(2);
      const modes = Array.from({ length: 6 }, (_, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = (col - (cols - 1) / 2) * ui.lobby.itemDx;
        return box(x, ui.lobby.itemY0 - row * ui.lobby.itemGap, ui.lobby.buttonW, ui.lobby.buttonH);
      });
      const back = box(0, ui.lobby.backY, ui.lobby.buttonW, ui.lobby.buttonH);
      const panel = box(0, ui.lobby.panel.y, ui.lobby.panel.width, ui.lobby.panel.height);
      const log = box(ui.hud.log.x, ui.hud.log.y, ui.hud.log.width, ui.hud.log.height);
      for (let i = 0; i < modes.length; i += 1) {
        expect(overlap(modes[i], back), `${ui.kind} mode ${i} vs back`).toBe(false);
        expect(overlap(modes[i], log), `${ui.kind} mode ${i} vs log`).toBe(false);
        expect(modes[i].b >= panel.b - 1 && modes[i].t <= panel.t + 1, `${ui.kind} mode ${i} in panel`).toBe(true);
        for (let j = i + 1; j < modes.length; j += 1) {
          expect(overlap(modes[i], modes[j]), `${ui.kind} mode ${i}/${j}`).toBe(false);
        }
      }
      expect(overlap(back, log), `${ui.kind} back vs log`).toBe(false);
      expect(back.b >= panel.b - 1 && back.t <= panel.t + 1, `${ui.kind} back in panel`).toBe(true);
    }
  });

  it("switches to a landscape board when the view is wider than it is tall", () => {
    const wide = screenLayout(1334, 750);
    expect(wide.kind).toBe("landscape");
    expect(wide.view).toEqual({ width: 1334, height: 750 });
    expect(wide.hud.topBar.y).toBeLessThan(380);
    expect(wide.hud.message.y).toBeGreaterThan(-400);
    const tall = screenLayout(750, 1334);
    expect(tall.kind).toBe("portrait");
    expect(tall.hud.topBar.y).toBe(HUD.topBar.y);
  });

  it("keeps nameplate name, affinity, level, and hp from overlapping", () => {
    for (const [w, h] of [
      [750, 1334],
      [1334, 750],
    ] as const) {
      const ui = screenLayout(w, h);
      const plates = [ui.hud.foePlate, ui.hud.playerPlate];
      for (const plate of plates) {
        const slots = nameplateSlots(plate.width, plate.height);
        const boxes = {
          aff: box(slots.aff.x, slots.aff.y, slots.aff.w, slots.aff.h),
          name: box(slots.name.x, slots.name.y, slots.name.w, slots.name.h),
          lv: box(slots.lv.x, slots.lv.y, slots.lv.w, slots.lv.h),
          bar: box(slots.bar.x, slots.bar.y, slots.bar.w, slots.bar.h),
          hp: box(slots.hp.x, slots.hp.y, slots.hp.w, slots.hp.h),
        };
        expect(overlap(boxes.aff, boxes.name), `${ui.kind} aff/name`).toBe(false);
        expect(overlap(boxes.name, boxes.lv), `${ui.kind} name/lv`).toBe(false);
        expect(overlap(boxes.aff, boxes.lv), `${ui.kind} aff/lv`).toBe(false);
        expect(overlap(boxes.bar, boxes.hp), `${ui.kind} bar/hp`).toBe(false);
        expect(overlap(boxes.name, boxes.bar), `${ui.kind} name/bar`).toBe(false);
        expect(overlap(boxes.name, boxes.hp), `${ui.kind} name/hp`).toBe(false);
        expect(slots.name.w).toBeGreaterThan(48);
        expect(slots.name.h).toBeGreaterThanOrEqual(28);
        expect(slots.aff.h).toBeGreaterThanOrEqual(28);
        const plateBox = box(0, 0, plate.width, plate.height);
        for (const [key, slot] of Object.entries(boxes)) {
          expect(slot.l >= plateBox.l - 1 && slot.r <= plateBox.r + 1, `${ui.kind} ${key} x`).toBe(true);
          expect(slot.b >= plateBox.b - 1 && slot.t <= plateBox.t + 1, `${ui.kind} ${key} y`).toBe(true);
        }
      }
      const captions = cardCaptionSlots(ui.lobby.starterCard.height);
      const title = box(0, captions.title.y, ui.lobby.starterCard.width - 24, captions.title.h);
      const hint = box(0, captions.hint.y, ui.lobby.starterCard.width - 30, captions.hint.h);
      expect(overlap(title, hint), `${ui.kind} card name/hint`).toBe(false);
      expect(captions.title.h).toBeGreaterThanOrEqual(28);
      expect(captions.hint.h).toBeGreaterThanOrEqual(22);
    }
  });

  it("fits a 4 by 4 契录 grid of sixteen thumbs", () => {
    for (const [w, h] of [
      [750, 1334],
      [1334, 750],
    ] as const) {
      const ui = screenLayout(w, h);
      expect(ui.codex.cols * ui.codex.rows).toBe(16);
      expect(ui.codex.cellW).toBeGreaterThanOrEqual(HIT_MIN);
      expect(ui.codex.cellH).toBeGreaterThanOrEqual(HIT_MIN);
      const caption = codexThumbCaption(ui.codex.cellH);
      const cell = box(0, 0, ui.codex.cellW, ui.codex.cellH);
      const band = box(0, caption.y, ui.codex.cellW - 16, caption.h);
      expect(band.b).toBeGreaterThanOrEqual(cell.b);
      expect(band.t).toBeLessThanOrEqual(cell.t);
      expect(caption.h).toBeGreaterThanOrEqual(28);
      expect(THEME.panel.reduce((sum, n) => sum + n, 0)).toBeGreaterThan(THEME.ink.reduce((sum, n) => sum + n, 0) + 400);
      const topBar = box(0, ui.hud.topBar.y, ui.hud.topBar.width, ui.hud.topBar.height);
      const log = box(ui.hud.log.x, ui.hud.log.y, ui.hud.log.width, ui.hud.log.height);
      const nav = box(0, ui.codex.navY, ui.lobby.buttonW, ui.lobby.buttonH);
      const cells = Array.from({ length: 16 }, (_, index) => {
        const pos = codexCell(ui, index);
        return box(pos.x, pos.y, ui.codex.cellW, ui.codex.cellH);
      });
      for (let i = 0; i < cells.length; i += 1) {
        expect(overlap(cells[i], topBar), `${ui.kind} thumb ${i} vs top`).toBe(false);
        expect(overlap(cells[i], log), `${ui.kind} thumb ${i} vs log`).toBe(false);
        expect(overlap(cells[i], nav), `${ui.kind} thumb ${i} vs nav`).toBe(false);
        for (let j = i + 1; j < cells.length; j += 1) {
          expect(overlap(cells[i], cells[j]), `${ui.kind} thumb ${i}/${j}`).toBe(false);
        }
      }
      expect(overlap(nav, log), ui.kind).toBe(false);
      const entry = box(0, ui.codex.entryY, ui.codex.entryW, ui.codex.entryH);
      const sheet = box(0, ui.codex.sheetY, ui.codex.sheetW, ui.codex.sheetH);
      expect(overlap(entry, topBar), `${ui.kind} entry vs top`).toBe(false);
      expect(overlap(entry, sheet), `${ui.kind} entry vs sheet`).toBe(false);
      expect(overlap(entry, nav), `${ui.kind} entry vs nav`).toBe(false);
      expect(overlap(sheet, nav), `${ui.kind} sheet vs nav`).toBe(false);
      expect(overlap(sheet, log), `${ui.kind} sheet vs log`).toBe(false);
    }
  });

  it("keeps tappable slots at least 44px and arts back clear of command cells", () => {
    for (const [w, h] of [
      [750, 1334],
      [1334, 750],
    ] as const) {
      const ui = screenLayout(w, h);
      expect(HIT_MIN).toBe(44);
      expect(ui.battle.commandW).toBeGreaterThanOrEqual(HIT_MIN);
      expect(ui.battle.commandH).toBeGreaterThanOrEqual(HIT_MIN);
      expect(ui.lobby.buttonH).toBeGreaterThanOrEqual(HIT_MIN);
      expect(ui.artSlip.width).toBeGreaterThanOrEqual(HIT_MIN);
      expect(ui.artSlip.height).toBeGreaterThanOrEqual(HIT_MIN);
      expect(56).toBeGreaterThanOrEqual(HIT_MIN);
      const skipH = ui.lobby.buttonH;
      expect(skipH).toBeGreaterThanOrEqual(HIT_MIN);
      const cells = [0, 1, 2, 3].map((index) => {
        const pos = ui.commandPos(index);
        return box(pos.x, pos.y, ui.battle.commandW, ui.battle.commandH);
      });
      const back = box(ui.battle.back.x, ui.battle.back.y, ui.battle.commandW, ui.battle.commandH);
      for (let i = 0; i < cells.length; i += 1) {
        expect(overlap(back, cells[i]), `${ui.kind} arts back vs command ${i}`).toBe(false);
      }
    }
  });
});

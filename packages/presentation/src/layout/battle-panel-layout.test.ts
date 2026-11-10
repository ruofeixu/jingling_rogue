import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MIN_HIT_SIZE } from "../a11y.ts";
import { buildResponsiveFrame } from "../responsive.ts";
import { buildViewport } from "../viewport.ts";
import { battleItemSlots, battleLayout, battlePanelLayout, battlePanelRowCapacity, itemTooltipBox } from "./battle-layout.ts";
import { inside, overlaps, type LayoutBox } from "./box.ts";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const SIZES = [
  { width: 390, height: 844 },
  { width: 320, height: 568 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 },
  { width: 750, height: 1334 },
  { width: 1334, height: 750 },
];

function scene(layout: ReturnType<typeof battleLayout>): LayoutBox[] {
  return [layout.topBar, layout.items, layout.foePlate, layout.foeArt, layout.allyArt, layout.allyPlate];
}

describe("battle panel layout (every in-battle choice shows on the battle scene, no page switch)", () => {
  for (const size of SIZES) {
    const frame = buildResponsiveFrame(buildViewport(size));
    const battle = battleLayout(frame);
    const label = `${size.width}x${size.height}`;

    for (const count of [1, 2, 3, 4, 5, 6]) {
      for (const actions of [2, 3]) {
        const panel = battlePanelLayout(frame, count, actions);
        const all: LayoutBox[] = [...panel.skills, ...panel.actions];

        it(`${count} rows + ${actions} actions stay inside the screen at ${label}`, () => {
          // 放不下的部分截掉（调用方分页），不会压到立绘。
          expect(panel.skills).toHaveLength(Math.min(count, battlePanelRowCapacity(frame)));
          expect(panel.actions).toHaveLength(actions);
          for (const box of all) {
            expect(inside(box, frame.content.width, frame.content.height)).toBe(true);
          }
        });

        it(`${count} rows + ${actions} actions never overlap each other at ${label}`, () => {
          for (let i = 0; i < all.length; i++) {
            for (let j = i + 1; j < all.length; j++) {
              expect(overlaps(all[i]!, all[j]!), `${i}-${j}`).toBe(false);
            }
          }
        });

        it(`${count} rows + ${actions} actions never cover the fighters or plates at ${label}`, () => {
          for (const box of all) {
            for (const other of scene(battle)) {
              expect(overlaps(box, other)).toBe(false);
            }
          }
        });

        it(`${count} rows + ${actions} actions are comfortable tap targets at ${label}`, () => {
          for (const box of all) {
            expect(box.width).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
            expect(box.height).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
          }
        });
      }
    }

    it(`always has room for at least four rows at ${label}`, () => {
      expect(battlePanelRowCapacity(frame)).toBeGreaterThanOrEqual(4);
    });

    it(`puts up to four rows exactly where the four commands were at ${label}`, () => {
      expect(battlePanelLayout(frame, 4, 2).skills).toEqual(battle.commands);
    });

    it(`reads rows left to right, top to bottom at ${label}`, () => {
      const rows = battlePanelLayout(frame, 4, 2).skills;
      expect(rows[0]!.y).toBeGreaterThan(rows[2]!.y);
      expect(rows[0]!.x).toBeLessThan(rows[1]!.x);
      expect(rows[0]!.y).toBe(rows[1]!.y);
    });
  }
});

describe("battle item strip layout", () => {
  for (const size of SIZES) {
    const frame = buildResponsiveFrame(buildViewport(size));
    const battle = battleLayout(frame);
    const label = `${size.width}x${size.height}`;

    it(`reserves a strip under the top bar even with no items at ${label}`, () => {
      expect(inside(battle.items, frame.content.width, frame.content.height)).toBe(true);
      expect(battle.items.y).toBeLessThan(battle.topBar.y);
      expect(overlaps(battle.items, battle.topBar)).toBe(false);
    });

    it(`fits every icon in the strip and caps the count at ${label}`, () => {
      for (const count of [0, 1, 5, 12, 80]) {
        const { slots, overflow } = battleItemSlots(frame, count);
        for (const slot of slots) {
          expect(inside(slot, frame.content.width, frame.content.height)).toBe(true);
          expect(slot.width).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
          expect(slot.height).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
          expect(slot.y + slot.height / 2).toBeLessThanOrEqual(battle.items.y + battle.items.height / 2 + 1e-6);
          expect(slot.y - slot.height / 2).toBeGreaterThanOrEqual(battle.items.y - battle.items.height / 2 - 1e-6);
        }
        for (let i = 0; i < slots.length; i++) {
          for (let j = i + 1; j < slots.length; j++) {
            expect(overlaps(slots[i]!, slots[j]!), `${count}:${i}-${j}`).toBe(false);
          }
        }
        expect(slots.length).toBeLessThanOrEqual(count);
        if (overflow === 0) {
          expect(slots).toHaveLength(count);
        } else {
          // 放不下时最后一格是「+N」，它后面藏了 overflow 件。
          expect(slots.length - 1 + overflow).toBe(count);
        }
      }
    });

    it(`keeps the tooltip on screen and off its icon at ${label}`, () => {
      const { slots } = battleItemSlots(frame, 80);
      for (const anchor of [slots[0]!, slots[Math.floor(slots.length / 2)]!, slots[slots.length - 1]!]) {
        const tip = itemTooltipBox(anchor, frame);
        expect(inside(tip, frame.content.width, frame.content.height)).toBe(true);
        expect(overlaps(tip, anchor)).toBe(false);
      }
    });
  }
});

describe("battle panel wiring (B5d)", () => {
  const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");
  const battle = readFileSync(resolve(REPO, "assets/scripts/app/screens/BattleScreen.ts"), "utf8");

  it("renders every battle overlay on top of the battle scene instead of a separate page", () => {
    expect(shell).toContain("BATTLE_PANELS");
    expect(shell).toMatch(/BATTLE_PANELS\.has\(this\.routeId\)\s*&&\s*this\.battleView/);
    for (const kind of ["arts", "switch", "party", "bag", "target", "catch"]) {
      expect(shell, kind).toMatch(new RegExp(`BATTLE_PANELS[^;]*"${kind}"`));
    }
    expect(battle).toContain("battlePanelLayout");
    expect(battle).toContain("panel");
  });

  it("does not fade the battle scene in again when moving inside a battle", () => {
    expect(battle).toMatch(/fadeIn\s*!==\s*false/);
    expect(shell).toMatch(/fadeIn:/);
  });

  it("marks the selected row with an outline", () => {
    expect(battle).toContain("COLOR.accent");
    expect(battle).toMatch(/selectedId/);
  });
});

describe("item tooltip (B5d)", () => {
  const strip = readFileSync(resolve(REPO, "assets/scripts/app/ui/ItemStrip.ts"), "utf8");

  it("is opaque and drawn on top, so nameplates underneath do not show through", () => {
    expect(strip).toMatch(/alpha:\s*255/);
    expect(strip).toContain("setSiblingIndex");
  });

  it("shows on mouse hover and on long press, and hides on leave or release", () => {
    expect(strip).toContain("MOUSE_ENTER");
    expect(strip).toContain("MOUSE_LEAVE");
    expect(strip).toContain("TOUCH_START");
    expect(strip).toContain("TOUCH_END");
    expect(strip).toContain("TOUCH_CANCEL");
  });
});

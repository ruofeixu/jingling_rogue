import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MIN_HIT_SIZE } from "../a11y.ts";
import { buildResponsiveFrame } from "../responsive.ts";
import { buildViewport } from "../viewport.ts";
import { battleArtsLayout, battleLayout } from "./battle-layout.ts";
import { inside, overlaps, type LayoutBox } from "./box.ts";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const SIZES = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 },
  { width: 750, height: 1334 },
  { width: 1334, height: 750 },
];

describe("battle skill panel layout (skills show on the battle scene, no page switch)", () => {
  for (const size of SIZES) {
    const frame = buildResponsiveFrame(buildViewport(size));
    const battle = battleLayout(frame);
    const arts = battleArtsLayout(frame);
    const all: LayoutBox[] = [...arts.skills, arts.back, arts.confirm];

    it(`keeps the panel inside the screen at ${size.width}x${size.height}`, () => {
      for (const box of all) {
        expect(inside(box, frame.content.width, frame.content.height)).toBe(true);
      }
    });

    it(`never overlaps its own buttons at ${size.width}x${size.height}`, () => {
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          expect(overlaps(all[i]!, all[j]!), `${i}-${j}`).toBe(false);
        }
      }
    });

    it(`never covers the fighters or nameplates at ${size.width}x${size.height}`, () => {
      const scene = [battle.topBar, battle.foePlate, battle.foeArt, battle.allyArt, battle.allyPlate];
      for (const box of all) {
        for (const other of scene) {
          expect(overlaps(box, other)).toBe(false);
        }
      }
    });

    it(`keeps every button a comfortable tap target at ${size.width}x${size.height}`, () => {
      for (const box of all) {
        expect(box.width).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
        expect(box.height).toBeGreaterThanOrEqual(MIN_HIT_SIZE);
      }
    });

    it(`puts the four skills exactly where the four commands were at ${size.width}x${size.height}`, () => {
      expect(arts.skills).toEqual(battle.commands);
    });
  }
});

describe("skill panel wiring (B5d)", () => {
  const shell = readFileSync(resolve(REPO, "assets/scripts/app/AppShell.ts"), "utf8");
  const battle = readFileSync(resolve(REPO, "assets/scripts/app/screens/BattleScreen.ts"), "utf8");

  it("renders the arts overlay on top of the battle scene instead of a separate page", () => {
    expect(shell).toContain("artsPanel");
    // 有战斗视图且有术可选时才就地显示；否则回退到原来的整页。
    expect(shell).toMatch(/this\.routeId === "arts"\s*&&\s*this\.battleView/);
    expect(battle).toContain("battleArtsLayout");
    expect(battle).toContain("artsPanel");
  });

  it("does not fade the battle scene in again when moving inside a battle", () => {
    expect(battle).toMatch(/fadeIn\s*!==\s*false/);
    expect(shell).toMatch(/fadeIn:/);
  });

  it("marks the selected skill with an outline", () => {
    expect(battle).toContain("COLOR.accent");
    expect(battle).toMatch(/selectedId/);
  });
});

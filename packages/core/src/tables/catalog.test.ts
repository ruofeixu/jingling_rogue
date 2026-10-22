import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadEndlessRealms, loadTables } from "./load-tables.ts";

const tablesDir = dirname(fileURLToPath(import.meta.url));

describe("launch catalog", () => {
  it("meets classic 200 catalog floors", () => {
    const tables = loadTables();
    expect(tables.spirits.length).toBeGreaterThanOrEqual(120);
    expect(tables.arts.length).toBeGreaterThanOrEqual(200);
    expect(tables.pacts.length).toBeGreaterThanOrEqual(80);
    expect(tables.boons.length).toBeGreaterThanOrEqual(90);
    expect(tables.realms).toHaveLength(12);
    expect(loadEndlessRealms().length).toBeGreaterThanOrEqual(30);
    const omens = JSON.parse(readFileSync(join(tablesDir, "omens.json"), "utf8")) as { id: string }[];
    const trainers = JSON.parse(readFileSync(join(tablesDir, "trainers.json"), "utf8")) as { id: string }[];
    expect(omens.length).toBeGreaterThanOrEqual(40);
    expect(trainers.length).toBeGreaterThanOrEqual(30);
  });

  it("keeps omen names folkloric, not generator filler", () => {
    const omens = JSON.parse(readFileSync(join(tablesDir, "omens.json"), "utf8")) as {
      id: string;
      name: string;
      body: string;
      options: { label: string }[];
    }[];
    expect(omens.length).toBeGreaterThanOrEqual(40);
    for (const row of omens) {
      expect(row.id, row.id).not.toMatch(/catalog_/);
      expect(row.name, row.id).not.toMatch(/闲术/);
      expect(row.name.length, row.id).toBeGreaterThanOrEqual(2);
      expect(row.body.length, row.id).toBeGreaterThanOrEqual(4);
      expect(row.options.length, row.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("meets endless playable spirit floor", () => {
    expect(loadTables().spirits.length).toBeGreaterThanOrEqual(240);
  });

  it("covers eight affinities, filled realms, and four real arts per spirit", () => {
    const tables = loadTables();
    expect([...new Set(tables.arts.map((row) => row.affinity))].sort()).toEqual([
      "bolt",
      "flame",
      "frost",
      "light",
      "shade",
      "stone",
      "tide",
      "wood",
    ]);
    for (const realm of tables.realms) {
      expect(realm.spiritIds.length, realm.id).toBeGreaterThan(0);
    }
    const artIds = new Set(tables.arts.map((row) => row.id));
    for (const spirit of tables.spirits) {
      expect(spirit.artIds).toHaveLength(4);
      for (const id of spirit.artIds) {
        expect(artIds.has(id), `${spirit.id}:${id}`).toBe(true);
      }
    }
  });
});

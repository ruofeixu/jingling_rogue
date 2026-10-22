import { describe, expect, it } from "vitest";
import { SEAL_TIERS } from "../catch/seal.ts";
import { ICON_IDS, iconFill, itemIcon, sealIcon } from "./item-icon.ts";
import { THEME } from "./theme.ts";

describe("item icons", () => {
  it("maps 镇物 tiers, 小药, and 契印 kinds to distinct glyphs", () => {
    expect(itemIcon("potion")).toBe("potion");
    expect(itemIcon("candy")).toBe("candy");
    expect(itemIcon("gold")).toBe("gold");
    expect(sealIcon("fan")).toBe("seal-fan");
    expect(SEAL_TIERS.map((row) => sealIcon(row.id))).toEqual([
      "seal-fan",
      "seal-shang",
      "seal-te",
      "seal-qi",
      "seal-jie",
    ]);
    expect(new Set(SEAL_TIERS.map((row) => sealIcon(row.id))).size).toBe(5);
    expect(itemIcon("atk")).toBe("atk");
    expect(itemIcon("sealPack")).toBe("seal-fan");
    expect(itemIcon("unknown-kind")).toBe("charm");
  });

  it("gives every icon a fill dark enough to read on paper", () => {
    expect(ICON_IDS).toContain("gold");
    expect(iconFill("gold")).toEqual(THEME.accent);
    for (const id of ICON_IDS) {
      const fill = iconFill(id);
      expect(fill).toHaveLength(3);
      expect(fill.reduce((sum, n) => sum + n, 0)).toBeLessThan(
        THEME.paper.reduce((sum, n) => sum + n, 0),
      );
    }
  });
});

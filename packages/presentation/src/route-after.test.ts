import { describe, expect, it } from "vitest";
import { routeAfterCommand } from "./route-after.ts";

describe("routeAfterCommand", () => {
  it("sends mode selection to the starter screen", () => {
    expect(routeAfterCommand({ command: "select-mode", phase: "none", current: "mode" })).toBe("starter");
  });

  it("opens party and bag overlays without leaving a live battle", () => {
    expect(routeAfterCommand({ command: "battle.party", phase: "battle", current: "battle" })).toBe("party");
    expect(routeAfterCommand({ command: "battle.bag", phase: "battle", current: "battle" })).toBe("bag");
  });

  it("stays on the battle screen when an art is used and the fight continues", () => {
    expect(routeAfterCommand({ command: "battle.art", phase: "battle", current: "battle" })).toBe("battle");
  });

  it("keeps an overlay open while the fight is still in battle", () => {
    expect(routeAfterCommand({ command: "arts.pick", phase: "battle", current: "arts" })).toBe("arts");
  });

  it("follows the phase once the fight leaves battle", () => {
    expect(routeAfterCommand({ command: "arts.confirm", phase: "boon", current: "arts" })).toBe("summary");
    expect(routeAfterCommand({ command: "shop.buy", phase: "boon", current: "shop" })).toBe("shop");
    expect(routeAfterCommand({ command: "summary.continue", phase: "map", current: "summary" })).toBe("map");
    expect(routeAfterCommand({ command: "map.enter", phase: "victory", current: "map" })).toBe("victory");
    expect(routeAfterCommand({ command: "battle.flee", phase: "defeat", current: "battle" })).toBe("defeat");
  });

  it("returns to the title when the outcome sends the player to the lobby", () => {
    expect(routeAfterCommand({ command: "outcome.lobby", phase: "victory", current: "victory" })).toBe("title");
  });

  it("returns from an overlay to the live fight", () => {
    expect(routeAfterCommand({ command: "overlay.cancel", phase: "battle", current: "arts" })).toBe("battle");
    expect(routeAfterCommand({ command: "overlay.cancel", phase: "catch", current: "catch" })).toBe("catch");
  });
});

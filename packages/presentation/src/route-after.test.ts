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

  it("opens the arts overlay from the battle command instead of using an art blindly (B3 #6)", () => {
    expect(routeAfterCommand({ command: "battle.art", phase: "battle", current: "battle" })).toBe("arts");
  });

  it("returns to the battle once a picked art resolves the turn", () => {
    expect(
      routeAfterCommand({ command: "arts.confirm", phase: "battle", current: "arts", waitingFor: "command" }),
    ).toBe("battle");
  });

  it("goes to the target screen when the art needs a target (B3 #3)", () => {
    expect(
      routeAfterCommand({ command: "arts.confirm", phase: "battle", current: "arts", waitingFor: "target" }),
    ).toBe("target");
    expect(
      routeAfterCommand({ command: "target.confirm", phase: "battle", current: "target", waitingFor: "command" }),
    ).toBe("battle");
  });

  it("forces the switch screen when the active fighter falls", () => {
    expect(
      routeAfterCommand({ command: "arts.confirm", phase: "battle", current: "arts", waitingFor: "switch" }),
    ).toBe("switch");
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

  it("leaves the catch screen once the catch is resolved", () => {
    expect(routeAfterCommand({ command: "catch.confirm", phase: "boon", current: "catch" })).toBe("summary");
    expect(routeAfterCommand({ command: "catch.skip", phase: "boon", current: "catch" })).toBe("summary");
    expect(routeAfterCommand({ command: "catch.confirm", phase: "catch", current: "catch" })).toBe("catch");
  });

  it("enters the battle after a save is loaded, and stays put when it was not (B4)", () => {
    expect(routeAfterCommand({ command: "slots.load", phase: "battle", current: "slots" })).toBe("battle");
    expect(routeAfterCommand({ command: "slots.load", phase: "none", current: "slots" })).toBe("slots");
  });

  it("opens a codex entry and returns to the list", () => {
    expect(routeAfterCommand({ command: "codex-list.open-entry", phase: "none", current: "codex-list" })).toBe(
      "codex-entry",
    );
    expect(routeAfterCommand({ command: "codex-entry.back", phase: "none", current: "codex-entry" })).toBe("codex-list");
  });

  it("returns from an overlay to the live fight", () => {
    expect(routeAfterCommand({ command: "overlay.cancel", phase: "battle", current: "arts" })).toBe("battle");
    expect(routeAfterCommand({ command: "overlay.cancel", phase: "catch", current: "catch" })).toBe("catch");
  });
});

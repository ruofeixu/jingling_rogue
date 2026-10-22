import { describe, expect, it } from "vitest";
import { LOBBY_SCREENS, RUN_SCREENS, START_PATH } from "./screens.ts";

describe("section 12 screens", () => {
  it("lists every lobby and run screen", () => {
    expect(LOBBY_SCREENS).toEqual([
      "title",
      "mode",
      "settings",
      "codex",
      "eggs",
      "achievements",
      "stats",
      "slots",
    ]);
    expect(RUN_SCREENS).toEqual([
      "starter",
      "battle",
      "summary",
      "party",
      "bag",
      "shop",
      "map",
      "omen",
      "defeat",
      "victory",
      "hatch",
    ]);
    expect(START_PATH).toEqual(["title", "mode", "starter"]);
    expect(START_PATH).toHaveLength(3);
  });
});

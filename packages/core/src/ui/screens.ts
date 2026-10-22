export const LOBBY_SCREENS = [
  "title",
  "mode",
  "settings",
  "codex",
  "eggs",
  "achievements",
  "stats",
  "slots",
] as const;

export const RUN_SCREENS = [
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
] as const;

export const START_PATH = ["title", "mode", "starter"] as const;

export type LobbyScreen = (typeof LOBBY_SCREENS)[number];
export type RunScreen = (typeof RUN_SCREENS)[number];

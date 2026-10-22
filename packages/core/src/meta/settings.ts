export const SETTINGS_TABS = ["general", "display", "audio", "play", "controls"] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export interface GameSettings {
  general: { skipSeenDialog: boolean };
  display: { showGold: boolean; showDamage: boolean };
  audio: { music: number; sfx: number };
  play: { battleSpeed: 1 | 2 | 3 };
  controls: { layout: "touch" | "keys" };
}

export function defaultSettings(): GameSettings {
  return {
    general: { skipSeenDialog: false },
    display: { showGold: true, showDamage: true },
    audio: { music: 1, sfx: 1 },
    play: { battleSpeed: 1 },
    controls: { layout: "touch" },
  };
}

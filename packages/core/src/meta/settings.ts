export const SETTINGS_TABS = ["general", "display", "audio", "play", "controls"] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export interface GameSettings {
  general: { skipSeenDialog: boolean };
  display: { showGold: boolean; showDamage: boolean; reduceMotion: boolean };
  audio: { music: number; sfx: number };
  play: { battleSpeed: 1 | 2 | 3 };
  controls: { layout: "touch" | "keys" };
}

export function defaultSettings(): GameSettings {
  return {
    general: { skipSeenDialog: false },
    display: { showGold: true, showDamage: true, reduceMotion: false },
    audio: { music: 1, sfx: 1 },
    play: { battleSpeed: 1 },
    controls: { layout: "touch" },
  };
}

/** 点一次改一项。未知键忽略。 */
export function toggleSetting(settings: GameSettings, key: string): boolean {
  switch (key) {
    case "skipSeenDialog":
      settings.general.skipSeenDialog = !settings.general.skipSeenDialog;
      return true;
    case "showGold":
      settings.display.showGold = !settings.display.showGold;
      return true;
    case "showDamage":
      settings.display.showDamage = !settings.display.showDamage;
      return true;
    case "reduceMotion":
      settings.display.reduceMotion = !settings.display.reduceMotion;
      return true;
    case "music":
      settings.audio.music = (settings.audio.music + 1) % 4;
      return true;
    case "sfx":
      settings.audio.sfx = (settings.audio.sfx + 1) % 4;
      return true;
    case "battleSpeed":
      settings.play.battleSpeed = (((settings.play.battleSpeed % 3) + 1) as 1 | 2 | 3);
      return true;
    case "layout":
      settings.controls.layout = settings.controls.layout === "touch" ? "keys" : "touch";
      return true;
    default:
      return false;
  }
}

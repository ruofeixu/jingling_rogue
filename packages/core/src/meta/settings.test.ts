import { describe, expect, it } from "vitest";
import { defaultSettings, SETTINGS_TABS, toggleSetting } from "./settings.ts";

describe("settings", () => {
  it("exposes five tabs with battle speed and gold/damage toggles", () => {
    expect(SETTINGS_TABS).toEqual(["general", "display", "audio", "play", "controls"]);
    const settings = defaultSettings();
    expect(settings.general.skipSeenDialog).toBe(false);
    expect(settings.display.showGold).toBe(true);
    expect(settings.display.showDamage).toBe(true);
    expect(settings.display.reduceMotion).toBe(false);
    expect(settings.audio.music).toBe(1);
    expect(settings.play.battleSpeed).toBe(1);
    expect(settings.controls.layout).toBe("touch");
  });

  it("cycles each known toggle without touching unknown keys", () => {
    const settings = defaultSettings();

    expect(toggleSetting(settings, "skipSeenDialog")).toBe(true);
    expect(settings.general.skipSeenDialog).toBe(true);
    expect(toggleSetting(settings, "showGold")).toBe(true);
    expect(settings.display.showGold).toBe(false);
    expect(toggleSetting(settings, "reduceMotion")).toBe(true);
    expect(settings.display.reduceMotion).toBe(true);
    expect(toggleSetting(settings, "battleSpeed")).toBe(true);
    expect(settings.play.battleSpeed).toBe(2);
    expect(toggleSetting(settings, "layout")).toBe(true);
    expect(settings.controls.layout).toBe("keys");
    expect(toggleSetting(settings, "nope")).toBe(false);
  });
});

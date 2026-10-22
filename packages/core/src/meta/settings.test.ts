import { describe, expect, it } from "vitest";
import { defaultSettings, SETTINGS_TABS } from "./settings.ts";

describe("settings", () => {
  it("exposes five tabs with battle speed and gold/damage toggles", () => {
    expect(SETTINGS_TABS).toEqual(["general", "display", "audio", "play", "controls"]);
    const settings = defaultSettings();
    expect(settings.general.skipSeenDialog).toBe(false);
    expect(settings.display.showGold).toBe(true);
    expect(settings.display.showDamage).toBe(true);
    expect(settings.audio.music).toBe(1);
    expect(settings.play.battleSpeed).toBe(1);
    expect(settings.controls.layout).toBe("touch");
  });
});

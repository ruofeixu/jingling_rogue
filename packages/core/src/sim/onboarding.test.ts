import { describe, expect, it } from "vitest";
import { runSim } from "./run-sim.ts";
import { measureGuideTaps } from "./onboarding.ts";
import { getSpirit } from "../tables/load-tables.ts";
import { PreviewApp } from "../ui/preview-app.ts";

describe("onboarding guide", () => {
  it("keeps a first-art and potion guide alive for ten waves", () => {
    const seeds = Array.from({ length: 12 }, (_, i) => `onboard-${i}`);
    const lived = seeds.filter(
      (seed) => runSim({ seed, tier: "guide", maxWaves: 10, maxActions: 800 }).reason !== "defeat",
    ).length;
    expect(lived / seeds.length).toBeGreaterThanOrEqual(0.8);
  });

  it("keeps dead taps under five percent on the guide path", () => {
    const seeds = Array.from({ length: 12 }, (_, i) => `onboard-${i}`);
    const total = seeds.reduce(
      (acc, seed) => {
        const row = measureGuideTaps({ seed, maxWaves: 10 });
        return { taps: acc.taps + row.taps, dead: acc.dead + row.dead };
      },
      { taps: 0, dead: 0 },
    );
    expect(total.taps).toBeGreaterThan(10);
    expect(total.dead / total.taps).toBeLessThan(0.05);
  });

  it("shows harvest then 再来一局 returns to title", () => {
    const app = new PreviewApp({ seed: "guide-harvest" });
    app.tap("新的旅途");
    app.tap("经典");
    app.tap(getSpirit("zao_li").name);
    app.slice?.noteLoss();
    app.refresh();
    expect(app.log).toMatch(/见/);
    expect(app.log).toMatch(/收/);
    app.tap("再来一局");
    expect(app.screen).toBe("title");
  });
});

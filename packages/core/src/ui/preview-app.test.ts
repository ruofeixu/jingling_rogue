import { describe, expect, it } from "vitest";
import { getArt, getSpirit } from "../tables/load-tables.ts";
import { addCandy } from "../meta/candy.ts";
import { GLOSSARY } from "./copy.ts";
import { PreviewApp, beginUiRun, runUiSmoke, walkPlayableUi } from "./preview-app.ts";

function fingerprint(app: PreviewApp): string {
  return JSON.stringify({
    screen: app.screen,
    title: app.title,
    log: app.log,
    tab: app.settingsTab,
    slot: app.slot,
    relicId: app.relicId,
    art: app.codexArt,
    codex: app.codexId,
    page: app.codexPage,
    wave: app.slice?.run.wave ?? 0,
    sprint: app.slice?.run.sprint ?? false,
    relics: app.slice?.run.relicIds ?? [],
    waiting: app.battle?.waitingFor ?? null,
    eggs: app.account.eggs.length,
    gold: app.account.settings.display.showGold,
    damage: app.account.settings.display.showDamage,
    skip: app.account.settings.general.skipSeenDialog,
    speed: app.account.settings.play.battleSpeed,
    layout: app.account.settings.controls.layout,
  });
}

describe("preview UI taps", () => {
  it("starts a sprint after tapping a starter even if no 契印 was clicked", () => {
    const app = new PreviewApp({ seed: "ui-sprint" });
    app.tap("新的旅途");
    app.tap("短征");
    expect(app.screen).toBe("starter");
    app.tap(getSpirit("zao_li").name);
    expect(app.screen).toBe("battle");
    expect(app.slice?.run.sprint).toBe(true);
    expect(app.slice?.run.starterId).toBe("zao_li");
    expect(app.slice?.run.relicIds.length).toBeGreaterThan(0);
    expect(app.battle?.waitingFor).toBe("command");
  });

  it("changes the log on command path taps and names illegal taps", () => {
    const app = new PreviewApp({ seed: "ui-q1" });
    app.tap("新的旅途");
    app.tap("短征");
    app.tap(getSpirit("zao_li").name);
    const opened = app.log;
    app.tap("术签");
    expect(app.screen).toBe("arts");
    expect(app.log).not.toBe(opened);
    app.tap("返回");
    expect(app.screen).toBe("battle");
    app.tap("队伍");
    expect(app.screen).toBe("switch");
    expect(app.log).toMatch(/换/);
    app.tap("返回");
    app.tap("囊");
    expect(app.screen).toBe("bag");
    expect(app.log.length).toBeGreaterThan(0);
    app.tap("返回");
    const beforeMiss = app.log;
    app.tap("空地");
    expect(app.log).not.toBe(beforeMiss);
    expect(app.log).toMatch(/空/);
    expect(app.log).toMatch(/术/);
    app.tap("术签");
    app.tap("空地");
    expect(app.log).toMatch(/术签/);
    app.tap("返回");
    if (app.battle) {
      app.battle.active.hp = Math.floor(app.battle.active.maxHp * 0.3);
    }
    app.tap("术签");
    app.tap("返回");
    expect(app.log).toMatch(/囊/);
    app.tap("术签");
    const spent = getArt(app.battle?.active.artIds[0] ?? "cinder_claw");
    if (app.battle) {
      app.battle.active.focusLeft[spent.id] = 0;
    }
    const waiting = app.battle?.waitingFor;
    app.tap(spent.name);
    expect(app.log).toMatch(/灵力已尽/);
    expect(app.battle?.waitingFor).toBe(waiting);
  });

  it("lets every visible control change state on the lobby-to-sprint path", () => {
    const app = new PreviewApp({ seed: "ui-walk" });
    const seen = new Set<string>();
    const visit = (label: string) => {
      const before = fingerprint(app);
      const key = `${app.screen}:${label}`;
      app.tap(label);
      seen.add(key);
      expect(fingerprint(app), key).not.toBe(before);
    };

    visit("设置");
    visit("跳过已见·关");
    visit("显示");
    visit("金钱·开");
    visit("伤害数字·开");
    visit("音频");
    visit("玩法");
    visit("触控");
    visit("返回");

    visit("契录");
    visit(getSpirit("zao_li").name);
    expect(app.log).toMatch(/体36/);
    expect(app.labels()).toEqual(expect.arrayContaining(["卡通", "年画", "返回"]));
    visit("年画");
    expect(app.log).toMatch(/立绘·年画/);
    visit("返回");
    visit("下一页");
    visit(getSpirit("zhen_yue").name);
    expect(app.log).toMatch(/魂契/);
    expect(app.log).not.toMatch(/立绘/);
    expect(app.labels()).toContain("返回");
    expect(app.labels()).not.toContain("年画");
    expect(app.labels()).not.toContain("卡通");
    visit("返回");
    visit("返回");
    visit("卵房");
    visit("兑孵券");
    visit("返回");
    visit("成就");
    visit("返回");
    visit("统计");
    visit("返回");
    visit("存档");
    visit("槽2");
    visit("返回");
    visit("名词");
    visit(GLOSSARY[1]?.term ?? "精怪");
    visit("返回");

    visit("新的旅途");
    visit("经典");
    visit("返回");
    visit("短征");
    visit(getSpirit("jing_zhu").name);

    visit("术签");
    visit("返回");
    visit("队伍");
    visit("返回");
    visit("囊");
    visit("返回");
    visit("术");

    expect(seen.size).toBeGreaterThan(20);
    expect(app.screen).toBe("battle");
  });

  it("opens a battle from every mode button including 短征", () => {
    const names = ["短征", "经典", "今日试炼", "无尽长夜", "长夜·合体", "苛令"];
    for (const label of names) {
      const app = new PreviewApp({ seed: `ui-${label}` });
      app.tap("新的旅途");
      app.tap(label);
      app.tap(getSpirit("zao_li").name);
      expect(app.screen, label).toBe("battle");
      expect(app.slice).toBeTruthy();
    }
  });

  it("enters a sprint battle from every starter without clicking a 契印", () => {
    for (const id of ["zao_li", "jing_zhu", "tao_geng"]) {
      const app = new PreviewApp({ seed: `sprint-all-${id}` });
      app.tap("新的旅途");
      app.tap("短征");
      app.tap(getSpirit(id).name);
      expect(app.screen, id).toBe("battle");
      expect(app.slice?.run.sprint).toBe(true);
      expect(app.slice?.run.starterId).toBe(id);
      expect(app.slice?.encounter).toBeTruthy();
      expect(app.battle?.waitingFor).toBe("command");
    }
  });

  it("shows seen and caught harvest on defeat then returns to title", () => {
    const app = new PreviewApp({ seed: "ui-harvest" });
    app.tap("新的旅途");
    app.tap("经典");
    app.tap(getSpirit("zao_li").name);
    app.slice?.noteLoss();
    app.refresh();
    expect(app.screen).toBe("defeat");
    expect(app.log).toMatch(/见/);
    expect(app.log).toMatch(/收/);
    expect(app.labels()).toContain("再来一局");
    app.tap("再来一局");
    expect(app.screen).toBe("title");
  });

  it("returns to the title from an in-run battle", () => {
    const app = new PreviewApp({ seed: "ui-quit" });
    app.tap("新的旅途");
    app.tap("短征");
    app.tap(getSpirit("zao_li").name);
    expect(app.screen).toBe("battle");
    expect(app.labels()).toContain("回厅");
    app.tap("回厅");
    expect(app.screen).toBe("title");
    expect(app.slice).toBeNull();
    expect(app.battle).toBeNull();
  });

  it("lists unseen spirits in the lobby 契录 and hides missing cartoon art", () => {
    const app = new PreviewApp({ seed: "ui-codex" });
    expect(app.account.codex).toHaveLength(0);
    app.tap("契录");
    expect(app.labels()).toContain(getSpirit("zao_li").name);
    expect(app.labels()).toContain(getSpirit("dan_li").name);
    expect(app.labels().filter((label) => !["下一页", "上一页", "返回"].includes(label))).toHaveLength(16);
    expect(app.labels()).toContain("下一页");
    app.tap(getSpirit("zao_li").name);
    expect(app.log).toMatch(/魂契/);
    expect(app.labels()).toContain("卡通");
    app.tap("返回");
    app.tap(getSpirit("dan_li").name);
    expect(app.labels()).toContain("卡通");
    app.tap("返回");
    app.tap(getSpirit("huo_de_li").name);
    expect(app.labels()).toContain("卡通");
    app.tap("返回");
    app.tap(getSpirit("luan_shi").name);
    expect(app.labels()).toContain("卡通");
    app.tap("返回");
    app.tap(getSpirit("zhang_yan").name);
    expect(app.labels()).toContain("卡通");
    app.tap("返回");
    app.tap(getSpirit("shuang_ming").name);
    expect(app.labels()).toContain("卡通");
    app.tap("返回");
    app.tap("下一页");
    app.tap(getSpirit("ping_yu").name);
    expect(app.labels()).toContain("卡通");
    expect(app.labels()).toContain("年画");
    app.tap("返回");
    app.tap(getSpirit("zhen_yue").name);
    expect(app.labels()).not.toContain("卡通");
    expect(app.labels()).not.toContain("年画");
  });

  it("shows seen and caught harvest on sprint victory", () => {
    const app = new PreviewApp({ seed: "ui-harvest-win" });
    app.tap("新的旅途");
    app.tap("短征");
    app.tap(getSpirit("zao_li").name);
    app.skipTo(20);
    app.slice?.noteWin();
    app.refresh();
    expect(app.screen).toBe("victory");
    expect(app.log).toMatch(/见/);
    expect(app.log).toMatch(/收/);
  });

  it("starts a sprint through beginUiRun even with an empty relicId", () => {
    for (const id of ["zao_li", "jing_zhu", "tao_geng"]) {
      const slice = beginUiRun({ seed: `boot-${id}`, starterId: id, sprint: true, relicId: "" });
      expect(slice.run.sprint, id).toBe(true);
      expect(slice.encounter, id).toBeTruthy();
      expect(slice.phase, id).toBe("battle");
    }
  });
});

describe("UI smoke", () => {
  it("walks lobby, every mode, battle, catch, shop, omen, hatch, and 再来一局", () => {
    const report = runUiSmoke("ui-smoke");
    expect(report.taps.length).toBeGreaterThan(40);
    expect(report.screens).toEqual(
      expect.arrayContaining([
        "title",
        "mode",
        "starter",
        "settings",
        "codex",
        "eggs",
        "achievements",
        "stats",
        "slots",
        "glossary",
        "battle",
        "arts",
        "switch",
        "bag",
        "shop",
        "catch",
        "omen",
        "hatch",
        "summary",
        "defeat",
        "victory",
        "map",
      ]),
    );
  });

  it("spends candy on the starter screen for pact then a species egg", () => {
    const app = new PreviewApp({ seed: "ui-candy" });
    addCandy(app.account, "zao_li", 40);
    app.tap("新的旅途");
    app.tap("经典");
    app.tap("灵糖·专卵");
    expect(app.account.eggs).toHaveLength(0);
    app.tap("灵糖·魂契");
    expect(app.account.secondPact).toContain("zao_li");
    app.tap("灵糖·专卵");
    expect(app.account.eggs.some((egg) => egg.spiritId === "zao_li")).toBe(true);
  });

  it("taps every lobby, mode, starter, and in-run control without throwing", () => {
    const report = walkPlayableUi("ui-all-ops");
    expect(report.battles).toBe(18);
    expect(report.taps.length).toBeGreaterThan(10);
    expect(report.dead, `dead=${String(report.dead)} taps=${report.taps.length}`).toBeGreaterThanOrEqual(0);
    expect(report.dead / report.taps.length).toBeLessThan(0.05);
    expect(report.taps).toEqual(
      expect.arrayContaining([
        "新的旅途",
        "短征",
        getSpirit("zao_li").name,
        getSpirit("jing_zhu").name,
        getSpirit("tao_geng").name,
        "术",
        "术签",
        "队伍",
        "囊",
        "走",
        "镇物",
        "再来一局",
      ]),
    );
    expect(report.screens).toEqual(
      expect.arrayContaining(["title", "mode", "starter", "battle", "arts", "switch", "bag"]),
    );
  });
});

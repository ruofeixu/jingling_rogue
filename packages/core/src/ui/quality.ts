import { startPartyBattle } from "../combat/party-battle.ts";
import { getSpirit, loadTables } from "../tables/load-tables.ts";
import { PreviewApp } from "./preview-app.ts";

export type WaitKind = "command" | "switch" | "target" | "catch" | "shop" | "map" | "omen";

export interface WaitProbe {
  wait: WaitKind;
  labels: string[];
  changed: boolean;
}

function snap(app: PreviewApp): string {
  return JSON.stringify({
    screen: app.screen,
    log: app.log,
    waiting: app.battle?.waitingFor ?? null,
    hp: app.battle?.party.map((unit) => unit.hp) ?? [],
    gold: app.slice?.run.gold ?? 0,
  });
}

function startSprint(seed: string): PreviewApp {
  const app = new PreviewApp({ seed });
  app.tap("新的旅途");
  app.tap("短征");
  app.tap(getSpirit("zao_li").name);
  return app;
}

function probeTap(app: PreviewApp, label: string): WaitProbe["changed"] {
  const before = snap(app);
  app.tap(label);
  return snap(app) !== before;
}

function attachBattle(app: PreviewApp, battle: ReturnType<typeof startPartyBattle>): void {
  app.battle = battle;
  app.refresh();
}

export function probeWaitingUi(seed: string): WaitProbe[] {
  const command = startSprint(`${seed}-command`);
  const commandLabel = command.labels().includes("术") ? "术" : command.labels()[0] ?? "";
  const commandProbe: WaitProbe = {
    wait: "command",
    labels: command.labels(),
    changed: commandLabel ? probeTap(command, commandLabel) : false,
  };

  const catchApp = startSprint(`${seed}-catch`);
  if (catchApp.battle) {
    for (const foe of catchApp.battle.foes) {
      foe.hp = 1;
    }
  }
  for (let i = 0; i < 8 && catchApp.screen === "battle"; i += 1) {
    catchApp.tap("术");
  }
  const catchLabel = catchApp.labels().includes("放过") ? "放过" : catchApp.labels()[0] ?? "";
  const catchProbe: WaitProbe = {
    wait: "catch",
    labels: catchApp.labels(),
    changed: catchApp.screen === "catch" && catchLabel ? probeTap(catchApp, catchLabel) : false,
  };

  const shop = startSprint(`${seed}-shop`);
  shop.tap("走");
  if (shop.screen === "catch") {
    shop.tap("放过");
  }
  const shopLabel = shop.labels().includes("再择") ? "再择" : shop.labels()[0] ?? "";
  const shopProbe: WaitProbe = {
    wait: "shop",
    labels: shop.labels(),
    changed: shop.screen === "shop" && shopLabel ? probeTap(shop, shopLabel) : false,
  };

  const omen = startSprint(`${seed}-omen`);
  omen.tap("走");
  if (omen.screen === "catch") {
    omen.tap("放过");
  }
  if (omen.screen === "shop" && omen.labels().includes("奇遇")) {
    omen.tap("奇遇");
  }
  const omenLabel = omen.labels()[0] ?? "";
  const omenProbe: WaitProbe = {
    wait: "omen",
    labels: omen.labels(),
    changed: omen.screen === "omen" && omenLabel ? probeTap(omen, omenLabel) : false,
  };

  const switchApp = startSprint(`${seed}-switch`);
  const switchBattle = startPartyBattle({
    partyIds: ["zao_li", "jing_zhu"],
    foeId: "tao_geng",
    level: 20,
    seed: `${seed}-switch-b`,
    kind: "wild",
    playerHpOverride: 1,
    foeAtkOverride: 80,
    playerDefOverride: 1,
  });
  switchBattle.choose({ type: "art", artId: "ash_veil" });
  attachBattle(switchApp, switchBattle);
  const switchLabel = switchApp.labels().find((label) => label !== "返回") ?? "";
  const switchProbe: WaitProbe = {
    wait: "switch",
    labels: switchApp.labels(),
    changed: switchApp.screen === "switch" && switchLabel ? probeTap(switchApp, switchLabel) : false,
  };

  const targetApp = startSprint(`${seed}-target`);
  const targetBattle = startPartyBattle({
    partyIds: ["zao_li"],
    foeId: "jing_zhu",
    foeIds: ["jing_zhu", "tao_geng"],
    level: 5,
    seed: `${seed}-target-b`,
    kind: "wild",
    foeAtkOverride: 1,
  });
  targetBattle.choose({ type: "art", artId: targetBattle.active.artIds[0] ?? "cinder_claw" });
  attachBattle(targetApp, targetBattle);
  const targetLabel = targetApp.labels()[0] ?? "";
  const targetProbe: WaitProbe = {
    wait: "target",
    labels: targetApp.labels(),
    changed: targetApp.screen === "target" && targetLabel ? probeTap(targetApp, targetLabel) : false,
  };

  const map = startSprint(`${seed}-map`);
  if (map.slice) {
    map.slice.run.hasMap = true;
    map.slice.phase = "map";
    map.slice.realmChoices = ["wilds", "woods"];
  }
  map.refresh();
  const realmName = loadTables().realms.find((row) => row.id === "wilds")?.name ?? map.labels()[0] ?? "";
  const mapLabel = map.labels().includes(realmName) ? realmName : map.labels()[0] ?? "";
  const mapProbe: WaitProbe = {
    wait: "map",
    labels: map.labels(),
    changed: map.screen === "map" && mapLabel ? probeTap(map, mapLabel) : false,
  };

  return [commandProbe, switchProbe, targetProbe, catchProbe, shopProbe, mapProbe, omenProbe];
}

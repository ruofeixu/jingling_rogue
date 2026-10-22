import type { Node } from "cc";
import {
  GLOSSARY,
  SETTINGS_TABS,
  CODEX_PAGE_SIZE,
  formatCodexLog,
  formatCodexSheet,
  getSpirit,
  hasCartoonPortrait,
  hasPortrait,
  listCodexSpirits,
  hatchEgg,
  hatchReady,
  listAchievements,
  redeemVoucher,
  skipEggSteps,
  statsLog,
  useEggMachine,
  utcDateStamp,
  codexCell,
  type AccountProgress,
  type GameSettings,
  type ItemIconId,
  type ScreenLayout,
  type SettingsTab,
} from "../vendor/jinglingCore";
import { paintPortrait, paintSplash, paintWindow, addText, INK } from "./paint";
import { makeCodexThumb, makeHelpButton } from "./kit";

export interface LobbyHost {
  canvas: Node | null;
  extra: Node[];
  ui: ScreenLayout;
  account: AccountProgress;
  settingsTab: SettingsTab;
  slot: number;
  setLog(text: string): void;
  setTitle(text: string): void;
  clearExtra(): void;
  button(text: string, x: number, y: number, onClick: () => void, width?: number, height?: number, icon?: ItemIconId, accent?: boolean): Node;
  persist(): void;
  showTitle(): void;
  showModePick(): void;
  showSettings(): void;
  showCodex(): void;
  showEggRoom(): void;
  showAchievements(): void;
  showStats(): void;
  showSlots(): void;
  loadSlot(slot: number): void;
  showGlossary(back?: () => void): void;
  codexPage: number;
  codexId: string | null;
  codexArt: "folk" | "cartoon";
}

export function showTitle(host: LobbyHost): void {
  host.clearExtra();
  host.setTitle("契灵志怪");
  host.setLog("点「名词」看专有词。择一契灵，入世历劫。");
  if (!host.canvas) {
    return;
  }
  const lobby = host.ui.lobby;
  host.extra.push(paintSplash(host.canvas, lobby.splashY));
  host.extra.push(paintWindow(host.canvas, "menu", lobby.menu.x, lobby.menu.y, lobby.menu.width, lobby.menu.height, 16));
  addHelp(host, () => host.showTitle());
  const items: [string, () => void, ItemIconId, boolean?][] = [
    ["新的旅途", () => host.showModePick(), "map", true],
    ["设置", () => host.showSettings(), "charm"],
    ["契录", () => host.showCodex(), "seal-fan"],
    ["卵房", () => host.showEggRoom(), "egg"],
    ["成就", () => host.showAchievements(), "exp"],
    ["统计", () => host.showStats(), "gold"],
    ["存档", () => host.showSlots(), "catch"],
    ["名词", () => host.showGlossary(() => host.showTitle()), "lure"],
  ];
  items.forEach(([label, action, icon, accent], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    host.extra.push(
      host.button(label, (col - 0.5) * lobby.itemDx, lobby.itemY0 - row * lobby.itemGap, action, undefined, undefined, icon, accent === true),
    );
  });
}

export function showSettings(host: LobbyHost): void {
  host.clearExtra();
  host.setTitle("设置");
  host.setLog("显示金钱与伤害数字。");
  const lobby = host.ui.lobby;
  if (host.canvas) {
    host.extra.push(paintWindow(host.canvas, "settings", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
  }
  addHelp(host, () => host.showSettings());
  SETTINGS_TABS.forEach((tab, index) => {
    const names: Record<SettingsTab, string> = {
      general: "通用",
      display: "显示",
      audio: "音频",
      play: "玩法",
      controls: "触控",
    };
    host.extra.push(
      host.button(names[tab], (index - 2) * lobby.tabDx, lobby.itemY0, () => {
        host.settingsTab = tab;
        host.showSettings();
      }, lobby.tabW, lobby.buttonH, undefined, tab === host.settingsTab),
    );
  });
  const settings = host.account.settings;
  const toggleY = lobby.itemY0 - lobby.itemGap;
  if (host.settingsTab === "general") {
    host.extra.push(
        host.button(settings.general.skipSeenDialog ? "跳过已见·开" : "跳过已见·关", 0, toggleY, () => {
        settings.general.skipSeenDialog = !settings.general.skipSeenDialog;
        host.persist();
        host.showSettings();
      }),
    );
  }
  if (host.settingsTab === "display") {
    host.extra.push(
      host.button(settings.display.showGold ? "金钱·开" : "金钱·关", -lobby.shopDx, toggleY, () => {
        settings.display.showGold = !settings.display.showGold;
        host.persist();
        host.showSettings();
      }),
    );
    host.extra.push(
      host.button(settings.display.showDamage ? "伤害数字·开" : "伤害数字·关", lobby.shopDx, toggleY, () => {
        settings.display.showDamage = !settings.display.showDamage;
        host.persist();
        host.showSettings();
      }),
    );
  }
  if (host.settingsTab === "audio") {
    host.setLog(`乐 ${settings.audio.music}  效 ${settings.audio.sfx}`);
    host.extra.push(
      host.button(`乐 ${settings.audio.music}`, -lobby.shopDx, toggleY, () => {
        settings.audio.music = (settings.audio.music + 1) % 4;
        host.persist();
        host.showSettings();
      }),
    );
    host.extra.push(
      host.button(`效 ${settings.audio.sfx}`, lobby.shopDx, toggleY, () => {
        settings.audio.sfx = (settings.audio.sfx + 1) % 4;
        host.persist();
        host.showSettings();
      }),
    );
  }
  if (host.settingsTab === "play") {
    host.extra.push(
      host.button(`倍速 ${settings.play.battleSpeed}`, 0, toggleY, () => {
        const next = (settings.play.battleSpeed % 3) + 1;
        settings.play.battleSpeed = next as GameSettings["play"]["battleSpeed"];
        host.persist();
        host.showSettings();
      }),
    );
  }
  if (host.settingsTab === "controls") {
    host.extra.push(
        host.button(settings.controls.layout === "touch" ? "布局·触控" : "布局·键位", 0, toggleY, () => {
        settings.controls.layout = settings.controls.layout === "touch" ? "keys" : "touch";
        host.persist();
        host.showSettings();
      }),
    );
  }
  host.extra.push(host.button("返回", 0, lobby.backY, () => host.showTitle()));
}

export function showCodex(host: LobbyHost): void {
  host.clearExtra();
  const lobby = host.ui.lobby;
  const grid = host.ui.codex;
  addHelp(host, () => host.showCodex());
  if (host.codexId) {
    const spirit = getSpirit(host.codexId);
    const sheet = formatCodexSheet(host.codexId);
    const grid = host.ui.codex;
    host.setTitle(spirit.name);
    host.setLog(formatCodexLog(host.codexId));
    if (host.canvas) {
      host.extra.push(
        paintPortrait(
          host.canvas,
          spirit.name,
          spirit.affinities[0],
          0,
          grid.entryY,
          grid.entryW,
          grid.entryH,
          false,
          spirit.id,
          host.codexArt,
        ),
      );
      host.extra.push(paintWindow(host.canvas, "codex-sheet", 0, grid.sheetY, grid.sheetW, grid.sheetH, 16));
      const body = [sheet.headline, sheet.stats, sheet.pact, sheet.arts, sheet.evo].filter((line) => line.length > 0).join("\n");
      host.extra.push(
        addText(host.canvas, "codex-body", body, 0, grid.sheetY, grid.sheetW - 40, 24, INK, {
          wrap: true,
          height: grid.sheetH - 24,
        }),
      );
    }
    if (hasCartoonPortrait(host.codexId)) {
      host.extra.push(
        host.button("卡通", -lobby.shopDx, grid.navY, () => {
          host.codexArt = "cartoon";
          host.setLog(formatCodexLog(host.codexId ?? "", "cartoon"));
          host.showCodex();
        }),
      );
    }
    if (hasPortrait(host.codexId)) {
      host.extra.push(
        host.button("年画", lobby.shopDx, grid.navY, () => {
          host.codexArt = "folk";
          host.setLog(formatCodexLog(host.codexId ?? "", "folk"));
          host.showCodex();
        }),
      );
    }
    host.extra.push(
      host.button("返回", 0, grid.navY, () => {
        host.codexId = null;
        host.showCodex();
      }),
    );
    return;
  }
  host.setTitle("契录");
  host.setLog("点缩略图看契录。无立绘的只显示色块。");
  const rows = listCodexSpirits();
  const start = host.codexPage * CODEX_PAGE_SIZE;
  const page = rows.slice(start, start + CODEX_PAGE_SIZE);
  page.forEach((row, index) => {
    const pos = codexCell(host.ui, index);
    if (host.canvas) {
      host.extra.push(
        makeCodexThumb(
          host.canvas,
          {
            id: row.id,
            name: row.name,
            affinity: row.affinities[0],
            x: pos.x,
            y: pos.y,
            width: grid.cellW,
            height: grid.cellH,
          },
          () => {
            host.codexId = row.id;
            host.codexArt = hasCartoonPortrait(row.id) ? "cartoon" : "folk";
            host.showCodex();
          },
          host,
        ),
      );
    }
  });
  if (host.codexPage > 0) {
    host.extra.push(
      host.button("上一页", -lobby.shopDx, grid.navY, () => {
        host.codexPage -= 1;
        host.showCodex();
      }),
    );
  }
  if (start + CODEX_PAGE_SIZE < rows.length) {
    host.extra.push(
      host.button("下一页", lobby.shopDx, grid.navY, () => {
        host.codexPage += 1;
        host.showCodex();
      }),
    );
  }
  host.extra.push(host.button("返回", 0, grid.navY, () => host.showTitle()));
}

export function showEggRoom(host: LobbyHost): void {
  host.clearExtra();
  const fan = host.account.vouchers.fan;
  const ready = hatchReady(host.account);
  const lobby = host.ui.lobby;
  host.setTitle("卵房");
  host.setLog(`孵卵处。卵 ${host.account.eggs.length}  凡券 ${fan}  可开 ${ready.length}`);
  if (host.canvas) {
    host.extra.push(paintWindow(host.canvas, "eggs", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
  }
  addHelp(host, () => host.showEggRoom());
  addPanelCopy(host, `卵 ${host.account.eggs.length}  凡券 ${fan}  可开 ${ready.length}`, 220, 64);
  host.extra.push(
    host.button("兑孵券", -lobby.shopDx, lobby.panel.y, () => {
      const tier = (["fan", "shang", "te", "jin"] as const).find((id) => (host.account.vouchers[id] ?? 0) > 0);
      if (!tier) {
        host.setLog("无孵券");
        return;
      }
      try {
        redeemVoucher(host.account, tier, `egg-${Date.now()}`);
        host.persist();
        host.showEggRoom();
      } catch {
        host.setLog("无孵券");
      }
    }, undefined, undefined, "egg"),
  );
  host.extra.push(
    host.button("跳过并开", 0, lobby.panel.y, () => {
      skipEggSteps(host.account);
      const first = hatchReady(host.account)[0];
      if (first) {
        const id = hatchEgg(host.account, first.id);
        host.setLog(`开卵 ${getSpirit(id).name}`);
      } else {
        host.setLog("没有可开的卵");
      }
      host.persist();
      host.showEggRoom();
    }, undefined, undefined, "catch"),
  );
  host.extra.push(host.button("返回", lobby.shopDx, lobby.panel.y, () => host.showTitle()));
  (["lineage", "eggArt", "form"] as const).forEach((kind, index) => {
    const label = kind === "lineage" ? "种族机" : kind === "eggArt" ? "卵术机" : "异相机";
    const icon: ItemIconId = kind === "lineage" ? "charm" : kind === "eggArt" ? "atk" : "spd";
    host.extra.push(
      host.button(label, (index - 1) * lobby.shopDx, lobby.itemY0, () => {
        try {
          const egg = useEggMachine(host.account, kind, `machine-${kind}-${Date.now()}`, utcDateStamp());
          host.persist();
          host.showEggRoom();
          host.setLog(`三机得卵 ${getSpirit(egg.spiritId).name}`);
        } catch {
          host.setLog("无孵券");
        }
      }, undefined, undefined, icon),
    );
  });
}

export function showAchievements(host: LobbyHost): void {
  host.clearExtra();
  host.setTitle("成就");
  const ids = host.account.achievements;
  const lobby = host.ui.lobby;
  host.setLog(ids.length > 0 ? `已得 ${ids.length} 项` : "尚无成就。完成局内目标后记在这里。");
  if (host.canvas) {
    host.extra.push(paintWindow(host.canvas, "achieve", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
  }
  addHelp(host, () => host.showAchievements());
  addPanelCopy(host, achievementCopy(host.account), 40, 280);
  host.extra.push(host.button("返回", 0, lobby.backY, () => host.showTitle()));
}

export function showStats(host: LobbyHost): void {
  host.clearExtra();
  host.setTitle("统计");
  const lobby = host.ui.lobby;
  host.setLog(`${statsLog(host.account)}。见/收来自契录。`);
  if (host.canvas) {
    host.extra.push(paintWindow(host.canvas, "stats", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
  }
  addHelp(host, () => host.showStats());
  addPanelCopy(host, statsLog(host.account).replace(/  /g, "\n"), 40, 220);
  host.extra.push(host.button("返回", 0, lobby.backY, () => host.showTitle()));
}

export function showSlots(host: LobbyHost): void {
  host.clearExtra();
  host.setTitle("存档");
  const lobby = host.ui.lobby;
  host.setLog(`当前槽 ${host.slot + 1}。五个本地空位，互不影响。`);
  if (host.canvas) {
    host.extra.push(paintWindow(host.canvas, "slots", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
  }
  addPanelCopy(host, `当前槽 ${host.slot + 1}\n五个本地空位，互不影响。`);
  addHelp(host, () => host.showSlots());
  for (let slot = 0; slot < 5; slot++) {
    host.extra.push(
      host.button(`槽${slot + 1}`, (slot - 2) * lobby.slotDx, lobby.itemY0 - lobby.itemGap, () => {
        host.loadSlot(slot);
      }, lobby.slotW, lobby.buttonH, undefined, slot === host.slot),
    );
  }
  host.extra.push(host.button("返回", 0, lobby.backY, () => host.showTitle()));
}

export function showGlossary(host: LobbyHost, back: () => void = () => host.showTitle()): void {
  host.clearExtra();
  host.setTitle("名词");
  host.setLog("点词条，说明出现在下方。");
  if (!host.canvas) {
    return;
  }
  const lobby = host.ui.lobby;
  host.extra.push(
    paintWindow(host.canvas, "glossary", lobby.glossary.x, lobby.glossary.y, lobby.glossary.width, lobby.glossary.height, 16),
  );
  const first = GLOSSARY[0];
  const body = addText(
    host.canvas,
    "glossary-body",
    first ? `${first.term}：${first.body}` : "",
    0,
    lobby.glossaryBodyY,
    lobby.glossary.width - 60,
    24,
    INK,
    { wrap: true, height: 140 },
  );
  host.extra.push(body.node);
  GLOSSARY.forEach((row, index) => {
    const cols = lobby.glossaryCols;
    const col = index % cols;
    const rowi = Math.floor(index / cols);
    host.extra.push(
      host.button(
        row.term,
        (col - (cols - 1) / 2) * lobby.glossaryItemDx,
        lobby.glossaryItemY0 - rowi * lobby.glossaryGap,
        () => {
        const text = `${row.term}：${row.body}`;
        body.string = text;
        host.setLog(text);
      },
        190,
        lobby.buttonH,
      ),
    );
  });
  host.extra.push(host.button("返回", 0, lobby.glossaryBackY, () => back()));
}

function addPanelCopy(host: LobbyHost, text: string, yOff = 168, height = 96): void {
  if (!host.canvas) {
    return;
  }
  const lobby = host.ui.lobby;
  host.extra.push(
    addText(host.canvas, "panel-copy", text, 0, lobby.panel.y + yOff, lobby.panel.width - 48, 22, INK, {
      wrap: true,
      height,
    }),
  );
}

function achievementCopy(account: AccountProgress): string {
  const pub = listAchievements({ hidden: false });
  const got = new Set(account.achievements);
  const unlocked = [
    ...pub.filter((row) => got.has(row.id)),
    ...listAchievements({ hidden: true }).filter((row) => got.has(row.id)),
  ];
  if (unlocked.length === 0) {
    return `已得 0 / ${pub.length}\n通关、收契、孵卵后会出现在这里。`;
  }
  return `已得 ${unlocked.length} / ${pub.length}\n${unlocked.map((row) => row.name).join("、")}`;
}

function addHelp(host: LobbyHost, back: () => void): void {
  if (!host.canvas) {
    return;
  }
  const help = host.ui.lobby.help;
  host.extra.push(makeHelpButton(host.canvas, help.x, help.y, () => showGlossary(host, back), host));
}

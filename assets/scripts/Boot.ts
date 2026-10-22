import {
  _decorator,
  Component,
  Label,
  Node,
  ResolutionPolicy,
  UITransform,
  Widget,
  screen,
  sys,
  view,
} from "cc";
import {
  formatTopBar,
  formatArtHint,
  formatArtPlay,
  formatBoonHint,
  formatBoonTaken,
  formatRunSummary,
  formatSealResult,
  formatMiss,
  formatNextHint,
  formatSpentArt,
  ClassicSlice,
  SETTINGS_TABS,
  catchModifier,
  catchFxDuration,
  itemIcon,
  sealIcon,
  sumRunStats,
  commitParty,
  artPowerMul,
  SEAL_TIERS,
  dailySeed,
  encounterLevel,
  foeEncounterLevel,
  earlyAffinityClamp,
  levelCap,
  getArt,
  getSpirit,
  loadAccountLocal,
  loadRunLocal,
  moveCharm,
  offerRelics,
  pickStartRelic,
  spendCandy,
  currentCost,
  beginUiRun,
  partyBattleKind,
  saveAccountLocal,
  saveRunLocal,
  screenLayout,
  startPartyBattle,
  trainerName,
  utcDateStamp,
  emptyAccount,
  type ItemIconId,
  type RunMode,
  type ScreenLayout,
  type SettingsTab,
} from "./vendor/jinglingCore";
import { AppShell } from "./app/AppShell";
import { createProductDriver } from "./app/product-run";
import { makeArtSlip, makeBoonCard, makeHelpButton, makeLabel, makeSlipButton, makeSpiritCard } from "./ui/kit";
import { addText, flashNode, lungeNode, paintBackdrop, paintFloatNum, paintNameplate, paintPartyTray, paintPortrait, paintWindow, playCatchFx, INK } from "./ui/paint";
import {
  showAchievements,
  showCodex,
  showEggRoom,
  showSettings,
  showSlots,
  showStats,
  showTitle,
  showGlossary as showGlossaryPanel,
  type LobbyHost,
} from "./ui/lobby";

const { ccclass } = _decorator;

/** 产品入口走 AppShell。改成 true 才回退到本文件的旧绘制。 */
const LEGACY_BOOT = false;

const REALM_NAME: Record<string, string> = {
  town_ruins: "镇墟",
  wilds: "野原",
  woods: "密林",
  market: "坊市",
  marsh: "河泽",
  waste: "荒原",
  foothill: "山腹",
  shrine: "社坛",
  cavern: "洞窟",
  snow: "雪原",
  tide: "潮汐",
  void: "归墟",
};

const MODE_NAME: Record<RunMode, string> = {
  classic: "经典",
  daily: "今日试炼",
  endless: "无尽长夜",
  spliced: "长夜·合体",
  challenge: "苛令",
};

const BOON_KIND: Record<string, string> = {
  atk: "攻",
  def: "守",
  spd: "迅",
  hp: "体",
  catch: "契",
  gold: "金",
  exp: "悟",
  potion: "丹",
  map: "途",
  lure: "诱",
};

@ccclass("Boot")
export class Boot extends Component implements LobbyHost {
  private slice: ClassicSlice | null = null;
  private battle: ReturnType<typeof startPartyBattle> | null = null;
  canvas: Node | null = null;
  private waveLabel: Label | null = null;
  private logLabel: Label | null = null;
  extra: Node[] = [];
  private chrome: Node[] = [];
  private backdrop: Node | null = null;
  private hpSeen = new Map<string, number>();
  private pendingNote = "";
  private mode: RunMode = "classic";
  private sprint = false;
  private applyingViewport = false;
  private battleMenu: "main" | "arts" = "main";
  private catchLock = false;
  private lastSealTier = 0;
  private lobbyRefresh: () => void = () => this.showTitle();
  ui: ScreenLayout = screenLayout(750, 1334);
  account = emptyAccount();
  settingsTab: SettingsTab = SETTINGS_TABS[0];
  slot = 0;
  codexPage = 0;
  codexId: string | null = null;
  codexArt: "folk" | "cartoon" = "cartoon";
  private relicId = "";

  start(): void {
    if (!LEGACY_BOOT) {
      this.launchProductShell();
      return;
    }
    console.log("jingling boot");
    this.canvas = this.findCanvas();
    this.applyViewport();
    view.on("canvas-resize", this.onCanvasResize, this);
    screen.on("window-resize", this.onCanvasResize, this);
    this.rebuildChrome();
    void this.restore().then(() => this.showTitle());
  }

  private launchProductShell(): void {
    const shell = this.getComponent(AppShell) ?? this.addComponent(AppShell);
    shell.adoptProductEntry();
    shell.setRunController(createProductDriver());
    shell.route("title");
  }

  onDestroy(): void {
    view.off("canvas-resize", this.onCanvasResize, this);
    screen.off("window-resize", this.onCanvasResize, this);
  }

  setLog(text: string): void {
    this.pendingNote = text;
    if (this.logLabel) {
      this.logLabel.string = text;
    }
    console.log(text);
  }

  setTitle(text: string): void {
    if (this.waveLabel) {
      this.waveLabel.string = text;
    }
  }

  button(text: string, x: number, y: number, onClick: () => void, width?: number, height?: number, icon?: ItemIconId, accent = false): Node {
    return makeSlipButton(
      this.canvas!,
      text,
      x,
      y,
      onClick,
      this,
      width ?? this.ui.lobby.buttonW,
      height ?? this.ui.lobby.buttonH,
      icon,
      accent,
    );
  }

  showTitle(): void {
    this.slice = null;
    this.battle = null;
    this.catchLock = false;
    this.lobbyRefresh = () => this.showTitle();
    showTitle(this as LobbyHost);
  }

  leaveRun(): void {
    this.showTitle();
  }

  showSettings(): void {
    this.lobbyRefresh = () => this.showSettings();
    showSettings(this as LobbyHost);
  }

  showCodex(): void {
    this.lobbyRefresh = () => this.showCodex();
    showCodex(this as LobbyHost);
  }

  showEggRoom(): void {
    this.lobbyRefresh = () => this.showEggRoom();
    showEggRoom(this as LobbyHost);
  }

  showAchievements(): void {
    this.lobbyRefresh = () => this.showAchievements();
    showAchievements(this as LobbyHost);
  }

  showStats(): void {
    this.lobbyRefresh = () => this.showStats();
    showStats(this as LobbyHost);
  }

  showSlots(): void {
    this.lobbyRefresh = () => this.showSlots();
    showSlots(this as LobbyHost);
  }

  showGlossary(back?: () => void): void {
    const go = back ?? (() => this.showTitle());
    this.lobbyRefresh = () => this.showGlossary(go);
    showGlossaryPanel(this as LobbyHost, go);
  }

  loadSlot(slot: number): void {
    this.slot = slot;
    void this.restore().then(() => {
      this.setLog(`读槽 ${slot + 1}`);
      this.showSlots();
    });
  }

  showModePick(): void {
    this.lobbyRefresh = () => this.showModePick();
    this.clearExtra();
    this.setLog("点模式开局。右上「？」有名词。");
    this.setTitle("选模式");
    const lobby = this.ui.lobby;
    if (this.canvas) {
      this.extra.push(paintWindow(this.canvas, "mode-panel", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
      this.extra.push(makeHelpButton(this.canvas, lobby.help.x, lobby.help.y, () => this.showGlossary(() => this.showModePick()), this));
    }
    const modes: RunMode[] = ["classic", "daily", "endless", "spliced", "challenge"];
    const modeIcon: Record<string, ItemIconId> = {
      短征: "spd",
      经典: "map",
      今日试炼: "gold",
      无尽长夜: "lure",
      "长夜·合体": "charm",
      苛令: "atk",
    };
    const entries: [string, () => void][] = [
      [
        "短征",
        () => {
          this.mode = "classic";
          this.sprint = true;
          this.showStarterPick();
        },
      ],
      ...modes.map((mode): [string, () => void] => [
        MODE_NAME[mode],
        () => {
          this.mode = mode;
          this.sprint = false;
          this.showStarterPick();
        },
      ]),
    ];
    const cols = lobby.modeCols;
    entries.forEach(([label, action], index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = cols === 1 ? 0 : (col - (cols - 1) / 2) * lobby.itemDx;
      this.extra.push(this.button(label, x, lobby.itemY0 - row * lobby.itemGap, action, undefined, undefined, modeIcon[label], label === "短征"));
    });
    this.extra.push(this.button("返回", 0, lobby.backY, () => this.showTitle()));
  }

  private showStarterPick(): void {
    this.lobbyRefresh = () => this.showStarterPick();
    this.clearExtra();
    this.setTitle(this.sprint ? "短征" : MODE_NAME[this.mode]);
    const lobby = this.ui.lobby;
    const offers = offerRelics(this.account, `relic-${this.slot}`);
    this.relicId = pickStartRelic(this.account, this.relicId, `relic-${this.slot}`);
    this.setLog("点选一只初始精怪。短征已带上契印。灵糖可降费、开第二魂契、买专属卵。");
    offers.forEach((row, index) => {
      const mark = row.id === this.relicId ? "·选" : "";
      this.extra.push(
        this.button(
          `${row.name}${mark}`,
          (index - 1) * lobby.shopDx,
          lobby.starterRelicY,
          () => {
            this.relicId = row.id;
            this.showStarterPick();
          },
          undefined,
          undefined,
          itemIcon(row.kind),
        ),
      );
    });
    (["cost", "pact", "egg"] as const).forEach((kind, index) => {
      const label = kind === "cost" ? "灵糖·降费" : kind === "pact" ? "灵糖·魂契" : "灵糖·专卵";
      this.extra.push(
        this.button(label, (index - 1) * lobby.shopDx, lobby.starterCandyY, () => {
          const id = "zao_li";
          try {
            spendCandy(this.account, id, kind);
            this.setLog(
              kind === "cost"
                ? `${getSpirit(id).name}费用 ${currentCost(id, this.account)}`
                : kind === "pact"
                  ? "已解锁第二魂契。"
                  : `已购${getSpirit(id).name}专属卵。`,
            );
          } catch (err) {
            this.setLog(err instanceof Error ? err.message : "灵糖不足。");
          }
        }, undefined, undefined, kind === "egg" ? "egg" : "candy"),
      );
    });
    const starters = ["zao_li", "jing_zhu", "tao_geng"];
    starters.forEach((id, index) => {
      const row = getSpirit(id);
      const x = (index - 1) * lobby.shopDx;
      this.extra.push(
        makeSpiritCard(
          this.canvas!,
          {
            id,
            name: row.name,
            affinity: row.affinities[0],
            x,
            y: lobby.starterCard.y,
            width: lobby.starterCard.width,
            height: lobby.starterCard.height,
          },
          () => this.startRun(id),
          this,
        ),
      );
    });
    this.extra.push(this.button("返回", 0, lobby.starterBackY, () => this.showModePick()));
  }

  private startRun(starterId: string): void {
    const seed = this.mode === "daily" ? dailySeed(utcDateStamp()) : `run-${Date.now()}`;
    try {
      this.relicId = pickStartRelic(this.account, this.relicId, `relic-${this.slot}`);
      this.slice = beginUiRun({
        seed,
        starterId,
        mode: this.mode,
        account: this.account,
        relicId: this.relicId,
        sprint: this.sprint,
      });
      if (!this.slice.encounter) {
        this.slice.beginWave();
      }
      this.account = this.slice.account;
      this.scheduleOnce(() => {
        this.enterBattle();
        this.persist();
      }, 0);
    } catch (error) {
      this.setLog(error instanceof Error ? error.message : "无法开局");
    }
  }

  private enterBattle(): void {
    const slice = this.slice;
    if (!this.canvas) {
      this.setLog("画布未就绪");
      return;
    }
    if (!slice?.encounter) {
      this.setLog("没有遭遇，无法开战");
      return;
    }
    if (!slice.run.seals || slice.run.seals.length < 5) {
      slice.run.seals = [5, 0, 0, 0, 0];
    }
    const level = foeEncounterLevel(slice.run.wave);
    const partyLevel = Math.min(levelCap(slice.run.wave), (slice.run.partyLevels[0] ?? encounterLevel(slice.run.wave)) + slice.run.luck);
    this.battle = startPartyBattle({
      partyIds: slice.run.partyIds,
      foeId: slice.encounter.foeId,
      foeIds: slice.encounter.foeIds,
      level,
      partyLevel,
      partyLevels: slice.run.partyLevels.map((value) => Math.min(levelCap(slice.run.wave), value + slice.run.luck)),
      hpRatios: slice.run.partyHpRatios,
      seed: `${slice.run.seed}-w${slice.run.wave}`,
      kind: partyBattleKind(slice.encounter.kind),
        potions: slice.run.potions,
        seals: slice.run.seals,
        catchable: slice.encounter.catchable,
        catchBoon: catchModifier(slice.run),
        statBonus: sumRunStats(slice.run),
        shields: slice.encounter.shields,
      legend: slice.encounter.kind === "legend",
      affinityClamp: earlyAffinityClamp(slice.run.wave),
      artMul: (user, affinity) => artPowerMul(slice.run, user, affinity),
      onEvent: (event) => {
        if (event.type === "artPlayed") {
          this.onArtPlayed(event.userId, event.artId);
        }
        if (event.type === "hpChange") {
          this.onHpChange(event.targetId, event.hp, event.maxHp);
        }
        if (event.type === "sealTried") {
          this.pendingNote = formatSealResult(event.name, event.caught, event.chance);
          this.setLog(this.pendingNote);
          this.catchLock = true;
          this.playSealFx(event.caught, () => {
            this.catchLock = false;
            this.renderPhase();
          });
        }
        if (event.type === "switchIn" && this.battle) {
          this.setLog(`${this.battle.active.name} 上场`);
        }
        this.refreshHud();
        if (event.type === "runOver" && this.slice) {
          if (this.battle) {
            commitParty(
              this.slice.run,
              this.battle.party.map((unit) => ({ hp: unit.hp, maxHp: unit.maxHp })),
              event.result === "win",
            );
            this.slice.run.potions = this.battle.potions;
            this.slice.run.seals = [...this.battle.seals];
          }
          if (event.result === "win") {
            if (this.battle?.caught) {
              this.slice.resolveCatch(true);
            } else {
              this.slice.noteWin();
            }
          } else if (event.result === "fled") {
            this.slice.skipCatch();
          } else {
            this.slice.noteLoss();
          }
          this.persist();
          if (!this.catchLock) {
            this.scheduleOnce(() => this.renderPhase(), 0.45);
          }
        }
        if (event.type === "awaitSwitch" || event.type === "awaitTarget") {
          this.scheduleOnce(() => this.renderPhase(), 0.35);
        }
      },
    });
    this.battleMenu = "main";
    this.setLog(`${this.battle.foe.name} 出现了。${formatNextHint("command")}`);
    this.renderPhase();
  }

  private renderPhase(): void {
    this.clearExtra();
    const slice = this.slice;
    if (!slice || !this.canvas) {
      return;
    }
    this.refreshHud();
    if (slice.phase === "battle" && this.battle) {
      if (this.battle.waitingFor === "switch") {
        this.setLog("选一只上场");
        this.showSwitchButtons();
        return;
      }
      if (this.battle.waitingFor === "target") {
        this.setLog("点选目标");
        this.showTargetButtons();
        return;
      }
      this.setLog(this.pendingNote || formatNextHint("command"));
      this.drawBattleField();
      this.drawBattleTools();
      if (this.battleMenu === "arts") {
        this.drawArts();
      } else {
        this.drawMainCommands();
      }
      return;
    }
    if (slice.phase === "catch" && slice.encounter) {
      const spirit = getSpirit(slice.encounter.foeId);
      const name = spirit.name;
      this.setLog(`要收契 ${name} 吗？点镇物收契。`);
      const lobby = this.ui.lobby;
      const field = this.ui.battle;
      if (this.canvas) {
        this.extra.push(
          paintPortrait(
            this.canvas,
            spirit.name,
            spirit.affinities[0],
            0,
            field.foe.y,
            field.foe.width,
            field.foe.height,
            false,
            spirit.id,
          ),
        );
        this.extra.push(paintWindow(this.canvas, "catch", 0, lobby.panel.y, lobby.panel.width, 240, 16));
      }
      this.extra.push(this.button("镇物", -lobby.shopDx, lobby.panel.y, () => {
        const result = slice.attemptCatch(0);
        this.setLog(result.caught ? `收契成功 ${name}` : `${name} 挣脱了`);
        this.persist();
        const foe = this.extra.find((node) => node.name === `portrait-${name}`);
        if (foe && this.canvas) {
          const from = { x: -lobby.shopDx, y: lobby.panel.y };
          playCatchFx(this.canvas, foe, from, { x: foe.position.x, y: foe.position.y }, result.caught, sealIcon("fan"), () => {
            this.renderPhase();
          });
          return;
        }
        this.renderPhase();
      }, undefined, undefined, "seal-fan"));
      this.extra.push(this.button("放过", lobby.shopDx, lobby.panel.y, () => {
        slice.skipCatch();
        this.persist();
        this.renderPhase();
      }, undefined, undefined, "map"));
      this.extra.push(this.button("回厅", 0, lobby.backY, () => this.leaveRun()));
      return;
    }
    if (slice.phase === "omen" && slice.omen) {
      this.setLog(`${slice.omen.name}  ${slice.omen.body}`);
      const lobby = this.ui.lobby;
      if (this.canvas) {
        this.extra.push(paintWindow(this.canvas, "omen", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
        this.extra.push(
          addText(this.canvas, "panel-copy", `${slice.omen.name}\n${slice.omen.body}`, 0, lobby.panel.y + 140, lobby.panel.width - 48, 22, INK, {
            wrap: true,
            height: 160,
          }).node,
        );
      }
      slice.omen.options.forEach((option, index) => {
        const x = (index - (slice.omen!.options.length - 1) / 2) * lobby.shopDx;
        this.extra.push(this.button(option.label, x, lobby.panel.y, () => {
          slice.pickOmen(index);
          this.persist();
          this.renderPhase();
        }));
      });
      this.extra.push(this.button("回厅", 0, lobby.backY, () => this.leaveRun()));
      return;
    }
    if (slice.phase === "boon") {
      this.showShop();
      return;
    }
    if (slice.phase === "map") {
      this.setLog(this.pendingNote ? `${this.pendingNote}  接下来择境域。` : "择下一境域。");
      const lobby = this.ui.lobby;
      if (this.canvas) {
        this.extra.push(paintWindow(this.canvas, "map", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
        this.extra.push(
          addText(this.canvas, "panel-copy", "择下一境域。", 0, lobby.panel.y + 160, lobby.panel.width - 48, 22, INK, {
            wrap: true,
            height: 72,
          }).node,
        );
      }
      slice.realmChoices.forEach((realmId, index) => {
        const x = (index - (slice.realmChoices.length - 1) / 2) * lobby.shopDx;
        this.extra.push(this.button(REALM_NAME[realmId] ?? realmId, x, lobby.panel.y, () => {
          slice.pickRealm(realmId);
          slice.beginWave();
          this.persist();
          this.enterBattle();
        }, undefined, undefined, "map"));
      });
      this.extra.push(this.button("回厅", 0, lobby.backY, () => this.leaveRun()));
      return;
    }
    if (slice.phase === "victory") {
      slice.account.classicCleared = slice.run.mode === "classic" || slice.account.classicCleared;
      this.setTitle("通关结算");
      this.setLog(`通关 · 契录 ${slice.account.codex.length}`);
      this.paintEndSheet(slice);
      return;
    }
    this.setTitle("败北结算");
    this.setLog(`溃败 · 契录 ${slice.account.codex.length}`);
    this.paintEndSheet(slice);
  }

  private paintEndSheet(slice: ClassicSlice): void {
    const lobby = this.ui.lobby;
    const summary = formatRunSummary({
      gold: slice.run.gold,
      potions: slice.run.potions,
      seals: slice.run.seals,
      partyIds: slice.run.partyIds,
      boonIds: slice.run.boonIds,
    });
    if (this.canvas) {
      this.extra.push(paintWindow(this.canvas, "end", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
      this.extra.push(
        addText(this.canvas, "panel-copy", summary, 0, lobby.panel.y + 40, lobby.panel.width - 48, 22, INK, {
          wrap: true,
          height: 240,
        }).node,
      );
    }
    this.extra.push(this.button("再来一局", 0, lobby.backY, () => this.showTitle(), undefined, undefined, "map", true));
  }

  private showShop(): void {
    const slice = this.slice;
    if (!slice || !this.canvas) {
      return;
    }
    const gold = slice.run.gold;
    const cost = slice.shop ? 250 * Math.ceil(slice.run.wave / 10) * 2 ** slice.shop.rerolls : 0;
    const goldText = slice.account.settings.display.showGold ? `金 ${gold}` : "金 ·";
    this.setLog(
      this.pendingNote
        ? `${this.pendingNote}  坊市  ${goldText}  再择 ${cost}`
        : `坊市  ${goldText}  再择 ${cost}`,
    );
    this.pendingNote = "";
    const lobby = this.ui.lobby;
    if (this.canvas) {
      this.extra.push(paintWindow(this.canvas, "shop-frame", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
    }
    const cardY = this.ui.kind === "landscape" ? 70 : 120;
    slice.boonChoices.forEach((boon, index) => {
      const x = (index - (slice.boonChoices.length - 1) / 2) * lobby.shopDx;
      this.extra.push(
        makeBoonCard(
          this.canvas!,
          {
            name: boon.name,
            kind: BOON_KIND[boon.kind] ?? boon.kind,
            icon: itemIcon(boon.kind),
            hint: formatBoonHint(boon.kind, boon.value),
            x,
            y: cardY,
            width: Math.min(220, lobby.shopDx - 8),
            height: this.ui.kind === "landscape" ? 200 : 250,
          },
          () => {
            this.setLog(formatBoonTaken(boon.name, formatBoonHint(boon.kind, boon.value)));
            slice.takeBoon(boon.id);
            this.afterShop();
          },
          this,
        ),
      );
    });
    this.extra.push(this.button("再择", -lobby.shopDx, lobby.backY, () => {
      try {
        slice.rerollShop();
        this.persist();
        this.renderPhase();
      } catch {
        this.setLog("金不够再择");
      }
    }, undefined, undefined, "gold"));
    this.extra.push(this.button("小药", 0, lobby.backY, () => {
      try {
        slice.buyStock("small_draught");
        this.setLog(`买下小药  金 ${slice.run.gold}`);
        this.persist();
        this.renderPhase();
      } catch {
        this.setLog("买不起或无货");
      }
    }, undefined, undefined, "potion"));
    this.extra.push(this.button("摘要", lobby.shopDx, lobby.backY, () => this.showSummary(), undefined, undefined, "charm"));
    this.extra.push(this.button("奇遇", -lobby.shopDx, lobby.backY - lobby.itemGap, () => {
      slice.openOmen("release_carp");
      this.renderPhase();
    }, undefined, undefined, "lure"));
    this.extra.push(this.button("回厅", 0, lobby.backY - lobby.itemGap, () => this.leaveRun()));
    if (slice.run.partyIds.length >= 2) {
      this.extra.push(this.button("合体", lobby.shopDx, lobby.backY - lobby.itemGap, () => {
        try {
          const fused = slice.fuseParty(0, 1);
          this.setLog(`合体 ${getSpirit(fused.primaryId).name}`);
          this.persist();
          this.renderPhase();
        } catch {
          this.setLog("无法合体");
        }
      }, undefined, undefined, "charm"));
    }
  }

  private showSummary(): void {
    const slice = this.slice;
    if (!slice || !this.canvas) {
      return;
    }
    this.clearExtra();
    this.setTitle("摘要");
    const summary = formatRunSummary({
      gold: slice.run.gold,
      potions: slice.run.potions,
      seals: slice.run.seals,
      partyIds: slice.run.partyIds,
      boonIds: slice.run.boonIds,
    });
    this.setLog(summary);
    const lobby = this.ui.lobby;
    if (this.canvas) {
      this.extra.push(paintWindow(this.canvas, "summary", 0, lobby.panel.y, lobby.panel.width, lobby.panel.height, 16));
      this.extra.push(
        addText(this.canvas, "panel-copy", summary, 0, lobby.panel.y + 40, lobby.panel.width - 48, 22, INK, {
          wrap: true,
          height: 240,
        }).node,
      );
    }
    this.extra.push(this.button("移佩", -lobby.shopDx, lobby.backY, () => {
      try {
        if (slice.run.partyIds.length < 2) {
          this.setLog("队伍还要两只才能移佩");
        } else if (!slice.run.partyCharms[0]?.length) {
          this.setLog("本局还没有佩饰");
        } else {
          moveCharm(slice.run, 0, 1, slice.run.partyCharms[0][0]);
          this.persist();
          this.showSummary();
        }
      } catch (error) {
        this.setLog(error instanceof Error ? error.message : "无法移佩");
      }
    }));
    this.extra.push(this.button("返回", lobby.shopDx, lobby.backY, () => this.renderPhase()));
    this.extra.push(this.button("回厅", 0, lobby.backY, () => this.leaveRun()));
  }

  private drawBattleTools(): void {
    const ui = this.ui;
    if (!this.canvas) {
      return;
    }
    if ((this.slice?.run.wave ?? 1) > 10) {
      this.extra.push(this.button("跳10波", ui.battle.skip.x, ui.battle.skip.y, () => this.skipWaves(10), 110, ui.lobby.buttonH));
    }
    this.extra.push(
      makeHelpButton(this.canvas, ui.battle.help.x, ui.battle.help.y, () => this.showGlossary(() => this.renderPhase()), this),
    );
    this.extra.push(this.button("回厅", ui.battle.quit.x, ui.battle.quit.y, () => this.leaveRun(), 80, ui.lobby.buttonH));
    const artMenu = ui.commandPos(1);
    this.extra.push(this.button("术签", artMenu.x, artMenu.y + ui.battle.commandH + 28, () => {
      this.battleMenu = "arts";
      this.renderPhase();
    }, ui.battle.commandW, ui.battle.commandH));
  }

  private drawMainCommands(): void {
    const ui = this.ui;
    const cells = [0, 1, 2, 3].map((index) => ui.commandPos(index));
    this.extra.push(
      makeSlipButton(this.canvas!, "术", cells[0].x, cells[0].y, () => {
        const artId = this.battle?.active.artIds[0];
        if (artId) {
          this.pick(artId);
        }
      }, this, ui.battle.commandW, ui.battle.commandH, "atk"),
    );
    this.extra.push(
      makeSlipButton(this.canvas!, "队伍", cells[1].x, cells[1].y, () => this.showSwitchButtons(), this, ui.battle.commandW, ui.battle.commandH, "hp"),
    );
    this.extra.push(
      makeSlipButton(this.canvas!, "囊", cells[2].x, cells[2].y, () => this.showBag(), this, ui.battle.commandW, ui.battle.commandH, "potion"),
    );
    this.extra.push(
      makeSlipButton(this.canvas!, "走", cells[3].x, cells[3].y, () => this.tryRun(), this, ui.battle.commandW, ui.battle.commandH, "map"),
    );
  }

  private drawArts(): void {
    const battle = this.battle;
    const ui = this.ui;
    if (!battle || !this.canvas) {
      return;
    }
    battle.active.artIds.forEach((artId, index) => {
      const pos = ui.commandPos(index);
      const art = getArt(artId);
      this.extra.push(
        makeArtSlip(
          this.canvas!,
          {
            name: art.name,
            affinity: art.affinity,
            left: battle.active.focusLeft[artId] ?? 0,
            max: art.focus,
            hint: formatArtHint(art.effects, art.power),
            x: pos.x,
            y: pos.y,
            width: ui.battle.commandW,
            height: ui.battle.commandH,
          },
          () => this.pick(artId, true),
          this,
        ),
      );
    });
    this.extra.push(
      this.button("返回", ui.battle.back.x, ui.battle.back.y, () => {
        this.battleMenu = "main";
        this.renderPhase();
      }, ui.battle.commandW, ui.battle.commandH),
    );
  }

  private drawBattleField(): void {
    const battle = this.battle;
    const canvas = this.canvas;
    if (!battle || !canvas) {
      return;
    }
    const foes = battle.foes.filter((foe) => foe.hp > 0);
    const field = this.ui.battle;
    foes.forEach((foe, index) => {
      const x = foes.length === 1 ? field.foe.x : (index - (foes.length - 1) / 2) * 180;
      this.extra.push(
        paintPortrait(
          canvas,
          foe.name,
          foe.affinities[0],
          x,
          field.foe.y,
          field.foe.width,
          field.foe.height,
          false,
          foe.id,
        ),
      );
      this.hpSeen.set(foe.instanceId, foe.hp);
    });
    const player = battle.active;
    this.extra.push(
      paintPortrait(
        canvas,
        player.name,
        player.affinities[0],
        field.player.x,
        field.player.y,
        field.player.width,
        field.player.height,
        false,
        player.id,
      ),
    );
    this.hpSeen.set(player.instanceId, player.hp);
    this.drawPlates();
  }

  private drawPlates(): void {
    const battle = this.battle;
    const canvas = this.canvas;
    if (!battle || !canvas) {
      return;
    }
    this.extra = this.extra.filter((node) => {
      if (node.name.startsWith("plate-") || node.name === "party-tray") {
        node.destroy();
        return false;
      }
      return true;
    });
    const foe = battle.foe;
    const hud = this.ui.hud;
    this.extra.push(
      paintNameplate(canvas, {
        name: foe.name,
        level: foe.level,
        hp: foe.hp,
        maxHp: foe.maxHp,
        affinity: foe.affinities[0],
        x: hud.foePlate.x,
        y: hud.foePlate.y,
        width: hud.foePlate.width,
        height: hud.foePlate.height,
      }),
    );
    const player = battle.active;
    this.extra.push(
      paintNameplate(canvas, {
        name: player.name,
        level: player.level,
        hp: player.hp,
        maxHp: player.maxHp,
        affinity: player.affinities[0],
        x: hud.playerPlate.x,
        y: hud.playerPlate.y,
        width: hud.playerPlate.width,
        height: hud.playerPlate.height,
      }),
    );
    this.extra.push(
      paintPartyTray(canvas, battle.party, battle.activeIndex, hud.partyTray.x, hud.partyTray.y),
    );
  }

  private onArtPlayed(userId: string, artId: string): void {
    const battle = this.battle;
    if (!battle) {
      return;
    }
    const user = this.unitById(userId);
    const who = user?.name ?? "";
    let art = null;
    try {
      art = getArt(artId);
    } catch {
      art = null;
    }
    this.setLog(formatArtPlay(who, art));
    const node = this.portraitNode(who);
    if (node) {
      lungeNode(node, user?.side === "player");
    }
  }

  private onHpChange(targetId: string, hp: number, _maxHp: number): void {
    const prev = this.hpSeen.get(targetId) ?? hp;
    const delta = hp - prev;
    this.hpSeen.set(targetId, hp);
    const unit = this.unitById(targetId);
    const node = unit ? this.portraitNode(unit.name) : null;
    if (delta !== 0 && unit) {
      const mark = delta > 0 ? `+${delta}` : `${delta}`;
      const base = this.pendingNote.includes(" → ") ? this.pendingNote.split(" → ")[0] : this.pendingNote;
      this.setLog(`${base}  → ${unit.name}${mark}`);
    }
    if (node) {
      flashNode(node);
      if (delta !== 0 && this.account.settings.display.showDamage && this.canvas) {
        const text = delta > 0 ? `+${delta}` : `${delta}`;
        this.extra.push(paintFloatNum(this.canvas, text, node.position.x, node.position.y + 80, delta > 0));
      }
    }
    this.drawPlates();
  }

  private unitById(instanceId: string) {
    const battle = this.battle;
    if (!battle) {
      return undefined;
    }
    return (
      battle.party.find((unit) => unit.instanceId === instanceId) ??
      battle.foes.find((unit) => unit.instanceId === instanceId)
    );
  }

  private portraitNode(name: string): Node | undefined {
    return this.extra.find((node) => node.name === `portrait-${name}`);
  }

  private refreshHud(): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    const mark = slice.encounter?.finale
      ? "终局"
      : slice.encounter?.trainerId
        ? trainerName(slice.encounter.trainerId)
        : slice.encounter?.boss
          ? "头目"
          : slice.encounter?.kind === "trainer"
            ? "行者"
            : "野遇";
    const realm = REALM_NAME[slice.run.realmId] ?? slice.run.realmId;
    if (this.waveLabel) {
      const gold = slice.account.settings.display.showGold ? slice.run.gold : undefined;
      this.waveLabel.string = formatTopBar(slice.run.wave, realm, mark, gold);
    }
  }

  private afterShop(): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    this.persist();
    if (slice.phase === "map") {
      this.renderPhase();
      return;
    }
    slice.beginWave();
    this.enterBattle();
  }

  private skipWaves(count: number): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    slice.skipToWave(slice.run.wave + count);
    this.persist();
    this.enterBattle();
  }

  private showTargetButtons(): void {
    const battle = this.battle;
    if (!battle || !this.canvas) {
      return;
    }
    this.clearExtra();
    this.drawBattleField();
    this.drawBattleTools();
    this.setLog("点选目标");
    const menu = this.ui.battle;
    battle.foes.forEach((foe, index) => {
      if (foe.hp <= 0) {
        return;
      }
      const x = (index - (battle.foes.length - 1) / 2) * menu.menuDx;
      this.extra.push(
        this.button(foe.name, x, menu.menuY0, () => {
          battle.choose({ type: "target", targetId: foe.instanceId });
          this.battleMenu = "main";
          this.renderPhase();
        }),
      );
    });
  }

  persist(): void {
    if (this.slice) {
      this.account = this.slice.account;
    }
    const store = kv();
    void saveAccountLocal(store, this.account);
    if (this.slice) {
      void saveRunLocal(store, this.slot, this.slice.run);
    }
  }

  private async restore(): Promise<void> {
    const store = kv();
    const account = await loadAccountLocal(store);
    if (account) {
      this.account = account;
    }
    const run = await loadRunLocal(store, this.slot);
    if (run) {
      this.setLog(`槽${this.slot + 1} 波${run.wave}`);
    }
  }

  clearExtra(): void {
    for (const node of this.extra) {
      node.destroy();
    }
    this.extra = [];
  }

  private applyViewport(): void {
    if (!this.canvas) {
      return;
    }
    this.applyingViewport = true;
    const widget = this.canvas.getComponent(Widget);
    if (widget) {
      widget.enabled = false;
    }
    const win = screen.windowSize;
    const landscape = win.width > win.height;
    const width = landscape ? 1334 : 750;
    const height = landscape ? 750 : 1334;
    view.setDesignResolutionSize(width, height, ResolutionPolicy.EXACT_FIT);
    this.ui = screenLayout(width, height);
    this.canvas.setPosition(0, 0, 0);
    this.canvas.getComponent(UITransform)?.setContentSize(width, height);
    this.applyingViewport = false;
  }

  private rebuildChrome(): void {
    const canvas = this.canvas;
    if (!canvas) {
      return;
    }
    for (const node of this.chrome) {
      node.destroy();
    }
    this.chrome = [];
    this.backdrop?.destroy();
    const title = this.waveLabel?.string ?? "契灵志怪";
    const log = this.logLabel?.string ?? "";
    this.waveLabel?.node.destroy();
    this.logLabel?.node.destroy();
    const hud = this.ui.hud;
    this.backdrop = paintBackdrop(canvas, this.ui.kind);
    this.chrome.push(paintWindow(canvas, "top-bar", 0, hud.topBar.y, hud.topBar.width, hud.topBar.height, 16));
    this.chrome.push(paintWindow(canvas, "message", 0, hud.message.y, hud.message.width, hud.message.height, 16));
    this.waveLabel = makeLabel(canvas, "Wave", title, hud.topBar.y, 26, { width: hud.topBar.width - 280 });
    this.logLabel = makeLabel(canvas, "Log", log, hud.log.y, 24, {
      wrap: true,
      height: hud.log.height,
      width: hud.log.width,
      x: hud.log.x,
    });
  }

  private onCanvasResize(): void {
    if (this.applyingViewport || !this.canvas) {
      return;
    }
    const prev = this.ui.kind;
    this.applyViewport();
    if (this.ui.kind === prev) {
      return;
    }
    this.rebuildChrome();
    if (this.slice) {
      this.renderPhase();
      return;
    }
    this.lobbyRefresh();
  }

  private findCanvas(): Node {
    let current: Node | null = this.node;
    while (current) {
      if (current.name === "Canvas") {
        return current;
      }
      current = current.parent;
    }
    throw new Error("Canvas not found");
  }

  private pick(artId: string, fromSlip = false): void {
    if (!this.battle || this.battle.waitingFor !== "command") {
      this.setLog(formatMiss());
      return;
    }
    if (fromSlip && (this.battle.active.focusLeft[artId] ?? 0) <= 0) {
      this.setLog(formatSpentArt(getArt(artId).name));
      return;
    }
    this.battleMenu = "main";
    this.battle.choose({ type: "art", artId });
  }

  private tryRun(): void {
    if (!this.battle || this.battle.waitingFor !== "command") {
      this.setLog("现在不能走。");
      return;
    }
    if (this.battle.kind !== "wild") {
      this.setLog("行者战不能走。");
      return;
    }
    this.battle.choose({ type: "run" });
    this.setLog("逃走了。");
  }

  private showBag(): void {
    const battle = this.battle;
    const slice = this.slice;
    if (!battle || !this.canvas || !slice) {
      return;
    }
    this.clearExtra();
    this.drawBattleField();
    this.drawBattleTools();
    this.setLog("小药回血。镇物收契野遇。行者战不能收。点镇物看成功率。");
    const menu = this.ui.battle;
    this.extra.push(
      this.button(`小药 ${battle.potions}`, menu.commandsX[0], menu.menuY0, () => this.useBag(), menu.commandW, menu.commandH, "potion"),
    );
    SEAL_TIERS.forEach((tier, index) => {
      const count = battle.seals[index] ?? 0;
      const col = (index + 1) % 2;
      const row = Math.floor((index + 1) / 2);
      const x = menu.commandsX[0] + col * menu.menuDx;
      const y = menu.menuY0 - row * menu.menuGap;
      this.extra.push(
        this.button(`${tier.name} ${count}`, x, y, () => {
          this.useSeal(index);
        }, menu.commandW, menu.commandH, sealIcon(tier.id)),
      );
    });
    this.extra.push(this.button("返回", menu.commandsX[1], menu.menuY0 - menu.menuGap * 3, () => {
      this.battleMenu = "main";
      this.renderPhase();
    }, menu.commandW, menu.commandH));
  }

  private useSeal(tier: number): void {
    if (!this.battle || !this.slice) {
      return;
    }
    if (this.battle.waitingFor !== "command") {
      this.setLog("现在不能收契。");
      return;
    }
    this.lastSealTier = tier;
    try {
      this.battle.choose({ type: "seal", tier });
      this.slice.run.seals = this.battle.seals;
      this.slice.run.potions = this.battle.potions;
      this.persist();
      if (this.catchLock) {
        return;
      }
      if (this.battle.waitingFor === "command") {
        this.renderPhase();
      }
      if (this.pendingNote) {
        this.setLog(this.pendingNote);
      }
    } catch {
      this.setLog(this.battle.kind !== "wild" ? "此战不能收契" : "没有这种镇物");
    }
  }

  private playSealFx(caught: boolean, onDone: () => void): void {
    const battle = this.battle;
    const canvas = this.canvas;
    if (!battle || !canvas) {
      onDone();
      return;
    }
    const foe = this.extra.find((node) => node.name === `portrait-${battle.foe.name}`);
    if (!foe) {
      this.scheduleOnce(onDone, catchFxDuration());
      return;
    }
    const from = this.ui.commandPos(2);
    playCatchFx(
      canvas,
      foe,
      { x: from.x, y: from.y },
      { x: foe.position.x, y: foe.position.y },
      caught,
      sealIcon(SEAL_TIERS[this.lastSealTier]?.id ?? "fan"),
      onDone,
    );
  }

  private useBag(): void {
    if (!this.battle || this.battle.waitingFor !== "command") {
      return;
    }
    try {
      this.battle.choose({ type: "bag" });
      if (this.slice) {
        this.slice.run.potions = this.battle.potions;
      }
      this.setLog(`${this.battle.active.name} 喝了小药。`);
      this.persist();
      this.battleMenu = "main";
      this.renderPhase();
    } catch {
      this.setLog("囊中无药");
    }
  }

  private showSwitchButtons(): void {
    const battle = this.battle;
    if (!battle || !this.canvas) {
      return;
    }
    this.clearExtra();
    this.drawBattleField();
    this.drawBattleTools();
    this.setLog("换谁上场");
    const menu = this.ui.battle;
    let row = 0;
    battle.party.forEach((spirit, index) => {
      if (index === battle.activeIndex || spirit.hp <= 0) {
        return;
      }
      const x = (row % 3 - 1) * menu.menuDx;
      const y = menu.menuY0 - Math.floor(row / 3) * menu.menuGap;
      row += 1;
      this.extra.push(
        this.button(spirit.name, x, y, () => {
          battle.choose({ type: "switch", partyIndex: index });
          this.battleMenu = "main";
          this.renderPhase();
        }),
      );
    });
    if (battle.waitingFor === "command") {
      this.extra.push(this.button("返回", 0, menu.menuY0 - menu.menuGap * 2, () => {
        this.battleMenu = "main";
        this.renderPhase();
      }));
    }
  }
}

function kv() {
  return {
    get: async (key: string) => sys.localStorage.getItem(key),
    set: async (key: string, value: string) => {
      sys.localStorage.setItem(key, value);
    },
  };
}

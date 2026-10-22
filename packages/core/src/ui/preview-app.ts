import { ClassicSlice } from "../run/classic-slice.ts";
import { emptyAccount, statsLog, type AccountProgress } from "../run/run-session.ts";
import { type PartyBattle } from "../combat/party-battle.ts";
import type { CombatForm } from "../combat/form-change.ts";
import { openBattle, applyBattleEnd } from "../sim/run-sim.ts";
import { getArt, getSpirit, loadTables } from "../tables/load-tables.ts";
import { offerRelics, pickStartRelic } from "../meta/relics.ts";
import { redeemVoucher, skipEggSteps, hatchEgg, hatchReady, useEggMachine, type EggMachineKind } from "../meta/eggs.ts";
import { spendCandy, currentCost } from "../meta/candy.ts";
import { SETTINGS_TABS, type SettingsTab } from "../meta/settings.ts";
import { GLOSSARY, formatArtPlay, formatBattleNudge, formatBoonHint, formatBoonTaken, formatCodexLog, formatMiss, formatNextHint, formatRunHarvest, formatRunSummary, formatSpentArt, CODEX_PAGE_SIZE, listCodexSpirits } from "./copy.ts";
import { hasCartoonPortrait, hasPortrait } from "../assets/manifest.ts";
import type { RunMode } from "../run/modes/types.ts";
import { SEAL_TIERS } from "../catch/seal.ts";
import { utcDateStamp } from "../run/modes/daily.ts";

const MACHINE_BUTTONS: { kind: EggMachineKind; label: string }[] = [
  { kind: "lineage", label: "种族机" },
  { kind: "eggArt", label: "卵术机" },
  { kind: "form", label: "异相机" },
];

const FORM_BAG: { form: Exclude<CombatForm, "none">; label: string }[] = [
  { form: "sanctify", label: "显圣" },
  { form: "colossus", label: "巨灵" },
  { form: "apex", label: "灵极" },
];

export type PreviewScreen =
  | "title"
  | "mode"
  | "starter"
  | "settings"
  | "codex"
  | "eggs"
  | "achievements"
  | "stats"
  | "slots"
  | "glossary"
  | "battle"
  | "arts"
  | "switch"
  | "bag"
  | "catch"
  | "shop"
  | "map"
  | "omen"
  | "summary"
  | "hatch"
  | "target"
  | "defeat"
  | "victory";

const MODE_NAME: Record<RunMode, string> = {
  classic: "经典",
  daily: "今日试炼",
  endless: "无尽长夜",
  spliced: "长夜·合体",
  challenge: "苛令",
};

const TAB_NAME: Record<SettingsTab, string> = {
  general: "通用",
  display: "显示",
  audio: "音频",
  play: "玩法",
  controls: "触控",
};

export class PreviewApp {
  screen: PreviewScreen = "title";
  title = "契灵志怪";
  log = "点「名词」看专有词。择一契灵，入世历劫。";
  mode: RunMode = "classic";
  sprint = false;
  relicId = "";
  settingsTab: SettingsTab = SETTINGS_TABS[0];
  slot = 0;
  account: AccountProgress;
  slice: ClassicSlice | null = null;
  battle: PartyBattle | null = null;
  codexPage = 0;
  codexId: string | null = null;
  codexArt: "folk" | "cartoon" = "cartoon";
  private glossaryBack: PreviewScreen = "title";
  private seed: string;

  constructor(opts?: { seed?: string; account?: AccountProgress }) {
    this.seed = opts?.seed ?? "preview";
    this.account = opts?.account ?? emptyAccount();
  }

  tap(label: string): void {
    const hit = this.controls().find((row) => row.label === label);
    if (!hit) {
      throw new Error(`no control ${label} on ${this.screen}`);
    }
    hit.run();
  }

  labels(): string[] {
    return this.controls().map((row) => row.label);
  }

  private setScreen(screen: PreviewScreen, title: string, log: string): void {
    this.screen = screen;
    this.title = title;
    this.log = log;
  }

  private controls(): { label: string; run: () => void }[] {
    if (this.screen === "title") {
      return [
        { label: "新的旅途", run: () => this.setScreen("mode", "选模式", "点模式开局。") },
        { label: "设置", run: () => this.openSettings() },
        { label: "契录", run: () => this.openCodex() },
        { label: "卵房", run: () => this.openEggs() },
        { label: "成就", run: () => this.setScreen("achievements", "成就", this.account.achievements[0] ?? "尚无成就。") },
        { label: "统计", run: () => this.setScreen("stats", "统计", statsLog(this.account)) },
        { label: "存档", run: () => this.openSlots() },
        { label: "名词", run: () => this.openGlossary("title") },
      ];
    }
    if (this.screen === "mode") {
      return [
        { label: "短征", run: () => this.openStarter("classic", true) },
        ...(["classic", "daily", "endless", "spliced", "challenge"] as const).map((mode) => ({
          label: MODE_NAME[mode],
          run: () => this.openStarter(mode, false),
        })),
        { label: "返回", run: () => this.openTitle() },
      ];
    }
    if (this.screen === "starter") {
      const offers = offerRelics(this.account, `${this.seed}-relic`);
      return [
        ...offers.map((row) => ({
          label: `${row.name}${row.id === this.relicId ? "·选" : ""}`,
          run: () => {
            this.relicId = row.id;
            this.log = `已选 ${row.name}`;
          },
        })),
        { label: "灵糖·降费", run: () => this.spendStarterCandy("cost") },
        { label: "灵糖·魂契", run: () => this.spendStarterCandy("pact") },
        { label: "灵糖·专卵", run: () => this.spendStarterCandy("egg") },
        ...["zao_li", "jing_zhu", "tao_geng"].map((id) => ({
          label: getSpirit(id).name,
          run: () => this.startRun(id),
        })),
        { label: "返回", run: () => this.setScreen("mode", "选模式", "点模式开局。") },
      ];
    }
    if (this.screen === "settings") {
      const settings = this.account.settings;
      const rows: { label: string; run: () => void }[] = SETTINGS_TABS.map((tab) => ({
        label: TAB_NAME[tab],
        run: () => {
          this.settingsTab = tab;
          this.openSettings();
        },
      }));
      if (this.settingsTab === "general") {
        rows.push({
          label: settings.general.skipSeenDialog ? "跳过已见·开" : "跳过已见·关",
          run: () => {
            settings.general.skipSeenDialog = !settings.general.skipSeenDialog;
            this.openSettings();
          },
        });
      }
      if (this.settingsTab === "display") {
        rows.push({
          label: settings.display.showGold ? "金钱·开" : "金钱·关",
          run: () => {
            settings.display.showGold = !settings.display.showGold;
            this.openSettings();
          },
        });
        rows.push({
          label: settings.display.showDamage ? "伤害数字·开" : "伤害数字·关",
          run: () => {
            settings.display.showDamage = !settings.display.showDamage;
            this.openSettings();
          },
        });
      }
      if (this.settingsTab === "play") {
        rows.push({
          label: `倍速 ${settings.play.battleSpeed}`,
          run: () => {
            settings.play.battleSpeed = (((settings.play.battleSpeed % 3) + 1) as 1 | 2 | 3);
            this.openSettings();
          },
        });
      }
      if (this.settingsTab === "controls") {
        rows.push({
          label: settings.controls.layout === "touch" ? "布局·触控" : "布局·键位",
          run: () => {
            settings.controls.layout = settings.controls.layout === "touch" ? "keys" : "touch";
            this.openSettings();
          },
        });
      }
      rows.push({ label: "返回", run: () => this.openTitle() });
      return rows;
    }
    if (this.screen === "codex") {
      return this.codexControls();
    }
    if (this.screen === "eggs") {
      return [
        {
          label: "兑孵券",
          run: () => {
            const tier = (["fan", "shang", "te", "jin"] as const).find((id) => (this.account.vouchers[id] ?? 0) > 0);
            if (!tier) {
              this.log = "无孵券";
              return;
            }
            redeemVoucher(this.account, tier, `${this.seed}-egg`);
            this.openEggs();
          },
        },
        ...MACHINE_BUTTONS.map((row) => ({
          label: row.label,
          run: () => this.useMachine(row.kind),
        })),
        {
          label: "跳过并开",
          run: () => {
            skipEggSteps(this.account);
            const first = hatchReady(this.account)[0];
            if (!first) {
              this.log = "没有可开的卵";
              this.openEggs();
              return;
            }
            const name = getSpirit(hatchEgg(this.account, first.id)).name;
            this.setScreen("hatch", "开卵", `开卵 ${name}`);
          },
        },
        { label: "返回", run: () => this.openTitle() },
      ];
    }
    if (this.screen === "achievements" || this.screen === "stats") {
      return [{ label: "返回", run: () => this.openTitle() }];
    }
    if (this.screen === "slots") {
      return [
        ...[0, 1, 2, 3, 4].map((slot) => ({
          label: `槽${slot + 1}`,
          run: () => {
            this.slot = slot;
            this.log = `读槽 ${slot + 1}`;
            this.openSlots();
          },
        })),
        { label: "返回", run: () => this.openTitle() },
      ];
    }
    if (this.screen === "glossary") {
      return [
        ...GLOSSARY.map((row) => ({
          label: row.term,
          run: () => {
            this.log = `${row.term}：${row.body}`;
          },
        })),
        { label: "返回", run: () => this.restoreGlossaryBack() },
      ];
    }
    if (this.screen === "hatch") {
      return [{ label: "返回", run: () => this.openEggs() }];
    }
    if (this.screen === "arts") {
      const battle = this.battle;
      if (!battle) {
        return [];
      }
      return [
        ...battle.active.artIds.map((artId) => ({
          label: getArt(artId).name,
          run: () => this.playArt(artId, true),
        })),
        { label: "返回", run: () => this.showBattle(formatNextHint("command")) },
        this.missControl(),
      ];
    }
    if (this.screen === "switch") {
      const battle = this.battle;
      if (!battle) {
        return [];
      }
      return [
        ...battle.party.flatMap((spirit, index) =>
          index === battle.activeIndex || spirit.hp <= 0
            ? []
            : [{ label: spirit.name, run: () => this.chooseSwitch(index) }],
        ),
        { label: "返回", run: () => this.showBattle(formatNextHint("command")) },
        this.missControl(),
      ];
    }
    if (this.screen === "bag") {
      const battle = this.battle;
      if (!battle) {
        return [];
      }
      return [
        { label: `小药 ${battle.potions}`, run: () => this.usePotion() },
        ...FORM_BAG.filter((row) => battle.formKeys.includes(row.form)).map((row) => ({
          label: row.label,
          run: () => this.useForm(row.form),
        })),
        ...SEAL_TIERS.map((tier, index) => ({
          label: `${tier.name} ${battle.seals[index] ?? 0}`,
          run: () => this.useSeal(index),
        })),
        { label: "返回", run: () => this.showBattle(formatNextHint("command")) },
        this.missControl(),
      ];
    }
    if (this.screen === "catch") {
      return [
        { label: "镇物", run: () => this.throwSeal() },
        { label: "放过", run: () => this.skipCatch() },
        this.leaveRunControl(),
        this.missControl(),
      ];
    }
    if (this.screen === "shop") {
      const slice = this.slice;
      if (!slice) {
        return [];
      }
      return [
        ...slice.boonChoices.map((boon) => ({
          label: boon.name,
          run: () => this.takeBoon(boon.id),
        })),
        {
          label: "再择",
          run: () => {
            try {
              slice.rerollShop();
              this.showSlicePhase();
            } catch {
              this.log = "金不够再择";
            }
          },
        },
        {
          label: "小药",
          run: () => {
            try {
              slice.buyStock("small_draught");
              this.log = `买下小药  金 ${slice.run.gold}`;
              this.showSlicePhase();
            } catch {
              this.log = "买不起或无货";
            }
          },
        },
        { label: "摘要", run: () => this.openSummary() },
        {
          label: "奇遇",
          run: () => {
            slice.openOmen("release_carp");
            this.showSlicePhase();
          },
        },
        ...(slice.run.partyIds.length >= 2
          ? [
              {
                label: "合体",
                run: () => {
                  try {
                    const fused = slice.fuseParty(0, 1);
                    this.log = `合体 ${getSpirit(fused.primaryId).name}`;
                    this.showSlicePhase();
                  } catch {
                    this.log = "无法合体";
                  }
                },
              },
            ]
          : []),
        this.leaveRunControl(),
        this.missControl(),
      ];
    }
    if (this.screen === "map") {
      const slice = this.slice;
      if (!slice) {
        return [];
      }
      return [
        ...slice.realmChoices.map((realmId) => ({
          label: loadTables().realms.find((row) => row.id === realmId)?.name ?? realmId,
          run: () => {
            slice.pickRealm(realmId);
            slice.beginWave();
            this.battle = openBattle(slice);
            this.showSlicePhase();
          },
        })),
        this.leaveRunControl(),
        this.missControl(),
      ];
    }
    if (this.screen === "omen") {
      const slice = this.slice;
      if (!slice?.omen) {
        return [];
      }
      return [
        ...slice.omen.options.map((option, index) => ({
          label: option.label,
          run: () => {
            slice.pickOmen(index);
            this.showSlicePhase();
          },
        })),
        this.leaveRunControl(),
        this.missControl(),
      ];
    }
    if (this.screen === "summary") {
      return [
        { label: "返回", run: () => this.showSlicePhase() },
        this.leaveRunControl(),
      ];
    }
    if (this.screen === "target") {
      const battle = this.battle;
      if (!battle) {
        return [];
      }
      return [
        ...battle.foes
          .filter((foe) => foe.hp > 0)
          .map((foe) => ({
            label: foe.name,
            run: () => {
              battle.choose({ type: "target", targetId: foe.instanceId });
              this.showSlicePhase();
            },
          })),
        this.missControl(),
      ];
    }
    if (this.screen === "defeat" || this.screen === "victory") {
      return [{ label: "再来一局", run: () => this.openTitle() }];
    }
    if (this.screen === "battle") {
      const wave = this.slice?.run.wave ?? 1;
      return [
        { label: "术", run: () => this.playArt(this.battle?.active.artIds[0] ?? "", false) },
        { label: "队伍", run: () => this.setScreen("switch", this.title, formatNextHint("switch")) },
        { label: "囊", run: () => this.setScreen("bag", this.title, formatNextHint("bag")) },
        { label: "走", run: () => this.tryRun() },
        { label: "术签", run: () => this.setScreen("arts", this.title, formatNextHint("arts")) },
        ...(wave > 10 ? [{ label: "跳10波", run: () => this.skipTo((this.slice?.run.wave ?? 1) + 10) }] : []),
        this.leaveRunControl(),
        this.missControl(),
      ];
    }
    return [];
  }

  private leaveRunControl(): { label: string; run: () => void } {
    return { label: "回厅", run: () => this.leaveRun() };
  }

  private missControl(): { label: string; run: () => void } {
    return {
      label: "空地",
      run: () => {
        const waiting =
          this.screen === "battle" ? "command" : this.screen === "switch" ? "switch" : this.screen === "arts" ? "arts" : undefined;
        this.log = formatMiss(waiting);
      },
    };
  }

  private battleNudge(): string {
    const battle = this.battle;
    if (!battle) {
      return "";
    }
    return formatBattleNudge({
      foeAffinities: battle.foe.affinities,
      activeArts: battle.active.artIds.map((id) => getArt(id).affinity),
      benchArts: battle.party
        .filter((_, index) => index !== battle.activeIndex)
        .filter((spirit) => spirit.hp > 0)
        .map((spirit) => spirit.artIds.map((id) => getArt(id).affinity)),
      hpRatio: battle.active.maxHp > 0 ? battle.active.hp / battle.active.maxHp : 0,
      potions: battle.potions,
    });
  }

  private leaveRun(): void {
    this.slice = null;
    this.battle = null;
    this.openTitle();
  }

  private openTitle(): void {
    this.slice = null;
    this.battle = null;
    this.setScreen("title", "契灵志怪", "点「名词」看专有词。择一契灵，入世历劫。");
  }

  private openSettings(): void {
    this.setScreen("settings", "设置", `设置 · ${TAB_NAME[this.settingsTab]}`);
  }

  private openCodex(): void {
    this.codexId = null;
    this.setScreen("codex", "契录", "点精怪看数值、魂契与立绘。无立绘的只看剪影。");
  }

  private showCodexEntry(id: string): void {
    this.codexId = id;
    this.codexArt = hasCartoonPortrait(id) ? "cartoon" : "folk";
    this.screen = "codex";
    this.title = getSpirit(id).name;
    this.log = formatCodexLog(id);
  }

  private setCodexArt(style: "folk" | "cartoon"): void {
    this.codexArt = style;
    this.log = formatCodexLog(this.codexId ?? "", style);
  }

  private codexControls(): { label: string; run: () => void }[] {
    if (this.codexId) {
      const rows: { label: string; run: () => void }[] = [];
      if (hasCartoonPortrait(this.codexId)) {
        rows.push({ label: "卡通", run: () => this.setCodexArt("cartoon") });
      }
      if (hasPortrait(this.codexId)) {
        rows.push({ label: "年画", run: () => this.setCodexArt("folk") });
      }
      rows.push({ label: "返回", run: () => this.openCodex() });
      return rows;
    }
    const all = listCodexSpirits();
    const start = this.codexPage * CODEX_PAGE_SIZE;
    const page = all.slice(start, start + CODEX_PAGE_SIZE);
    const rows = page.map((row) => ({
      label: row.name,
      run: () => this.showCodexEntry(row.id),
    }));
    if (this.codexPage > 0) {
      rows.push({
        label: "上一页",
        run: () => {
          this.codexPage -= 1;
          this.openCodex();
        },
      });
    }
    if (start + CODEX_PAGE_SIZE < all.length) {
      rows.push({
        label: "下一页",
        run: () => {
          this.codexPage += 1;
          this.openCodex();
        },
      });
    }
    rows.push({ label: "返回", run: () => this.openTitle() });
    return rows;
  }

  private openEggs(): void {
    this.setScreen(
      "eggs",
      "卵房",
      `孵卵处。卵 ${this.account.eggs.length}  凡券 ${this.account.vouchers.fan}`,
    );
  }

  private useMachine(kind: EggMachineKind): void {
    try {
      const egg = useEggMachine(this.account, kind, `${this.seed}-${kind}`, utcDateStamp());
      this.openEggs();
      this.log = `三机得卵 ${getSpirit(egg.spiritId).name}`;
    } catch {
      this.log = "无孵券";
    }
  }

  private openSlots(): void {
    this.setScreen("slots", "存档", `当前槽 ${this.slot + 1}。`);
  }

  private openGlossary(back: PreviewScreen): void {
    this.glossaryBack = back;
    this.setScreen("glossary", "名词", "点词条，说明出现在下方。");
  }

  private restoreGlossaryBack(): void {
    if (this.glossaryBack === "settings") {
      this.openSettings();
      return;
    }
    this.openTitle();
  }

  private openStarter(mode: RunMode, sprint: boolean): void {
    this.mode = mode;
    this.sprint = sprint;
    const offers = offerRelics(this.account, `${this.seed}-relic`);
    if (!offers.some((row) => row.id === this.relicId)) {
      this.relicId = pickStartRelic(this.account, this.relicId, `${this.seed}-relic`);
    }
    this.setScreen(sprint ? "starter" : "starter", sprint ? "短征" : MODE_NAME[mode], "点选一只初始精怪。灵糖可降费、开第二魂契、买专属卵。");
  }

  private spendStarterCandy(kind: "cost" | "pact" | "egg"): void {
    const id = "zao_li";
    const name = getSpirit(id).name;
    try {
      spendCandy(this.account, id, kind);
      if (kind === "cost") {
        this.log = `${name}费用 ${currentCost(id, this.account)}`;
      } else if (kind === "pact") {
        this.log = "已解锁第二魂契。";
      } else {
        this.log = `已购${name}专属卵。`;
      }
    } catch (err) {
      this.log = err instanceof Error ? err.message : "灵糖不足。";
    }
  }

  startRun(starterId: string): void {
    const relicId = pickStartRelic(this.account, this.relicId, `${this.seed}-relic`);
    this.relicId = relicId;
    this.slice = new ClassicSlice({
      seed: this.seed,
      starterId,
      mode: this.mode,
      sprint: this.sprint,
      relicId: this.sprint ? relicId : relicId || undefined,
      account: this.account,
    });
    this.slice.beginWave();
    this.battle = openBattle(this.slice);
    this.account = this.slice.account;
    this.showBattle(`${this.battle.foe.name} 出现了。${formatNextHint("command")}`);
  }

  private showBattle(log: string): void {
    this.screen = "battle";
    this.title = this.sprint ? "短征" : MODE_NAME[this.mode];
    const nudge = this.battleNudge();
    this.log = nudge && !log.includes(nudge) ? `${log} ${nudge}` : log;
  }

  skipTo(wave: number): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    slice.skipToWave(wave);
    this.battle = openBattle(slice);
    this.showSlicePhase();
  }

  refresh(): void {
    this.showSlicePhase();
  }

  private harvestLog(prefix: string): string {
    const account = this.slice?.account ?? this.account;
    const candy = Object.values(account.candy).reduce((sum, n) => sum + n, 0);
    return `${prefix} · ${formatRunHarvest({
      seen: account.seenIds.length,
      caught: account.codex.length,
      candy,
      unlocked: account.unlockedStarters.length > 0,
    })}`;
  }

  private showSlicePhase(): void {
    const slice = this.slice;
    if (!slice) {
      this.openTitle();
      return;
    }
    if (slice.phase === "catch") {
      const name = slice.encounter ? getSpirit(slice.encounter.foeId).name : "精怪";
      this.setScreen("catch", this.sprint ? "短征" : MODE_NAME[this.mode], `要收契 ${name} 吗？`);
      return;
    }
    if (slice.phase === "boon") {
      this.setScreen("shop", "坊市", `坊市  金 ${slice.run.gold}`);
      return;
    }
    if (slice.phase === "map") {
      this.setScreen("map", "择境", "择下一境域。");
      return;
    }
    if (slice.phase === "omen") {
      this.setScreen("omen", slice.omen?.name ?? "奇遇", slice.omen?.body ?? "");
      return;
    }
    if (slice.phase === "victory") {
      this.setScreen("victory", "通关结算", this.harvestLog("通关"));
      return;
    }
    if (slice.phase === "defeat") {
      this.setScreen("defeat", "败北结算", this.harvestLog("溃败"));
      return;
    }
    if (!this.battle || this.battle.result) {
      this.battle = openBattle(slice);
    }
    if (this.battle.waitingFor === "switch") {
      this.setScreen("switch", this.sprint ? "短征" : MODE_NAME[this.mode], "选一只上场");
      return;
    }
    if (this.battle.waitingFor === "target") {
      this.setScreen("target", this.sprint ? "短征" : MODE_NAME[this.mode], "点选目标");
      return;
    }
    this.showBattle(this.log.includes("出现了") ? this.log : `${this.battle.foe.name} 出现了。${formatNextHint("command")}`);
  }

  private openSummary(): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    this.setScreen(
      "summary",
      "摘要",
      formatRunSummary({
        gold: slice.run.gold,
        potions: slice.run.potions,
        seals: slice.run.seals,
        partyIds: slice.run.partyIds,
        boonIds: slice.run.boonIds,
      }),
    );
  }

  private continueAfterShop(): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    if (slice.phase === "map") {
      this.showSlicePhase();
      return;
    }
    slice.beginWave();
    this.battle = openBattle(slice);
    this.showSlicePhase();
  }

  private takeBoon(boonId: string): void {
    const slice = this.slice;
    if (!slice) {
      return;
    }
    const boon = slice.boonChoices.find((row) => row.id === boonId);
    if (boon) {
      this.log = formatBoonTaken(boon.name, formatBoonHint(boon.kind, boon.value));
    }
    slice.takeBoon(boonId);
    this.continueAfterShop();
  }

  private skipCatch(): void {
    this.slice?.skipCatch();
    this.showSlicePhase();
  }

  private throwSeal(): void {
    const slice = this.slice;
    if (!slice?.encounter) {
      return;
    }
    const name = getSpirit(slice.encounter.foeId).name;
    const result = slice.attemptCatch(0);
    this.log = result.caught ? `收契成功 ${name}` : `${name} 挣脱了`;
    this.showSlicePhase();
  }

  private useSeal(tier: number): void {
    const battle = this.battle;
    const slice = this.slice;
    if (!battle || !slice) {
      return;
    }
    if (battle.waitingFor !== "command") {
      this.log = "现在不能收契。";
      return;
    }
    try {
      battle.choose({ type: "seal", tier });
      slice.run.seals = [...battle.seals];
      if (battle.result) {
        this.syncBattle();
        return;
      }
      this.showSlicePhase();
    } catch {
      this.log = battle.kind !== "wild" ? "此战不能收契" : "没有这种镇物";
    }
  }

  private syncBattle(): void {
    const slice = this.slice;
    const battle = this.battle;
    if (!slice || !battle) {
      return;
    }
    if (!battle.result) {
      this.showSlicePhase();
      return;
    }
    applyBattleEnd(slice, battle);
    this.account = slice.account;
    this.battle = null;
    this.showSlicePhase();
  }

  private playArt(artId: string, fromSlip = false): void {
    const battle = this.battle;
    if (!battle || battle.waitingFor !== "command" || !artId) {
      this.log = "现在不能出术。";
      return;
    }
    if (fromSlip && (battle.active.focusLeft[artId] ?? 0) <= 0) {
      this.log = formatSpentArt(getArt(artId).name);
      return;
    }
    let art = null;
    try {
      art = getArt(artId);
    } catch {
      art = null;
    }
    battle.choose({ type: "art", artId });
    this.log = formatArtPlay(battle.active.name, art);
    this.syncBattle();
  }

  private chooseSwitch(index: number): void {
    const battle = this.battle;
    if (!battle) {
      return;
    }
    battle.choose({ type: "switch", partyIndex: index });
    this.showBattle(`${battle.active.name} 上场`);
  }

  private usePotion(): void {
    const battle = this.battle;
    if (!battle || battle.waitingFor !== "command") {
      this.log = "现在不能用药。";
      return;
    }
    try {
      battle.choose({ type: "bag" });
      this.showBattle(`${battle.active.name} 喝了小药。`);
    } catch {
      this.log = "囊中无药";
    }
  }

  private useForm(form: Exclude<CombatForm, "none">): void {
    const battle = this.battle;
    if (!battle || battle.waitingFor !== "command") {
      this.log = "现在不能变身。";
      return;
    }
    try {
      battle.choose({
        type: "form",
        form,
        affinity: form === "apex" ? (battle.foe.affinities[0] ?? "tide") : undefined,
      });
      this.showBattle(`${battle.active.name} 进入形态。`);
    } catch {
      this.log = "缺少开启器。";
    }
  }

  private tryRun(): void {
    const battle = this.battle;
    if (!battle || battle.waitingFor !== "command") {
      this.log = "现在不能走。";
      return;
    }
    if (battle.kind !== "wild") {
      this.log = "行者战不能走。";
      return;
    }
    battle.choose({ type: "run" });
    this.log = "逃走了。";
    this.syncBattle();
  }
}

export function beginUiRun(opts: {
  seed: string;
  starterId: string;
  mode?: RunMode;
  sprint?: boolean;
  relicId?: string;
  account?: AccountProgress;
}): ClassicSlice {
  const app = new PreviewApp({ seed: opts.seed, account: opts.account });
  app.mode = opts.mode ?? "classic";
  app.sprint = Boolean(opts.sprint);
  app.relicId = opts.relicId ?? "";
  app.startRun(opts.starterId);
  if (!app.slice) {
    throw new Error("run did not start");
  }
  return app.slice;
}

function playableFingerprint(app: PreviewApp): string {
  return JSON.stringify({
    screen: app.screen,
    log: app.log,
    waiting: app.battle?.waitingFor ?? null,
    wave: app.slice?.run.wave ?? 0,
    gold: app.slice?.run.gold ?? 0,
    hp: app.battle?.party.map((unit) => unit.hp) ?? [],
    foeHp: app.battle?.foes.map((unit) => unit.hp) ?? [],
  });
}

function tapPlayable(
  app: PreviewApp,
  label: string,
  acc: { screens: Set<string>; taps: string[]; dead: number },
): void {
  acc.screens.add(app.screen);
  const before = playableFingerprint(app);
  app.tap(label);
  acc.taps.push(label);
  acc.screens.add(app.screen);
  if (playableFingerprint(app) === before) {
    acc.dead += 1;
  }
}

export function runUiSmoke(seed: string): { screens: string[]; taps: string[]; dead: number } {
  const acc = { screens: new Set<string>(), taps: [] as string[], dead: 0 };

  const tap = (app: PreviewApp, label: string) => {
    tapPlayable(app, label, acc);
  };

  const lobby = new PreviewApp({ seed: `${seed}-lobby` });
  tap(lobby, "设置");
  tap(lobby, "跳过已见·关");
  tap(lobby, "显示");
  tap(lobby, "金钱·开");
  tap(lobby, "伤害数字·开");
  tap(lobby, "音频");
  tap(lobby, "玩法");
  tap(lobby, "倍速 1");
  tap(lobby, "触控");
  tap(lobby, "布局·触控");
  tap(lobby, "返回");
  tap(lobby, "契录");
  tap(lobby, "返回");
  tap(lobby, "卵房");
  tap(lobby, "兑孵券");
  tap(lobby, "跳过并开");
  tap(lobby, "返回");
  tap(lobby, "返回");
  tap(lobby, "成就");
  tap(lobby, "返回");
  tap(lobby, "统计");
  tap(lobby, "返回");
  tap(lobby, "存档");
  tap(lobby, "槽2");
  tap(lobby, "返回");
  tap(lobby, "名词");
  tap(lobby, GLOSSARY[0]?.term ?? "精怪");
  tap(lobby, "返回");

  for (const mode of ["短征", "经典", "今日试炼", "无尽长夜", "长夜·合体", "苛令"]) {
    const app = new PreviewApp({ seed: `${seed}-${mode}` });
    tap(app, "新的旅途");
    tap(app, mode);
    tap(app, getSpirit("zao_li").name);
    tap(app, "术签");
    tap(app, "返回");
    tap(app, "队伍");
    tap(app, "返回");
    tap(app, "囊");
    tap(app, "返回");
  }

  const caught = new PreviewApp({ seed: `${seed}-catch` });
  tap(caught, "新的旅途");
  tap(caught, "经典");
  tap(caught, getSpirit("zao_li").name);
  if (caught.battle) {
    for (const foe of caught.battle.foes) {
      foe.hp = 1;
    }
  }
  for (let i = 0; i < 8 && caught.screen === "battle"; i += 1) {
    tap(caught, "术");
  }
  if (caught.screen === "catch") {
    tap(caught, "镇物");
  }

  const shop = new PreviewApp({ seed: `${seed}-shop` });
  tap(shop, "新的旅途");
  tap(shop, "经典");
  tap(shop, getSpirit("zao_li").name);
  tap(shop, "走");
  if (shop.screen === "catch") {
    tap(shop, "放过");
  }
  if (shop.screen === "shop") {
    tap(shop, "再择");
    tap(shop, "小药");
    tap(shop, "摘要");
    tap(shop, "返回");
    tap(shop, "奇遇");
  }
  if (shop.screen === "omen") {
    const option = shop.labels()[0];
    if (option) {
      tap(shop, option);
    }
  }
  if (shop.screen === "shop") {
    const boon = shop.labels().find((label) => !["再择", "小药", "摘要", "奇遇", "合体", "空地", "回厅"].includes(label));
    if (boon) {
      tap(shop, boon);
    }
  }
  if (shop.screen === "catch") {
    tap(shop, "镇物");
  }

  const mapped = new PreviewApp({ seed: `${seed}-map` });
  tap(mapped, "新的旅途");
  tap(mapped, "经典");
  tap(mapped, getSpirit("jing_zhu").name);
  if (mapped.slice) {
    mapped.slice.run.hasMap = true;
  }
  mapped.skipTo(10);
  for (let i = 0; i < 8 && mapped.screen === "battle"; i += 1) {
    tap(mapped, "走");
    if (mapped.screen === "catch") {
      tap(mapped, "放过");
    }
    if (mapped.screen === "shop") {
      const boon = mapped.labels().find((label) => !["再择", "小药", "摘要", "奇遇", "合体", "空地", "回厅"].includes(label));
      if (boon) {
        tap(mapped, boon);
      }
    }
  }
  if (mapped.screen === "map") {
    const realm = mapped.labels()[0];
    if (realm) {
      tap(mapped, realm);
    }
  }

  const dead = new PreviewApp({ seed: `${seed}-defeat` });
  tap(dead, "新的旅途");
  tap(dead, "经典");
  tap(dead, getSpirit("tao_geng").name);
  if (dead.battle) {
    for (const unit of dead.battle.party) {
      unit.hp = 1;
      unit.atk = 1;
    }
    for (const foe of dead.battle.foes) {
      foe.hp = Math.max(foe.hp, 80);
    }
  }
  for (let i = 0; i < 12 && dead.screen !== "defeat"; i += 1) {
    if (dead.screen === "battle") {
      tap(dead, "术");
      continue;
    }
    if (dead.screen === "switch") {
      const name = dead.labels().find((label) => label !== "返回");
      tap(dead, name ?? "返回");
      continue;
    }
    if (dead.screen === "target") {
      tap(dead, dead.labels()[0] ?? "术");
    }
  }
  if (dead.screen !== "defeat" && dead.slice) {
    dead.slice.noteLoss();
    dead.refresh();
  }
  if (dead.screen === "defeat") {
    tap(dead, "再来一局");
  }

  const win = new PreviewApp({ seed: `${seed}-win` });
  tap(win, "新的旅途");
  tap(win, "短征");
  tap(win, getSpirit("zao_li").name);
  win.skipTo(20);
  if (win.battle) {
    for (const foe of win.battle.foes) {
      foe.hp = 1;
    }
  }
  for (let i = 0; i < 12 && win.screen !== "victory"; i += 1) {
    if (win.screen === "battle") {
      tap(win, "术");
      continue;
    }
    if (win.screen === "target") {
      tap(win, win.labels()[0] ?? "术");
      continue;
    }
    if (win.screen === "catch") {
      tap(win, "放过");
      continue;
    }
    if (win.screen === "shop") {
      const boon = win.labels().find((label) => !["再择", "小药", "摘要", "奇遇", "合体", "空地", "回厅"].includes(label));
      if (boon) {
        tap(win, boon);
      }
    }
  }
  if (win.screen !== "victory" && win.slice) {
    win.slice.noteWin();
    win.refresh();
  }
  if (win.screen === "victory") {
    tap(win, "再来一局");
  }

  return { screens: [...acc.screens], taps: acc.taps, dead: acc.dead };
}

const STARTER_IDS = ["zao_li", "jing_zhu", "tao_geng"] as const;
const MODE_LABELS = ["短征", "经典", "今日试炼", "无尽长夜", "长夜·合体", "苛令"] as const;

export function walkPlayableUi(seed: string): { screens: string[]; taps: string[]; battles: number; dead: number } {
  const acc = { screens: new Set<string>(), taps: [] as string[], dead: 0 };
  let battles = 0;

  const tap = (app: PreviewApp, label: string) => {
    tapPlayable(app, label, acc);
  };

  for (const mode of MODE_LABELS) {
    for (const id of STARTER_IDS) {
      const app = new PreviewApp({ seed: `${seed}-${mode}-${id}` });
      tap(app, "新的旅途");
      tap(app, mode);
      tap(app, getSpirit(id).name);
      if (app.screen !== "battle") {
        throw new Error(`${mode}/${id} stayed on ${app.screen}: ${app.log}`);
      }
      battles += 1;
      tap(app, "术签");
      tap(app, "返回");
      tap(app, "队伍");
      tap(app, "返回");
      tap(app, "囊");
      tap(app, "返回");
      if (mode === "短征" && id === "zao_li") {
        tap(app, "术");
      }
    }
  }

  const smoke = runUiSmoke(`${seed}-smoke`);
  for (const screen of smoke.screens) {
    acc.screens.add(screen);
  }
  acc.taps.push(...smoke.taps);
  acc.dead += smoke.dead ?? 0;
  return { screens: [...acc.screens], taps: acc.taps, battles, dead: acc.dead ?? 0 };
}

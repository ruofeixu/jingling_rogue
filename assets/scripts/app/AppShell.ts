import { Component, Node, ResolutionPolicy, UITransform, director, screen, view, _decorator } from "cc";
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  DIAGNOSTICS_SCREEN_ID,
  SCREEN_MANIFEST,
  buildDiagnosticsModel,
  buildModeModel,
  buildTitleModel,
  buildViewport,
  buildAchievementsModel,
  buildCodexEntryModel,
  buildCodexListModel,
  buildEggsModel,
  buildGlossaryModel,
  buildSettingsModel,
  buildBattleModel,
  buildOverlayModel,
  buildOutcomeModel,
  buildProgressModel,
  closeOverlay,
  emptyOverlayStack,
  openOverlay,
  buildSlotsModel,
  buildStarterModel,
  buildStatsModel,
  resolveAction,
  routeAfterCommand,
  selectRenderer,
  withRenderer,
  type RendererKind,
  type ScreenManifest,
  type ScreenModel,
  type Viewport,
} from "../vendor/jinglingPresentation";
import { DiagnosticsView } from "./DiagnosticsView";
import { GalleryView } from "./GalleryView";
import { TitleScreen } from "./screens/TitleScreen";
import { ModeScreen } from "./screens/ModeScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { StarterScreen } from "./screens/StarterScreen";
import { BattleScreen } from "./screens/BattleScreen";
import { OverlayScreen } from "./screens/OverlayScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { OutcomeScreen } from "./screens/OutcomeScreen";
import { makeBackdrop } from "./ui/Backdrop";
import { UI_SKIN_READY_EVENT } from "./ui/skin-event.ts";
import {
  emptyAccount,
  selectAchievements,
  selectBattle,
  selectBattleOverlays,
  selectRunProgress,
  selectOutcome,
  selectCodexEntry,
  selectCodexList,
  selectEggs,
  selectGlossary,
  selectSettings,
  selectSlots,
  selectStarter,
  selectStats,
  utcDateStamp,
  type AccountProgress,
  type BattleView,
  type BattleOverlaysView,
  type RunProgressView,
  type OutcomeView,
  type SlotSummary,
} from "../vendor/jinglingCore";

const { ccclass } = _decorator;

/** 陈列路由是壳层保留 id，与产品矩阵无关；U2 用它检查基础组件。 */
export const GALLERY_ROUTE_ID = "gallery";

/** 路由 → 背景贴图名。战斗/弹层用战场，局内推进用室内，其余用大厅。 */
const BATTLE_BG: ReadonlySet<string> = new Set([
  "battle", "arts", "switch", "party", "bag", "target", "catch",
]);
const INDOOR_BG: ReadonlySet<string> = new Set(["shop", "omen", "summary", "map"]);
function backdropSkinFor(routeId: string): string {
  if (BATTLE_BG.has(routeId)) return "bg_battle";
  if (INDOOR_BG.has(routeId)) return "bg_indoor";
  return "bg_lobby";
}

/**
 * 真实回合驱动的结构化句柄（U12）。壳层只依赖这组方法，不 import core 的 RunController 类，
 * 从而保持"壳层不含玩法"的契约；具体实现由宿主（Boot/接线层）注入。
 */
export interface RunControllerLike {
  execute(command: string, payload: Readonly<Record<string, string>>): void;
  battleView(): BattleView | null;
  overlaysView(): BattleOverlaysView;
  progressView(kind: "summary" | "shop" | "omen" | "map"): RunProgressView;
  outcomeView(kind: "defeat" | "victory" | "hatch"): OutcomeView;
  phase?(): string;
}

/** 没有战斗时的占位投影，只用于 battle 页 empty 态。 */
const EMPTY_PLATE = { id: "", name: "—", level: 0, hp: 0, maxHp: 0, down: false, ailment: null };
const OVERLAY_KINDS: ReadonlySet<string> = new Set(["arts", "switch", "party", "bag", "target", "catch"]);
const OUTCOME_KINDS: ReadonlySet<string> = new Set(["defeat", "victory", "hatch"]);
const EMPTY_OUTCOME: OutcomeView = {
  won: false, wave: 0, gold: 0, details: [], committed: false, hatched: [], art: "ready",
};

const PROGRESS_KINDS: ReadonlySet<string> = new Set(["summary", "shop", "omen", "map"]);
const EMPTY_PROGRESS: RunProgressView = {
  gold: 0, wave: 0, deltas: [], shop: [], omens: [], nodes: [],
};
const PROGRESS_ITEMS: Record<string, (v: RunProgressView) => readonly unknown[]> = {
  summary: (v) => v.deltas,
  shop: (v) => v.shop,
  omen: (v) => v.omens,
  map: (v) => v.nodes,
};

const EMPTY_OVERLAYS: BattleOverlaysView = {
  arts: [], switchTargets: [], party: [], bag: [], targets: [], seals: [],
};
const OVERLAY_ITEMS: Record<string, (v: BattleOverlaysView) => readonly unknown[]> = {
  arts: (v) => v.arts,
  switch: (v) => v.switchTargets,
  party: (v) => v.party,
  bag: (v) => v.bag,
  target: (v) => v.targets,
  catch: (v) => v.seals,
};

const EMPTY_BATTLE_VIEW: BattleView = {
  wave: 0,
  gold: 0,
  realmId: "",
  ally: EMPTY_PLATE,
  foe: EMPTY_PLATE,
  partySize: 0,
  commands: [
    { id: "art", label: "术", lockedReason: "没有进行中的战斗" },
    { id: "party", label: "队伍", lockedReason: "没有进行中的战斗" },
    { id: "bag", label: "囊", lockedReason: "没有进行中的战斗" },
    { id: "flee", label: "走", lockedReason: "没有进行中的战斗" },
  ],
  log: "",
};

/**
 * 组合根。职责边界见 docs/adr/0001-ui-presentation-shell.md：
 * 只管 manifest、页面宿主、viewport、安全区与新旧 renderer 选择。
 * 不含页面坐标，不做玩法判断，不持有玩法状态。
 *
 * 产品入口由 Boot.launchProductShell 挂入，从 title 开始。
 * 诊断页仍是未接管时的默认路由。LEGACY_BOOT 打开时，旧绘制由 Boot 自己负责。
 */
@ccclass("AppShell")
export class AppShell extends Component {
  private manifest: ScreenManifest = SCREEN_MANIFEST;
  private globalLegacyFallback = false;
  private viewport: Viewport = buildViewport({ width: DESIGN_WIDTH, height: DESIGN_HEIGHT });

  /** 当前挂载的 renderer 与其宿主节点；同一时刻只允许一个。 */
  private mountedRenderer: RendererKind | null = null;
  private host: Node | null = null;
  private routeId: string = DIAGNOSTICS_SCREEN_ID;
  private model: ScreenModel | null = null;
  private readonly view = new DiagnosticsView();
  private readonly gallery = new GalleryView();
  private readonly titleScreen = new TitleScreen();
  private readonly modeScreen = new ModeScreen();
  private readonly lobbyScreen = new LobbyScreen();
  private readonly starterScreen = new StarterScreen();
  private readonly battleScreen = new BattleScreen();
  private readonly overlayScreen = new OverlayScreen();
  private readonly progressScreen = new ProgressScreen();
  private readonly outcomeScreen = new OutcomeScreen();
  private outcomeView: OutcomeView | null = null;
  private outcomeSkipped = false;

  /**
   * 宿主上报当前页的状态覆写。真实用途：存档网络失败、立绘载入中、
   * 内容被规则锁住。传 null 恢复由数据推导的默认状态。
   */
  setScreenState(state: string | null, reason?: string): void {
    this.stateOverride = state;
    this.stateReason = reason ?? null;
    if (this.routeId) {
      this.route(this.routeId);
    }
  }

  private stateOverride: string | null = null;
  private stateReason: string | null = null;

  /** 把推导出的状态与覆写合并。 */
  private resolveState(derived: string): string {
    return this.stateOverride ?? derived;
  }

  private resolveReason(): string | undefined {
    const state = this.stateOverride;
    if (state === "error" || state === "locked") {
      return this.stateReason ?? "暂时不可用";
    }
    return undefined;
  }

  /**
   * 覆写为 empty 时给出兜底提示；否则用页面自带的 hint。
   * 纯导航页（如 title/mode）本没有"空"的概念，被外部覆写成 empty 时
   * 也必须给玩家一句可理解的下一步，这是矩阵门要求每个组合都可用的落地方式。
   */
  private resolveEmptyHint(fallback: string): string | undefined {
    if (this.stateOverride === "empty") {
      return fallback;
    }
    return undefined;
  }

  setOutcomeView(view: OutcomeView | null, skipped?: boolean): void {
    this.outcomeView = view;
    this.outcomeSkipped = skipped === true;
    if (OUTCOME_KINDS.has(this.routeId)) {
      this.route(this.routeId);
    }
  }

  /**
   * 真实回合驱动句柄（U12）。结构化接口，壳层不 import core 的 RunController 类，
   * 只持有它的 execute + 视图投影方法；玩法仍全在 core。
   */
  private runController: RunControllerLike | null = null;

  setRunController(controller: RunControllerLike | null): void {
    this.runController = controller;
    this.refreshFromController();
  }

  /** 从 controller 拉取最新视图到壳层字段，供各页重投影。 */
  private refreshFromController(): void {
    const c = this.runController;
    if (!c) {
      return;
    }
    this.battleView = c.battleView();
    this.overlayView = c.overlaysView();
    const progressKind = (["summary", "shop", "omen", "map"] as const).find((id) => id === this.routeId) ?? "summary";
    this.progressView = c.progressView(progressKind);
    const outcomeKind = this.routeId === "defeat" ? "defeat" : this.routeId === "hatch" ? "hatch" : "victory";
    this.outcomeView = c.outcomeView(outcomeKind);
  }

  private progressView: RunProgressView | null = null;

  setProgressView(view: RunProgressView | null): void {
    this.progressView = view;
    if (PROGRESS_KINDS.has(this.routeId)) {
      this.route(this.routeId);
    }
  }
  /** 弹层栈与其数据源；焦点恢复目标由栈给出。 */
  private overlayStack = emptyOverlayStack();
  private overlayView: BattleOverlaysView | null = null;
  private overlaySelectedId: string | null = null;
  private focusActionId: string | null = null;

  setOverlayView(view: BattleOverlaysView | null): void {
    this.overlayView = view;
    if (OVERLAY_KINDS.has(this.routeId)) {
      this.route(this.routeId);
    }
  }

  /** 打开弹层：记录触发控件，关闭后焦点回到它。 */
  openOverlayRoute(screenId: string, triggerActionId: string): void {
    this.overlayStack = openOverlay(this.overlayStack, {
      screenId: screenId as "arts",
      triggerActionId,
    });
    this.overlaySelectedId = null;
    this.route(screenId);
  }

  closeOverlayRoute(): void {
    const result = closeOverlay(this.overlayStack);
    this.overlayStack = result.stack;
    this.focusActionId = result.focusActionId;
    const top = this.overlayStack.layers[this.overlayStack.layers.length - 1];
    this.route(top ? top.screenId : "battle");
  }

  currentFocusActionId(): string | null {
    return this.focusActionId;
  }

  overlayDepth(): number {
    return this.overlayStack.layers.length;
  }
  /** 战斗视图由宿主注入（战斗状态归 core，壳层只拿只读投影）。 */
  private battleView: BattleView | null = null;

  setBattleView(view: BattleView | null): void {
    this.battleView = view;
    if (this.routeId === "battle") {
      this.route(this.routeId);
    }
  }
  /** 起始选择的瞬时 UI 状态：选中项与立绘资源状态，属于壳层。 */
  private starterSelectedId: string | null = null;
  private pendingMode: string | null = null;
  private starterArt: "ready" | "loading" | "error" = "ready";

  /**
   * 账号快照与存档摘要由宿主注入（U4 起改由 core selector 投影）。
   * 壳层只拥有瞬时 UI 状态，不拥有玩法状态。
   */
  private account: AccountProgress = emptyAccount();
  private savedSlots: SlotSummary[] = [];
  private codexId: string | null = null;

  setAccount(account: AccountProgress, savedSlots: SlotSummary[] = []): void {
    this.account = account;
    this.savedSlots = savedSlots;
    this.route(this.routeId);
  }

  /** 八个大厅页共用一条构造路径：selector 视图 → ScreenModel。 */
  private buildLobbyModel(screenId: string): ScreenModel | null {
    const today = utcDateStamp();
    switch (screenId) {
      case "settings":
        return buildSettingsModel({
          state: this.resolveState("normal") as "normal",
          reason: this.resolveReason(),
          view: selectSettings(this.account),
        });
      case "codex-list": {
        const view = selectCodexList(this.account);
        return buildCodexListModel({
          state: this.resolveState(view.isEmpty ? "empty" : "normal") as "normal",
          reason: this.resolveReason(),
          view,
          pageSize: 8,
        });
      }
      case "codex-entry": {
        const list = selectCodexList(this.account);
        const id = this.codexId ?? list.rows[0]?.id;
        if (!id) {
          return null;
        }
        const view = selectCodexEntry(this.account, id);
        return buildCodexEntryModel({
          state: this.resolveState(view.status === "unknown" ? "locked" : "normal") as "normal",
          view,
          reason: this.resolveReason() ?? view.lockedReason ?? undefined,
        });
      }
      case "eggs": {
        const view = selectEggs(this.account);
        return buildEggsModel({
          state: this.resolveState(view.isEmpty ? "empty" : "normal") as "normal",
          reason: this.resolveReason(),
          view,
        });
      }
      case "achievements": {
        const view = selectAchievements(this.account);
        return buildAchievementsModel({
          state: this.resolveState(view.isEmpty ? "empty" : "normal") as "normal",
          reason: this.resolveReason(),
          view,
        });
      }
      case "stats": {
        const view = selectStats(this.account, today);
        return buildStatsModel({
          state: this.resolveState(view.hasHistory ? "normal" : "empty") as "normal",
          reason: this.resolveReason(),
          view,
        });
      }
      case "slots": {
        const view = selectSlots(this.account, this.savedSlots);
        return buildSlotsModel({
          state: this.resolveState(view.isEmpty ? "empty" : "normal") as "normal",
          reason: this.resolveReason(),
          view,
        });
      }
      case "glossary":
        return buildGlossaryModel({
          state: this.resolveState("normal") as "normal",
          reason: this.resolveReason(),
          view: selectGlossary(),
          pageSize: 8,
        });
      default:
        return null;
    }
  }

  /**
   * 产品文案与模式列表由宿主注入，壳层只透传给 presentation。
   * U3 阶段先用与旧大厅一致的常量，U4 起改由 core 只读 selector 提供。
   */
  private copy = {
    title: "契灵志怪",
    subtitle: "精怪肉鸽",
    titleHint: "点「名词」看专有词。择一契灵，入世历劫。",
    modeHint: "点模式开局。右上「？」有名词。",
    modes: [
      { id: "sprint", label: "短征" },
      { id: "classic", label: "经典" },
      { id: "daily", label: "今日试炼" },
      { id: "endless", label: "无尽长夜" },
      { id: "spliced", label: "长夜·合体" },
      { id: "challenge", label: "苛令" },
    ] as { id: string; label: string; lockedReason?: string }[],
  };

  setCopy(next: Partial<typeof this.copy>): void {
    this.copy = { ...this.copy, ...next };
    this.route(this.routeId);
  }

  /** renderer 只回传 action id；这里解析成意图后再决定路由或命令。 */
  private dispatch(actionId: string): void {
    let intent;
    try {
      intent = resolveAction(actionId);
    } catch (error) {
      console.warn("[AppShell] unknown action", actionId, error);
      return;
    }
    if (intent.kind === "route") {
      this.route(intent.to);
      return;
    }
    // command 意图：接真实回合驱动。有 controller 就执行并重投影；否则退回演示日志。
    if (intent.command === "starter.pick" && intent.payload.id) {
      this.starterSelectedId = intent.payload.id;
    }
    if (intent.command === "select-mode" && intent.payload.mode) {
      this.pendingMode = intent.payload.mode;
    }
    if (this.runController) {
      const payload = intent.command === "starter.confirm"
        ? {
            ...intent.payload,
            ...(this.pendingMode ? { mode: this.pendingMode } : {}),
            ...(this.starterSelectedId ? { starterId: this.starterSelectedId } : {}),
          }
        : intent.payload;
      this.runController.execute(intent.command, payload);
      const next = routeAfterCommand({
        command: intent.command,
        phase: this.runController.phase?.() ?? "",
        current: this.routeId,
      });
      this.routeId = next;
      this.refreshFromController();
      this.route(next);
      return;
    }
    console.log("[AppShell] command", intent.command, JSON.stringify(intent.payload));
  }
  /** 显示偏好属于瞬时 UI 状态，由壳层拥有；不进 core。 */
  private textScale = 1;
  private reduceMotion = false;

  /** 供陈列页演示：文本缩放到 200%、开关减少动效。 */
  setDisplayPreferences(prefs: { textScale?: number; reduceMotion?: boolean }): void {
    if (typeof prefs.textScale === "number" && prefs.textScale > 0) {
      this.textScale = prefs.textScale;
    }
    if (typeof prefs.reduceMotion === "boolean") {
      this.reduceMotion = prefs.reduceMotion;
    }
    this.route(this.routeId);
  }

  private productOwned = false;
  private shellStarted = false;

  /** Boot 在产品入口调用：首帧进标题，而不是诊断页。 */
  adoptProductEntry(): void {
    this.productOwned = true;
    this.routeId = "title";
    if (this.shellStarted) {
      this.route("title");
    }
  }

  start(): void {
    this.refreshViewport();
    if (!this.shellStarted) {
      this.route(this.productOwned ? this.routeId : DIAGNOSTICS_SCREEN_ID);
    }
    view.on("canvas-resize", this.onResize, this);
    // UI 贴图皮肤在 Panel/Button 首次用到时自动异步加载（UiSkin.shared 内触发）；
    // bundle 不存在则安静回退到 Graphics。加载完成后 UiSkin 派发事件，这里重刷一次当前页。
    director.on(UI_SKIN_READY_EVENT, this.onSkinReady, this);
  }

  private onSkinReady(): void {
    this.route(this.routeId);
  }

  onDestroy(): void {
    director.off(UI_SKIN_READY_EVENT, this.onSkinReady, this);
    view.off("canvas-resize", this.onResize, this);
    this.unmount();
  }

  /** 切路由：先卸载旧 renderer，再挂载新 renderer，禁止同时存在两个。 */
  route(screenId: string): void {
    this.shellStarted = true;
    const renderer =
      screenId === DIAGNOSTICS_SCREEN_ID || screenId === GALLERY_ROUTE_ID
        ? "presentation"
        : selectRenderer(screenId, this.manifest, {
            globalLegacyFallback: this.globalLegacyFallback,
          });

    this.unmount();
    this.routeId = screenId;
    this.mount(renderer);
  }

  /** 逐页回退/切换：返回新 manifest，不就地改，避免出现两个所有者。 */
  setRenderer(screenId: string, renderer: RendererKind): void {
    this.manifest = withRenderer(screenId, renderer, this.manifest);
    if (this.routeId === screenId) {
      this.route(screenId);
    }
  }

  /** 全局回退：停止分发 → 销毁 → 保留状态 → 重挂 → 记录一次事件。 */
  setGlobalLegacyFallback(on: boolean): void {
    if (this.globalLegacyFallback === on) {
      return;
    }
    this.globalLegacyFallback = on;
    console.log("[AppShell] global legacy fallback", on ? "on" : "off");
    this.route(this.routeId);
  }

  currentModel(): ScreenModel | null {
    return this.model;
  }

  currentRenderer(): RendererKind | null {
    return this.mountedRenderer;
  }

  currentViewport(): Viewport {
    return this.viewport;
  }

  private mount(renderer: RendererKind): void {
    const host = new Node(`shell-host-${renderer}`);
    host.layer = this.node.layer;
    this.node.addChild(host);
    host.addComponent(UITransform);
    this.host = host;
    this.mountedRenderer = renderer;

    // presentation 页是自足的独立画面：先铺一层不透明背景，遮住背后任何东西。
    // 按路由选背景贴图（有则用图，无则回退纯色）。legacy 回退不铺。
    if (renderer === "presentation") {
      makeBackdrop(host, {
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        skin: backdropSkinFor(this.routeId),
      });
    }

    if (this.routeId === DIAGNOSTICS_SCREEN_ID) {
      this.model = buildDiagnosticsModel({
        viewport: this.viewport,
        renderer,
        globalLegacyFallback: this.globalLegacyFallback,
      });
      this.view.mount(host, this.model);
      for (const line of this.model.lines) {
        console.log("[AppShell]", line);
      }
      return;
    }

    if (this.routeId === GALLERY_ROUTE_ID) {
      this.model = null;
      this.gallery.mount(host, {
        width: this.viewport.device.width,
        height: this.viewport.device.height,
        textScale: this.textScale,
        reduceMotion: this.reduceMotion,
      });
      console.log("[AppShell] gallery mounted", this.viewport.orientation);
      return;
    }

    if (renderer === "presentation" && this.routeId === "title") {
      this.model = buildTitleModel({
        title: this.copy.title,
        subtitle: this.copy.subtitle,
        hint: this.copy.titleHint,
        state: this.resolveState("normal") as "normal",
        reason: this.resolveReason(),
        emptyHint: this.resolveEmptyHint("现在没有可开始的旅途，稍后再来"),
      });
      this.titleScreen.mount(host, this.model, {
        viewport: this.viewport,
        textScale: this.textScale,
        onAction: (id) => this.dispatch(id),
      });
      return;
    }

    if (renderer === "presentation" && this.routeId === "mode") {
      this.model = buildModeModel({
        state: this.resolveState("normal") as "normal",
        reason: this.resolveReason(),
        emptyHint: this.resolveEmptyHint("暂时没有可选的模式"),
        modes: this.copy.modes,
        hint: this.copy.modeHint,
      });
      this.modeScreen.mount(host, this.model, {
        viewport: this.viewport,
        textScale: this.textScale,
        onAction: (id) => this.dispatch(id),
      });
      return;
    }

    if (renderer === "presentation" && OUTCOME_KINDS.has(this.routeId)) {
      const view = this.outcomeView ?? EMPTY_OUTCOME;
      const reveal = this.routeId === "hatch" ? view.hatched : view.details;
      this.model = buildOutcomeModel({
        kind: this.routeId as "victory",
        state: this.resolveState(reveal.length === 0 ? "empty" : "normal") as "normal",
        reason: this.resolveReason(),
        view,
        skipped: this.outcomeSkipped,
      });
      this.outcomeScreen.mount(host, this.model, {
        viewport: this.viewport,
        textScale: this.textScale,
        onAction: (id) => this.dispatch(id),
      });
      return;
    }

    if (renderer === "presentation" && PROGRESS_KINDS.has(this.routeId)) {
      const view = this.progressView ?? EMPTY_PROGRESS;
      const rows = PROGRESS_ITEMS[this.routeId](view);
      const blank = this.routeId === "summary" ? view.deltas.length === 0 : rows.length === 0;
      this.model = buildProgressModel({
        kind: this.routeId as "summary",
        state: this.resolveState(blank ? "empty" : "normal") as "normal",
        reason: this.resolveReason(),
        view,
      });
      this.progressScreen.mount(host, this.model, {
        viewport: this.viewport,
        textScale: this.textScale,
        onAction: (id) => this.dispatch(id),
      });
      return;
    }

    if (renderer === "presentation" && OVERLAY_KINDS.has(this.routeId)) {
      const view = this.overlayView ?? EMPTY_OVERLAYS;
      const items = OVERLAY_ITEMS[this.routeId](view);
      this.model = buildOverlayModel({
        kind: this.routeId as "arts",
        state: this.resolveState(items.length === 0 ? "empty" : "normal") as "normal",
        reason: this.resolveReason(),
        view,
        selectedId: this.overlaySelectedId,
      });
      this.overlayScreen.mount(host, this.model, {
        viewport: this.viewport,
        textScale: this.textScale,
        onAction: (id) => this.dispatch(id),
      });
      return;
    }

    if (renderer === "presentation" && this.routeId === "battle") {
      if (!this.battleView) {
        this.model = buildBattleModel({
          state: this.resolveState("empty") as "normal",
          reason: this.resolveReason(),
          view: EMPTY_BATTLE_VIEW,
        });
      } else {
        this.model = buildBattleModel({
          state: this.resolveState("normal") as "normal",
          reason: this.resolveReason(),
          view: this.battleView,
        });
      }
      this.battleScreen.mount(host, this.model, {
        viewport: this.viewport,
        textScale: this.textScale,
        reduceMotion: this.reduceMotion,
        onAction: (id) => this.dispatch(id),
      });
      return;
    }

    if (renderer === "presentation" && this.routeId === "starter") {
      const view = selectStarter(this.account, "starter-seed");
      const derivedState =
        this.starterArt === "error" ? "error" : this.starterArt === "loading" ? "loading" : "normal";
      const resolvedState = this.resolveState(derivedState);
      this.model = buildStarterModel({
        state: resolvedState as "normal",
        view,
        selectedId: this.starterSelectedId,
        art: this.starterArt,
        reason:
          this.resolveReason() ??
          (this.starterArt === "error" ? "立绘载入失败" : undefined),
      });
      this.starterScreen.mount(host, this.model, {
        viewport: this.viewport,
        textScale: this.textScale,
        onAction: (id) => this.dispatch(id),
      });
      return;
    }

    if (renderer === "presentation") {
      const model = this.buildLobbyModel(this.routeId);
      if (model) {
        this.model = model;
        this.lobbyScreen.mount(host, model, {
          viewport: this.viewport,
          textScale: this.textScale,
          onAction: (id) => this.dispatch(id),
        });
        return;
      }
    }

    // U1 不迁移产品页：非诊断路由一律交回 legacy 呈现，由 Boot 负责。
    this.model = null;
    console.log("[AppShell] legacy renderer owns", this.routeId);
  }

  /** 卸载必须真正销毁并解除监听；隐藏不等于销毁，会造成双监听。 */
  private unmount(): void {
    this.view.unmount();
    this.gallery.unmount();
    this.titleScreen.unmount();
    this.modeScreen.unmount();
    this.lobbyScreen.unmount();
    this.starterScreen.unmount();
    this.battleScreen.unmount();
    this.overlayScreen.unmount();
    this.progressScreen.unmount();
    this.outcomeScreen.unmount();
    if (this.host) {
      this.host.removeFromParent();
      this.host.destroy();
      this.host = null;
    }
    this.mountedRenderer = null;
    this.model = null;
  }

  private onResize(): void {
    this.refreshViewport();
    if (this.routeId === DIAGNOSTICS_SCREEN_ID || this.routeId === GALLERY_ROUTE_ID) {
      this.route(this.routeId);
    }
  }

  /** 方向变化只更新 viewport model；页面 state 与未提交选择不受影响。 */
  private refreshViewport(): void {
    const win = screen.windowSize;
    this.viewport = buildViewport({
      width: win.width,
      height: win.height,
      safeArea: this.readSafeArea(),
    });
    const design = this.viewport.design;
    view.setDesignResolutionSize(design.width, design.height, ResolutionPolicy.EXACT_FIT);
  }

  private readSafeArea(): { top: number; bottom: number; left: number; right: number } {
    const raw = (screen as unknown as { safeArea?: Record<string, number> }).safeArea;
    if (!raw) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
    return {
      top: raw.top ?? 0,
      bottom: raw.bottom ?? 0,
      left: raw.left ?? 0,
      right: raw.right ?? 0,
    };
  }
}

/* generated from packages/presentation — do not edit */

// src/screen-model.ts
var SCREEN_IDS = [
  "title",
  "mode",
  "starter",
  "settings",
  "codex-list",
  "codex-entry",
  "eggs",
  "achievements",
  "stats",
  "slots",
  "glossary",
  "hatch",
  "battle",
  "arts",
  "switch",
  "party",
  "bag",
  "catch",
  "shop",
  "summary",
  "omen",
  "map",
  "target",
  "defeat",
  "victory"
];
var SCREEN_ID_SET = new Set(Array.from(SCREEN_IDS));
var REASON_STATES = /* @__PURE__ */ new Set(["error", "locked"]);
function isScreenId(value) {
  return SCREEN_ID_SET.has(value);
}
var RESERVED_SCREEN_IDS = /* @__PURE__ */ new Set(["diagnostics"]);
function assertKnownScreen(screenId) {
  if (!SCREEN_ID_SET.has(screenId) && !RESERVED_SCREEN_IDS.has(screenId)) {
    throw new Error(`unknown screen: ${screenId}`);
  }
}
function buildAction(input) {
  if (!input.id) {
    throw new Error("action id must be a non-empty stable id");
  }
  if (!input.label) {
    throw new Error(`action ${input.id} must have a label`);
  }
  const enabled = input.enabled ?? true;
  if (!enabled && !input.disabledReason) {
    throw new Error(`action ${input.id} is disabled and must carry a disabledReason`);
  }
  return Object.freeze({
    id: input.id,
    label: input.label,
    enabled,
    disabledReason: enabled ? null : input.disabledReason ?? null
  });
}
function buildScreenModel(input) {
  assertKnownScreen(input.screenId);
  if (!input.accessibleName) {
    throw new Error(`screen ${input.screenId} must have an accessibleName`);
  }
  if (REASON_STATES.has(input.state) && !input.reason) {
    throw new Error(`screen ${input.screenId} in ${input.state} must carry a reason`);
  }
  return Object.freeze({
    screenId: input.screenId,
    state: input.state,
    accessibleName: input.accessibleName,
    primaryAction: input.primaryAction ? buildAction(input.primaryAction) : null,
    secondaryActions: Object.freeze((input.secondaryActions ?? []).map(buildAction)),
    reason: input.reason ?? null,
    lines: Object.freeze(Array.from(input.lines ?? []))
  });
}

// src/manifest.ts
var RENDERERS = /* @__PURE__ */ new Set(["legacy", "presentation"]);
var MIGRATED = /* @__PURE__ */ new Set([
  "title",
  "mode",
  "settings",
  "codex-list",
  "codex-entry",
  "eggs",
  "achievements",
  "stats",
  "slots",
  "glossary",
  "starter",
  "battle",
  "arts",
  "switch",
  "party",
  "bag",
  "target",
  "catch",
  "summary",
  "shop",
  "omen",
  "map",
  "defeat",
  "victory",
  "hatch"
]);
function baseManifest() {
  const entries = Array.from(SCREEN_IDS).map(
    (id) => [
      id,
      Object.freeze({ renderer: MIGRATED.has(id) ? "presentation" : "legacy" })
    ]
  );
  return Object.freeze(Object.fromEntries(entries));
}
var SCREEN_MANIFEST = baseManifest();
function assertKnown(screenId, manifest) {
  if (!Object.prototype.hasOwnProperty.call(manifest, screenId)) {
    throw new Error(`unknown screen: ${screenId}`);
  }
}
function selectRenderer(screenId, manifest = SCREEN_MANIFEST, options = {}) {
  assertKnown(screenId, manifest);
  if (options.globalLegacyFallback) {
    return "legacy";
  }
  return manifest[screenId].renderer;
}
function isPresentationOwned(screenId, manifest = SCREEN_MANIFEST, options = {}) {
  return selectRenderer(screenId, manifest, options) === "presentation";
}
function withRenderer(screenId, renderer, manifest = SCREEN_MANIFEST) {
  assertKnown(screenId, manifest);
  if (!RENDERERS.has(renderer)) {
    throw new Error(`unsupported renderer: ${String(renderer)}`);
  }
  return Object.freeze({
    ...manifest,
    [screenId]: Object.freeze({ renderer })
  });
}

// src/viewport.ts
var DESIGN_WIDTH = 750;
var DESIGN_HEIGHT = 1334;
function clampInset(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return value;
}
function buildViewport(input) {
  if (!(input.width > 0) || !(input.height > 0)) {
    throw new Error(`viewport must be positive, got ${input.width}x${input.height}`);
  }
  const orientation = input.width > input.height ? "landscape" : "portrait";
  const design = orientation === "landscape" ? { width: DESIGN_HEIGHT, height: DESIGN_WIDTH } : { width: DESIGN_WIDTH, height: DESIGN_HEIGHT };
  const safe = Object.freeze({
    top: clampInset(input.safeArea?.top),
    bottom: clampInset(input.safeArea?.bottom),
    left: clampInset(input.safeArea?.left),
    right: clampInset(input.safeArea?.right)
  });
  const content = Object.freeze({
    width: Math.max(0, design.width - safe.left - safe.right),
    height: Math.max(0, design.height - safe.top - safe.bottom)
  });
  return Object.freeze({
    orientation,
    design: Object.freeze(design),
    device: Object.freeze({ width: input.width, height: input.height }),
    safe,
    content
  });
}

// src/diagnostics.ts
var DIAGNOSTICS_SCREEN_ID = "diagnostics";
function buildDiagnosticsModel(input) {
  const { viewport: vp } = input;
  return buildScreenModel({
    screenId: DIAGNOSTICS_SCREEN_ID,
    state: "normal",
    accessibleName: "AppShell diagnostics",
    lines: [
      `orientation: ${vp.orientation}`,
      `design: ${vp.design.width}x${vp.design.height}`,
      `device: ${vp.device.width}x${vp.device.height}`,
      `safe: t${vp.safe.top} b${vp.safe.bottom} l${vp.safe.left} r${vp.safe.right}`,
      `content: ${vp.content.width}x${vp.content.height}`,
      `renderer: ${input.renderer}`,
      `global legacy fallback: ${input.globalLegacyFallback ? "on" : "off"}`
    ]
  });
}

// ../core/src/tables/eggs.json
var eggs_default = {
  fan: ["zao_li", "jing_zhu", "tao_geng", "luan_shi", "dian_zhu", "shuang_ming", "mo_mao", "deng_e", "yao_shu", "ping_yu", "zhi_ren", "tong_ling"],
  shang: ["dan_li", "quan_ji", "nuo_mian", "zhang_yan", "pi_li", "bing_can", "ye_ti", "jin_hui", "tao_quan", "he_hun", "jian_ying", "ming_duo"],
  te: ["huo_de_li", "he_bo_cong", "she_mu", "zhen_yue", "lei_ying", "xuan_dong", "wu_mian", "yao_lun"],
  epic: ["dan_zao", "lian_xin", "zang_shu", "jing_zhong"]
};

// ../core/src/meta/eggs.ts
var POOLS = eggs_default;
var MACHINE_ENTRIES = ["fan", "shang", "te", "epic"].flatMap(
  (tier) => POOLS[tier].map((spiritId) => ({ spiritId, tier }))
);

// ../core/src/assets/manifest.ts
var FIRST_PORTRAITS = /* @__PURE__ */ new Set([
  "zao_li",
  "dan_li",
  "jing_zhu",
  "quan_ji",
  "tao_geng",
  "nuo_mian",
  "mo_mao",
  "deng_e",
  "yao_shu"
]);
var SECOND_PORTRAITS = /* @__PURE__ */ new Set([
  "huo_de_li",
  "he_bo_cong",
  "she_mu",
  "luan_shi",
  "dian_zhu",
  "ye_ti",
  "tao_quan",
  "zhi_ren",
  "tong_ling"
]);
var THIRD_PORTRAITS = /* @__PURE__ */ new Set([
  "zhang_yan",
  "pi_li",
  "lei_ying",
  "shuang_ming",
  "bing_can",
  "jin_hui",
  "ping_yu",
  "he_hun",
  "ming_duo"
]);
var PORTRAIT_IDS = /* @__PURE__ */ new Set([
  ...Array.from(FIRST_PORTRAITS),
  ...Array.from(SECOND_PORTRAITS),
  ...Array.from(THIRD_PORTRAITS)
]);

// ../core/src/ui/theme.ts
var THEME = {
  paper: [232, 244, 252],
  panel: [255, 253, 248],
  ink: [61, 50, 40],
  accent: [255, 138, 74],
  edge: [91, 184, 232],
  field: [123, 198, 122],
  fieldDeep: [98, 176, 100],
  slip: [255, 236, 214],
  muted: [80, 70, 62],
  hpBack: [208, 192, 180],
  hpHigh: [88, 196, 92],
  hpMid: [220, 148, 28],
  hpLow: [220, 72, 64]
};

// src/tokens.ts
function rgb(value) {
  return [value[0] ?? 0, value[1] ?? 0, value[2] ?? 0];
}
var COLOR = Object.freeze({
  /** 页面底色 */
  paper: rgb(THEME.paper),
  /** 面板/卡片底色 */
  panel: rgb(THEME.panel),
  /** 正文墨色 */
  ink: rgb(THEME.ink),
  /** 唯一一级行动色 */
  accent: rgb(THEME.accent),
  /** 描边 */
  edge: rgb(THEME.edge),
  /** 次要文字 */
  muted: rgb(THEME.muted),
  /** 战场绿 */
  field: rgb(THEME.field),
  /** 次要按钮底 */
  slip: rgb(THEME.slip)
});
var TYPE = Object.freeze({
  caption: 16,
  body: 22,
  title: 28,
  display: 44,
  lineHeightRatio: 1.35
});
var SPACE = Object.freeze({
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40
});
var RADIUS = Object.freeze({
  control: 12,
  panel: 16
});
var MOTION = Object.freeze({
  fast: 120,
  normal: 240,
  /** 减少动效下的硬上限，规格第 6 节。 */
  reducedMaxMs: 150
});
function channel(value) {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
}
function toHex(color) {
  return `#${channel(color[0])}${channel(color[1])}${channel(color[2])}`;
}
function toRgba(color, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${Math.round(color[0])},${Math.round(color[1])},${Math.round(color[2])},${a})`;
}

// src/a11y.ts
var MIN_HIT_SIZE = 44;
var CONTRAST_BODY = 4.5;
var CONTRAST_LARGE = 3;
function channelLuminance(value) {
  const c = Math.max(0, Math.min(255, value)) / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relativeLuminance(color) {
  const r = channelLuminance(color[0]);
  const g = channelLuminance(color[1]);
  const b = channelLuminance(color[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}
function thresholdFor(role) {
  return role === "large" ? CONTRAST_LARGE : CONTRAST_BODY;
}
function assertContrast(fg, bg, role = "body") {
  const ratio = contrastRatio(fg, bg);
  const min = thresholdFor(role);
  if (ratio < min) {
    throw new Error(
      `contrast ${ratio.toFixed(2)} is below the ${role} minimum ${min} for ${fg.join(",")} on ${bg.join(",")}`
    );
  }
  return ratio;
}
function hitAreaOk(box) {
  return box.width >= MIN_HIT_SIZE && box.height >= MIN_HIT_SIZE;
}
function assertHitArea(box, label) {
  if (!hitAreaOk(box)) {
    throw new Error(
      `hit area ${box.width}x${box.height} for ${label} is below ${MIN_HIT_SIZE}x${MIN_HIT_SIZE}`
    );
  }
}
function fitsScaledText(input) {
  if (input.lines <= 0) {
    throw new Error("lines must be positive");
  }
  const needed = input.fontSize * TYPE.lineHeightRatio * input.scale * input.lines;
  return needed <= input.box.height + 1e-3;
}
function motionDurationMs(durationMs, reduceMotion) {
  if (!(durationMs >= 0)) {
    throw new Error(`duration must be >= 0, got ${durationMs}`);
  }
  if (!reduceMotion) {
    return durationMs;
  }
  return Math.min(durationMs, MOTION.reducedMaxMs);
}

// src/states.ts
var STATE_IDS = ["normal", "loading", "empty", "error", "locked"];
var STATE_SET = new Set(STATE_IDS);
var LOADING_DISABLED_REASON = "\u6B63\u5728\u8F7D\u5165";
function buildStateModel(input) {
  if (!STATE_SET.has(input.state)) {
    throw new Error(`unknown state: ${String(input.state)}`);
  }
  if (!input.accessibleName) {
    throw new Error(`screen ${input.screenId} must have an accessibleName`);
  }
  if (input.state === "empty" && !input.emptyHint) {
    throw new Error(`screen ${input.screenId} in empty must provide an emptyHint`);
  }
  const lines = input.state === "empty" ? [input.emptyHint, ...input.lines ?? []] : input.lines;
  const primaryAction = input.state === "loading" && input.primaryAction ? { ...input.primaryAction, enabled: false, disabledReason: LOADING_DISABLED_REASON } : input.primaryAction;
  const secondaryActions = input.state === "loading" ? (input.secondaryActions ?? []).map((action) => ({
    ...action,
    enabled: false,
    disabledReason: LOADING_DISABLED_REASON
  })) : input.secondaryActions;
  return buildScreenModel({
    screenId: input.screenId,
    state: input.state,
    accessibleName: input.accessibleName,
    primaryAction: primaryAction ?? null,
    secondaryActions,
    reason: input.reason,
    lines
  });
}

// src/responsive.ts
function buildResponsiveFrame(viewport) {
  const columns = viewport.orientation === "landscape" ? 2 : 1;
  const gutter = SPACE.lg;
  const content = Object.freeze({
    x: viewport.safe.left,
    y: viewport.safe.bottom,
    width: viewport.content.width,
    height: viewport.content.height
  });
  const columnWidth = (content.width - gutter * (columns - 1)) / columns;
  return Object.freeze({
    mode: viewport.orientation,
    content,
    columns,
    columnWidth,
    gutter
  });
}
function truncationFor(input) {
  if (!(input.maxChars > 0)) {
    throw new Error(`maxChars must be positive, got ${input.maxChars}`);
  }
  const chars = Array.from(input.text);
  if (chars.length <= input.maxChars) {
    return { strategy: "none", text: input.text };
  }
  if (input.wrap) {
    return { strategy: "wrap", text: input.text };
  }
  return { strategy: "ellipsis", text: `${chars.slice(0, input.maxChars - 1).join("")}\u2026` };
}

// src/screens/title.ts
var TITLE_ACTIONS = Object.freeze({
  startRun: "title.start-run",
  openSettings: "title.open-settings",
  openCodex: "title.open-codex",
  openEggs: "title.open-eggs",
  openAchievements: "title.open-achievements",
  openStats: "title.open-stats",
  openSlots: "title.open-slots",
  openGlossary: "title.open-glossary"
});
var SECONDARY = Object.freeze([
  { id: TITLE_ACTIONS.openSettings, label: "\u8BBE\u7F6E" },
  { id: TITLE_ACTIONS.openCodex, label: "\u5951\u5F55" },
  { id: TITLE_ACTIONS.openEggs, label: "\u5375\u623F" },
  { id: TITLE_ACTIONS.openAchievements, label: "\u6210\u5C31" },
  { id: TITLE_ACTIONS.openStats, label: "\u7EDF\u8BA1" },
  { id: TITLE_ACTIONS.openSlots, label: "\u5B58\u6863" },
  { id: TITLE_ACTIONS.openGlossary, label: "\u540D\u8BCD" }
]);
function entry(id, label, locked) {
  const reason = locked?.[id];
  if (reason) {
    return { id, label, enabled: false, disabledReason: reason };
  }
  return { id, label };
}
function buildTitleModel(input) {
  return buildStateModel({
    screenId: "title",
    state: input.state,
    accessibleName: input.title,
    reason: input.reason,
    emptyHint: input.emptyHint,
    primaryAction: entry(
      TITLE_ACTIONS.startRun,
      input.primaryLabel ?? "\u65B0\u7684\u65C5\u9014",
      input.lockedEntries
    ),
    secondaryActions: SECONDARY.map((item) => entry(item.id, item.label, input.lockedEntries)),
    lines: [input.subtitle, input.hint]
  });
}

// src/screens/mode.ts
var MODE_ACTION_PREFIX = "mode.select.";
function toAction(entry2) {
  if (entry2.locked && !entry2.lockedReason) {
    throw new Error(`mode ${entry2.id} is locked without a reason`);
  }
  const id = `${MODE_ACTION_PREFIX}${entry2.id}`;
  if (entry2.lockedReason) {
    return { id, label: entry2.label, enabled: false, disabledReason: entry2.lockedReason };
  }
  return { id, label: entry2.label };
}
function buildModeModel(input) {
  if (input.modes.length === 0) {
    throw new Error("mode screen requires at least one entry in modes");
  }
  const [first, ...rest] = input.modes;
  return buildStateModel({
    screenId: "mode",
    state: input.state,
    accessibleName: "\u9009\u6A21\u5F0F",
    reason: input.reason,
    emptyHint: input.emptyHint,
    primaryAction: toAction(first),
    secondaryActions: rest.map(toAction),
    lines: input.hint ? [input.hint] : []
  });
}

// src/screens/lobby.ts
var LOBBY_ACTIONS = Object.freeze({
  saveSettings: "settings.save",
  openCodexEntry: "codex-list.open-entry",
  backToList: "codex-entry.back",
  hatchEgg: "eggs.hatch",
  claimAchievement: "achievements.claim",
  refreshStats: "stats.refresh",
  loadSlot: "slots.load",
  openTerm: "glossary.open-term"
});
function progressLine(done, total) {
  return `\u8FDB\u5EA6 ${done} / ${total}`;
}
function buildSettingsModel(input) {
  const tabs = input.view.tabs.map((tab) => ({
    id: `settings.tab.${tab}`,
    label: String(tab)
  }));
  return buildStateModel({
    screenId: "settings",
    state: input.state,
    accessibleName: "\u8BBE\u7F6E",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "\u6CA1\u6709\u53EF\u8C03\u6574\u7684\u9879\u76EE" : void 0,
    primaryAction: { id: LOBBY_ACTIONS.saveSettings, label: "\u4FDD\u5B58" },
    secondaryActions: tabs,
    lines: [`\u5171 ${input.view.tabs.length} \u7EC4\u8BBE\u7F6E`]
  });
}
function buildCodexListModel(input) {
  const pageSize = input.pageSize ?? input.view.rows.length;
  const page = input.page ?? 0;
  const pages = Math.max(1, Math.ceil(input.view.rows.length / Math.max(1, pageSize)));
  const slice = input.view.rows.slice(page * pageSize, page * pageSize + pageSize);
  return buildStateModel({
    screenId: "codex-list",
    state: input.state,
    accessibleName: "\u5951\u5F55",
    reason: input.reason,
    emptyHint: input.state === "empty" ? `\u8FD8\u6CA1\u6709\u6536\u5951\u3002${progressLine(0, input.view.total)}` : void 0,
    primaryAction: { id: LOBBY_ACTIONS.openCodexEntry, label: "\u67E5\u770B\u8BE6\u60C5" },
    secondaryActions: slice.map((row) => ({
      id: `${LOBBY_ACTIONS.openCodexEntry}.${row.id}`,
      label: row.name,
      ...row.status === "unknown" ? { enabled: false, disabledReason: "\u5C1A\u672A\u89C1\u8FC7\u8FD9\u53EA\u7CBE\u602A" } : {}
    })),
    lines: [
      progressLine(input.view.caught, input.view.total),
      `\u5DF2\u89C1 ${input.view.seen} / ${input.view.total}`,
      `\u7B2C ${page + 1} / ${pages} \u9875`
    ]
  });
}
function buildCodexEntryModel(input) {
  const locked = input.view.status === "unknown";
  return buildStateModel({
    screenId: "codex-entry",
    state: input.state,
    accessibleName: `\u5951\u5F55\u8BE6\u60C5 ${input.view.name}`,
    reason: input.reason ?? (locked ? input.view.lockedReason ?? void 0 : void 0),
    emptyHint: input.state === "empty" ? "\u8FD9\u4E00\u9875\u8FD8\u6CA1\u6709\u5185\u5BB9" : void 0,
    primaryAction: { id: LOBBY_ACTIONS.backToList, label: "\u8FD4\u56DE\u5217\u8868" },
    lines: locked ? ["\u672A\u77E5\u6761\u76EE", "\u6536\u5951\u540E\u663E\u793A\u5C5E\u6027\u4E0E\u8715\u53D8\u7EBF"] : [
      `\u540D ${input.view.name}`,
      `\u5C5E ${input.view.affinities.join("\u3001")}`,
      input.view.evolveTo ? "\u53EF\u8715\u53D8" : "\u65E0\u8715\u53D8"
    ]
  });
}
function buildEggsModel(input) {
  const voucherTotal = Object.values(input.view.vouchers).reduce((sum, n) => sum + n, 0);
  return buildStateModel({
    screenId: "eggs",
    state: input.state,
    accessibleName: "\u5375\u623F",
    reason: input.reason,
    emptyHint: input.state === "empty" ? `\u5375\u69FD\u662F\u7A7A\u7684\u3002\u5B75\u5238 ${voucherTotal} \u5F20\uFF0C\u53EF\u5148\u6362\u4E00\u9897\u5375\u3002` : void 0,
    primaryAction: {
      id: LOBBY_ACTIONS.hatchEgg,
      label: "\u5B75\u5316",
      ...input.view.isEmpty ? { enabled: false, disabledReason: "\u5375\u69FD\u91CC\u6CA1\u6709\u5375" } : {}
    },
    secondaryActions: input.view.slots.map((slot) => ({
      id: `${LOBBY_ACTIONS.hatchEgg}.${slot.id}`,
      label: `${slot.tier} \xB7 ${slot.steps} \u6B65`
    })),
    lines: [`\u5375\u69FD ${input.view.slots.length}`, `\u5B75\u5238 ${voucherTotal}`]
  });
}
function buildAchievementsModel(input) {
  return buildStateModel({
    screenId: "achievements",
    state: input.state,
    accessibleName: "\u6210\u5C31",
    reason: input.reason,
    emptyHint: input.state === "empty" ? `\u8FD8\u6CA1\u6709\u6210\u5C31\u3002${progressLine(0, input.view.total)}\uFF0C\u901A\u5173\u4E0E\u6536\u5951\u540E\u4F1A\u51FA\u73B0\u3002` : void 0,
    primaryAction: { id: LOBBY_ACTIONS.claimAchievement, label: "\u9886\u53D6" },
    secondaryActions: input.view.rows.map((row) => ({
      id: `${LOBBY_ACTIONS.claimAchievement}.${row.id}`,
      label: row.name,
      ...row.earned ? {} : { enabled: false, disabledReason: row.hidden ? "\u9690\u85CF\u6210\u5C31" : "\u5C1A\u672A\u8FBE\u6210" }
    })),
    lines: [progressLine(input.view.earned, input.view.total)]
  });
}
function buildStatsModel(input) {
  return buildStateModel({
    screenId: "stats",
    state: input.state,
    accessibleName: "\u7EDF\u8BA1",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "\u8FD8\u6CA1\u6709\u65C5\u9014\u8BB0\u5F55\uFF0C\u5F00\u5C40\u540E\u8FD9\u91CC\u4F1A\u6709\u6570\u5B57\u3002" : void 0,
    primaryAction: { id: LOBBY_ACTIONS.refreshStats, label: "\u5237\u65B0" },
    lines: [
      `\u89C1 ${input.view.seen}`,
      `\u6536 ${input.view.caught}`,
      `\u7F0E ${input.view.ribbons}`,
      `\u4ECA\u65E5\u6700\u9AD8\u6CE2 ${input.view.bestDaily}`,
      input.view.hasHistory ? "\u6709\u5386\u53F2\u8BB0\u5F55" : "\u65E0\u5386\u53F2\u8BB0\u5F55"
    ]
  });
}
function buildSlotsModel(input) {
  const actions = input.view.slots.map((slot) => ({
    id: `${LOBBY_ACTIONS.loadSlot}.${slot.slot}`,
    label: slot.occupied ? `\u69FD${slot.slot + 1} \u6CE2${slot.wave}` : `\u69FD${slot.slot + 1} \u7A7A`,
    ...slot.occupied ? {} : { enabled: false, disabledReason: "\u8FD9\u4E2A\u69FD\u8FD8\u6CA1\u6709\u5B58\u6863" }
  }));
  const [first, ...rest] = actions;
  return buildStateModel({
    screenId: "slots",
    state: input.state,
    accessibleName: "\u5B58\u6863",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "\u4E94\u4E2A\u69FD\u90FD\u662F\u7A7A\u7684\uFF0C\u5F00\u5C40\u540E\u4F1A\u81EA\u52A8\u5B58\u6863\u3002" : void 0,
    primaryAction: first,
    secondaryActions: rest,
    lines: [`\u5360\u7528 ${input.view.slots.filter((s) => s.occupied).length} / ${input.view.slots.length}`]
  });
}
function buildGlossaryModel(input) {
  const pageSize = input.pageSize ?? input.view.terms.length;
  const slice = input.view.terms.slice(0, pageSize);
  return buildStateModel({
    screenId: "glossary",
    state: input.state,
    accessibleName: "\u540D\u8BCD",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "\u540D\u8BCD\u8868\u662F\u7A7A\u7684" : void 0,
    primaryAction: { id: LOBBY_ACTIONS.openTerm, label: "\u67E5\u770B" },
    secondaryActions: slice.map((term) => ({
      id: `${LOBBY_ACTIONS.openTerm}.${term.term}`,
      label: term.term
    })),
    lines: [`\u5171 ${input.view.terms.length} \u6761`]
  });
}

// src/screens/starter.ts
var STARTER_ACTIONS = Object.freeze({
  confirm: "starter.confirm",
  back: "starter.back",
  pick: "starter.pick",
  retryArt: "starter.retry-art"
});
function buildStarterModel(input) {
  if (input.view.candidates.length === 0) {
    throw new Error("starter screen requires at least one candidate");
  }
  const selected = input.view.candidates.find((c) => c.id === input.selectedId) ?? null;
  const relic = input.view.relics.find((r) => r.id === input.view.chosenRelicId) ?? null;
  const confirmBlock = input.art === "loading" ? "\u7ACB\u7ED8\u8FD8\u5728\u8F7D\u5165" : input.art === "error" ? "\u7ACB\u7ED8\u8F7D\u5165\u5931\u8D25\uFF0C\u5148\u91CD\u8BD5" : !selected ? "\u5148\u70B9\u9009\u4E00\u53EA\u521D\u59CB\u7CBE\u602A" : selected.lockedReason ? selected.lockedReason : null;
  const cards = input.view.candidates.map((candidate) => ({
    id: `${STARTER_ACTIONS.pick}.${candidate.id}`,
    label: `${candidate.name} \u8D39${candidate.cost}`,
    ...candidate.lockedReason ? { enabled: false, disabledReason: candidate.lockedReason } : {}
  }));
  const extras = [
    ...cards,
    ...input.art === "error" ? [{ id: STARTER_ACTIONS.retryArt, label: "\u91CD\u8BD5\u8F7D\u5165\u7ACB\u7ED8" }] : [],
    { id: STARTER_ACTIONS.back, label: "\u8FD4\u56DE" }
  ];
  const lines = [
    selected ? `\u9009\u4E2D ${selected.name}` : "\u672A\u9009\u4E2D",
    selected ? `\u8D39\u7528 ${selected.cost}` : "\u8D39\u7528 \u2014",
    selected ? `\u5C5E ${selected.affinities.join("\u3001")}` : "\u5C5E \u2014",
    relic ? `\u5951\u5370 ${relic.name}` : "\u5951\u5370 \u2014"
  ];
  return buildStateModel({
    screenId: "starter",
    state: input.state,
    accessibleName: "\u62E9\u4E00\u5951\u7075",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "\u6CA1\u6709\u53EF\u9009\u7684\u521D\u59CB\u7CBE\u602A" : void 0,
    primaryAction: {
      id: STARTER_ACTIONS.confirm,
      label: "\u5165\u4E16\u5386\u52AB",
      ...confirmBlock ? { enabled: false, disabledReason: confirmBlock } : {}
    },
    secondaryActions: extras,
    lines
  });
}

// src/screens/battle.ts
var BATTLE_ACTIONS = Object.freeze({
  art: "battle.art",
  party: "battle.party",
  bag: "battle.bag",
  flee: "battle.flee"
});
var COMMAND_ORDER = ["art", "party", "bag", "flee"];
function plateLine(prefix, plate) {
  const status = plate.down ? "\u5012\u4E0B" : plate.ailment ?? "\u5E38\u6001";
  return `${prefix} ${plate.name} Lv ${plate.level} ${plate.hp}/${plate.maxHp} ${status}`;
}
function buildBattleModel(input) {
  const byId = new Map(input.view.commands.map((command2) => [command2.id, command2]));
  const actions = COMMAND_ORDER.map((id) => {
    const command2 = byId.get(id);
    const label = command2?.label ?? id;
    const locked = command2?.lockedReason ?? null;
    return {
      id: BATTLE_ACTIONS[id],
      label,
      ...locked ? { enabled: false, disabledReason: locked } : {}
    };
  });
  const [primary, ...rest] = actions;
  return buildStateModel({
    screenId: "battle",
    state: input.state,
    accessibleName: "\u6218\u6597",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "\u73B0\u5728\u6CA1\u6709\u6218\u6597\uFF0C\u56DE\u5927\u5385\u5F00\u4E00\u5C40" : void 0,
    primaryAction: primary,
    secondaryActions: rest,
    lines: [
      `\u7B2C \u6CE2 ${input.view.wave}`.replace("\u6CE2 ", "\u6CE2").replace("\u7B2C ", "\u7B2C"),
      `\u91D1 ${input.view.gold}`,
      plateLine("\u654C", input.view.foe),
      plateLine("\u6211", input.view.ally),
      `\u961F\u4F0D ${input.view.partySize}`,
      input.view.log
    ].filter((line) => line.length > 0)
  });
}

// src/screens/overlays.ts
var OVERLAY_ACTIONS = Object.freeze({
  artsPick: "arts.pick",
  switchPick: "switch.pick",
  partyInspect: "party.inspect",
  bagUse: "bag.use",
  targetPick: "target.pick",
  catchThrow: "catch.throw",
  cancel: "overlay.cancel"
});
var SPECS = Object.freeze({
  arts: {
    screenId: "arts",
    accessibleName: "\u672F",
    pickAction: OVERLAY_ACTIONS.artsPick,
    primaryLabel: "\u51FA\u672F",
    emptyHint: "\u6CA1\u6709\u53EF\u7528\u7684\u672F\uFF0C\u5148\u8FD4\u56DE\u6362\u4E2A\u547D\u4EE4",
    select: (v) => v.arts
  },
  switch: {
    screenId: "switch",
    accessibleName: "\u6362\u4F4D",
    pickAction: OVERLAY_ACTIONS.switchPick,
    primaryLabel: "\u6362\u4E0A",
    emptyHint: "\u6CA1\u6709\u53EF\u6362\u7684\u4F19\u4F34",
    select: (v) => v.switchTargets
  },
  party: {
    screenId: "party",
    accessibleName: "\u961F\u4F0D",
    pickAction: OVERLAY_ACTIONS.partyInspect,
    primaryLabel: "\u67E5\u770B",
    emptyHint: "\u961F\u4F0D\u91CC\u8FD8\u6CA1\u6709\u4F19\u4F34",
    select: (v) => v.party
  },
  bag: {
    screenId: "bag",
    accessibleName: "\u56CA",
    pickAction: OVERLAY_ACTIONS.bagUse,
    primaryLabel: "\u4F7F\u7528",
    emptyHint: "\u56CA\u662F\u7A7A\u7684",
    select: (v) => v.bag
  },
  target: {
    screenId: "target",
    accessibleName: "\u9009\u76EE\u6807",
    pickAction: OVERLAY_ACTIONS.targetPick,
    primaryLabel: "\u786E\u5B9A\u76EE\u6807",
    emptyHint: "\u6CA1\u6709\u5408\u6CD5\u76EE\u6807",
    select: (v) => v.targets
  },
  catch: {
    screenId: "catch",
    accessibleName: "\u9547\u7269",
    pickAction: OVERLAY_ACTIONS.catchThrow,
    primaryLabel: "\u6295\u51FA",
    emptyHint: "\u6CA1\u6709\u53EF\u7528\u7684\u9547\u7269",
    select: (v) => v.seals
  }
});
function buildOverlayModel(input) {
  const spec = SPECS[input.kind];
  if (!spec) {
    throw new Error(`unknown overlay kind: ${String(input.kind)}`);
  }
  const items = spec.select(input.view);
  const selected = items.find((item) => item.id === input.selectedId) ?? null;
  const rows = items.map((item) => ({
    id: `${spec.pickAction}.${item.id}`,
    label: item.detail ? `${item.label} ${item.detail}` : item.label,
    ...item.lockedReason ? { enabled: false, disabledReason: item.lockedReason } : {}
  }));
  const block = items.length === 0 ? "\u73B0\u5728\u6CA1\u6709\u53EF\u9009\u9879" : !selected ? "\u5148\u9009\u4E00\u9879" : selected.lockedReason ? selected.lockedReason : null;
  return buildStateModel({
    screenId: spec.screenId,
    state: input.state,
    accessibleName: spec.accessibleName,
    reason: input.reason,
    emptyHint: input.state === "empty" ? spec.emptyHint : void 0,
    primaryAction: {
      id: `${spec.pickAction}.confirm`,
      label: spec.primaryLabel,
      ...block ? { enabled: false, disabledReason: block } : {}
    },
    // 取消永远可用：即使列表为空也能退出弹层。
    secondaryActions: [...rows, { id: OVERLAY_ACTIONS.cancel, label: "\u8FD4\u56DE" }],
    lines: [`\u5171 ${items.length} \u9879`, selected ? `\u9009\u4E2D ${selected.label}` : "\u672A\u9009\u4E2D"]
  });
}

// src/screens/progress.ts
var PROGRESS_ACTIONS = Object.freeze({
  summaryContinue: "summary.continue",
  shopBuy: "shop.buy",
  shopLeave: "shop.leave",
  omenPick: "omen.pick",
  omenSkip: "omen.skip",
  mapEnter: "map.enter",
  mapRest: "map.rest"
});
var SPECS2 = Object.freeze({
  summary: {
    accessibleName: "\u7ED3\u7B97",
    continueAction: PROGRESS_ACTIONS.summaryContinue,
    continueLabel: "\u7EE7\u7EED",
    rowAction: null,
    emptyHint: "\u8FD9\u4E00\u8F6E\u6CA1\u6709\u53D8\u5316\uFF0C\u53EF\u4EE5\u76F4\u63A5\u7EE7\u7EED",
    select: () => []
  },
  shop: {
    accessibleName: "\u8D27\u644A",
    continueAction: PROGRESS_ACTIONS.shopLeave,
    continueLabel: "\u79BB\u5F00\u8D27\u644A",
    rowAction: PROGRESS_ACTIONS.shopBuy,
    emptyHint: "\u644A\u5B50\u4E0A\u7A7A\u4E86\uFF0C\u79BB\u5F00\u7EE7\u7EED\u8D76\u8DEF",
    select: (v) => v.shop
  },
  omen: {
    accessibleName: "\u673A\u7F18",
    continueAction: PROGRESS_ACTIONS.omenSkip,
    continueLabel: "\u4E0D\u7406\u5B83",
    rowAction: PROGRESS_ACTIONS.omenPick,
    emptyHint: "\u8FD9\u91CC\u6CA1\u6709\u673A\u7F18\uFF0C\u7EE7\u7EED\u8D76\u8DEF",
    select: (v) => v.omens
  },
  map: {
    accessibleName: "\u5883\u57DF\u56FE",
    continueAction: PROGRESS_ACTIONS.mapRest,
    continueLabel: "\u539F\u5730\u6B47\u811A",
    rowAction: PROGRESS_ACTIONS.mapEnter,
    emptyHint: "\u6CA1\u6709\u80FD\u8D70\u7684\u53BB\u5904\uFF0C\u5148\u539F\u5730\u6B47\u811A",
    select: (v) => v.nodes
  }
});
function buildProgressModel(input) {
  const spec = SPECS2[input.kind];
  if (!spec) {
    throw new Error(`unknown progress kind: ${String(input.kind)}`);
  }
  const rows = spec.select(input.view);
  const rowActions = spec.rowAction ? rows.map((row) => ({
    id: `${spec.rowAction}.${row.id}`,
    label: row.detail ? `${row.label} ${row.detail}` : row.label,
    ...row.lockedReason ? { enabled: false, disabledReason: row.lockedReason } : {}
  })) : [];
  const lines = [
    `\u6CE2 ${input.view.wave}`,
    `\u94B1 ${input.view.gold}`,
    ...input.view.deltas.map((d) => `${d.label} ${d.before} \u2192 ${d.after}`)
  ];
  return buildStateModel({
    screenId: input.kind,
    state: input.state,
    accessibleName: spec.accessibleName,
    reason: input.reason,
    emptyHint: input.state === "empty" ? spec.emptyHint : void 0,
    // 主行动就是安全继续路径，永不禁用（loading 由状态层统一压禁）。
    primaryAction: { id: spec.continueAction, label: spec.continueLabel },
    secondaryActions: rowActions,
    lines
  });
}

// src/screens/outcome.ts
var OUTCOME_ACTIONS = Object.freeze({
  commit: "outcome.commit",
  lobby: "outcome.lobby",
  skip: "outcome.skip",
  retryArt: "outcome.retry-art"
});
var SPECS3 = Object.freeze({
  defeat: {
    accessibleName: "\u8D25\u5C40",
    commitLabel: "\u8BB0\u4E0B\u8FD9\u4E00\u5C40",
    emptyHint: "\u8FD9\u4E00\u5C40\u6CA1\u6709\u7559\u4E0B\u660E\u7EC6\uFF0C\u4ECD\u53EF\u8BB0\u4E0B\u5E76\u56DE\u5385",
    reveals: false
  },
  victory: {
    accessibleName: "\u80DC\u5C40",
    commitLabel: "\u6536\u4E0B\u8FD9\u4E00\u5C40",
    emptyHint: "\u8FD9\u4E00\u5C40\u6CA1\u6709\u7559\u4E0B\u660E\u7EC6\uFF0C\u4ECD\u53EF\u6536\u4E0B\u5E76\u56DE\u5385",
    reveals: false
  },
  hatch: {
    accessibleName: "\u5B75\u5316",
    commitLabel: "\u6536\u4E0B\u8FD9\u4E00\u53EA",
    emptyHint: "\u86CB\u8FD8\u6CA1\u6709\u52A8\u9759\uFF0C\u7A0D\u540E\u518D\u6765",
    reveals: true
  }
});
function buildOutcomeModel(input) {
  const spec = SPECS3[input.kind];
  if (!spec) {
    throw new Error(`unknown outcome kind: ${String(input.kind)}`);
  }
  const view = input.view;
  const commit = {
    id: OUTCOME_ACTIONS.commit,
    label: spec.commitLabel,
    ...view.committed ? { enabled: false, disabledReason: "\u5DF2\u7ECF\u8BB0\u4E0B\u4E86\uFF0C\u4E0D\u4F1A\u91CD\u590D\u8BA1\u5165" } : view.art === "loading" ? { enabled: false, disabledReason: "\u6B63\u5728\u8F7D\u5165\uFF0C\u7A0D\u7B49\u4E00\u4E0B" } : {}
  };
  const secondary = [{ id: OUTCOME_ACTIONS.lobby, label: "\u56DE\u5385" }];
  if (spec.reveals && !input.skipped) {
    secondary.push({ id: OUTCOME_ACTIONS.skip, label: "\u8DF3\u8FC7" });
  }
  if (view.art === "error") {
    secondary.push({ id: OUTCOME_ACTIONS.retryArt, label: "\u91CD\u8BD5\u7ACB\u7ED8" });
  }
  const reveal = spec.reveals ? view.hatched : view.details;
  const lines = [
    view.won ? "\u8D62\u4E86\u8FD9\u4E00\u5C40" : "\u8FD9\u4E00\u5C40\u5230\u6B64\u4E3A\u6B62",
    `\u6CE2 ${view.wave}`,
    `\u94B1 ${view.gold}`,
    ...reveal.map((line) => `${line.label} ${line.value}`)
  ];
  return buildStateModel({
    screenId: input.kind,
    state: input.state,
    accessibleName: spec.accessibleName,
    reason: input.reason,
    emptyHint: input.state === "empty" ? spec.emptyHint : void 0,
    primaryAction: commit,
    secondaryActions: secondary,
    lines
  });
}

// src/dispatch.ts
var ROUTES = Object.freeze({
  [TITLE_ACTIONS.startRun]: "mode",
  [TITLE_ACTIONS.openSettings]: "settings",
  [TITLE_ACTIONS.openCodex]: "codex-list",
  [TITLE_ACTIONS.openEggs]: "eggs",
  [TITLE_ACTIONS.openAchievements]: "achievements",
  [TITLE_ACTIONS.openStats]: "stats",
  [TITLE_ACTIONS.openSlots]: "slots",
  [TITLE_ACTIONS.openGlossary]: "glossary"
});
function resolveAction(actionId) {
  const route = ROUTES[actionId];
  if (route) {
    return Object.freeze({ kind: "route", to: route });
  }
  if (actionId.startsWith(MODE_ACTION_PREFIX)) {
    const mode = actionId.slice(MODE_ACTION_PREFIX.length);
    if (mode) {
      return Object.freeze({
        kind: "command",
        command: "select-mode",
        payload: Object.freeze({ mode })
      });
    }
  }
  const lobby = resolveLobbyAction(actionId);
  if (lobby) {
    return lobby;
  }
  const live = resolveLiveRunAction(actionId);
  if (live) {
    return live;
  }
  throw new Error(`unknown action: ${actionId || "(empty)"}`);
}
function command(name, payload = {}) {
  return Object.freeze({
    kind: "command",
    command: name,
    payload: Object.freeze(payload)
  });
}
function resolveLiveRunAction(actionId) {
  const NULLARY = /* @__PURE__ */ new Set([
    "battle.art",
    "battle.party",
    "battle.bag",
    "battle.flee",
    "summary.continue",
    "shop.leave",
    "omen.skip",
    "map.rest",
    "outcome.commit",
    "outcome.lobby",
    "outcome.skip",
    "outcome.retry-art",
    "starter.confirm",
    "starter.back",
    "starter.retry-art",
    "overlay.cancel"
  ]);
  if (NULLARY.has(actionId)) {
    return command(actionId);
  }
  const OVERLAY_NS = ["arts", "switch", "party", "bag", "target", "catch"];
  for (const ns of OVERLAY_NS) {
    const pickPrefix = `${ns}.pick.`;
    const inspectPrefix = `${ns}.inspect.`;
    const usePrefix = `${ns}.use.`;
    const throwPrefix = `${ns}.throw.`;
    for (const [prefix, verb] of [
      [pickPrefix, "pick"],
      [inspectPrefix, "inspect"],
      [usePrefix, "use"],
      [throwPrefix, "throw"]
    ]) {
      if (actionId.startsWith(prefix)) {
        const arg = actionId.slice(prefix.length);
        if (arg === "confirm") {
          return command(`${ns}.confirm`);
        }
        if (arg) {
          return command(`${ns}.${verb}`, { id: arg });
        }
      }
    }
  }
  for (const [prefix, name] of [
    ["shop.buy.", "shop.buy"],
    ["map.enter.", "map.enter"],
    ["starter.pick.", "starter.pick"],
    ["omen.pick.", "omen.pick"]
  ]) {
    if (actionId.startsWith(prefix)) {
      const id = actionId.slice(prefix.length);
      if (id) {
        return command(name, { id });
      }
    }
  }
  return null;
}
function resolveLobbyAction(actionId) {
  const known = new Set(Object.values(LOBBY_ACTIONS));
  for (const base of known) {
    if (actionId === base) {
      return Object.freeze({
        kind: "command",
        command: base,
        payload: Object.freeze({})
      });
    }
    if (actionId.startsWith(`${base}.`)) {
      const arg = actionId.slice(base.length + 1);
      if (arg) {
        return Object.freeze({
          kind: "command",
          command: base,
          payload: Object.freeze({ arg })
        });
      }
    }
  }
  if (actionId.startsWith("settings.tab.")) {
    const tab = actionId.slice("settings.tab.".length);
    if (tab) {
      return Object.freeze({
        kind: "command",
        command: "settings.select-tab",
        payload: Object.freeze({ tab })
      });
    }
  }
  return null;
}

// src/overlay-stack.ts
var OVERLAY_SCREENS = ["arts", "switch", "party", "bag", "target", "catch"];
var OVERLAY_SET = new Set(OVERLAY_SCREENS);
function emptyOverlayStack() {
  return Object.freeze({ layers: Object.freeze([]) });
}
function topOverlay(stack) {
  return stack.layers.length === 0 ? null : stack.layers[stack.layers.length - 1];
}
function openOverlay(stack, layer) {
  if (!OVERLAY_SET.has(layer.screenId)) {
    throw new Error(`not an overlay screen: ${layer.screenId}`);
  }
  const top = topOverlay(stack);
  if (top && top.screenId === layer.screenId) {
    throw new Error(`overlay ${layer.screenId} is already open`);
  }
  return Object.freeze({
    layers: Object.freeze([...stack.layers, Object.freeze({ ...layer })])
  });
}
function closeOverlay(stack) {
  const top = topOverlay(stack);
  if (!top) {
    return Object.freeze({ stack: emptyOverlayStack(), focusActionId: null });
  }
  return Object.freeze({
    stack: Object.freeze({ layers: Object.freeze(stack.layers.slice(0, -1)) }),
    focusActionId: top.triggerActionId
  });
}

// src/audit/matrix.ts
var ORIENTATIONS = ["portrait", "landscape"];
function cellKey(cell) {
  return `${cell.screenId}|${cell.state}|${cell.orientation}`;
}
function expectedMatrix() {
  const cells = [];
  for (const screenId of SCREEN_IDS) {
    for (const state of STATE_IDS) {
      for (const orientation of ORIENTATIONS) {
        cells.push(Object.freeze({ screenId, state, orientation }));
      }
    }
  }
  return Object.freeze(cells);
}
var MATRIX_SIZE = SCREEN_IDS.length * STATE_IDS.length * ORIENTATIONS.length;
function auditMatrix(covered) {
  const have = new Set(covered.map(cellKey));
  const gaps = [];
  for (const screenId of SCREEN_IDS) {
    const screenCells = expectedMatrix().filter((c) => c.screenId === screenId);
    const missing = screenCells.filter((c) => !have.has(cellKey(c)));
    if (missing.length === 0) {
      continue;
    }
    if (missing.length === screenCells.length) {
      gaps.push({ kind: "screen", detail: screenId });
      continue;
    }
    for (const state of STATE_IDS) {
      const stateCells = screenCells.filter((c) => c.state === state);
      const stateMissing = stateCells.filter((c) => !have.has(cellKey(c)));
      if (stateMissing.length === stateCells.length) {
        gaps.push({ kind: "state", detail: `${screenId}/${state}` });
      } else {
        for (const cell of stateMissing) {
          gaps.push({ kind: "orientation", detail: `${screenId}/${state}/${cell.orientation}` });
        }
      }
    }
  }
  const covered0 = expectedMatrix().filter((c) => have.has(cellKey(c))).length;
  return Object.freeze({
    expected: MATRIX_SIZE,
    covered: covered0,
    gaps: Object.freeze(gaps),
    ok: gaps.length === 0 && covered0 === MATRIX_SIZE
  });
}

// src/audit/a11y-audit.ts
function auditA11y(input) {
  const findings = [];
  let checked = 0;
  for (const item of input.contrast ?? []) {
    checked += 1;
    const role = item.role ?? "body";
    const ratio = contrastRatio(item.fg, item.bg);
    const need = thresholdFor(role);
    if (!Number.isFinite(ratio)) {
      findings.push({ kind: "contrast", label: item.label, detail: "\u914D\u8272\u65E0\u6CD5\u8BA1\u7B97\u5BF9\u6BD4\u5EA6" });
      continue;
    }
    if (ratio < need) {
      findings.push({
        kind: "contrast",
        label: item.label,
        detail: `${ratio.toFixed(2)}:1 \u4F4E\u4E8E ${need}:1`
      });
    }
  }
  for (const item of input.hitAreas ?? []) {
    checked += 1;
    if (!hitAreaOk(item.box)) {
      findings.push({
        kind: "hit-area",
        label: item.label,
        detail: `${item.box.width}x${item.box.height} \u5C0F\u4E8E ${MIN_HIT_SIZE}`
      });
    }
  }
  for (const item of input.focus ?? []) {
    checked += 1;
    const seen = /* @__PURE__ */ new Set();
    for (const id of item.order) {
      if (seen.has(id)) {
        findings.push({ kind: "focus", label: item.label, detail: `\u7126\u70B9\u987A\u5E8F\u91CD\u590D ${id}` });
      }
      seen.add(id);
    }
    const disabled = new Set(item.disabled);
    for (const id of item.order) {
      if (disabled.has(id)) {
        findings.push({ kind: "focus", label: item.label, detail: `\u7126\u70B9\u505C\u5728\u7981\u7528\u9879 ${id}` });
      }
    }
    if (item.order.length === 0) {
      findings.push({ kind: "focus", label: item.label, detail: "\u7126\u70B9\u987A\u5E8F\u4E3A\u7A7A" });
    }
  }
  for (const item of input.textScale ?? []) {
    checked += 1;
    if (!fitsScaledText({
      box: item.box,
      fontSize: item.fontSize,
      lines: item.lines,
      scale: item.scale
    })) {
      findings.push({
        kind: "text-scale",
        label: item.label,
        detail: `${item.scale * 100}% \u6587\u672C\u6EA2\u51FA`
      });
    }
  }
  for (const item of input.motion ?? []) {
    checked += 1;
    const capped = motionDurationMs(item.durationMs, item.reduceMotion);
    if (item.reduceMotion && capped > MOTION.reducedMaxMs) {
      findings.push({
        kind: "motion",
        label: item.label,
        detail: `${capped} ms \u8D85\u8FC7\u51CF\u5C11\u52A8\u6548\u4E0A\u9650 ${MOTION.reducedMaxMs} ms`
      });
    }
  }
  return Object.freeze({
    checked,
    findings: Object.freeze(findings),
    ok: findings.length === 0
  });
}

// src/audit/budget.ts
var BUDGET = Object.freeze({
  /** 峰值 Draw Call 上限。 */
  maxDrawCalls: 120,
  /** 主包字节上限：4 MiB。 */
  maxMainPackBytes: 4 * 1024 * 1024,
  /** 帧率下限（95 分位）。 */
  minFps: 50,
  /** 运行内存上限：MiB。 */
  maxMemoryMiB: 350
});
function auditBudget(samples) {
  const violations = [];
  for (const sample of samples) {
    if (sample.drawCalls !== void 0 && sample.drawCalls > BUDGET.maxDrawCalls) {
      violations.push({
        label: sample.label,
        metric: "drawCalls",
        actual: sample.drawCalls,
        limit: BUDGET.maxDrawCalls
      });
    }
    if (sample.mainPackBytes !== void 0 && sample.mainPackBytes > BUDGET.maxMainPackBytes) {
      violations.push({
        label: sample.label,
        metric: "mainPackBytes",
        actual: sample.mainPackBytes,
        limit: BUDGET.maxMainPackBytes
      });
    }
    if (sample.fps !== void 0 && sample.fps < BUDGET.minFps) {
      violations.push({
        label: sample.label,
        metric: "fps",
        actual: sample.fps,
        limit: BUDGET.minFps
      });
    }
    if (sample.memoryMiB !== void 0 && sample.memoryMiB > BUDGET.maxMemoryMiB) {
      violations.push({
        label: sample.label,
        metric: "memoryMiB",
        actual: sample.memoryMiB,
        limit: BUDGET.maxMemoryMiB
      });
    }
  }
  return Object.freeze({
    checked: samples.length,
    violations: Object.freeze(violations),
    ok: violations.length === 0
  });
}
export {
  BATTLE_ACTIONS,
  BUDGET,
  COLOR,
  CONTRAST_BODY,
  CONTRAST_LARGE,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  DIAGNOSTICS_SCREEN_ID,
  LOBBY_ACTIONS,
  MATRIX_SIZE,
  MIN_HIT_SIZE,
  MODE_ACTION_PREFIX,
  MOTION,
  ORIENTATIONS,
  OUTCOME_ACTIONS,
  OVERLAY_ACTIONS,
  OVERLAY_SCREENS,
  PROGRESS_ACTIONS,
  RADIUS,
  SCREEN_IDS,
  SCREEN_MANIFEST,
  SPACE,
  STARTER_ACTIONS,
  STATE_IDS,
  TITLE_ACTIONS,
  TYPE,
  assertContrast,
  assertHitArea,
  auditA11y,
  auditBudget,
  auditMatrix,
  buildAchievementsModel,
  buildBattleModel,
  buildCodexEntryModel,
  buildCodexListModel,
  buildDiagnosticsModel,
  buildEggsModel,
  buildGlossaryModel,
  buildModeModel,
  buildOutcomeModel,
  buildOverlayModel,
  buildProgressModel,
  buildResponsiveFrame,
  buildScreenModel,
  buildSettingsModel,
  buildSlotsModel,
  buildStarterModel,
  buildStateModel,
  buildStatsModel,
  buildTitleModel,
  buildViewport,
  cellKey,
  closeOverlay,
  contrastRatio,
  emptyOverlayStack,
  expectedMatrix,
  fitsScaledText,
  hitAreaOk,
  isPresentationOwned,
  isScreenId,
  motionDurationMs,
  openOverlay,
  relativeLuminance,
  resolveAction,
  selectRenderer,
  thresholdFor,
  toHex,
  toRgba,
  topOverlay,
  truncationFor,
  withRenderer
};

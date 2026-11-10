/**
 * 战斗页几何。中心点坐标，原点在内容框中心，y 向上。
 * 横屏时立绘和名牌按左栏宽度算，否则名牌（W/2）会盖住右栏的命令。
 */
import type { ResponsiveFrame } from "../responsive.ts";
import { SPACE } from "../tokens.ts";
import type { LayoutBox } from "./box.ts";

const TOP_H = 64;
const COMMAND_H = 100;
const LOG_H = 84;
const PLATE_H = 112;
/** 物品栏高度：一行图标，图标边长不低于最小点击区。 */
const ITEM_BAR_H = 52;
const ITEM_SIZE = 48;

export interface BattleLayout {
  readonly topBar: LayoutBox;
  readonly foePlate: LayoutBox;
  readonly foeArt: LayoutBox;
  readonly allyArt: LayoutBox;
  readonly allyPlate: LayoutBox;
  /** 已获得物品栏，在顶栏下面。没有物品时也留着，避免第一件物品出现时整个战场跳一下。 */
  readonly items: LayoutBox;
  readonly log: LayoutBox;
  /** 顺序 术 / 队伍 / 囊 / 走，2×2。 */
  readonly commands: readonly [LayoutBox, LayoutBox, LayoutBox, LayoutBox];
}

function box(x: number, y: number, width: number, height: number): LayoutBox {
  return { x, y, width, height };
}

/** 2×2 命令。areaWidth 含左右边，按钮之间留一个 pad。底边贴着 bottomY 再上移 pad。 */
function commandGrid(
  originX: number,
  areaWidth: number,
  bottomY: number,
  pad: number,
): readonly [LayoutBox, LayoutBox, LayoutBox, LayoutBox] {
  const commandW = (areaWidth - pad) / 2;
  const bottomRowY = bottomY + pad + COMMAND_H / 2;
  const topRowY = bottomRowY + COMMAND_H + SPACE.md;
  const leftX = originX - areaWidth / 2 + commandW / 2;
  const rightX = originX + areaWidth / 2 - commandW / 2;
  return [
    box(leftX, topRowY, commandW, COMMAND_H),
    box(rightX, topRowY, commandW, COMMAND_H),
    box(leftX, bottomRowY, commandW, COMMAND_H),
    box(rightX, bottomRowY, commandW, COMMAND_H),
  ];
}

function fieldActors(
  fieldLeft: number,
  fieldRight: number,
  fieldTop: number,
  fieldBottom: number,
  spanW: number,
): Pick<BattleLayout, "foePlate" | "foeArt" | "allyArt" | "allyPlate"> {
  const pad = SPACE.lg;
  const fieldW = fieldRight - fieldLeft;
  const fieldH = fieldTop - fieldBottom;
  // 名牌窄一点（够放名字、血条和数字），把横向空间让给立绘；立绘和名牌同一行不重叠。
  const plateW = Math.min(spanW / 2 - pad, Math.max(260, fieldW * 0.42));
  const artRoom = fieldW - plateW - SPACE.md;
  const foeSize = Math.min(artRoom, fieldH * 0.48);
  const allySize = Math.min(artRoom, fieldH * 0.5);

  return {
    foePlate: box(fieldLeft + plateW / 2, fieldTop - PLATE_H / 2, plateW, PLATE_H),
    foeArt: box(fieldRight - foeSize / 2, fieldTop - foeSize / 2, foeSize, foeSize),
    allyArt: box(fieldLeft + allySize / 2, fieldBottom + allySize / 2, allySize, allySize),
    allyPlate: box(fieldRight - plateW / 2, fieldBottom + PLATE_H / 2, plateW, PLATE_H),
  };
}

export function battleLayout(frame: ResponsiveFrame): BattleLayout {
  const pad = SPACE.lg;
  const width = frame.content.width;
  const height = frame.content.height;
  const topBar = box(0, height / 2 - pad - TOP_H / 2, width - pad * 2, TOP_H);

  if (frame.mode === "landscape") {
    const columnW = (width - pad * 2 - pad) / 2;
    const rightX = width / 2 - pad - columnW / 2;
    const commands = commandGrid(rightX, columnW, -height / 2, pad);
    const commandTop = commands[0].y + COMMAND_H / 2;
    const log = box(rightX, commandTop + pad + LOG_H / 2, columnW, LOG_H);
    const items = box(0, topBar.y - TOP_H / 2 - SPACE.sm - ITEM_BAR_H / 2, width - pad * 2, ITEM_BAR_H);
    const fieldTop = items.y - ITEM_BAR_H / 2 - SPACE.sm;
    const fieldBottom = -height / 2 + pad;
    const fieldLeft = -width / 2 + pad;
    const fieldRight = fieldLeft + columnW;
    return {
      topBar,
      items,
      log,
      commands,
      ...fieldActors(fieldLeft, fieldRight, fieldTop, fieldBottom, columnW),
    };
  }

  const commands = commandGrid(0, width - pad * 2, -height / 2, pad);
  const commandTop = commands[0].y + COMMAND_H / 2;
  const log = box(0, commandTop + pad + LOG_H / 2, width - pad * 2, LOG_H);
  const items = box(0, topBar.y - TOP_H / 2 - SPACE.sm - ITEM_BAR_H / 2, width - pad * 2, ITEM_BAR_H);
  const fieldTop = items.y - ITEM_BAR_H / 2 - SPACE.sm;
  const fieldBottom = log.y + LOG_H / 2 + pad;
  return {
    topBar,
    items,
    log,
    commands,
    ...fieldActors(-width / 2 + pad, width / 2 - pad, fieldTop, fieldBottom, width),
  };
}

export interface BattlePanelLayout {
  /** 选项行，左→右、上→下排。前四个占原来四个命令的位置，其余往上再加行。 */
  readonly skills: readonly LayoutBox[];
  /** 底部操作行（确认、返回、放过等），在原来战况栏的位置。 */
  readonly actions: readonly LayoutBox[];
}

/**
 * 战斗里所有选择面板（术、换位、队伍、囊、目标、镇物）的几何。不切整页：
 * 命令区原地变成选项列表，战况栏变成操作行。前四个选项和原来的四个命令重合。
 * 选项超过四个时向上加行，但永远不会压到立绘、名牌、顶栏和物品栏：
 * 放不下的部分由调用方截掉（rowCapacity 给出能放几个）。
 */
export function battlePanelLayout(frame: ResponsiveFrame, rowCount: number, actionCount: number): BattlePanelLayout {
  const layout = battleLayout(frame);
  const cap = battlePanelRowCapacity(frame);
  const count = Math.max(0, Math.min(rowCount, cap));
  const gridCols = 2;
  const base = layout.commands;
  const colW = base[0].width;
  const rowH = COMMAND_H;
  const rowGap = SPACE.md;
  // 以原命令区的下行为最后一行、往上堆：选项少于等于四个时，第一行就落在原命令区的上行（与旧位置重合）；
  // 超过四个时第一行往上移。这样一定没有两行重叠。
  const totalRows = Math.ceil(count / gridCols);
  const bottomRowY = base[2].y;
  const skills: LayoutBox[] = [];
  for (let index = 0; index < count; index++) {
    const col = index % gridCols;
    const row = Math.floor(index / gridCols);
    const y = bottomRowY + (totalRows - 1 - row) * (rowH + rowGap);
    skills.push(box(col === 0 ? base[0].x : base[1].x, y, colW, rowH));
  }
  // 操作行始终在选项的正上方一行：选项≤四个时它就落在原战况栏的位置，
  // 选项更多时跟着往上推，不会和选项行重叠。
  const log = layout.log;
  const gap = SPACE.md;
  const actionY = log.y + Math.max(0, totalRows - 2) * (rowH + rowGap);
  const actions: LayoutBox[] = [];
  const left = log.x - log.width / 2;
  if (actionCount <= 1) {
    actions.push(box(log.x, actionY, log.width, log.height));
  } else {
    const first = (log.width - gap * (actionCount - 1)) * (actionCount === 2 ? 0.6 : 0.4);
    const rest = (log.width - gap * (actionCount - 1) - first) / (actionCount - 1);
    let x = left;
    for (let index = 0; index < actionCount; index++) {
      const width = index === 0 ? first : rest;
      actions.push(box(x + width / 2, actionY, width, log.height));
      x += width + gap;
    }
  }
  return { skills, actions };
}

/**
 * 面板一屏最多能放几个选项（按两列、至少两行算）。上限以「不压到立绘/名牌/物品栏」为准：
 * 竖屏时面板在立绘正下方，空间是命令区底边到我方立绘/名牌底边之间（这段空间已包括操作行）；
 * 横屏时面板在右列，空间是命令区底边到物品栏底边。
 */
export function battlePanelRowCapacity(frame: ResponsiveFrame): number {
  const layout = battleLayout(frame);
  const gridCols = 2;
  const rowH = COMMAND_H;
  const rowGap = SPACE.md;
  const bottomEdge = layout.commands[2].y - rowH / 2;
  const ceiling =
    frame.mode === "landscape"
      ? layout.items.y - layout.items.height / 2 - SPACE.sm
      : Math.min(
          layout.allyArt.y - layout.allyArt.height / 2,
          layout.allyPlate.y - layout.allyPlate.height / 2,
        ) - SPACE.sm;
  // 一行操作行（高 LOG_H）要占在最上面。
  const usable = ceiling - bottomEdge - LOG_H - rowGap;
  const rows = Math.max(2, Math.floor((usable + rowGap) / (rowH + rowGap)));
  return rows * gridCols;
}

/**
 * 物品栏里每个图标的格子。从左往右排。放不下时最后一格换成「+N」，
 * N 是被折起来的件数（点「+N」可以展开，由调用方决定）。
 */
export function battleItemSlots(frame: ResponsiveFrame, count: number): { slots: LayoutBox[]; overflow: number } {
  const bar = battleLayout(frame).items;
  const gap = SPACE.xs;
  const perRow = Math.max(1, Math.floor((bar.width + gap) / (ITEM_SIZE + gap)));
  const shown = count <= perRow ? count : perRow;
  const slots: LayoutBox[] = [];
  const left = bar.x - bar.width / 2;
  for (let index = 0; index < shown; index++) {
    slots.push(box(left + ITEM_SIZE / 2 + index * (ITEM_SIZE + gap), bar.y, ITEM_SIZE, ITEM_SIZE));
  }
  return { slots, overflow: count <= perRow ? 0 : count - perRow + 1 };
}

/** 悬浮说明框：在图标下方，横向尽量居中到图标上但不出屏。 */
export function itemTooltipBox(anchor: LayoutBox, frame: ResponsiveFrame): LayoutBox {
  const width = Math.min(frame.content.width - SPACE.lg * 2, 360);
  const height = 96;
  const half = frame.content.width / 2;
  const x = Math.max(-half + SPACE.lg + width / 2, Math.min(half - SPACE.lg - width / 2, anchor.x));
  const y = anchor.y - anchor.height / 2 - SPACE.sm - height / 2;
  return box(x, y, width, height);
}

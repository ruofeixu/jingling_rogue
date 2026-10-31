/**
 * 战斗页几何。中心点坐标，原点在内容框中心，y 向上。
 * 横屏时立绘和名牌按左栏宽度算，否则名牌（W/2）会盖住右栏的命令。
 */
import type { ResponsiveFrame } from "../responsive.ts";
import { SPACE } from "../tokens.ts";
import type { LayoutBox } from "./box.ts";

const TOP_H = 52;
const COMMAND_H = 88;
const LOG_H = 72;
const PLATE_H = 96;

export interface BattleLayout {
  readonly topBar: LayoutBox;
  readonly foePlate: LayoutBox;
  readonly foeArt: LayoutBox;
  readonly allyArt: LayoutBox;
  readonly allyPlate: LayoutBox;
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
  const plateW = spanW / 2 - pad;
  const foeSize = Math.min(spanW * 0.42, fieldH * 0.45);
  const allySize = Math.min(spanW * 0.46, fieldH * 0.5);

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
    const fieldTop = topBar.y - TOP_H / 2 - pad;
    const fieldBottom = -height / 2 + pad;
    const fieldLeft = -width / 2 + pad;
    const fieldRight = fieldLeft + columnW;
    return {
      topBar,
      log,
      commands,
      ...fieldActors(fieldLeft, fieldRight, fieldTop, fieldBottom, columnW),
    };
  }

  const commands = commandGrid(0, width - pad * 2, -height / 2, pad);
  const commandTop = commands[0].y + COMMAND_H / 2;
  const log = box(0, commandTop + pad + LOG_H / 2, width - pad * 2, LOG_H);
  const fieldTop = topBar.y - TOP_H / 2 - pad;
  const fieldBottom = log.y + LOG_H / 2 + pad;
  return {
    topBar,
    log,
    commands,
    ...fieldActors(-width / 2 + pad, width / 2 - pad, fieldTop, fieldBottom, width),
  };
}

/**
 * 标题页几何。中心点坐标，原点在内容框中心，y 向上。
 * 竖屏把吉祥物放在标题和主按钮之间；横屏左栏是吉祥物，右栏是菜单。
 */
import type { ResponsiveFrame } from "../responsive.ts";
import { SPACE } from "../tokens.ts";
import type { LayoutBox } from "./box.ts";

const TITLE_H = 56;
const SUBTITLE_H = 40;
const PRIMARY_H = 76;
const CELL_H = 60;
const HINT_H = 36;

export interface TitleLayout {
  readonly title: LayoutBox;
  readonly subtitle: LayoutBox;
  readonly mascot: LayoutBox;
  readonly primary: LayoutBox;
  readonly hint: LayoutBox;
  readonly grid: readonly LayoutBox[];
}

function box(x: number, y: number, width: number, height: number): LayoutBox {
  return { x, y, width, height };
}

function rowsOf(count: number): number {
  return Math.max(0, Math.ceil(count / 2));
}

function gridHeight(count: number, gap: number): number {
  const rows = rowsOf(count);
  if (rows === 0) {
    return 0;
  }
  return rows * CELL_H + (rows - 1) * gap;
}

/** 顶边为 top，两列，短的末行仍跟左列对齐。 */
function gridBoxes(originX: number, top: number, count: number, cellW: number, gap: number): LayoutBox[] {
  const gridW = cellW * 2 + gap;
  const left = originX - gridW / 2;
  const boxes: LayoutBox[] = [];
  for (let index = 0; index < count; index++) {
    const col = index % 2;
    const row = Math.floor(index / 2);
    boxes.push(
      box(left + cellW / 2 + col * (cellW + gap), top - CELL_H / 2 - row * (CELL_H + gap), cellW, CELL_H),
    );
  }
  return boxes;
}

function portraitLayout(width: number, height: number, count: number): TitleLayout {
  const pad = SPACE.lg;
  const gap = SPACE.md;
  const contentW = width - pad * 2;
  const menuH = gridHeight(count, gap);
  const fixed = TITLE_H + SUBTITLE_H + PRIMARY_H + menuH + HINT_H;
  const room = height - pad * 2 - fixed - gap * 5;
  const mascotH = Math.min(contentW, height * 0.4, Math.max(height * 0.2, room));
  const extra = height - pad * 2 - fixed - mascotH - gap * 5;
  const step = gap + Math.max(0, extra) / 5;

  let edge = height / 2 - pad;
  const take = (blockH: number, blockW: number): LayoutBox => {
    const placed = box(0, edge - blockH / 2, blockW, blockH);
    edge -= blockH + step;
    return placed;
  };

  const title = take(TITLE_H, contentW);
  const subtitle = take(SUBTITLE_H, contentW * 0.62);
  const mascot = take(mascotH, mascotH);
  const primary = take(PRIMARY_H, contentW);
  const cells = gridBoxes(0, edge, count, (contentW - gap) / 2, gap);
  edge -= menuH + step;
  const hint = take(HINT_H, contentW);
  return { title, subtitle, mascot, primary, hint, grid: cells };
}

function landscapeLayout(width: number, height: number, count: number): TitleLayout {
  const pad = SPACE.lg;
  const gap = SPACE.md;
  const columnW = (width - pad * 3) / 2;
  const leftX = -width / 2 + pad + columnW / 2;
  const rightX = width / 2 - pad - columnW / 2;
  const hint = box(0, -height / 2 + pad + HINT_H / 2, width - pad * 2, HINT_H);

  const columnTop = height / 2 - pad;
  const columnBottom = hint.y + HINT_H / 2 + gap;
  const title = box(leftX, columnTop - TITLE_H / 2, columnW, TITLE_H);
  const subtitle = box(leftX, title.y - TITLE_H / 2 - gap - SUBTITLE_H / 2, columnW * 0.8, SUBTITLE_H);
  const mascotTop = subtitle.y - SUBTITLE_H / 2 - gap;
  const mascotRoom = mascotTop - columnBottom;
  const mascotSize = Math.min(columnW, Math.max(height * 0.2, mascotRoom));
  const mascot = box(leftX, columnBottom + (mascotTop - columnBottom) / 2, mascotSize, mascotSize);

  const primary = box(rightX, columnTop - PRIMARY_H / 2, columnW, PRIMARY_H);
  const cells = gridBoxes(rightX, primary.y - PRIMARY_H / 2 - gap, count, (columnW - gap) / 2, gap);
  return { title, subtitle, mascot, primary, hint, grid: cells };
}

export function titleLayout(frame: ResponsiveFrame, secondaryCount: number): TitleLayout {
  const width = frame.content.width;
  const height = frame.content.height;
  if (frame.mode === "landscape") {
    return landscapeLayout(width, height, secondaryCount);
  }
  return portraitLayout(width, height, secondaryCount);
}

/**
 * 选宠页几何。中心点坐标，原点在内容框中心，y 向上。
 * 确认钮钉在底部，卡片吃掉标题和详情之间的中段。
 */
import type { ResponsiveFrame } from "../responsive.ts";
import { SPACE } from "../tokens.ts";
import type { LayoutBox } from "./box.ts";

const TITLE_H = 72;
const DETAIL_H = 160;
const BUTTON_H = 88;

export interface StarterLayout {
  readonly title: LayoutBox;
  readonly cards: readonly LayoutBox[];
  readonly detail: LayoutBox;
  readonly confirm: LayoutBox;
  readonly back: LayoutBox;
}

function box(x: number, y: number, width: number, height: number): LayoutBox {
  return { x, y, width, height };
}

export function starterLayout(frame: ResponsiveFrame, cardCount: number): StarterLayout {
  const width = frame.content.width;
  const height = frame.content.height;
  const pad = SPACE.lg;
  const gap = SPACE.md;
  const cardGap = SPACE.lg;
  const contentW = width - pad * 2;

  const title = box(0, height / 2 - pad - TITLE_H / 2, contentW, TITLE_H);
  const buttonY = -height / 2 + pad + BUTTON_H / 2;
  const backW = contentW * 0.3;
  const confirmW = contentW - backW - gap;
  const back = box(-contentW / 2 + backW / 2, buttonY, backW, BUTTON_H);
  const confirm = box(contentW / 2 - confirmW / 2, buttonY, confirmW, BUTTON_H);
  const detail = box(0, buttonY + BUTTON_H / 2 + gap + DETAIL_H / 2, contentW, DETAIL_H);

  const bandTop = title.y - TITLE_H / 2 - gap;
  const bandBottom = detail.y + DETAIL_H / 2 + gap;
  const band = Math.max(0, bandTop - bandBottom);
  const cardH = Math.min(band, Math.max(height * 0.3, Math.min(height * 0.48, band)));
  const cardY = (bandTop + bandBottom) / 2;
  const count = Math.max(0, cardCount);
  const cardW = count > 0 ? (contentW - cardGap * (count - 1)) / count : 0;
  const cards: LayoutBox[] = [];
  for (let index = 0; index < count; index++) {
    const rowW = count * cardW + (count - 1) * cardGap;
    const x = -rowW / 2 + cardW / 2 + index * (cardW + cardGap);
    cards.push(box(x, cardY, cardW, cardH));
  }

  return { title, cards, detail, confirm, back };
}

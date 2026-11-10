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
  /** 每张卡的立绘方框（绝对坐标，正方形）。 */
  readonly arts: readonly LayoutBox[];
  /** 每张卡的选择按钮（绝对坐标）。竖屏在立绘右侧，横屏在卡片底部。 */
  readonly buttons: readonly LayoutBox[];
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
  const count = Math.max(0, cardCount);
  const inset = SPACE.sm;
  const btnH = SPACE.xl + SPACE.md;
  const cards: LayoutBox[] = [];
  const arts: LayoutBox[] = [];
  const buttons: LayoutBox[] = [];

  if (width < height) {
    // 竖屏：三张横向大卡上下排，左立绘、右名字与按钮。
    const cardH = count > 0
      ? Math.min((band - cardGap * (count - 1)) / count, contentW * 0.6)
      : 0;
    const stackH = count * cardH + Math.max(0, count - 1) * cardGap;
    const top = (bandTop + bandBottom) / 2 + stackH / 2;
    const side = cardH - inset * 2;
    for (let index = 0; index < count; index++) {
      const y = top - cardH / 2 - index * (cardH + cardGap);
      cards.push(box(0, y, contentW, cardH));
      const artX = -contentW / 2 + inset + side / 2;
      arts.push(box(artX, y, side, side));
      const textLeft = artX + side / 2 + inset;
      const textW = contentW / 2 - inset - textLeft;
      buttons.push(box(textLeft + textW / 2, y, textW, btnH));
    }
  } else {
    // 横屏：三列，立绘在上，按钮在卡片底部。
    const cardH = band;
    const cardY = (bandTop + bandBottom) / 2;
    const cardW = count > 0 ? (contentW - cardGap * (count - 1)) / count : 0;
    const side = Math.max(0, Math.min(cardW - inset * 2, cardH - btnH - inset * 3));
    for (let index = 0; index < count; index++) {
      const rowW = count * cardW + (count - 1) * cardGap;
      const x = -rowW / 2 + cardW / 2 + index * (cardW + cardGap);
      cards.push(box(x, cardY, cardW, cardH));
      arts.push(box(x, cardY + cardH / 2 - inset - side / 2, side, side));
      buttons.push(box(x, cardY - cardH / 2 + inset + btnH / 2, cardW - inset * 2, btnH));
    }
  }

  return { title, cards, arts, buttons, detail, confirm, back };
}

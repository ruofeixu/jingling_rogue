import { Color, Graphics, Node, UITransform } from "cc";
import {
  COLOR,
  SPACE,
  TYPE,
  battleItemSlots,
  itemTooltipBox,
  type BattleLayout,
  type ResponsiveFrame,
} from "../../vendor/jinglingPresentation";
import type { BattleItemView } from "../../vendor/jinglingCore";
import { makePanel } from "./Panel.ts";
import { addLabel } from "./Text.ts";

/** 长按多久显示说明（秒）。手机没有鼠标悬浮，用长按代替。 */
const LONG_PRESS_SEC = 0.35;

export interface ItemStripOptions {
  readonly frame: ResponsiveFrame;
  readonly items: readonly BattleItemView[];
  readonly textScale: number;
  /** 战斗布局（用来确认物品栏的位置）。 */
  readonly layout: BattleLayout;
}

function color(token: readonly number[], alpha = 255): Color {
  return new Color(token[0], token[1], token[2], alpha);
}

/**
 * 战斗界面上的已获得物品栏。每件物品一个缺省图标（宣纸底 + 类别一字 + 角标数量），有了真图标再换。
 * 鼠标悬浮或长按显示说明；放不下的折成「+N」，悬浮显示折起来的物品名。
 */
export function mountItemStrip(root: Node, opts: ItemStripOptions): Node {
  const strip = new Node("item-strip");
  strip.layer = root.layer;
  root.addChild(strip);

  const { slots, overflow } = battleItemSlots(opts.frame, opts.items.length);
  let tip: Node | null = null;

  const hideTip = (): void => {
    if (tip?.isValid) {
      tip.removeFromParent();
      tip.destroy();
    }
    tip = null;
  };
  const showTip = (index: number, text: string): void => {
    hideTip();
    const anchor = slots[index];
    if (!anchor) {
      return;
    }
    const box = itemTooltipBox(anchor, opts.frame);
    tip = makePanel(root, {
      name: "item-tooltip",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      // 说明框不透明：下面常压着名牌，透明会把名牌的字透出来。
      alpha: 255,
    });
    // 压在所有东西上面。
    tip.setSiblingIndex(root.children.length);
    addLabel(tip, {
      text,
      x: 0,
      y: 0,
      width: box.width - SPACE.lg,
      fontSize: TYPE.caption * opts.textScale,
      tone: "ink",
      wrap: true,
    });
  };

  const hiddenFrom = overflow > 0 ? slots.length - 1 : slots.length;
  slots.forEach((slot, index) => {
    const isMore = overflow > 0 && index === slots.length - 1;
    const item = isMore ? null : opts.items[index];
    const icon = new Node(isMore ? "item-more" : `item-${item?.id ?? index}`);
    icon.layer = root.layer;
    strip.addChild(icon);
    icon.addComponent(UITransform).setContentSize(slot.width, slot.height);
    icon.setPosition(slot.x, slot.y, 0);

    // 缺省图标：宣纸底、淡墨边，有遗物用朱砂边区分。
    const g = icon.addComponent(Graphics);
    g.rect(-slot.width / 2, -slot.height / 2, slot.width, slot.height);
    g.fillColor = color(COLOR.panel);
    g.fill();
    g.strokeColor = item?.source === "relic" ? color(COLOR.accent) : color(COLOR.ink, 150);
    g.lineWidth = SPACE.xs / 2;
    g.stroke();

    addLabel(icon, {
      text: isMore ? `+${overflow}` : (item?.tag ?? ""),
      x: 0,
      y: 0,
      width: slot.width,
      fontSize: TYPE.body * opts.textScale,
      tone: "ink",
    });
    if (item && item.count > 1) {
      addLabel(icon, {
        text: `×${item.count}`,
        x: slot.width / 2 - SPACE.md,
        y: -slot.height / 2 + SPACE.sm,
        width: slot.width / 2,
        fontSize: TYPE.caption * opts.textScale * 0.8,
        tone: "muted",
      });
    }

    const text = isMore
      ? opts.items.slice(hiddenFrom).map((it) => it.name).join("、")
      : item
        ? `${item.name}${item.count > 1 ? ` ×${item.count}` : ""}\n${item.hint}`
        : "";
    if (!text) {
      return;
    }
    // 鼠标悬浮
    icon.on(Node.EventType.MOUSE_ENTER, () => showTip(index, text), icon);
    icon.on(Node.EventType.MOUSE_LEAVE, hideTip, icon);
    // 长按（手机）
    let timer: ReturnType<typeof setTimeout> | null = null;
    icon.on(
      Node.EventType.TOUCH_START,
      () => {
        timer = setTimeout(() => showTip(index, text), LONG_PRESS_SEC * 1000);
      },
      icon,
    );
    const release = (): void => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      hideTip();
    };
    icon.on(Node.EventType.TOUCH_END, release, icon);
    icon.on(Node.EventType.TOUCH_CANCEL, release, icon);
  });

  return strip;
}

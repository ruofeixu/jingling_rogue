import { Color, Graphics, Node, Sprite, SpriteFrame, UIOpacity, UITransform } from "cc";
import {
  COLOR,
  SPACE,
  TYPE,
  buildResponsiveFrame,
  starterLayout,
  type Rgb,
  type ScreenModel,
  type Viewport,
} from "../../vendor/jinglingPresentation";
import { portraitFit } from "../../vendor/jinglingCore";
import { attachPortraitSprite } from "../../ui/portrait";
import { makeButton } from "../ui/Button.ts";
import { makePanel } from "../ui/Panel.ts";
import { addLabel } from "../ui/Text.ts";

export interface StarterRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly onAction?: (actionId: string) => void;
  /** 立绘 SpriteFrame 由壳层按 id 提供；缺失时只画卡片不画图，不做烘焙垫底。 */
  readonly frames?: Readonly<Record<string, SpriteFrame>>;
}

interface StarterMountModel extends ScreenModel {
  readonly selectedId: string | null;
}

function color(token: Rgb): Color {
  return new Color(token[0], token[1], token[2], 255);
}

/**
 * starter 页 renderer：三张候选卡横排，选中详情与单一确认来自 ScreenModel。
 * 立绘尺寸走 portraitFit，等比 contain。选中卡描主色并略放大，其余变淡。
 */
export class StarterScreen {
  private root: Node | null = null;

  mount(parent: Node, model: StarterMountModel, opts: StarterRenderOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const frame = buildResponsiveFrame(opts.viewport);
    const picks = model.secondaryActions.filter((action) => action.id.includes(".pick."));
    const others = model.secondaryActions.filter((action) => !action.id.includes(".pick."));
    const layout = starterLayout(frame, picks.length);

    const root = new Node("starter-screen");
    root.layer = parent.layer;
    parent.addChild(root);
    this.root = root;

    addLabel(root, {
      text: model.accessibleName,
      x: layout.title.x,
      y: layout.title.y,
      width: layout.title.width,
      fontSize: TYPE.title * scale,
      tone: "ink",
      heading: true,
    });

    const chosen = model.selectedId;
    picks.forEach((action, index) => {
      const slot = layout.cards[index];
      if (!slot) {
        return;
      }
      const spiritId = action.id.split(".").pop() ?? "";
      const selected = chosen !== null && chosen === spiritId;
      const card = makePanel(root, {
        name: `starter-card-${index}`,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
      });
      if (selected) {
        card.setScale(1.04, 1.04, 1);
        const outline = card.addComponent(Graphics);
        const halfW = slot.width / 2;
        const halfH = slot.height / 2;
        outline.rect(-halfW, -halfH, slot.width, slot.height);
        outline.lineWidth = SPACE.xs;
        outline.strokeColor = color(COLOR.accent);
        outline.stroke();
      } else if (chosen) {
        const fade = card.addComponent(UIOpacity);
        fade.opacity = 170;
      }

      const injected = opts.frames?.[spiritId];
      const artSlot = layout.arts[index] ?? slot;
      const btnSlot = layout.buttons[index] ?? slot;
      const boxW = artSlot.width;
      const boxH = artSlot.height;
      const artHolder = new Node("art-holder");
      artHolder.layer = root.layer;
      card.addChild(artHolder);
      artHolder.addComponent(UITransform);
      artHolder.setPosition(artSlot.x - slot.x, artSlot.y - slot.y, 0);
      if (injected) {
        const sprite = artHolder.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.type = Sprite.Type.SIMPLE;
        sprite.spriteFrame = injected;
        const imgW = injected.rect.width || injected.originalSize.width || boxW;
        const imgH = injected.rect.height || injected.originalSize.height || boxH;
        const fitted = portraitFit(boxW, boxH, imgW, imgH);
        artHolder.getComponent(UITransform)?.setContentSize(fitted.width, fitted.height);
      } else {
        attachPortraitSprite(artHolder, spiritId, boxW, boxH);
      }

      makeButton(
        card,
        {
          action,
          x: btnSlot.x - slot.x,
          y: btnSlot.y - slot.y,
          width: btnSlot.width,
          height: btnSlot.height,
          textScale: scale,
          primary: selected,
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    });

    const detail = makePanel(root, {
      name: "starter-detail",
      x: layout.detail.x,
      y: layout.detail.y,
      width: layout.detail.width,
      height: layout.detail.height,
    });
    // 详情四项排成两列两行：第一行名字和费用，第二行灵性和契印。叠成四行会撑出面板。
    const detailLines = [...(model.reason ? [model.reason] : []), ...model.lines];
    const lineH = TYPE.body * scale * TYPE.lineHeightRatio;
    const colW = (layout.detail.width - SPACE.lg * 3) / 2;
    const rowsUsed = Math.ceil(detailLines.length / 2);
    const top = (rowsUsed * lineH) / 2 - lineH / 2;
    detailLines.forEach((line, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      addLabel(detail, {
        text: line,
        x: (col === 0 ? -1 : 1) * (colW / 2 + SPACE.lg / 2),
        y: top - row * lineH,
        width: colW,
        fontSize: TYPE.body * scale,
        tone: row === 0 && col === 0 ? "ink" : "muted",
      });
    });

    if (model.primaryAction) {
      const action = model.primaryAction;
      makeButton(
        root,
        {
          action,
          x: layout.confirm.x,
          y: layout.confirm.y,
          width: layout.confirm.width,
          height: layout.confirm.height,
          primary: true,
          textScale: scale,
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    }

    const back = others[0];
    if (back) {
      makeButton(
        root,
        {
          action: back,
          x: layout.back.x,
          y: layout.back.y,
          width: layout.back.width,
          height: layout.back.height,
          textScale: scale,
        },
        back.enabled && opts.onAction ? () => opts.onAction?.(back.id) : undefined,
      );
    }

    return root;
  }

  unmount(): void {
    if (!this.root) {
      return;
    }
    this.root.removeFromParent();
    this.root.destroy();
    this.root = null;
  }

  isMounted(): boolean {
    return this.root !== null;
  }
}

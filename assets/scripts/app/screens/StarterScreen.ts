import { Node, Sprite, SpriteFrame, UITransform } from "cc";
import {
  SPACE,
  TYPE,
  buildResponsiveFrame,
  type ResponsiveFrame,
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

/**
 * starter 页 renderer：三张候选卡横排（横屏两栏时仍保持一行三卡），
 * 选中详情与单一确认来自 ScreenModel。立绘尺寸走 portraitFit，等比 contain。
 */
export class StarterScreen {
  private root: Node | null = null;

  mount(parent: Node, model: ScreenModel, opts: StarterRenderOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const frame: ResponsiveFrame = buildResponsiveFrame(opts.viewport);

    const root = new Node("starter-screen");
    root.layer = parent.layer;
    parent.addChild(root);
    this.root = root;

    addLabel(root, {
      text: model.accessibleName,
      x: 0,
      y: frame.content.height / 2 - SPACE.xl,
      width: frame.content.width - SPACE.xl,
      fontSize: TYPE.title * scale,
      tone: "ink",
    });

    const cards = model.secondaryActions.filter((a) => a.id.includes(".pick."));
    const others = model.secondaryActions.filter((a) => !a.id.includes(".pick."));

    const cardWidth = Math.min(
      (frame.content.width - SPACE.lg * (cards.length + 1)) / Math.max(1, cards.length),
      frame.content.width / 3,
    );
    const cardHeight = Math.min(cardWidth * 1.4, frame.content.height * 0.42);
    const cardsY = frame.content.height * 0.1;

    cards.forEach((action, index) => {
      const x = (index - (cards.length - 1) / 2) * (cardWidth + SPACE.lg);
      const card = makePanel(root, {
        name: `starter-card-${index}`,
        x,
        y: cardsY,
        width: cardWidth,
        height: cardHeight,
      });

      const spiritId = action.id.split(".").pop() ?? "";
      // 优先用宿主注入的 frame；否则直接从 portraits bundle 按需加载真实立绘。
      const injected = opts.frames?.[spiritId];
      const boxW = cardWidth - SPACE.lg;
      const boxH = cardHeight - SPACE.xl * 2;
      const artHolder = new Node("art-holder");
      artHolder.layer = root.layer;
      card.addChild(artHolder);
      artHolder.addComponent(UITransform);
      artHolder.setPosition(0, SPACE.md, 0);
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
          x: 0,
          y: -cardHeight / 2 + SPACE.xl,
          width: cardWidth - SPACE.md,
          height: SPACE.xl + SPACE.md,
          textScale: scale,
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    });

    let cursor = cardsY - cardHeight / 2 - SPACE.lg;
    if (model.reason) {
      addLabel(root, {
        text: model.reason,
        x: 0,
        y: cursor,
        width: frame.content.width - SPACE.xl,
        fontSize: TYPE.body * scale,
        tone: "ink",
        wrap: true,
      });
      cursor -= TYPE.body * scale * TYPE.lineHeightRatio + SPACE.sm;
    }
    for (const line of model.lines) {
      addLabel(root, {
        text: line,
        x: 0,
        y: cursor,
        width: frame.content.width - SPACE.xl,
        fontSize: TYPE.caption * scale,
        tone: "muted",
      });
      cursor -= TYPE.caption * scale * TYPE.lineHeightRatio + SPACE.xs;
    }

    const buttonHeight = SPACE.xl + SPACE.md;
    // 主行动紧跟详情下方（不钉屏幕底），返回再排其下，避免大空白与错位。
    cursor -= SPACE.md;
    if (model.primaryAction) {
      makeButton(
        root,
        {
          action: model.primaryAction,
          x: 0,
          y: cursor - buttonHeight / 2,
          width: Math.min(frame.content.width * 0.72, frame.content.width - SPACE.xl),
          height: buttonHeight,
          primary: true,
          textScale: scale,
        },
        model.primaryAction.enabled && opts.onAction
          ? () => opts.onAction?.(model.primaryAction?.id ?? "")
          : undefined,
      );
      cursor -= buttonHeight + SPACE.md;
    }

    others.forEach((action, index) => {
      makeButton(
        root,
        {
          action,
          x: (index - (others.length - 1) / 2) * (frame.content.width * 0.5 + SPACE.lg),
          y: cursor - buttonHeight / 2,
          width: Math.min(frame.content.width * 0.5, frame.content.width - SPACE.xl),
          height: buttonHeight,
          textScale: scale,
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    });

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

import { Node, UIOpacity, tween } from "cc";
import {
  MOTION,
  SPACE,
  TYPE,
  buildResponsiveFrame,
  motionDurationMs,
  type ResponsiveFrame,
  type ScreenModel,
  type Viewport,
} from "../../vendor/jinglingPresentation";
import { makeButton } from "../ui/Button.ts";
import { makePanel } from "../ui/Panel.ts";
import { addLabel } from "../ui/Text.ts";

export interface BattleRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly reduceMotion?: boolean;
  readonly onAction?: (actionId: string) => void;
}

/**
 * battle 页 renderer。只把 ScreenModel 画出来：
 * 顶部工具行、敌我名牌、战场区、命令区、底部战况。
 * 不算伤害、不改状态、不读玩法对象。
 */
export class BattleScreen {
  private root: Node | null = null;

  mount(parent: Node, model: ScreenModel, opts: BattleRenderOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const reduceMotion = opts.reduceMotion ?? false;
    const frame: ResponsiveFrame = buildResponsiveFrame(opts.viewport);

    const root = new Node("battle-screen");
    root.layer = parent.layer;
    parent.addChild(root);
    this.root = root;

    const [waveLine, goldLine, foeLine, allyLine, partyLine, ...logLines] = model.lines;
    const topY = frame.content.height / 2 - SPACE.lg;

    addLabel(root, {
      text: [waveLine, goldLine, partyLine].filter(Boolean).join("  "),
      x: 0,
      y: topY,
      width: frame.content.width - SPACE.lg,
      fontSize: TYPE.caption * scale,
      tone: "muted",
    });

    const plateWidth = Math.min(frame.content.width * 0.6, frame.content.width - SPACE.xl);
    const plateHeight = SPACE.xl + SPACE.lg;

    const foePlate = makePanel(root, {
      name: "foe-plate",
      x: -(frame.content.width - plateWidth) / 4,
      y: topY - plateHeight,
      width: plateWidth,
      height: plateHeight,
    });
    addLabel(foePlate, {
      text: foeLine ?? "",
      x: 0,
      y: 0,
      width: plateWidth - SPACE.md,
      fontSize: TYPE.body * scale,
      tone: "ink",
    });

    const allyPlate = makePanel(root, {
      name: "ally-plate",
      x: (frame.content.width - plateWidth) / 4,
      y: -frame.content.height * 0.12,
      width: plateWidth,
      height: plateHeight,
    });
    addLabel(allyPlate, {
      text: allyLine ?? "",
      x: 0,
      y: 0,
      width: plateWidth - SPACE.md,
      fontSize: TYPE.body * scale,
      tone: "ink",
    });

    if (model.reason) {
      addLabel(root, {
        text: model.reason,
        x: 0,
        y: -frame.content.height * 0.26,
        width: frame.content.width - SPACE.xl,
        fontSize: TYPE.body * scale,
        tone: "ink",
        wrap: true,
      });
    }

    const actions = model.primaryAction
      ? [model.primaryAction, ...model.secondaryActions]
      : model.secondaryActions;
    const cols = frame.columns === 2 ? 4 : 2;
    const buttonHeight = SPACE.xl + SPACE.md;
    const buttonWidth = (frame.content.width - SPACE.lg * (cols + 1)) / cols;
    const commandsY = -frame.content.height / 2 + SPACE.xl * 2 + buttonHeight;

    actions.forEach((action, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      // battle.<verb> -> icon_<verb>；有素材则显示图标，无则纯文字。
      const verb = action.id.split(".").pop() ?? "";
      makeButton(
        root,
        {
          action,
          x: (col - (cols - 1) / 2) * (buttonWidth + SPACE.lg),
          y: commandsY - row * (buttonHeight + SPACE.sm),
          width: buttonWidth,
          height: buttonHeight,
          primary: index === 0,
          textScale: scale,
          icon: `icon_${verb}`,
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    });

    const log = logLines.filter(Boolean).join(" ");
    if (log) {
      addLabel(root, {
        text: log,
        x: 0,
        y: -frame.content.height / 2 + SPACE.lg,
        width: frame.content.width - SPACE.lg,
        fontSize: TYPE.caption * scale,
        tone: "muted",
        wrap: true,
      });
    }

    // 受击反馈：减少动效下由共享助手压到上限以内
    const opacity = root.addComponent(UIOpacity);
    opacity.opacity = 0;
    tween(opacity)
      .to(motionDurationMs(MOTION.fast, reduceMotion) / 1000, { opacity: 255 })
      .start();

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

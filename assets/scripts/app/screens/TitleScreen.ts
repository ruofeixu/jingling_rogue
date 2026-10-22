import { Node } from "cc";
import {
  SPACE,
  TYPE,
  buildResponsiveFrame,
  type ResponsiveFrame,
  type ScreenModel,
  type Viewport,
} from "../../vendor/jinglingPresentation";
import { makeButton } from "../ui/Button.ts";
import { makePanel } from "../ui/Panel.ts";
import { addLabel } from "../ui/Text.ts";

export interface ScreenRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly onAction?: (actionId: string) => void;
}

/**
 * title 页 renderer：只把 ScreenModel 绑到 U2 组件上，回调只回传 action id。
 * 不读玩法状态、不改 core，也不自行解析意图（意图解析属于壳层）。
 */
export class TitleScreen {
  private root: Node | null = null;

  mount(parent: Node, model: ScreenModel, opts: ScreenRenderOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const frame: ResponsiveFrame = buildResponsiveFrame(opts.viewport);

    const root = new Node("title-screen");
    root.layer = parent.layer;
    parent.addChild(root);
    this.root = root;

    const [subtitle, hint] = [model.lines[0] ?? "", model.lines[1] ?? ""];
    const topY = frame.content.height / 2 - SPACE.xl;

    addLabel(root, {
      text: model.accessibleName,
      x: 0,
      y: topY,
      width: frame.content.width - SPACE.xl,
      fontSize: TYPE.display * scale,
      tone: "ink",
    });
    addLabel(root, {
      text: subtitle,
      x: 0,
      y: topY - TYPE.display * scale * TYPE.lineHeightRatio,
      width: frame.content.width - SPACE.xl,
      fontSize: TYPE.title * scale,
      tone: "muted",
    });

    const menuWidth = Math.min(frame.columnWidth, frame.content.width - SPACE.xl);
    const rows = Math.ceil((model.secondaryActions.length + 1) / 2);
    const buttonHeight = SPACE.xl + SPACE.md;
    const menuHeight = rows * (buttonHeight + SPACE.md) + SPACE.lg;
    const panel = makePanel(root, {
      name: "title-menu",
      x: 0,
      y: 0,
      width: menuWidth,
      height: menuHeight,
    });

    const buttonWidth = (menuWidth - SPACE.lg * 3) / 2;
    const cellX = (col: number) => (col - 0.5) * (buttonWidth + SPACE.lg);
    const cellY = (row: number) => menuHeight / 2 - SPACE.lg - buttonHeight / 2 - row * (buttonHeight + SPACE.md);

    const actions = model.primaryAction
      ? [{ action: model.primaryAction, primary: true }, ...model.secondaryActions.map((a) => ({ action: a, primary: false }))]
      : model.secondaryActions.map((a) => ({ action: a, primary: false }));

    actions.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      makeButton(
        panel,
        {
          action: item.action,
          x: cellX(col),
          y: cellY(row),
          width: buttonWidth,
          height: buttonHeight,
          primary: item.primary,
          textScale: scale,
        },
        item.action.enabled && opts.onAction ? () => opts.onAction?.(item.action.id) : undefined,
      );
    });

    if (model.reason) {
      addLabel(root, {
        text: model.reason,
        x: 0,
        y: -menuHeight / 2 - SPACE.lg,
        width: frame.content.width - SPACE.xl,
        fontSize: TYPE.body * scale,
        tone: "ink",
      });
    }

    addLabel(root, {
      text: hint,
      x: 0,
      y: -frame.content.height / 2 + SPACE.xl,
      width: frame.content.width - SPACE.xl,
      fontSize: TYPE.caption * scale,
      tone: "muted",
      wrap: true,
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

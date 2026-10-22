import { Node } from "cc";
import {
  SPACE,
  TYPE,
  buildResponsiveFrame,
  type ResponsiveFrame,
  type ScreenModel,
} from "../../vendor/jinglingPresentation";
import { makeButton } from "../ui/Button.ts";
import { makePanel } from "../ui/Panel.ts";
import { addLabel } from "../ui/Text.ts";
import type { ScreenRenderOptions } from "./TitleScreen.ts";

/**
 * mode 页 renderer：模式卡由 ScreenModel 的 action 列表驱动，
 * 锁定项由 Button 显示禁用原因。renderer 不判断解锁条件。
 */
export class ModeScreen {
  private root: Node | null = null;

  mount(parent: Node, model: ScreenModel, opts: ScreenRenderOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const frame: ResponsiveFrame = buildResponsiveFrame(opts.viewport);

    const root = new Node("mode-screen");
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

    const actions = model.primaryAction
      ? [{ action: model.primaryAction, primary: true }, ...model.secondaryActions.map((a) => ({ action: a, primary: false }))]
      : model.secondaryActions.map((a) => ({ action: a, primary: false }));

    const cols = frame.columns === 2 ? 3 : 2;
    const rows = Math.ceil(actions.length / cols);
    const buttonHeight = SPACE.xl + SPACE.lg;
    const panelWidth = Math.min(frame.content.width - SPACE.lg, frame.content.width);
    const panelHeight = rows * (buttonHeight + SPACE.md) + SPACE.lg;
    const panel = makePanel(root, {
      name: "mode-list",
      x: 0,
      y: 0,
      width: panelWidth,
      height: panelHeight,
    });

    const buttonWidth = (panelWidth - SPACE.lg * (cols + 1)) / cols;

    actions.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      makeButton(
        panel,
        {
          action: item.action,
          x: (col - (cols - 1) / 2) * (buttonWidth + SPACE.lg),
          y: panelHeight / 2 - SPACE.lg - buttonHeight / 2 - row * (buttonHeight + SPACE.md),
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
        y: -panelHeight / 2 - SPACE.lg,
        width: frame.content.width - SPACE.xl,
        fontSize: TYPE.body * scale,
        tone: "ink",
        wrap: true,
      });
    }

    for (const [index, line] of model.lines.entries()) {
      addLabel(root, {
        text: line,
        x: 0,
        y: -frame.content.height / 2 + SPACE.xl + index * TYPE.caption * scale * TYPE.lineHeightRatio,
        width: frame.content.width - SPACE.xl,
        fontSize: TYPE.caption * scale,
        tone: "muted",
        wrap: true,
      });
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

import { Color, Label, Node, UITransform } from "cc";
import {
  COLOR,
  SPACE,
  TYPE,
  type Rgb,
  type ScreenModel,
} from "../../vendor/jinglingPresentation";
import { makeButton } from "./Button.ts";
import { makePanel } from "./Panel.ts";

function color(token: Rgb, alpha = 255): Color {
  return new Color(token[0], token[1], token[2], alpha);
}

function addText(parent: Node, text: string, y: number, size: number, token: Rgb, width: number): void {
  const node = new Node("text");
  node.layer = parent.layer;
  parent.addChild(node);
  const transform = node.addComponent(UITransform);
  transform.setContentSize(width, size * TYPE.lineHeightRatio);
  node.setPosition(0, y, 0);
  const label = node.addComponent(Label);
  label.string = text;
  label.fontSize = size;
  label.lineHeight = size * TYPE.lineHeightRatio;
  label.color = color(token);
  label.horizontalAlign = Label.HorizontalAlign.CENTER;
  label.verticalAlign = Label.VerticalAlign.CENTER;
  label.overflow = Label.Overflow.RESIZE_HEIGHT;
}

/** 状态标签：normal / loading / empty / error / locked 五态各自的说明文案键。 */
const STATE_LABEL: Record<string, string> = {
  normal: "state: normal",
  loading: "state: loading",
  empty: "state: empty",
  error: "state: error",
  locked: "state: locked",
};

export interface StateViewOptions {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly textScale?: number;
}

/**
 * U2 五态视图：只根据 ScreenModel 渲染，不猜玩法状态。
 * error / locked 必须显示 model.reason；主行动禁用时显示禁用原因（由 Button 负责）。
 */
export class StateView {
  private root: Node | null = null;

  mount(parent: Node, model: ScreenModel, opts: StateViewOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const root = makePanel(parent, {
      name: `state-${model.state}`,
      x: opts.x,
      y: opts.y,
      width: opts.width,
      height: opts.height,
    });
    this.root = root;

    const inner = opts.width - SPACE.lg * 2;
    let cursor = opts.height / 2 - SPACE.lg;

    addText(root, model.accessibleName, cursor, TYPE.title * scale, COLOR.ink, inner);
    cursor -= TYPE.title * scale * TYPE.lineHeightRatio + SPACE.sm;

    addText(root, STATE_LABEL[model.state] ?? model.state, cursor, TYPE.caption * scale, COLOR.muted, inner);
    cursor -= TYPE.caption * scale * TYPE.lineHeightRatio + SPACE.sm;

    if (model.reason) {
      addText(root, model.reason, cursor, TYPE.body * scale, COLOR.ink, inner);
      cursor -= TYPE.body * scale * TYPE.lineHeightRatio + SPACE.sm;
    }

    for (const line of model.lines) {
      addText(root, line, cursor, TYPE.caption * scale, COLOR.muted, inner);
      cursor -= TYPE.caption * scale * TYPE.lineHeightRatio + SPACE.xs;
    }

    if (model.primaryAction) {
      makeButton(
        root,
        {
          action: model.primaryAction,
          x: 0,
          y: -opts.height / 2 + SPACE.xl,
          width: Math.min(inner, opts.width * 0.7),
          height: SPACE.xl + SPACE.md,
          primary: true,
          textScale: scale,
        },
        undefined,
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

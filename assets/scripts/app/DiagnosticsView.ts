import { Color, Label, Node, UITransform } from "cc";
import type { ScreenModel } from "../vendor/jinglingPresentation";

/**
 * U1 唯一的新 renderer：把 diagnostics ScreenModel 的文本行画出来，
 * 只为在实际 Cocos 里看见壳层状态。不含产品文案、玩法依赖与产品页布局。
 * 真正的设计系统与五态组件属于 U2。
 */
const LINE_HEIGHT = 34;
const FONT_SIZE = 22;
const TITLE_FONT_SIZE = 28;
const INK = new Color(31, 30, 28, 255);

function addLine(parent: Node, text: string, y: number, size: number): void {
  const node = new Node("line");
  node.layer = parent.layer;
  parent.addChild(node);
  node.addComponent(UITransform);
  node.setPosition(0, y, 0);
  const label = node.addComponent(Label);
  label.string = text;
  label.fontSize = size;
  label.lineHeight = size + 6;
  label.color = INK;
  label.horizontalAlign = Label.HorizontalAlign.CENTER;
  label.verticalAlign = Label.VerticalAlign.CENTER;
}

export class DiagnosticsView {
  private root: Node | null = null;

  mount(parent: Node, model: ScreenModel): void {
    this.unmount();
    const root = new Node("diagnostics-view");
    root.layer = parent.layer;
    parent.addChild(root);
    root.addComponent(UITransform);
    this.root = root;

    const lines = model.lines;
    const top = ((lines.length + 1) * LINE_HEIGHT) / 2;
    addLine(root, model.accessibleName, top, TITLE_FONT_SIZE);
    lines.forEach((line, index) => {
      addLine(root, line, top - (index + 1) * LINE_HEIGHT, FONT_SIZE);
    });
  }

  /** 卸载必须真正销毁；隐藏不等于销毁。 */
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

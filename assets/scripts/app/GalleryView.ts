import { Node, UIOpacity, tween } from "cc";
import {
  MOTION,
  SPACE,
  STATE_IDS,
  buildResponsiveFrame,
  buildStateModel,
  buildViewport,
  motionDurationMs,
  truncationFor,
  type ResponsiveFrame,
  type StateId,
} from "../vendor/jinglingPresentation";
import { StateView } from "./ui/StateView.ts";

/** 陈列页用的占位文案：只描述组件本身，不含任何产品内容。 */
const SAMPLE = {
  name: "component gallery",
  reason: "sample reason text for error and locked",
  emptyHint: "sample empty hint with next step",
  longLabel: "a very long sample label that must be truncated or wrapped by the container",
};

export interface GalleryOptions {
  readonly width: number;
  readonly height: number;
  readonly textScale?: number;
  readonly reduceMotion?: boolean;
}

/**
 * U2 组件陈列页：把五态视图在响应式框里排开，用来在实际 Cocos 里检查
 * token、五态、文本缩放、减少动效与竖横屏。它不是产品页，不读玩法状态。
 */
export class GalleryView {
  private root: Node | null = null;
  private readonly views: StateView[] = [];

  mount(parent: Node, opts: GalleryOptions): Node {
    this.unmount();
    const viewport = buildViewport({ width: opts.width, height: opts.height });
    const frame: ResponsiveFrame = buildResponsiveFrame(viewport);
    const scale = opts.textScale ?? 1;
    const reduceMotion = opts.reduceMotion ?? false;

    const root = new Node("gallery-view");
    root.layer = parent.layer;
    parent.addChild(root);
    this.root = root;

    const cellWidth = frame.columnWidth - SPACE.md;
    const rows = Math.ceil(STATE_IDS.length / frame.columns);
    const cellHeight = (frame.content.height - SPACE.lg * (rows + 1)) / rows;

    STATE_IDS.forEach((state: StateId, index) => {
      const col = index % frame.columns;
      const row = Math.floor(index / frame.columns);
      const x =
        frame.columns === 1
          ? 0
          : (col - (frame.columns - 1) / 2) * (frame.columnWidth + frame.gutter);
      const y = frame.content.height / 2 - SPACE.lg - cellHeight / 2 - row * (cellHeight + SPACE.lg);

      const label = truncationFor({ text: SAMPLE.longLabel, maxChars: 18 });
      const model = buildStateModel({
        screenId: "stats",
        state,
        accessibleName: `${SAMPLE.name} / ${state}`,
        reason: state === "error" || state === "locked" ? SAMPLE.reason : undefined,
        emptyHint: state === "empty" ? SAMPLE.emptyHint : undefined,
        primaryAction: { id: `sample-${state}`, label: label.text },
        lines: [`truncation: ${label.strategy}`, `columns: ${frame.columns}`, `textScale: ${scale}`],
      });

      const view = new StateView();
      view.mount(root, model, { x, y, width: cellWidth, height: cellHeight, textScale: scale });
      this.views.push(view);
    });

    const opacity = root.addComponent(UIOpacity);
    opacity.opacity = 0;
    tween(opacity)
      .to(motionDurationMs(MOTION.normal, reduceMotion) / 1000, { opacity: 255 })
      .start();

    return root;
  }

  unmount(): void {
    for (const view of this.views) {
      view.unmount();
    }
    this.views.length = 0;
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

import { Node } from "cc";
import type { ScreenModel, Viewport } from "../../vendor/jinglingPresentation";
import { ListView } from "../ui/ListView.ts";

export interface OutcomeRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly onAction?: (actionId: string) => void;
}

/**
 * 结局与孵化三页共享 renderer（defeat / victory / hatch）。
 * 幂等在模型层决定，这里只按 ScreenModel 显示与禁用。
 */
export class OutcomeScreen {
  private readonly list = new ListView();

  mount(parent: Node, model: ScreenModel, opts: OutcomeRenderOptions): Node {
    return this.list.mount(parent, model, {
      viewport: opts.viewport,
      textScale: opts.textScale,
      onAction: opts.onAction,
      maxRows: 6,
    });
  }

  unmount(): void {
    this.list.unmount();
  }

  isMounted(): boolean {
    return this.list.isMounted();
  }
}

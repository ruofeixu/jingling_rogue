import { Node } from "cc";
import type { ScreenModel, Viewport } from "../../vendor/jinglingPresentation";
import { ListView } from "../ui/ListView.ts";

export interface ProgressRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly onAction?: (actionId: string) => void;
}

/**
 * 局内推进四页共享 renderer（summary / shop / omen / map）。
 * 价格、权重、可达性都在 selector 里算好，这里只画列表与继续路径。
 */
export class ProgressScreen {
  private readonly list = new ListView();

  mount(parent: Node, model: ScreenModel, opts: ProgressRenderOptions): Node {
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

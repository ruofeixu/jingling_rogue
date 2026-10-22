import { Node } from "cc";
import type { ScreenModel, Viewport } from "../../vendor/jinglingPresentation";
import { ListView } from "../ui/ListView.ts";

export interface OverlayRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly onAction?: (actionId: string) => void;
}

/**
 * 战斗子界面共享 renderer。六个弹层都只是"列表 + 主行动 + 返回"，
 * 所以直接复用 U4 的列表壳；合法性与禁用原因全部来自 ScreenModel。
 */
export class OverlayScreen {
  private readonly list = new ListView();

  mount(parent: Node, model: ScreenModel, opts: OverlayRenderOptions): Node {
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

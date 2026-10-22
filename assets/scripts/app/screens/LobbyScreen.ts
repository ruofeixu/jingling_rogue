import { Node } from "cc";
import type { ScreenModel, Viewport } from "../../vendor/jinglingPresentation";
import { ListView } from "../ui/ListView.ts";

export interface LobbyRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly onAction?: (actionId: string) => void;
  readonly maxRows?: number;
}

/**
 * 大厅资料页 renderer。八个页面共用同一个列表/详情壳，
 * 差异全部来自 ScreenModel；这里不做任何单页业务判断。
 */
export class LobbyScreen {
  private readonly list = new ListView();

  mount(parent: Node, model: ScreenModel, opts: LobbyRenderOptions): Node {
    return this.list.mount(parent, model, {
      viewport: opts.viewport,
      textScale: opts.textScale,
      onAction: opts.onAction,
      maxRows: opts.maxRows,
    });
  }

  unmount(): void {
    this.list.unmount();
  }

  isMounted(): boolean {
    return this.list.isMounted();
  }
}

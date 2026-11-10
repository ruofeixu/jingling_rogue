import { Node } from "cc";
import {
  SPACE,
  TYPE,
  buildResponsiveFrame,
  type ResponsiveFrame,
  type ScreenAction,
  type ScreenModel,
  type Viewport,
} from "../../vendor/jinglingPresentation";
import { makeButton } from "./Button.ts";
import { makePanel } from "./Panel.ts";
import { addLabel } from "./Text.ts";

/** 列表底板底色不透明度：比普通面板更透，让不透明的行按钮浮出来。 */
const LIST_PANEL_ALPHA = 140;

export interface ListShellOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly onAction?: (actionId: string) => void;
  /** 每屏最多渲染多少个条目；超出部分由模型自己的分页行说明。 */
  readonly maxRows?: number;
  /** 把主行动当作列表第一行显示（普通样式），而不是列表下方的朱砂大按钮。用于主行动本身就是列表项的页面。 */
  readonly primaryInList?: boolean;
}

/**
 * 共享列表/详情壳。只认 ScreenModel：标题、原因、文本行、主行动与条目动作。
 * 不含任何单页业务判断，也不知道页面语义。竖屏单栏、横屏双栏。
 */
export class ListView {
  private root: Node | null = null;

  mount(parent: Node, model: ScreenModel, opts: ListShellOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const frame: ResponsiveFrame = buildResponsiveFrame(opts.viewport);
    const maxRows = opts.maxRows ?? 8;
    const inList = opts.primaryInList === true && model.primaryAction !== null;
    const listActions: ScreenAction[] = inList
      ? [model.primaryAction as ScreenAction, ...model.secondaryActions]
      : [...model.secondaryActions];
    const bottomPrimary = inList ? null : model.primaryAction;

    const root = new Node("list-view");
    root.layer = parent.layer;
    parent.addChild(root);
    this.root = root;

    // 预估内容总高，让整块内容在纵向居中偏上，避免全部贴顶、底部大片空白。
    const titleBlock = TYPE.title * scale * TYPE.lineHeightRatio + SPACE.sm;
    const reasonBlock = model.reason ? TYPE.body * scale * TYPE.lineHeightRatio + SPACE.sm : 0;
    const summary = model.lines.join(" • ");
    const linesBlock = summary ? TYPE.caption * scale * TYPE.lineHeightRatio * 2 + SPACE.xs : 0;
    const rowsCount = Math.min(listActions.length, maxRows);
    const colsForEst = frame.columns;
    const listRowsEst = Math.ceil(rowsCount / colsForEst);
    const btnH = SPACE.xl + SPACE.md;
    const panelBlockEst = Math.max(btnH + SPACE.lg, listRowsEst * (btnH + SPACE.sm) + SPACE.lg);
    const primaryBlock = bottomPrimary ? SPACE.lg + btnH : 0;
    const contentTotal = titleBlock + reasonBlock + linesBlock + panelBlockEst + primaryBlock;
    // 居中偏上：内容块中心落在屏幕中心略上方（+content.height*0.06）。
    const startTop = Math.min(
      frame.content.height / 2 - SPACE.xl,
      contentTotal / 2 + frame.content.height * 0.06,
    );

    const headerY = startTop;
    addLabel(root, {
      text: model.accessibleName,
      x: 0,
      y: headerY,
      width: frame.content.width - SPACE.xl,
      fontSize: TYPE.title * scale,
      tone: "ink",
      heading: true,
    });

    let cursor = headerY - TYPE.title * scale * TYPE.lineHeightRatio - SPACE.sm;
    if (model.reason) {
      addLabel(root, {
        text: model.reason,
        x: 0,
        y: cursor,
        width: frame.content.width - SPACE.xl,
        fontSize: TYPE.body * scale,
        tone: "ink",
        wrap: true,
      });
      cursor -= TYPE.body * scale * TYPE.lineHeightRatio + SPACE.sm;
    }
    if (summary) {
      // 计数、说明合成一段小字（最多两行），不再三四行堆在标题下。
      const summaryH = TYPE.caption * scale * TYPE.lineHeightRatio * 2;
      addLabel(root, {
        text: summary,
        x: 0,
        y: cursor - summaryH / 2 + TYPE.caption * scale * TYPE.lineHeightRatio / 2,
        width: frame.content.width - SPACE.xl,
        fontSize: TYPE.caption * scale,
        tone: "muted",
        wrap: true,
      });
      cursor -= summaryH + SPACE.xs;
    }

    const rows: ScreenAction[] = listActions.slice(0, maxRows);
    const cols = frame.columns;
    const buttonHeight = SPACE.xl * 2;
    const listRows = Math.ceil(rows.length / cols);
    const panelWidth = Math.min(frame.content.width - SPACE.lg, frame.content.width);
    const panelHeight = Math.max(buttonHeight + SPACE.lg, listRows * (buttonHeight + SPACE.sm) + SPACE.lg);
    const panelY = cursor - panelHeight / 2 - SPACE.sm;
    const panel = makePanel(root, {
      name: "list",
      x: 0,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      alpha: LIST_PANEL_ALPHA,
    });

    const buttonWidth = (panelWidth - SPACE.lg * (cols + 1)) / cols;
    rows.forEach((action, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      makeButton(
        panel,
        {
          action,
          x: (col - (cols - 1) / 2) * (buttonWidth + SPACE.lg),
          y: panelHeight / 2 - SPACE.lg - buttonHeight / 2 - row * (buttonHeight + SPACE.sm),
          width: buttonWidth,
          height: buttonHeight,
          textScale: scale,
          showReason: false,
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    });

    if (bottomPrimary) {
      // 主行动紧跟列表面板下方，而不是钉在屏幕最底，避免中间大片空白，
      // 也让"主行动"在视觉动线上紧接内容、层级清晰。
      const primaryY = panelY - panelHeight / 2 - SPACE.lg - buttonHeight / 2;
      makeButton(
        root,
        {
          action: bottomPrimary,
          x: 0,
          y: primaryY,
          width: Math.min(panelWidth * 0.72, frame.content.width - SPACE.xl),
          height: buttonHeight,
          primary: true,
          textScale: scale,
        },
        bottomPrimary.enabled && opts.onAction
          ? () => opts.onAction?.(bottomPrimary.id)
          : undefined,
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

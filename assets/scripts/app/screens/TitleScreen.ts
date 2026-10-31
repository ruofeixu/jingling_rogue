import { Node, UITransform } from "cc";
import {
  SPACE,
  TYPE,
  buildResponsiveFrame,
  titleLayout,
  type ScreenModel,
  type Viewport,
} from "../../vendor/jinglingPresentation";
import { attachPortraitSprite } from "../../ui/portrait";
import { makeButton } from "../ui/Button.ts";
import { makePanel } from "../ui/Panel.ts";
import { addLabel } from "../ui/Text.ts";

export interface ScreenRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly onAction?: (actionId: string) => void;
}

const ENTRY_ICONS: Readonly<Record<string, string>> = {
  "title.open-settings": "icon_settings",
  "title.open-codex": "icon_codex",
  "title.open-eggs": "icon_eggs",
  "title.open-achievements": "icon_achievements",
  "title.open-stats": "icon_stats",
  "title.open-slots": "icon_slots",
  "title.open-glossary": "icon_scroll",
};

const MASCOT_ID = "zao_li";

/**
 * title 页 renderer：只把 ScreenModel 绑到组件上，回调只回传 action id。
 * 不读玩法状态、不改 core，也不自行解析意图（意图解析属于壳层）。
 */
export class TitleScreen {
  private root: Node | null = null;

  mount(parent: Node, model: ScreenModel, opts: ScreenRenderOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const frame = buildResponsiveFrame(opts.viewport);
    const layout = titleLayout(frame, model.secondaryActions.length);

    const root = new Node("title-screen");
    root.layer = parent.layer;
    parent.addChild(root);
    this.root = root;

    const subtitle = model.lines[0] ?? "";
    const hint = model.lines[1] ?? "";

    addLabel(root, {
      text: model.accessibleName,
      x: layout.title.x,
      y: layout.title.y,
      width: layout.title.width,
      fontSize: TYPE.display * scale,
      tone: "ink",
      heading: true,
    });

    if (subtitle) {
      const capsule = makePanel(root, {
        name: "subtitle",
        skin: "chip",
        x: layout.subtitle.x,
        y: layout.subtitle.y,
        width: layout.subtitle.width,
        height: layout.subtitle.height,
      });
      addLabel(capsule, {
        text: subtitle,
        x: 0,
        y: 0,
        width: layout.subtitle.width - SPACE.md,
        fontSize: TYPE.body * scale,
        tone: "muted",
      });
    }

    const mascot = new Node("mascot");
    mascot.layer = root.layer;
    root.addChild(mascot);
    mascot.addComponent(UITransform).setContentSize(layout.mascot.width, layout.mascot.height);
    mascot.setPosition(layout.mascot.x, layout.mascot.y, 0);
    attachPortraitSprite(mascot, MASCOT_ID, layout.mascot.width, layout.mascot.height);

    if (model.primaryAction) {
      const action = model.primaryAction;
      makeButton(
        root,
        {
          action,
          x: layout.primary.x,
          y: layout.primary.y,
          width: layout.primary.width,
          height: layout.primary.height,
          primary: true,
          textScale: scale,
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    }

    model.secondaryActions.forEach((action, index) => {
      const slot = layout.grid[index];
      if (!slot) {
        return;
      }
      makeButton(
        root,
        {
          action,
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
          textScale: scale,
          icon: ENTRY_ICONS[action.id],
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    });

    const note = [hint, model.reason ?? ""].filter((line) => line.length > 0).join(" ");
    if (note) {
      addLabel(root, {
        text: note,
        x: layout.hint.x,
        y: layout.hint.y,
        width: layout.hint.width,
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

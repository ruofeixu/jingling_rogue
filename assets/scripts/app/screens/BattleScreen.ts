import { Graphics, Node, Tween, UIOpacity, UITransform, tween, Color } from "cc";
import {
  COLOR,
  MOTION,
  SPACE,
  TYPE,
  battleArtsLayout,
  battleLayout,
  buildResponsiveFrame,
  hpRatio,
  hpTone,
  motionDurationMs,
  type ScreenModel,
  type Viewport,
} from "../../vendor/jinglingPresentation";
import { attachPortraitSprite } from "../../ui/portrait";
import { portraitFacesLeft } from "../../vendor/jinglingCore";
import { makeButton } from "../ui/Button.ts";
import { makeHpBar, type HpBarHandle, type HpBarTone } from "../ui/HpBar.ts";
import { playInkSplash } from "../ui/InkSplash.ts";
import { makePanel } from "../ui/Panel.ts";
import { addLabel } from "../ui/Text.ts";

export interface BattleRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly reduceMotion?: boolean;
  readonly onAction?: (actionId: string) => void;
  /** 战斗里换页（选术再回战斗）时不要再整页淡入，否则每点一下都闪一次。缺省淡入。 */
  readonly fadeIn?: boolean;
  /**
   * 选术面板：有它就把命令区就地换成术列表（立绘、名牌、血条都不动，不切整页）。
   * 模型来自 overlay 页（arts.pick.<id> … + arts.pick.confirm + overlay.cancel）。
   */
  readonly artsPanel?: {
    readonly model: ScreenModel;
    readonly selectedId: string | null;
  };
}

interface Plate {
  readonly spiritId: string;
  readonly name: string;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly status: string;
}

/** ScreenModel 加上战斗名牌。渲染层只读这些字段，不从文案里拆血量。 */
interface BattleMountModel extends ScreenModel {
  readonly plates: {
    readonly foe: Plate;
    readonly ally: Plate;
  };
}

interface RatioState {
  ratio: number;
}

/**
 * battle 页 renderer。只把 ScreenModel 和名牌画出来：
 * 顶栏、敌我立绘与名牌、命令区、底部战况。
 * 不算伤害、不改状态、不读玩法对象。
 */
export class BattleScreen {
  private root: Node | null = null;
  private readonly lastRatio = new Map<string, number>();
  private readonly ratioStates: RatioState[] = [];

  mount(parent: Node, model: BattleMountModel, opts: BattleRenderOptions): Node {
    this.unmount();
    const scale = opts.textScale ?? 1;
    const reduceMotion = opts.reduceMotion ?? false;
    const frame = buildResponsiveFrame(opts.viewport);
    const layout = battleLayout(frame);

    const root = new Node("battle-screen");
    root.layer = parent.layer;
    parent.addChild(root);
    this.root = root;

    const top = makePanel(root, {
      name: "top-bar",
      skin: "topbar",
      x: layout.topBar.x,
      y: layout.topBar.y,
      width: layout.topBar.width,
      height: layout.topBar.height,
    });
    addLabel(top, {
      text: headerText(model.lines),
      x: 0,
      y: 0,
      width: layout.topBar.width - SPACE.lg,
      fontSize: TYPE.body * scale,
      tone: "ink",
    });

    // 敌方在右上要朝左看我方，我方在左下要朝右看敌方；立绘本身朝向不一，按清单决定翻不翻。
    const flipFoe = !portraitFacesLeft(model.plates.foe.spiritId);
    const flipAlly = portraitFacesLeft(model.plates.ally.spiritId);
    this.placeFighter(root, "foe", model.plates.foe, layout.foeArt, layout.foePlate, flipFoe, scale, reduceMotion);
    this.placeFighter(root, "ally", model.plates.ally, layout.allyArt, layout.allyPlate, flipAlly, scale, reduceMotion);

    const logText = opts.artsPanel ? "" : (model.reason ?? logLine(model.lines));
    if (logText) {
      const log = makePanel(root, {
        name: "log",
        skin: "log_bubble",
        x: layout.log.x,
        y: layout.log.y,
        width: layout.log.width,
        height: layout.log.height,
      });
      addLabel(log, {
        text: logText,
        x: 0,
        y: 0,
        width: layout.log.width - SPACE.lg,
        fontSize: TYPE.body * scale,
        tone: "ink",
        wrap: true,
      });
    }

    if (opts.artsPanel) {
      this.mountArtsPanel(root, opts.artsPanel, battleArtsLayout(frame), scale, opts.onAction);
    }

    const actions = opts.artsPanel
      ? []
      : model.primaryAction
        ? [model.primaryAction, ...model.secondaryActions]
        : model.secondaryActions;
    actions.forEach((action, index) => {
      const slot = layout.commands[index];
      if (!slot) {
        return;
      }
      const verb = action.id.split(".").pop() ?? "";
      makeButton(
        root,
        {
          action,
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
          primary: index === 0,
          textScale: scale,
          icon: `icon_${verb}`,
        },
        action.enabled && opts.onAction ? () => opts.onAction?.(action.id) : undefined,
      );
    });

    const fadeIn = opts.fadeIn;
    if (fadeIn !== false) {
      const opacity = root.addComponent(UIOpacity);
      opacity.opacity = 0;
      tween(opacity)
        .to(motionDurationMs(MOTION.fast, reduceMotion) / 1000, { opacity: 255 })
        .start();
    }

    return root;
  }

  /** 把术列表画在命令区：四个术 + 出术 + 返回。选中的术描朱砂边。 */
  private mountArtsPanel(
    root: Node,
    panel: NonNullable<BattleRenderOptions["artsPanel"]>,
    layout: ReturnType<typeof battleArtsLayout>,
    scale: number,
    onAction?: (actionId: string) => void,
  ): void {
    const rows = panel.model.secondaryActions.filter((action) => action.id.includes(".pick."));
    rows.slice(0, layout.skills.length).forEach((action, index) => {
      const slot = layout.skills[index];
      if (!slot) {
        return;
      }
      const selected = panel.selectedId !== null && action.id.endsWith(`.${panel.selectedId}`);
      const button = makeButton(
        root,
        {
          action,
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
          primary: selected,
          textScale: scale,
        },
        action.enabled && onAction ? () => onAction(action.id) : undefined,
      );
      if (selected) {
        const outline = button.addComponent(Graphics);
        outline.rect(-slot.width / 2, -slot.height / 2, slot.width, slot.height);
        outline.lineWidth = SPACE.xs;
        outline.strokeColor = new Color(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2], 255);
        outline.stroke();
      }
    });
    const confirm = panel.model.primaryAction;
    if (confirm) {
      makeButton(
        root,
        {
          action: confirm,
          x: layout.confirm.x,
          y: layout.confirm.y,
          width: layout.confirm.width,
          height: layout.confirm.height,
          primary: confirm.enabled,
          textScale: scale,
        },
        confirm.enabled && onAction ? () => onAction(confirm.id) : undefined,
      );
    }
    const back = panel.model.secondaryActions.find((action) => action.id === "overlay.cancel");
    if (back) {
      makeButton(
        root,
        {
          action: back,
          x: layout.back.x,
          y: layout.back.y,
          width: layout.back.width,
          height: layout.back.height,
          textScale: scale,
        },
        onAction ? () => onAction(back.id) : undefined,
      );
    }
  }

  unmount(): void {
    for (const state of this.ratioStates) {
      Tween.stopAllByTarget(state);
    }
    this.ratioStates.length = 0;
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

  private placeFighter(
    root: Node,
    side: "ally" | "foe",
    plate: Plate,
    art: { x: number; y: number; width: number; height: number },
    nameplate: { x: number; y: number; width: number; height: number },
    flip: boolean,
    scale: number,
    reduceMotion: boolean,
  ): void {
    const holder = new Node(`${side}-art`);
    holder.layer = root.layer;
    root.addChild(holder);
    holder.addComponent(UITransform).setContentSize(art.width, art.height);
    holder.setPosition(art.x, art.y, 0);
    if (flip) {
      holder.setScale(-1, 1, 1);
    }
    attachPortraitSprite(holder, plate.spiritId, art.width, art.height);

    const panel = makePanel(root, {
      name: `${side}-plate`,
      skin: "nameplate",
      x: nameplate.x,
      y: nameplate.y,
      width: nameplate.width,
      height: nameplate.height,
    });
    const title = plate.status === "常态" ? `${plate.name}  Lv ${plate.level}` : `${plate.name}  Lv ${plate.level}  ${plate.status}`;
    addLabel(panel, {
      text: title,
      x: 0,
      y: nameplate.height / 2 - SPACE.lg,
      width: nameplate.width - SPACE.md,
      fontSize: TYPE.body * scale,
      tone: "ink",
    });

    const numberWidth = SPACE.xl * 2;
    const barWidth = nameplate.width - SPACE.lg * 2 - numberWidth;
    const ratio = hpRatio(plate.hp, plate.maxHp);
    const bar = makeHpBar(panel, {
      x: -numberWidth / 2,
      y: -SPACE.sm,
      width: barWidth,
      height: SPACE.lg,
      ratio,
      tone: hpTone(side, ratio),
    });
    addLabel(panel, {
      text: `${plate.hp}/${plate.maxHp}`,
      x: nameplate.width / 2 - SPACE.md - numberWidth / 2,
      y: -SPACE.sm,
      width: numberWidth,
      fontSize: TYPE.caption * scale,
      tone: "muted",
    });
    this.animateRatio(`${side}:${plate.spiritId}`, bar, ratio, side, reduceMotion, holder);
  }

  private animateRatio(
    key: string,
    bar: HpBarHandle,
    ratio: number,
    side: "ally" | "foe",
    reduceMotion: boolean,
    art: Node,
  ): void {
    const from = this.lastRatio.get(key) ?? ratio;
    this.lastRatio.set(key, ratio);
    if (ratio === from) {
      // 血量没变：血条构造时已是目标值，不需要缓降，也不用白跑一段逐帧重绘。
      return;
    }
    const state: RatioState = { ratio: from };
    this.ratioStates.push(state);
    const seconds = motionDurationMs(MOTION.normal, reduceMotion) / 1000;
    tween(state)
      .to(seconds, { ratio }, {
        onUpdate: () => bar.setRatio(state.ratio, hpTone(side, state.ratio)),
      })
      .start();

    if (ratio < from) {
      // 掉血时在立绘上溅一团墨（我方受伤用朱砂，敌方用浓墨）；「减少动效」下不播，没有 shader 素材时只剩闪白。
      const holderSize = art.getComponent(UITransform)?.contentSize;
      if (!reduceMotion && art.parent && holderSize) {
        playInkSplash(art.parent, {
          x: art.position.x,
          y: art.position.y,
          size: Math.max(holderSize.width, holderSize.height) * 1.1,
          tone: side === "ally" ? COLOR.accent : COLOR.ink,
        });
      }
      const opacity = art.getComponent(UIOpacity) ?? art.addComponent(UIOpacity);
      Tween.stopAllByTarget(opacity);
      opacity.opacity = 255;
      const flash = motionDurationMs(MOTION.fast, reduceMotion) / 1000;
      tween(opacity).to(flash / 2, { opacity: 120 }).to(flash / 2, { opacity: 255 }).start();
    }
  }
}

function headerText(lines: readonly string[]): string {
  const wave = lines.find((line) => line.startsWith("第")) ?? "";
  const gold = lines.find((line) => line.startsWith("金")) ?? "";
  const party = lines.find((line) => line.startsWith("队伍")) ?? "";
  return [wave, gold, party].filter((line) => line.length > 0).join(" • ");
}

function logLine(lines: readonly string[]): string {
  const reserved = ["第", "金", "敌", "我", "队伍"];
  return lines
    .filter((line) => !reserved.some((prefix) => line.startsWith(prefix)))
    .join(" ");
}

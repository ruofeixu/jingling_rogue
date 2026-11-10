import { Node, Tween, UIOpacity, UITransform, tween } from "cc";
import {
  MOTION,
  SPACE,
  TYPE,
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
import { makePanel } from "../ui/Panel.ts";
import { addLabel } from "../ui/Text.ts";

export interface BattleRenderOptions {
  readonly viewport: Viewport;
  readonly textScale?: number;
  readonly reduceMotion?: boolean;
  readonly onAction?: (actionId: string) => void;
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

    const logText = model.reason ?? logLine(model.lines);
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

    const actions = model.primaryAction
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

    const opacity = root.addComponent(UIOpacity);
    opacity.opacity = 0;
    tween(opacity)
      .to(motionDurationMs(MOTION.fast, reduceMotion) / 1000, { opacity: 255 })
      .start();

    return root;
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

import { Node, Sprite, Tween, UITransform, Vec4, tween } from "cc";
import { COLOR, INK_FX, type Rgb } from "../../vendor/jinglingPresentation";
import { getWhiteFrame } from "./InkWash.ts";
import { UiSkin } from "./UiSkin.ts";

export interface InkSplashOptions {
  /** 溅墨中心（相对 parent）。 */
  readonly x: number;
  readonly y: number;
  /** 方形边长。溅开半径约占边长 27%，墨滴飞到 40% 左右。 */
  readonly size: number;
  /** 墨色令牌；缺省浓墨。 */
  readonly tone?: Rgb;
  readonly seed?: number;
}

function toVec(token: Rgb, alpha: number): Vec4 {
  return new Vec4(token[0] / 255, token[1] / 255, token[2] / 255, alpha);
}

/**
 * 在 parent 上溅一团墨。返回节点；没有 shader 素材时返回 null，掉血闪白照常播。
 * 节点没有输入监听，不挡点击；播完自己销毁。
 */
export function playInkSplash(parent: Node, opts: InkSplashOptions): Node | null {
  const material = UiSkin.shared().getInkSplashMaterial();
  if (!material) {
    return null;
  }

  const node = new Node("ink-splash");
  node.layer = parent.layer;
  parent.addChild(node);
  node.setPosition(opts.x, opts.y, 0);
  node.addComponent(UITransform).setContentSize(opts.size, opts.size);

  const sprite = node.addComponent(Sprite);
  sprite.spriteFrame = getWhiteFrame();
  sprite.sizeMode = Sprite.SizeMode.CUSTOM;
  sprite.customMaterial = material;
  node.getComponent(UITransform)?.setContentSize(opts.size, opts.size);

  const instance = sprite.getMaterialInstance(0);
  const seed = opts.seed ?? Math.floor(Math.random() * 1000);
  const apply = (progress: number): void => {
    instance?.setProperty("inkParams", new Vec4(progress, seed, 0, 0));
  };
  instance?.setProperty("inkColor", toVec(opts.tone ?? COLOR.ink, INK_FX.splashAlpha));
  apply(0);

  const state = { progress: 0 };
  tween(state)
    .to(INK_FX.splashSeconds, { progress: 1 }, { onUpdate: () => apply(state.progress) })
    .call(() => {
      Tween.stopAllByTarget(state);
      if (node.isValid) {
        node.removeFromParent();
        node.destroy();
      }
    })
    .start();
  return node;
}

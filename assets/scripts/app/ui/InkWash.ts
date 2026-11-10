import { Node, Sprite, SpriteFrame, Texture2D, Tween, UITransform, Vec4, tween } from "cc";
import { COLOR, INK_FX, type Rgb } from "../../vendor/jinglingPresentation";
import { UiSkin } from "./UiSkin.ts";

export interface InkWashOptions {
  readonly width: number;
  readonly height: number;
  /** 不同种子洗出不同的边界形状；缺省每次随机。 */
  readonly seed?: number;
}

let whiteFrame: SpriteFrame | null = null;

/**
 * 1×1 白贴图。Sprite 没有 spriteFrame 不会渲染，而洗墨全靠 shader 算，所以给它一张白图。
 * 用 Texture2D.uploadData 直接传像素（裸 Uint8Array 包成 ImageAsset 会在动态图集打包时 texSubImage2D 报错），
 * 并关掉 packable，不进动态图集。
 */
export function getWhiteFrame(): SpriteFrame {
  if (!whiteFrame) {
    const texture = new Texture2D();
    texture.reset({ width: 1, height: 1, format: Texture2D.PixelFormat.RGBA8888 });
    texture.uploadData(new Uint8Array([255, 255, 255, 255]));
    const frame = new SpriteFrame();
    frame.packable = false;
    frame.texture = texture;
    whiteFrame = frame;
  }
  return whiteFrame;
}

function toColor(token: Rgb, alpha: number): Vec4 {
  return new Vec4(token[0] / 255, token[1] / 255, token[2] / 255, alpha);
}

/**
 * 在 parent 上盖一层水墨洗散转场。返回节点（调用方可以提前销毁）；没有 shader 素材时返回 null，页面照常切换。
 * 节点没有任何输入监听，不挡点击。
 */
export function playInkWash(parent: Node, opts: InkWashOptions): Node | null {
  const material = UiSkin.shared().getInkMaterial();
  if (!material) {
    return null;
  }

  const node = new Node("ink-wash");
  node.layer = parent.layer;
  parent.addChild(node);
  node.setPosition(0, 0, 0);
  // 稍微放大一点，避免横竖切换、缩放舒张时边上露缝。
  node.addComponent(UITransform).setContentSize(opts.width * 1.04, opts.height * 1.04);

  const sprite = node.addComponent(Sprite);
  sprite.spriteFrame = getWhiteFrame();
  sprite.sizeMode = Sprite.SizeMode.CUSTOM;
  sprite.customMaterial = material;
  node.getComponent(UITransform)?.setContentSize(opts.width * 1.04, opts.height * 1.04);

  const instance = sprite.getMaterialInstance(0);
  const seed = opts.seed ?? Math.floor(Math.random() * 1000);
  const aspect = opts.width / Math.max(1, opts.height);
  const apply = (progress: number): void => {
    instance?.setProperty("inkParams", new Vec4(progress, seed, aspect, 0));
  };
  instance?.setProperty("inkColor", toColor(COLOR.ink, INK_FX.washAlpha));
  apply(0);

  const state = { progress: 0 };
  tween(state)
    .to(INK_FX.washSeconds, { progress: 1 }, { onUpdate: () => apply(state.progress) })
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

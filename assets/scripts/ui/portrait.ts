import { AssetManager, Node, Rect, Sprite, SpriteFrame, Texture2D, UITransform, assetManager } from "cc";
import { PORTRAIT_BUNDLE, PORTRAIT_IDS, portraitFit, portraitTexturePath, type PortraitStyle } from "../vendor/jinglingCore";

const frames = new Map<string, SpriteFrame>();
let bundlePromise: Promise<AssetManager.Bundle | null> | undefined;

/** 立绘是小游戏分包，首屏不下载；这里按需加载一次并复用。 */
function portraitBundle(): Promise<AssetManager.Bundle | null> {
  if (!bundlePromise) {
    bundlePromise = new Promise((resolve) => {
      const cached = assetManager.getBundle(PORTRAIT_BUNDLE);
      if (cached) {
        resolve(cached);
        return;
      }
      assetManager.loadBundle(PORTRAIT_BUNDLE, (err, bundle) => {
        if (err || !bundle) {
          console.warn("[portrait] bundle load failed", PORTRAIT_BUNDLE, err);
          resolve(null);
          return;
        }
        resolve(bundle);
      });
    });
  }
  return bundlePromise;
}

export function hasPortrait(spiritId: string | undefined): boolean {
  return !!spiritId && PORTRAIT_IDS.has(spiritId);
}

export function attachPortraitSprite(
  root: Node,
  spiritId: string | undefined,
  width: number,
  height: number,
  onFail?: () => void,
  style: PortraitStyle = "play",
): void {
  if (!hasPortrait(spiritId) || !spiritId) {
    onFail?.();
    return;
  }
  const apply = (frame: SpriteFrame) => {
    if (!root.isValid) {
      return;
    }
    let art = root.getChildByName("art");
    if (!art) {
      art = new Node("art");
      art.layer = root.layer;
      root.addChild(art);
      art.addComponent(UITransform);
      art.addComponent(Sprite);
    }
    const sprite = art.getComponent(Sprite);
    if (!sprite) {
      onFail?.();
      return;
    }
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.type = Sprite.Type.SIMPLE;
    sprite.spriteFrame = frame;
    const imgW = frame.rect.width || frame.originalSize.width || width;
    const imgH = frame.rect.height || frame.originalSize.height || height;
    const fitted = portraitFit(width, height, imgW, imgH);
    art.getComponent(UITransform)?.setContentSize(fitted.width, fitted.height);
  };
  const key = `${style}:${spiritId}`;
  const cached = frames.get(key);
  if (cached) {
    apply(cached);
    return;
  }
  void portraitBundle().then((bundle) => {
    if (!bundle) {
      onFail?.();
      return;
    }
    bundle.load(portraitTexturePath(spiritId, style), Texture2D, (err, texture) => {
      if (err || !texture) {
        console.warn("[portrait] load failed", spiritId, style, err);
        onFail?.();
        return;
      }
      texture.setWrapMode(Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE);
      const spriteFrame = new SpriteFrame();
      spriteFrame.texture = texture;
      spriteFrame.rect = new Rect(0, 0, texture.width, texture.height);
      spriteFrame.packable = false;
      frames.set(key, spriteFrame);
      apply(spriteFrame);
    });
  });}


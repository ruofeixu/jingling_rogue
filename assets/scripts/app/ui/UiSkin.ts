import { Sprite, SpriteFrame, Texture2D, assetManager, director, type AssetManager } from "cc";
import { UI_SKIN_READY_EVENT } from "./skin-event.ts";

/**
 * UI 贴图皮肤层。把"按名取 SpriteFrame + 9-slice 边距"集中在这里。
 *
 * 设计原则：**素材可选**。贴图 bundle 未提供 / 某张缺失时，getFrame 返回 null，
 * 调用方（Panel/Button）据此回退到现有 Graphics 画法，绝不因缺素材而崩或空白。
 * 素材一到（放进 ui-art bundle 并登记 9-slice 边距），无需改调用方即可生效。
 *
 * 约定见 docs/ui/design-mockups/asset-manifest.md 与 assets/ui-art/README。
 */

export interface SliceInsets {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/** 9-slice 边距登记表（@2x 像素）。名称与 asset-manifest.md 对齐。 */
const SLICE_TABLE: Readonly<Record<string, SliceInsets>> = Object.freeze({
  panel_cream: { left: 40, right: 40, top: 40, bottom: 40 },
  panel_board: { left: 48, right: 48, top: 48, bottom: 48 },
  btn_primary: { left: 60, right: 60, top: 40, bottom: 40 },
  btn_normal: { left: 60, right: 60, top: 40, bottom: 40 },
  btn_disabled: { left: 60, right: 60, top: 40, bottom: 40 },
  chip: { left: 36, right: 36, top: 36, bottom: 36 },
  nameplate: { left: 36, right: 36, top: 36, bottom: 36 },
  topbar: { left: 60, right: 60, top: 45, bottom: 45 },
  log_bubble: { left: 48, right: 48, top: 48, bottom: 48 },
  ribbon_win: { left: 80, right: 80, top: 55, bottom: 55 },
  ribbon_lose: { left: 80, right: 80, top: 55, bottom: 55 },
  hpbar_track: { left: 20, right: 20, top: 20, bottom: 20 },
  hpbar_fill_green: { left: 16, right: 16, top: 16, bottom: 16 },
  hpbar_fill_red: { left: 16, right: 16, top: 16, bottom: 16 },
});

/** 贴图 bundle 名，与目录约定一致；不存在时整个皮肤层安静降级。 */
export const UI_ART_BUNDLE = "ui-art";

export class UiSkin {
  private static instance: UiSkin | null = null;
  private bundle: AssetManager.Bundle | null = null;
  private ready = false;
  private readonly frames = new Map<string, SpriteFrame | null>();

  static shared(): UiSkin {
    if (!UiSkin.instance) {
      UiSkin.instance = new UiSkin();
      // 首次访问即异步尝试加载贴图 bundle；不存在则安静回退。
      void UiSkin.instance.load();
    }
    return UiSkin.instance;
  }

  /** 预加载贴图 bundle。bundle 不存在则标记为"无皮肤"，全部走回退，不报错。 */
  load(): Promise<void> {
    if (this.ready) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      assetManager.loadBundle(UI_ART_BUNDLE, (err, bundle) => {
        if (err || !bundle) {
          this.bundle = null; // 无皮肤，全回退
        } else {
          this.bundle = bundle;
          director.emit(UI_SKIN_READY_EVENT);
        }
        this.ready = true;
        resolve();
      });
    });
  }

  hasSkin(): boolean {
    return this.bundle !== null;
  }

  /**
   * 按名取 SpriteFrame。已缓存直接返回；bundle 里没有该图返回 null（回退）。
   * 同步接口：只返回已加载缓存的帧，未命中触发一次异步预取但当次返回 null，
   * 保证调用方始终能同步决定"用贴图还是回退"。
   */
  getFrame(name: string): SpriteFrame | null {
    if (this.frames.has(name)) {
      return this.frames.get(name) ?? null;
    }
    if (!this.bundle) {
      // bundle 还在异步加载：本次回退即可，不能写 null 缓存；
      // 否则 bundle 就绪后的重刷仍会命中永久 null，标题首帧永远没有背景。
      return null;
    }
    // 异步预取：按 Texture2D 加载再包装成 SpriteFrame（与 portrait.ts 一致，
    // 因为 UI 图是 texture-type 导入，没有独立 spriteFrame 子资源）。
    // 加载完成后派发 ready 事件，让 AppShell 重刷并用上刚就绪的贴图。
    this.frames.set(name, null);
    this.bundle.load(`${name}/texture`, Texture2D, (err, texture) => {
      if (err || !texture) {
        this.frames.set(name, null);
        return;
      }
      const sf = new SpriteFrame();
      sf.texture = texture;
      this.frames.set(name, sf);
      director.emit(UI_SKIN_READY_EVENT);
    });
    return null;
  }

  sliceOf(name: string): SliceInsets | null {
    return SLICE_TABLE[name] ?? null;
  }

  /** 把一个 Sprite 配成 9-slice（若该名有登记的边距）。 */
  applySlice(sprite: Sprite, name: string): void {
    const inset = this.sliceOf(name);
    if (!inset) {
      return;
    }
    sprite.type = Sprite.Type.SLICED;
    const sf = sprite.spriteFrame;
    if (sf) {
      sf.insetLeft = inset.left;
      sf.insetRight = inset.right;
      sf.insetTop = inset.top;
      sf.insetBottom = inset.bottom;
    }
  }
}

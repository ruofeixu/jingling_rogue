/**
 * viewport 模型：只描述方向、设计分辨率与安全区，不含任何页面状态。
 * AppShell 在方向变化时只替换这个模型，页面 state 与未提交选择保持不变。
 */

export const DESIGN_WIDTH = 750;
export const DESIGN_HEIGHT = 1334;

export type Orientation = "portrait" | "landscape";

export interface Insets {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Viewport {
  readonly orientation: Orientation;
  /** 逻辑设计分辨率；横屏时长短边互换，数值本身不因安全区变化。 */
  readonly design: Size;
  readonly device: Size;
  readonly safe: Insets;
  /** 设计分辨率减去安全区后的可用内容区。 */
  readonly content: Size;
}

export interface ViewportInput {
  readonly width: number;
  readonly height: number;
  readonly safeArea?: Partial<Insets>;
}

function clampInset(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return value;
}

export function buildViewport(input: ViewportInput): Viewport {
  if (!(input.width > 0) || !(input.height > 0)) {
    throw new Error(`viewport must be positive, got ${input.width}x${input.height}`);
  }

  const orientation: Orientation = input.width > input.height ? "landscape" : "portrait";
  const design: Size =
    orientation === "landscape"
      ? { width: DESIGN_HEIGHT, height: DESIGN_WIDTH }
      : { width: DESIGN_WIDTH, height: DESIGN_HEIGHT };

  const safe: Insets = Object.freeze({
    top: clampInset(input.safeArea?.top),
    bottom: clampInset(input.safeArea?.bottom),
    left: clampInset(input.safeArea?.left),
    right: clampInset(input.safeArea?.right),
  });

  const content: Size = Object.freeze({
    width: Math.max(0, design.width - safe.left - safe.right),
    height: Math.max(0, design.height - safe.top - safe.bottom),
  });

  return Object.freeze({
    orientation,
    design: Object.freeze(design),
    device: Object.freeze({ width: input.width, height: input.height }),
    safe,
    content,
  });
}

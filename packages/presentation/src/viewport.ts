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

/**
 * 设计分辨率跟窗口同比例，配合 EXACT_FIT 铺满窗口且不拉伸。
 * 短边固定为 750；长边按比例放大，最少 1334，保证布局不会被压扁。
 * 比 750:1334 还"方"的窗口（如平板竖屏）改为固定长边 1334、放大短边。
 */
function designFor(orientation: Orientation, aspect: number): Size {
  const short = DESIGN_WIDTH;
  const long = DESIGN_HEIGHT;
  if (orientation === "portrait") {
    const height = Math.round(short / aspect);
    return height >= long ? { width: short, height } : { width: Math.round(long * aspect), height: long };
  }
  const width = Math.round(short * aspect);
  return width >= long ? { width, height: short } : { width: long, height: Math.round(long / aspect) };
}

export function buildViewport(input: ViewportInput): Viewport {
  if (!(input.width > 0) || !(input.height > 0)) {
    throw new Error(`viewport must be positive, got ${input.width}x${input.height}`);
  }

  const orientation: Orientation = input.width > input.height ? "landscape" : "portrait";
  const design = designFor(orientation, input.width / input.height);

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

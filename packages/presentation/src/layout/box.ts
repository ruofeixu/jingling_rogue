/**
 * 布局盒子。中心点坐标，原点在内容框中心，y 向上。
 * 与 a11y.Box（只有宽高，用来卡热区）不是同一个类型。
 */
export interface LayoutBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const EPS = 1e-6;

/** 边相接不算重叠。 */
export function overlaps(a: LayoutBox, b: LayoutBox): boolean {
  return (
    Math.abs(a.x - b.x) * 2 < a.width + b.width - EPS &&
    Math.abs(a.y - b.y) * 2 < a.height + b.height - EPS
  );
}

/** inner 是否完全落在以原点为中心的 width×height 内容框里。 */
export function inside(inner: LayoutBox, width: number, height: number): boolean {
  return (
    inner.x - inner.width / 2 >= -width / 2 - EPS &&
    inner.x + inner.width / 2 <= width / 2 + EPS &&
    inner.y - inner.height / 2 >= -height / 2 - EPS &&
    inner.y + inner.height / 2 <= height / 2 + EPS
  );
}

export type HpTone = "ally" | "foe" | "low";

const LOW = 0.25;

/** 血量比例，夹到 0..1。maxHp 非正时返回 0，避免除零画出反向血条。 */
export function hpRatio(hp: number, maxHp: number): number {
  if (!(maxHp > 0)) {
    return 0;
  }
  return Math.max(0, Math.min(1, hp / maxHp));
}

/** 高于四分之一用阵营色，否则用残血色。 */
export function hpTone(side: "ally" | "foe", ratio: number): HpTone {
  return ratio <= LOW ? "low" : side;
}

export const CATCH_FX = {
  throwEnd: 0.32,
  wobbleEnd: 0.96,
  settleEnd: 1.28,
} as const;

export type CatchFxPhase = "throw" | "wobble" | "caught" | "broke";

export function catchFxPhase(t: number, caught: boolean): CatchFxPhase {
  if (t < CATCH_FX.throwEnd) {
    return "throw";
  }
  if (t < CATCH_FX.wobbleEnd) {
    return "wobble";
  }
  return caught ? "caught" : "broke";
}

export function catchFxDuration(): number {
  return CATCH_FX.settleEnd;
}

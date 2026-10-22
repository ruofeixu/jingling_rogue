export const HIT_FX = {
  flashDim: 0.08,
  flashEnd: 0.26,
  lungeOut: 0.12,
  lungeBack: 0.16,
} as const;

export function hitFxDuration(): number {
  return HIT_FX.flashEnd;
}

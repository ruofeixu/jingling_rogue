export function portraitFit(
  boxW: number,
  boxH: number,
  imgW: number,
  imgH: number,
): { width: number; height: number } {
  if (boxW <= 0 || boxH <= 0 || imgW <= 0 || imgH <= 0) {
    return { width: Math.max(0, boxW), height: Math.max(0, boxH) };
  }
  const scale = Math.min(boxW / imgW, boxH / imgH);
  return { width: imgW * scale, height: imgH * scale };
}

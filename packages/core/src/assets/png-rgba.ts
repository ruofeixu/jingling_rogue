import { inflateSync, deflateSync } from "node:zlib";

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) {
    return a;
  }
  if (pb <= pc) {
    return b;
  }
  return c;
}

export function decodeRgbaPng(buf: Buffer): { width: number; height: number; data: Buffer } {
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25] ?? 0;
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (bpp === 0) {
    throw new Error(`unsupported png color type ${colorType}`);
  }
  const parts: Buffer[] = [];
  let offset = 8;
  while (offset + 12 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === "IDAT") {
      parts.push(data);
    }
    if (type === "IEND") {
      break;
    }
    offset += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(parts));
  const stride = width * bpp;
  const reconAll = Buffer.alloc(height * stride);
  let src = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[src] ?? 0;
    src += 1;
    const recon = Buffer.alloc(stride);
    for (let i = 0; i < stride; i += 1) {
      const x = raw[src + i] ?? 0;
      const left = i >= bpp ? recon[i - bpp] : 0;
      const up = prev[i] ?? 0;
      const upLeft = i >= bpp ? prev[i - bpp] : 0;
      let value = x;
      if (filter === 1) {
        value = (x + left) & 255;
      } else if (filter === 2) {
        value = (x + up) & 255;
      } else if (filter === 3) {
        value = (x + ((left + up) >> 1)) & 255;
      } else if (filter === 4) {
        value = (x + paeth(left, up, upLeft)) & 255;
      }
      recon[i] = value;
    }
    src += stride;
    recon.copy(reconAll, y * stride);
    prev = recon;
  }
  if (bpp === 4) {
    return { width, height, data: reconAll };
  }
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = reconAll[i * 3] ?? 0;
    data[i * 4 + 1] = reconAll[i * 3 + 1] ?? 0;
    data[i * 4 + 2] = reconAll[i * 3 + 2] ?? 0;
    data[i * 4 + 3] = 255;
  }
  return { width, height, data };
}

export function encodeRgbaPng(width: number, height: number, data: Buffer): Buffer {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    data.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const chunk = (type: string, body: Buffer) => {
    const payload = Buffer.concat([Buffer.from(type), body]);
    const crc = crc32(payload);
    const head = Buffer.alloc(4);
    head.writeUInt32BE(body.length);
    const tail = Buffer.alloc(4);
    tail.writeUInt32BE(crc);
    return Buffer.concat([head, payload, tail]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i] ?? 0;
    for (let b = 0; b < 8; b += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

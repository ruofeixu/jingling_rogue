function hashSeed(text: string): number {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

export class RngStream {
  private state: number;

  constructor(
    readonly seed: string,
    readonly offset: number = 0,
  ) {
    this.state = hashSeed(`${seed}:${offset}`);
  }

  child(offset: number): RngStream {
    return new RngStream(this.seed, this.offset + offset);
  }

  float(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  int(max: number): number {
    if (max <= 0) {
      throw new Error("max must be positive");
    }
    return Math.floor(this.float() * max);
  }
}

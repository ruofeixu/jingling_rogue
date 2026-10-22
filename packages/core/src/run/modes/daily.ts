import { RngStream } from "../../rng/rng-stream.ts";

export function utcDateStamp(at: Date = new Date()): string {
  return at.toISOString().slice(0, 10);
}

export function dailySeed(utcDate: string, salt = "ley-salt"): string {
  const rng = new RngStream(`${utcDate}|${salt}|daily`);
  return `daily-${rng.int(1e9)}-${rng.int(1e9)}`;
}

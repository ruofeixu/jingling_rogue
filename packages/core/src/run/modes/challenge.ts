import type { ChallengeId } from "./types.ts";
import { BLANK_PARTY } from "./types.ts";

export function invertMul(mod: number): number {
  if (mod === 0 || mod === 0.5) {
    return 2;
  }
  if (mod === 2) {
    return 0.5;
  }
  return mod;
}

export function blankParty(): string[] {
  return [...BLANK_PARTY];
}

export function hasChallenge(challenges: ChallengeId[], id: ChallengeId): boolean {
  return challenges.includes(id);
}

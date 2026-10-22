export type BattleEvent =
  | { type: "encounterStart"; playerId: string; foeId: string }
  | { type: "awaitCommand"; actorId: string }
  | {
      type: "artPlayed";
      userId: string;
      artId: string;
      targetId: string;
    }
  | { type: "hpChange"; targetId: string; hp: number; maxHp: number }
  | { type: "faint"; targetId: string }
  | { type: "switchIn"; actorId: string }
  | { type: "awaitSwitch" }
  | { type: "awaitTarget" }
  | { type: "fled" }
  | { type: "sealTried"; name: string; caught: boolean; chance: number }
  | { type: "runOver"; result: "win" | "lose" | "fled" };

export type BattleView = {
  emit(event: BattleEvent): void;
};

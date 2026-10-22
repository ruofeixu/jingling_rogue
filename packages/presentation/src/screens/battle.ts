/**
 * battle 页模型。命令顺序固定为 术 / 队伍 / 囊 / 走；
 * 名牌与战况来自 selector 投影。presentation 不算伤害、不改状态。
 */
import type { BattleView, NameplateView } from "@jingling/core";
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

export const BATTLE_ACTIONS = Object.freeze({
  art: "battle.art",
  party: "battle.party",
  bag: "battle.bag",
  flee: "battle.flee",
});

const COMMAND_ORDER = ["art", "party", "bag", "flee"] as const;

export interface BattleModelInput {
  readonly state: StateId;
  readonly view: BattleView;
  readonly reason?: string;
}

function plateLine(prefix: string, plate: NameplateView): string {
  const status = plate.down ? "倒下" : (plate.ailment ?? "常态");
  return `${prefix} ${plate.name} Lv ${plate.level} ${plate.hp}/${plate.maxHp} ${status}`;
}

export function buildBattleModel(input: BattleModelInput): ScreenModel {
  const byId = new Map(input.view.commands.map((command) => [command.id, command]));
  const actions: ScreenActionInput[] = COMMAND_ORDER.map((id) => {
    const command = byId.get(id);
    const label = command?.label ?? id;
    const locked = command?.lockedReason ?? null;
    return {
      id: BATTLE_ACTIONS[id],
      label,
      ...(locked ? { enabled: false, disabledReason: locked } : {}),
    };
  });
  const [primary, ...rest] = actions;

  return buildStateModel({
    screenId: "battle",
    state: input.state,
    accessibleName: "战斗",
    reason: input.reason,
    emptyHint: input.state === "empty" ? "现在没有战斗，回大厅开一局" : undefined,
    primaryAction: primary,
    secondaryActions: rest,
    lines: [
      `第 波 ${input.view.wave}`.replace("波 ", "波").replace("第 ", "第"),
      `金 ${input.view.gold}`,
      plateLine("敌", input.view.foe),
      plateLine("我", input.view.ally),
      `队伍 ${input.view.partySize}`,
      input.view.log,
    ].filter((line) => line.length > 0),
  });
}

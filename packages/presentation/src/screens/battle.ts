/**
 * battle 页模型。命令顺序固定为 术 / 队伍 / 囊 / 走；
 * 名牌与战况来自 selector 投影。presentation 不算伤害、不改状态。
 */
import type { BattleView, NameplateView } from "@jingling/core";
import { buildStateModel, type StateId } from "../states.ts";
import type { ScreenActionInput, ScreenModel } from "../screen-model.ts";

export interface PlateModel {
  readonly spiritId: string;
  readonly name: string;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly status: string;
}

export interface BattleScreenModel extends ScreenModel {
  readonly plates: {
    readonly foe: PlateModel;
    readonly ally: PlateModel;
  };
}

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

function plateStatus(plate: NameplateView): string {
  return plate.down ? "倒下" : (plate.ailment ?? "常态");
}

function plateModel(plate: NameplateView): PlateModel {
  return Object.freeze({
    spiritId: plate.id,
    name: plate.name,
    level: plate.level,
    hp: plate.hp,
    maxHp: plate.maxHp,
    status: plateStatus(plate),
  });
}

function plateLine(prefix: string, plate: NameplateView): string {
  return `${prefix} ${plate.name} Lv ${plate.level} ${plate.hp}/${plate.maxHp} ${plateStatus(plate)}`;
}

export function buildBattleModel(input: BattleModelInput): BattleScreenModel {
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

  return Object.freeze({
    ...buildStateModel({
      screenId: "battle",
      state: input.state,
      accessibleName: "战斗",
      reason: input.reason,
      emptyHint: input.state === "empty" ? "现在没有战斗，回大厅开一局" : undefined,
      primaryAction: primary,
      secondaryActions: rest,
      lines: [
        `第 ${input.view.wave} 波`,
        `金 ${input.view.gold}`,
        plateLine("敌", input.view.foe),
        plateLine("我", input.view.ally),
        `队伍 ${input.view.partySize}`,
        input.view.log,
      ].filter((line) => line.length > 0),
    }),
    plates: Object.freeze({
      foe: plateModel(input.view.foe),
      ally: plateModel(input.view.ally),
    }),
  });
}

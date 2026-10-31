/**
 * 命令执行后的下一页。只看命令名和 core 给出的相位，不改玩法。
 */
const OVERLAY_PREFIXES = ["arts.", "switch.", "party.", "bag.", "target.", "catch."];

function staysOnOverlay(command: string): boolean {
  return OVERLAY_PREFIXES.some((prefix) => command.startsWith(prefix));
}

const nextScreen: { [key: string]: string } = {
  battle: "battle",
  catch: "catch",
  map: "map",
  omen: "omen",
  victory: "victory",
  defeat: "defeat",
};

export function routeAfterCommand(input: {
  command: string;
  phase: string;
  current: string;
  /** 活动战斗在等什么（command / switch / target / over）；没有战斗时省略或为 null。 */
  waitingFor?: string | null;
}): string {
  switch (input.command) {
    case "select-mode":
    case "starter.pick":
      return "starter";
    case "starter.back":
      return "mode";
    case "outcome.lobby":
      return "title";
    case "battle.art":
      return input.phase === "battle" ? "arts" : (nextScreen[input.phase] ?? input.current);
    case "battle.party":
      return "party";
    case "battle.bag":
      return "bag";
    case "overlay.cancel":
      return input.phase === "catch" ? "catch" : "battle";
    default:
      break;
  }
  // 战斗仍在进行：战斗在等目标或强制换人时进对应弹层；确认类命令结算完回战斗；选择类命令留在当前弹层。
  if (input.phase === "battle") {
    if (input.waitingFor === "target") {
      return "target";
    }
    if (input.waitingFor === "switch") {
      return "switch";
    }
    if (input.command.endsWith(".confirm")) {
      return "battle";
    }
  }
  if (staysOnOverlay(input.command) && (input.phase === "battle" || input.phase === "catch")) {
    return input.current;
  }
  if (input.phase === "boon") {
    return input.current === "shop" ? "shop" : "summary";
  }
  return nextScreen[input.phase] ?? input.current;
}

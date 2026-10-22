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
}): string {
  switch (input.command) {
    case "select-mode":
    case "starter.pick":
      return "starter";
    case "starter.back":
      return "mode";
    case "outcome.lobby":
      return "title";
    case "battle.party":
      return "party";
    case "battle.bag":
      return "bag";
    case "overlay.cancel":
      return input.phase === "catch" ? "catch" : "battle";
    default:
      break;
  }
  if (staysOnOverlay(input.command) && (input.phase === "battle" || input.phase === "catch")) {
    return input.current;
  }
  if (input.phase === "boon") {
    return input.current === "shop" ? "shop" : "summary";
  }
  return nextScreen[input.phase] ?? input.current;
}
